import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { passwordSchema } from '@/lib/auth';

const resetPasswordSchema = passwordSchema;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = resetPasswordSchema.safeParse(body?.password);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }

    const supabase = createClient(request);
    const { data, error } = await supabase.auth.updateUser({
      password: result.data,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: 'Reset link is invalid or has expired' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 },
    );
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
