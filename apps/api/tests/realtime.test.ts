import { test } from "bun:test";
import assert from "node:assert/strict";
import { io, type Socket } from "socket.io-client";
import { createApp } from "../src/app.js";
import { RealtimeGateway } from "../src/modules/realtime/realtime.gateway.js";
import { WebhookService } from "../src/modules/webhook/webhook.service.js";
import { LineUser, Message } from "../src/database/models/index.js";
import type { Sequelize } from "sequelize-typescript";

function connected(socket: Socket) {
  return new Promise<void>((resolve, reject) => {
    socket.once("connect", resolve);
    socket.once("connect_error", reject);
    socket.connect();
  });
}

test("Socket.IO delivers changes and works after reconnection", async () => {
  const app = await createApp();
  await app.listen(0, "127.0.0.1");
  const socket = io(await app.getUrl(), {
    autoConnect: false,
    transports: ["websocket"],
    reconnection: false,
    timeout: 2000,
    extraHeaders: { Origin: process.env.WEB_ORIGIN || "http://localhost:3099" },
  });
  try {
    const gateway = app.get(RealtimeGateway);
    for (let attempt = 0; attempt < 2; attempt++) {
      await connected(socket);
      const conversation = new Promise<any>((resolve) => socket.once("conversation.updated", resolve));
      const messageCreated = new Promise<any>((resolve) => socket.once("message.created", resolve));
      const message = { id: "M-test", lineUserId: "U-test", body: "hello", direction: "received", createdAt: new Date() } as Message;
      const user = { id: "U-test", name: "Test", lastMessageId: message.id, updatedAt: new Date() } as LineUser;
      gateway.publishMessage(user, message, message);
      assert.equal((await conversation).contact.lastMessageId, "M-test");
      assert.equal((await messageCreated).message.id, "M-test");
      socket.disconnect();
    }
  } finally {
    socket.disconnect();
    await app.close();
  }
});

test("Socket.IO rejects an unrelated origin", async () => {
  const app = await createApp();
  await app.listen(0, "127.0.0.1");
  const socket = io(await app.getUrl(), { autoConnect: false, transports: ["websocket"], reconnection: false, timeout: 2000, extraHeaders: { Origin: "https://unrelated.example" } });
  try {
    await assert.rejects(connected(socket));
  } finally {
    socket.disconnect();
    await app.close();
  }
});

test("unfollow notifies only after commit and does not notify on rollback", async () => {
  let committed = false;
  let emitted = 0;
  const record = { friendStatusAt: null, updatedAt: new Date(), async reload() {}, async update() {} };
  const users = {
    async findOrCreate() {
      return [record];
    },
  } as unknown as typeof LineUser;
  const database = {
    async transaction(callback: (transaction: unknown) => Promise<void>) {
      await callback({ LOCK: { UPDATE: "UPDATE" } });
      committed = true;
    },
  } as unknown as Sequelize;
  const gateway = {
    notify() {
      assert.ok(committed);
      emitted++;
    },
  } as unknown as RealtimeGateway;
  const service = new WebhookService(users, {} as typeof Message, database, gateway);
  await service.handleUnfollow("U-test", Date.now());
  assert.equal(emitted, 1);
  database.transaction = (async () => {
    throw new Error("rollback");
  }) as typeof database.transaction;
  await assert.rejects(service.handleUnfollow("U-test", Date.now()));
  assert.equal(emitted, 1);
});
