import Link from 'next/link';

interface AuthFooterProps {
  variant: 'login' | 'signup';
}

/**
 * AuthFooter component
 * Shows a link to login (for signup page) or signup (for login page)
 */
export function AuthFooter({ variant }: AuthFooterProps) {
  if (variant === 'signup') {
    return (
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-accent-teal">
          Sign in
        </Link>
      </p>
    );
  }

  return (
    <p className="mt-6 text-center text-sm text-muted">
      Don&apos;t have an account?{' '}
      <Link href="/signup" className="font-medium text-accent-teal">
        Sign up
      </Link>
    </p>
  );
}
