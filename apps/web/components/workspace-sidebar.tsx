"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UsersRound, MessageCircle, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { mergeUnread, type UnreadUser } from "@/lib/chat-state";
import { useRealtime } from "@/hooks/use-realtime";
export function WorkspaceSidebar() {
  const path = usePathname();
  const [unreadByUser, setUnreadByUser] = useState<Record<string, UnreadUser>>({});
  const [version, setVersion] = useState(0);
  const unreadCount = Object.values(unreadByUser).reduce((total, user) => total + user.unreadCount, 0);
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/api/conversations/unread-count", { cache: "no-store", signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        if (!Array.isArray(data.users)) return;
        const users: UnreadUser[] = data.users;
        if (!controller.signal.aborted) setUnreadByUser((current) => users.reduce(mergeUnread, current));
      } catch {
        // Keep the last known count until the connection recovers.
      }
    })();
    return () => controller.abort();
  }, [version]);
  useRealtime(() => setVersion((value) => value + 1), true, {
    onConversationUpdated: ({ conversation }) => {
      if (!conversation || typeof conversation.unreadCount !== "number") return;
      const user = { id: conversation.id, unreadCount: conversation.unreadCount, updatedAt: conversation.updatedAt };
      setUnreadByUser((current) => mergeUnread(current, user));
    },
  });
  return (
    <aside className="workspace-sidebar" aria-label="เมนูหลัก">
      <Link className="workspace-logo" href="/" aria-label="LINE Desk">
        <MessageSquareText size={23} />
      </Link>
      <Button asChild variant="ghost" size="icon" className={path === "/users" ? "rail-link active" : "rail-link"}>
        <Link href="/users" title="Users" aria-label="Users" aria-current={path === "/users" ? "page" : undefined}>
          <UsersRound size={24} />
        </Link>
      </Button>
      <Button asChild variant="ghost" size="icon" className={path === "/" ? "rail-link active" : "rail-link"}>
        <Link href="/" title="แชท" aria-label="แชท" aria-current={path === "/" ? "page" : undefined}>
          <MessageCircle size={24} />
          {unreadCount > 0 && (
            <Badge className="rail-unread" aria-label={`${unreadCount} ข้อความที่ยังไม่อ่าน`}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Link>
      </Button>
      <span className="rail-account" title="LINE Official Account">
        OA
      </span>
    </aside>
  );
}
