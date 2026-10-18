"use client";
import type { ConversationUpdated, MessageCreated } from "@/lib/chat-state";
import { useEffect, useRef } from "react";
import { useRealtimeStore } from "@/stores/realtime-store";
type RealtimeHandlers = {
  onConversationUpdated?: (event: ConversationUpdated) => void;
  onMessageCreated?: (event: MessageCreated) => void;
};
export function useRealtime(onRefresh: () => void, enabled = true, handlers: RealtimeHandlers = {}) {
  const callback = useRef(onRefresh);
  const eventHandlers = useRef(handlers);
  const socket = useRealtimeStore((state) => state.socket);
  const connected = useRealtimeStore((state) => state.connected);
  useEffect(() => {
    callback.current = onRefresh;
    eventHandlers.current = handlers;
  }, [onRefresh, handlers]);
  useEffect(() => {
    if (!enabled || !socket) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => callback.current(), 75);
    };
    const conversationUpdated = (event: ConversationUpdated) => {
      if (eventHandlers.current.onConversationUpdated) eventHandlers.current.onConversationUpdated(event);
      else refresh();
    };
    const messageCreated = (event: MessageCreated) => eventHandlers.current.onMessageCreated?.(event);
    socket.on("connect", refresh);
    socket.on("workspace.updated", refresh);
    socket.on("message.update", conversationUpdated);
    socket.on("message.sent", messageCreated);
    if (socket.connected) refresh();
    return () => {
      clearTimeout(timer);
      socket.off("connect", refresh);
      socket.off("workspace.updated", refresh);
      socket.off("message.update", conversationUpdated);
      socket.off("message.sent", messageCreated);
    };
  }, [enabled, socket]);
  return enabled && connected;
}
