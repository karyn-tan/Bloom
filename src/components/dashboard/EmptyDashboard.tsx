import Link from 'next/link';

const FlowerIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C12 2 13 5 13 7C13 9 11 10 11 10C11 10 9 9 9 7C9 5 12 2 12 2Z" />
    <path d="M12 10C12 10 15 9 17 10C19 11 20 14 20 14C20 14 17 15 15 14C13 13 12 10 12 10Z" />
    <path d="M12 10C12 10 9 11 7 10C5 9 4 6 4 6C4 6 7 5 9 6C11 7 12 10 12 10Z" />
    <path d="M12 10C12 10 13 13 12 15C11 17 8 18 8 18C8 18 7 15 8 13C9 11 12 10 12 10Z" />
    <path d="M12 10C12 10 11 7 12 5C13 3 16 2 16 2C16 2 17 5 16 7C15 9 12 10 12 10Z" />
    <path d="M12 14V22M9 17H15" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const CameraIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    className={className}
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
);

const SparklesIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  </svg>
);

const CalendarIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

/**
 * EmptyDashboard — onboarding view shown when the user has no scans or bouquets
 */
export function EmptyDashboard() {
  return (
    <main className="min-h-screen bg-bg">
      {/* Top accent bar */}
      <div className="w-full h-3 bg-coral" />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sage border-[3px] border-border mb-4 shadow-[3px_3px_0px_0px_var(--color-border)]">
            <FlowerIcon className="w-4 h-4 text-ink" />
            <span className="text-xs font-black uppercase tracking-wider text-ink">
              New User
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-ink leading-[0.9] tracking-tight mb-4 uppercase">
            Welcome to
            <span className="block text-sage">Bloom!</span>
          </h1>
          <p className="text-lg text-muted font-medium max-w-lg">
            Let&apos;s help your flowers last longer. Upload a photo of your
            bouquet and we&apos;ll tell you exactly what to do.
          </p>
        </header>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-xl font-black text-ink uppercase tracking-wider mb-6 flex items-center gap-3">
            <span className="w-8 h-8 bg-surface border-[3px] border-border flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-ink" />
            </span>
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                number: '1',
                title: 'Upload',
                desc: 'Take a photo of your bouquet and upload it to Bloom.',
                accent: 'bg-sky',
                shadow: '#74C0FC',
              },
              {
                number: '2',
                title: 'Identify',
                desc: 'We identify each flower in your bouquet using PlantNet.',
                accent: 'bg-butter',
                shadow: '#FFD966',
              },
              {
                number: '3',
                title: 'Care Tips',
                desc: 'Get personalized care tips and lifespan estimates for every flower.',
                accent: 'bg-coral',
                shadow: '#FF6B6B',
              },
            ].map((step) => (
              <div
                key={step.number}
                className="bg-surface border-[3px] border-border shadow-[4px_4px_0px_0px_var(--shadow)]"
                style={{ '--shadow': step.shadow } as React.CSSProperties}
              >
                <div
                  className={`${step.accent} w-full h-2 border-b-[3px] border-border`}
                />
                <div className="p-5">
                  <div
                    className={`${step.accent} w-10 h-10 border-[3px] border-border flex items-center justify-center mb-4`}
                  >
                    <span className="text-ink font-black text-lg">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-ink uppercase tracking-tight mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-12 flex justify-center">
          <Link
            href="/scan"
            className="group inline-flex items-center gap-3 bg-coral text-ink-light text-lg font-black px-10 py-5 border-[3px] border-border shadow-[5px_5px_0px_0px_#FFD966] hover:translate-x-[5px] hover:translate-y-[5px] hover:shadow-none transition-all uppercase tracking-wider"
          >
            <CameraIcon className="w-6 h-6" />
            Scan Your First Bouquet
          </Link>
        </section>

        {/* What's in Season */}
        <section>
          <h2 className="text-xl font-black text-ink uppercase tracking-wider mb-6 flex items-center gap-3">
            <span className="w-8 h-8 bg-surface border-[3px] border-border flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-ink" />
            </span>
            What&apos;s in Season
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                name: 'Tulips',
                note: 'Classic spring bloom',
                color: 'bg-coral',
              },
              {
                name: 'Daffodils',
                note: 'Bright and cheerful',
                color: 'bg-butter',
              },
              {
                name: 'Hyacinth',
                note: 'Fragrant clusters',
                color: 'bg-blush',
              },
              {
                name: 'Cherry Blossoms',
                note: 'Delicate pink',
                color: 'bg-mint',
              },
            ].map((flower) => (
              <div
                key={flower.name}
                className="bg-surface border-[3px] border-border shadow-[3px_3px_0px_0px_#7CB97A] p-4"
              >
                <div
                  className={`${flower.color} w-3 h-3 border border-border mb-3`}
                />
                <h3 className="text-sm font-black text-ink mb-1">
                  {flower.name}
                </h3>
                <p className="text-xs text-muted font-medium">{flower.note}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
