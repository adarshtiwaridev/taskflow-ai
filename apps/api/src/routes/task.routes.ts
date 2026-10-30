import { Router } from "express";
import { taskController } from "../controllers/task.controller";
import { validateBody, validateParams } from "../middleware/validate";
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
  bulkCreateTasksSchema,
} from "../validators/task.validator";

const router = Router();

router.get("/", (req, res, next) => taskController.getAllTasks(req, res, next));
router.get("/:id", validateParams(taskIdParamSchema), (req, res, next) =>
  taskController.getTaskById(req, res, next)
);
router.post("/", validateBody(createTaskSchema), (req, res, next) =>
  taskController.createTask(req, res, next)
);
router.post("/bulk", validateBody(bulkCreateTasksSchema), (req, res, next) =>
  taskController.bulkCreateTasks(req, res, next)
);
router.patch("/:id", validateParams(taskIdParamSchema), validateBody(updateTaskSchema), (req, res, next) =>
  taskController.updateTask(req, res, next)
);
router.delete("/:id", validateParams(taskIdParamSchema), (req, res, next) =>
  taskController.deleteTask(req, res, next)
);

export const taskRoutes = router;

