import Link from 'next/link';

/**
 * ScanCTA — primary call-to-action linking to the scan page
 */
export function ScanCTA() {
  return (
    <section className="mb-12 flex justify-center">
      <Link
        href="/scan"
        className="inline-block bg-accent-red text-surface text-lg font-extrabold px-8 py-4 border-2 border-border shadow-[3px_3px_0px_var(--color-border)] rounded-[4px] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all"
      >
        Scan Your First Bouquet
      </Link>
    </section>
  );
}
