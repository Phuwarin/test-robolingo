"use client";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
type Props = { draft: string; busy: boolean; isBlocked: boolean; mode: "live" | "demo"; onDraftChange: (value: string) => void; onSend: (event: FormEvent) => void };
export function MessageComposer({ draft, busy, isBlocked, mode, onDraftChange, onSend }: Props) {
  return (
    <form className="composer" onSubmit={onSend}>
      {isBlocked && (
        <p className="blocked-notice" role="status">
          ผู้ใช้บล็อก OA ไม่สามารถพิมพ์หรือส่งข้อความได้
        </p>
      )}
      <label htmlFor="message" className="sr-only">
        ข้อความตอบกลับ
      </label>
      <Textarea
        id="message"
        maxLength={5000}
        disabled={isBlocked}
        placeholder={isBlocked ? "ผู้ใช้บล็อก OA" : "พิมพ์ข้อความ…"}
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }
        }}
      />
      <div className="composer-actions">
        <small>{mode === "demo" ? "โหมดทดลอง · ข้อความจะไม่ส่งไปยัง LINE" : "Enter เพื่อส่ง · Shift + Enter เพื่อขึ้นบรรทัดใหม่"}</small>
        <Button type="submit" className="send-button" disabled={busy || !draft.trim() || isBlocked}>
          <Send size={16} />
          {busy ? "กำลังส่ง…" : "ส่ง"}
        </Button>
      </div>
    </form>
  );
}
