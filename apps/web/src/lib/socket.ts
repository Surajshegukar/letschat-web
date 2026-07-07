import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Connect to the Socket.IO server.
 */
export function connectSocket(token: string): Socket {
  if (socket) {
    if (socket.connected) return socket;
    socket.connect();
    return socket;
  }

  let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  // Remove trailing /api or /api/ to point to the server root for Socket.IO
  apiUrl = apiUrl.replace(/\/api\/?$/, "");

  socket = io(apiUrl, {
    autoConnect: true,
    auth: {
      token,
    },
    transports: ["websocket"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
}

/**
 * Disconnect from the Socket.IO server.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Get the active socket instance.
 */
export function getSocket(): Socket | null {
  return socket;
}
