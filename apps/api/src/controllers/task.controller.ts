import { Request, Response, NextFunction } from "express";
import { taskService } from "../services/task.service";
import { sendSuccess } from "../utils/apiResponse";

export class TaskController {
  async getAllTasks(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = await taskService.getAllTasks();
      sendSuccess(res, tasks);
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
      const task = await taskService.getTaskById(id);
      sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  }

  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.createTask(req.body);
      sendSuccess(res, task, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
      const task = await taskService.updateTask(id, req.body);
      sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
      await taskService.deleteTask(id);
      sendSuccess(res, { id, message: "Task deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  async bulkCreateTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = await taskService.bulkCreateTasks(req.body.tasks);
      sendSuccess(res, tasks, 201);
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
