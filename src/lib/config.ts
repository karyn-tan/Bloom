import { z } from 'zod';

/**
 * Supabase environment variable schema
 * Used by both server and browser Supabase clients
 */
const supabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

/**
 * Returns validated Supabase environment variables
 * Throws if any required variable is missing or malformed
 */
export function getSupabaseEnv() {
  const parsed = supabaseEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    throw new Error('Missing or invalid Supabase environment variables');
  }

  return parsed.data;
}

/**
 * PlantNet environment variable schema
 */
const plantNetEnvSchema = z.object({
  PLANTNET_API_KEY: z.string().min(1),
});

/**
 * Returns validated PlantNet environment variables
 */
export function getPlantNetEnv() {
  const parsed = plantNetEnvSchema.safeParse({
    PLANTNET_API_KEY: process.env.PLANTNET_API_KEY,
  });

  if (!parsed.success) {
    throw new Error('Missing or invalid PlantNet environment variables');
  }

  return parsed.data;
}

/**
 * Gemini environment variable schema
 */
const geminiEnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1),
});

/**
 * Returns validated Gemini environment variables
 */
export function getGeminiEnv() {
  const parsed = geminiEnvSchema.safeParse({
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  });

  if (!parsed.success) {
    throw new Error('Missing or invalid Gemini environment variables');
  }

  return parsed.data;
}

/**
 * Upstash environment variable schema
 */
const upstashEnvSchema = z.object({
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
});

/**
 * Returns validated Upstash environment variables
 */
export function getUpstashEnv() {
  const parsed = upstashEnvSchema.safeParse({
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  if (!parsed.success) {
    throw new Error('Missing or invalid Upstash environment variables');
  }

  return parsed.data;
}
