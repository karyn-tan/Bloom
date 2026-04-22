/**
 * Minimum length for flower names
 */
export const FLOWER_NAME_MIN_LENGTH = 2;

/**
 * Result type for flower name validation
 */
export interface FlowerNameValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates flower name meets minimum requirements
 * @param name - The flower name string to validate
 * @returns Object with valid flag and optional error message
 */
export function validateFlowerName(name: string): FlowerNameValidationResult {
  const trimmedName = name.trim();

  if (trimmedName.length < FLOWER_NAME_MIN_LENGTH) {
    return {
      valid: false,
      error: `Flower name must be at least ${FLOWER_NAME_MIN_LENGTH} characters`,
    };
  }

  return { valid: true };
}
