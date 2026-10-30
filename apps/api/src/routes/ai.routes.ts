import { Router } from "express";
import { aiController } from "../controllers/ai.controller";
import { validateBody } from "../middleware/validate";
import { aiBreakdownRequestSchema } from "../validators/ai.validator";

const router = Router();

router.post("/breakdown", validateBody(aiBreakdownRequestSchema), (req, res, next) =>
  aiController.breakdownGoal(req, res, next)
);

export const aiRoutes = router;

