import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import { getUpstashEnv } from '@/lib/config';

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit {
  if (!ratelimit) {
    const env = getUpstashEnv();
    ratelimit = new Ratelimit({
      redis: new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(100, '60 s'),
    });
  }
  return ratelimit;
}

/**
 * Checks rate limit for the given user.
 * Returns null if allowed, or a 429 NextResponse if exceeded.
 */
export async function checkRateLimit(
  userId: string,
): Promise<NextResponse | null> {
  const { success } = await getRatelimit().limit(userId);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      {
        status: 429,
        headers: { 'Retry-After': '60' },
      },
    );
  }

  return null;
}
