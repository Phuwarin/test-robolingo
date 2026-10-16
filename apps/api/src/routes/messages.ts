import { authorized, db, line } from "../server.js";
export async function POST(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (request.headers.get("origin") !== (process.env.WEB_ORIGIN || "http://localhost:3099")) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const data = await request.json().catch(() => ({}));
  if (typeof data.to !== "string" || typeof data.text !== "string" || !data.text.trim() || data.text.length > 5000 || typeof data.id !== "string" || !/^[0-9a-f-]{36}$/i.test(data.id))
    return Response.json({ error: "ข้อมูลข้อความไม่ถูกต้อง (สูงสุด 5,000 ตัวอักษร)" }, { status: 400 });
  try {
    const sql = db();
    const contacts = await sql`SELECT id FROM contacts WHERE id=${data.to}`;
    if (!contacts.length) return Response.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    const existing = await sql`SELECT id FROM messages WHERE id=${data.id}`;
    if (existing.length) return Response.json({ ok: true });
    const response = await line("message/push", {
      method: "POST",
      headers: { "X-Line-Retry-Key": data.id },
      body: JSON.stringify({ to: data.to, messages: [{ type: "text", text: data.text.trim() }] }),
    }).catch((error) => {
      throw error;
    });
    if (!response.ok) throw new Error("LINE rejected message");
    await sql.transaction([
      sql`INSERT INTO messages(id,contact_id,direction,body) VALUES(${data.id},${data.to},'out',${data.text.trim()}) ON CONFLICT DO NOTHING`,
      sql`UPDATE contacts SET updated_at=now() WHERE id=${data.to}`,
    ]);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "ส่งไม่สำเร็จ กรุณาตรวจสอบ LINE token / โควตา แล้วลองอีกครั้ง" }, { status: 502 });
  }
}
