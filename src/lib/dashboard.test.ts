import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase-server', () => ({
  createServerComponentClient: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

import { getUserDashboardState } from './dashboard';
import { createServerComponentClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

const mockGetUser = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

function setupMock(
  countValue: number,
  scansData: unknown[] = [],
) {
  let callCount = 0;

  function createChain(finalValue: unknown) {
    const chain: Record<string, unknown> = {};
    const handler = () => new Proxy(chain, { get: (_t, p) => {
      if (p === 'then') return (resolve: (v: unknown) => void) => resolve(finalValue);
      return handler;
    }});
    return new Proxy(chain, { get: (_t, p) => {
      if (p === 'then') return (resolve: (v: unknown) => void) => resolve(finalValue);
      return handler;
    }});
  }

  const mockFrom = vi.fn().mockImplementation(() => {
    callCount++;
    if (callCount === 1) {
      // First call: count query
      return createChain({ count: countValue, error: null });
    }
    // Second call: fetch scans
    return createChain({ data: scansData, error: null });
  });

  vi.mocked(createServerComponentClient).mockReturnValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
    storage: {
      from: () => ({
        createSignedUrl: vi
          .fn()
          .mockResolvedValue({
            data: { signedUrl: 'https://signed.url/image.jpg' },
          }),
      }),
    },
  } as unknown as ReturnType<typeof createServerComponentClient>);
}

describe('getUserDashboardState', () => {
  it('returns isNewUser true when user has 0 scans', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          user_metadata: {},
        },
      },
    });
    setupMock(0);

    const state = await getUserDashboardState();

    expect(state.isNewUser).toBe(true);
    expect(state.scanCount).toBe(0);
    expect(state.user.email).toBe('test@example.com');
    expect(state.scans).toEqual([]);
  });

  it('returns isNewUser false with scans when user has scans', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          user_metadata: {},
        },
      },
    });
    setupMock(1, [
      {
        id: 'scan-1',
        image_url: 'user-123/scan-1.jpg',
        flowers: [
          {
            common_name: 'Rose',
            scientific_name: 'Rosa gallica',
            confidence: 0.85,
            care: { lifespan_days: { min: 7, max: 12 } },
          },
        ],
        created_at: '2026-04-06T00:00:00Z',
      },
    ]);

    const state = await getUserDashboardState();

    expect(state.isNewUser).toBe(false);
    expect(state.scanCount).toBe(1);
    expect(state.scans).toHaveLength(1);
    expect(state.scans[0].flowerName).toBe('Rose');
  });

  it('returns Google avatar URL from user_metadata', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          user_metadata: {
            avatar_url: 'https://lh3.googleusercontent.com/photo.jpg',
          },
        },
      },
    });
    setupMock(0);

    const state = await getUserDashboardState();

    expect(state.user.avatarUrl).toBe(
      'https://lh3.googleusercontent.com/photo.jpg',
    );
  });

  it('redirects to /login when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });
    setupMock(0);

    await expect(getUserDashboardState()).rejects.toThrow('NEXT_REDIRECT');

    expect(redirect).toHaveBeenCalledWith('/login');
  });
});
