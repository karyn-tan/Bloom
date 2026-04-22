import { z } from 'zod';
import { getPlantNetEnv } from '@/lib/config';

const PLANTNET_API_URL = 'https://my-api.plantnet.org/v2/identify/all';

const plantNetSpeciesSchema = z.object({
  scientificNameWithoutAuthor: z.string(),
  commonNames: z.array(z.string()).default([]),
});

const plantNetResultSchema = z.object({
  score: z.number(),
  species: plantNetSpeciesSchema,
});

const plantNetResponseSchema = z.object({
  results: z.array(plantNetResultSchema),
});

export type IdentifiedFlower = {
  scientific_name: string;
  common_name: string;
  confidence: number;
};

/**
 * Sends an image to PlantNet and returns identified flowers sorted by confidence.
 */
export async function identifyFlowers(
  imageBuffer: Buffer,
  fileName: string,
): Promise<IdentifiedFlower[]> {
  const env = getPlantNetEnv();

  const formData = new FormData();
  // Convert Buffer to Uint8Array for Blob compatibility
  const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/jpeg' });
  formData.append('images', blob, fileName);
  formData.append('organs', 'flower');

  const url = `${PLANTNET_API_URL}?api-key=${env.PLANTNET_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error');
    throw new PlantNetError(
      `PlantNet API error: ${response.status} - ${text}`,
      response.status,
    );
  }

  const json: unknown = await response.json();
  const parsed = plantNetResponseSchema.parse(json);

  return parsed.results
    .map((result) => ({
      scientific_name: result.species.scientificNameWithoutAuthor,
      common_name:
        result.species.commonNames[0] ??
        result.species.scientificNameWithoutAuthor,
      confidence: Math.round(result.score * 100) / 100,
    }))
    .sort((a, b) => b.confidence - a.confidence);
}

export class PlantNetError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'PlantNetError';
  }
}
