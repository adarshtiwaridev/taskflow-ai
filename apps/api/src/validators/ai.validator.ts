import { z } from "zod";
import { taskPriorityEnum } from "./task.validator";

export const aiBreakdownRequestSchema = z.object({
  goal: z
    .string()
    .trim()
    .min(3, "Goal must be at least 3 characters")
    .max(500, "Goal cannot exceed 500 characters"),
  context: z.string().max(1000, "Context cannot exceed 1000 characters").optional(),
  maxTasks: z.coerce.number().int().min(1).max(15).optional().default(5),
});

export const aiSubtaskSchema = z.object({
  title: z.string().trim().min(1, "Subtask title is required").max(200),
  description: z.string().max(1000).default(""),
  priority: taskPriorityEnum.default("MEDIUM"),
  order: z.number().int().nonnegative().default(0),
});

export const aiBreakdownResponseSchema = z.object({
  goal: z.string(),
  subtasks: z.array(aiSubtaskSchema).min(1, "LLM must return at least one subtask"),
  summary: z.string().optional(),
});

export type AIBreakdownRequestInput = z.infer<typeof aiBreakdownRequestSchema>;
export type AISubtaskInput = z.infer<typeof aiSubtaskSchema>;
export type AIBreakdownResponseInput = z.infer<typeof aiBreakdownResponseSchema>;
