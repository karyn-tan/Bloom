import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseEnv } from '@/lib/config';
import type { Database } from '@/types/supabase';

/**
 * Creates a Supabase server client for use in API routes
 * @param request - The NextRequest object
 * @returns Supabase client instance
 */
export function createClient(
  request: NextRequest,
): ReturnType<typeof createServerClient<Database>>;
/**
 * Creates a Supabase server client with response cookie handling
 * @param request - The NextRequest object
 * @param response - The NextResponse object
 * @returns Supabase client instance
 */
export function createClient(
  request: NextRequest,
  response: NextResponse,
): ReturnType<typeof createServerClient<Database>>;
export function createClient(
  request: NextRequest,
  response?: NextResponse,
): ReturnType<typeof createServerClient<Database>> {
  const env = getSupabaseEnv();

  const cookieHandler = response
    ? {
        getAll: () => request.cookies.getAll(),
        setAll: (
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[],
        ) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      }
    : {
        getAll: () => request.cookies.getAll(),
        setAll: () => {
          // Cookies are handled via response in route handlers
        },
      };

  return createServerClient<Database>(
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
