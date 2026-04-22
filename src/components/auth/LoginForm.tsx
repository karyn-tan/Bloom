'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from '@/hooks/useForm';
import { validateEmail, validatePassword } from '@/lib/auth';

/**
 * Login form field types
 */
interface LoginFormData extends Record<string, string> {
  email: string;
  password: string;
}

/**
 * Props for LoginForm component
 */
interface LoginFormProps {
  onSuccess?: () => void;
}

/**
 * Form field validators using shared validation functions
 */
const formValidators = {
  email: (email: string): string | undefined => {
    const isValid = validateEmail(email);
    if (!email) return 'Email is required';
    if (!isValid) return 'Invalid email format';
    return undefined;
  },
  password: (password: string): string | undefined => {
    const result = validatePassword(password);
    if (!password) return 'Password is required';
    if (!result.valid) return result.error;
    return undefined;
  },
};

/**
 * LoginForm component
 * Renders a login form with email and password fields
 */
export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm<LoginFormData>({
    initialValues: { email: '', password: '' },
    validators: formValidators,
    onSubmit: async (formData) => {
      setServerError(null);

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          setServerError(data.error || 'Login failed');
          return;
        }

        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/dashboard');
        }
      } catch {
        setServerError('An unexpected error occurred');
      }
    },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          className="block text-sm font-bold text-ink uppercase tracking-wide mb-1"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting}
          className="block w-full px-3 py-2.5 border-2 border-border bg-bg text-ink disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-accent-teal"
          aria-invalid={touched.email && !!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          placeholder="you@example.com"
        />
        {touched.email && errors.email && (
          <p
            id="email-error"
            className="mt-1 text-sm text-accent-red font-medium"
          >
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-bold text-ink uppercase tracking-wide mb-1"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting}
          className="block w-full px-3 py-2.5 border-2 border-border bg-bg text-ink disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-accent-teal"
          aria-invalid={touched.password && !!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
          placeholder="••••••••"
        />
        {touched.password && errors.password && (
          <p
            id="password-error"
            className="mt-1 text-sm text-accent-red font-medium"
          >
            {errors.password}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm font-bold text-accent-teal hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-3 px-4 border-2 border-border text-sm font-bold text-surface bg-accent-red shadow-[4px_4px_0px_var(--color-border)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
