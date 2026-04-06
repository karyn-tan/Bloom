import { SignupForm } from '@/components/auth/SignupForm';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { AuthFooter } from '@/components/auth/AuthFooter';

/**
 * Metadata for the signup page
 */
export const metadata = {
  title: 'Sign Up - Bloom',
  description: 'Create your Bloom account',
};

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

/**
 * SignupPage component - Light Neo-Brutalist Design
 */
export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-bg">
      {/* Top bar accent */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-sage" />

      {/* Left side - Brand panel */}
      <div className="lg:w-1/2 flex flex-col justify-center items-start px-8 py-12 lg:px-16 lg:py-0 border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-border bg-bg-alt relative">
        {/* Decorative shapes */}
        <div className="absolute top-32 right-32 w-16 h-16 bg-blush border-[3px] border-border rotate-12 hidden lg:block" />
        <div className="absolute bottom-32 left-16 w-20 h-20 bg-butter border-[3px] border-border -rotate-6 hidden lg:block" />
        <div className="absolute top-60 right-10 w-12 h-12 bg-mint border-[3px] border-border rotate-45 hidden lg:block" />

        <div className="max-w-md relative z-10">
          {/* Logo block */}
          <div className="inline-flex items-center gap-3 bg-surface border-[3px] border-border shadow-[5px_5px_0px_0px_var(--color-border)] px-5 py-3 mb-8">
            <div className="w-10 h-10 bg-sage border-[3px] border-border flex items-center justify-center">
              <FlowerIcon className="w-5 h-5 text-ink" />
            </div>
            <span className="text-2xl font-black text-ink tracking-tight uppercase">
              Bloom
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl lg:text-7xl font-black text-ink leading-[0.9] tracking-tight mb-6 uppercase">
            Start your
            <span className="block text-coral">flower care</span>
            journey
          </h1>

          {/* Tagline */}
          <p className="text-lg text-muted font-medium mb-10 max-w-sm">
            Join thousands of flower lovers who keep their blooms alive longer
            with AI-powered care tips.
          </p>

          {/* Feature list */}
          <div className="space-y-4">
            {[
              {
                icon: SparklesIcon,
                text: 'AI flower identification',
                color: 'bg-butter',
              },
              {
                icon: SparklesIcon,
                text: 'Personalized care tips',
                color: 'bg-mint',
              },
              {
                icon: SparklesIcon,
                text: 'Track bouquet health',
                color: 'bg-coral',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 ${item.color} border-[2px] border-border flex items-center justify-center`}
                >
                  <item.icon className="w-4 h-4 text-ink" />
                </div>
                <span className="text-muted font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form panel */}
      <div className="lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 lg:px-16 bg-surface">
        <div className="w-full max-w-md">
          {/* Form container */}
          <div className="bg-bg border-[3px] border-border shadow-[6px_6px_0px_0px_var(--color-border)] p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-ink uppercase tracking-tight">
                Create account
              </h2>
              <p className="mt-1 text-sm text-muted font-medium">
                Start tracking your bouquets today
              </p>
            </div>

            <SignupForm />

            <div className="mt-6">
              <AuthDivider />

              <div className="mt-6">
                <GoogleSignInButton />
              </div>
            </div>

            <AuthFooter variant="signup" />
          </div>

          {/* Bottom decorative */}
          <div className="mt-8 flex justify-center gap-3">
            <div className="w-3 h-3 bg-sage border border-border" />
            <div className="w-3 h-3 bg-mint border border-border" />
            <div className="w-3 h-3 bg-coral border border-border" />
            <div className="w-3 h-3 bg-butter border border-border" />
          </div>
        </div>
      </div>
    </main>
  );
}
