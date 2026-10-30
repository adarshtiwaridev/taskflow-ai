import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createRedisClient } from "../config/redis";
import { logger } from "../utils/logger";

export const setupRedisAdapter = async (io: Server): Promise<boolean> => {
  try {
    const pubClient = createRedisClient("pub");
    const subClient = createRedisClient("sub");

    await Promise.all([pubClient.connect(), subClient.connect()]);

    io.adapter(createAdapter(pubClient, subClient));
    logger.info("Socket.io Redis adapter initialized successfully");
    return true;
  } catch (error) {
    logger.warn(
      "Could not initialize Redis adapter for Socket.io. Operating with default in-memory adapter:",
      (error as Error).message
    );
    return false;
  }
};

