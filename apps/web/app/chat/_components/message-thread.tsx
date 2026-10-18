"use client";
import type { ChatMessage } from "@/lib/chat-state";
export function MessageThread({ messages, name, loading }: { messages: ChatMessage[]; name: string; loading: boolean }) {
  return (
    <div className="thread" style={{ display: "flex", flexDirection: "column-reverse" }}>
      <div style={{ flexShrink: 0 }}>
        <div className="thread-note">บทสนทนากับ {name}</div>
        {loading && <p role="status">กำลังโหลดข้อความ…</p>}
        {messages.map((m) => (
          <div key={m.id} className={`message ${m.direction}`}>
            <div>{m.body}</div>
            <time dateTime={m.createdAt}>
              {m.direction === "botSent" ? "คุณ · " : ""}
              {new Date(m.createdAt).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </time>
          </div>
        ))}
      </div>
    </div>
  );
}
