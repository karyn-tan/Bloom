import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Navbar } from './Navbar';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/supabase-browser', () => ({
  createBrowserSupabaseClient: () => ({
    auth: { signOut: vi.fn() },
  }),
}));

const mockUser = { email: 'test@example.com', avatarUrl: null };

describe('Navbar', () => {
  it('renders the Bloom logo', () => {
    render(<Navbar user={mockUser} />);
    expect(screen.getByText('Bloom')).toBeTruthy();
  });

  it('renders the logo as a link to /dashboard', () => {
    render(<Navbar user={mockUser} />);
    const link = screen.getByRole('link', { name: /bloom/i });
    expect(link.getAttribute('href')).toBe('/dashboard');
  });

  it('renders the profile dropdown', () => {
    render(<Navbar user={mockUser} />);
    expect(
      screen.getByRole('button', { name: /profile/i }),
    ).toBeTruthy();
  });
});
