"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRealtimeConnection } from "@/providers/realtime-provider";
import { conversationKey, conversationsQuery, messageKey, messagesQuery, fetchJson } from "@/lib/api-queries";
import { updateConversationCache, refreshWorkspace } from "@/lib/realtime-cache";
import { mergeConversation, type Conversation, type ChatMessage as Message } from "@/lib/chat-state";
import { samples, sampleMessages } from "@/app/chat/_lib/chat-demo";

export function useChat() {
  const client = useQueryClient();
  const [mode, setMode] = useState<"live" | "demo">("live");
  const [demoConversations, setDemoConversations] = useState(samples);
  const [demoMessages, setDemoMessages] = useState(sampleMessages);
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [viewActive, setViewActive] = useState(false);
  const readInFlight = useRef(new Set<string>());
  const initialSelectionHandled = useRef(false);
  const { connected, setReadingRoomId } = useRealtimeConnection();
  const list = useQuery({ ...conversationsQuery(), enabled: mode === "live" });
  const history = useQuery({ ...messagesQuery(selected), enabled: mode === "live" && !!selected });
  const storedConversations = mode === "demo" ? demoConversations : list.data || [];
  const messages = mode === "demo" ? demoMessages : history.data || [];
  const conversation = storedConversations.find((item) => item.id === selected);
  const isBlocked = conversation?.friendStatus === "unfollow";
  const loadingHistory = mode === "live" && !!selected && history.isPending;
  const readingRoomId = mode === "live" && viewActive && !loadingHistory && !history.error && !error ? selected : "";
  // Hide the transient unread badge while this room is being read; keep server counts in the cache.
  const conversations = storedConversations.map((item) => {
    return item.id === readingRoomId ? { ...item, unreadCount: 0 } : item;
  });

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
  useEffect(() => {
    if (mode !== "live" || !list.data || initialSelectionHandled.current) return;
    initialSelectionHandled.current = true;
    const requestedUser = new URLSearchParams(window.location.search).get("user");
    if (requestedUser && list.data.some((item) => item.id === requestedUser)) {
      setSelected(requestedUser);
    }
  }, [list.data, mode]);

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
    if (mode !== "live" || !selected || !viewActive || loadingHistory) return;
    const messageIds = messages
      .filter((message) => {
        return message.lineUserId === selected && message.direction === "received" && !message.readAt && !readInFlight.current.has(message.id);
      })
      .slice(0, 1000)
      .map((message) => message.id);
    if (!messageIds.length) return;
    messageIds.forEach((id) => readInFlight.current.add(id));
    markRead({ lineUserId: selected, messageIds });
  }, [messages, selected, viewActive, mode, loadingHistory, markRead]);

  const sendMutation = useMutation({
    mutationFn: (data: { to: string; text: string }) => {
      return fetchJson("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    },
  });
  async function refresh() {
    setError("");
    if (mode === "demo") {
      setMode("live");
      setSelected("");
    }
    await refreshWorkspace(client);
  }
  function demo() {
    setMode("demo");
    setDemoConversations(samples);
    setDemoMessages(sampleMessages);
    setSelected(samples[0].id);
    setError("");
  }
  async function send(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim() || !selected || sendMutation.isPending || isBlocked) return;
    setError("");
    const data = { to: selected, text: draft.trim() };
    try {
      if (mode === "demo") {
        const message: Message = {
          id: crypto.randomUUID(),
          lineUserId: selected,
          direction: "botSent",
          body: data.text,
          createdAt: new Date().toISOString(),
        };
        setDemoMessages((current) => [...current, message]);
        setDemoConversations((current) => {
          const room = current.find((item) => item.id === selected)!;
          return mergeConversation(current, { ...room, lastMessage: { body: data.text }, lastMessageTime: message.createdAt });
        });
      } else {
        await sendMutation.mutateAsync(data);
        if (!connected) {
          await Promise.all([client.invalidateQueries({ queryKey: conversationKey }), client.invalidateQueries({ queryKey: messageKey(data.to) })]);
        }
      }
      setDraft("");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "ส่งไม่ได้");
    }
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
    busy: sendMutation.isPending,
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
