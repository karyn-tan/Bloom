import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-bg">
      <h1 className="text-4xl font-bold text-accent-teal mb-4 font-[var(--font-display)]">
        Bloom
      </h1>
      <p className="text-lg text-muted mb-8 text-center max-w-md">
        Upload a photo of your bouquet and get personalized care tips to help
        your flowers last longer.
      </p>
      <Link
        href="/login"
        className="px-6 py-3 bg-accent-red text-surface border-2 border-border shadow-[3px_3px_0px_var(--color-border)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-transform font-medium"
      >
        Get Started
      </Link>
    </main>
  );
}
