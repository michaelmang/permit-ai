import { Redis } from "@upstash/redis";

let redis;

export function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  if (!redis) {
    redis = Redis.fromEnv();
  }

  return redis;
}
