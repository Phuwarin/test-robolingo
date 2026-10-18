"use client";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
export function EmptyConversation({ error, onDemo }: { error: string; onDemo: () => void }) {
  return (
    <div className="welcome">
      <div className="welcome-icon">
        <MessageCircle size={48} strokeWidth={1.3} />
      </div>
      <h1>ทุกบทสนทนา เริ่มต้นที่นี่</h1>
      <p>เลือกแชททางด้านซ้าย เพื่ออ่านข้อความและตอบกลับ</p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <Button variant="outline" onClick={onDemo}>
        ดูตัวอย่างบทสนทนา
      </Button>
    </div>
  );
}
