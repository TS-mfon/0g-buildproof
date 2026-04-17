import { Redis } from "ioredis";
import { env } from "../env.js";

export function createRedisConnection(): Redis {
  if (!env.REDIS_URL) throw new Error("REDIS_URL is not configured");
  return new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    lazyConnect: true
  });
}
