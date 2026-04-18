import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockGetUserDashboardState = vi.fn();
const mockGetUserBouquets = vi.fn();

vi.mock('@/lib/dashboard', () => ({
  getUserDashboardState: mockGetUserDashboardState,
  getUserBouquets: mockGetUserBouquets,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/supabase-browser', () => ({
  createBrowserSupabaseClient: () => ({
    auth: { signOut: vi.fn() },
  }),
}));

import DashboardPage from './page';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DashboardPage', () => {
  it('renders onboarding when user has no scans', async () => {
    mockGetUserDashboardState.mockResolvedValue({
      isNewUser: true,
      scanCount: 0,
      user: { email: 'test@example.com', avatarUrl: null },
      scans: [],
    });
    mockGetUserBouquets.mockResolvedValue([]);

    const jsx = await DashboardPage();
    render(jsx);

    expect(screen.getByText(/welcome to bloom/i)).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /scan your first flower/i }),
    ).toBeTruthy();
  });

  it('renders scan grid when user has scans', async () => {
    mockGetUserDashboardState.mockResolvedValue({
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
    mockGetUserBouquets.mockResolvedValue([]);

    const jsx = await DashboardPage();
    render(jsx);

    expect(screen.getByText('Your Collection')).toBeTruthy();
    expect(screen.getByText('Rose')).toBeTruthy();
    expect(screen.getByRole('link', { name: /new scan/i })).toBeTruthy();
  });
});
