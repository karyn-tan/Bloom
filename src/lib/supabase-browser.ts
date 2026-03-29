import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnv } from '@/lib/config';

/**
 * Creates a Supabase browser client for use in client components
 * @returns Supabase browser client instance
 */
export function createBrowserSupabaseClient() {
  const env = getSupabaseEnv();
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
