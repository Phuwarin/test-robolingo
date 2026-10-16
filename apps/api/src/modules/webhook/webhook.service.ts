import { Injectable } from "@nestjs/common";
import { db } from "../../database/client.js";
import { line } from "../../integrations/line/line.client.js";
import type { LineEvent } from "./webhook.types.js";
@Injectable()
export class WebhookService {
  async processEvents(events: LineEvent[]) {
    for (const event of events) {
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
  }
}
