import { authorized } from "../auth/auth.service.js";
import { listConversations } from "./conversations.service.js";
export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { contacts, messages } = await listConversations();
    return Response.json({ contacts, messages }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "โหลดข้อมูลไม่ได้ ตรวจสอบฐานข้อมูลและ schema.sql" }, { status: 503 });
  }
}
