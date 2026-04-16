'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { BouquetSummary } from '@/lib/dashboard';

type BouquetTileProps = {
  bouquet: BouquetSummary;
};

export function BouquetTile({ bouquet }: BouquetTileProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm('Delete this bouquet? This cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/bouquets/${bouquet.id}`, { method: 'DELETE' });
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="bg-surface border-[3px] border-border shadow-[4px_4px_0px_0px_var(--color-border)] flex flex-col">
      {bouquet.imageUrl ? (
        <div className="relative h-32 w-full border-b-[3px] border-border overflow-hidden">
          <Image
            src={bouquet.imageUrl}
            alt={bouquet.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : null}

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-black text-ink text-base uppercase tracking-wide leading-tight">
          {bouquet.name}
        </h3>

        <p className="text-sm text-muted font-medium">
          {bouquet.ageInDays} {bouquet.ageInDays === 1 ? 'day' : 'days'} old
        </p>

        {bouquet.isPastPeak ? (
          <span
            data-testid="past-peak-badge"
            className="inline-block text-xs font-black uppercase tracking-wider px-2 py-1 border-[2px] border-muted text-muted bg-muted/10 self-start"
          >
            Likely past peak
          </span>
        ) : bouquet.daysRemaining != null ? (
          <span className="inline-block text-xs font-black uppercase tracking-wider px-2 py-1 border-[2px] border-sage text-sage bg-sage/10 self-start">
            {bouquet.daysRemaining}{' '}
            {bouquet.daysRemaining === 1 ? 'day' : 'days'} left
          </span>
        ) : null}

        <div className="mt-auto pt-3">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs font-black uppercase tracking-wider px-3 py-1.5 bg-coral text-white border-[2px] border-border shadow-[2px_2px_0px_0px_var(--color-border)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[2px_2px_0px_0px_var(--color-border)]"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
