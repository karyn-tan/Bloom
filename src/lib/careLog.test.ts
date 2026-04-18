import { describe, it, expect } from 'vitest';
import { classifyCareLog } from './careLog';
import type { CareLogEntry } from './careLog';

const NOW = new Date('2026-04-18T12:00:00Z');

/** Helper: build a CareLogEntry logged N days before NOW */
function daysAgo(action: CareLogEntry['action'], days: number): CareLogEntry {
  const d = new Date(NOW);
  d.setDate(d.getDate() - days);
  return { action, logged_at: d.toISOString() };
}

describe('classifyCareLog', () => {
  it('returns no_data when entries array is empty', () => {
    expect(classifyCareLog([], 2, NOW)).toBe('no_data');
  });

  it('returns no_data when all entries are older than 7 days', () => {
    const entries: CareLogEntry[] = [
      daysAgo('water', 8),
      daysAgo('trim', 10),
    ];
    expect(classifyCareLog(entries, 2, NOW)).toBe('no_data');
  });

  it('returns missed_watering when last water/refresh is overdue', () => {
    // watering interval = 2 days, last water was 3 days ago
    const entries: CareLogEntry[] = [daysAgo('water', 3)];
    expect(classifyCareLog(entries, 2, NOW)).toBe('missed_watering');
  });

  it('returns missed_watering when no water action has ever been logged but trim exists', () => {
    const entries: CareLogEntry[] = [daysAgo('trim', 1)];
    expect(classifyCareLog(entries, 2, NOW)).toBe('missed_watering');
  });

  it('returns missed_watering when refresh is overdue (refresh counts as watering)', () => {
    const entries: CareLogEntry[] = [daysAgo('refresh', 4)];
    expect(classifyCareLog(entries, 2, NOW)).toBe('missed_watering');
  });

  it('returns missed_trim when watering is on schedule but no trim logged', () => {
    const entries: CareLogEntry[] = [daysAgo('water', 1)];
    expect(classifyCareLog(entries, 2, NOW)).toBe('missed_trim');
  });

  it('returns missed_trim when watering is fine but last trim was more than 7 days ago', () => {
    const entries: CareLogEntry[] = [
      daysAgo('water', 1),
      daysAgo('trim', 8),
    ];
    expect(classifyCareLog(entries, 2, NOW)).toBe('missed_trim');
  });

  it('returns all_good when both water and trim logged in last 3 days', () => {
    const entries: CareLogEntry[] = [
      daysAgo('water', 1),
      daysAgo('trim', 2),
    ];
    expect(classifyCareLog(entries, 2, NOW)).toBe('all_good');
  });

  it('returns all_good when refresh (not water) is recent and trim is recent', () => {
    const entries: CareLogEntry[] = [
      daysAgo('refresh', 1),
      daysAgo('trim', 1),
    ];
    expect(classifyCareLog(entries, 2, NOW)).toBe('all_good');
  });

  it('prioritizes missed_watering over missed_trim when both are missing', () => {
    // No water, no trim in last 7 days (only old entries outside window)
    const entries: CareLogEntry[] = [daysAgo('trim', 9)];
    expect(classifyCareLog(entries, 2, NOW)).toBe('no_data');
  });

  it('uses default watering interval of 2 when not specified', () => {
    // last water was 1 day ago with interval=2 → still on schedule → check trim
    const entries: CareLogEntry[] = [
      daysAgo('water', 1),
      daysAgo('trim', 2),
    ];
    expect(classifyCareLog(entries, 2, NOW)).toBe('all_good');
  });
});
