import { processEvents } from "./webhook.service.js";
import { validSignature } from "../../common/security.js";
import type { LineEvent } from "./webhook.types.js";
export async function POST(request: Request) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret) return Response.json({ error: "Not configured" }, { status: 503 });
  const body = await request.text();
  if (!validSignature(body, request.headers.get("x-line-signature") || "", secret)) return Response.json({ error: "Invalid signature" }, { status: 401 });
  try {
    const payload = JSON.parse(body) as { events: LineEvent[] };
    if (!Array.isArray(payload.events)) return Response.json({ error: "Invalid events" }, { status: 400 });
    await processEvents(payload.events);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
