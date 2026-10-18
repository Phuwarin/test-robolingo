"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UsersRound, MessageCircle, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useRealtime } from "@/hooks/use-realtime";
export function WorkspaceSidebar() {
  const path = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    let active = true;
    let request = 0;
    const refresh = async () => {
      const current = ++request;
      try {
        const response = await fetch("/api/conversations/unread-count", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (active && current === request) setUnreadCount(Number(data.unreadCount) || 0);
      } catch {
        // Keep the last known count until the connection recovers.
      }
    };
    refresh();
    window.addEventListener("sidebar-unread-refresh", refresh);
    return () => {
      active = false;
      window.removeEventListener("sidebar-unread-refresh", refresh);
    };
  }, []);
  useRealtime(() => window.dispatchEvent(new Event("sidebar-unread-refresh")));
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
