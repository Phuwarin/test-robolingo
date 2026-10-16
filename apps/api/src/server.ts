import { neon } from "@neondatabase/serverless";
import { validToken } from "./security.js";
export function db() {
  if (!process.env.DATABASE_URL) throw new Error("Database is not configured");
  return neon(process.env.DATABASE_URL);
}
export function authorized(request: Request) {
  const secret = process.env.SESSION_SECRET;
  const cookie =
    request.headers
      .get("cookie")
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("session="))
      ?.slice(8) || "";
  return !!secret && validToken(cookie, secret);
}
export async function line(path: string, options: RequestInit = {}) {
  const response = await fetch(`https://api.line.me/v2/bot/${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`, "Content-Type": "application/json", ...options.headers },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`LINE request failed (${response.status})`);
  return response;
}
