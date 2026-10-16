import { beforeAll, afterAll, test } from "bun:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { createApp } from "../src/app.js";
let app: Awaited<ReturnType<typeof createApp>>;
let base: string;
beforeAll(async () => {
  app = await createApp();
  await app.listen(0, "127.0.0.1");
  base = await app.getUrl();
});
afterAll(async () => {
  await app?.close();
});
test("Nest modules serve health and guard conversations", async () => {
  const health = await fetch(`${base}/health`);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).service, "line-desk-api");
  assert.equal((await fetch(`${base}/api/conversations`)).status, 401);
  assert.equal((await fetch(`${base}/api/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })).status, 401);
});
test("Nest raw body preserves LINE signature", async () => {
  const previous = process.env.LINE_CHANNEL_SECRET;
  process.env.LINE_CHANNEL_SECRET = "test-secret";
  try {
    const body = '{ "events": [] }';
    const signature = createHmac("sha256", "test-secret").update(body).digest("base64");
    const send = (value: string) => fetch(`${base}/api/webhook`, { method: "POST", headers: { "Content-Type": "application/json", "x-line-signature": signature }, body: value });
    assert.equal((await send(body)).status, 200);
    assert.equal((await send(body + " ")).status, 401);
  } finally {
    if (previous === undefined) delete process.env.LINE_CHANNEL_SECRET;
    else process.env.LINE_CHANNEL_SECRET = previous;
  }
});
test("Nest login issues a usable cookie and logout clears it", async () => {
  const oldPassword = process.env.ADMIN_PASSWORD,
    oldSecret = process.env.SESSION_SECRET;
  process.env.ADMIN_PASSWORD = "test-password";
  process.env.SESSION_SECRET = "test-session-secret";
  try {
    const login = await fetch(`${base}/api/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: "test-password" }) });
    assert.equal(login.status, 200);
    const cookie = login.headers.get("set-cookie")!;
    assert.ok(cookie.includes("HttpOnly"));
    const invalid = await fetch(`${base}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: cookie.split(";")[0], origin: process.env.WEB_ORIGIN || "http://localhost:3099" },
      body: "{}",
    });
    assert.equal(invalid.status, 400);
    const logout = await fetch(`${base}/api/login`, { method: "DELETE" });
    assert.equal(logout.status, 200);
    assert.ok(logout.headers.get("set-cookie")?.includes("Expires="));
  } finally {
    if (oldPassword === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = oldPassword;
    if (oldSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = oldSecret;
  }
});
