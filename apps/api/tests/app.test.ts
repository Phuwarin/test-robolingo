import { LineUsersService } from "../src/modules/line-users/line-users.service.js";
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

test("signed unfollow dispatches user and event time", async () => {
  const service = app.get(WebhookService),
    original = service.handleUnfollow;
  const calls: Array<{ userId: string; timestamp: number }> = [];
  service.handleUnfollow = async (userId, timestamp) => {
    calls.push({ userId, timestamp });
  };
  const previous = process.env.LINE_CHANNEL_SECRET;
  process.env.LINE_CHANNEL_SECRET = "unfollow-test-secret";
  try {
    const timestamp = Date.now();
    const body = JSON.stringify({ events: [{ type: "unfollow", webhookEventId: "unfollow-1", timestamp, source: { type: "user", userId: "U-unfollow" } }] });
    const signature = createHmac("sha256", "unfollow-test-secret").update(body).digest("base64");
    const response = await fetch(`${base}/api/webhook`, { method: "POST", headers: { "Content-Type": "application/json", "x-line-signature": signature }, body });
    assert.equal(response.status, 200);
    assert.deepEqual(calls, [{ userId: "U-unfollow", timestamp }]);
  } finally {
    service.handleUnfollow = original;
    if (previous === undefined) delete process.env.LINE_CHANNEL_SECRET;
    else process.env.LINE_CHANNEL_SECRET = previous;
  }
});

test("line users endpoint validates filters and pagination", async () => {
  assert.equal((await fetch(`${base}/api/line-users?status=invalid`)).status, 400);
  assert.equal((await fetch(`${base}/api/line-users?page=0`)).status, 400);
  assert.equal((await fetch(`${base}/api/line-users?limit=101`)).status, 400);
  const service = app.get(LineUsersService),
    original = service.list;
  const calls: unknown[][] = [];
  service.list = async (...args) => {
    calls.push(args);
    return { users: [], total: 0, page: 2, limit: 10 };
  };
  try {
    const response = await fetch(`${base}/api/line-users?q=hello&status=follow&page=2&limit=10`);
    assert.equal(response.status, 200);
    assert.deepEqual(calls, [["hello", "follow", 2, 10]]);
  } finally {
    service.list = original;
  }
});
