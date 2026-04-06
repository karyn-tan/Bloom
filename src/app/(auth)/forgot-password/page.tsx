'use client';

import { useState } from 'react';
import Link from 'next/link';
import { validateEmail } from '@/lib/auth';

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

const MailIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
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
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

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
    <main className="min-h-screen flex flex-col items-center justify-center bg-bg py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Top bar accent */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-mint" />

      {/* Decorative shapes */}
      <div className="absolute top-32 left-10 w-16 h-16 bg-blush border-[3px] border-border rotate-12 hidden lg:block" />
      <div className="absolute bottom-40 right-10 w-20 h-20 bg-sage border-[3px] border-border -rotate-6 hidden lg:block" />
      <div className="absolute top-1/3 right-20 w-12 h-12 bg-butter border-[3px] border-border rotate-45 hidden lg:block" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-3 bg-surface border-[3px] border-border shadow-[4px_4px_0px_0px_var(--color-border)] px-5 py-3"
          >
            <div className="w-10 h-10 bg-sage border-[3px] border-border flex items-center justify-center">
              <FlowerIcon className="w-5 h-5 text-ink" />
            </div>
            <span className="text-2xl font-black text-ink tracking-tight uppercase">
              Bloom
            </span>
          </Link>
        </div>

        {/* Form container */}
        <div className="bg-surface border-[3px] border-border shadow-[6px_6px_0px_0px_var(--color-border)] p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-mint/20 border-[3px] border-border mx-auto mb-4 flex items-center justify-center">
              <MailIcon className="w-7 h-7 text-mint" />
            </div>
            <h1 className="text-2xl font-black text-ink uppercase tracking-tight">
              Reset password
            </h1>
            <p className="mt-1 text-sm text-muted font-medium">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-sage/20 border-[3px] border-border mx-auto flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-sage"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-ink font-black uppercase text-sm tracking-wider">
                Check your email
              </p>
              <p className="text-sm text-muted font-medium">
                We sent a reset link to{' '}
                <strong className="text-sky">{email}</strong>. Check your inbox
                and follow the instructions.
              </p>
              <Link
                href="/login"
                className="inline-block mt-4 px-6 py-2 bg-coral text-ink-light border-[3px] border-border shadow-[3px_3px_0px_0px_var(--color-border)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all font-bold text-sm uppercase tracking-wider"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {serverError && (
                <div
                  className="p-3 bg-coral/20 border-[2px] border-border text-sm font-bold text-ink"
                  role="alert"
                >
                  {serverError}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-black text-ink uppercase tracking-wide mb-2"
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
                  className="block w-full px-3 py-3 border-[3px] border-border bg-surface text-ink disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-mint font-medium"
                  aria-describedby={emailError ? 'email-error' : undefined}
                />
                {emailTouched && emailError && (
                  <p
                    id="email-error"
                    className="mt-2 text-sm text-coral font-bold"
                  >
                    {emailError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border-[3px] border-border text-sm font-black text-ink-light bg-coral shadow-[4px_4px_0px_0px_var(--color-border)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider"
              >
                {isSubmitting ? 'Sending...' : 'Send reset link'}
              </button>

              <p className="text-center text-sm font-medium">
                <Link
                  href="/login"
                  className="text-sky font-black hover:underline"
                >
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>

        {/* Bottom decorative */}
        <div className="mt-8 flex justify-center gap-3">
          <div className="w-3 h-3 bg-sage border border-border" />
          <div className="w-3 h-3 bg-mint border border-border" />
          <div className="w-3 h-3 bg-coral border border-border" />
          <div className="w-3 h-3 bg-butter border border-border" />
        </div>
      </div>
    </main>
  );
}
