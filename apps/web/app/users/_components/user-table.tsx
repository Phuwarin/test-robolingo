"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { statusLabels, type User } from "@/lib/line-user";
type Props = {
  users: User[];
  busy: boolean;
  error: string;
  query: string;
  status: string;
};
export function UserTable({ users, busy, error, query, status }: Props) {
  let emptyMessage = "ยังไม่มีผู้ใช้ เพิ่มเพื่อน OA หรือส่งข้อความเพื่อเริ่มต้น";
  if (busy) emptyMessage = "กำลังโหลด…";
  else if (error) emptyMessage = "ยังไม่สามารถแสดงรายชื่อได้";
  else if (query || status !== "all") emptyMessage = "ไม่พบผู้ใช้ที่ตรงกับตัวกรอง";
  return (
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
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={user.friendStatus === "follow" ? "secondary" : "outline"}>{statusLabels[user.friendStatus] || statusLabels.unknown}</Badge>
            </TableCell>
            <TableCell>{user.friendStatusAt ? new Date(user.friendStatusAt).toLocaleString("th-TH") : "—"}</TableCell>
            <TableCell>
              <Button asChild variant="outline" size="sm">
                <Link href={`/chat/${encodeURIComponent(user.id)}`}>เปิดแชท ↗</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {!users.length && (
          <TableRow>
            <TableCell colSpan={4} className="users-empty">
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
