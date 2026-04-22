import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock dependencies BEFORE importing the component
vi.mock('@/lib/dashboard', () => ({
  getUserDashboardState: vi.fn(),
  getUserBouquets: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/supabase-browser', () => ({
  createBrowserSupabaseClient: () => ({
    auth: { signOut: vi.fn() },
  }),
}));

import { getUserDashboardState, getUserBouquets } from '@/lib/dashboard';
import DashboardPage from './page';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DashboardPage', () => {
  it('renders onboarding when user has no scans', async () => {
    vi.mocked(getUserDashboardState).mockResolvedValue({
      isNewUser: true,
      scanCount: 0,
      user: { email: 'test@example.com', avatarUrl: null },
      scans: [],
    });
    vi.mocked(getUserBouquets).mockResolvedValue([]);

    const jsx = await DashboardPage();
    render(jsx);

    // Check for empty dashboard state
    expect(
      screen.getByRole('link', { name: /scan your first flower/i }),
    ).toBeTruthy();
  });

  it('renders scan grid when user has scans', async () => {
    vi.mocked(getUserDashboardState).mockResolvedValue({
      isNewUser: false,
      scanCount: 1,
      user: { email: 'test@example.com', avatarUrl: null },
      scans: [
        {
          id: 'scan-1',
          imageUrl: null,
          flowerName: 'Rose',
          scientificName: 'Rosa gallica',
          lifespanMin: 7,
          lifespanMax: 12,
          createdAt: '2026-04-06T00:00:00Z',
        },
      ],
    });
    vi.mocked(getUserBouquets).mockResolvedValue([]);

    const jsx = await DashboardPage();
    render(jsx);

    // Just check the main elements exist
    expect(screen.getByText('Your Collection')).toBeTruthy();
    expect(screen.getByRole('link', { name: /new scan/i })).toBeTruthy();
  });
});
