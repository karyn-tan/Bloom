'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = { bouquetId: string };

export function CareActionButtons({ bouquetId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<'water' | 'trim' | null>(null);

  async function logAction(action: 'water' | 'trim') {
    setLoading(action);
    try {
      const res = await fetch('/api/care-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bouquet_id: bouquetId, action }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={() => logAction('water')}
        disabled={loading !== null}
        className="flex-1 bg-surface text-ink font-black px-4 py-3 border-[3px] border-border shadow-[3px_3px_0px_0px_var(--color-border)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === 'water' ? 'Logging...' : '💧 Water'}
      </button>
      <button
        onClick={() => logAction('trim')}
        disabled={loading !== null}
        className="flex-1 bg-surface text-ink font-black px-4 py-3 border-[3px] border-border shadow-[3px_3px_0px_0px_var(--color-border)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === 'trim' ? 'Logging...' : '✂️ Trim'}
      </button>
    </div>
  );
}
