"use client";
import { useRealtime } from "@/hooks/use-realtime";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
type User = { id: string; name: string; pictureUrl: string | null; friendStatus: string; friendStatusAt: string | null; createdAt: string; lastMessageId: string | null };
const statusLabels: Record<string, string> = { follow: "เพิ่มเพื่อนแล้ว", unfollow: "บล็อก OA", unknown: "ไม่ทราบสถานะ" };
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState("all"),
    [page, setPage] = useState(1),
    [total, setTotal] = useState(0),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0);
  useRealtime(() => setVersion((value) => value + 1));
  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query, status: status === "all" ? "" : status, page: String(page), limit: "25" });
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
  }, [query, status, page, version]);
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
        <div className="users-filters">
          <Input
            aria-label="ค้นหาผู้ใช้"
            placeholder="ค้นหาชื่อ หรือ LINE User ID…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="สถานะผู้ใช้">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกสถานะ</SelectItem>
              <SelectItem value="follow">เพิ่มเพื่อนแล้ว</SelectItem>
              <SelectItem value="unfollow">บล็อก OA</SelectItem>
              <SelectItem value="unknown">ไม่ทราบสถานะ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ผู้ใช้</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>สถานะอัปเดตเมื่อ</TableHead>
              <TableHead>
                <span className="sr-only">เปิดแชท</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="user-identity">
                    <Avatar>
                      <AvatarImage src={user.pictureUrl || undefined} alt="" />
                      <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <strong>{user.name}</strong>
                      <small>{user.id}</small>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.friendStatus === "follow" ? "secondary" : "outline"}>{statusLabels[user.friendStatus] || statusLabels.unknown}</Badge>
                </TableCell>
                <TableCell>{user.friendStatusAt ? new Date(user.friendStatusAt).toLocaleString("th-TH") : "—"}</TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/?user=${encodeURIComponent(user.id)}`}>เปิดแชท ↗</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!users.length && (
              <TableRow>
                <TableCell colSpan={4} className="users-empty">
                  {busy ? "กำลังโหลด…" : error ? "ยังไม่สามารถแสดงรายชื่อได้" : query || status !== "all" ? "ไม่พบผู้ใช้ที่ตรงกับตัวกรอง" : "ยังไม่มีผู้ใช้ เพิ่มเพื่อน OA หรือส่งข้อความเพื่อเริ่มต้น"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="users-pagination">
          <small>
            ทั้งหมด {total} คน · หน้า {page} / {Math.max(1, Math.ceil(total / 25))}
          </small>
          <Button variant="outline" size="sm" disabled={busy || page <= 1} onClick={() => setPage((p) => p - 1)}>
            ก่อนหน้า
          </Button>
          <Button variant="outline" size="sm" disabled={busy || page * 25 >= total} onClick={() => setPage((p) => p + 1)}>
            ถัดไป
          </Button>
        </div>
        <p className="users-note">“ไม่ทราบสถานะ” หมายถึงระบบยังไม่มี event เพิ่มเพื่อนหรือบล็อกของผู้ใช้นั้น</p>
      </section>
    </main>
  );
}
