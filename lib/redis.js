import { Redis } from "@upstash/redis";

let redis;

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

export function getRedis() {
  const config = getRedisConfig();
  if (!config) return null;

  if (!redis) {
    redis = new Redis(config);
  }

  return redis;
}

export function isRedisConfigured() {
  return getRedisConfig() !== null;
}
