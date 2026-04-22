import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { GET } from './route';

// Mock Supabase client
const mockExchangeCodeForSession = vi.fn();

vi.mock('@/lib/supabase', () => ({
  createClient: () => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
  }),
}));

describe('GET /api/auth/callback', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('redirects to /dashboard on successful code exchange', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
      error: null,
    });

    const request = new Request(
      'http://localhost/api/auth/callback?code=valid-code',
    ) as unknown as NextRequest;

    const response = await GET(request);
    expect(response.status).toBe(307);

    const location = response.headers.get('location');
    expect(location).toContain('/dashboard');
  });

  it('redirects to /login?error=auth when code exchange fails', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Exchange failed' },
    });

    const request = new Request(
      'http://localhost/api/auth/callback?code=bad-code',
    ) as unknown as NextRequest;

    const response = await GET(request);
    expect(response.status).toBe(307);

    const location = response.headers.get('location');
    expect(location).toContain('/login');
    expect(location).toContain('error=auth');
  });

  it('redirects to /login?error=auth when code param is missing', async () => {
    const request = new Request(
      'http://localhost/api/auth/callback',
    ) as unknown as NextRequest;

    const response = await GET(request);
    expect(response.status).toBe(307);

    const location = response.headers.get('location');
    expect(location).toContain('/login');
    expect(location).toContain('error=auth');
  });
});
