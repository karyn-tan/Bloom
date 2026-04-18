import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { ratelimit } from '@/lib/ratelimit';
import { z } from 'zod';

const ScheduleReminderSchema = z.object({
  bouquetId: z.string().uuid(),
});

/**
 * POST /api/reminders - Schedule a reminder for a bouquet
 * Creates a reminder schedule that triggers email notifications every 2 days
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { success } = await ratelimit.limit(user.id);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before trying again.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = ScheduleReminderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request: bouquetId is required' },
        { status: 400 },
      );
    }

    const { bouquetId } = parsed.data;

    const { data: bouquet, error: bouquetError } = await supabase
      .from('bouquets')
      .select('id, name, user_id, reminder_opt_in')
      .eq('id', bouquetId)
      .eq('user_id', user.id)
      .single();

    if (bouquetError || !bouquet) {
      return NextResponse.json({ error: 'Bouquet not found' }, { status: 404 });
    }

    if (!bouquet.reminder_opt_in) {
      return NextResponse.json(
        { error: 'Reminders not opted in for this bouquet' },
        { status: 400 },
      );
    }

    const existingReminder = await supabase
      .from('reminders')
      .select('id')
      .eq('bouquet_id', bouquetId)
      .eq('user_id', user.id)
      .single();

    if (existingReminder.data) {
      return NextResponse.json(
        {
          message: 'Reminder already scheduled',
          reminderId: existingReminder.data.id,
        },
        { status: 200 },
      );
    }

    const nextSendAt = new Date();
    nextSendAt.setDate(nextSendAt.getDate() + 2);

    const { data: reminder, error: insertError } = await supabase
      .from('reminders')
      .insert({
        user_id: user.id,
        bouquet_id: bouquetId,
        next_send_at: nextSendAt.toISOString(),
      })
      .select('id, next_send_at')
      .single();

    if (insertError) {
      console.error('Failed to create reminder:', insertError);
      return NextResponse.json(
        { error: 'Failed to schedule reminder' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: 'Reminder scheduled successfully',
        reminderId: reminder.id,
        nextSendAt: reminder.next_send_at,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/reminders - Cancel reminders for a bouquet
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bouquetId = searchParams.get('bouquetId');

    if (!bouquetId) {
      return NextResponse.json(
        { error: 'bouquetId is required' },
        { status: 400 },
      );
    }

    const { error: deleteError } = await supabase
      .from('reminders')
      .delete()
      .eq('bouquet_id', bouquetId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Failed to cancel reminder:', deleteError);
      return NextResponse.json(
        { error: 'Failed to cancel reminder' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: 'Reminder cancelled successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error cancelling reminder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
