"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
type Contact = { id: string; name: string; preview: string };
type Message = { id: string; contact_id: string; direction: "in" | "out"; body: string; created_at: string };
const samples: Contact[] = [
  { id: "demo-1", name: "พิมพ์ชนก", preview: "สวัสดีค่ะ ขอสอบถามข้อมูลหน่อยค่ะ" },
  { id: "demo-2", name: "ธนกร", preview: "ขอบคุณครับ" },
];
const sampleMessages: Message[] = samples.map((c, i) => ({ id: `sample-${i}`, contact_id: c.id, direction: "in", body: c.preview, created_at: "2026-10-16T03:00:00Z" }));
export default function Home() {
  const [mode, setMode] = useState<"live" | "demo">("demo"),
    [contacts, setContacts] = useState<Contact[]>(samples),
    [messages, setMessages] = useState<Message[]>(sampleMessages),
    [selected, setSelected] = useState(samples[0].id),
    [query, setQuery] = useState(""),
    [draft, setDraft] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [refreshing, setRefreshing] = useState(false);
  const bottom = useRef<HTMLDivElement>(null),
    pending = useRef<{ to: string; text: string; id: string } | null>(null);
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
      setSelected((value) => value || data.contacts[0]?.id || "");
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "เชื่อมต่อไม่ได้");
    } finally {
      setRefreshing(false);
    }
  }
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
    const value = pending.current?.to === selected && pending.current.text === draft.trim() ? pending.current : { to: selected, text: draft.trim(), id: crypto.randomUUID() };
    pending.current = value;
    try {
      if (mode === "demo") {
        const message: Message = { id: value.id, contact_id: selected, direction: "out", body: value.text, created_at: new Date().toISOString() };
        setMessages((v) => [...v, message]);
        setContacts((v) => v.map((c) => (c.id === selected ? { ...c, preview: value.text } : c)));
      } else {
        const response = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        await refresh();
      }
      setDraft("");
      pending.current = null;
    } catch (e) {
      setError(e instanceof Error ? e.message : "ส่งไม่ได้");
    } finally {
      setBusy(false);
    }
  }
  const contact = contacts.find((c) => c.id === selected);
  return (
    <main>
      <nav>
        <a className="brand" href="/">
          L<span>LINE DESK</span>
        </a>
        <span className="nav-label">WORKSPACE / INBOX</span>
        <div className="nav-right">
          <span className="status">● {mode === "demo" ? "Demo workspace" : "LINE Official Account"}</span>
        </div>
      </nav>
      <>
        <header className="heading">
          <div>
            <div className="eyebrow">CONVERSATION CENTER</div>
            <h1>
              กล่องข้อความ<span className="count">{contacts.length}</span>
            </h1>
            <p>{mode === "demo" ? "โหมดทดลอง · ข้อมูลตัวอย่าง ข้อความจะไม่ถูกส่งไปยัง LINE" : "ดูแลทุกการสนทนา พร้อมตอบกลับจากที่เดียว"}</p>
          </div>
          <Button className="subtle" disabled={refreshing} onClick={() => (mode === "live" ? void refresh() : demo())}>
            {refreshing ? "กำลังอัปเดต…" : "↻ รีเฟรช"}
          </Button>
        </header>
        <section className="inbox">
          <aside>
            <div className="list-title">
              บทสนทนาทั้งหมด <span>{contacts.length}</span>
            </div>
            <Input className="search" aria-label="ค้นหาผู้ใช้" placeholder="ค้นหาชื่อ หรือ User ID…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <div className="contacts">
              {contacts
                .filter((c) => (c.name + c.id).toLowerCase().includes(query.toLowerCase()))
                .map((c) => (
                  <Button
                    key={c.id}
                    className={`contact ${c.id === selected ? "active" : ""}`}
                    onClick={() => {
                      setSelected(c.id);
                      setDraft("");
                      setError("");
                    }}
                  >
                    <Avatar className="avatar">
                      <AvatarFallback>{c.name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <span className="contact-copy">
                      <strong>{c.name}</strong>
                      <span>{c.preview}</span>
                    </span>
                    <Badge className="channel">LINE</Badge>
                  </Button>
                ))}
              {!contacts.length && (
                <p className="empty">
                  ยังไม่มีบทสนทนา
                  <br />
                  เพิ่มเพื่อน LINE OA แล้วส่งข้อความเพื่อเริ่มต้น
                </p>
              )}
            </div>
            <div className="aside-footer">
              <i /> {mode === "demo" ? "ข้อมูลตัวอย่าง" : "อัปเดตอัตโนมัติทุก 4 วินาที"}
            </div>
          </aside>
          <article>
            {contact ? (
              <>
                <div className="chat-header">
                  <Avatar className="avatar">
                    <AvatarFallback>{contact.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <strong>{contact.name}</strong>
                    <small>{contact.id}</small>
                  </div>
                  <Badge className="channel">LINE OA</Badge>
                </div>
                <div className="thread">
                  <div className="thread-note">จุดเริ่มต้นของบทสนทนากับ {contact.name}</div>
                  {messages
                    .filter((m) => m.contact_id === selected)
                    .map((m) => (
                      <div key={m.id} className={`message ${m.direction}`}>
                        <div>{m.body}</div>
                        <time>
                          {m.direction === "out" ? "คุณ · " : ""}
                          {new Date(m.created_at).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </time>
                      </div>
                    ))}
                  <div ref={bottom} />
                </div>
                <form className="composer" onSubmit={send}>
                  {error && (
                    <p className="error" role="alert">
                      {error}
                    </p>
                  )}
                  <label className="sr-only" htmlFor="message">
                    ข้อความตอบกลับ
                  </label>
                  <Textarea
                    id="message"
                    maxLength={5000}
                    placeholder={`พิมพ์ข้อความถึง ${contact.name}…`}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        e.currentTarget.form?.requestSubmit();
                      }
                    }}
                  />
                  <div>
                    <small>Enter เพื่อส่ง · Shift + Enter เพื่อขึ้นบรรทัดใหม่</small>
                    <Button className="primary" disabled={busy || !draft.trim()}>
                      {busy ? "กำลังส่ง…" : "ส่งข้อความ ↗"}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="welcome">
                <span>↗</span>
                <h2>พร้อมสำหรับบทสนทนาใหม่</h2>
                <p>เลือกผู้ใช้ทางด้านซ้ายเพื่อดูข้อความและตอบกลับ</p>
                {process.env.NEXT_PUBLIC_LINE_OA_URL && (
                  <a href={process.env.NEXT_PUBLIC_LINE_OA_URL} target="_blank" rel="noreferrer">
                    เพิ่มเพื่อน LINE OA ↗
                  </a>
                )}
                {error && (
                  <p role="alert" className="error">
                    {error}
                  </p>
                )}
              </div>
            )}
          </article>
        </section>
        <footer>
          LINE DESK <span>พื้นที่สำหรับการสนทนาที่ดีขึ้น</span>
          <span>{mode === "demo" ? "DEMO MODE" : "ADMIN INBOX"}</span>
        </footer>
      </>
    </main>
  );
}
