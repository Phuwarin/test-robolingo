"use client";
import { useRealtime } from "@/hooks/use-realtime";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Send, MessageCircle, UsersRound } from "lucide-react";
import Link from "next/link";
import { mergeConversation, mergeMessage, type Conversation, type ChatMessage as Message } from "@/lib/chat-state";
const samples: Conversation[] = [
  { id: "demo-1", name: "พิมพ์ชนก", lastMessage: { body: "สวัสดีค่ะ ขอสอบถามข้อมูลหน่อยค่ะ", createdAt: "2026-10-16T03:00:00Z" } },
  { id: "demo-2", name: "ธนกร", lastMessage: { body: "ขอบคุณครับ", createdAt: "2026-10-16T03:00:00Z" } },
];
const sampleMessages: Message[] = samples.map((c, i) => ({ id: `sample-${i}`, lineUserId: c.id, direction: "received", body: c.lastMessage?.body || "", createdAt: "2026-10-16T03:00:00Z" }));
export default function Home() {
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
  const bottom = useRef<HTMLDivElement>(null);
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
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selected]);
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
        setConversations((v) => v.map((c) => (c.id === selected ? { ...c, lastMessage: { body: value.text, createdAt: message.createdAt } } : c)));
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
  const filtered = conversations.filter((c) => (c.name + c.id + (c.lastMessage?.body || "")).toLowerCase().includes(query.toLowerCase()));
  return (
    <main className="chat-workspace">
      <header className="chat-topbar">
        <span>LINE Official Account</span>
        <span className="connection-label">
          <i />
          {mode === "demo" ? "ข้อมูลตัวอย่าง" : "กล่องข้อความ"}
        </span>
      </header>
      <section className="inbox">
        <aside className="conversation-list" aria-label="รายชื่อบทสนทนา">
          <div className="list-tabs">
            <span className="list-tab active">
              แชททั้งหมด <span>{conversations.length}</span>
              {conversations.some((conversation) => (conversation.unreadCount || 0) > 0) && (
                <Badge className="unread-badge" aria-label="ข้อความที่ยังไม่อ่านทั้งหมด">
                  {conversations.reduce((total, conversation) => total + (conversation.unreadCount || 0), 0)}
                </Badge>
              )}
            </span>
            <Button asChild variant="ghost" size="sm">
              <Link href="/users">
                <UsersRound size={15} />
                Users
              </Link>
            </Button>
          </div>
          <div className="list-search">
            <Search size={17} />
            <Input aria-label="ค้นหาบทสนทนา" placeholder="ค้นหาชื่อหรือข้อความ" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Button variant="ghost" size="icon" title="รีเฟรช" aria-label="รีเฟรช" disabled={refreshing} onClick={() => void refresh()}>
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </Button>
          </div>
          <div className="contacts">
            {filtered.map((c) => {
              const lastMessageAt = c.lastMessage?.createdAt;
              return (
                <Button
                  key={c.id}
                  variant="ghost"
                  className={`contact ${c.id === selected ? "active" : ""}`}
                  onClick={() => {
                    setSelected(c.id);
                    setDraft("");
                    setError("");
                  }}
                >
                  <Avatar className="avatar">
                    <AvatarImage src={c.pictureUrl || undefined} alt="" />
                    <AvatarFallback>{c.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <span className="contact-copy">
                    <span className="contact-title">
                      <strong>{c.name}</strong>
                      {lastMessageAt && <time dateTime={lastMessageAt}>{new Date(lastMessageAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</time>}
                    </span>
                    <span className="contact-preview">{c.lastMessage?.body || "เริ่มต้นบทสนทนา"}</span>
                  </span>
                  {!!c.unreadCount && (
                    <Badge className="unread-badge" aria-label={`${c.unreadCount} ข้อความที่ยังไม่อ่าน`}>
                      {c.unreadCount > 99 ? "99+" : c.unreadCount}
                    </Badge>
                  )}
                </Button>
              );
            })}
            {!filtered.length && (
              <div className="list-empty">
                <MessageCircle size={30} />
                <p>{query ? "ไม่พบบทสนทนาที่ค้นหา" : "ยังไม่มีบทสนทนา"}</p>
                <small>{query ? "ลองค้นหาด้วยชื่ออื่น" : "เมื่อผู้ใช้ทัก OA ข้อความจะแสดงที่นี่"}</small>
              </div>
            )}
          </div>
          <div className="aside-footer">
            <span>{mode === "demo" ? "โหมดทดลอง ไม่ส่งข้อความจริง" : connected ? "เชื่อมต่อเรียลไทม์" : "ขาดการเชื่อมต่อ · กดรีเฟรช"}</span>
            <Button variant="ghost" size="sm" onClick={mode === "demo" ? () => void refresh() : demo}>
              {mode === "demo" ? "ใช้ข้อมูลจริง" : "ดูตัวอย่าง"}
            </Button>
          </div>
        </aside>
        <article className="chat-detail" aria-label="บทสนทนา">
          {conversation ? (
            <>
              <div className="chat-header">
                <Avatar className="avatar">
                  <AvatarImage src={conversation.pictureUrl || undefined} alt="" />
                  <AvatarFallback>{conversation.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div>
                  <strong>{conversation.name}</strong>
                  <small>{conversation.id}</small>
                </div>
                <Badge variant="secondary" className="channel">
                  LINE
                </Badge>
              </div>
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <div className="thread">
                <div className="thread-note">บทสนทนากับ {conversation.name}</div>
                {loadingHistory && <p role="status">กำลังโหลดข้อความ…</p>}
                {messages
                  .filter((m) => m.lineUserId === selected)
                  .map((m) => (
                    <div key={m.id} className={`message ${m.direction}`}>
                      <div>{m.body}</div>
                      <time dateTime={m.createdAt}>
                        {m.direction === "botSent" ? "คุณ · " : ""}
                        {new Date(m.createdAt).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </time>
                    </div>
                  ))}
                <div ref={bottom} />
              </div>
              <form className="composer" onSubmit={send}>
                {isBlocked && (
                  <p className="blocked-notice" role="status">
                    ผู้ใช้บล็อก OA ไม่สามารถพิมพ์หรือส่งข้อความได้
                  </p>
                )}
                <label htmlFor="message" className="sr-only">
                  ข้อความตอบกลับ
                </label>
                <Textarea
                  id="message"
                  maxLength={5000}
                  disabled={isBlocked}
                  placeholder={isBlocked ? "ผู้ใช้บล็อก OA" : "พิมพ์ข้อความ…"}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      e.currentTarget.form?.requestSubmit();
                    }
                  }}
                />
                <div className="composer-actions">
                  <small>{mode === "demo" ? "โหมดทดลอง · ข้อความจะไม่ส่งไปยัง LINE" : "Enter เพื่อส่ง · Shift + Enter เพื่อขึ้นบรรทัดใหม่"}</small>
                  <Button type="submit" className="send-button" disabled={busy || !draft.trim() || isBlocked}>
                    <Send size={16} />
                    {busy ? "กำลังส่ง…" : "ส่ง"}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="welcome">
              <div className="welcome-icon">
                <MessageCircle size={48} strokeWidth={1.3} />
              </div>
              <h1>ทุกบทสนทนา เริ่มต้นที่นี่</h1>
              <p>เลือกแชททางด้านซ้าย เพื่ออ่านข้อความและตอบกลับ</p>
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <Button variant="outline" onClick={demo}>
                ดูตัวอย่างบทสนทนา
              </Button>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
