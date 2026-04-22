import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUserId, createClient } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/ratelimit';
import { generateAdaptiveTip } from '@/lib/gemini';
import type { CareTip } from '@/lib/gemini';
import { classifyCareLog, type CareLogEntry } from '@/lib/careLog';
import { parseWateringInterval } from '@/lib/health';
import type { Database } from '@/types/supabase';

const ONBOARDING_PROMPT =
  'Start logging your care actions so Bloom can give you personalised tips. Tap the water or trim button to record your first action.';

const requestSchema = z.object({
  bouquet_id: z.string().uuid(),
});

const careSchema = z.object({
  water: z.string(),
  light: z.string(),
  temperature: z.string(),
  trim: z.string(),
});

const flowerEntrySchema = z.object({
  common_name: z.string(),
  scientific_name: z.string(),
  confidence: z.number(),
  care: z
    .object({
      common_name: z.string(),
      lifespan_days: z.object({ min: z.number(), max: z.number() }),
      care: careSchema,
      fun_facts: z.array(z.string()),
    })
    .nullable(),
  initial_droplets: z.number().optional(),
});

type AdaptiveTipCacheRow =
  Database['public']['Tables']['adaptive_tip_cache']['Row'];
type AdaptiveTipCacheInsert =
  Database['public']['Tables']['adaptive_tip_cache']['Insert'];

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

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { bouquet_id } = parsed.data;
  const supabase = createClient(request);

  // Fetch bouquet with scan data (IDOR protection: always scope to user_id)
  const { data: bouquet, error: bouquetError } = await supabase
    .from('bouquets')
    .select('id, scan_id, added_at, scans(flowers)')
    .eq('id', bouquet_id)
    .eq('user_id', userId)
    .single();

  if (bouquetError || !bouquet) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Check adaptive_tip_cache for today
  const today = new Date().toISOString().split('T')[0];
  type CacheResult = {
    data: AdaptiveTipCacheRow | null;
    error: { message: string } | null;
  };
  const { data: cached } = (await supabase
    .from('adaptive_tip_cache')
    .select('tip, status')
    .eq('bouquet_id', bouquet_id)
    .eq('user_id', userId)
    .eq('generated_date', today)
    .maybeSingle()) as unknown as CacheResult;

  if (cached) {
    return NextResponse.json({ tip: cached.tip, status: cached.status });
  }

  // Fetch care log entries from last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  type CareLogResult = {
    data: CareLogEntry[] | null;
    error: { message: string } | null;
  };
  const { data: careLogData } = (await supabase
    .from('care_log')
    .select('action, logged_at')
    .eq('bouquet_id', bouquet_id)
    .eq('user_id', userId)
    .gte('logged_at', sevenDaysAgo)
    .order('logged_at', { ascending: false })) as unknown as CareLogResult;

  const careEntries: CareLogEntry[] = careLogData ?? [];

  // Parse flower data from the scan JSONB
  const rawFlowers = (bouquet as unknown as { scans?: { flowers: unknown } })
    ?.scans?.flowers;
  const flowersResult = z.array(flowerEntrySchema).safeParse(rawFlowers);
  const flowers = flowersResult.success ? flowersResult.data : [];

  const firstFlower = flowers[0];
  const waterText = firstFlower?.care?.care.water ?? '';
  const wateringIntervalDays = parseWateringInterval(waterText);

  const status = classifyCareLog(careEntries, wateringIntervalDays);

  // No data — return onboarding prompt without calling Gemini
  if (status === 'no_data') {
    return NextResponse.json({ tip: ONBOARDING_PROMPT, status });
  }

  // Generate tip via Gemini
  try {
    const speciesNames = flowers.map((f) => f.common_name);
    const careCards = flowers
      .filter((f) => f.care !== null)
      .map((f) => f.care!);
    const careLogSummary = buildCareLogSummary(status, careEntries);

    const tip = await generateAdaptiveTip({
      speciesNames,
      careCards,
      careLogSummary,
      status,
    });

    // Cache the result
    const insertPayload: AdaptiveTipCacheInsert = {
      bouquet_id,
      user_id: userId,
      generated_date: today,
      tip,
      status,
    };
    await supabase
      .from('adaptive_tip_cache')
      .upsert(insertPayload as never)
      .select()
      .single();

    return NextResponse.json({ tip, status });
  } catch (err) {
    console.error('[adaptive-tip] Gemini error:', err);
    return NextResponse.json(
      { error: 'Failed to generate tip' },
      { status: 500 },
    );
  }
}

function buildCareLogSummary(status: string, entries: CareLogEntry[]): string {
  if (status === 'all_good') {
    return `User has completed all care actions consistently for the past 3+ days (${entries.length} total actions logged).`;
  }
  if (status === 'missed_watering') {
    const lastWater = entries.find(
      (e) => e.action === 'water' || e.action === 'refresh',
    );
    return lastWater
      ? `Last watering was on ${new Date(lastWater.logged_at).toDateString()}. Watering is overdue.`
      : 'No watering has been logged yet.';
  }
  if (status === 'missed_trim') {
    return 'Watering is on schedule but no stem trimming has been logged in the past 7 days.';
  }
  return 'No care actions have been logged.';
}
