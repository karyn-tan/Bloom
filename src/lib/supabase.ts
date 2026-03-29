import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseEnv } from '@/lib/config';

/**
 * Cookie handler interface
 */
interface CookieHandler {
  getAll: () => { name: string; value: string }[];
  setAll: (
    cookies: { name: string; value: string; options?: Record<string, unknown> }[],
  ) => void;
}

/**
 * Creates a cookie handler from a NextRequest
 * @param request - The NextRequest object
 * @returns CookieHandler implementation
 */
function createCookieHandler(request: NextRequest): CookieHandler {
  return {
    getAll: () => {
      const cookieHeader = request.headers.get('cookie') || '';
      if (!cookieHeader) return [];
      return cookieHeader.split(';').map((cookie) => {
        const [name, ...rest] = cookie.trim().split('=');
        return { name: name || '', value: rest.join('=') };
      });
    },
    setAll: () => {
      // Cookies are handled via response in route handlers
    },
  };
}

/**
 * Creates a cookie handler from a NextResponse
 * @param response - The NextResponse object
 * @returns CookieHandler implementation that sets cookies
 */
function createResponseCookieHandler(response: NextResponse): CookieHandler {
  return {
    getAll: () => [],
    setAll: (cookiesToSet) => {
      cookiesToSet.forEach(({ name, value, options }) => {
        const cookieValue = `${name}=${value}`;
        const cookieOptions = Object.entries(options || {})
          .map(([key, val]) => `${key}=${val}`)
          .join('; ');
        response.headers.append(
          'Set-Cookie',
          `${cookieValue}; ${cookieOptions}`,
        );
      });
    },
  };
}

/**
 * Creates a Supabase server client for use in API routes
 * @param request - The NextRequest object
 * @returns Supabase client instance
 */
export function createClient(request: NextRequest): ReturnType<
  typeof createServerClient
>;
/**
 * Creates a Supabase server client with response cookie handling
 * @param request - The NextRequest object
 * @param response - The NextResponse object
 * @returns Supabase client instance
 */
export function createClient(
  request: NextRequest,
  response: NextResponse,
): ReturnType<typeof createServerClient>;
export function createClient(
  request: NextRequest,
  response?: NextResponse,
): ReturnType<typeof createServerClient> {
  const env = getSupabaseEnv();

  const cookieHandler = response
    ? {
        getAll: () => createCookieHandler(request).getAll(),
        setAll: (cookies: { name: string; value: string; options?: Record<string, unknown> }[]) =>
          createResponseCookieHandler(response).setAll(cookies),
      }
    : createCookieHandler(request);

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: cookieHandler },
  );
}

/**
 * Gets the authenticated user ID from the session
 * @param request - The NextRequest object
 * @returns The user ID or null if not authenticated
 */
export async function getAuthenticatedUserId(
  request: NextRequest,
): Promise<string | null> {
  try {
    const supabase = createClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}