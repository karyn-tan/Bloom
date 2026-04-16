import { describe, it, expect } from 'vitest';
import { validateFlowerName, FLOWER_NAME_MIN_LENGTH } from './flowers';

describe('validateFlowerName', () => {
  it('returns valid for names at least 2 characters', () => {
    const result = validateFlowerName('Rose');
    expect(result.valid).toBe(true);
  });

  it('returns invalid for names shorter than 2 characters', () => {
    const result = validateFlowerName('R');
    expect(result.valid).toBe(false);
    expect(result.error).toBe(
      `Flower name must be at least ${FLOWER_NAME_MIN_LENGTH} characters`,
    );
  });

  it('returns invalid for empty string', () => {
    const result = validateFlowerName('');
    expect(result.valid).toBe(false);
  });

  it('trims whitespace before validation', () => {
    const result = validateFlowerName('  Rose  ');
    expect(result.valid).toBe(true);
  });

  it('returns invalid for whitespace-only strings', () => {
    const result = validateFlowerName('   ');
    expect(result.valid).toBe(false);
  });
});
