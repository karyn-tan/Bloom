import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedUserId, createClient } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/ratelimit';
import { identifyFlowers } from '@/lib/plantnet';
import { generateCareTip, assessFreshness } from '@/lib/gemini';
import type { Database } from '@/types/supabase';

type ScansInsert = Database['public']['Tables']['scans']['Insert'];
type BouquetsInsert = Database['public']['Tables']['bouquets']['Insert'];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

export async function POST(request: NextRequest) {
  // 1. Authenticate
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Rate limit
  const rateLimitResponse = await checkRateLimit(userId);
  if (rateLimitResponse) return rateLimitResponse;

  // 3. Extract and validate the image
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const existingScanId = formData.get('existing_scan_id');
  const existingScanIdStr =
    typeof existingScanId === 'string' ? existingScanId : null;

  const file = formData.get('image');
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Please upload a JPEG or PNG photo' },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'Photo must be under 10 MB' },
      { status: 400 },
    );
  }

  // 4. Upload to Supabase Storage
  const scanId = existingScanIdStr ?? crypto.randomUUID();
  const buffer = Buffer.from(await file.arrayBuffer());
  // For rescans, use a timestamped path to bust CDN cache; for new scans use scanId directly
  const storagePath = existingScanIdStr
    ? `${userId}/${scanId}_${Date.now()}.jpg`
    : `${userId}/${scanId}.jpg`;

  const supabase = createClient(request);

  // If rescanning, fetch the old image path so we can delete it after uploading the new one
  let oldStoragePath: string | null = null;
  if (existingScanIdStr) {
    const { data: existingScan } = await supabase
      .from('scans')
      .select('image_url')
      .eq('id', existingScanIdStr)
      .eq('user_id', userId)
      .returns<{ image_url: string }[]>()
      .single();
    oldStoragePath = (existingScan as { image_url: string } | null)?.image_url ?? null;
  }

  const { error: uploadError } = await supabase.storage
    .from('flower-images')
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error('Storage upload failed:', uploadError.message);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 },
    );
  }

  // 5. Identify flowers via PlantNet — take only the top result
  let identified;
  try {
    identified = await identifyFlowers(buffer, 'bouquet.jpg');
  } catch (err) {
    await supabase.storage.from('flower-images').remove([storagePath]);
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Identify] PlantNet FAILED:', msg);
    return NextResponse.json(
      {
        error:
          "We couldn't identify your flowers. Try a photo in natural light with the flowers clearly visible.",
      },
      { status: 502 },
    );
  }

  if (identified.length === 0) {
    await supabase.storage.from('flower-images').remove([storagePath]);
    return NextResponse.json(
      {
        error:
          "We couldn't identify your flowers. Try a photo in natural light with the flowers clearly visible.",
      },
      { status: 422 },
    );
  }

  const topFlower = identified[0];

  // 6. Generate care tips via Gemini (non-fatal if it fails)
  let care = null;
  try {
    care = await generateCareTip(
      topFlower.scientific_name,
      topFlower.common_name,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Gemini care tip generation failed:', message);
  }

  // 7. Assess visual freshness via Gemini Vision (non-fatal if it fails)
  let initialDroplets = 5;
  try {
    initialDroplets = await assessFreshness(buffer, file.type);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Gemini freshness assessment failed:', message);
  }

  // 8. Save scan with single flower + care tips
  const flowers = [
    {
      scientific_name: topFlower.scientific_name,
      common_name: topFlower.common_name,
      confidence: topFlower.confidence,
      initial_droplets: initialDroplets,
      care,
    },
  ];

  if (existingScanIdStr) {
    // Rescan: update the existing scan's image and flowers, preserve bouquet/care log
    const { error: updateError } = await (supabase as any)
      .from('scans')
      .update({ image_url: storagePath, flowers })
      .eq('id', existingScanIdStr)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Scan update failed:', updateError.message);
      await supabase.storage.from('flower-images').remove([storagePath]);
      return NextResponse.json(
        { error: 'Failed to update scan' },
        { status: 500 },
      );
    }

    // Delete old image from storage now that the new one is saved
    if (oldStoragePath && oldStoragePath !== storagePath) {
      await supabase.storage.from('flower-images').remove([oldStoragePath]);
    }

    // Sync bouquet name to match the newly identified flower
    await (supabase as any)
      .from('bouquets')
      .update({ name: topFlower.common_name })
      .eq('scan_id', existingScanIdStr)
      .eq('user_id', userId);

    // Invalidate all pages that show this scan's data
    revalidatePath(`/dashboard/scan/${existingScanIdStr}`);
    revalidatePath('/dashboard');
  } else {
    // New scan: insert record and auto-create bouquet
    const scanInsertPayload: ScansInsert = {
      id: scanId,
      user_id: userId,
      image_url: storagePath,
      flowers,
    };
    const { error: insertError } = (await supabase
      .from('scans')
      .insert(scanInsertPayload as never)) as unknown as {
      error: { message: string } | null;
    };

    if (insertError) {
      console.error('Scan insert failed:', insertError.message);
      await supabase.storage.from('flower-images').remove([storagePath]);
      return NextResponse.json(
        { error: 'Failed to save scan' },
        { status: 500 },
      );
    }

    // Auto-create a bouquet for this scan using the flower's common name
    const bouquetInsertPayload: BouquetsInsert = {
      scan_id: scanId,
      user_id: userId,
      name: topFlower.common_name,
      reminder_opt_in: false,
    };
    const { error: bouquetInsertError } = (await supabase
      .from('bouquets')
      .insert(bouquetInsertPayload as never)) as unknown as {
      error: { message: string } | null;
    };

    if (bouquetInsertError) {
      console.error('Bouquet auto-create failed:', bouquetInsertError.message);
      // Non-fatal: scan is saved, bouquet just wasn't auto-created
    }

    revalidatePath('/dashboard');
  }

  return NextResponse.json({
    scan_id: scanId,
    flowers,
  });
}
