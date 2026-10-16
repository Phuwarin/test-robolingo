import { WebhookService } from "../src/modules/webhook/webhook.service.js";
import { ConversationsService } from "../src/modules/conversations/conversations.service.js";
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
test("Nest endpoints work without an auth module", async () => {
  const health = await fetch(`${base}/health`);
  assert.equal(health.status, 200);
  assert.equal((await fetch(`${base}/api/login`, { method: "POST" })).status, 404);
  const service = app.get(ConversationsService);
  const original = service.listConversations;
  service.listConversations = async () => ({ contacts: [], messages: [] });
  try {
    const conversations = await fetch(`${base}/api/conversations`);
    assert.equal(conversations.status, 200);
    assert.deepEqual(await conversations.json(), { contacts: [], messages: [] });
  } finally {
    service.listConversations = original;
  }
  const invalid = await fetch(`${base}/api/messages`, { method: "POST", headers: { "Content-Type": "application/json", origin: process.env.WEB_ORIGIN || "http://localhost:3099" }, body: "{}" });
  assert.equal(invalid.status, 400);
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

test("signed follow dispatches to follower storage without creating a message", async () => {
  const service = app.get(WebhookService),
    original = service.handleFollow;
  const calls: Array<{ userId: string; timestamp: number }> = [];
  service.handleFollow = async (userId, timestamp) => {
    calls.push({ userId, timestamp });
  };
  const previous = process.env.LINE_CHANNEL_SECRET;
  process.env.LINE_CHANNEL_SECRET = "follow-test-secret";
  try {
    const timestamp = Date.now();
    const body = JSON.stringify({ events: [{ type: "follow", webhookEventId: "follow-1", timestamp, source: { type: "user", userId: "U-test" }, follow: { isUnblocked: false } }] });
    const signature = createHmac("sha256", "follow-test-secret").update(body).digest("base64");
    const response = await fetch(`${base}/api/webhook`, { method: "POST", headers: { "Content-Type": "application/json", "x-line-signature": signature }, body });
    assert.equal(response.status, 200);
    assert.deepEqual(calls, [{ userId: "U-test", timestamp }]);
  } finally {
    service.handleFollow = original;
    if (previous === undefined) delete process.env.LINE_CHANNEL_SECRET;
    else process.env.LINE_CHANNEL_SECRET = previous;
  }
});
