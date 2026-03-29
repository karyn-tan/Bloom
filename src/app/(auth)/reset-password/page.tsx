'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validatePassword } from '@/lib/auth';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = (value: string) => {
    if (!value) return 'Password is required';
    const result = validatePassword(value);
    if (!result.valid) return result.error ?? null;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordTouched(true);

    const error = validate(password);
    setPasswordError(error);
    if (error) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.error || 'Something went wrong');
        return;
      }

      router.push('/login');
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
            Set a new password
          </h1>
          <p className="mt-2 text-center text-sm text-muted">
            Choose a new password for your account
          </p>
        </div>

        <div className="bg-surface py-8 px-4 border-2 border-border shadow-[4px_4px_0px_var(--color-border)] sm:px-10">
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
                htmlFor="password"
                className="block text-sm font-medium text-ink"
              >
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordTouched) setPasswordError(validate(e.target.value));
                }}
                onBlur={() => {
                  setPasswordTouched(true);
                  setPasswordError(validate(password));
                }}
                disabled={isSubmitting}
                className="mt-1 block w-full px-3 py-2 border-2 border-border bg-surface text-ink disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent-teal"
                aria-describedby={passwordError ? 'password-error' : undefined}
              />
              {passwordTouched && passwordError && (
                <p id="password-error" className="mt-1 text-sm text-accent-red font-medium">
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border-2 border-border text-sm font-medium text-surface bg-accent-red shadow-[3px_3px_0px_var(--color-border)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-transform"
            >
              {isSubmitting ? 'Saving...' : 'Set new password'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
