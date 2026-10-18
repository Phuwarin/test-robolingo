"use client";
import { useEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateConversationCache, updateMessageCache, refreshWorkspace } from "@/lib/realtime-cache";
import type { ConversationUpdated, MessageCreated } from "@/lib/chat-state";
import { io } from "socket.io-client";
import { useRealtimeStore } from "@/stores/realtime-store";
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient();
  useEffect(() => {
    const connection = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4099", { transports: ["websocket"], autoConnect: false });
    connection.on("connect", () => {
      useRealtimeStore.setState({ connected: true });
      void refreshWorkspace(client);
    });
    connection.on("workspace.updated", () => void refreshWorkspace(client));
    connection.on("message.update", (event: ConversationUpdated) => updateConversationCache(client, event));
    connection.on("message.sent", (event: MessageCreated) => updateMessageCache(client, event));
    connection.on("disconnect", () => useRealtimeStore.setState({ connected: false }));
    connection.on("connect_error", () => useRealtimeStore.setState({ connected: false }));
    useRealtimeStore.setState({ socket: connection });
    connection.connect();
    return () => {
      connection.disconnect();
      connection.removeAllListeners();
      useRealtimeStore.setState({ socket: null, connected: false, readingRoomId: "" });
    };
  }, [client]);
  return children;
}
