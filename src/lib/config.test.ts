import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getSupabaseEnv,
  getPlantNetEnv,
  getGeminiEnv,
  getUpstashEnv,
} from './config';

describe('config', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('getSupabaseEnv', () => {
    it('returns validated env when valid', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
      const env = getSupabaseEnv();
      expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co');
    });

    it('throws when missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      expect(() => getSupabaseEnv()).toThrow('Missing or invalid Supabase');
    });
  });

  describe('getPlantNetEnv', () => {
    it('returns validated env when valid', () => {
      process.env.PLANTNET_API_KEY = 'pn-key';
      expect(getPlantNetEnv().PLANTNET_API_KEY).toBe('pn-key');
    });

    it('throws when missing', () => {
      delete process.env.PLANTNET_API_KEY;
      expect(() => getPlantNetEnv()).toThrow('Missing or invalid PlantNet');
    });
  });

  describe('getGeminiEnv', () => {
    it('returns validated env when valid', () => {
      process.env.GEMINI_API_KEY = 'gem-key';
      expect(getGeminiEnv().GEMINI_API_KEY).toBe('gem-key');
    });

    it('throws when missing', () => {
      delete process.env.GEMINI_API_KEY;
      expect(() => getGeminiEnv()).toThrow('Missing or invalid Gemini');
    });
  });

  describe('getUpstashEnv', () => {
    it('returns validated env when valid', () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
      const env = getUpstashEnv();
      expect(env.UPSTASH_REDIS_REST_URL).toBe('https://redis.upstash.io');
    });

    it('throws when missing', () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      expect(() => getUpstashEnv()).toThrow('Missing or invalid Upstash');
    });
  });
});
