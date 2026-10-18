"use client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
type Props = { query: string; status: string; onQueryChange: (value: string) => void; onStatusChange: (value: string) => void };
export function UserFilters({ query, status, onQueryChange, onStatusChange }: Props) {
  return (
    <div className="users-filters">
      <Input
        aria-label="ค้นหาผู้ใช้"
        placeholder="ค้นหาชื่อ หรือ LINE User ID…"
        value={query}
        onChange={(e) => {
          onQueryChange(e.target.value);
        }}
      />
      <Select
        value={status}
        onValueChange={(value) => {
          onStatusChange(value);
        }}
      >
        <SelectTrigger aria-label="สถานะผู้ใช้">
          <SelectValue />
        </SelectTrigger>
        <SelectContent style={{ backgroundColor: "#fff", color: "#252b36" }}>
          <SelectItem value="all">ทุกสถานะ</SelectItem>
          <SelectItem value="follow">เพิ่มเพื่อนแล้ว</SelectItem>
          <SelectItem value="unfollow">บล็อก OA</SelectItem>
          <SelectItem value="unknown">ไม่ทราบสถานะ</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
