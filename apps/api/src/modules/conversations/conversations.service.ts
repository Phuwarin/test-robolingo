import { db } from "../../database/client.js";
export async function listConversations() {
  const sql = db();
  const contacts = await sql`SELECT c.*, (SELECT body FROM messages WHERE contact_id=c.id ORDER BY created_at DESC,id DESC LIMIT 1) AS preview FROM contacts c ORDER BY updated_at DESC`;
  const messages = await sql`SELECT * FROM messages ORDER BY created_at,id`;
  return { contacts, messages };
}
