import { RealtimeGateway } from "../src/modules/realtime/realtime.gateway.js";
import { test } from "bun:test";
import assert from "node:assert/strict";
import { Sequelize } from "sequelize-typescript";
import { WebhookService } from "../src/modules/webhook/webhook.service.js";
import { LineUser, Message } from "../src/database/models/index.js";
function setup(existing = true) {
  let updates = 0;
  let created = false;
  const record = {
    name: "Existing name",
    pictureUrl: "https://example.com/avatar.png",
    friendStatus: "follow",
    friendStatusAt: new Date(1000),
    updatedAt: new Date(1000),
    async reload() {
      return this;
    },
    async update(values: object) {
      updates++;
      Object.assign(this, values);
      return this;
    },
  };
  const users = {
    async findOrCreate(options: { defaults: Record<string, unknown> }) {
      if (!existing) {
        created = true;
        Object.assign(record, options.defaults);
        record.friendStatusAt = null as unknown as Date;
        existing = true;
      }
      return [record];
    },
  };
  const database = {
    async transaction(callback: (transaction: unknown) => Promise<void>) {
      return callback({ LOCK: { UPDATE: "UPDATE" } });
    },
  };
  return {
    record,
    service: new WebhookService(users as unknown as typeof LineUser, {} as typeof Message, database as unknown as Sequelize, { publishUserUpdated() {} } as RealtimeGateway),
    updates: () => updates,
    created: () => created,
  };
}
test("unfollow keeps profile, ignores duplicate and older events", async () => {
  const { service, record, updates } = setup();
  await service.handleUnfollow("U-test", 2000);
  assert.equal(record.friendStatus, "unfollow");
  assert.equal(record.friendStatusAt.getTime(), 2000);
  assert.equal(record.name, "Existing name");
  assert.equal(record.pictureUrl, "https://example.com/avatar.png");
  await service.handleUnfollow("U-test", 2000);
  await service.handleUnfollow("U-test", 500);
  assert.equal(updates(), 1);
  record.friendStatus = "follow";
  record.friendStatusAt = new Date(3000);
  await service.handleUnfollow("U-test", 2500);
  assert.equal(record.friendStatus, "follow");
});
test("unfollow creates a missing user without a LINE profile lookup", async () => {
  const { service, record, created } = setup(false);
  await service.handleUnfollow("U-new", 2000);
  assert.ok(created());
  assert.equal(record.name, "U-new");
  assert.equal(record.friendStatus, "unfollow");
});
