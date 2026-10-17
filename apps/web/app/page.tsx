"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Send, MessageCircle, UsersRound } from "lucide-react";
import Link from "next/link";
type Contact = { id: string; name: string; preview: string; pictureUrl?: string | null };
type Message = { id: string; contactId: string; direction: "received" | "botSent"; body: string; createdAt: string };
const samples: Contact[] = [
  { id: "demo-1", name: "พิมพ์ชนก", preview: "สวัสดีค่ะ ขอสอบถามข้อมูลหน่อยค่ะ" },
  { id: "demo-2", name: "ธนกร", preview: "ขอบคุณครับ" },
];
const sampleMessages: Message[] = samples.map((c, i) => ({ id: `sample-${i}`, contactId: c.id, direction: "received", body: c.preview, createdAt: "2026-10-16T03:00:00Z" }));
export default function Home() {
  const [mode, setMode] = useState<"live" | "demo">("live"),
    [contacts, setContacts] = useState<Contact[]>([]),
    [messages, setMessages] = useState<Message[]>([]),
    [selected, setSelected] = useState(""),
    [query, setQuery] = useState(""),
    [draft, setDraft] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [refreshing, setRefreshing] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
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
      setContacts(data.contacts);
      setMessages(data.messages);
      setMode("live");
      setSelected((value) => {
        const wanted = new URLSearchParams(window.location.search).get("user") || value;
        return data.contacts.some((c: Contact) => c.id === wanted) ? wanted : data.contacts[0]?.id || "";
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
  useEffect(() => {
    if (mode !== "live") return;
    const timer = setInterval(refresh, 4000);
    return () => clearInterval(timer);
  }, [mode]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selected]);
  function demo() {
    setMode("demo");
    setContacts(samples);
    setMessages(sampleMessages);
    setSelected(samples[0].id);
    setError("");
  }
  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !selected || busy) return;
    setBusy(true);
    setError("");
    const value = { to: selected, text: draft.trim() };
    try {
      if (mode === "demo") {
        const message: Message = { id: crypto.randomUUID(), contactId: selected, direction: "botSent", body: value.text, createdAt: new Date().toISOString() };
        setMessages((v) => [...v, message]);
        setContacts((v) => v.map((c) => (c.id === selected ? { ...c, preview: value.text } : c)));
      } else {
        const response = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        await refresh();
      }
      setDraft("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "ส่งไม่ได้");
    } finally {
      setBusy(false);
    }
  }
  const contact = contacts.find((c) => c.id === selected);
  const latestByContact = new Map<string, Message>();
  for (const message of messages) {
    const current = latestByContact.get(message.contactId);
    if (!current || new Date(message.createdAt).getTime() >= new Date(current.createdAt).getTime()) latestByContact.set(message.contactId, message);
  }
  const filtered = contacts.filter((c) => (c.name + c.id + c.preview).toLowerCase().includes(query.toLowerCase()));
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
              แชททั้งหมด <span>{contacts.length}</span>
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
              const latest = latestByContact.get(c.id);
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
                      {latest && <time dateTime={latest.createdAt}>{new Date(latest.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</time>}
                    </span>
                    <span className="contact-preview">{c.preview || "เริ่มต้นบทสนทนา"}</span>
                  </span>
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
            <span>{mode === "demo" ? "โหมดทดลอง ไม่ส่งข้อความจริง" : "อัปเดตอัตโนมัติ"}</span>
            <Button variant="ghost" size="sm" onClick={mode === "demo" ? () => void refresh() : demo}>
              {mode === "demo" ? "ใช้ข้อมูลจริง" : "ดูตัวอย่าง"}
            </Button>
          </div>
        </aside>
        <article className="chat-detail" aria-label="บทสนทนา">
          {contact ? (
            <>
              <div className="chat-header">
                <Avatar className="avatar">
                  <AvatarImage src={contact.pictureUrl || undefined} alt="" />
                  <AvatarFallback>{contact.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div>
                  <strong>{contact.name}</strong>
                  <small>{contact.id}</small>
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
                <div className="thread-note">บทสนทนากับ {contact.name}</div>
                {messages
                  .filter((m) => m.contactId === selected)
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
                <label htmlFor="message" className="sr-only">
                  ข้อความตอบกลับ
                </label>
                <Textarea
                  id="message"
                  maxLength={5000}
                  placeholder="พิมพ์ข้อความ…"
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
                  <Button type="submit" className="send-button" disabled={busy || !draft.trim()}>
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
