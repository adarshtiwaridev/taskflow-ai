import { Request, Response, NextFunction } from "express";
import { aiService } from "../services/ai.service";
import { sendSuccess } from "../utils/apiResponse";

export class AIController {
  async breakdownGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const breakdown = await aiService.breakdownGoal(req.body);
      sendSuccess(res, breakdown);
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AIController();

