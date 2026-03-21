import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase';

/**
 * Login request body schema
 */
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * POST handler for login endpoint
 * Authenticates user with email and password
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      const errorMessage = result.error.errors[0]?.message || 'Invalid input';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { email, password } = result.data;

    // Create Supabase client and authenticate
    const supabase = createClient(request);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Handle authentication errors
    if (error || !data.user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    // Return user data and session on success
    return NextResponse.json(
      {
        user: data.user,
        session: data.session,
      },
      { status: 200 },
    );
  } catch (err) {
    // Handle unexpected errors
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}