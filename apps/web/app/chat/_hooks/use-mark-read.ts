"use client";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationKey, fetchJson } from "@/lib/api-queries";
import { updateConversationCache } from "@/lib/realtime-cache";
import type { Conversation, ChatMessage } from "@/lib/chat-state";
import { useRealtimeStore } from "@/stores/realtime-store";

type Options = {
  selected: string;
  messages: ChatMessage[];
  loadingHistory: boolean;
  error: string;
  historyFailed: boolean;
  setError: (error: string) => void;
};
export function useMarkRead({ selected, messages, loadingHistory, error, historyFailed, setError }: Options) {
  const client = useQueryClient();
  const [viewActive, setViewActive] = useState(false);
  const readInFlight = useRef(new Set<string>());
  const setReadingRoomId = useRealtimeStore((state) => state.setReadingRoomId);
  const readingRoomId = viewActive && !loadingHistory && !historyFailed && !error ? selected : "";
  useEffect(() => {
    setReadingRoomId(readingRoomId);
    return () => setReadingRoomId("");
  }, [readingRoomId, setReadingRoomId]);
  useEffect(() => {
    const update = () => setViewActive(document.visibilityState === "visible" && document.hasFocus());
    update();
    window.addEventListener("focus", update);
    window.addEventListener("blur", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.removeEventListener("focus", update);
      window.removeEventListener("blur", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const readMutation = useMutation({
    mutationFn: async ({ lineUserId, messageIds }: { lineUserId: string; messageIds: string[] }) =>
      fetchJson(`/api/conversations/${encodeURIComponent(lineUserId)}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageIds }),
      }),
    onSuccess: (data, { lineUserId }) => {
      const current = client.getQueryData<Conversation[]>(conversationKey)?.find((item) => item.id === lineUserId);
      if (current)
        updateConversationCache(client, {
          lineUserId,
          conversation: { ...current, unreadCount: data.unreadCount, updatedAt: data.updatedAt },
          readReceipt: { messageIds: data.messageIds, readAt: data.readAt },
        });
    },
    onError: (failure) => setError(failure.message),
    onSettled: (_data, _failure, { messageIds }) => messageIds.forEach((id) => readInFlight.current.delete(id)),
  });
  const markRead = readMutation.mutate;
  useEffect(() => {
    if (!selected || !viewActive || loadingHistory) return;
    const messageIds = messages
      .filter((message) => {
        return message.lineUserId === selected && message.direction === "received" && !message.readAt && !readInFlight.current.has(message.id);
      })
      .slice(0, 1000)
      .map((message) => message.id);
    if (!messageIds.length) return;
    messageIds.forEach((id) => readInFlight.current.add(id));
    markRead({ lineUserId: selected, messageIds });
  }, [messages, selected, viewActive, loadingHistory, markRead]);

  return readingRoomId;
}
