import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

const SOCKET_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

export interface ChatMessage {
  userName: string;
  message: string;
  at: string;
}

export function useSocket(roomId: string, userName: string) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-room", { roomId, userName });
    });

    socket.on("chat-message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("disconnect", () => setConnected(false));

    return () => {
      socket.disconnect();
    };
  }, [roomId, userName]);

  const sendMessage = (message: string) => {
    if (!message.trim() || !socketRef.current) return;
    socketRef.current.emit("chat-message", { roomId, message: message.trim() });
  };

  return { messages, connected, sendMessage };
}
