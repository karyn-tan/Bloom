import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * POST /api/reminders/trigger - Trigger due reminders
 * Called by a cron job or manually to process reminders that are due
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

    const { data: dueReminders, error: fetchError } = await supabase
      .from('reminders')
      .select('id, user_id, bouquet_id, next_send_at')
      .lte('next_send_at', new Date().toISOString())
      .eq('user_id', user.id);

    if (fetchError) {
      console.error('Failed to fetch due reminders:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch reminders' },
        { status: 500 },
      );
    }

    const results = [];
    const errors = [];

    for (const reminder of dueReminders || []) {
      try {
        const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email-reminder`;

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ reminderId: reminder.id }),
        });

        if (response.ok) {
          results.push({
            reminderId: reminder.id,
            status: 'sent',
          });
        } else {
          const errorText = await response.text();
          errors.push({
            reminderId: reminder.id,
            error: errorText,
          });
        }
      } catch (error) {
        errors.push({
          reminderId: reminder.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json(
      {
        processed: results.length + errors.length,
        sent: results.length,
        failed: errors.length,
        results,
        errors,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error triggering reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
