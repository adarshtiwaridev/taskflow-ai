import { Router } from "express";
import { healthController } from "../controllers/health.controller";

const router = Router();

router.get("/", (req, res) => healthController.getHealth(req, res));
router.get("/ready", (req, res) => healthController.getReadiness(req, res));

export const healthRoutes = router;

