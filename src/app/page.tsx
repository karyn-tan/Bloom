import Link from 'next/link';

// SVG Icon Components
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

const HeartIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const CalendarIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
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
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const SparklesIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
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
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  </svg>
);

const ArrowRightIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
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
      d="M17 8l4 4m0 0l-4 4m4-4H3"
    />
  </svg>
);

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

const DropletIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
  </svg>
);

export default function Home() {
  return (
    <main className="min-h-screen bg-bg overflow-x-hidden">
      {/* Top Bar - Coral accent */}
      <div className="w-full h-3 bg-coral" />

      {/* Navigation */}
      <nav className="w-full px-6 py-4 border-b-[3px] border-border bg-surface">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-sage border-[3px] border-border flex items-center justify-center shadow-[4px_4px_0px_0px_var(--color-border)]">
              <FlowerIcon className="w-6 h-6 text-ink" />
            </div>
            <span className="text-2xl font-black text-ink tracking-tight uppercase">
              Bloom
            </span>
          </div>
          <Link
            href="/login"
            className="px-5 py-2.5 bg-surface text-ink border-[3px] border-border shadow-[4px_4px_0px_0px_var(--color-border)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all font-bold text-sm uppercase tracking-wider"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Decorative Background Elements */}
        <div className="absolute top-20 right-20 w-40 h-40 bg-butter border-[3px] border-border rotate-12 hidden lg:block" />
        <div className="absolute bottom-40 left-10 w-24 h-24 bg-blush border-[3px] border-border -rotate-6 hidden lg:block" />
        <div className="absolute top-40 right-1/3 w-16 h-16 bg-mint border-[3px] border-border rotate-45 hidden lg:block" />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Headline */}
            <div className="relative z-10">
              {/* Decorative badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-butter border-[3px] border-border mb-6 shadow-[4px_4px_0px_0px_var(--color-border)] -rotate-1">
                <SparklesIcon className="w-4 h-4 text-ink" />
                <span className="text-xs font-black uppercase tracking-wider text-ink">
                  AI-Powered Flower Care
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-ink leading-[0.9] mb-6 uppercase">
                Make Your
                <span className="block text-coral">Bouquets</span>
                <span className="block">Last Longer</span>
              </h1>

              <p className="text-lg lg:text-xl text-muted max-w-lg mb-8 leading-relaxed font-medium">
                Upload a photo of your bouquet. Our AI identifies every flower
                and generates personalized care tips to keep them fresh longer.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="group px-8 py-4 bg-coral text-ink-light border-[3px] border-border shadow-[6px_6px_0px_0px_var(--color-border)] hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none transition-all font-black text-lg uppercase tracking-wider flex items-center gap-3"
                >
                  Get Started
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 bg-surface text-ink border-[3px] border-border shadow-[6px_6px_0px_0px_var(--color-border)] hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none transition-all font-black text-lg uppercase tracking-wider"
                >
                  How It Works
                </a>
              </div>
            </div>

            {/* Right: Visual Card Stack */}
            <div className="relative hidden lg:block">
              {/* Main card */}
              <div className="relative z-10 bg-surface border-[4px] border-border p-6 shadow-[10px_10px_0px_0px_#74C0FC] rotate-1">
                <div className="aspect-[4/3] bg-bg border-[3px] border-border mb-6 flex items-center justify-center overflow-hidden">
                  <div className="text-center p-6">
                    <div className="w-20 h-20 mx-auto mb-4 bg-sage border-[3px] border-border flex items-center justify-center">
                      <CameraIcon className="w-10 h-10 text-ink" />
                    </div>
                    <p className="text-sm font-black text-ink uppercase tracking-wider">
                      Upload Photo
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-sage border-[2px] border-border w-3/4" />
                  <div className="h-4 bg-bg border-[2px] border-border w-full" />
                  <div className="h-4 bg-bg border-[2px] border-border w-5/6" />
                </div>
              </div>

              {/* Decorative cards behind */}
              <div className="absolute -top-4 -right-4 w-full h-full bg-blush border-[4px] border-border -z-10" />
              <div className="absolute -bottom-4 -left-4 w-full h-full bg-mint border-[4px] border-border -z-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar - Cheerful */}
      <section className="px-6 py-10 bg-butter border-y-[3px] border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '10K+', label: "Bouquets ID'd" },
            { value: '50+', label: 'Flower Species' },
            { value: '14', label: 'Day Avg. Lifespan' },
            { value: '98%', label: 'Accuracy Rate' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-black text-ink mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-black uppercase tracking-wider text-ink/70">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="px-6 py-20 lg:py-32 bg-surface">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-sky border-[3px] border-border mb-4 shadow-[4px_4px_0px_0px_var(--color-border)] rotate-1">
              <span className="text-xs font-black uppercase tracking-wider text-ink">
                Three Simple Steps
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-ink mb-4 uppercase">
              How Bloom Works
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              From identification to personalized care, we help you nurture your
              flowers every step of the way.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group relative">
              <div className="absolute -top-3 -left-3 w-full h-full bg-coral border-[3px] border-border -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
              <div className="bg-surface border-[4px] border-border p-8 h-full flex flex-col shadow-[6px_6px_0px_0px_var(--color-border)] group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-transform">
                <div className="w-16 h-16 bg-coral border-[3px] border-border flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_var(--color-border)]">
                  <CameraIcon className="w-8 h-8 text-ink-light" />
                </div>
                <div className="w-8 h-8 bg-butter border-[2px] border-border flex items-center justify-center mb-4 font-black text-ink text-sm">
                  01
                </div>
                <h3 className="text-2xl font-black text-ink mb-3 uppercase">
                  Snap a Photo
                </h3>
                <p className="text-muted leading-relaxed flex-grow font-medium">
                  Take a picture of your bouquet and upload it. Our AI
                  recognizes each flower species instantly.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative md:-translate-y-8">
              <div className="absolute -top-3 -left-3 w-full h-full bg-butter border-[3px] border-border -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
              <div className="bg-surface border-[4px] border-border p-8 h-full flex flex-col shadow-[6px_6px_0px_0px_var(--color-border)] group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-transform">
                <div className="w-16 h-16 bg-butter border-[3px] border-border flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_var(--color-border)]">
                  <HeartIcon className="w-8 h-8 text-ink" />
                </div>
                <div className="w-8 h-8 bg-sky border-[2px] border-border flex items-center justify-center mb-4 font-black text-ink text-sm">
                  02
                </div>
                <h3 className="text-2xl font-black text-ink mb-3 uppercase">
                  Get Care Tips
                </h3>
                <p className="text-muted leading-relaxed flex-grow font-medium">
                  Receive tailored advice for each flower type. Water schedules,
                  trimming tips, and optimal placement.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative">
              <div className="absolute -top-3 -left-3 w-full h-full bg-sky border-[3px] border-border -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
              <div className="bg-surface border-[4px] border-border p-8 h-full flex flex-col shadow-[6px_6px_0px_0px_var(--color-border)] group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-transform">
                <div className="w-16 h-16 bg-sky border-[3px] border-border flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_var(--color-border)]">
                  <CalendarIcon className="w-8 h-8 text-ink" />
                </div>
                <div className="w-8 h-8 bg-coral border-[2px] border-border flex items-center justify-center mb-4 font-black text-ink-light text-sm">
                  03
                </div>
                <h3 className="text-2xl font-black text-ink mb-3 uppercase">
                  Track Progress
                </h3>
                <p className="text-muted leading-relaxed flex-grow font-medium">
                  Monitor your bouquet&apos;s health with visual indicators. Get
                  reminders for care tasks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20 bg-bg-alt border-y-[3px] border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Visual */}
            <div className="relative order-2 lg:order-1">
              <div className="relative bg-surface border-[4px] border-border p-6 shadow-[8px_8px_0px_0px_#FF6B6B]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-coral/20 border-[3px] border-border p-4 aspect-square flex flex-col items-center justify-center text-center">
                    <HeartIcon className="w-8 h-8 text-coral mb-2" />
                    <span className="text-2xl font-black text-ink">3</span>
                    <span className="text-xs font-black uppercase tracking-wider text-muted">
                      Hearts
                    </span>
                  </div>
                  <div className="bg-sky/20 border-[3px] border-border p-4 aspect-square flex flex-col items-center justify-center text-center">
                    <div className="w-8 h-8 rounded-full border-[3px] border-sky mb-2 flex items-center justify-center">
                      <div className="w-3 h-3 bg-sky" />
                    </div>
                    <span className="text-2xl font-black text-ink">4</span>
                    <span className="text-xs font-black uppercase tracking-wider text-muted">
                      Droplets
                    </span>
                  </div>
                  <div className="col-span-2 bg-sage/20 border-[3px] border-border p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 bg-sage" />
                      <span className="font-black text-ink text-sm uppercase tracking-wider">
                        Care Tip
                      </span>
                    </div>
                    <p className="text-sm text-muted">
                      Trim stems at a 45° angle and change water every 2 days
                      for maximum freshness.
                    </p>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-butter border-[3px] border-border -z-10" />
              <div className="absolute -bottom-6 -left-6 w-32 h-16 bg-mint border-[3px] border-border -z-10" />
            </div>

            {/* Right: Content */}
            <div className="order-1 lg:order-2">
              <div className="inline-block px-4 py-2 bg-sage border-[3px] border-border mb-4 shadow-[4px_4px_0px_0px_var(--color-border)]">
                <span className="text-xs font-black uppercase tracking-wider text-ink">
                  Smart Tracking
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-ink mb-6 uppercase">
                Visual Health Monitoring
              </h2>
              <p className="text-lg text-muted mb-8 leading-relaxed font-medium">
                Our unique heart and droplet system gives you an instant read on
                your bouquet&apos;s condition. Watch your flowers thrive as you
                follow personalized care recommendations.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: HeartIcon,
                    text: 'Health hearts show overall bouquet vitality',
                    color: 'bg-coral',
                  },
                  {
                    icon: DropletIcon,
                    text: 'Care reminders based on each flower&apos;s needs',
                    color: 'bg-sky',
                  },
                  {
                    icon: SparklesIcon,
                    text: 'AI-powered tips that adapt to your care habits',
                    color: 'bg-butter',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div
                      className={`w-10 h-10 ${item.color} border-[3px] border-border flex items-center justify-center flex-shrink-0 shadow-[3px_3px_0px_0px_var(--color-border)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all`}
                    >
                      <item.icon className="w-5 h-5 text-ink" />
                    </div>
                    <p className="text-ink font-bold pt-2">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 lg:py-32 relative overflow-hidden bg-bg">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-20 h-20 border-[4px] border-ink rotate-45" />
          <div className="absolute top-40 right-20 w-16 h-16 bg-butter border-[3px] border-ink" />
          <div className="absolute bottom-20 left-1/4 w-24 h-24 border-[4px] border-ink" />
          <div className="absolute bottom-40 right-1/3 w-12 h-12 bg-mint border-[3px] border-ink rotate-12" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block px-4 py-2 bg-sage border-[3px] border-border mb-6 shadow-[4px_4px_0px_0px_var(--color-border)] rotate-2">
            <span className="text-xs font-black uppercase tracking-wider text-ink">
              Start Your Flower Journey
            </span>
          </div>

          <h2 className="text-4xl md:text-7xl font-black text-ink mb-6 leading-[0.9] uppercase">
            Ready to Give Your
            <span className="block text-sage">Flowers the Care</span>
            <span className="block">They Deserve?</span>
          </h2>

          <p className="text-xl text-muted mb-10 max-w-2xl mx-auto font-medium">
            Join thousands of flower lovers who are extending the life of their
            bouquets with AI-powered care tips.
          </p>

          <Link
            href="/login"
            className="inline-flex items-center gap-3 px-10 py-5 bg-coral text-ink-light border-[4px] border-border shadow-[8px_8px_0px_0px_#FFD966] hover:translate-x-[8px] hover:translate-y-[8px] hover:shadow-none transition-all font-black text-xl uppercase tracking-wider"
          >
            <CameraIcon className="w-6 h-6" />
            Start Identifying
            <ArrowRightIcon className="w-6 h-6" />
          </Link>

          <p className="mt-6 text-sm text-muted font-medium">
            Free to use • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-surface border-t-[3px] border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-sage border-[3px] border-border flex items-center justify-center">
                <FlowerIcon className="w-5 h-5 text-ink" />
              </div>
              <span className="text-xl font-black text-ink tracking-tight uppercase">
                Bloom
              </span>
            </div>

            <div className="flex items-center gap-6">
              <Link
                href="/login"
                className="text-muted hover:text-coral transition-colors font-bold"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="text-muted hover:text-coral transition-colors font-bold"
              >
                Sign Up
              </Link>
            </div>

            <p className="text-muted text-sm font-medium">
              © 2024 Bloom. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
