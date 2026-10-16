"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UsersRound, MessageCircle, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
export function WorkspaceSidebar() {
 const path=usePathname();
 return <aside className="workspace-sidebar" aria-label="เมนูหลัก"><Link className="workspace-logo" href="/" aria-label="LINE Desk"><MessageSquareText size={23}/></Link><Button asChild variant="ghost" size="icon" className={path==="/users"?"rail-link active":"rail-link"}><Link href="/users" title="Users" aria-label="Users" aria-current={path==="/users"?"page":undefined}><UsersRound size={24}/></Link></Button><Button asChild variant="ghost" size="icon" className={path==="/"?"rail-link active":"rail-link"}><Link href="/" title="แชท" aria-label="แชท" aria-current={path==="/"?"page":undefined}><MessageCircle size={24}/></Link></Button><span className="rail-account" title="LINE Official Account">OA</span></aside>;
}
