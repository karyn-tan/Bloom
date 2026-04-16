import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockGetAuthenticatedUserId,
  mockCheckRateLimit,
  mockSingle,
  mockInsert,
} = vi.hoisted(() => ({
  mockGetAuthenticatedUserId: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockSingle: vi.fn(),
  mockInsert: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  getAuthenticatedUserId: mockGetAuthenticatedUserId,
  createClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === 'scans') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: mockSingle,
              }),
            }),
          }),
        };
      }
      return { insert: mockInsert };
    },
  })),
}));

vi.mock('@/lib/ratelimit', () => ({
  checkRateLimit: mockCheckRateLimit,
}));

import { POST } from './route';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/bouquets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/bouquets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue(null);
    mockGetAuthenticatedUserId.mockResolvedValue('user-abc');
  });

  it('should return 401 when user is not authenticated', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue(null);
    const response = await POST(
      makeRequest({ scan_id: VALID_UUID, name: 'Kitchen table' }),
    );
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('should return 429 when rate limit is exceeded', async () => {
    mockCheckRateLimit.mockResolvedValue(new Response(null, { status: 429 }));
    const response = await POST(
      makeRequest({ scan_id: VALID_UUID, name: 'Kitchen table' }),
    );
    expect(response.status).toBe(429);
  });

  it('should return 400 when scan_id is missing', async () => {
    const response = await POST(makeRequest({ name: 'Kitchen table' }));
    expect(response.status).toBe(400);
  });

  it('should return 400 when scan_id is not a valid UUID', async () => {
    const response = await POST(
      makeRequest({ scan_id: 'not-a-uuid', name: 'Kitchen table' }),
    );
    expect(response.status).toBe(400);
  });

  it('should return 400 when name is empty string', async () => {
    const response = await POST(makeRequest({ scan_id: VALID_UUID, name: '' }));
    expect(response.status).toBe(400);
  });

  it('should return 404 when scan does not belong to the user', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'not found' },
    });
    const response = await POST(
      makeRequest({ scan_id: VALID_UUID, name: 'Kitchen table' }),
    );
    expect(response.status).toBe(404);
  });

  it('should return 201 with bouquet data on success', async () => {
    mockSingle.mockResolvedValue({ data: { id: VALID_UUID }, error: null });
    mockInsert.mockResolvedValue({
      data: [
        {
          id: 'bouq-1',
          name: 'Kitchen table',
          scan_id: VALID_UUID,
          user_id: 'user-abc',
          added_at: '2026-04-16T00:00:00Z',
          reminder_opt_in: false,
        },
      ],
      error: null,
    });
    const response = await POST(
      makeRequest({ scan_id: VALID_UUID, name: 'Kitchen table' }),
    );
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.bouquet.id).toBe('bouq-1');
    expect(body.bouquet.name).toBe('Kitchen table');
  });

  it('should return 500 when DB insert fails', async () => {
    mockSingle.mockResolvedValue({ data: { id: VALID_UUID }, error: null });
    mockInsert.mockResolvedValue({
      data: null,
      error: { message: 'db error' },
    });
    const response = await POST(
      makeRequest({ scan_id: VALID_UUID, name: 'Kitchen table' }),
    );
    expect(response.status).toBe(500);
  });
});
