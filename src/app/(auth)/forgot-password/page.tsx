'use client';

import { useState } from 'react';
import Link from 'next/link';
import { validateEmail } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = (value: string) => {
    if (!value) return 'Email is required';
    if (!validateEmail(value)) return 'Invalid email format';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);

    const error = validate(email);
    setEmailError(error);
    if (error) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setServerError(data.error || 'Something went wrong');
        return;
      }

      setSubmitted(true);
    } catch {
      setServerError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-ink font-[var(--font-display)]">
            Reset your password
          </h1>
          <p className="mt-2 text-center text-sm text-muted">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <div className="bg-surface py-8 px-4 border-2 border-border shadow-[4px_4px_0px_var(--color-border)] sm:px-10">
          {submitted ? (
            <div className="text-center space-y-4">
              <p className="text-ink font-medium">Check your email</p>
              <p className="text-sm text-muted">
                We sent a reset link to <strong>{email}</strong>. Check your
                inbox and follow the instructions.
              </p>
              <Link
                href="/login"
                className="inline-block mt-4 text-sm font-medium text-accent-teal"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {serverError && (
                <div
                  className="p-3 bg-accent-red text-surface text-sm border-2 border-border"
                  role="alert"
                >
                  {serverError}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-ink"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailTouched) setEmailError(validate(e.target.value));
                  }}
                  onBlur={() => {
                    setEmailTouched(true);
                    setEmailError(validate(email));
                  }}
                  disabled={isSubmitting}
                  className="mt-1 block w-full px-3 py-2 border-2 border-border bg-surface text-ink disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent-teal"
                  aria-describedby={emailError ? 'email-error' : undefined}
                />
                {emailTouched && emailError && (
                  <p id="email-error" className="mt-1 text-sm text-accent-red font-medium">
                    {emailError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border-2 border-border text-sm font-medium text-surface bg-accent-red shadow-[3px_3px_0px_var(--color-border)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-transform"
              >
                {isSubmitting ? 'Sending...' : 'Send reset link'}
              </button>

              <p className="text-center text-sm text-muted">
                <Link href="/login" className="font-medium text-accent-teal">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
