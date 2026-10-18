"use client";
import { useRealtime } from "@/hooks/use-realtime";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserFilters } from "@/app/users/_components/user-filters";
import { UserTable } from "@/app/users/_components/user-table";
import type { User } from "@/app/users/_lib/line-user";
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState("all"),
    [total, setTotal] = useState(0),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0);
  useRealtime(() => setVersion((value) => value + 1), true, {
    onConversationUpdated: ({ conversation }) => {
      if (!conversation) return;
      setUsers((current) =>
        current.map((user) =>
          user.id === conversation.id
            ? {
                ...user,
                name: conversation.name,
                pictureUrl: conversation.pictureUrl ?? user.pictureUrl,
                friendStatus: conversation.friendStatus ?? user.friendStatus,
                lastMessageId: conversation.lastMessageId ?? user.lastMessageId,
              }
            : user,
        ),
      );
    },
  });
  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query, status: status === "all" ? "" : status });
        const response = await fetch(`/api/line-users?${params}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "โหลดข้อมูลไม่ได้");
        setUsers(data.users);
        setTotal(data.total);
        setError("");
      } catch (e) {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "เชื่อมต่อ API ไม่ได้");
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, status, version]);
  return (
    <main className="users-page">
      <header className="heading">
        <div>
          <div className="eyebrow">LINE OFFICIAL ACCOUNT</div>
          <h1>
            Users <span className="count">{total}</span>
          </h1>
          <p>รายชื่อผู้ใช้และสถานะการเพิ่มเพื่อนของบัญชีนี้</p>
        </div>
        <Button variant="outline" disabled={busy} onClick={() => setVersion((v) => v + 1)}>
          รีเฟรช
        </Button>
      </header>
      <section className="users-panel">
        <UserFilters query={query} status={status} onQueryChange={setQuery} onStatusChange={setStatus} />
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <UserTable users={users} busy={busy} error={error} query={query} status={status} />
        <p className="users-note">“ไม่ทราบสถานะ” หมายถึงระบบยังไม่มี event เพิ่มเพื่อนหรือบล็อกของผู้ใช้นั้น</p>
      </section>
    </main>
  );
}
