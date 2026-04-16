import Link from 'next/link';
import { getUserDashboardState, getUserBouquets } from '@/lib/dashboard';
import { EmptyDashboard } from '@/components/dashboard/EmptyDashboard';
import { BouquetTile } from '@/components/dashboard/BouquetTile';

const CameraIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
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

export const metadata = {
  title: 'Dashboard - Bloom',
  description: 'Your active bouquets and care tips',
};

/**
 * DashboardPage — shows onboarding for new users, scan collection for returning users
 */
export default async function DashboardPage() {
  const [state, bouquets] = await Promise.all([
    getUserDashboardState(),
    getUserBouquets(),
  ]);

  if (state.isNewUser) {
    return <EmptyDashboard />;
  }

  return (
    <main className="min-h-screen bg-bg">
      {/* Top accent bar */}
      <div className="w-full h-3 bg-coral" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sage border-[3px] border-border flex items-center justify-center shadow-[3px_3px_0px_0px_var(--color-border)]">
              <FlowerIcon className="w-6 h-6 text-ink" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-ink uppercase tracking-tight">
                Your Collection
              </h1>
              <p className="text-muted mt-1 font-medium text-sm">
                {state.scans.length}{' '}
                {state.scans.length === 1 ? 'bouquet' : 'bouquets'} tracked
              </p>
            </div>
          </div>
          <Link
            href="/scan"
            className="group inline-flex items-center gap-2 bg-coral text-ink-light font-black px-6 py-3 border-[3px] border-border shadow-[4px_4px_0px_0px_var(--color-border)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all text-sm uppercase tracking-wider"
          >
            <CameraIcon className="w-5 h-5" />
            New Scan
          </Link>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="bg-surface border-[3px] border-border shadow-[4px_4px_0px_0px_#74C0FC] p-4">
            <p className="text-3xl font-black text-ink">{state.scanCount}</p>
            <p className="text-xs font-black uppercase tracking-wider text-muted">
              Total Scans
            </p>
          </div>
          <div className="bg-surface border-[3px] border-border shadow-[4px_4px_0px_0px_#7CB97A] p-4">
            <p className="text-3xl font-black text-ink">
              {
                state.scans.filter((s) => {
                  const days = Math.floor(
                    (Date.now() - new Date(s.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24),
                  );
                  return days < 7;
                }).length
              }
            </p>
            <p className="text-xs font-black uppercase tracking-wider text-muted">
              This Week
            </p>
          </div>
          <div className="bg-surface border-[3px] border-border shadow-[4px_4px_0px_0px_#7CB97A] p-4">
            <p className="text-3xl font-black text-ink">{bouquets.length}</p>
            <p className="text-xs font-black uppercase tracking-wider text-muted">
              Active Bouquets
            </p>
          </div>
          <div className="bg-surface border-[3px] border-border shadow-[4px_4px_0px_0px_#FFD966] p-4">
            <p className="text-3xl font-black text-ink">
              {new Set(state.scans.map((s) => s.scientificName)).size}
            </p>
            <p className="text-xs font-black uppercase tracking-wider text-muted">
              Species Found
            </p>
          </div>
        </div>

        {/* Bouquet grid */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-ink uppercase tracking-tight mb-4">
            Active Bouquets
          </h2>
          {bouquets.length === 0 ? (
            <p className="text-muted font-medium">
              No active bouquets yet.{' '}
              <Link href="/scan" className="underline font-bold text-ink">
                Scan a bouquet
              </Link>{' '}
              to start tracking.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bouquets.map((bouquet) => (
                <BouquetTile key={bouquet.id} bouquet={bouquet} />
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
