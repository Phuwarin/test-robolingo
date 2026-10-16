"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
export function WorkspaceSidebar() {
  const path = usePathname();
  return (
    <aside className="workspace-sidebar">
      <Link className="workspace-logo" href="/">
        L<span>LINE DESK</span>
      </Link>
      <p>WORKSPACE</p>
      <Button asChild variant={path === "/users" ? "secondary" : "ghost"}>
        <Link href="/users">
          <Users size={18} />
          Users
        </Link>
      </Button>
      <Button asChild variant={path === "/" ? "secondary" : "ghost"}>
        <Link href="/">
          <MessageSquare size={18} />
          แชท
        </Link>
      </Button>
      <small>LINE Official Account</small>
    </aside>
  );
}
