import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { POST } from './route';

// Mock Supabase client
const mockSignUp = vi.fn();

vi.mock('@/lib/supabase', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
    },
  }),
}));

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 400 for missing email', async () => {
    const request = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ password: 'password123' }),
    }) as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  it('returns 400 for invalid email format', async () => {
    const request = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email', password: 'password123' }),
    }) as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Invalid email format');
  });

  it('returns 400 for password shorter than 8 characters', async () => {
    const request = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com', password: 'short' }),
    }) as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Password must be at least 8 characters');
  });

  it('returns 409 when email is already registered', async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: { id: 'user-123', email: 'user@example.com', identities: [] },
        session: null,
      },
      error: null,
    });

    const request = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'password123',
      }),
    }) as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(409);

    const body = await response.json();
    expect(body.error).toBe('An account with this email already exists');
  });

  it('returns 201 with user data on successful signup', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      identities: [{ id: 'identity-1' }],
    };

    mockSignUp.mockResolvedValue({
      data: {
        user: mockUser,
        session: { access_token: 'mock-token', refresh_token: 'mock-refresh' },
      },
      error: null,
    });

    const request = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
      }),
    }) as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(201);

    const body = await response.json();
    expect(body.user).toEqual(mockUser);
    expect(body.session).toBeDefined();
  });

  it('returns 500 for unexpected errors', async () => {
    mockSignUp.mockRejectedValue(new Error('Network error'));

    const request = new Request('http://localhost/api/auth/signup', {
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
