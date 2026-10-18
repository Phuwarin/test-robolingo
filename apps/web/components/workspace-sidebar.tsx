"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UsersRound, MessageCircle, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { usersQuery } from "@/lib/api-queries";
export function WorkspaceSidebar() {
  const path = usePathname();
  const { data } = useQuery(usersQuery());
  const unreadCount = data?.users.reduce((total, user) => total + user.unreadCount, 0) || 0;
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
      <Button asChild variant="ghost" size="icon" className={path === "/chat" ? "rail-link active" : "rail-link"}>
        <Link href="/chat" title="แชท" aria-label="แชท" aria-current={path === "/chat" ? "page" : undefined}>
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
