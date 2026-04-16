import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUserId, createClient } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/ratelimit';

const createCareLogSchema = z.object({
  bouquet_id: z.string().uuid(),
  action: z.enum(['water', 'trim']),
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

  const parsed = createCareLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { bouquet_id, action } = parsed.data;
  const supabase = createClient(request);

  // Verify bouquet ownership (IDOR protection)
  const { data: bouquet, error: bouquetError } = await supabase
    .from('bouquets')
    .select('id')
    .eq('id', bouquet_id)
    .eq('user_id', userId)
    .single();

  if (bouquetError || !bouquet) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error: insertError } = await (supabase as any)
    .from('care_log')
    .insert({
      bouquet_id,
      user_id: userId,
      action,
    })
    .select()
    .single();

  if (insertError || !data) {
    console.error('[care-log] insert error:', insertError?.message);
    return NextResponse.json(
      { error: 'Failed to log care action' },
      { status: 500 },
    );
  }

  return NextResponse.json({ log: data }, { status: 201 });
}
