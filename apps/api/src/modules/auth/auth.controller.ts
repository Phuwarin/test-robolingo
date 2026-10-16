import { equal, token } from "../../common/security.js";
export async function POST(request: Request) {
  const password = process.env.ADMIN_PASSWORD,
    secret = process.env.SESSION_SECRET;
  if (!password || !secret) return Response.json({ error: "กรุณาตั้งค่า ADMIN_PASSWORD และ SESSION_SECRET บนเซิร์ฟเวอร์" }, { status: 503 });
  const data = await request.json().catch(() => ({}));
  if (typeof data.password !== "string" || !equal(data.password, password)) return Response.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  return Response.json({ ok: true }, { headers: { "Set-Cookie": sessionCookie(token(secret), 28800) } });
}
export async function DELETE() {
  return Response.json({ ok: true }, { headers: { "Set-Cookie": sessionCookie("", 0) } });
}
function sessionCookie(value: string, maxAge: number) {
  return `session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}
