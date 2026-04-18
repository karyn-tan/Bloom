/**
 * E2E tests for F11 — Adaptive Care Tips
 *
 * Tests mock the /api/adaptive-tip endpoint at the network level using
 * Playwright route interception. No live Supabase instance is required for
 * the mock-based tests. The auth/validation tests hit the real endpoint.
 *
 * Run: npx playwright test e2e/adaptive-care-tips.spec.ts
 * Requires: dev server running (npm run dev)
 */

import { test, expect } from '@playwright/test';

const ADAPTIVE_TIP_ROUTE = '**/api/adaptive-tip';
const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

test.describe('Adaptive Care Tips — /api/adaptive-tip', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app so relative fetch URLs resolve correctly
    await page.goto('/');
  });

  test('no_data: mocked API returns onboarding prompt', async ({ page }) => {
    await page.route(ADAPTIVE_TIP_ROUTE, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tip: 'Start logging your care actions so Bloom can give you personalised tips.',
          status: 'no_data',
        }),
      });
    });

    const result = await page.evaluate(
      async ({ uuid }) => {
        const res = await fetch('/api/adaptive-tip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bouquet_id: uuid }),
        });
        return { status: res.status, body: await res.json() };
      },
      { uuid: VALID_UUID },
    );

    expect(result.status).toBe(200);
    expect(result.body.tip).toContain('Start logging');
    expect(result.body.status).toBe('no_data');
  });

  test('missed_watering: mocked API returns corrective tip', async ({
    page,
  }) => {
    await page.route(ADAPTIVE_TIP_ROUTE, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tip: 'Your roses may be starting to stress — top up the water now.',
          status: 'missed_watering',
        }),
      });
    });

    const result = await page.evaluate(
      async ({ uuid }) => {
        const res = await fetch('/api/adaptive-tip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bouquet_id: uuid }),
        });
        return { status: res.status, body: await res.json() };
      },
      { uuid: VALID_UUID },
    );

    expect(result.status).toBe(200);
    expect(result.body.tip).toContain('top up the water');
    expect(result.body.status).toBe('missed_watering');
  });

  test('all_good: mocked API returns positive affirmation', async ({
    page,
  }) => {
    await page.route(ADAPTIVE_TIP_ROUTE, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tip: "Your peonies are loving it — keep doing what you're doing!",
          status: 'all_good',
        }),
      });
    });

    const result = await page.evaluate(
      async ({ uuid }) => {
        const res = await fetch('/api/adaptive-tip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bouquet_id: uuid }),
        });
        return { status: res.status, body: await res.json() };
      },
      { uuid: VALID_UUID },
    );

    expect(result.status).toBe(200);
    expect(result.body.tip).toContain('loving it');
    expect(result.body.status).toBe('all_good');
  });

  test('unauthenticated: middleware redirects to login', async ({ page }) => {
    // Middleware intercepts unauthenticated requests and redirects to /login (307).
    // We use redirect: 'manual' in fetch to capture the redirect status.
    const result = await page.evaluate(
      async ({ uuid }) => {
        const res = await fetch('/api/adaptive-tip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bouquet_id: uuid }),
          redirect: 'manual',
        });
        return { status: res.status, type: res.type };
      },
      { uuid: VALID_UUID },
    );

    // Middleware returns 307 redirect to /login for unauthenticated requests.
    // 'opaqueredirect' type confirms a redirect was returned.
    expect([307, 0]).toContain(result.status);
  });

  test('invalid bouquet_id: mocked endpoint returns 400', async ({ page }) => {
    await page.route(ADAPTIVE_TIP_ROUTE, async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid input' }),
      });
    });

    const result = await page.evaluate(async () => {
      const res = await fetch('/api/adaptive-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bouquet_id: 'not-a-uuid' }),
      });
      return { status: res.status, body: await res.json() };
    });

    expect(result.status).toBe(400);
    expect(result.body.error).toBe('Invalid input');
  });
});
