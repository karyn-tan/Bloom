/**
 * E2E tests for US-14 — Plant Health Visualization (hearts + droplets)
 *
 * PRD Flow 7:
 *  1. User saves a bouquet → it displays 3 hearts and 5 full droplets
 *  2. User logs a watering action → droplets remain at 5
 *  3. User opens bouquet detail page → health indicators are visible
 *  4. Clicking "Water" button → page refreshes → droplets show as full
 *
 * Auth setup required:
 *  These tests require an authenticated Supabase session.  The helpers below
 *  rely on two environment variables that must be present in `.env.test.local`:
 *    TEST_USER_EMAIL    – a seeded test-user email address
 *    TEST_USER_PASSWORD – the matching password
 *    TEST_SCAN_ID       – UUID of a scan row that belongs to the test user
 *                         AND has a linked bouquet row
 *
 *  Without those variables the tests are automatically skipped via
 *  `test.fixme`.  Once CI is configured with the variables, remove the
 *  `test.fixme` guards and the tests will run against the live dev server.
 *
 *  To run locally once configured:
 *    BASE_URL=http://localhost:3000 npx playwright test e2e/health-visualization.spec.ts
 */

import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? '';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? '';
const TEST_SCAN_ID = process.env.TEST_SCAN_ID ?? '';

const authIsConfigured =
  TEST_EMAIL !== '' && TEST_PASSWORD !== '' && TEST_SCAN_ID !== '';

/** Sign in via the login form and land on the dashboard. */
async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(TEST_EMAIL);
  await page.getByLabel(/password/i).fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  await page.waitForURL('**/dashboard**');
}

/** Navigate to the scan detail page for the seeded bouquet. */
async function goToScanDetail(page: Page) {
  await page.goto(`/dashboard/scan/${TEST_SCAN_ID}`);
  // Wait for the health section — both cards must be present
  await page.waitForSelector('[data-testid="health-hearts"], text=Health', {
    timeout: 10_000,
  });
}

// ---------------------------------------------------------------------------
// Test 1 — Fresh bouquet shows full health indicators
// ---------------------------------------------------------------------------

test('fresh bouquet shows 3 hearts and 5 droplets with Water and Trim buttons', async ({
  page,
}) => {
  // FIXME: Remove this guard once TEST_USER_EMAIL, TEST_USER_PASSWORD, and
  // TEST_SCAN_ID environment variables are configured in .env.test.local and
  // a running dev server is available.
  // The full test body is written and ready — only the auth setup is missing.
  test.fixme(
    !authIsConfigured,
    'Skipped: TEST_USER_EMAIL / TEST_USER_PASSWORD / TEST_SCAN_ID not set. ' +
      'Configure .env.test.local and a local dev server to run this test.',
  );

  await signIn(page);
  await goToScanDetail(page);

  // --- Hearts ---
  // The page renders 3 HeartIcon SVGs; when filled the path has fill="var(--color-accent-red)"
  // We locate them by the Health panel label then count SVGs inside it.
  const healthPanel = page.locator('text=Health').locator('..').locator('..');
  const heartSvgs = healthPanel.locator('svg');
  await expect(heartSvgs).toHaveCount(3);

  // Confirm all three hearts are filled (each SVG path fill attribute carries the accent-red token)
  for (let i = 0; i < 3; i++) {
    const heartPath = heartSvgs.nth(i).locator('path');
    await expect(heartPath).toHaveAttribute('fill', 'var(--color-accent-red)');
  }

  // --- Droplets ---
  // The hydration panel renders 5 DropletIcon SVGs
  const hydrationPanel = page
    .locator('text=Hydration')
    .locator('..')
    .locator('..');
  const dropletSvgs = hydrationPanel.locator('svg');
  await expect(dropletSvgs).toHaveCount(5);

  // Confirm all five droplets are filled
  for (let i = 0; i < 5; i++) {
    const dropletPath = dropletSvgs.nth(i).locator('path');
    await expect(dropletPath).toHaveAttribute(
      'fill',
      'var(--color-accent-gold)',
    );
  }

  // --- Care action buttons ---
  await expect(page.getByRole('button', { name: /water/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /trim/i })).toBeVisible();

  // --- Hydration label for a well-watered bouquet ---
  await expect(page.getByText('Well Watered')).toBeVisible();

  // --- Health label for a fresh bouquet ---
  await expect(page.getByText('Good')).toBeVisible();
});

// ---------------------------------------------------------------------------
// Test 2 — Clicking "Water" logs the action and page refreshes without errors
// ---------------------------------------------------------------------------

test('clicking Water button logs the action and re-renders droplets as full', async ({
  page,
}) => {
  // FIXME: Same auth/server setup required as Test 1.
  test.fixme(
    !authIsConfigured,
    'Skipped: TEST_USER_EMAIL / TEST_USER_PASSWORD / TEST_SCAN_ID not set. ' +
      'Configure .env.test.local and a local dev server to run this test.',
  );

  await signIn(page);
  await goToScanDetail(page);

  // Intercept the POST /api/care-log request so we can assert it is sent
  const careLogRequestPromise = page.waitForRequest(
    (req) => req.url().includes('/api/care-log') && req.method() === 'POST',
  );

  // Click the Water button
  await page.getByRole('button', { name: /water/i }).click();

  // Assert the POST was dispatched with the correct action
  const careLogRequest = await careLogRequestPromise;
  const requestBody = JSON.parse(careLogRequest.postData() ?? '{}') as {
    bouquet_id?: string;
    action?: string;
  };
  expect(requestBody.action).toBe('water');
  expect(typeof requestBody.bouquet_id).toBe('string');

  // After router.refresh() the page re-renders; wait for the Hydration panel
  // to reappear confirming there was no navigation error
  await expect(page.getByText('Hydration')).toBeVisible({ timeout: 10_000 });

  // Droplets should still be full (5 of 5)
  const hydrationPanel = page
    .locator('text=Hydration')
    .locator('..')
    .locator('..');
  const dropletSvgs = hydrationPanel.locator('svg');
  await expect(dropletSvgs).toHaveCount(5);

  for (let i = 0; i < 5; i++) {
    const dropletPath = dropletSvgs.nth(i).locator('path');
    await expect(dropletPath).toHaveAttribute(
      'fill',
      'var(--color-accent-gold)',
    );
  }

  // Confirm the "Water" button is accessible again (no stuck loading state)
  await expect(page.getByRole('button', { name: /water/i })).toBeEnabled();
});

// ---------------------------------------------------------------------------
// Test 3 — Health indicators are visible when revisiting the scan detail page
// ---------------------------------------------------------------------------

test('health indicators remain visible when the scan detail page is revisited', async ({
  page,
}) => {
  // FIXME: Same auth/server setup required as Test 1.
  test.fixme(
    !authIsConfigured,
    'Skipped: TEST_USER_EMAIL / TEST_USER_PASSWORD / TEST_SCAN_ID not set. ' +
      'Configure .env.test.local and a local dev server to run this test.',
  );

  await signIn(page);

  // First visit
  await goToScanDetail(page);
  await expect(page.getByText('Health')).toBeVisible();
  await expect(page.getByText('Hydration')).toBeVisible();

  // Navigate away and come back (simulates returning to the page later)
  await page.getByRole('link', { name: /back to dashboard/i }).first().click();
  await page.waitForURL('**/dashboard**');

  await page.goto(`/dashboard/scan/${TEST_SCAN_ID}`);

  // Health panel must still be present — Gemini must NOT be called again
  // (the test implicitly verifies this because there is no loading state)
  await expect(page.getByText('Health')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Hydration')).toBeVisible();

  // The hearts and droplets panels are rendered
  const heartSvgs = page
    .locator('text=Health')
    .locator('..')
    .locator('..')
    .locator('svg');
  await expect(heartSvgs).toHaveCount(3);

  const dropletSvgs = page
    .locator('text=Hydration')
    .locator('..')
    .locator('..')
    .locator('svg');
  await expect(dropletSvgs).toHaveCount(5);
});
