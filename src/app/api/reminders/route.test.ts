import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST, DELETE } from './route';
import { createClient } from '@/lib/supabase-server';
import { ratelimit } from '@/lib/ratelimit';

vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/ratelimit', () => ({
  ratelimit: {
    limit: vi.fn(),
  },
}));

describe('POST /api/reminders', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockBouquet = {
    id: 'bouquet-456',
    name: 'Kitchen Table',
    user_id: 'user-123',
    reminder_opt_in: true,
  };
  const mockReminder = {
    id: 'reminder-789',
    next_send_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  };

  let mockSupabase: {
    auth: { getUser: ReturnType<typeof vi.fn> };
    from: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.resetAllMocks();

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: vi.fn().mockReturnThis(),
    };

    mockSupabase.from = vi.fn().mockImplementation((table: string) => {
      const chainable = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
        insert: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
      };

      if (table === 'bouquets') {
        chainable.single = vi.fn().mockResolvedValue({
          data: mockBouquet,
          error: null,
        });
      } else if (table === 'reminders') {
        chainable.select = vi.fn().mockImplementation(() => ({
          eq: vi.fn().mockImplementation(() => ({
            eq: vi.fn().mockImplementation(() => ({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            })),
          })),
        }));

        chainable.insert = vi.fn().mockImplementation(() => ({
          select: vi.fn().mockImplementation(() => ({
            single: vi.fn().mockResolvedValue({
              data: mockReminder,
              error: null,
            }),
          })),
        }));
      }

      return chainable;
    });

    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase);
    (ratelimit.limit as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockSupabase.auth.getUser = vi
      .fn()
      .mockResolvedValue({ data: { user: null } });

    const request = new Request('http://localhost/api/reminders', {
      method: 'POST',
      body: JSON.stringify({ bouquetId: mockBouquet.id }),
    });

    const response = await POST(request as NextRequest);
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 429 when rate limit is exceeded', async () => {
    (ratelimit.limit as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
    });

    const request = new Request('http://localhost/api/reminders', {
      method: 'POST',
      body: JSON.stringify({ bouquetId: mockBouquet.id }),
    });

    const response = await POST(request as NextRequest);
    expect(response.status).toBe(429);

    const data = await response.json();
    expect(data.error).toContain('Too many requests');
  });

  it('returns 400 when bouquetId is missing', async () => {
    const request = new Request('http://localhost/api/reminders', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as NextRequest);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('bouquetId is required');
  });

  it('returns 400 when bouquetId is not a valid UUID', async () => {
    const request = new Request('http://localhost/api/reminders', {
      method: 'POST',
      body: JSON.stringify({ bouquetId: 'invalid-id' }),
    });

    const response = await POST(request as NextRequest);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('Invalid request');
  });

  it('creates a reminder successfully', async () => {
    const request = new Request('http://localhost/api/reminders', {
      method: 'POST',
      body: JSON.stringify({ bouquetId: mockBouquet.id }),
    });

    const response = await POST(request as NextRequest);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.message).toBe('Reminder scheduled successfully');
    expect(data.reminderId).toBe(mockReminder.id);
    expect(data.nextSendAt).toBe(mockReminder.next_send_at);
  });
});

describe('DELETE /api/reminders', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };

  let mockSupabase: {
    auth: { getUser: ReturnType<typeof vi.fn> };
    from: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.resetAllMocks();

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: vi.fn().mockImplementation(() => ({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      })),
    };

    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockSupabase.auth.getUser = vi
      .fn()
      .mockResolvedValue({ data: { user: null } });

    const request = new Request(
      'http://localhost/api/reminders?bouquetId=bouquet-456',
      {
        method: 'DELETE',
      },
    );

    const response = await DELETE(request as NextRequest);
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 400 when bouquetId is missing', async () => {
    const request = new Request('http://localhost/api/reminders', {
      method: 'DELETE',
    });

    const response = await DELETE(request as NextRequest);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('bouquetId is required');
  });

  it('cancels reminder successfully', async () => {
    const request = new Request(
      'http://localhost/api/reminders?bouquetId=bouquet-456',
      {
        method: 'DELETE',
      },
    );

    const response = await DELETE(request as NextRequest);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.message).toBe('Reminder cancelled successfully');
  });
});
