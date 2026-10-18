"use client";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRealtimeStore } from "@/stores/realtime-store";
import { conversationsQuery, messagesQuery } from "@/lib/api-queries";
import { refreshWorkspace } from "@/lib/realtime-cache";
import { useChatDemo } from "./use-chat-demo";
import { useMarkRead } from "./use-mark-read";
import { useSendMessage } from "./use-send-message";

export function useChat() {
  const client = useQueryClient();
  const { mode, demoConversations, demoMessages, startDemo, stopDemo, sendDemoMessage } = useChatDemo();
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const initialSelectionHandled = useRef(false);
  const connected = useRealtimeStore((state) => state.connected);
  const list = useQuery({ ...conversationsQuery(), enabled: mode === "live" });
  const history = useQuery({ ...messagesQuery(selected), enabled: mode === "live" && !!selected });
  const storedConversations = mode === "demo" ? demoConversations : list.data || [];
  const messages = mode === "demo" ? demoMessages : history.data || [];
  const conversation = storedConversations.find((item) => item.id === selected);
  const isBlocked = conversation?.friendStatus === "unfollow";
  const loadingHistory = mode === "live" && !!selected && history.isPending;
  const readingRoomId = useMarkRead({ mode, selected, messages, loadingHistory, error, historyFailed: !!history.error, setError });
  const { draft, setDraft, send, busy } = useSendMessage({ mode, selected, connected, isBlocked, setError, sendDemoMessage });
  // Hide the transient unread badge while this room is being read; keep server counts in the cache.
  const conversations = storedConversations.map((item) => {
    return item.id === readingRoomId ? { ...item, unreadCount: 0 } : item;
  });

  useEffect(() => {
    if (mode !== "live" || !list.data || initialSelectionHandled.current) return;
    initialSelectionHandled.current = true;
    const requestedUser = new URLSearchParams(window.location.search).get("user");
    if (requestedUser && list.data.some((item) => item.id === requestedUser)) {
      setSelected(requestedUser);
    }
  }, [list.data, mode]);

  async function refresh() {
    setError("");
    if (mode === "demo") {
      stopDemo();
      setSelected("");
    }
    await refreshWorkspace(client);
  }
  function demo() {
    setSelected(startDemo());
    setError("");
  }
  function selectConversation(id: string) {
    setSelected(id);
    setDraft("");
    setError("");
  }
  return {
    mode,
    conversations,
    messages,
    selected,
    query,
    setQuery,
    draft,
    setDraft,
    error: error || (mode === "live" ? list.error?.message || history.error?.message || "" : ""),
    busy,
    refreshing: list.isFetching,
    loadingHistory,
    connected,
    refresh,
    demo,
    send,
    conversation,
    isBlocked,
    selectConversation,
  };
}
