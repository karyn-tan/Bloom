import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface ReminderEmailPayload {
  to: string;
  bouquetName: string;
  bouquetId: string;
  userId: string;
}

interface DatabaseReminder {
  id: string;
  user_id: string;
  bouquet_id: string;
  next_send_at: string;
  bouquets: {
    name: string;
    users: {
      email: string;
    };
  };
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is required');
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase environment variables are required');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sendReminderEmail(payload: ReminderEmailPayload): Promise<void> {
  const appUrl =
    Deno.env.get('NEXT_PUBLIC_APP_URL') || 'https://bloom-app.vercel.app';
  const bouquetLink = `${appUrl}/bouquet/${payload.bouquetId}`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Bloom <reminders@bloom-app.com>',
      to: payload.to,
      subject: `Time to care for your ${payload.bouquetName} bouquet!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #FF6B6B;">🌸 Your flowers need some love!</h1>
          <p>It's time to care for your <strong>${payload.bouquetName}</strong> bouquet.</p>
          <p>Here's what to do today:</p>
          <ul>
            <li>💧 Change the water</li>
            <li>✂️ Trim the stems at a 45° angle</li>
            <li>🧹 Remove any wilted petals or leaves</li>
          </ul>
          <p>
            <a href="${bouquetLink}" style="display: inline-block; background: #4ECDC4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              View your bouquet
            </a>
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            You're receiving this because you opted in to care reminders for this bouquet.
          </p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }
}

async function updateReminderSchedule(reminderId: string): Promise<void> {
  const nextSendAt = new Date();
  nextSendAt.setDate(nextSendAt.getDate() + 2);

  const { error } = await supabase
    .from('reminders')
    .update({ next_send_at: nextSendAt.toISOString() })
    .eq('id', reminderId);

  if (error) {
    throw new Error(`Failed to update reminder schedule: ${error.message}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { reminderId } = (await req.json()) as { reminderId: string };

    if (!reminderId) {
      return new Response(JSON.stringify({ error: 'reminderId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: reminder, error: fetchError } = (await supabase
      .from('reminders')
      .select(
        `
        id,
        user_id,
        bouquet_id,
        next_send_at,
        bouquets!inner(
          name,
          users!inner(
            email
          )
        )
      `,
      )
      .eq('id', reminderId)
      .single()) as { data: DatabaseReminder | null; error: Error | null };

    if (fetchError || !reminder) {
      return new Response(JSON.stringify({ error: 'Reminder not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    const nextSendAt = new Date(reminder.next_send_at);

    if (now < nextSendAt) {
      return new Response(
        JSON.stringify({
          message: 'Reminder is not due yet',
          nextSendAt: reminder.next_send_at,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    await sendReminderEmail({
      to: reminder.bouquets.users.email,
      bouquetName: reminder.bouquets.name,
      bouquetId: reminder.bouquet_id,
      userId: reminder.user_id,
    });

    await updateReminderSchedule(reminder.id);

    return new Response(
      JSON.stringify({
        message: 'Reminder email sent successfully',
        nextReminder: new Date(
          Date.now() + 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error processing reminder:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
});
