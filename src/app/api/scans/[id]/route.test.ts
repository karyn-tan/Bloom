import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const {
  mockGetAuthenticatedUserId,
  mockCheckRateLimit,
  mockGenerateCareTip,
  mockScanSingle,
  mockScanUpdate,
  mockBouquetUpdate,
} = vi.hoisted(() => ({
  mockGetAuthenticatedUserId: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockGenerateCareTip: vi.fn(),
  mockScanSingle: vi.fn(),
  mockScanUpdate: vi.fn(),
  mockBouquetUpdate: vi.fn(),
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
                returns: () => ({ single: mockScanSingle }),
              }),
            }),
          }),
          update: () => ({
            eq: () => ({ eq: mockScanUpdate }),
          }),
        };
      }
      if (table === 'bouquets') {
        return {
          update: () => ({
            eq: () => ({ eq: mockBouquetUpdate }),
          }),
        };
      }
      return {};
    },
  })),
}));

vi.mock('@/lib/ratelimit', () => ({
  checkRateLimit: mockCheckRateLimit,
}));

vi.mock('@/lib/gemini', () => ({
  generateCareTip: mockGenerateCareTip,
}));

import { PATCH } from './route';

const SCAN_ID = '550e8400-e29b-41d4-a716-446655440000';

function makeRequest(body: unknown) {
  return new Request(`http://localhost/api/scans/${SCAN_ID}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

const routeParams = { params: { id: SCAN_ID } };

describe('PATCH /api/scans/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue(null);
    mockScanSingle.mockResolvedValue({
      data: {
        id: SCAN_ID,
        flowers: [
          {
            common_name: 'Tulip',
            scientific_name: 'Tulipa',
            confidence: 0.9,
            care: null,
          },
        ],
      },
      error: null,
    });
    mockScanUpdate.mockResolvedValue({ error: null });
    mockBouquetUpdate.mockResolvedValue({ error: null });
    mockGenerateCareTip.mockResolvedValue({
      water: 'Daily',
      light: 'Bright',
      temperature: '60-70°F',
      trim: 'Weekly',
    });
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ common_name: 'Rose' }), routeParams);
    expect(res.status).toBe(401);
  });

  it('returns 429 when rate limited', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    const rateLimitRes = new Response(
      JSON.stringify({ error: 'Too many requests' }),
      { status: 429 },
    );
    mockCheckRateLimit.mockResolvedValue(rateLimitRes);
    const res = await PATCH(makeRequest({ common_name: 'Rose' }), routeParams);
    expect(res.status).toBe(429);
  });

  it('returns 400 for invalid JSON body', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    const req = new Request(`http://localhost/api/scans/${SCAN_ID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    }) as unknown as NextRequest;
    const res = await PATCH(req, routeParams);
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing common_name', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    const res = await PATCH(makeRequest({}), routeParams);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid input');
  });

  it('returns 404 when scan not found', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    mockScanSingle.mockResolvedValue({
      data: null,
      error: { message: 'not found' },
    });
    const res = await PATCH(makeRequest({ common_name: 'Rose' }), routeParams);
    expect(res.status).toBe(404);
  });

  it('returns updated flowers on success', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    const res = await PATCH(
      makeRequest({ common_name: 'Rose', scientific_name: 'Rosa' }),
      routeParams,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.flowers[0].common_name).toBe('Rose');
    expect(body.flowers[0].scientific_name).toBe('Rosa');
    expect(body.flowers[0].care).toBeDefined();
  });

  it('still returns flowers when Gemini care tip fails', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    mockGenerateCareTip.mockRejectedValue(new Error('Gemini down'));
    const res = await PATCH(makeRequest({ common_name: 'Rose' }), routeParams);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.flowers[0].care).toBeNull();
  });

  it('returns 500 when scan update fails', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    mockScanUpdate.mockResolvedValue({ error: { message: 'db error' } });
    const res = await PATCH(makeRequest({ common_name: 'Rose' }), routeParams);
    expect(res.status).toBe(500);
  });

  it('syncs bouquet name on correction', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    await PATCH(makeRequest({ common_name: 'Rose' }), routeParams);
    expect(mockBouquetUpdate).toHaveBeenCalled();
  });
});
