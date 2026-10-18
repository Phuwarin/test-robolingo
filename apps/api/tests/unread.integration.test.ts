import { test } from "bun:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createApp } from "../src/app.js";
import { LineUser, Message } from "../src/database/models/index.js";
import { WebhookService } from "../src/modules/webhook/webhook.service.js";
import { MessagesService } from "../src/modules/messages/messages.service.js";
import { ConversationsService } from "../src/modules/conversations/conversations.service.js";

test.skipIf(process.env.RUN_DB_TESTS !== "1")("unread persists, deduplicates and marks only displayed incoming messages read", async () => {
  const app = await createApp();
  const userId = `unread-test-${randomUUID()}`;
  const otherId = `unread-test-${randomUUID()}`;
  const fetchOriginal = globalThis.fetch;
  let pushedTo: string | undefined;
  globalThis.fetch = ((url, options) => {
    if (!String(url).startsWith("https://api.line.me/")) return fetchOriginal(url, options);
    if (String(url).includes("/profile/")) return Promise.resolve(Response.json({ displayName: "Unread integration test" }));
    pushedTo = JSON.parse(String(options?.body)).to;
    return Promise.resolve(Response.json({ sentMessages: [{ id: randomUUID() }] }));
  }) as typeof fetch;
  try {
    const webhook = app.get(WebhookService);
    const conversations = app.get(ConversationsService);
    const first = { id: randomUUID(), type: "text", text: "first" };
    const second = { id: randomUUID(), type: "text", text: "second" };
    await webhook.handleMessage(userId, Date.now(), first);
    await webhook.handleMessage(userId, Date.now(), first);
    await webhook.handleMessage(userId, Date.now(), second);
    const user = (await LineUser.findOne({ where: { lineUserId: userId } }))!;
    assert.notEqual(user.id, userId);
    assert.equal(user.unreadCount, 2);
    assert.equal(await Message.count({ where: { lineUserId: user.id } }), 2);
    const firstStored = (await Message.findOne({ where: { lineMessageId: first.id } }))!;
    const secondStored = (await Message.findOne({ where: { lineMessageId: second.id } }))!;
    assert.notEqual(firstStored.id, first.id);
    assert.equal(firstStored.lineUserId, user.id);

    await webhook.handleFollow(userId, Date.now());
    await webhook.handleUnfollow(userId, Date.now() + 1);
    assert.equal((await LineUser.findOne({ where: { lineUserId: userId } }))?.id, user.id);
    assert.equal(await LineUser.count({ where: { lineUserId: userId } }), 1);
    await webhook.handleFollow(userId, Date.now() + 2);

    await app.get(MessagesService).sendMessage({ to: user.id, text: "outgoing does not count" });
    assert.equal(pushedTo, userId);
    assert.equal((await LineUser.findOne({ where: { lineUserId: userId } }))?.unreadCount, 2);

    const read = await conversations.markRead(user.id, [firstStored.id]);
    assert.equal(read.unreadCount, 1);
    assert.ok((await Message.findOne({ where: { id: firstStored.id } }))?.readAt);
    assert.equal((await Message.findOne({ where: { id: secondStored.id } }))?.readAt, null);
    assert.equal((await conversations.markRead(user.id, [firstStored.id])).unreadCount, 1);

    await webhook.handleMessage(otherId, Date.now(), { id: randomUUID(), type: "text", text: "another room" });
    const other = (await LineUser.findOne({ where: { lineUserId: otherId } }))!;
    await conversations.markRead(other.id, [secondStored.id]);
    assert.equal((await LineUser.findOne({ where: { lineUserId: userId } }))?.unreadCount, 1);
    assert.equal((await LineUser.findOne({ where: { lineUserId: otherId } }))?.unreadCount, 1);
    assert.equal((await conversations.markRead(user.id, [secondStored.id])).unreadCount, 0);
  } finally {
    globalThis.fetch = fetchOriginal;
    for (const id of [userId, otherId]) {
      const user = await LineUser.findOne({ where: { lineUserId: id } });
      if (user) {
        await Message.destroy({ where: { lineUserId: user.id } });
        await user.destroy();
      }
    }
    await app.close();
  }
});
