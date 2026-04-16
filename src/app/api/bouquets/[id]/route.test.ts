import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';

const mockGetAuthenticatedUserId = vi.fn();
const mockCheckRateLimit = vi.fn();
const mockBouquetSingle = vi.fn();
const mockScanSingle = vi.fn();
const mockDeleteEq = vi.fn();
const mockStorageRemove = vi.fn();

vi.mock('@/lib/supabase', () => ({
  getAuthenticatedUserId: mockGetAuthenticatedUserId,
  createClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === 'bouquets') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: mockBouquetSingle,
              }),
            }),
          }),
          delete: () => ({
            eq: () => ({
              eq: mockDeleteEq,
            }),
          }),
        };
      }
      // scans table
      return {
        select: () => ({
          eq: () => ({
            single: mockScanSingle,
          }),
        }),
      };
    },
    storage: {
      from: () => ({
        remove: mockStorageRemove,
      }),
    },
  })),
}));

vi.mock('@/lib/ratelimit', () => ({
  checkRateLimit: mockCheckRateLimit,
}));

function makeRequest() {
  return new Request('http://localhost/api/bouquets/bouq-1', {
    method: 'DELETE',
  });
}

describe('DELETE /api/bouquets/[id]', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockCheckRateLimit.mockResolvedValue(null);
    mockGetAuthenticatedUserId.mockResolvedValue('user-abc');
    mockBouquetSingle.mockResolvedValue({ data: { scan_id: 'scan-123' }, error: null });
    mockScanSingle.mockResolvedValue({ data: { image_url: 'user-abc/scan-123.jpg' }, error: null });
    mockDeleteEq.mockResolvedValue({ error: null });
    mockStorageRemove.mockResolvedValue({ error: null });
  });

  it('should return 401 when user is not authenticated', async () => {
    mockGetAuthenticatedUserId.mockResolvedValue(null);
    const response = await DELETE(makeRequest(), { params: { id: 'bouq-1' } });
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('should return 429 when rate limit is exceeded', async () => {
    mockCheckRateLimit.mockResolvedValue(new Response(null, { status: 429 }));
    const response = await DELETE(makeRequest(), { params: { id: 'bouq-1' } });
    expect(response.status).toBe(429);
  });

  it('should return 404 when bouquet does not belong to the user', async () => {
    mockBouquetSingle.mockResolvedValue({ data: null, error: { message: 'not found' } });
    const response = await DELETE(makeRequest(), { params: { id: 'bouq-1' } });
    expect(response.status).toBe(404);
  });

  it('should return 500 when scan lookup fails', async () => {
    mockScanSingle.mockResolvedValue({ data: null, error: { message: 'scan not found' } });
    const response = await DELETE(makeRequest(), { params: { id: 'bouq-1' } });
    expect(response.status).toBe(500);
  });

  it('should return 500 when bouquet delete fails', async () => {
    mockDeleteEq.mockResolvedValue({ error: { message: 'constraint violation' } });
    const response = await DELETE(makeRequest(), { params: { id: 'bouq-1' } });
    expect(response.status).toBe(500);
  });

  it('should return 200 with success:true on happy path', async () => {
    const response = await DELETE(makeRequest(), { params: { id: 'bouq-1' } });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it('should still return 200 when storage remove fails', async () => {
    mockStorageRemove.mockResolvedValue({ error: { message: 'storage error' } });
    const response = await DELETE(makeRequest(), { params: { id: 'bouq-1' } });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
