import { db } from "../../database/client.js";
import { line } from "../../integrations/line/line.client.js";
export async function sendMessage(data: { to: string; text: string; id: string }) {
  const sql = db();
  const contacts = await sql`SELECT id FROM contacts WHERE id=${data.to}`;
  if (!contacts.length) return false;
  const existing = await sql`SELECT id FROM messages WHERE id=${data.id}`;
  if (existing.length) return true;
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
  return true;
}
