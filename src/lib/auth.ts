import { z } from 'zod';

/**
 * Constants for validation rules
 */
export const MIN_PASSWORD_LENGTH = 8;
export const PASSWORD_ERROR_MESSAGE = 'Password must be at least 8 characters';

/**
 * Zod schema for email validation
 */
export const emailSchema = z.string().email();

/**
 * Zod schema for password validation
 */
export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, PASSWORD_ERROR_MESSAGE);

/**
 * Validation result type for passwords
 */
export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates email format using Zod schema
 * @param email - The email string to validate
 * @returns boolean indicating if email is valid
 */
export function validateEmail(email: string): boolean {
  const result = emailSchema.safeParse(email);
  return result.success;
}

/**
 * Validates password meets minimum requirements using Zod schema
 * @param password - The password string to validate
 * @returns Object with valid flag and optional error message
 */
export function validatePassword(
  password: string,
): PasswordValidationResult {
  const result = passwordSchema.safeParse(password);

  if (!result.success) {
    return {
      valid: false,
      error: PASSWORD_ERROR_MESSAGE,
    };
  }

  return { valid: true };
}