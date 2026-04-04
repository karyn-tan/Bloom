import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * POST handler for logout endpoint
 * Signs out the current user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(request);
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 },
    );
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
