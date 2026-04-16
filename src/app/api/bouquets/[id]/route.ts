import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId, createClient } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/ratelimit';

export async function DELETE(
  request: NextRequest,
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
    .returns<{ scan_id: string }[]>()
    .single();

  if (bouquetError || !bouquet) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Fetch the associated scan's image path for storage cleanup
  const { data: scan, error: scanError } = await supabase
    .from('scans')
    .select('image_url')
    .eq('id', (bouquet as { scan_id: string }).scan_id)
    .eq('user_id', userId)
    .returns<{ image_url: string }[]>()
    .single();

  if (scanError || !scan) {
    console.error('[bouquets/delete] scan lookup error:', scanError);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }

  // Delete the bouquet row (cascades to care_log, reminders, adaptive_tip_cache)
  const { error: deleteError } = await supabase
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
  // image_url is stored as a bucket-relative path (e.g. "{userId}/{scanId}.jpg").
  // Strip any accidental full URL prefix so storage.remove() gets the bare path.
  const imageUrl = (scan as { image_url: string }).image_url;
  const storagePath = imageUrl.includes('/flower-images/')
    ? imageUrl.split('/flower-images/')[1]
    : imageUrl;
  const { error: storageError } = await supabase.storage
    .from('flower-images')
    .remove([storagePath]);

  if (storageError) {
    console.error('[bouquets/delete] storage cleanup error:', storageError);
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
