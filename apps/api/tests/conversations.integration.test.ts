import { test } from "bun:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Op } from "sequelize";
import { createApp } from "../src/app.js";
import { LineUser, Message } from "../src/database/models/index.js";
import { MessagesService } from "../src/modules/messages/messages.service.js";
import { ConversationsService } from "../src/modules/conversations/conversations.service.js";

test.skipIf(process.env.RUN_DB_TESTS !== "1")("conversations join lastMessage and order received/sent messages before empty chats", async () => {
  const app = await createApp();
  const ids = [randomUUID(), randomUUID(), randomUUID()];
  try {
    for (const id of ids) await LineUser.create({ id, lineUserId: `conversation-test-${id}`, name: "Order test" });
    const received = await Message.create({ lineUserId: ids[0], direction: "received", body: "incoming", createdAt: new Date("2026-01-01T10:00:00Z") });
    const sent = await Message.create({ lineUserId: ids[1], direction: "botSent", body: "outgoing", createdAt: new Date("2026-01-01T11:00:00Z") });
    await LineUser.update({ lastMessageId: received.id }, { where: { id: ids[0] } });
    await LineUser.update({ lastMessageId: sent.id }, { where: { id: ids[1] } });
    const service = app.get(ConversationsService);
    let result = await service.listConversations();
    let conversations = result.conversations.filter((conversation) => ids.includes(conversation.id));
    assert.deepEqual(
      conversations.map((conversation) => conversation.id),
      [ids[1], ids[0], ids[2]],
    );
    assert.equal(conversations[0].lastMessage?.body, "outgoing");
    assert.equal(conversations[2].lastMessage, null);
    assert.equal("messages" in result, false);
    const history = await app.get(MessagesService).listMessages(ids[0]);
    assert.deepEqual(
      history.map((message) => message.id),
      [received.id],
    );
    assert.equal(history[0].lineUserId, ids[0]);
    assert.deepEqual(await app.get(MessagesService).listMessages(ids[2]), []);
    const newest = await Message.create({ lineUserId: ids[0], direction: "received", body: "latest incoming", createdAt: new Date("2026-01-01T12:00:00Z") });
    await LineUser.update({ lastMessageId: newest.id }, { where: { id: ids[0] } });
    result = await service.listConversations();
    conversations = result.conversations.filter((conversation) => ids.includes(conversation.id));
    assert.deepEqual(
      conversations.map((conversation) => conversation.id),
      [ids[0], ids[1], ids[2]],
    );
    assert.equal(conversations[0].lastMessage?.body, "latest incoming");
  } finally {
    await Message.destroy({ where: { lineUserId: { [Op.in]: ids } } });
    await LineUser.destroy({ where: { id: { [Op.in]: ids } } });
    await app.close();
  }
});
