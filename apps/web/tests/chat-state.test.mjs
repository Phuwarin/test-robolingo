import { test } from "bun:test";
import assert from "node:assert/strict";
import { mergeConversation, mergeMessage, mergeUnread } from "../lib/chat-state.ts";

test("sidebar replaces each user's unread count and ignores duplicate or stale events", () => {
  let users = {};
  const first = { id: "a", unreadCount: 2, updatedAt: "2026-10-18T10:00:00Z" };
  users = mergeUnread(users, first);
  users = mergeUnread(users, first);
  users = mergeUnread(users, { id: "b", unreadCount: 3, updatedAt: "2026-10-18T10:00:00Z" });
  assert.equal(
    Object.values(users).reduce((total, user) => total + user.unreadCount, 0),
    5,
  );
  users = mergeUnread(users, { id: "a", unreadCount: 0, updatedAt: "2026-10-18T11:00:00Z" });
  assert.equal(
    Object.values(users).reduce((total, user) => total + user.unreadCount, 0),
    3,
  );
  assert.equal(mergeUnread(users, first), users);
});
test("conversation event updates only its row, ignores stale updates and moves latest chat first", () => {
  const current = [
    { id: "a", name: "A", updatedAt: "2026-10-17T00:00:00Z" },
    { id: "b", name: "B" },
  ];
  const changed = mergeConversation(current, { id: "b", name: "B", lastMessageId: "m2", lastMessage: { body: "new" }, lastMessageTime: "2026-10-17T01:00:00Z", updatedAt: "2026-10-17T01:00:00Z" });
  assert.equal(changed[0].id, "b");
  assert.equal(changed[0].lastMessageId, "m2");
  assert.equal(changed[1], current[0]);
  assert.equal(mergeConversation(changed, { id: "b", name: "B", updatedAt: "2026-10-17T00:00:00Z" }), changed);
});
test("message events do not duplicate messages and retain correct room IDs", () => {
  const first = { id: "1", lineUserId: "a", direction: "received", body: "first", createdAt: "2026-10-17T00:00:00Z" };
  const second = { id: "2", lineUserId: "b", direction: "botSent", body: "second", createdAt: "2026-10-17T01:00:00Z" };
  const current = mergeMessage([second], first);
  assert.deepEqual(
    current.map((m) => m.id),
    ["1", "2"],
  );
  assert.equal(mergeMessage(current, first), current);
  assert.deepEqual(
    current.filter((m) => m.lineUserId === "a").map((m) => m.id),
    ["1"],
  );
});

test("server read state merges after reconnect without making a read message unread again", () => {
  const message = { id: "read-1", lineUserId: "a", direction: "received", body: "hello", createdAt: "2026-10-18T01:00:00Z", readAt: null };
  const merged = mergeMessage([message], { ...message, readAt: "2026-10-18T02:00:00Z" });
  assert.equal(merged[0].readAt, "2026-10-18T02:00:00Z");
  assert.equal(mergeMessage(merged, message), merged);
  const current = [{ id: "a", name: "A", unreadCount: 0, updatedAt: "2026-10-18T02:00:00Z" }];
  assert.equal(mergeConversation(current, { ...current[0], unreadCount: 1, updatedAt: "2026-10-18T01:00:00Z" }), current);
});

test("latest incoming or outgoing message moves its chat first, but read and follow updates do not", () => {
  let conversations = [
    { id: "a", name: "A", lastMessage: { body: "incoming" }, lastMessageTime: "2026-10-18T10:00:00Z" },
    { id: "b", name: "B", lastMessage: { body: "older" }, lastMessageTime: "2026-10-18T09:00:00Z" },
  ];
  conversations = mergeConversation(conversations, { id: "b", name: "B", lastMessage: { body: "outgoing" }, lastMessageTime: "2026-10-18T11:00:00Z" });
  assert.deepEqual(
    conversations.map((conversation) => conversation.id),
    ["b", "a"],
  );
  conversations = mergeConversation(conversations, { id: "a", name: "A", lastMessage: { body: "new incoming" }, lastMessageTime: "2026-10-18T12:00:00Z" });
  assert.deepEqual(
    conversations.map((conversation) => conversation.id),
    ["a", "b"],
  );
  conversations = mergeConversation(conversations, { id: "b", name: "B", unreadCount: 0, updatedAt: "2026-10-18T13:00:00Z" });
  conversations = mergeConversation(conversations, { id: "new", name: "New friend", updatedAt: "2026-10-18T14:00:00Z" });
  assert.deepEqual(
    conversations.map((conversation) => conversation.id),
    ["a", "b", "new"],
  );
});

test("new empty conversations sort by user creation time, not metadata update time", () => {
  let conversations = [{ id: "chat", name: "Chat", lastMessage: { body: "hello" }, lastMessageTime: "2026-10-18T10:00:00Z", createdAt: "2026-10-18T08:00:00Z" }];
  conversations = mergeConversation(conversations, { id: "new", name: "New", lastMessage: null, createdAt: "2026-10-18T11:00:00Z" });
  conversations = mergeConversation(conversations, { id: "old", name: "Old", lastMessage: null, createdAt: "2026-10-18T09:00:00Z", updatedAt: "2026-10-18T12:00:00Z" });
  assert.deepEqual(
    conversations.map((conversation) => conversation.id),
    ["new", "chat", "old"],
  );
});
