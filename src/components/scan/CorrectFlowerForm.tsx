'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  scanId: string;
  currentCommonName: string;
  currentScientificName: string;
};

export function CorrectFlowerForm({
  scanId,
  currentCommonName,
  currentScientificName,
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [commonName, setCommonName] = useState(currentCommonName);
  const [scientificName, setScientificName] = useState(currentScientificName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/scans/${scanId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ common_name: commonName, scientific_name: scientificName }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? 'Failed to update flower');
        return;
      }

      setIsOpen(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="mt-1 text-xs text-muted hover:text-ink font-bold underline transition-colors"
      >
        Not right? Edit
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
      <input
        type="text"
        value={commonName}
        onChange={(e) => setCommonName(e.target.value)}
        placeholder="Common name"
        required
        className="border-[2px] border-border bg-bg px-2 py-1 text-sm font-medium text-ink focus:outline-none focus:border-coral"
      />
      {error ? <p className="text-xs text-coral font-bold">{error}</p> : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-coral text-white border-[2px] border-border shadow-[2px_2px_0px_0px_var(--color-border)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => { setIsOpen(false); setError(null); }}
          className="text-xs font-bold text-muted hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
