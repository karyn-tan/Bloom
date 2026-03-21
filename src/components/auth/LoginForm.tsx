'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '@/hooks/useForm';
import { validateEmail, validatePassword } from '@/lib/auth';

/**
 * Login form field types
 */
interface LoginFormData {
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

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } =
    useForm<LoginFormData>({
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

          // Success - redirect or call callback
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverError && (
        <div
          className="p-3 bg-red-100 text-red-700 rounded-md text-sm"
          role="alert"
        >
          {serverError}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
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
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-invalid={touched.email && !!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {touched.email && errors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
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
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-invalid={touched.password && !!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {touched.password && errors.password && (
          <p id="password-error" className="mt-1 text-sm text-red-600">
            {errors.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}