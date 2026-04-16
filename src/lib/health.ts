import type { HealthState } from '@/types/health';

const WATER_INTERVAL_DEFAULT = 2;

/**
 * Extracts the watering interval in days from a care text string.
 * Falls back to WATER_INTERVAL_DEFAULT (2) if no valid number is found.
 */
export function parseWateringInterval(waterText: string): number {
  const match = /\b(\d+)/.exec(waterText);
  if (!match) return WATER_INTERVAL_DEFAULT;
  const parsed = parseInt(match[1], 10);
  if (isNaN(parsed) || parsed <= 0) return WATER_INTERVAL_DEFAULT;
  return parsed;
}

const ONE_THIRD = 1 / 3;
const TWO_THIRDS = 2 / 3;

/**
 * Derives heart count (0–3) from age in days and minimum lifespan.
 * Returns 2 when lifespanMin is null or 0 (unknown lifespan).
 */
export function computeHearts(
  ageInDays: number,
  lifespanMin: number | null,
): 0 | 1 | 2 | 3 {
  if (!lifespanMin || lifespanMin <= 0) return 2;
  const pct = (lifespanMin - ageInDays) / lifespanMin;
  if (pct <= 0) return 0;
  if (pct <= ONE_THIRD) return 1;
  if (pct <= TWO_THIRDS) return 2;
  return 3;
}

/**
 * Computes droplet count (0–5) based on days since last watering.
 * Uses bouquetAddedAt as fallback when no watering has been logged.
 * When no watering is logged and bouquet was added today, returns initialDroplets (default 5).
 */
export function computeDroplets(
  lastWateredAt: string | null,
  bouquetAddedAt: string,
  wateringIntervalDays: number,
  now: Date = new Date(),
  initialDroplets: number = 5,
): 0 | 1 | 2 | 3 | 4 | 5 {
  const reference = lastWateredAt ?? bouquetAddedAt;
  const daysSince = Math.floor(
    (now.getTime() - new Date(reference).getTime()) / 86_400_000,
  );

  // No watering logged and bouquet added today → return initialDroplets
  if (daysSince === 0 && lastWateredAt === null) {
    return Math.min(5, Math.max(0, initialDroplets)) as 0 | 1 | 2 | 3 | 4 | 5;
  }

  const daysPast = Math.max(0, daysSince - wateringIntervalDays);
  const droplets = Math.max(0, 5 - daysPast);
  return Math.min(5, droplets) as 0 | 1 | 2 | 3 | 4 | 5;
}

function deriveStatus(
  hearts: 0 | 1 | 2 | 3,
  droplets: 0 | 1 | 2 | 3 | 4 | 5,
): HealthState['status'] {
  if (hearts === 0) return 'past_peak';
  if (droplets <= 2) return 'thirsty';
  if (hearts <= 1) return 'struggling';
  return 'healthy';
}

type ComputeHealthStateParams = {
  ageInDays: number;
  lifespanMin: number | null;
  lastWateredAt: string | null;
  bouquetAddedAt: string;
  waterText: string;
  initialDroplets?: number;
  now?: Date;
  /** Days since the last 'refresh' action. When >= 6 (4 days to 1 droplet + 2
   *  days stagnant), penalty days are added to the effective age so hearts
   *  drain faster — murky water shortens the bouquet's lifespan. */
  daysSinceRefresh?: number | null;
};

/**
 * Computes the full HealthState for a bouquet.
 * Status priority: past_peak > thirsty > struggling > healthy.
 */
export function computeHealthState(
  params: ComputeHealthStateParams,
): HealthState {
  const {
    ageInDays,
    lifespanMin,
    lastWateredAt,
    bouquetAddedAt,
    waterText,
    initialDroplets,
    now,
    daysSinceRefresh,
  } = params;

  // Stagnant water penalty: once water has been stale for 2+ days at 1 droplet
  // (i.e. 6+ days without a refresh), each additional day counts as an extra
  // day of ageing for the purpose of heart calculation.
  const STAGNANT_THRESHOLD = 6;
  const penaltyDays =
    daysSinceRefresh != null && daysSinceRefresh >= STAGNANT_THRESHOLD
      ? daysSinceRefresh - (STAGNANT_THRESHOLD - 1)
      : 0;

  const hearts = computeHearts(ageInDays + penaltyDays, lifespanMin);
  const wateringIntervalDays = parseWateringInterval(waterText);
  const droplets = computeDroplets(
    lastWateredAt,
    bouquetAddedAt,
    wateringIntervalDays,
    now,
    initialDroplets,
  );
  const status = deriveStatus(hearts, droplets);

  return { hearts, droplets, status };
}
