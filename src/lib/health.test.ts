import { describe, it, expect } from 'vitest';
import {
  parseWateringInterval,
  computeHearts,
  computeDroplets,
  computeHealthState,
} from './health';

// ---------------------------------------------------------------------------
// parseWateringInterval
// ---------------------------------------------------------------------------
describe('parseWateringInterval', () => {
  it('extracts interval from "Change water every 2 days"', () => {
    expect(parseWateringInterval('Change water every 2 days')).toBe(2);
  });

  it('extracts first number from "every 2-3 days"', () => {
    expect(parseWateringInterval('every 2-3 days')).toBe(2);
  });

  it('extracts interval from "every 7 days"', () => {
    expect(parseWateringInterval('every 7 days')).toBe(7);
  });

  it('returns default 2 for "Mist lightly" (no number)', () => {
    expect(parseWateringInterval('Mist lightly')).toBe(2);
  });

  it('returns default 2 for empty string', () => {
    expect(parseWateringInterval('')).toBe(2);
  });

  it('returns default 2 for "every 0 days" (invalid)', () => {
    expect(parseWateringInterval('every 0 days')).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// computeHearts
// ---------------------------------------------------------------------------
describe('computeHearts', () => {
  it('returns 3 when ageInDays=0, lifespanMin=7 (100% remaining)', () => {
    expect(computeHearts(0, 7)).toBe(3);
  });

  it('returns 2 when ageInDays=4, lifespanMin=7 (~43% remaining)', () => {
    expect(computeHearts(4, 7)).toBe(2);
  });

  it('returns 1 when ageInDays=6, lifespanMin=7 (~14% remaining)', () => {
    expect(computeHearts(6, 7)).toBe(1);
  });

  it('returns 0 when ageInDays=7, lifespanMin=7 (expired)', () => {
    expect(computeHearts(7, 7)).toBe(0);
  });

  it('returns 0 when ageInDays=8, lifespanMin=7 (past peak)', () => {
    expect(computeHearts(8, 7)).toBe(0);
  });

  it('returns 2 when lifespanMin=null (unknown lifespan)', () => {
    expect(computeHearts(3, null)).toBe(2);
  });

  it('returns 2 when lifespanMin=0 (invalid)', () => {
    expect(computeHearts(3, 0)).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// computeDroplets
// ---------------------------------------------------------------------------
// Use a fixed "now" for determinism: 2026-04-16T12:00:00Z
const NOW = new Date('2026-04-16T12:00:00Z');
const daysAgo = (n: number) =>
  new Date(NOW.getTime() - n * 86_400_000).toISOString();

describe('computeDroplets', () => {
  it('returns 5 when watered today (0 days overdue)', () => {
    expect(computeDroplets(daysAgo(0), daysAgo(10), 2, NOW)).toBe(5);
  });

  it('returns 4 when watered 3 days ago with interval=2 (1 day overdue)', () => {
    expect(computeDroplets(daysAgo(3), daysAgo(10), 2, NOW)).toBe(4);
  });

  it('returns 2 when watered 5 days ago with interval=2 (3 days overdue)', () => {
    expect(computeDroplets(daysAgo(5), daysAgo(10), 2, NOW)).toBe(2);
  });

  it('returns 0 when watered 7 days ago with interval=2 (5 days overdue)', () => {
    expect(computeDroplets(daysAgo(7), daysAgo(10), 2, NOW)).toBe(0);
  });

  it('returns 0 when watered 9 days ago with interval=2 (7 days overdue, capped at 0)', () => {
    expect(computeDroplets(daysAgo(9), daysAgo(10), 2, NOW)).toBe(0);
  });

  it('returns 5 when no watering logged and bouquet added today', () => {
    expect(computeDroplets(null, daysAgo(0), 2, NOW)).toBe(5);
  });

  it('returns initialDroplets=3 when no watering and bouquet added today with initialDroplets=3', () => {
    expect(computeDroplets(null, daysAgo(0), 2, NOW, 3)).toBe(3);
  });

  it('returns 4 when no watering logged and bouquet added 3 days ago with interval=2', () => {
    expect(computeDroplets(null, daysAgo(3), 2, NOW)).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// computeHealthState
// ---------------------------------------------------------------------------
describe('computeHealthState', () => {
  it('fresh bouquet watered today → healthy with 3 hearts and 5 droplets', () => {
    const result = computeHealthState({
      ageInDays: 0,
      lifespanMin: 7,
      lastWateredAt: daysAgo(0),
      bouquetAddedAt: daysAgo(0),
      waterText: 'Change water every 2 days',
      now: NOW,
    });
    expect(result).toEqual({ hearts: 3, droplets: 5, status: 'healthy' });
  });

  it('50% lifespan, 4 days past watering interval=2 → thirsty', () => {
    // ageInDays=3 out of lifespanMin=6 means 50% remaining (pct=0.5 → 2 hearts)
    // lastWateredAt = 6 days ago, interval=2 → 4 days overdue → 1 droplet
    const result = computeHealthState({
      ageInDays: 3,
      lifespanMin: 6,
      lastWateredAt: daysAgo(6),
      bouquetAddedAt: daysAgo(3),
      waterText: 'Change water every 2 days',
      now: NOW,
    });
    expect(result.hearts).toBe(2);
    expect(result.droplets).toBe(1);
    expect(result.status).toBe('thirsty');
  });

  it('20% lifespan remaining, well-watered → struggling', () => {
    // ageInDays=8 out of lifespanMin=10: pct=0.2 → 1 heart, status=struggling
    const result = computeHealthState({
      ageInDays: 8,
      lifespanMin: 10,
      lastWateredAt: daysAgo(1),
      bouquetAddedAt: daysAgo(8),
      waterText: 'Change water every 2 days',
      now: NOW,
    });
    expect(result.hearts).toBe(1);
    expect(result.droplets).toBe(5);
    expect(result.status).toBe('struggling');
  });

  it('past peak (ageInDays >= lifespanMin) → past_peak status', () => {
    const result = computeHealthState({
      ageInDays: 7,
      lifespanMin: 7,
      lastWateredAt: daysAgo(0),
      bouquetAddedAt: daysAgo(7),
      waterText: 'Change water every 2 days',
      now: NOW,
    });
    expect(result.hearts).toBe(0);
    expect(result.status).toBe('past_peak');
  });
});
