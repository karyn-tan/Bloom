import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getAuthenticatedUserId, createClient } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/ratelimit';
import type { Database } from '@/types/supabase';

type CareLogInsert = Database['public']['Tables']['care_log']['Insert'];

const createCareLogSchema = z.object({
  bouquet_id: z.string().uuid(),
  action: z.enum(['water', 'trim', 'refresh']),
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

  // Verify bouquet ownership (IDOR protection) and get scan_id for revalidation
  const { data: bouquet, error: bouquetError } = await supabase
    .from('bouquets')
    .select('id, scan_id')
    .eq('id', bouquet_id)
    .eq('user_id', userId)
    .single();

  if (bouquetError || !bouquet) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const insertPayload: CareLogInsert = { bouquet_id, user_id: userId, action };
  type CareLogRow = Database['public']['Tables']['care_log']['Row'];
  type InsertResult = {
    data: CareLogRow | null;
    error: { message: string } | null;
  };
  const { data, error: insertError } = (await supabase
    .from('care_log')
    .insert(insertPayload as never)
    .select()
    .single()) as unknown as InsertResult;

  if (insertError || !data) {
    console.error('[care-log] insert error:', insertError?.message);
    return NextResponse.json(
      { error: 'Failed to log care action' },
      { status: 500 },
    );
  }

  const scanId = (bouquet as { scan_id: string }).scan_id;
  revalidatePath(`/dashboard/scan/${scanId}`);
  revalidatePath('/dashboard');
  return NextResponse.json({ log: data }, { status: 201 });
}
