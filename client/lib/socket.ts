import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

let socket: Socket | null = null;

export const initSocket = (): Socket => {
  if (!socket) {
    socket = io("http://localhost:4000", {
      auth: { token: Cookies.get("token") },
      transports: ["websocket"], // Force WS to avoid polling delay/failure
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connect error:", err.message);
    });
  }

  return socket;
};

export const getSocket = (): Socket | null => socket;
