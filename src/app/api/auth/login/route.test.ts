import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import type { NextRequest } from 'next/server';

// Mock Supabase client
const mockSignInWithPassword = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  }),
}));

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 400 for invalid email format', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email', password: 'password123' }),
    }) as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Invalid email format');
  });

  it('returns 400 for password shorter than 8 characters', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com', password: 'short' }),
    }) as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Password must be at least 8 characters');
  });

  it('returns 401 for invalid credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'wrongpassword',
      }),
    }) as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.error).toBe('Invalid email or password');
  });

  it('returns 200 with user data on successful login', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      created_at: '2024-01-01T00:00:00Z',
    };

    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: mockUser,
        session: { access_token: 'mock-token', refresh_token: 'mock-refresh' },
      },
      error: null,
    });

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
      }),
    }) as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.user).toEqual(mockUser);
    expect(body.session).toBeDefined();
  });

  it('returns 500 for unexpected errors', async () => {
    mockSignInWithPassword.mockRejectedValue(new Error('Network error'));

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
      }),
    }) as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error).toBe('An unexpected error occurred');
  });
});
