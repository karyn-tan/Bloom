import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

/**
 * Creates a Supabase server client for use in API routes
 * Reads credentials from environment variables
 * @returns Supabase client instance
 */
export function createClient(request?: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // For server-side usage without cookie handling in API routes
  if (!request) {
    return createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    });
  }

  // With cookie handling for full server-side usage
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => {
        // Parse cookies from request headers
        const cookieHeader = request.headers.get('cookie') || '';
        return cookieHeader.split(';').map((cookie) => {
          const [name, value] = cookie.trim().split('=');
          return { name: name || '', value: value || '' };
        });
      },
      setAll: (cookiesToSet) => {
        // Cookies are handled via response in route handlers
      },
    },
  });
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