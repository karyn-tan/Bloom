export type CareLogEntry = {
  action: 'water' | 'trim' | 'refresh';
  logged_at: string;
};

export type CareLogStatus = 'no_data' | 'missed_watering' | 'missed_trim' | 'all_good';

const WINDOW_DAYS = 7;
const ALL_GOOD_DAYS = 3;
const MS_PER_DAY = 86_400_000;

/**
 * Classifies the user's care behavior over the past 7 days into one of four statuses.
 *
 * Priority order (highest to lowest):
 *   no_data → missed_watering → missed_trim → all_good
 */
export function classifyCareLog(
  entries: CareLogEntry[],
  wateringIntervalDays: number,
  now: Date = new Date(),
): CareLogStatus {
  const windowStart = new Date(now.getTime() - WINDOW_DAYS * MS_PER_DAY);

  const recent = entries.filter(
    (e) => new Date(e.logged_at) >= windowStart,
  );

  if (recent.length === 0) return 'no_data';

  // Determine the last water/refresh action date
  const waterEntries = recent.filter(
    (e) => e.action === 'water' || e.action === 'refresh',
  );

  // Check for missed watering: no water/refresh or the last one is overdue
  if (waterEntries.length === 0) return 'missed_watering';

  const lastWater = waterEntries.reduce((latest, e) =>
    e.logged_at > latest.logged_at ? e : latest,
  );
  const daysSinceWater = Math.floor(
    (now.getTime() - new Date(lastWater.logged_at).getTime()) / MS_PER_DAY,
  );
  if (daysSinceWater > wateringIntervalDays) return 'missed_watering';

  // Check for missed trim: no trim in the last 7 days
  const trimEntries = recent.filter((e) => e.action === 'trim');
  if (trimEntries.length === 0) return 'missed_trim';

  const lastTrim = trimEntries.reduce((latest, e) =>
    e.logged_at > latest.logged_at ? e : latest,
  );
  const daysSinceTrim = Math.floor(
    (now.getTime() - new Date(lastTrim.logged_at).getTime()) / MS_PER_DAY,
  );
  if (daysSinceTrim > ALL_GOOD_DAYS) return 'missed_trim';

  return 'all_good';
}
