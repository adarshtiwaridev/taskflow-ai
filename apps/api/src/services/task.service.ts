import { Task } from "@taskflow/shared";
import { taskRepository } from "../repositories/task.repository";
import { CreateTaskInput, UpdateTaskInput } from "../validators/task.validator";
import { NotFoundError } from "../utils/errors";
import {
  broadcastTaskCreated,
  broadcastTaskUpdated,
  broadcastTaskDeleted,
  broadcastBatchTasksCreated,
} from "../sockets/socketHandler";

export class TaskService {
  async getAllTasks(): Promise<Task[]> {
    return taskRepository.findAll();
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new NotFoundError(`Task with ID "${id}" was not found`);
    }
    return task;
  }

  async createTask(data: CreateTaskInput): Promise<Task> {
    const task = await taskRepository.create(data);
    broadcastTaskCreated(task);
    return task;
  }

  async updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
    const task = await taskRepository.update(id, data);
    if (!task) {
      throw new NotFoundError(`Task with ID "${id}" was not found`);
    }
    broadcastTaskUpdated(task);
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    const deleted = await taskRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Task with ID "${id}" was not found`);
    }
    broadcastTaskDeleted(id);
  }

  async bulkCreateTasks(tasks: CreateTaskInput[]): Promise<Task[]> {
    const created = await taskRepository.bulkCreate(tasks);
    broadcastBatchTasksCreated(created);
    return created;
  }
}

export const taskService = new TaskService();

