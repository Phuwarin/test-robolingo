"use client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Conversation } from "@/lib/chat-state";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, MessageCircle, UsersRound } from "lucide-react";
type Props = {
  conversations: Conversation[];
  selected: string;
  query: string;
  refreshing: boolean;
  connected: boolean;
  mode: "live" | "demo";
  onQueryChange: (value: string) => void;
  onSelect: (id: string) => void;
  onRefresh: () => void;
  onDemo: () => void;
};
export function ConversationList({ conversations, selected, query, refreshing, connected, mode, onQueryChange, onSelect, onRefresh, onDemo }: Props) {
  const filtered = conversations.filter((c) => (c.name + c.id + (c.lastMessage?.body || "")).toLowerCase().includes(query.toLowerCase()));
  return (
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
        <Input aria-label="ค้นหาบทสนทนา" placeholder="ค้นหาชื่อหรือข้อความ" value={query} onChange={(e) => onQueryChange(e.target.value)} />
        <Button variant="ghost" size="icon" title="รีเฟรช" aria-label="รีเฟรช" disabled={refreshing} onClick={onRefresh}>
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        </Button>
      </div>
      <div className="contacts">
        {filtered.map((c) => {
          const lastMessageAt = c.lastMessageTime;
          return (
            <Button key={c.id} variant="ghost" className={`contact ${c.id === selected ? "active" : ""}`} onClick={() => onSelect(c.id)}>
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
        <Button variant="ghost" size="sm" onClick={mode === "demo" ? onRefresh : onDemo}>
          {mode === "demo" ? "ใช้ข้อมูลจริง" : "ดูตัวอย่าง"}
        </Button>
      </div>
    </aside>
  );
}
