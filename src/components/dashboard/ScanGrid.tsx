import Link from 'next/link';
import type { ScanSummary } from '@/lib/dashboard';

type ScanGridProps = {
  scans: ScanSummary[];
};

const CameraIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const FlowerIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C12 2 13 5 13 7C13 9 11 10 11 10C11 10 9 9 9 7C9 5 12 2 12 2Z" />
    <path d="M12 10C12 10 15 9 17 10C19 11 20 14 20 14C20 14 17 15 15 14C13 13 12 10 12 10Z" />
    <path d="M12 10C12 10 9 11 7 10C5 9 4 6 4 6C4 6 7 5 9 6C11 7 12 10 12 10Z" />
    <path d="M12 10C12 10 13 13 12 15C11 17 8 18 8 18C8 18 7 15 8 13C9 11 12 10 12 10Z" />
    <path d="M12 10C12 10 11 7 12 5C13 3 16 2 16 2C16 2 17 5 16 7C15 9 12 10 12 10Z" />
    <path d="M12 14V22M9 17H15" stroke="currentColor" strokeWidth="2" />
  </svg>
);

/**
 * ScanGrid — responsive grid of scan tiles linking to detail pages with cheerful colors
 */
export function ScanGrid({ scans }: ScanGridProps) {
  const accentColors = [
    { shadow: '#FF6B6B', bg: 'bg-coral' },
    { shadow: '#FFD966', bg: 'bg-butter' },
    { shadow: '#74C0FC', bg: 'bg-sky' },
    { shadow: '#7CB97A', bg: 'bg-sage' },
  ];

  return (
    <section>
      <h2 className="text-xl font-black text-ink uppercase tracking-wider mb-6 flex items-center gap-3">
        <span className="w-8 h-8 bg-surface border-[3px] border-border flex items-center justify-center">
          <CameraIcon className="w-4 h-4 text-ink" />
        </span>
        Your Scans
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {scans.map((scan, i) => {
          const color = accentColors[i % accentColors.length];
          return (
            <Link
              key={scan.id}
              href={`/dashboard/scan/${scan.id}`}
              className="group bg-surface border-[3px] border-border overflow-hidden hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
              style={{ boxShadow: `4px 4px 0px 0px ${color.shadow}` }}
            >
              {scan.imageUrl ? (
                <div className="relative">
                  <img
                    src={scan.imageUrl}
                    alt={scan.flowerName}
                    className="w-full h-40 object-cover border-b-[3px] border-border"
                  />
                  <div
                    className={`absolute top-2 right-2 w-3 h-3 ${color.bg} border border-border`}
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-bg border-b-[3px] border-border flex items-center justify-center">
                  <span className="text-muted text-sm font-bold uppercase tracking-wider">
                    No image
                  </span>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-6 h-6 ${color.bg} border-[2px] border-border flex items-center justify-center`}
                  >
                    <FlowerIcon className="w-3 h-3 text-ink" />
                  </div>
                  <h3 className="text-sm font-black text-ink uppercase tracking-tight truncate flex-1">
                    {scan.flowerName}
                  </h3>
                </div>
                <p className="text-xs text-muted italic truncate font-medium">
                  {scan.scientificName}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted font-bold uppercase tracking-wider">
                    {new Date(scan.createdAt).toLocaleDateString()}
                  </span>
                  {scan.lifespanMin !== null && scan.lifespanMax !== null && (
                    <span className="text-xs font-black text-sky bg-sky/10 border border-sky px-2 py-1">
                      {scan.lifespanMin}–{scan.lifespanMax}d
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
