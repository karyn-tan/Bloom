import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword } from './auth';

describe('validateEmail', () => {
  it('rejects empty strings', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('rejects invalid email format', () => {
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
  });

  it('accepts valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.user@domain.co.uk')).toBe(true);
  });
});

describe('validatePassword', () => {
  it('rejects passwords shorter than 8 characters', () => {
    const result = validatePassword('short');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Password must be at least 8 characters');
  });

  it('rejects empty passwords', () => {
    const result = validatePassword('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Password must be at least 8 characters');
  });

  it('accepts passwords with 8 or more characters', () => {
    const result = validatePassword('password123');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});