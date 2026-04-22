import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const {
  mockGetAuthenticatedUserId,
  mockCheckRateLimit,
  mockBouquetSingle,
  mockCacheSelect,
  mockCareLogSelect,
  mockCacheUpsert,
  mockGenerateAdaptiveTip,
} = vi.hoisted(() => ({
  mockGetAuthenticatedUserId: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockBouquetSingle: vi.fn(),
  mockCacheSelect: vi.fn(),
  mockCareLogSelect: vi.fn(),
  mockCacheUpsert: vi.fn(),
  mockGenerateAdaptiveTip: vi.fn(),
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
      if (table === 'adaptive_tip_cache') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({ maybeSingle: mockCacheSelect }),
              }),
            }),
          }),
          upsert: () => ({ select: () => ({ single: mockCacheUpsert }) }),
        };
      }
      if (table === 'care_log') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                gte: () => ({ order: () => mockCareLogSelect() }),
              }),
            }),
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
  generateAdaptiveTip: mockGenerateAdaptiveTip,
}));

import { POST } from './route';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const BOUQUET_SCAN_ID = '660e8400-e29b-41d4-a716-446655440001';

const mockBouquet = {
  id: VALID_UUID,
  scan_id: BOUQUET_SCAN_ID,
  added_at: '2026-04-15T10:00:00Z',
  scans: {
    flowers: [
      {
        common_name: 'Rose',
        scientific_name: 'Rosa gallica',
        confidence: 0.9,
        care: {
          common_name: 'Rose',
          lifespan_days: { min: 7, max: 12 },
          care: {
            water: 'Change water every 2 days.',
            light: 'Indirect sunlight.',
            temperature: 'Room temperature.',
            trim: 'Trim every 3 days.',
          },
          fun_facts: ['Roses are beautiful.'],
        },
      },
    ],
  },
};

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/adaptive-tip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe('POST /api/adaptive-tip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue(null);
    mockGetAuthenticatedUserId.mockResolvedValue('user-abc');
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue(null);
    const response = await POST(makeRequest({ bouquet_id: VALID_UUID }));
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 429 when rate limit is exceeded', async () => {
    mockCheckRateLimit.mockResolvedValue(new Response(null, { status: 429 }));
    const response = await POST(makeRequest({ bouquet_id: VALID_UUID }));
    expect(response.status).toBe(429);
  });

  it('returns 400 when bouquet_id is missing', async () => {
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(400);
  });

  it('returns 400 when bouquet_id is not a valid UUID', async () => {
    const response = await POST(makeRequest({ bouquet_id: 'not-a-uuid' }));
    expect(response.status).toBe(400);
  });

  it('returns 404 when bouquet does not belong to the user (IDOR)', async () => {
    mockBouquetSingle.mockResolvedValue({
      data: null,
      error: { message: 'not found' },
    });
    const response = await POST(makeRequest({ bouquet_id: VALID_UUID }));
    expect(response.status).toBe(404);
  });

  it('returns cached tip without calling Gemini when cache exists for today', async () => {
    mockBouquetSingle.mockResolvedValue({ data: mockBouquet, error: null });
    mockCacheSelect.mockResolvedValue({
      data: { tip: 'Cached tip text here.', status: 'all_good' },
      error: null,
    });

    const response = await POST(makeRequest({ bouquet_id: VALID_UUID }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.tip).toBe('Cached tip text here.');
    expect(mockGenerateAdaptiveTip).not.toHaveBeenCalled();
  });

  it('returns onboarding prompt without calling Gemini when no care log entries', async () => {
    mockBouquetSingle.mockResolvedValue({ data: mockBouquet, error: null });
    mockCacheSelect.mockResolvedValue({ data: null, error: null });
    mockCareLogSelect.mockReturnValue({ data: [], error: null });

    const response = await POST(makeRequest({ bouquet_id: VALID_UUID }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.tip).toContain('Start logging');
    expect(body.status).toBe('no_data');
    expect(mockGenerateAdaptiveTip).not.toHaveBeenCalled();
  });

  it('calls Gemini and caches result when no cache exists and log has data', async () => {
    mockBouquetSingle.mockResolvedValue({ data: mockBouquet, error: null });
    mockCacheSelect.mockResolvedValue({ data: null, error: null });
    mockCareLogSelect.mockReturnValue({
      data: [
        { action: 'water', logged_at: '2026-04-17T10:00:00Z' },
        { action: 'trim', logged_at: '2026-04-17T10:00:00Z' },
      ],
      error: null,
    });
    mockGenerateAdaptiveTip.mockResolvedValue(
      'Your roses are looking great! Keep it up.',
    );
    mockCacheUpsert.mockResolvedValue({
      data: {
        tip: 'Your roses are looking great! Keep it up.',
        status: 'all_good',
      },
      error: null,
    });

    const response = await POST(makeRequest({ bouquet_id: VALID_UUID }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.tip).toBe('Your roses are looking great! Keep it up.');
    expect(mockGenerateAdaptiveTip).toHaveBeenCalledOnce();
  });

  it('returns 500 when Gemini call fails unexpectedly', async () => {
    mockBouquetSingle.mockResolvedValue({ data: mockBouquet, error: null });
    mockCacheSelect.mockResolvedValue({ data: null, error: null });
    mockCareLogSelect.mockReturnValue({
      data: [{ action: 'water', logged_at: '2026-04-17T10:00:00Z' }],
      error: null,
    });
    mockGenerateAdaptiveTip.mockRejectedValue(new Error('Gemini API error'));

    const response = await POST(makeRequest({ bouquet_id: VALID_UUID }));
    expect(response.status).toBe(500);
  });
});
