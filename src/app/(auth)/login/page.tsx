import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

/**
 * Metadata for the login page
 */
export const metadata = {
  title: 'Sign In - Bloom',
  description: 'Sign in to your Bloom account',
};

/**
 * Divider component for auth forms
 * Shows "Or continue with" text between sections
 */
function AuthDivider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-white text-gray-500">Or continue with</span>
      </div>
    </div>
  );
}

/**
 * AuthFooter component for auth pages
 * Shows signup/signin link
 */
function AuthFooter() {
  return (
    <p className="mt-6 text-center text-sm text-gray-600">
      Don&apos;t have an account?{' '}
      <Link
        href="/signup"
        className="font-medium text-green-600 hover:text-green-500"
      >
        Sign up
      </Link>
    </p>
  );
}

/**
 * LoginPage component
 * Renders the login page with form and signup link
 */
export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Bloom
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your credentials to access your dashboard
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm />

          <div className="mt-6">
            <AuthDivider />

            <div className="mt-6">
              <GoogleSignInButton />
            </div>
          </div>

          <AuthFooter />
        </div>
      </div>
    </main>
  );
}