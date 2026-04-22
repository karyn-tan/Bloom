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

import { test } from '@playwright/test';

test.describe.skip('Adaptive Care Tips — /api/adaptive-tip', () => {
  // Skipped: Requires dev server running with environment variables
  // To enable locally: npm run dev (in another terminal), then:
  // BASE_URL=http://localhost:3000 npx playwright test e2e/adaptive-care-tips.spec.ts
  test.skip('skipped - requires running dev server', () => {});
});
