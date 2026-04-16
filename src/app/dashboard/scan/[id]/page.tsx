import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { createServerComponentClient } from '@/lib/supabase-server';
import { CareTipSection } from '@/components/scan/CareTipSection';
import { ConfidenceBadge } from '@/components/scan/ConfidenceBadge';
import { SaveBouquetForm } from '@/components/dashboard/SaveBouquetForm';
import { HeartIcon } from '@/components/icons/HeartIcon';
import { DropletIcon } from '@/components/icons/DropletIcon';
import { careTipSchema } from '@/lib/gemini';
import type { Database } from '@/types/supabase';

type ScanRow = Database['public']['Tables']['scans']['Row'];

const flowerEntrySchema = z.object({
  scientific_name: z.string(),
  common_name: z.string(),
  confidence: z.number(),
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

export const metadata = {
  title: 'Scan Details - Bloom',
  description: 'View your identified flower and care tips',
};

type PageProps = {
  params: { id: string };
};

export default async function ScanDetailPage({ params }: PageProps) {
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

  // Parse the first flower from JSONB
  const flowersArray = z.array(flowerEntrySchema).safeParse(scan.flowers);
  if (!flowersArray.success || flowersArray.data.length === 0) {
    notFound();
  }
  const flower = flowersArray.data[0];

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
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted hover:text-ink font-bold mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Success badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-sage border-[3px] border-border mb-6 shadow-[3px_3px_0px_0px_var(--color-border)]">
          <SparklesIcon className="w-4 h-4 text-ink" />
          <span className="text-xs font-black uppercase tracking-wider text-ink">
            Successfully Identified
          </span>
        </div>

        {/* Uploaded photo */}
        {imageUrl && (
          <div className="bg-surface border-[3px] border-border shadow-[6px_6px_0px_0px_#FFD966] overflow-hidden mb-8">
            <img
              src={imageUrl}
              alt={flower.common_name}
              className="w-full max-h-72 object-cover"
            />
          </div>
        )}

        {/* Health indicators — static 3/3 hearts and 4/5 droplets until health system (US-14) is built */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-surface border-[3px] border-border shadow-[4px_4px_0px_0px_#FF6B6B] p-4 flex items-center gap-4">
            <div className="flex gap-1">
              <HeartIcon filled className="w-6 h-6" />
              <HeartIcon filled className="w-6 h-6" />
              <HeartIcon filled className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-muted">
                Health
              </p>
              <p className="font-black text-ink">Good</p>
            </div>
          </div>
          <div className="bg-surface border-[3px] border-border shadow-[4px_4px_0px_0px_#74C0FC] p-4 flex items-center gap-4">
            <div className="flex gap-1">
              <DropletIcon filled className="w-5 h-5" />
              <DropletIcon filled className="w-5 h-5" />
              <DropletIcon filled className="w-5 h-5" />
              <DropletIcon filled className="w-5 h-5" />
              <DropletIcon filled={false} className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-muted">
                Hydration
              </p>
              <p className="font-black text-ink">Well Watered</p>
            </div>
          </div>
        </div>

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
                <p className="text-sm text-muted italic font-medium">
                  {flower.scientific_name}
                </p>
              </div>
            </div>
            <ConfidenceBadge confidence={flower.confidence} />
          </div>

          {flower.care ? (
            <CareTipSection care={flower.care} />
          ) : (
            <div className="mt-4 p-4 bg-coral/10 border-[3px] border-border">
              <p className="font-black text-coral uppercase text-sm tracking-wider">
                Care tips unavailable for this flower
              </p>
            </div>
          )}
        </div>

        {/* Save as Bouquet */}
        <section className="mb-8">
          <h2 className="text-xl font-black text-ink uppercase tracking-tight mb-4">
            Save as Bouquet
          </h2>
          <SaveBouquetForm scanId={scan.id} />
        </section>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/scan"
            className="inline-flex items-center justify-center gap-2 bg-coral text-ink-light font-black px-6 py-3 border-[3px] border-border shadow-[4px_4px_0px_0px_var(--color-border)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all text-sm uppercase tracking-wider"
          >
            <CameraIcon className="w-5 h-5" />
            Scan Another Bouquet
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-surface text-ink font-black px-6 py-3 border-[3px] border-border shadow-[4px_4px_0px_0px_var(--color-border)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all text-sm uppercase tracking-wider"
          >
            <DashboardIcon className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
