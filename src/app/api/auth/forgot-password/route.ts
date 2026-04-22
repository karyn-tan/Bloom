import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      const errorMessage = result.error.errors[0]?.message || 'Invalid input';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { email } = result.data;
    const supabase = createClient(request);

    // Always return 200 regardless of whether the email exists
    // to prevent user enumeration attacks
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${request.headers.get('origin') ?? 'http://localhost:3000'}/api/auth/callback?next=/reset-password`,
    });

    return NextResponse.json(
      { message: 'If an account exists, a reset link has been sent' },
      { status: 200 },
    );
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
