import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const {
  mockGetAuthenticatedUserId,
  mockCheckRateLimit,
  mockGenerateCareTip,
  mockScanSingle,
  mockScanUpdate,
} = vi.hoisted(() => ({
  mockGetAuthenticatedUserId: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockGenerateCareTip: vi.fn(),
  mockScanSingle: vi.fn(),
  mockScanUpdate: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  getAuthenticatedUserId: mockGetAuthenticatedUserId,
  createClient: vi.fn(() => ({
    from: () => ({
      select: () => ({
        eq: () => ({ eq: () => ({ single: mockScanSingle }) }),
      }),
      update: () => ({
        eq: () => ({ eq: mockScanUpdate }),
      }),
    }),
  })),
}));

vi.mock('@/lib/ratelimit', () => ({
  checkRateLimit: mockCheckRateLimit,
}));

vi.mock('@/lib/gemini', () => ({
  generateCareTip: mockGenerateCareTip,
}));

import { POST } from './route';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/care', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

const validBody = {
  scan_id: VALID_UUID,
  scientific_name: 'Helianthus annuus',
  common_name: 'Sunflower',
};

describe('POST /api/care', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue(null);
    mockScanUpdate.mockResolvedValue({ error: null });
    mockGenerateCareTip.mockResolvedValue({
      water: 'Change daily',
      light: 'Full sun',
      temperature: '65-75°F',
      trim: 'Cut stems at angle',
    });
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue(null);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(401);
  });

  it('returns 429 when rate limited', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    const rateLimitRes = new Response(
      JSON.stringify({ error: 'Too many requests' }),
      { status: 429 },
    );
    mockCheckRateLimit.mockResolvedValue(rateLimitRes);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(429);
  });

  it('returns 400 for invalid body', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    const res = await POST(makeRequest({ scan_id: 'not-a-uuid' }));
    expect(res.status).toBe(400);
  });

  it('returns 404 when scan not found', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    mockScanSingle.mockResolvedValue({
      data: null,
      error: { message: 'not found' },
    });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(404);
  });

  it('returns 404 when flower not found in scan', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    mockScanSingle.mockResolvedValue({
      data: {
        flowers: [
          {
            scientific_name: 'Rosa',
            common_name: 'Rose',
            confidence: 0.9,
            care: null,
          },
        ],
      },
      error: null,
    });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(404);
  });

  it('returns cached care when already generated', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    const cachedCare = {
      water: 'Cached',
      light: 'Cached',
      temperature: 'Cached',
      trim: 'Cached',
    };
    mockScanSingle.mockResolvedValue({
      data: {
        flowers: [
          {
            scientific_name: 'Helianthus annuus',
            common_name: 'Sunflower',
            confidence: 0.9,
            care: cachedCare,
          },
        ],
      },
      error: null,
    });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.care).toEqual(cachedCare);
    expect(mockGenerateCareTip).not.toHaveBeenCalled();
  });

  it('generates and returns care tip when not cached', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    mockScanSingle.mockResolvedValue({
      data: {
        flowers: [
          {
            scientific_name: 'Helianthus annuus',
            common_name: 'Sunflower',
            confidence: 0.9,
            care: null,
          },
        ],
      },
      error: null,
    });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.care.water).toBe('Change daily');
    expect(mockGenerateCareTip).toHaveBeenCalledWith(
      'Helianthus annuus',
      'Sunflower',
    );
  });

  it('returns 502 when Gemini fails', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    mockScanSingle.mockResolvedValue({
      data: {
        flowers: [
          {
            scientific_name: 'Helianthus annuus',
            common_name: 'Sunflower',
            confidence: 0.9,
            care: null,
          },
        ],
      },
      error: null,
    });
    mockGenerateCareTip.mockRejectedValue(new Error('Gemini down'));
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(502);
  });

  it('still returns care tip when DB cache update fails', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    mockScanSingle.mockResolvedValue({
      data: {
        flowers: [
          {
            scientific_name: 'Helianthus annuus',
            common_name: 'Sunflower',
            confidence: 0.9,
            care: null,
          },
        ],
      },
      error: null,
    });
    mockScanUpdate.mockResolvedValue({ error: { message: 'db error' } });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.care).toBeDefined();
  });
});
