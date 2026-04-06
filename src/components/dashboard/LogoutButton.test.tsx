import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogoutButton } from './LogoutButton';

const mockSignOut = vi.fn();

vi.mock('@/lib/supabase-browser', () => ({
  createBrowserSupabaseClient: () => ({
    auth: { signOut: mockSignOut },
  }),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LogoutButton', () => {
  it('renders a button with text "Log Out"', () => {
    render(<LogoutButton />);
    expect(
      screen.getByRole('button', { name: /log out/i }),
    ).toBeTruthy();
  });

  it('calls signOut and redirects to /login on click', async () => {
    mockSignOut.mockResolvedValue({ error: null });

    render(<LogoutButton />);
    fireEvent.click(screen.getByRole('button', { name: /log out/i }));

    await vi.waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });
});
