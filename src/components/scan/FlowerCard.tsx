import { ConfidenceBadge } from './ConfidenceBadge';
import { CareTipSection } from './CareTipSection';
import type { CareTip } from '@/lib/gemini';

type FlowerCardProps = {
  commonName: string;
  scientificName: string;
  confidence: number;
  care: CareTip | null;
  careLoading: boolean;
  careError: string | null;
  onRetryCare: () => void;
};

/**
 * FlowerCard — displays a single identified flower with care tips
 */
export function FlowerCard({
  commonName,
  scientificName,
  confidence,
  care,
  careLoading,
  careError,
  onRetryCare,
}: FlowerCardProps) {
  return (
    <div className="bg-surface border-2 border-border shadow-[4px_4px_0px_var(--color-border)] rounded-[4px] p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="text-lg font-extrabold text-ink">{commonName}</h3>
          <p className="text-sm text-muted italic">{scientificName}</p>
        </div>
        <ConfidenceBadge confidence={confidence} />
      </div>

      {/* Care section */}
      {careLoading && (
        <div className="mt-4 space-y-2">
          <div className="h-4 bg-bg rounded-[4px] animate-pulse w-3/4" />
          <div className="h-4 bg-bg rounded-[4px] animate-pulse w-1/2" />
          <div className="h-4 bg-bg rounded-[4px] animate-pulse w-2/3" />
        </div>
      )}

      {careError && (
        <div className="mt-4 p-3 bg-bg border-2 border-border rounded-[4px]">
          <p className="text-sm text-accent-red font-bold">{careError}</p>
          <button
            type="button"
            onClick={onRetryCare}
            className="mt-2 text-sm font-bold text-ink underline"
          >
            Retry
          </button>
        </div>
      )}

      {care && <CareTipSection care={care} />}
    </div>
  );
}
