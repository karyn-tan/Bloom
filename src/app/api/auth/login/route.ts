import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { credentialsSchema } from '@/lib/auth';

/**
 * Login request body schema
 */
const loginSchema = credentialsSchema;

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

    // Create a response object so the Supabase client can write session cookies
    const response = NextResponse.json({ ok: true }, { status: 200 });
    const supabase = createClient(request, response);
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

    // Re-build the response with user data — cookies have already been set on
    // the `response` object above by the Supabase client's setAll handler.
    const successResponse = NextResponse.json(
      { user: data.user, session: data.session },
      { status: 200 },
    );
    // Copy session cookies to the final response
    response.cookies.getAll().forEach(({ name, value, ...opts }) => {
      successResponse.cookies.set(name, value, opts);
    });
    return successResponse;
  } catch (err) {
    // Handle unexpected errors
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
