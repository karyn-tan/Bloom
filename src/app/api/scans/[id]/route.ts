import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUserId, createClient } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/ratelimit';
import { generateCareTip } from '@/lib/gemini';

const patchSchema = z.object({
  common_name: z.string().min(1).max(200),
  scientific_name: z.string().max(200).optional().default(''),
});

type RouteParams = { params: { id: string } };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  // 1. Auth
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Rate limit
  const rateLimitResponse = await checkRateLimit(userId);
  if (rateLimitResponse) return rateLimitResponse;

  // 3. Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { common_name, scientific_name } = parsed.data;
  const scanId = params.id;
  const supabase = createClient(request);

  // 4. Fetch scan with ownership check
  const { data: scan, error: fetchError } = await supabase
    .from('scans')
    .select('id, flowers')
    .eq('id', scanId)
    .eq('user_id', userId)
    .returns<{ id: string; flowers: unknown }[]>()
    .single();

  if (fetchError || !scan) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // 5. Regenerate care tips with corrected species
  let care = null;
  try {
    care = await generateCareTip(scientific_name || common_name, common_name);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[scans PATCH] Gemini care tip failed:', msg);
  }

  // 6. Update flowers[0] in the JSONB array
  const flowers = Array.isArray(scan.flowers) ? [...(scan.flowers as unknown[])] : [];
  const existingFlower =
    flowers.length > 0 && typeof flowers[0] === 'object' && flowers[0] !== null
      ? (flowers[0] as Record<string, unknown>)
      : {};

  flowers[0] = {
    ...existingFlower,
    common_name,
    scientific_name,
    care,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from('scans')
    .update({ flowers })
    .eq('id', scanId)
    .eq('user_id', userId);

  if (updateError) {
    console.error('[scans PATCH] update error:', updateError.message);
    return NextResponse.json({ error: 'Failed to update scan' }, { status: 500 });
  }

  // 7. Also update the bouquet name to match corrected flower name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('bouquets')
    .update({ name: common_name })
    .eq('scan_id', scanId)
    .eq('user_id', userId);

  return NextResponse.json({ flowers });
}
