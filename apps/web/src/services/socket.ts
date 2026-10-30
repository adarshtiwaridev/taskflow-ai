import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "@taskflow/shared";
import { WS_URL } from "../config/constants";

export type TaskSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: TaskSocket | null = null;

export const getSocket = (): TaskSocket => {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return socket;
};

