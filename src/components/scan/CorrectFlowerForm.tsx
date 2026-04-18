'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  scanId: string;
  currentCommonName: string;
};

export function CorrectFlowerForm({ scanId, currentCommonName }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [commonName, setCommonName] = useState(currentCommonName);
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
        body: JSON.stringify({
          common_name: commonName,
          scientific_name: commonName,
        }),
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

  if (isSubmitting) {
    return (
      <div className="mt-3 flex items-center gap-2">
        <svg
          className="w-4 h-4 text-accent-teal animate-spin shrink-0"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <span className="text-xs font-bold text-muted">
          Regenerating care tips for <span className="text-ink">{commonName}</span>…
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
      <label className="text-xs font-extrabold text-muted uppercase tracking-wide">
        What flower is this?
      </label>
      <input
        type="text"
        value={commonName}
        onChange={(e) => setCommonName(e.target.value)}
        placeholder="e.g. Peony, Ranunculus, Dahlia"
        required
        autoFocus
        className="border-[2px] border-border bg-bg px-2 py-1 text-sm font-medium text-ink focus:outline-none focus:border-accent-teal"
      />
      <p className="text-xs text-muted">
        Care tips will be regenerated for this flower.
      </p>
      {error ? <p className="text-xs text-accent-red font-bold">{error}</p> : null}
      <div className="flex gap-2">
        <button
          type="submit"
          className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-accent-red text-surface border-[2px] border-border shadow-[2px_2px_0px_0px_var(--color-border)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          Update &amp; Regenerate
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setError(null);
          }}
          className="text-xs font-bold text-muted hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
