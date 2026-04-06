import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/config', () => ({
  getGeminiEnv: () => ({ GEMINI_API_KEY: 'test-key' }),
}));

import { generateCareTip, GeminiValidationError } from './gemini';

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

    await expect(
      generateCareTip('Rosa gallica', 'Rose'),
    ).rejects.toThrow('Gemini API error');
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

    await expect(
      generateCareTip('Rosa gallica', 'Rose'),
    ).rejects.toThrow(GeminiValidationError);
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

    await expect(
      generateCareTip('Rosa gallica', 'Rose'),
    ).rejects.toThrow();
  });
});
