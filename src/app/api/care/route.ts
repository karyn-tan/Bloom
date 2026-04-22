import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUserId, createClient } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/ratelimit';
import { generateCareTip } from '@/lib/gemini';
import type { Database } from '@/types/supabase';

const careRequestSchema = z.object({
  scan_id: z.string().uuid(),
  scientific_name: z.string().min(1),
  common_name: z.string().min(1),
});

type FlowerEntry = {
  scientific_name: string;
  common_name: string;
  confidence: number;
  care: unknown;
};

type ScanRow = Database['public']['Tables']['scans']['Row'];

export async function POST(request: NextRequest) {
  // 1. Authenticate
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Rate limit
  const rateLimitResponse = await checkRateLimit(userId);
  if (rateLimitResponse) return rateLimitResponse;

  // 3. Validate request body
  let body: z.infer<typeof careRequestSchema>;
  try {
    const json: unknown = await request.json();
    body = careRequestSchema.parse(json);
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 },
    );
  }

  // 4. Fetch scan (scoped to user — IDOR protection)
  const supabase = createClient(request);
  const { data: rawScan, error: scanError } = await supabase
    .from('scans')
    .select('flowers')
    .eq('id', body.scan_id)
    .eq('user_id', userId)
    .single();

  if (scanError || !rawScan) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // 5. Check cache — return existing care if already generated
  const scan = rawScan as ScanRow;
  const flowers = scan.flowers as FlowerEntry[];
  const flowerIndex = flowers.findIndex(
    (f) => f.scientific_name === body.scientific_name,
  );

  if (flowerIndex === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (flowers[flowerIndex].care !== null) {
    return NextResponse.json({ care: flowers[flowerIndex].care });
  }

  // 6. Generate care tip via Gemini
  let careTip;
  try {
    careTip = await generateCareTip(body.scientific_name, body.common_name);
  } catch (err) {
    console.error('Gemini care tip generation failed:', err);
    return NextResponse.json(
      { error: 'Care tips unavailable for this flower' },
      { status: 502 },
    );
  }

  // 7. Update the flowers JSONB with the care tip
  flowers[flowerIndex].care = careTip;

  const { error: updateError } = await (supabase as any)
    .from('scans')
    .update({ flowers })
    .eq('id', body.scan_id)
    .eq('user_id', userId);

  if (updateError) {
    console.error('Failed to cache care tip:', updateError.message);
    // Still return the care tip even if caching fails
  }

  return NextResponse.json({ care: careTip });
}
