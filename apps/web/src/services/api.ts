import {
  Task,
  CreateTaskDTO,
  UpdateTaskDTO,
  AITaskBreakdownRequest,
  AITaskBreakdownResponse,
  ApiResponse,
} from "@taskflow/shared";
import { API_URL } from "../config/constants";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options?.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  const data: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    error: { message: `Request failed with status ${response.status}` },
    timestamp: new Date().toISOString(),
  }));

  if (!response.ok || !data.success) {
    throw new Error(data.error?.message || `HTTP ${response.status}: Request failed`);
  }

  return data.data as T;
}

export const api = {
  getTasks: (): Promise<Task[]> => request<Task[]>("/api/tasks"),
  getTaskById: (id: string): Promise<Task> => request<Task>(`/api/tasks/${id}`),
  createTask: (data: CreateTaskDTO): Promise<Task> =>
    request<Task>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTask: (id: string, updates: UpdateTaskDTO): Promise<Task> =>
    request<Task>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),
  deleteTask: (id: string): Promise<{ id: string; message: string }> =>
    request<{ id: string; message: string }>(`/api/tasks/${id}`, {
      method: "DELETE",
    }),
  bulkCreateTasks: (tasks: CreateTaskDTO[]): Promise<Task[]> =>
    request<Task[]>("/api/tasks/bulk", {
      method: "POST",
      body: JSON.stringify({ tasks }),
    }),
  breakdownGoal: (data: AITaskBreakdownRequest): Promise<AITaskBreakdownResponse> =>
    request<AITaskBreakdownResponse>("/api/ai/breakdown", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

