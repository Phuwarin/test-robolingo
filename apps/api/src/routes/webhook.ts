import { db, line } from "../server.js";
import { validSignature } from "../security.js";
type Event = {
  webhookEventId: string;
  type: string;
  timestamp: number;
  source: { type: string; userId?: string };
  message?: { type: string; text?: string; id: string };
  unsend?: { messageId: string };
};
export async function POST(request: Request) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret) return Response.json({ error: "Not configured" }, { status: 503 });
  const body = await request.text();
  if (!validSignature(body, request.headers.get("x-line-signature") || "", secret)) return Response.json({ error: "Invalid signature" }, { status: 401 });
  try {
    const payload = JSON.parse(body) as { events: Event[] };
    if (!Array.isArray(payload.events)) return Response.json({ error: "Invalid events" }, { status: 400 });
    for (const event of payload.events) {
      const user = event.source?.userId;
      if (event.source?.type !== "user" || !user) continue;
      if (event.type === "unsend" && event.unsend) {
        const sql = db();
        await sql`DELETE FROM messages WHERE id=${event.unsend.messageId} AND contact_id=${user}`;
        continue;
      }
      if (event.type !== "message" || !event.message) continue;
      const sql = db();
      let name = user;
      try {
        const profile = await (await line(`profile/${encodeURIComponent(user)}`)).json();
        name = profile.displayName || user;
      } catch {
        /* Profile may be unavailable. Preserve the user ID. */
      }
      const text = event.message.type === "text" ? event.message.text || "" : `[${event.message.type}]`;
      await sql.transaction([
        sql`INSERT INTO contacts(id,name,updated_at) VALUES(${user},${name},${new Date(event.timestamp).toISOString()}) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,updated_at=GREATEST(contacts.updated_at,EXCLUDED.updated_at)`,
        sql`INSERT INTO messages(id,contact_id,direction,body,created_at) VALUES(${event.message.id},${user},'in',${text},${new Date(event.timestamp).toISOString()}) ON CONFLICT(id) DO NOTHING`,
      ]);
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
