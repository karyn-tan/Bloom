/**
 * Validates email format using regex
 * @param email - The email string to validate
 * @returns boolean indicating if email is valid
 */
export function validateEmail(email: string): boolean {
  if (!email || email.length === 0) {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validation result type for passwords
 */
export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates password meets minimum requirements
 * @param password - The password string to validate
 * @returns Object with valid flag and optional error message
 */
export function validatePassword(
  password: string,
): PasswordValidationResult {
  const MIN_PASSWORD_LENGTH = 8;

  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      error: 'Password must be at least 8 characters',
    };
  }

  return { valid: true };
}