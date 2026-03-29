import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/supabase';

/**
 * Paths that are accessible without authentication.
 * All other paths require a valid session.
 */
const PUBLIC_PATHS = [
  '/', // root landing page
  '/login', // email/password login
  '/signup', // new account registration
  '/forgot-password', // request password reset email
  '/reset-password', // set new password after clicking reset link
  '/api/auth/login', // login API
  '/api/auth/signup', // signup API
  '/api/auth/callback', // OAuth callback
  '/api/auth/forgot-password', // forgot password API
  '/api/auth/reset-password', // reset password API
];

/**
 * Next.js middleware — protects all non-public routes.
 * Unauthenticated requests are redirected to /login with the
 * original path preserved in a `?next=` query parameter.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Allow public paths through without auth check
  // Root path uses exact match; all others use startsWith
  if (PUBLIC_PATHS.some((p) => (p === '/' ? pathname === '/' : pathname.startsWith(p)))) {
    return NextResponse.next();
  }

  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname + search);
    return NextResponse.redirect(loginUrl, { status: 307 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
