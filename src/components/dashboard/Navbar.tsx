import Link from 'next/link';
import { ProfileDropdown } from './ProfileDropdown';
import type { DashboardUser } from '@/lib/dashboard';

type NavbarProps = {
  user: DashboardUser;
};

/**
 * Navbar — floating neo-brutalist bar with Bloom logo and profile dropdown
 */
export function Navbar({ user }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 px-6 py-4">
      <div className="max-w-4xl mx-auto bg-surface border-2 border-border shadow-[4px_4px_0px_var(--color-border)] rounded-[4px] px-5 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-extrabold text-ink tracking-tight hover:text-accent-red transition-colors">
          Bloom
        </Link>
        <ProfileDropdown email={user.email} avatarUrl={user.avatarUrl} />
      </div>
    </nav>
  );
}
