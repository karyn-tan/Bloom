import type { CareTip } from '@/lib/gemini';

type CareTipSectionProps = {
  care: CareTip;
};

const CARE_ROWS: { key: keyof CareTip['care']; label: string }[] = [
  { key: 'water', label: 'Water' },
  { key: 'light', label: 'Light' },
  { key: 'temperature', label: 'Temperature' },
  { key: 'trim', label: 'Trim' },
];

/**
 * CareTipSection — renders structured care data + lifespan + fun facts
 */
export function CareTipSection({ care }: CareTipSectionProps) {
  return (
    <div className="mt-4 space-y-3">
      {/* Lifespan */}
      <p className="text-sm font-bold text-accent-teal">
        Lasts {care.lifespan_days.min}&ndash;{care.lifespan_days.max} days in a
        vase
      </p>

      {/* Care rows */}
      <div className="space-y-2">
        {CARE_ROWS.map(({ key, label }) => (
          <div key={key} className="flex gap-2">
            <span className="text-xs font-extrabold text-muted uppercase tracking-wide min-w-[100px] shrink-0">
              {label}
            </span>
            <span className="text-sm text-ink">{care.care[key]}</span>
          </div>
        ))}
      </div>

      {/* Fun facts */}
      {care.fun_facts.length > 0 && (
        <div className="mt-3 bg-bg border-t-2 border-border pt-3">
          <p className="text-xs font-extrabold text-muted uppercase tracking-wide mb-1">
            Fun Facts
          </p>
          <ul className="space-y-1">
            {care.fun_facts.map((fact, i) => (
              <li key={i} className="text-sm text-ink">
                &bull; {fact}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
