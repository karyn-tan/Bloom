import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseEnv } from '@/lib/config';
import type { Database } from '@/types/supabase';

/**
 * Creates a Supabase client for use in server components (pages, layouts).
 * Uses next/headers cookies() instead of NextRequest.
 */
export function createServerComponentClient() {
  const cookieStore = cookies();
  const env = getSupabaseEnv();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          // Server components are read-only; cookies cannot be set here
        },
      },
    },
  );
}
