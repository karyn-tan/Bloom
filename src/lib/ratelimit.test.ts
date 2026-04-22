import { describe, it, expect, vi, beforeEach } from 'vitest';

// Set env vars before importing the module
process.env.UPSTASH_REDIS_REST_URL = 'https://fake.upstash.io';
process.env.UPSTASH_REDIS_REST_TOKEN = 'fake-token';

const mockLimit = vi.fn();

vi.mock('@upstash/ratelimit', () => {
  const MockRatelimit = vi.fn().mockImplementation(() => ({
    limit: mockLimit,
  })) as unknown as typeof import('@upstash/ratelimit').Ratelimit;
  (
    MockRatelimit as unknown as { slidingWindow: ReturnType<typeof vi.fn> }
  ).slidingWindow = vi.fn().mockReturnValue('sliding-window');
  return { Ratelimit: MockRatelimit };
});

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(),
}));

import { checkRateLimit } from './ratelimit';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('checkRateLimit', () => {
  it('returns null when rate limit is not exceeded', async () => {
    mockLimit.mockResolvedValue({ success: true });

    const result = await checkRateLimit('user-123');

    expect(result).toBeNull();
  });

  it('returns a 429 response when rate limit is exceeded', async () => {
    mockLimit.mockResolvedValue({ success: false });

    const result = await checkRateLimit('user-123');

    expect(result).not.toBeNull();
    expect(result!.status).toBe(429);
    expect(result!.headers.get('Retry-After')).toBe('60');

    const body = (await result!.json()) as { error: string };
    expect(body.error).toContain('Too many requests');
  });
});
