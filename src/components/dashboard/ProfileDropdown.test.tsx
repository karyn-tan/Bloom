import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileDropdown } from './ProfileDropdown';

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

describe('ProfileDropdown', () => {
  it('renders an avatar button', () => {
    render(<ProfileDropdown email="test@example.com" avatarUrl={null} />);
    expect(screen.getByRole('button', { name: /profile/i })).toBeTruthy();
  });

  it('shows Google avatar when avatarUrl is provided', () => {
    render(
      <ProfileDropdown
        email="test@example.com"
        avatarUrl="https://lh3.googleusercontent.com/photo.jpg"
      />,
    );
    const img = screen.getByAltText(/profile/i);
    expect(img.getAttribute('src')).toContain('googleusercontent.com');
  });

  it('shows DiceBear avatar when avatarUrl is null', () => {
    render(<ProfileDropdown email="test@example.com" avatarUrl={null} />);
    const img = screen.getByAltText(/profile/i);
    expect(img.getAttribute('src')).toContain('dicebear');
  });

  it('uses email as seed for DiceBear avatar', () => {
    render(<ProfileDropdown email="maya@example.com" avatarUrl={null} />);
    const img = screen.getByAltText(/profile/i);
    expect(img.getAttribute('src')).toContain('maya%40example.com');
  });

  it('shows dropdown with email and logout on click', () => {
    render(<ProfileDropdown email="test@example.com" avatarUrl={null} />);

    // Dropdown should not be visible initially
    expect(screen.queryByText('test@example.com')).toBeNull();

    // Click the avatar button
    fireEvent.click(screen.getByRole('button', { name: /profile/i }));

    // Dropdown should now be visible
    expect(screen.getByText('test@example.com')).toBeTruthy();
    expect(screen.getByRole('button', { name: /log out/i })).toBeTruthy();
  });

  it('closes dropdown when clicking avatar again', () => {
    render(<ProfileDropdown email="test@example.com" avatarUrl={null} />);

    const avatarButton = screen.getByRole('button', {
      name: /profile/i,
    });

    fireEvent.click(avatarButton);
    expect(screen.getByText('test@example.com')).toBeTruthy();

    fireEvent.click(avatarButton);
    expect(screen.queryByText('test@example.com')).toBeNull();
  });

  it('calls signOut and redirects on logout click', async () => {
    mockSignOut.mockResolvedValue({ error: null });

    render(<ProfileDropdown email="test@example.com" avatarUrl={null} />);

    fireEvent.click(screen.getByRole('button', { name: /profile/i }));
    fireEvent.click(screen.getByRole('button', { name: /log out/i }));

    await vi.waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });
});
