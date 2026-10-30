import { Task as SharedTask, TaskStatus, TaskPriority } from "@taskflow/shared";
import { prisma } from "../config/database";
import { CreateTaskInput, UpdateTaskInput } from "../validators/task.validator";
import { logger } from "../utils/logger";

// In-memory fallback cache for when database connection is unavailable
const memoryTasks: Map<string, SharedTask> = new Map([
  [
    "task-1",
    {
      id: "task-1",
      title: "Design the TaskFlow real-time board architecture",
      description: "Define database schemas, Socket.io rooms, and state management flow.",
      status: "DONE",
      priority: "HIGH",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  [
    "task-2",
    {
      id: "task-2",
      title: "Integrate Redis Pub/Sub adapter for Socket.io",
      description: "Ensure multi-node horizontal scaling across AWS EC2 instances.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    "task-3",
    {
      id: "task-3",
      title: "Implement AI task breakdown with structured JSON output",
      description: "Connect to LLM endpoint with Zod schema validation and fallback heuristics.",
      status: "TODO",
      priority: "MEDIUM",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
]);

export class TaskRepository {
  private useMemoryFallback = false;

  public enableMemoryFallback(): void {
    this.useMemoryFallback = true;
  }

  private formatTask(t: any): SharedTask {
    return {
      id: t.id,
      title: t.title,
      description: t.description || "",
      status: t.status as TaskStatus,
      priority: t.priority as TaskPriority,
      createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt),
      updatedAt: t.updatedAt instanceof Date ? t.updatedAt.toISOString() : String(t.updatedAt),
    };
  }

  async findAll(): Promise<SharedTask[]> {
    if (this.useMemoryFallback) {
      return Array.from(memoryTasks.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    try {
      const tasks = await prisma.task.findMany({
        orderBy: { createdAt: "desc" },
      });
      return tasks.map((t) => this.formatTask(t));
    } catch (error) {
      this.useMemoryFallback = true;
      logger.warn("PostgreSQL unavailable, utilizing in-memory task store fallback:", (error as Error).message);
      return Array.from(memoryTasks.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  }

  async findById(id: string): Promise<SharedTask | null> {
    if (this.useMemoryFallback) {
      return memoryTasks.get(id) || null;
    }
    try {
      const task = await prisma.task.findUnique({ where: { id } });
      return task ? this.formatTask(task) : null;
    } catch (error) {
      this.useMemoryFallback = true;
      logger.warn("PostgreSQL unavailable, searching in-memory task store:", (error as Error).message);
      return memoryTasks.get(id) || null;
    }
  }

  async create(data: CreateTaskInput): Promise<SharedTask> {
    if (this.useMemoryFallback) {
      const id = "task-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
      const newTask: SharedTask = {
        id,
        title: data.title,
        description: data.description || "",
        status: (data.status as TaskStatus) || "TODO",
        priority: (data.priority as TaskPriority) || "MEDIUM",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryTasks.set(id, newTask);
      return newTask;
    }
    try {
      const task = await prisma.task.create({
        data: {
          title: data.title,
          description: data.description || "",
          status: (data.status as any) || "TODO",
          priority: (data.priority as any) || "MEDIUM",
        },
      });
      const formatted = this.formatTask(task);
      memoryTasks.set(formatted.id, formatted);
      return formatted;
    } catch (error) {
      this.useMemoryFallback = true;
      logger.warn("PostgreSQL unavailable, persisting to in-memory task store:", (error as Error).message);
      const id = "task-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
      const newTask: SharedTask = {
        id,
        title: data.title,
        description: data.description || "",
        status: (data.status as TaskStatus) || "TODO",
        priority: (data.priority as TaskPriority) || "MEDIUM",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryTasks.set(id, newTask);
      return newTask;
    }
  }

  async update(id: string, data: UpdateTaskInput): Promise<SharedTask | null> {
    if (this.useMemoryFallback) {
      const existing = memoryTasks.get(id);
      if (!existing) return null;
      const updated: SharedTask = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      memoryTasks.set(id, updated);
      return updated;
    }
    try {
      const task = await prisma.task.update({
        where: { id },
        data: {
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.status !== undefined ? { status: data.status as any } : {}),
          ...(data.priority !== undefined ? { priority: data.priority as any } : {}),
        },
      });
      const formatted = this.formatTask(task);
      memoryTasks.set(formatted.id, formatted);
      return formatted;
    } catch (error) {
      this.useMemoryFallback = true;
      logger.warn("PostgreSQL unavailable, updating in-memory task store:", (error as Error).message);
      const existing = memoryTasks.get(id);
      if (!existing) return null;
      const updated: SharedTask = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      memoryTasks.set(id, updated);
      return updated;
    }
  }

  async delete(id: string): Promise<boolean> {
    if (this.useMemoryFallback) {
      if (memoryTasks.has(id)) {
        memoryTasks.delete(id);
        return true;
      }
      return false;
    }
    try {
      await prisma.task.delete({ where: { id } });
      memoryTasks.delete(id);
      return true;
    } catch (error) {
      this.useMemoryFallback = true;
      logger.warn("PostgreSQL unavailable, deleting from in-memory task store:", (error as Error).message);
      if (memoryTasks.has(id)) {
        memoryTasks.delete(id);
        return true;
      }
      return false;
    }
  }

  async bulkCreate(tasks: CreateTaskInput[]): Promise<SharedTask[]> {
    const created: SharedTask[] = [];
    for (const taskData of tasks) {
      const task = await this.create(taskData);
      created.push(task);
    }
    return created;
  }
}

export const taskRepository = new TaskRepository();
