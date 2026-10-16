import { test } from "bun:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { app } from "../src/app.js";

test("standalone API serves health and protects conversations", async () => {
  const health = await app.request("/health");
  assert.equal(health.status, 200);
  assert.equal((await health.json()).service, "line-desk-api");
  assert.equal((await app.request("/api/conversations")).status, 401);
});
test("webhook preserves raw bytes when validating signature", async () => {
  process.env.LINE_CHANNEL_SECRET = "test-secret";
  const body = '{ "events": [] }';
  const signature = createHmac("sha256", "test-secret").update(body).digest("base64");
  const valid = await app.request("/api/webhook", { method: "POST", headers: { "x-line-signature": signature }, body });
  assert.equal(valid.status, 200);
  const invalid = await app.request("/api/webhook", { method: "POST", headers: { "x-line-signature": signature }, body: body + " " });
  assert.equal(invalid.status, 401);
});
