import { z } from 'zod';
import { getGeminiEnv } from '@/lib/config';
import type { CareLogStatus } from '@/lib/careLog';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const careTipSchema = z.object({
  common_name: z.string(),
  lifespan_days: z.object({
    min: z.number(),
    max: z.number(),
  }),
  care: z.object({
    water: z.string(),
    light: z.string(),
    temperature: z.string(),
    trim: z.string(),
  }),
  fun_facts: z.array(z.string()),
});

export type CareTip = z.infer<typeof careTipSchema>;

const geminiResponseSchema = z.object({
  candidates: z.array(
    z.object({
      content: z.object({
        parts: z.array(z.object({ text: z.string() })),
      }),
    }),
  ),
});

/**
 * Calls Gemini to generate a structured care tip for a flower species.
 */
export async function generateCareTip(
  scientificName: string,
  commonName: string,
): Promise<CareTip> {
  const env = getGeminiEnv();

  const prompt = `You are a cut flower care expert. For the flower "${commonName}" (${scientificName}), provide care tips for someone who just bought it as a cut flower in a vase.

Return ONLY valid JSON in this exact format:
{
  "common_name": "${commonName}",
  "lifespan_days": { "min": <number>, "max": <number> },
  "care": {
    "water": "<one sentence about watering>",
    "light": "<one sentence about light>",
    "temperature": "<one sentence about temperature>",
    "trim": "<one sentence about trimming>"
  },
  "fun_facts": ["<interesting fact 1>", "<interesting fact 2>"]
}`;

  const url = `${GEMINI_API_URL}?key=${env.GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        response_mime_type: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error');
    throw new Error(`Gemini API error: ${response.status} - ${text}`);
  }

  const json: unknown = await response.json();
  const envelope = geminiResponseSchema.parse(json);

  const rawText = envelope.candidates[0]?.content.parts[0]?.text;
  if (!rawText) {
    throw new GeminiValidationError('Gemini returned empty response', '');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new GeminiValidationError('Gemini returned invalid JSON', rawText);
  }

  return careTipSchema.parse(parsed);
}

const freshnessResponseSchema = z.object({
  freshness: z.number().int().min(1).max(5),
});

function buildImagePart(imageBuffer: Buffer, mimeType: string) {
  return {
    inline_data: {
      mime_type: mimeType,
      data: imageBuffer.toString('base64'),
    },
  };
}

/**
 * Uses Gemini Vision to assess the visual freshness of flowers in a bouquet photo.
 * Returns a freshness score 1-5 (5=very fresh, 1=wilting).
 * Falls back to 5 on any error (non-fatal).
 */
export async function assessFreshness(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<number> {
  const env = getGeminiEnv();
  const url = `${GEMINI_API_URL}?key=${env.GEMINI_API_KEY}`;

  const prompt = `Look at this bouquet photo. On a scale of 1 to 5, how fresh do the flowers appear? 5 = just cut, very fresh and perky. 1 = wilting, drooping, or browning. Return ONLY valid JSON: { "freshness": <number 1-5> }`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [buildImagePart(imageBuffer, mimeType), { text: prompt }],
        },
      ],
      generationConfig: { response_mime_type: 'application/json' },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini freshness API error: ${response.status}`);
  }

  const json: unknown = await response.json();
  const envelope = geminiResponseSchema.parse(json);
  const rawText = envelope.candidates[0]?.content.parts[0]?.text;
  if (!rawText) throw new Error('Empty freshness response');

  const parsed = freshnessResponseSchema.parse(JSON.parse(rawText));
  return parsed.freshness;
}

const adaptiveTipResponseSchema = z.object({
  tip: z.string().min(10),
});

type GenerateAdaptiveTipParams = {
  speciesNames: string[];
  careCards: CareTip[];
  careLogSummary: string;
  status: CareLogStatus;
};

/**
 * Calls Gemini to generate a short personalised adaptive care tip (2-4 sentences).
 * Uses the species names, care cards, and care log classification as context.
 */
export async function generateAdaptiveTip(
  params: GenerateAdaptiveTipParams,
): Promise<string> {
  const { speciesNames, careCards, careLogSummary, status } = params;
  const env = getGeminiEnv();

  const tone =
    status === 'all_good'
      ? 'Write a warm, positive affirmation. No action needed.'
      : 'Write a gentle corrective message naming the specific action missed and a concrete next step.';

  const careCardSummary = careCards
    .map(
      (c) => `${c.common_name}: water — ${c.care.water}; trim — ${c.care.trim}`,
    )
    .join('\n');

  const prompt = `You are a friendly flower care coach. The user has a bouquet containing: ${speciesNames.join(', ')}.

Care card summary:
${careCardSummary}

Care log status (last 7 days): ${careLogSummary}

${tone}

Respond in 2–4 sentences maximum. Return ONLY valid JSON: { "tip": "<your tip here>" }`;

  const url = `${GEMINI_API_URL}?key=${env.GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { response_mime_type: 'application/json' },
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error');
    throw new Error(`Gemini API error: ${response.status} - ${text}`);
  }

  const json: unknown = await response.json();
  const envelope = geminiResponseSchema.parse(json);
  const rawText = envelope.candidates[0]?.content.parts[0]?.text;
  if (!rawText) {
    throw new GeminiValidationError('Gemini returned empty response', '');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new GeminiValidationError('Gemini returned invalid JSON', rawText);
  }

  const validated = adaptiveTipResponseSchema.parse(parsed);
  return validated.tip;
}

export class GeminiValidationError extends Error {
  constructor(
    message: string,
    public rawText: string,
  ) {
    super(message);
    this.name = 'GeminiValidationError';
  }
}
