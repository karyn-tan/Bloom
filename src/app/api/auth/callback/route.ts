import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * GET handler for OAuth callback
 * Exchanges the OAuth code for a session and redirects to the dashboard
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=auth', request.url), {
      status: 307,
    });
  }

  // Support ?next= for password reset flow (redirects to /reset-password after exchange)
  const next = searchParams.get('next') ?? '/dashboard';
  const response = NextResponse.redirect(new URL(next, request.url), {
    status: 307,
  });

  // Use the two-argument overload so session cookies are written to the response
  const supabase = createClient(request, response);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/login?error=auth', request.url), {
      status: 307,
    });
  }

  return response;
}
