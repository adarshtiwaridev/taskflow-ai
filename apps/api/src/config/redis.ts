import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../utils/logger";

let isRedisConnected = false;

export const createRedisClient = (name = "default"): Redis => {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    retryStrategy: (times) => {
      if (times > 5) {
        logger.warn(`Redis [${name}] max retry attempts reached. Falling back to in-memory mode.`);
        return null;
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  client.on("connect", () => {
    isRedisConnected = true;
    logger.info(`Redis [${name}] connected to ${env.REDIS_URL}`);
  });

  client.on("error", (err) => {
    isRedisConnected = false;
    logger.warn(`Redis [${name}] connection error: ${err.message}`);
  });

  return client;
};

export const checkRedisHealth = (): boolean => isRedisConnected;

