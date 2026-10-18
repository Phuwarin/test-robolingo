import { test } from "bun:test";
import assert from "node:assert/strict";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { conversationKey, messageKey, userKey, type UsersData } from "../lib/api-queries";
import { updateConversationCache, updateMessageCache } from "../lib/realtime-cache";
import type { Conversation, ChatMessage } from "../lib/chat-state";

test("returning to a page sees cached data immediately while a refresh runs", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const data = { users: [], total: 7 };
  client.setQueryData(userKey(), data);
  let finish!: (value: UsersData) => void;
  const observer = new QueryObserver(client, {
    queryKey: userKey(),
    queryFn: () =>
      new Promise<UsersData>((resolve) => {
        finish = resolve;
      }),
    refetchOnMount: "always",
  });
  const unsubscribe = observer.subscribe(() => {});
  assert.deepEqual(observer.getCurrentResult().data, data);
  assert.equal(observer.getCurrentResult().isPending, false);
  assert.equal(observer.getCurrentResult().isFetching, true);
  const refreshed = observer.refetch({ cancelRefetch: false });
  finish({ users: [], total: 8 });
  await refreshed;
  assert.equal(observer.getCurrentResult().data?.total, 8);
  unsubscribe();
  client.clear();
});

test("socket updates cached users, unread and room history even while pages are unmounted", () => {
  const client = new QueryClient();
  const conversation: Conversation = { id: "user", name: "User", unreadCount: 0, updatedAt: "2026-10-18T10:00:00Z" };
  client.setQueryData(conversationKey, [conversation]);
  client.setQueryData(userKey(), { users: [{ ...conversation, lineUserId: "LINE-ID", friendStatus: "follow" }], total: 1 });
  client.setQueryData(messageKey("user"), []);
  const message: ChatMessage = { id: "message", lineUserId: "user", body: "hello", direction: "received", createdAt: "2026-10-18T10:01:00Z" };
  const changed = { ...conversation, unreadCount: 1, updatedAt: message.createdAt, lastMessageTime: message.createdAt, lastMessage: { body: "hello" } };
  updateConversationCache(client, { lineUserId: "user", conversation: changed });
  updateMessageCache(client, { lineUserId: "user", message });
  updateMessageCache(client, { lineUserId: "user", message });
  assert.equal(client.getQueryData<UsersData>(userKey())?.users[0].unreadCount, 1);
  assert.equal(client.getQueryData<ChatMessage[]>(messageKey("user"))?.length, 1);
  updateConversationCache(client, {
    lineUserId: "user",
    conversation: { ...changed, unreadCount: 0, updatedAt: "2026-10-18T10:02:00Z" },
    readReceipt: { messageIds: [message.id], readAt: "2026-10-18T10:02:00Z" },
  });
  assert.equal(client.getQueryData<UsersData>(userKey())?.users[0].unreadCount, 0);
  assert.ok(client.getQueryData<ChatMessage[]>(messageKey("user"))?.[0].readAt);
  assert.equal(client.getQueryData<UsersData>(userKey())?.users[0].lineUserId, "LINE-ID");
  client.clear();
});
