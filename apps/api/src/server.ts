import { createServer } from "node:http";
import { Server } from "socket.io";
import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { setupRedisAdapter } from "./sockets/redisAdapter";
import { initSocketHandler } from "./sockets/socketHandler";
import { disconnectDb } from "./config/database";
import { ServerToClientEvents, ClientToServerEvents } from "@taskflow/shared";

const server = createServer(app);

const allowedOrigins = [env.WEB_URL];
if (env.CORS_ORIGIN) {
  allowedOrigins.push(...env.CORS_ORIGIN.split(",").map((o) => o.trim()));
}

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*") || !env.IS_PROD) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked Socket.io from origin: ${origin}`));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 20000,
  pingInterval: 25000,
});

async function startServer(): Promise<void> {
  // Initialize Redis adapter (falls back to memory if Redis is unavailable)
  await setupRedisAdapter(io);

  // Initialize socket event handlers and room management
  initSocketHandler(io);

  server.listen(env.PORT, () => {
    logger.info(`TaskFlow AI API running on http://localhost:${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV} | Web Client: ${env.WEB_URL}`);
  });
}

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  io.close(() => {
    logger.info("Socket.io connections closed");
  });
  server.close(async () => {
    logger.info("HTTP server closed");
    await disconnectDb();
    logger.info("Database disconnected. Process exiting.");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forceful shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

if (process.env.NODE_ENV !== "test") {
  startServer().catch((err) => {
    logger.error("Failed to start server:", err);
    process.exit(1);
  });
}

export { app, server, io };
