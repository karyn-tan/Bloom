import type { CareLogStatus } from '@/lib/careLog';

type AdaptiveTipCardProps = {
  tip: string;
  status: CareLogStatus;
};

const STATUS_BG: Record<CareLogStatus, string> = {
  all_good: 'bg-accent-teal',
  missed_watering: 'bg-accent-gold',
  missed_trim: 'bg-accent-gold',
  no_data: 'bg-muted',
};

/**
 * AdaptiveTipCard — renders the "How's it going?" personalised care tip
 * inside a flower card, below the Trim row.
 * Background colour reflects care status: teal = all good, gold = action needed, muted = no data.
 */
export function AdaptiveTipCard({ tip, status }: AdaptiveTipCardProps) {
  return (
    <div className={`${STATUS_BG[status]} mt-3 p-3`}>
      <p className="text-xs font-extrabold text-muted uppercase tracking-wide mb-1">
        HOW&apos;S IT GOING?
      </p>
      <p className="text-sm text-ink">{tip}</p>
    </div>
  );
}
