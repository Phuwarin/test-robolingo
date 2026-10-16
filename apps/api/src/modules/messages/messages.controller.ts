import { authorized } from "../auth/auth.service.js";
import { sendMessage } from "./messages.service.js";
export async function POST(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (request.headers.get("origin") !== (process.env.WEB_ORIGIN || "http://localhost:3099")) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const data = await request.json().catch(() => ({}));
  if (typeof data.to !== "string" || typeof data.text !== "string" || !data.text.trim() || data.text.length > 5000 || typeof data.id !== "string" || !/^[0-9a-f-]{36}$/i.test(data.id))
    return Response.json({ error: "ข้อมูลข้อความไม่ถูกต้อง (สูงสุด 5,000 ตัวอักษร)" }, { status: 400 });
  try {
    if (!(await sendMessage(data))) return Response.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "ส่งไม่สำเร็จ กรุณาตรวจสอบ LINE token / โควตา แล้วลองอีกครั้ง" }, { status: 502 });
  }
}
