import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

const mockUpdateUser = vi.fn();

vi.mock('@/lib/supabase', () => ({
  createClient: () => ({
    auth: {
      updateUser: mockUpdateUser,
    },
  }),
}));

describe('POST /api/auth/reset-password', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 400 for missing password', async () => {
    const request = new Request('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('returns 400 for password shorter than 8 characters', async () => {
    const request = new Request('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ password: 'short' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Password must be at least 8 characters');
  });

  it('returns 200 on successful password update', async () => {
    mockUpdateUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const request = new Request('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ password: 'newpassword123' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.message).toBeDefined();
  });

  it('returns 401 when session is invalid or expired', async () => {
    mockUpdateUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid session' },
    });

    const request = new Request('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ password: 'newpassword123' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  it('returns 500 for unexpected errors', async () => {
    mockUpdateUser.mockRejectedValue(new Error('Network error'));

    const request = new Request('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ password: 'newpassword123' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});
