'use client';

import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';

/**
 * LogoutButton — signs the user out and redirects to /login
 */
export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-sm font-bold text-muted border-2 border-border bg-surface px-4 py-2 shadow-[3px_3px_0px_var(--color-border)] rounded-[4px] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all"
    >
      Log Out
    </button>
  );
}
