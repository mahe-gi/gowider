import "server-only";
import { Redis, type RedisOptions } from "ioredis";
import { env } from "@/lib/env";

function getRedisConfig(): RedisOptions {
  const redisUrl = env.REDIS_URL || "redis://127.0.0.1:6379";
  return {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  };
}

let redisConnection: Redis | null = null;

export function getRedisConnection(): Redis {
  if (!redisConnection) {
    const redisUrl = env.REDIS_URL || "redis://127.0.0.1:6379";
    redisConnection = new Redis(redisUrl, getRedisConfig());

    redisConnection.on("error", (err) => {
      console.error("❌ Redis Connection Error:", err.message);
    });

    redisConnection.on("connect", () => {
      if (process.env.NODE_ENV !== "production") {
        console.log("🔌 Connected to Redis Queue at", redisUrl);
      }
    });
  }

  return redisConnection;
}

export async function closeRedisConnection(): Promise<void> {
  if (redisConnection) {
    await redisConnection.quit().catch(() => {});
    redisConnection = null;
  }
}
