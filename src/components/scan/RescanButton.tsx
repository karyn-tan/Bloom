'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const MAX_SIZE_MB = 10;
const ACCEPTED = ['image/jpeg', 'image/png'];

type Props = { compact?: boolean };

export function RescanButton({ compact = false }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);

    if (!ACCEPTED.includes(file.type)) {
      setError('Please upload a JPEG or PNG photo');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Photo must be under ${MAX_SIZE_MB} MB`);
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append('image', file);

      const res = await fetch('/api/identify', { method: 'POST', body: form });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Identification failed. Try again.');
        return;
      }

      router.push(`/dashboard/scan/${data.scan_id}?new=1`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Full-page loading overlay shown while scanning */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg/90 border-[3px] border-border">
          <div className="bg-surface border-[3px] border-border shadow-[6px_6px_0px_0px_var(--color-border)] px-8 py-6 flex flex-col items-center gap-3">
            <svg
              className="w-10 h-10 text-accent-teal animate-spin"
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
            <p className="text-base font-black uppercase tracking-wider text-ink">
              Identifying your flowers…
            </p>
            <p className="text-sm text-muted">This may take a few seconds</p>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
      {compact ? (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          title="Rescan with new photo"
          className="flex flex-col items-center gap-1 bg-surface border-[3px] border-border shadow-[3px_3px_0px_0px_var(--color-border)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-5 h-5 text-ink"
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
          <span className="text-xs font-black uppercase tracking-wider text-ink">
            Rescan
          </span>
        </button>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="w-full bg-surface text-ink font-black px-4 py-3 border-[3px] border-border shadow-[3px_3px_0px_0px_var(--color-border)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Scanning...' : '📷 Rescan with New Photo'}
        </button>
      )}
      {error && (
        <p className="mt-2 text-xs text-accent-red font-bold">{error}</p>
      )}
    </div>
  );
}
