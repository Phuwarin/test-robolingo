"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRealtimeStore } from "@/stores/realtime-store";
import { conversationsQuery, messagesQuery } from "@/lib/api-queries";
import { refreshWorkspace } from "@/lib/realtime-cache";
import { useMarkRead } from "./use-mark-read";
import { useSendMessage } from "./use-send-message";

export function useChat() {
  const client = useQueryClient();
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const selected = params.id || "";
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const connected = useRealtimeStore((state) => state.connected);
  const list = useQuery(conversationsQuery());
  const history = useQuery({ ...messagesQuery(selected), enabled: !!selected });
  const storedConversations = list.data || [];
  const messages = history.data || [];
  const conversation = storedConversations.find((item) => item.id === selected);
  const isBlocked = conversation?.friendStatus === "unfollow";
  const loadingHistory = !!selected && history.isPending;
  const readingRoomId = useMarkRead({ selected, messages, loadingHistory, error, historyFailed: !!history.error, setError });
  const { draft, setDraft, send, busy } = useSendMessage({ selected, connected, isBlocked, setError });
  // Hide the transient unread badge while this room is being read; keep server counts in the cache.
  const conversations = storedConversations.map((item) => {
    return item.id === readingRoomId ? { ...item, unreadCount: 0 } : item;
  });

  useEffect(() => {
    setDraft("");
    setError("");
  }, [selected, setDraft]);

  async function refresh() {
    setError("");
    await refreshWorkspace(client);
  }
  function selectConversation(id: string) {
    router.push(`/chat/${encodeURIComponent(id)}`, { scroll: false });
    setDraft("");
    setError("");
  }
  return {
    conversations,
    messages,
    selected,
    query,
    setQuery,
    draft,
    setDraft,
    error: error || list.error?.message || history.error?.message || "",
    busy,
    refreshing: list.isFetching,
    loadingHistory,
    connected,
    refresh,
    send,
    conversation,
    isBlocked,
    selectConversation,
  };
}
