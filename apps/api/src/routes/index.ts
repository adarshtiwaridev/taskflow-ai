import { Router } from "express";
import { taskRoutes } from "./task.routes";
import { aiRoutes } from "./ai.routes";
import { healthRoutes } from "./health.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/tasks", taskRoutes);
router.use("/ai", aiRoutes);

export const apiRoutes = router;

