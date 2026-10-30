export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface AISubtask {
  title: string;
  description: string;
  priority: TaskPriority;
  order: number;
}

export interface AITaskBreakdownRequest {
  goal: string;
  context?: string;
  maxTasks?: number;
}

export interface AITaskBreakdownResponse {
  goal: string;
  subtasks: AISubtask[];
  summary?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  timestamp: string;
}

export interface BoardSyncData {
  tasks: Task[];
  activeUsers: number;
}

export interface ServerToClientEvents {
  "task:created": (task: Task) => void;
  "task:updated": (task: Task) => void;
  "task:deleted": (taskId: string) => void;
  "tasks:batch-created": (tasks: Task[]) => void;
  "user:joined": (data: { userId: string; activeUsers: number }) => void;
  "user:left": (data: { userId: string; activeUsers: number }) => void;
  "board:sync": (data: BoardSyncData) => void;
  "error:notification": (message: string) => void;
}

export interface ClientToServerEvents {
  "board:join": (data: { boardId: string; user?: string }) => void;
  "board:leave": (data: { boardId: string }) => void;
  "task:create": (data: CreateTaskDTO) => void;
  "task:update": (data: { id: string; updates: UpdateTaskDTO }) => void;
  "task:delete": (data: { id: string }) => void;
}
