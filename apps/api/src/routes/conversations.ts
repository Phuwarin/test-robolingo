import { authorized, db } from "../server.js";
export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const sql = db();
    const contacts = await sql`SELECT c.*, (SELECT body FROM messages WHERE contact_id=c.id ORDER BY created_at DESC,id DESC LIMIT 1) AS preview FROM contacts c ORDER BY updated_at DESC`;
    const messages = await sql`SELECT * FROM messages ORDER BY created_at,id`;
    return Response.json({ contacts, messages }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "โหลดข้อมูลไม่ได้ ตรวจสอบฐานข้อมูลและ schema.sql" }, { status: 503 });
  }
}
