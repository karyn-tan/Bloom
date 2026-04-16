import { z } from 'zod';
import { getGeminiEnv } from '@/lib/config';

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

export class GeminiValidationError extends Error {
  constructor(
    message: string,
    public rawText: string,
  ) {
    super(message);
    this.name = 'GeminiValidationError';
  }
}
