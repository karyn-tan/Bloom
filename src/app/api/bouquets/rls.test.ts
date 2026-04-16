/**
 * Integration test: RLS policies on the `bouquets` table.
 *
 * Uses the real Supabase project (not mocked). Requires:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY  (optional — cleanup of auth.users is skipped if absent)
 */
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;

const USER_A_EMAIL = 'rls-test-user-a@test.bloom';
const USER_B_EMAIL = 'rls-test-user-b@test.bloom';
const PASSWORD = 'TestPassword123!';

if (!SUPABASE_URL || !ANON_KEY) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment',
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function anonClient(): SupabaseClient {
  return createClient(SUPABASE_URL, ANON_KEY);
}

function serviceClient(): SupabaseClient | null {
  if (!SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Sign up a test user, returning their SupabaseClient (already signed in).
 * If the user already exists from a prior interrupted run, sign in instead.
 */
async function ensureUser(
  email: string,
  password: string,
): Promise<SupabaseClient> {
  const client = anonClient();
  const { error: signUpError } = await client.auth.signUp({ email, password });

  if (signUpError && !signUpError.message.includes('already registered')) {
    throw new Error(`signUp failed for ${email}: ${signUpError.message}`);
  }

  // Sign in to get a proper session (signUp alone may not yield a session
  // on projects that require email confirmation — but on test projects it does).
  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    throw new Error(`signIn failed for ${email}: ${signInError.message}`);
  }

  return client;
}

// ---------------------------------------------------------------------------
// State shared across tests
// ---------------------------------------------------------------------------
let clientA: SupabaseClient;
let clientB: SupabaseClient;
let userAId: string;
let scanId: string;
let bouquetId: string;

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
beforeAll(async () => {
  clientA = await ensureUser(USER_A_EMAIL, PASSWORD);
  clientB = await ensureUser(USER_B_EMAIL, PASSWORD);

  const {
    data: { user: userA },
  } = await clientA.auth.getUser();
  if (!userA) throw new Error('Could not retrieve User A after sign-in');
  userAId = userA.id;

  // Insert a scan row as User A (RLS: user_id = auth.uid() — allowed)
  const { data: scanData, error: scanError } = await clientA
    .from('scans')
    .insert({
      user_id: userAId,
      image_url: 'https://example.com/test-image.jpg',
      flowers: [],
    })
    .select('id')
    .single();

  if (scanError || !scanData) {
    throw new Error(`Failed to insert test scan: ${scanError?.message}`);
  }
  scanId = scanData.id;

  // Insert a bouquet row as User A
  const { data: bouquetData, error: bouquetError } = await clientA
    .from('bouquets')
    .insert({
      user_id: userAId,
      scan_id: scanId,
      name: 'RLS Test Bouquet',
    })
    .select('id')
    .single();

  if (bouquetError || !bouquetData) {
    throw new Error(`Failed to insert test bouquet: ${bouquetError?.message}`);
  }
  bouquetId = bouquetData.id;
}, 30_000);

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------
afterAll(async () => {
  // Delete the bouquet and scan as User A (RLS allows owner to delete)
  if (bouquetId) {
    await clientA.from('bouquets').delete().eq('id', bouquetId);
  }
  if (scanId) {
    await clientA.from('scans').delete().eq('id', scanId);
  }

  // Delete auth users — requires service role key
  const admin = serviceClient();
  if (admin) {
    const {
      data: { user: userA },
    } = await clientA.auth.getUser();
    const {
      data: { user: userB },
    } = await clientB.auth.getUser();

    if (userA) await admin.auth.admin.deleteUser(userA.id);
    if (userB) await admin.auth.admin.deleteUser(userB.id);
  } else {
    // Sign out so sessions are not left dangling; auth.users rows remain
    // but have no data attached (bouquet/scan were deleted above).
    await clientA.auth.signOut();
    await clientB.auth.signOut();
    console.warn(
      'SUPABASE_SERVICE_ROLE_KEY not set — auth.users rows for test accounts were NOT deleted.',
    );
  }
}, 30_000);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('bouquets RLS policies', () => {
  it('User A can read their own bouquet', async () => {
    const { data, error } = await clientA
      .from('bouquets')
      .select('*')
      .eq('id', bouquetId)
      .eq('user_id', userAId);

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].id).toBe(bouquetId);
  });

  it("User B cannot SELECT User A's bouquet — RLS returns empty result", async () => {
    const { data, error } = await clientB
      .from('bouquets')
      .select('*')
      .eq('id', bouquetId);

    // RLS silently filters the row — no error, just empty array
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it("User B cannot DELETE User A's bouquet — RLS blocks it", async () => {
    const { error } = await clientB
      .from('bouquets')
      .delete()
      .eq('id', bouquetId);

    // Supabase returns no error on a DELETE that matches 0 rows due to RLS —
    // the operation is silently a no-op from User B's perspective.
    expect(error).toBeNull();

    // Verify the bouquet still exists by reading it as User A
    const { data: stillThere } = await clientA
      .from('bouquets')
      .select('id')
      .eq('id', bouquetId)
      .single();

    expect(stillThere).not.toBeNull();
    expect(stillThere!.id).toBe(bouquetId);
  });

  it("User B cannot INSERT a bouquet with User A's user_id — RLS blocks it", async () => {
    const {
      data: { user: userB },
    } = await clientB.auth.getUser();
    expect(userB).not.toBeNull();

    // Attempt to spoof user_id as User A's ID
    const { error } = await clientB.from('bouquets').insert({
      user_id: userAId, // spoofed — not auth.uid() for User B
      scan_id: scanId,
      name: 'Spoofed bouquet',
    });

    // RLS WITH CHECK (auth.uid() = user_id) should reject this with a
    // policy violation (403-equivalent from PostgREST).
    expect(error).not.toBeNull();
  });

  it("User A can still read their bouquet after User B's failed DELETE", async () => {
    const { data, error } = await clientA
      .from('bouquets')
      .select('id, name')
      .eq('id', bouquetId)
      .single();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.name).toBe('RLS Test Bouquet');
  });
});
