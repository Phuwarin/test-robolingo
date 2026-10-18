import { test } from "bun:test";
import assert from "node:assert/strict";
import { mergeConversation, mergeMessage } from "../lib/chat-state.ts";
test("conversation event updates only its row, ignores stale updates and moves latest chat first", () => {
  const current = [
    { id: "a", name: "A", preview: "old", updatedAt: "2026-10-17T00:00:00Z" },
    { id: "b", name: "B", preview: "other" },
  ];
  const changed = mergeConversation(current, { id: "b", name: "B", preview: "new", lastMessageId: "m2", lastMessageAt: "2026-10-17T01:00:00Z", updatedAt: "2026-10-17T01:00:00Z" });
  assert.equal(changed[0].id, "b");
  assert.equal(changed[0].lastMessageId, "m2");
  assert.equal(changed[1], current[0]);
  assert.equal(mergeConversation(changed, { id: "b", name: "B", preview: "stale", updatedAt: "2026-10-17T00:00:00Z" }), changed);
});
test("message events do not duplicate messages and retain correct room IDs", () => {
  const first = { id: "1", contactId: "a", direction: "received", body: "first", createdAt: "2026-10-17T00:00:00Z" };
  const second = { id: "2", contactId: "b", direction: "botSent", body: "second", createdAt: "2026-10-17T01:00:00Z" };
  const current = mergeMessage([second], first);
  assert.deepEqual(
    current.map((m) => m.id),
    ["1", "2"],
  );
  assert.equal(mergeMessage(current, first), current);
  assert.deepEqual(
    current.filter((m) => m.contactId === "a").map((m) => m.id),
    ["1"],
  );
});

test("server read state merges after reconnect without making a read message unread again", () => {
  const message = { id: "read-1", contactId: "a", direction: "received", body: "hello", createdAt: "2026-10-18T01:00:00Z", readAt: null };
  const merged = mergeMessage([message], { ...message, readAt: "2026-10-18T02:00:00Z" });
  assert.equal(merged[0].readAt, "2026-10-18T02:00:00Z");
  assert.equal(mergeMessage(merged, message), merged);
  const current = [{ id: "a", name: "A", preview: "hello", unreadCount: 0, updatedAt: "2026-10-18T02:00:00Z" }];
  assert.equal(mergeConversation(current, { ...current[0], unreadCount: 1, updatedAt: "2026-10-18T01:00:00Z" }), current);
});
