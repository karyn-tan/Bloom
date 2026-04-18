import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/config', () => ({
  getGeminiEnv: () => ({ GEMINI_API_KEY: 'test-key' }),
}));

import {
  generateCareTip,
  GeminiValidationError,
  assessFreshness,
  generateAdaptiveTip,
} from './gemini';
import type { CareLogStatus } from './careLog';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
});

const validCareTip = {
  common_name: 'Rose',
  lifespan_days: { min: 7, max: 12 },
  care: {
    water: 'Change water every 2 days.',
    light: 'Keep in indirect sunlight.',
    temperature: 'Room temperature, avoid drafts.',
    trim: 'Cut stems at 45-degree angle every 3 days.',
  },
  fun_facts: ['Roses have been cultivated for over 5,000 years.'],
};

describe('generateCareTip', () => {
  it('returns a valid care tip on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify(validCareTip) }],
              },
            },
          ],
        }),
    });

    const result = await generateCareTip('Rosa gallica', 'Rose');

    expect(result.common_name).toBe('Rose');
    expect(result.lifespan_days.min).toBe(7);
    expect(result.care.water).toBe('Change water every 2 days.');
    expect(result.fun_facts).toHaveLength(1);
  });

  it('throws on non-200 response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal error'),
    });

    await expect(generateCareTip('Rosa gallica', 'Rose')).rejects.toThrow(
      'Gemini API error',
    );
  });

  it('throws GeminiValidationError on invalid JSON from Gemini', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: 'not valid json {{{' }],
              },
            },
          ],
        }),
    });

    await expect(generateCareTip('Rosa gallica', 'Rose')).rejects.toThrow(
      GeminiValidationError,
    );
  });

  it('throws on Zod validation failure', async () => {
    const incompleteTip = { common_name: 'Rose' }; // missing required fields

    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify(incompleteTip) }],
              },
            },
          ],
        }),
    });

    await expect(generateCareTip('Rosa gallica', 'Rose')).rejects.toThrow();
  });
});

describe('assessFreshness', () => {
  it('returns freshness score from Gemini response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: '{"freshness": 4}' }],
              },
            },
          ],
        }),
    });

    const result = await assessFreshness(
      Buffer.from('fake-image-data'),
      'image/jpeg',
    );
    expect(result).toBe(4);
  });

  it('throws when Gemini returns non-OK status', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
    });

    await expect(
      assessFreshness(Buffer.from('fake-image-data'), 'image/jpeg'),
    ).rejects.toThrow('Gemini freshness API error');
  });

  it('throws when response fails Zod validation (freshness=6 out of range)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: '{"freshness": 6}' }],
              },
            },
          ],
        }),
    });

    await expect(
      assessFreshness(Buffer.from('fake-image-data'), 'image/jpeg'),
    ).rejects.toThrow();
  });

  it('throws when Gemini returns invalid JSON in the freshness response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: 'not-valid-json{{{' }],
              },
            },
          ],
        }),
    });

    await expect(
      assessFreshness(Buffer.from('fake-image-data'), 'image/jpeg'),
    ).rejects.toThrow();
  });

  it('throws when Gemini returns freshness below range (0)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: '{"freshness": 0}' }],
              },
            },
          ],
        }),
    });

    await expect(
      assessFreshness(Buffer.from('fake-image-data'), 'image/jpeg'),
    ).rejects.toThrow();
  });

  it('throws when Gemini returns non-integer freshness (3.5)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: '{"freshness": 3.5}' }],
              },
            },
          ],
        }),
    });

    await expect(
      assessFreshness(Buffer.from('fake-image-data'), 'image/jpeg'),
    ).rejects.toThrow();
  });

  it('throws when Gemini response has no candidates', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [],
        }),
    });

    await expect(
      assessFreshness(Buffer.from('fake-image-data'), 'image/jpeg'),
    ).rejects.toThrow();
  });
});

const validAdaptiveTipParams = {
  speciesNames: ['Rose', 'Tulip'],
  careCards: [validCareTip],
  careLogSummary: 'Missed watering yesterday.',
  status: 'missed_watering' as CareLogStatus,
};

describe('generateAdaptiveTip', () => {
  it('returns a tip string on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: '{"tip": "Your roses may be thirsty. Top up the water now."}',
                  },
                ],
              },
            },
          ],
        }),
    });

    const result = await generateAdaptiveTip(validAdaptiveTipParams);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(10);
  });

  it('returns positive tip for all_good status', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: '{"tip": "Your peonies are loving it — keep doing what you\'re doing!"}',
                  },
                ],
              },
            },
          ],
        }),
    });

    const result = await generateAdaptiveTip({
      ...validAdaptiveTipParams,
      status: 'all_good',
    });
    expect(typeof result).toBe('string');
  });

  it('throws on non-200 Gemini response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Server error'),
    });

    await expect(generateAdaptiveTip(validAdaptiveTipParams)).rejects.toThrow(
      'Gemini API error',
    );
  });

  it('throws GeminiValidationError when response is not valid JSON', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: 'not valid json {{{' }],
              },
            },
          ],
        }),
    });

    await expect(generateAdaptiveTip(validAdaptiveTipParams)).rejects.toThrow();
  });

  it('throws when tip field is missing from Gemini response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: '{"not_tip": "something"}' }],
              },
            },
          ],
        }),
    });

    await expect(generateAdaptiveTip(validAdaptiveTipParams)).rejects.toThrow();
  });
});
