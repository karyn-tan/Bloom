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

/**
 * SignupPage component
 */
export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-ink">
            Create your Bloom account
          </h1>
          <p className="mt-2 text-center text-sm text-muted">
            Start tracking your bouquets today
          </p>
        </div>

        <div className="mt-8 bg-surface py-8 px-4 border-2 border-border shadow-[4px_4px_0px_var(--color-border)] sm:px-10">
          <SignupForm />

          <div className="mt-6">
            <AuthDivider />

            <div className="mt-6">
              <GoogleSignInButton />
            </div>
          </div>

          <AuthFooter variant="signup" />
        </div>
      </div>
    </main>
  );
}
