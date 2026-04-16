import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId, createClient } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/ratelimit';
import { identifyFlowers } from '@/lib/plantnet';
import { generateCareTip } from '@/lib/gemini';
import type { Database } from '@/types/supabase';

type ScansInsert = Database['public']['Tables']['scans']['Insert'];

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
  const scanId = crypto.randomUUID();
  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = `${userId}/${scanId}.jpg`;

  const supabase = createClient(request);
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

  // 7. Save scan with single flower + care tips
  const flowers = [
    {
      scientific_name: topFlower.scientific_name,
      common_name: topFlower.common_name,
      confidence: topFlower.confidence,
      care,
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insertError } = await (supabase as any).from('scans').insert({
    id: scanId,
    user_id: userId,
    image_url: storagePath,
    flowers,
  });

  if (insertError) {
    console.error('Scan insert failed:', insertError.message);
    await supabase.storage.from('flower-images').remove([storagePath]);
    return NextResponse.json({ error: 'Failed to save scan' }, { status: 500 });
  }

  // Auto-create a bouquet for this scan using the flower's common name
  const bouquetName = topFlower.common_name;
  const { error: bouquetInsertError } = await supabase
    .from('bouquets')
    .insert({
      scan_id: scanId,
      user_id: userId,
      name: bouquetName,
      reminder_opt_in: false,
    });

  if (bouquetInsertError) {
    console.error('Bouquet auto-create failed:', bouquetInsertError.message);
    // Non-fatal: scan is saved, bouquet just wasn't auto-created
  }

  return NextResponse.json({
    scan_id: scanId,
    flowers,
  });
}
