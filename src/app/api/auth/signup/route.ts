import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { credentialsSchema } from '@/lib/auth';

/**
 * Signup request body schema
 */
const signupSchema = credentialsSchema;

/**
 * POST handler for signup endpoint
 * Creates a new user account with email and password
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      const errorMessage = result.error.errors[0]?.message || 'Invalid input';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { email, password } = result.data;

    // Create Supabase client and sign up
    const supabase = createClient(request);
    const { data, error } = await supabase.auth.signUp({ email, password });

    // Handle Supabase errors
    if (error) {
      return NextResponse.json(
        { error: 'An unexpected error occurred' },
        { status: 500 },
      );
    }

    // Supabase returns a user with empty identities when email is already registered
    if (!data.user || data.user.identities?.length === 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { user: data.user, session: data.session },
      { status: 201 },
    );
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
