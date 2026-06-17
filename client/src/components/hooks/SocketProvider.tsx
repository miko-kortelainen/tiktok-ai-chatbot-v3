import { createContext, use, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
    const newSocket = io(socketUrl, {
      withCredentials: true,
    });

    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, []);

  // dont render children if no socket yet
  if (!socket) return null;

  return <SocketContext value={socket}>{children}</SocketContext>;
};

export const useSocket = () => {
  const context = use(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
