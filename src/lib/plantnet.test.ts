import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/config', () => ({
  getPlantNetEnv: () => ({ PLANTNET_API_KEY: 'test-key' }),
}));

import { identifyFlowers, PlantNetError } from './plantnet';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('identifyFlowers', () => {
  it('returns identified flowers sorted by confidence', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {
              score: 0.65,
              species: {
                scientificNameWithoutAuthor: 'Rosa gallica',
                commonNames: ['Rose'],
              },
            },
            {
              score: 0.92,
              species: {
                scientificNameWithoutAuthor: 'Tulipa gesneriana',
                commonNames: ['Tulip'],
              },
            },
          ],
        }),
    });

    const result = await identifyFlowers(Buffer.from('fake-image'), 'test.jpg');

    expect(result).toHaveLength(2);
    expect(result[0].common_name).toBe('Tulip');
    expect(result[0].confidence).toBe(0.92);
    expect(result[1].common_name).toBe('Rose');
    expect(result[1].confidence).toBe(0.65);
  });

  it('uses scientific name as fallback when no common names', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {
              score: 0.8,
              species: {
                scientificNameWithoutAuthor: 'Alstroemeria aurea',
                commonNames: [],
              },
            },
          ],
        }),
    });

    const result = await identifyFlowers(Buffer.from('fake-image'), 'test.jpg');

    expect(result[0].common_name).toBe('Alstroemeria aurea');
  });

  it('throws PlantNetError on non-200 response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      text: () => Promise.resolve('Rate limited'),
    });

    await expect(
      identifyFlowers(Buffer.from('fake-image'), 'test.jpg'),
    ).rejects.toThrow(PlantNetError);
  });

  it('throws on invalid response schema', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ unexpected: 'shape' }),
    });

    await expect(
      identifyFlowers(Buffer.from('fake-image'), 'test.jpg'),
    ).rejects.toThrow();
  });
});
