'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = { bouquetId: string };

export function CareActionButtons({ bouquetId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logRefresh() {
    setLoading(true);
    try {
      const res = await fetch('/api/care-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bouquet_id: bouquetId, action: 'refresh' }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={logRefresh}
      disabled={loading}
      className="w-full bg-surface text-ink font-black px-4 py-3 border-[3px] border-border shadow-[3px_3px_0px_0px_var(--color-border)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Logging...' : '💧✂️ Change Water & Trim'}
    </button>
  );
}
