import type { Conversation, ChatMessage as Message } from "@/lib/chat-state";
export const samples: Conversation[] = [
  {
    id: "demo-1",
    name: "พิมพ์ชนก",
    lastMessage: { body: "สวัสดีค่ะ ขอสอบถามข้อมูลหน่อยค่ะ" },
    lastMessageTime: "2026-10-16T03:00:00Z",
  },
  {
    id: "demo-2",
    name: "ธนกร",
    lastMessage: { body: "ขอบคุณครับ" },
    lastMessageTime: "2026-10-16T03:00:00Z",
  },
];
export const sampleMessages: Message[] = samples.map((c, i) => ({
  id: `sample-${i}`,
  lineUserId: c.id,
  direction: "received",
  body: c.lastMessage?.body || "",
  createdAt: "2026-10-16T03:00:00Z",
}));
