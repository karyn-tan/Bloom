import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPasswordPage from './page';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

global.fetch = vi.fn();

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders a new password input and submit button', () => {
    render(<ResetPasswordPage />);
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /set new password/i }),
    ).toBeInTheDocument();
  });

  it('shows error for password shorter than 8 characters', async () => {
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: 'short' },
    });
    fireEvent.blur(screen.getByLabelText(/new password/i));
    fireEvent.click(screen.getByRole('button', { name: /set new password/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 8 characters/i),
      ).toBeInTheDocument();
    });
  });

  it('calls POST /api/auth/reset-password with new password', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Password updated' }),
    });
    global.fetch = mockFetch;

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /set new password/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/reset-password',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  it('redirects to /login on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Password updated' }),
    });

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /set new password/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('shows error on invalid or expired link', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () =>
        Promise.resolve({ error: 'Reset link is invalid or has expired' }),
    });

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /set new password/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/invalid or has expired/i),
      ).toBeInTheDocument();
    });
  });
});
