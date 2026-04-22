type ConfidenceBadgeProps = {
  confidence: number;
};

/**
 * ConfidenceBadge — colored badge showing PlantNet confidence level
 */
export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const percentage = Math.round(confidence * 100);
  const isLow = confidence < 0.5;

  const colorClass =
    confidence >= 0.8
      ? 'bg-accent-teal text-surface'
      : confidence >= 0.5
        ? 'bg-accent-gold text-ink'
        : 'bg-accent-red text-surface';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold border-2 border-border rounded-[4px] ${colorClass}`}
    >
      {percentage}%{isLow && ' — Not sure about this one'}
    </span>
  );
}
