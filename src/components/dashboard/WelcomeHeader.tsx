/**
 * WelcomeHeader — greeting for new users on the empty-state dashboard
 */
export function WelcomeHeader() {
  return (
    <header className="mb-10">
      <h1 className="text-4xl lg:text-5xl font-extrabold text-ink leading-tight tracking-tight mb-3">
        Welcome to Bloom!
      </h1>
      <p className="text-lg text-muted font-medium max-w-lg">
        Let&apos;s help your flowers last longer. Upload a photo of your
        bouquet and we&apos;ll tell you exactly what to do.
      </p>
    </header>
  );
}
