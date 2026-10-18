"use client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateConversationCache, updateMessageCache, refreshWorkspace } from "@/lib/realtime-cache";
import type { ConversationUpdated, MessageCreated } from "@/lib/chat-state";
import { io, type Socket } from "socket.io-client";
type RealtimeContextValue = {
  socket: Socket | null;
  connected: boolean;
};
const RealtimeContext = createContext<RealtimeContextValue | null>(null);
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    const connection = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4099", { transports: ["websocket"], autoConnect: false });
    connection.on("connect", () => {
      setConnected(true);
      void refreshWorkspace(client);
    });
    connection.on("workspace.updated", () => void refreshWorkspace(client));
    connection.on("message.update", (event: ConversationUpdated) => updateConversationCache(client, event));
    connection.on("message.sent", (event: MessageCreated) => updateMessageCache(client, event));
    connection.on("disconnect", () => setConnected(false));
    connection.on("connect_error", () => setConnected(false));
    setSocket(connection);
    connection.connect();
    return () => {
      connection.disconnect();
      connection.removeAllListeners();
    };
  }, [client]);
  const value = useMemo(() => ({ socket, connected }), [socket, connected]);
  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}
export function useRealtimeConnection() {
  const context = useContext(RealtimeContext);
  if (!context) throw new Error("useRealtime must be used within RealtimeProvider");
  return context;
}
