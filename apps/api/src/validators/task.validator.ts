import { z } from "zod";

export const taskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
export const taskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title cannot exceed 200 characters"),
  description: z.string().max(2000, "Description cannot exceed 2000 characters").optional().default(""),
  status: taskStatusEnum.optional().default("TODO"),
  priority: taskPriorityEnum.optional().default("MEDIUM"),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Title cannot be empty").max(200, "Title cannot exceed 200 characters").optional(),
    description: z.string().max(2000, "Description cannot exceed 2000 characters").optional(),
    status: taskStatusEnum.optional(),
    priority: taskPriorityEnum.optional(),
  })
  .refine(
    (data) => data.title !== undefined || data.description !== undefined || data.status !== undefined || data.priority !== undefined,
    { message: "At least one field (title, description, status, priority) must be provided for update" }
  );

export const taskIdParamSchema = z.object({
  id: z.string().trim().min(1, "Task ID is required"),
});

export const bulkCreateTasksSchema = z.object({
  tasks: z
    .array(createTaskSchema)
    .min(1, "At least one task is required")
    .max(50, "Cannot bulk create more than 50 tasks at once"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type BulkCreateTasksInput = z.infer<typeof bulkCreateTasksSchema>;
