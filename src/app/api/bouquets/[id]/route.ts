import { NextResponse } from 'next/server';
import { getAuthenticatedUserId, createClient } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/ratelimit';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimitResponse = await checkRateLimit(userId);
  if (rateLimitResponse) return rateLimitResponse;

  const { id } = params;
  const supabase = createClient(request);

  // Verify bouquet ownership (IDOR protection)
  const { data: bouquet, error: bouquetError } = await supabase
    .from('bouquets')
    .select('scan_id')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (bouquetError || !bouquet) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Fetch the associated scan's image path for storage cleanup
  const { data: scan, error: scanError } = await supabase
    .from('scans')
    .select('image_url')
    .eq('id', bouquet.scan_id)
    .single();

  if (scanError || !scan) {
    console.error('[bouquets/delete] scan lookup error:', scanError);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }

  // Delete the bouquet row (cascades to care_log, reminders, adaptive_tip_cache)
  const { error: deleteError } = await (
    supabase as unknown as {
      from: (t: string) => {
        delete: () => {
          eq: (
            c: string,
            v: string,
          ) => { eq: (c: string, v: string) => Promise<{ error: unknown }> };
        };
      };
    }
  )
    .from('bouquets')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (deleteError) {
    console.error('[bouquets/delete] delete error:', deleteError);
    return NextResponse.json(
      { error: 'Failed to delete bouquet' },
      { status: 500 },
    );
  }

  // Remove image from storage (non-fatal — row is already deleted)
  const { error: storageError } = await supabase.storage
    .from('flower-images')
    .remove([scan.image_url]);

  if (storageError) {
    console.error('[bouquets/delete] storage cleanup error:', storageError);
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
