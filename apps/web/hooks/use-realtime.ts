"use client";
import type { ConversationUpdated, MessageCreated } from "@/lib/chat-state";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

type RealtimeHandlers = { onConversationUpdated?: (event: ConversationUpdated) => void; onMessageCreated?: (event: MessageCreated) => void };

export function useRealtime(onRefresh: () => void, enabled = true, handlers: RealtimeHandlers = {}) {
  const callback = useRef(onRefresh);
  const eventHandlers = useRef(handlers);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    callback.current = onRefresh;
    eventHandlers.current = handlers;
  }, [onRefresh, handlers]);

  useEffect(() => {
    if (!enabled) {
      setConnected(false);
      return;
    }
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4099", { transports: ["websocket"] });
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => callback.current(), 75);
    };
    socket.on("connect", () => {
      setConnected(true);
      refresh();
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));
    socket.on("workspace.updated", refresh);
    socket.on("message.update", (event: ConversationUpdated) => {
      if (eventHandlers.current.onConversationUpdated) eventHandlers.current.onConversationUpdated(event);
      else refresh();
    });
    socket.on("message.sent", (event: MessageCreated) => eventHandlers.current.onMessageCreated?.(event));
    return () => {
      clearTimeout(timer);
      socket.disconnect();
    };
  }, [enabled]);

  return connected;
}
