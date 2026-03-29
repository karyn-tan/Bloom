import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

const mockResetPasswordForEmail = vi.fn();

vi.mock('@/lib/supabase', () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  }),
}));

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 400 for missing email', async () => {
    const request = new Request('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  it('returns 400 for invalid email format', async () => {
    const request = new Request('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'not-an-email' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Invalid email format');
  });

  it('returns 200 on success', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ data: {}, error: null });

    const request = new Request('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.message).toBeDefined();
  });

  it('returns 200 even when email does not exist (prevents user enumeration)', async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      data: {},
      error: { message: 'User not found' },
    });

    const request = new Request('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'unknown@example.com' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('returns 500 for unexpected errors', async () => {
    mockResetPasswordForEmail.mockRejectedValue(new Error('Network error'));

    const request = new Request('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});
