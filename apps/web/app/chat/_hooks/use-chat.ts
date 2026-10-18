"use client";
import { useEffect, useRef, useState } from "react";
import { useRealtime } from "@/hooks/use-realtime";
import { mergeConversation, mergeMessage, type Conversation, type ChatMessage as Message } from "@/lib/chat-state";
import { samples, sampleMessages } from "@/app/chat/_lib/chat-demo";
export function useChat() {
  const [mode, setMode] = useState<"live" | "demo">("live"),
    [conversations, setConversations] = useState<Conversation[]>([]),
    [messages, setMessages] = useState<Message[]>([]),
    [selected, setSelected] = useState(""),
    [query, setQuery] = useState(""),
    [draft, setDraft] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [refreshing, setRefreshing] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const readInFlight = useRef(new Set<string>());
  const [viewActive, setViewActive] = useState(false);
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
  async function refresh() {
    setRefreshing(true);
    try {
      const response = await fetch("/api/conversations");
      if (response.status === 401) {
        demo();
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (!Array.isArray(data.conversations)) throw new Error("รูปแบบข้อมูลรายการแชทไม่ถูกต้อง กรุณาตรวจสอบว่า API รันโค้ดล่าสุดแล้วกดรีเฟรช");
      const incoming: Conversation[] = data.conversations;
      setConversations((current) => (mode === "demo" ? incoming : incoming.reduce(mergeConversation, current)));
      if (mode === "demo") setMessages([]);
      setHistoryVersion((value) => value + 1);
      setMode("live");
      setSelected((value) => {
        const wanted = new URLSearchParams(window.location.search).get("user") || value;
        return incoming.some((c) => c.id === wanted) ? wanted : incoming[0]?.id || "";
      });
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "เชื่อมต่อไม่ได้");
    } finally {
      setRefreshing(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  const connected = useRealtime(() => void refresh(), mode === "live", {
    onConversationUpdated: (event) => {
      if (!event.conversation) {
        void refresh();
        return;
      }
      setConversations((current) => mergeConversation(current, event.conversation));
      if (event.readReceipt) {
        const ids = new Set(event.readReceipt.messageIds);
        const readAt = event.readReceipt.readAt;
        setMessages((current) => current.map((message) => (ids.has(message.id) ? { ...message, readAt } : message)));
      }
      setSelected((current) => current || event.lineUserId);
    },
    onMessageCreated: (event) => {
      if (event.lineUserId === selected) setMessages((current) => mergeMessage(current, event.message));
    },
  });
  useEffect(() => {
    if (mode !== "live" || !selected) return;
    const controller = new AbortController();
    setLoadingHistory(true);
    void (async () => {
      try {
        const response = await fetch(`/api/messages?lineUserId=${encodeURIComponent(selected)}`, { signal: controller.signal, cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "โหลดข้อความไม่สำเร็จ");
        if (!Array.isArray(data)) throw new Error("รูปแบบข้อมูลข้อความไม่ถูกต้อง กรุณาตรวจสอบว่า API รันโค้ดล่าสุด");
        const incoming: Message[] = data;
        if (!controller.signal.aborted) setMessages((current) => incoming.reduce(mergeMessage, current));
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "โหลดข้อความไม่สำเร็จ");
      } finally {
        if (!controller.signal.aborted) setLoadingHistory(false);
      }
    })();
    return () => controller.abort();
  }, [selected, mode, historyVersion]);
  useEffect(() => {
    if (mode !== "live" || !selected || !viewActive || loadingHistory) return;
    const ids = messages
      .filter((message) => message.lineUserId === selected && message.direction === "received" && !message.readAt && !readInFlight.current.has(message.id))
      .slice(0, 1000)
      .map((message) => message.id);
    if (!ids.length) return;
    ids.forEach((id) => readInFlight.current.add(id));
    void (async () => {
      try {
        const response = await fetch(`/api/conversations/${encodeURIComponent(selected)}/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageIds: ids }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "อัปเดตสถานะอ่านไม่สำเร็จ");
        setConversations((current) => {
          const conversation = current.find((conversation) => conversation.id === selected);
          return conversation ? mergeConversation(current, { ...conversation, unreadCount: data.unreadCount, updatedAt: data.updatedAt }) : current;
        });
        const readIds = new Set<string>(data.messageIds);
        setMessages((current) => current.map((message) => (readIds.has(message.id) ? { ...message, readAt: data.readAt } : message)));
      } catch (error) {
        setError(error instanceof Error ? error.message : "อัปเดตสถานะอ่านไม่สำเร็จ");
      } finally {
        ids.forEach((id) => readInFlight.current.delete(id));
      }
    })();
  }, [messages, selected, viewActive, mode, loadingHistory]);
  function demo() {
    setMode("demo");
    setConversations(samples);
    setMessages(sampleMessages);
    setSelected(samples[0].id);
    setError("");
  }
  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !selected || busy || isBlocked) return;
    setBusy(true);
    setError("");
    const value = { to: selected, text: draft.trim() };
    try {
      if (mode === "demo") {
        const message: Message = { id: crypto.randomUUID(), lineUserId: selected, direction: "botSent", body: value.text, createdAt: new Date().toISOString() };
        setMessages((v) => [...v, message]);
        setConversations((v) => v.map((c) => (c.id === selected ? { ...c, lastMessage: { body: value.text }, lastMessageTime: message.createdAt } : c)));
      } else {
        const response = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (!connected) await refresh();
      }
      setDraft("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "ส่งไม่ได้");
    } finally {
      setBusy(false);
    }
  }
  const conversation = conversations.find((c) => c.id === selected);
  const isBlocked = conversation?.friendStatus === "unfollow";
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
    error,
    busy,
    refreshing,
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
