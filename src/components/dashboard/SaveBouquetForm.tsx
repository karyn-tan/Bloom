'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type SaveBouquetFormProps = {
  scanId: string;
};

export function SaveBouquetForm({ scanId }: SaveBouquetFormProps) {
  const router = useRouter();
  const defaultName = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const [name, setName] = useState(defaultName);
  const [reminderOptIn, setReminderOptIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/bouquets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: scanId,
          name,
          reminder_opt_in: reminderOptIn,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError((data as { error?: string }).error ?? 'Something went wrong');
        return;
      }

      const bouquetData = (await res.json()) as { id: string };

      if (reminderOptIn) {
        await fetch('/api/reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bouquetId: bouquetData.id }),
        });
      }

      router.push('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border-[3px] border-border shadow-[6px_6px_0px_0px_#7CB97A] p-6 flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="bouquet-name"
          className="text-xs font-black uppercase tracking-wider text-muted"
        >
          Bouquet name
        </label>
        <input
          id="bouquet-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border-[3px] border-border bg-bg px-3 py-2 font-medium text-ink focus:outline-none focus:border-coral"
          required
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={reminderOptIn}
          onChange={(e) => setReminderOptIn(e.target.checked)}
          className="w-4 h-4 border-[2px] border-border"
        />
        <span className="text-sm font-medium text-ink">
          Email me reminders every 2 days
        </span>
      </label>

      {error ? <p className="text-coral font-bold text-sm">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-sage text-white font-black px-6 py-3 border-[3px] border-border shadow-[4px_4px_0px_0px_var(--color-border)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[4px_4px_0px_0px_var(--color-border)] self-start"
      >
        {isSubmitting ? 'Saving…' : 'Save Bouquet'}
      </button>
    </form>
  );
}
