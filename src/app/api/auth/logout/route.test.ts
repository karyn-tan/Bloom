import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock Supabase client
const mockSignOut = vi.fn();

vi.mock('@/lib/supabase', () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
    },
  }),
}));

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 200 on successful logout', async () => {
    mockSignOut.mockResolvedValue({ error: null });

    const request = new Request('http://localhost/api/auth/logout', {
      method: 'POST',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.message).toBe('Logged out successfully');
  });

  it('returns 500 when signOut fails', async () => {
    mockSignOut.mockResolvedValue({ error: { message: 'Session not found' } });

    const request = new Request('http://localhost/api/auth/logout', {
      method: 'POST',
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error).toBe('Failed to logout');
  });

  it('returns 500 for unexpected errors', async () => {
    mockSignOut.mockRejectedValue(new Error('Network error'));

    const request = new Request('http://localhost/api/auth/logout', {
      method: 'POST',
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error).toBe('An unexpected error occurred');
  });
});
