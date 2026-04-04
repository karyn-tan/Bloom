import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GoogleSignInButton } from './GoogleSignInButton';

// Mock the browser supabase client
const mockSignInWithOAuth = vi.fn();

vi.mock('@/lib/supabase-browser', () => ({
  createBrowserSupabaseClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

describe('GoogleSignInButton', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });
  });

  it('renders Continue with Google button', () => {
    render(<GoogleSignInButton />);
    expect(
      screen.getByRole('button', { name: /continue with google/i }),
    ).toBeInTheDocument();
  });

  it('calls supabase.auth.signInWithOAuth with provider google on click', async () => {
    render(<GoogleSignInButton />);

    const button = screen.getByRole('button', {
      name: /continue with google/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'google' }),
      );
    });
  });

  it('passes correct redirectTo URL to signInWithOAuth', async () => {
    render(<GoogleSignInButton />);

    const button = screen.getByRole('button', {
      name: /continue with google/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            redirectTo: expect.stringContaining('/api/auth/callback'),
          }),
        }),
      );
    });
  });

  it('disables the button while OAuth is initiating', async () => {
    // Make OAuth call hang so we can check loading state
    mockSignInWithOAuth.mockImplementation(
      () => new Promise(() => {}), // never resolves
    );

    render(<GoogleSignInButton />);

    const button = screen.getByRole('button', {
      name: /continue with google/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });
});
