import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

const SOCKET_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

export interface ChatMessage {
  userName: string;
  message: string;
  at: string;
}

export function useSocket(
  roomId: string,
  userName: string,
  disabled: boolean = false,
  readyToJoin: boolean = true
) {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (disabled || !roomId) return;
    if (socketRef.current?.connected) return;

    const socketInst = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
    });

    socketRef.current = socketInst;
    setSocket(socketInst);

    socketInst.on("connect", () => {
      console.log("Socket connected:", socketInst.id);
      setConnected(true);
    });

    socketInst.on("chat-message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socketInst.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setConnected(false);
    });

    socketInst.on("connect_error", (err) => {
      console.error("Socket connect error:", err.message);
    });

    return () => {
      socketInst.removeAllListeners();
      socketInst.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [roomId, userName, disabled]);

  useEffect(() => {
    if (!socket || !connected || !readyToJoin || !roomId) return;

    console.log("Emitting join-room for room:", roomId);
    socket.emit("join-room", {
      roomId,
      userName,
    });
  }, [socket, connected, readyToJoin, roomId, userName]);

  const sendMessage = (message: string) => {
    if (!message.trim() || !socketRef.current) return;

    socketRef.current.emit("chat-message", {
      roomId,
      message: message.trim(),
    });
  };

  return {
    socket,
    messages,
    connected,
    sendMessage,
  };
}