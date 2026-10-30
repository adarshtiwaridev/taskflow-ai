import { Request, Response } from "express";
import { checkDbHealth } from "../config/database";
import { checkRedisHealth } from "../config/redis";
import { sendSuccess } from "../utils/apiResponse";

export class HealthController {
  async getHealth(_req: Request, res: Response): Promise<void> {
    const isDbConnected = await checkDbHealth();
    const isRedisConnected = checkRedisHealth();

    sendSuccess(res, {
      status: "UP",
      service: "TaskFlow AI API",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      dependencies: {
        database: isDbConnected ? "CONNECTED" : "FALLBACK_STORE",
        redis: isRedisConnected ? "CONNECTED" : "IN_MEMORY_ADAPTER",
      },
    });
  }

  async getReadiness(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, { ready: true });
  }
}

export const healthController = new HealthController();

