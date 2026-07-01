"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Commented out socket connection for static mode
    /*
    const siteUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const socketInstance = io(siteUrl, {
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Socket.IO connected to backend");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket.IO disconnected from backend");
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
    */
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
