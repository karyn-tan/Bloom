import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUserId, createClient } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/ratelimit';

const createBouquetSchema = z.object({
  scan_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  reminder_opt_in: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimitResponse = await checkRateLimit(userId);
  if (rateLimitResponse) return rateLimitResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 },
    );
  }

  const parsed = createBouquetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { scan_id, name, reminder_opt_in } = parsed.data;
  const supabase = createClient(request);

  // Verify scan ownership (IDOR protection)
  const { data: scan, error: scanError } = await supabase
    .from('scans')
    .select('id')
    .eq('id', scan_id)
    .eq('user_id', userId)
    .single();

  if (scanError || !scan) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data, error: insertError } = await (supabase as any)
    .from('bouquets')
    .insert({
      scan_id,
      user_id: userId,
      name,
      reminder_opt_in: reminder_opt_in ?? false,
    })
    .select()
    .single();

  if (insertError || !data) {
    console.error('[bouquets] insert error:', insertError?.message);
    return NextResponse.json(
      { error: 'Failed to create bouquet' },
      { status: 500 },
    );
  }

  return NextResponse.json({ bouquet: data }, { status: 201 });
}
