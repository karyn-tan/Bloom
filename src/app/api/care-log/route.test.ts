import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const {
  mockGetAuthenticatedUserId,
  mockCheckRateLimit,
  mockBouquetSingle,
  mockInsert,
} = vi.hoisted(() => ({
  mockGetAuthenticatedUserId: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockBouquetSingle: vi.fn(),
  mockInsert: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  getAuthenticatedUserId: mockGetAuthenticatedUserId,
  createClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === 'bouquets') {
        return {
          select: () => ({
            eq: () => ({ eq: () => ({ single: mockBouquetSingle }) }),
          }),
        };
      }
      return {
        insert: () => ({ select: () => ({ single: mockInsert }) }),
      };
    },
  })),
}));

vi.mock('@/lib/ratelimit', () => ({
  checkRateLimit: mockCheckRateLimit,
}));

import { POST } from './route';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/care-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe('POST /api/care-log', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue(null);
    mockGetAuthenticatedUserId.mockResolvedValue('user-abc');
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue(null);
    const response = await POST(
      makeRequest({ bouquet_id: VALID_UUID, action: 'water' }),
    );
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 429 when rate limit is exceeded', async () => {
    mockCheckRateLimit.mockResolvedValue(new Response(null, { status: 429 }));
    const response = await POST(
      makeRequest({ bouquet_id: VALID_UUID, action: 'water' }),
    );
    expect(response.status).toBe(429);
  });

  it('returns 400 when bouquet_id is missing', async () => {
    const response = await POST(makeRequest({ action: 'water' }));
    expect(response.status).toBe(400);
  });

  it('returns 400 when bouquet_id is not a valid UUID', async () => {
    const response = await POST(
      makeRequest({ bouquet_id: 'not-a-uuid', action: 'water' }),
    );
    expect(response.status).toBe(400);
  });

  it('returns 400 when action is invalid (dance)', async () => {
    const response = await POST(
      makeRequest({ bouquet_id: VALID_UUID, action: 'dance' }),
    );
    expect(response.status).toBe(400);
  });

  it('returns 404 when bouquet does not belong to the user (IDOR)', async () => {
    mockBouquetSingle.mockResolvedValue({
      data: null,
      error: { message: 'not found' },
    });
    const response = await POST(
      makeRequest({ bouquet_id: VALID_UUID, action: 'water' }),
    );
    expect(response.status).toBe(404);
  });

  it('returns 201 with log on success with action=water', async () => {
    mockBouquetSingle.mockResolvedValue({
      data: { id: VALID_UUID },
      error: null,
    });
    mockInsert.mockResolvedValue({
      data: {
        id: 'log-1',
        bouquet_id: VALID_UUID,
        user_id: 'user-abc',
        action: 'water',
        logged_at: '2026-04-16T00:00:00Z',
      },
      error: null,
    });
    const response = await POST(
      makeRequest({ bouquet_id: VALID_UUID, action: 'water' }),
    );
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.log.action).toBe('water');
  });

  it('returns 201 with log on success with action=trim', async () => {
    mockBouquetSingle.mockResolvedValue({
      data: { id: VALID_UUID },
      error: null,
    });
    mockInsert.mockResolvedValue({
      data: {
        id: 'log-2',
        bouquet_id: VALID_UUID,
        user_id: 'user-abc',
        action: 'trim',
        logged_at: '2026-04-16T00:00:00Z',
      },
      error: null,
    });
    const response = await POST(
      makeRequest({ bouquet_id: VALID_UUID, action: 'trim' }),
    );
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.log.action).toBe('trim');
  });

  it('returns 500 when DB insert fails', async () => {
    mockBouquetSingle.mockResolvedValue({
      data: { id: VALID_UUID },
      error: null,
    });
    mockInsert.mockResolvedValue({
      data: null,
      error: { message: 'db error' },
    });
    const response = await POST(
      makeRequest({ bouquet_id: VALID_UUID, action: 'water' }),
    );
    expect(response.status).toBe(500);
  });
});
