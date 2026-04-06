import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }

  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(100, '60 s'),
    });
  }
  return ratelimit;
}

/**
 * Checks rate limit for the given user.
 * Returns null if allowed, or a 429 NextResponse if exceeded.
 * Skips rate limiting if Upstash is not configured (local dev).
 */
export async function checkRateLimit(
  userId: string,
): Promise<NextResponse | null> {
  const limiter = getRatelimit();
  if (!limiter) {
    return null;
  }

  const { success } = await limiter.limit(userId);

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
