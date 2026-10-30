import { Server, Socket } from "socket.io";
import { ServerToClientEvents, ClientToServerEvents, Task } from "@taskflow/shared";
import { taskRepository } from "../repositories/task.repository";
import { logger } from "../utils/logger";

let ioInstance: Server<ClientToServerEvents, ServerToClientEvents> | null = null;
const roomUserCounts = new Map<string, number>();

export const initSocketHandler = (io: Server<ClientToServerEvents, ServerToClientEvents>): void => {
  ioInstance = io;

  io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    logger.info(`Socket client connected: ${socket.id}`);
    let currentRoom = "board:default";

    // Auto-join default board
    socket.join(currentRoom);
    const count = (roomUserCounts.get(currentRoom) || 0) + 1;
    roomUserCounts.set(currentRoom, count);

    // Initial sync
    taskRepository.findAll().then((tasks) => {
      socket.emit("board:sync", { tasks, activeUsers: count });
    });

    socket.to(currentRoom).emit("user:joined", { userId: socket.id, activeUsers: count });

    socket.on("board:join", async ({ boardId }: { boardId: string }) => {
      socket.leave(currentRoom);
      const prevCount = Math.max((roomUserCounts.get(currentRoom) || 1) - 1, 0);
      roomUserCounts.set(currentRoom, prevCount);
      socket.to(currentRoom).emit("user:left", { userId: socket.id, activeUsers: prevCount });

      currentRoom = `board:${boardId}`;
      socket.join(currentRoom);
      const newCount = (roomUserCounts.get(currentRoom) || 0) + 1;
      roomUserCounts.set(currentRoom, newCount);

      const tasks = await taskRepository.findAll();
      socket.emit("board:sync", { tasks, activeUsers: newCount });
      socket.to(currentRoom).emit("user:joined", { userId: socket.id, activeUsers: newCount });
    });

    socket.on("board:leave", ({ boardId }: { boardId: string }) => {
      const room = `board:${boardId}`;
      socket.leave(room);
      const c = Math.max((roomUserCounts.get(room) || 1) - 1, 0);
      roomUserCounts.set(room, c);
      socket.to(room).emit("user:left", { userId: socket.id, activeUsers: c });
    });

    socket.on("disconnect", () => {
      const c = Math.max((roomUserCounts.get(currentRoom) || 1) - 1, 0);
      roomUserCounts.set(currentRoom, c);
      socket.to(currentRoom).emit("user:left", { userId: socket.id, activeUsers: c });
      logger.info(`Socket client disconnected: ${socket.id}`);
    });
  });
};

export const getIO = (): Server<ClientToServerEvents, ServerToClientEvents> | null => ioInstance;

export const broadcastTaskCreated = (task: Task, room = "board:default"): void => {
  if (ioInstance) {
    ioInstance.to(room).emit("task:created", task);
  }
};

export const broadcastTaskUpdated = (task: Task, room = "board:default"): void => {
  if (ioInstance) {
    ioInstance.to(room).emit("task:updated", task);
  }
};

export const broadcastTaskDeleted = (taskId: string, room = "board:default"): void => {
  if (ioInstance) {
    ioInstance.to(room).emit("task:deleted", taskId);
  }
};

export const broadcastBatchTasksCreated = (tasks: Task[], room = "board:default"): void => {
  if (ioInstance) {
    ioInstance.to(room).emit("tasks:batch-created", tasks);
  }
};

