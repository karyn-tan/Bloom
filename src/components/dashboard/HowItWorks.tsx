const STEPS = [
  {
    number: '1',
    title: 'Upload',
    description: 'Take a photo of your bouquet and upload it to Bloom.',
    accent: 'bg-accent-teal',
  },
  {
    number: '2',
    title: 'Identify',
    description:
      'We identify each flower in your bouquet using PlantNet.',
    accent: 'bg-accent-gold',
  },
  {
    number: '3',
    title: 'Care Tips',
    description:
      'Get personalized care tips and lifespan estimates for every flower.',
    accent: 'bg-accent-red',
  },
] as const;

/**
 * HowItWorks — 3-step visual guide showing the core loop
 */
export function HowItWorks() {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-extrabold text-ink uppercase tracking-wide mb-6">
        How It Works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((step) => (
          <div
            key={step.number}
            className="bg-surface border-2 border-border shadow-[4px_4px_0px_var(--color-border)] rounded-[4px] p-6"
          >
            <div
              className={`${step.accent} w-10 h-10 border-2 border-border flex items-center justify-center mb-4`}
            >
              <span className="text-surface font-extrabold text-lg">
                {step.number}
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-ink mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-muted">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
