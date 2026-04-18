import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const {
  mockGetAuthenticatedUserId,
  mockCheckRateLimit,
  mockIdentifyFlowers,
  mockGenerateCareTip,
  mockAssessFreshness,
  mockUpload,
  mockRemove,
  mockScanInsert,
  mockBouquetInsert,
  mockScanUpdateFn,
  mockScanSelectSingle,
  mockBouquetUpdateFn,
} = vi.hoisted(() => ({
  mockGetAuthenticatedUserId: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockIdentifyFlowers: vi.fn(),
  mockGenerateCareTip: vi.fn(),
  mockAssessFreshness: vi.fn(),
  mockUpload: vi.fn(),
  mockRemove: vi.fn(),
  mockScanInsert: vi.fn(),
  mockBouquetInsert: vi.fn(),
  mockScanUpdateFn: vi.fn(),
  mockScanSelectSingle: vi.fn(),
  mockBouquetUpdateFn: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  getAuthenticatedUserId: mockGetAuthenticatedUserId,
  createClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === 'scans') {
        return {
          insert: mockScanInsert,
          update: () => ({
            eq: () => ({ eq: mockScanUpdateFn }),
          }),
          select: () => ({
            eq: () => ({
              eq: () => ({
                returns: () => ({ single: mockScanSelectSingle }),
              }),
            }),
          }),
        };
      }
      if (table === 'bouquets') {
        return {
          insert: mockBouquetInsert,
          update: () => ({
            eq: () => ({ eq: mockBouquetUpdateFn }),
          }),
        };
      }
      return {};
    },
    storage: {
      from: () => ({
        upload: mockUpload,
        remove: mockRemove,
      }),
    },
  })),
}));

vi.mock('@/lib/ratelimit', () => ({
  checkRateLimit: mockCheckRateLimit,
}));

vi.mock('@/lib/plantnet', () => ({
  identifyFlowers: mockIdentifyFlowers,
}));

vi.mock('@/lib/gemini', () => ({
  generateCareTip: mockGenerateCareTip,
  assessFreshness: mockAssessFreshness,
}));

import { POST } from './route';

function makeFile(type = 'image/jpeg', size = 1024): Blob {
  const data = new Uint8Array(size);
  const blob = new Blob([data], { type });
  // jsdom Blob lacks arrayBuffer(); polyfill it for route code
  if (!blob.arrayBuffer) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (blob as unknown as Record<string, any>).arrayBuffer = () =>
      Promise.resolve(data.buffer);
  }
  return blob;
}

function makeRequest(
  formDataEntries: Record<string, Blob | string | null> = {},
) {
  const fakeFormData = {
    get: (key: string) => formDataEntries[key] ?? null,
  };
  const req = {
    formData: vi.fn().mockResolvedValue(fakeFormData),
  } as unknown as NextRequest;
  return req;
}

function makeValidRequest(
  overrides: { type?: string; size?: number; existingScanId?: string } = {},
) {
  const file = makeFile(overrides.type ?? 'image/jpeg', overrides.size ?? 1024);
  const entries: Record<string, Blob | string | null> = { image: file };
  if (overrides.existingScanId) {
    entries['existing_scan_id'] = overrides.existingScanId;
  }
  return makeRequest(entries);
}

describe('POST /api/identify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue(null);
    mockUpload.mockResolvedValue({ error: null });
    mockRemove.mockResolvedValue({ error: null });
    mockScanInsert.mockResolvedValue({ error: null });
    mockBouquetInsert.mockResolvedValue({ error: null });
    mockScanUpdateFn.mockResolvedValue({ error: null });
    mockBouquetUpdateFn.mockResolvedValue({ error: null });
    mockScanSelectSingle.mockResolvedValue({
      data: { image_url: 'old/path.jpg' },
    });
    mockIdentifyFlowers.mockResolvedValue([
      {
        scientific_name: 'Helianthus annuus',
        common_name: 'Sunflower',
        confidence: 0.95,
      },
    ]);
    mockGenerateCareTip.mockResolvedValue({
      water: 'Change daily',
      light: 'Full sun',
      temperature: '65-75°F',
      trim: 'Cut stems at angle',
    });
    mockAssessFreshness.mockResolvedValue(4);
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue(null);
    const res = await POST(makeValidRequest());
    expect(res.status).toBe(401);
  });

  it('returns 429 when rate limited', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    const rateLimitRes = new Response(
      JSON.stringify({ error: 'Too many requests' }),
      { status: 429 },
    );
    mockCheckRateLimit.mockResolvedValue(rateLimitRes);
    const res = await POST(makeValidRequest());
    expect(res.status).toBe(429);
  });

  it('returns 400 for invalid form data', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    const req = {
      formData: vi.fn().mockRejectedValue(new Error('bad')),
    } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid form data');
  });

  it('returns 400 when no image provided', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('No image provided');
  });

  it('returns 400 for invalid file type', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    const res = await POST(makeValidRequest({ type: 'image/gif' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Please upload a JPEG or PNG photo');
  });

  it('returns 400 for file over 10 MB', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    const res = await POST(makeValidRequest({ size: 11 * 1024 * 1024 }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Photo must be under 10 MB');
  });

  it('returns 500 when storage upload fails', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    mockUpload.mockResolvedValue({ error: { message: 'storage full' } });
    const res = await POST(makeValidRequest());
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Failed to upload image');
  });

  it('returns 502 when PlantNet fails and cleans up storage', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    mockIdentifyFlowers.mockRejectedValue(new Error('PlantNet down'));
    const res = await POST(makeValidRequest());
    expect(res.status).toBe(502);
    expect(mockRemove).toHaveBeenCalled();
  });

  it('returns 422 when PlantNet returns no results', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    mockIdentifyFlowers.mockResolvedValue([]);
    const res = await POST(makeValidRequest());
    expect(res.status).toBe(422);
    expect(mockRemove).toHaveBeenCalled();
  });

  it('returns scan_id and flowers on successful new scan', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    const res = await POST(makeValidRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.scan_id).toBeDefined();
    expect(body.flowers).toHaveLength(1);
    expect(body.flowers[0].common_name).toBe('Sunflower');
    expect(body.flowers[0].care).toBeDefined();
    expect(body.flowers[0].initial_droplets).toBe(4);
  });

  it('defaults initial_droplets to 5 when freshness assessment fails', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    mockAssessFreshness.mockRejectedValue(new Error('Gemini down'));
    const res = await POST(makeValidRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.flowers[0].initial_droplets).toBe(5);
  });

  it('still succeeds when Gemini care tip fails', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    mockGenerateCareTip.mockRejectedValue(new Error('Gemini error'));
    const res = await POST(makeValidRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.flowers[0].care).toBeNull();
  });

  it('returns 500 when scan insert fails and cleans up storage', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    mockScanInsert.mockResolvedValue({ error: { message: 'insert failed' } });
    const res = await POST(makeValidRequest());
    expect(res.status).toBe(500);
    expect(mockRemove).toHaveBeenCalled();
  });

  it('handles rescan by updating existing scan', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    const res = await POST(
      makeValidRequest({
        existingScanId: '550e8400-e29b-41d4-a716-446655440000',
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.scan_id).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('returns 500 when rescan update fails', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue('user-1');
    mockScanUpdateFn.mockResolvedValue({ error: { message: 'update failed' } });
    const res = await POST(
      makeValidRequest({
        existingScanId: '550e8400-e29b-41d4-a716-446655440000',
      }),
    );
    expect(res.status).toBe(500);
  });
});
