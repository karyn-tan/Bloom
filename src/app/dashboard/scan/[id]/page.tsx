import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { createServerComponentClient } from '@/lib/supabase-server';
import { CareTipSection } from '@/components/scan/CareTipSection';
import { ConfidenceBadge } from '@/components/scan/ConfidenceBadge';
import { HeartIcon } from '@/components/icons/HeartIcon';
import { DropletIcon } from '@/components/icons/DropletIcon';
import { careTipSchema, generateCareTip } from '@/lib/gemini';
import { CorrectFlowerForm } from '@/components/scan/CorrectFlowerForm';
import { CareActionButtons } from '@/components/scan/CareActionButtons';
import { RescanButton } from '@/components/scan/RescanButton';
import { computeHealthState } from '@/lib/health';
import { computeBouquetStatus } from '@/lib/dashboard';
import { AdaptiveTipCard } from '@/components/AdaptiveTipCard';
import type { Database } from '@/types/supabase';
import type { CareLogStatus } from '@/lib/careLog';

type ScanRow = Database['public']['Tables']['scans']['Row'];

const flowerEntrySchema = z.object({
  scientific_name: z.string(),
  common_name: z.string(),
  confidence: z.number(),
  initial_droplets: z.number().int().min(1).max(5).optional(),
  care: careTipSchema.nullable(),
});

const ArrowLeftIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
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
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

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

const DashboardIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
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
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
);

const SparklesIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
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
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
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

function computeRefreshDroplets(lastRefreshAt: string | null): 1 | 2 | 3 {
  if (!lastRefreshAt) return 1;
  const daysSince = Math.floor(
    (Date.now() - new Date(lastRefreshAt).getTime()) / 86_400_000,
  );
  if (daysSince <= 1) return 3;
  if (daysSince <= 3) return 2;
  return 1;
}

function refreshLabel(daysSince: number): string {
  if (daysSince === 0) return 'today';
  if (daysSince === 1) return '1 day ago';
  return `${daysSince} days ago`;
}

export const metadata = {
  title: 'Scan Details - Bloom',
  description: 'View your identified flower and care tips',
};

type PageProps = {
  params: { id: string };
  searchParams: { new?: string };
};

export default async function ScanDetailPage({
  params,
  searchParams,
}: PageProps) {
  const supabase = createServerComponentClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: rawScan } = await supabase
    .from('scans')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!rawScan) {
    notFound();
  }

  const scan = rawScan as ScanRow;

  // Find bouquet linked to this scan
  const bouquetResult = await supabase
    .from('bouquets')
    .select('id, added_at')
    .eq('scan_id', params.id)
    .eq('user_id', user.id)
    .order('added_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const bouquet = bouquetResult.data as
    | { id: string; added_at: string }
    | null
    | undefined;

  // Get refresh logs for droplet computation and history display
  let latestWaterLoggedAt: string | null = null;
  let refreshCount = 0;
  if (bouquet?.id) {
    const refreshResult = await supabase
      .from('care_log')
      .select('logged_at')
      .eq('bouquet_id', bouquet.id)
      .eq('user_id', user.id)
      .eq('action', 'refresh')
      .order('logged_at', { ascending: false });
    const refreshRows = (refreshResult.data ?? []) as { logged_at: string }[];
    refreshCount = refreshRows.length;
    latestWaterLoggedAt = refreshRows[0]?.logged_at ?? null;
  }

  // Parse the first flower from JSONB
  const flowersArray = z.array(flowerEntrySchema).safeParse(scan.flowers);
  if (!flowersArray.success || flowersArray.data.length === 0) {
    notFound();
  }
  let flower = flowersArray.data[0];

  // Auto-generate care tips if missing (Gemini was not called at scan time)
  if (!flower.care) {
    try {
      const generated = await generateCareTip(
        flower.scientific_name,
        flower.common_name,
      );
      // Cache in DB for future loads
      const updatedFlowers = flowersArray.data.map((f, i) =>
        i === 0 ? { ...f, care: generated } : f,
      );
      const { error: updateError } = await (supabase as any)
        .from('scans')
        .update({ flowers: updatedFlowers })
        .eq('id', params.id)
        .eq('user_id', user.id);
      if (updateError)
        console.error('[scan-page] care tip cache error:', updateError.message);
      flower = { ...flower, care: generated };
    } catch (err) {
      console.error('[scan-page] generateCareTip failed:', err);
    }
  }

  // Compute health state from real bouquet and care log data
  const lifespanMin = flower.care?.lifespan_days.min ?? null;
  const addedAt = bouquet?.added_at ?? scan.created_at;
  const { ageInDays } = computeBouquetStatus(addedAt, lifespanMin);

  const daysSinceRefresh = latestWaterLoggedAt
    ? Math.floor(
        (Date.now() - new Date(latestWaterLoggedAt).getTime()) / 86_400_000,
      )
    : null;

  const health = bouquet
    ? computeHealthState({
        ageInDays,
        lifespanMin,
        lastWateredAt: latestWaterLoggedAt,
        bouquetAddedAt: bouquet.added_at,
        waterText: flower.care?.care.water ?? '',
        initialDroplets: flower.initial_droplets,
        daysSinceRefresh,
      })
    : null;

  // Fetch adaptive care tip (cached or newly generated)
  let adaptiveTip: string | null = null;
  let adaptiveTipStatus: CareLogStatus | null = null;
  if (bouquet?.id) {
    try {
      const tipRes = await fetch(
        new URL(
          '/api/adaptive-tip',
          process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        ).href,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bouquet_id: bouquet.id }),
          cache: 'no-store',
        },
      );
      if (tipRes.ok) {
        const tipData = (await tipRes.json()) as {
          tip: string;
          status: CareLogStatus;
        };
        adaptiveTip = tipData.tip;
        adaptiveTipStatus = tipData.status;
      }
    } catch {
      // Non-fatal: adaptive tip is best-effort
    }
  }

  const refreshDroplets = computeRefreshDroplets(latestWaterLoggedAt);
  const hydrationLabel =
    refreshDroplets === 3
      ? 'Well Watered'
      : refreshDroplets === 2
        ? 'Change Soon'
        : 'Needs Refresh';

  // Generate signed URL for the image
  let imageUrl: string | null = null;
  if (scan.image_url) {
    if (scan.image_url.startsWith('http')) {
      imageUrl = scan.image_url;
    } else {
      const { data: signedData } = await supabase.storage
        .from('flower-images')
        .createSignedUrl(scan.image_url, 3600);
      imageUrl = signedData?.signedUrl ?? null;
    }
  }

  return (
    <main className="min-h-screen bg-bg">
      {/* Top accent bar */}
      <div className="w-full h-3 bg-mint" />

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Back link + success badge */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-muted hover:text-ink font-bold transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Dashboard
          </Link>
          {searchParams.new === '1' && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sage border-[3px] border-border shadow-[3px_3px_0px_0px_var(--color-border)]">
              <SparklesIcon className="w-4 h-4 text-ink" />
              <span className="text-xs font-black uppercase tracking-wider text-ink">
                Successfully Identified
              </span>
            </div>
          )}
        </div>

        {/* Uploaded photo + rescan button */}
        <div className="relative mb-8">
          {imageUrl && (
            <div className="bg-surface border-[3px] border-border shadow-[6px_6px_0px_0px_#FFD966] overflow-hidden aspect-square">
              <img
                src={imageUrl}
                alt={flower.common_name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <RescanButton compact />
          </div>
        </div>

        {/* Health indicators — computed from real lifespan and care log data */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-surface border-[3px] border-border shadow-[4px_4px_0px_0px_#FF6B6B] p-4 flex items-center gap-4">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <HeartIcon
                  key={i}
                  filled={i < (health?.hearts ?? 3)}
                  className="w-6 h-6"
                />
              ))}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-muted">
                Health
              </p>
              <p className="font-black text-ink">
                {health?.status === 'past_peak'
                  ? 'Past Peak'
                  : health?.status === 'struggling'
                    ? 'Struggling'
                    : 'Good'}
              </p>
            </div>
          </div>
          <div className="bg-surface border-[3px] border-border shadow-[4px_4px_0px_0px_#74C0FC] p-4 flex items-center gap-4">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <DropletIcon
                  key={i}
                  filled={i < refreshDroplets}
                  className="w-5 h-5"
                />
              ))}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-muted">
                Hydration
              </p>
              <p className="font-black text-ink">{hydrationLabel}</p>
              {bouquet && (
                <p className="text-xs text-muted mt-0.5">
                  Refreshed {refreshCount}{' '}
                  {refreshCount === 1 ? 'time' : 'times'}
                  {daysSinceRefresh !== null
                    ? ` · Last ${refreshLabel(daysSinceRefresh)}`
                    : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Care action buttons — only shown when bouquet exists */}
        {bouquet && (
          <div className="mb-4">
            <CareActionButtons bouquetId={bouquet.id} />
          </div>
        )}

        {/* Flower info */}
        <div className="bg-surface border-[3px] border-border shadow-[6px_6px_0px_0px_#7CB97A] p-6 mb-8">
          <div className="flex items-start justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sage border-[3px] border-border flex items-center justify-center">
                <FlowerIcon className="w-6 h-6 text-ink" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-ink uppercase tracking-tight">
                  {flower.common_name}
                </h1>
                <CorrectFlowerForm
                  scanId={scan.id}
                  currentCommonName={flower.common_name}
                  currentScientificName={flower.scientific_name}
                />
              </div>
            </div>
            {searchParams.new === '1' && (
              <ConfidenceBadge confidence={flower.confidence} />
            )}
          </div>

          {flower.care ? (
            <>
              <CareTipSection care={flower.care} />
              {adaptiveTip && adaptiveTipStatus && (
                <AdaptiveTipCard tip={adaptiveTip} status={adaptiveTipStatus} />
              )}
            </>
          ) : (
            <div className="mt-4 p-4 bg-coral/10 border-[3px] border-border">
              <p className="font-black text-coral uppercase text-sm tracking-wider">
                Care tips unavailable for this flower
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
