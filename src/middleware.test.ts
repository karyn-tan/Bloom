import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Hoist mock before imports to avoid initialization order issues
const mockGetAuthenticatedUserId = vi.hoisted(() => vi.fn());

vi.mock('@/lib/supabase', () => ({
  getAuthenticatedUserId: mockGetAuthenticatedUserId,
}));

import { middleware } from './middleware';

function makeRequest(pathname: string, search = '') {
  return new NextRequest(`http://localhost${pathname}${search}`);
}

describe('middleware', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('allows unauthenticated access to /login', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue(null);

    const response = await middleware(makeRequest('/login'));
    expect(response.status).not.toBe(307);
    expect(response.headers.get('location')).toBeNull();
  });

  it('allows unauthenticated access to /signup', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue(null);

    const response = await middleware(makeRequest('/signup'));
    expect(response.status).not.toBe(307);
    expect(response.headers.get('location')).toBeNull();
  });

  it('allows unauthenticated access to /api/auth/login', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue(null);

    const response = await middleware(makeRequest('/api/auth/login'));
    expect(response.status).not.toBe(307);
    expect(response.headers.get('location')).toBeNull();
  });

  it('allows unauthenticated access to /api/auth/callback', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue(null);

    const response = await middleware(makeRequest('/api/auth/callback'));
    expect(response.status).not.toBe(307);
    expect(response.headers.get('location')).toBeNull();
  });

  it('redirects unauthenticated requests to /dashboard to /login?next=/dashboard', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue(null);

    const response = await middleware(makeRequest('/dashboard'));
    expect(response.status).toBe(307);

    const location = response.headers.get('location');
    expect(location).toContain('/login');
    expect(location).toContain('next=%2Fdashboard');
  });

  it('redirects unauthenticated requests to /scan to /login?next=/scan', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue(null);

    const response = await middleware(makeRequest('/scan'));
    expect(response.status).toBe(307);

    const location = response.headers.get('location');
    expect(location).toContain('/login');
    expect(location).toContain('next=%2Fscan');
  });

  it('preserves query string in the next param', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue(null);

    const response = await middleware(
      makeRequest('/dashboard', '?tab=history'),
    );
    expect(response.status).toBe(307);

    const location = response.headers.get('location');
    expect(location).toContain('next=');
    expect(location).toContain('tab');
  });

  it('allows authenticated requests to /dashboard through', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-123');

    const response = await middleware(makeRequest('/dashboard'));
    expect(response.status).not.toBe(307);
    expect(response.headers.get('location')).toBeNull();
  });

  it('allows authenticated requests to /scan through', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-123');

    const response = await middleware(makeRequest('/scan'));
    expect(response.status).not.toBe(307);
    expect(response.headers.get('location')).toBeNull();
  });
});
