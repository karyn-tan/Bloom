import { SPRING_FLOWERS } from '@/lib/seasonal-data';

/**
 * SeasonalTeaser — static "What's in Season" section for the empty dashboard
 */
export function SeasonalTeaser() {
  return (
    <section>
      <h2 className="text-xl font-extrabold text-ink uppercase tracking-wide mb-6">
        What&apos;s in Season
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SPRING_FLOWERS.map((flower) => (
          <div
            key={flower.name}
            className="bg-surface border-2 border-border shadow-[4px_4px_0px_var(--color-border)] rounded-[4px] p-4"
          >
            <div
              className={`bg-${flower.accent} w-3 h-3 border border-border rounded-full mb-3`}
            />
            <h3 className="text-sm font-extrabold text-ink mb-1">
              {flower.name}
            </h3>
            <p className="text-xs text-muted">{flower.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
