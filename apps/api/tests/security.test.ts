import { test } from "bun:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { validSignature } from "../src/common/security";
test("webhook verifies original bytes and rejects tampering", () => {
  const body = '{"events":[]}';
  const signature = createHmac("sha256", "secret").update(body).digest("base64");
  assert.ok(validSignature(body, signature, "secret"));
  assert.equal(validSignature(body + " ", signature, "secret"), false);
  assert.equal(validSignature(body, "", "secret"), false);
});
