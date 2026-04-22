'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';

type ProfileDropdownProps = {
  email: string;
  avatarUrl: string | null;
};

function getAvatarSrc(email: string, avatarUrl: string | null): string {
  if (avatarUrl) return avatarUrl;
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(email)}`;
}

/**
 * ProfileDropdown — avatar button with dropdown menu for logout
 */
export function ProfileDropdown({ email, avatarUrl }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-label="Profile"
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full border-2 border-border overflow-hidden shadow-[2px_2px_0px_var(--color-border)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
      >
        <img
          src={getAvatarSrc(email, avatarUrl)}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-surface border-2 border-border shadow-[4px_4px_0px_var(--color-border)] rounded-[4px] z-50">
          <div className="px-4 py-3 border-b-2 border-border">
            <p className="text-sm font-bold text-ink truncate">{email}</p>
          </div>
          <div className="p-2">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm font-bold text-accent-red hover:bg-bg rounded-[4px] transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
