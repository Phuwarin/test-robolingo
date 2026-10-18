import { test } from "bun:test";
import assert from "node:assert/strict";
import { ForbiddenException } from "@nestjs/common";
import { MessagesService } from "../src/modules/messages/messages.service.js";
import { LineUser, Message } from "../src/database/models/index.js";
import type { Sequelize } from "sequelize-typescript";
import type { RealtimeGateway } from "../src/modules/realtime/realtime.gateway.js";

test("blocked recipients are rejected before sending to LINE or writing messages", async () => {
  const users = {
    async findOne() {
      return { id: "U-blocked", friendStatus: "unfollow" };
    },
  } as unknown as typeof LineUser;
  const service = new MessagesService(users, {} as typeof Message, {} as Sequelize, {} as RealtimeGateway);
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (() => {
    calls++;
    throw new Error("Must not call LINE");
  }) as typeof fetch;
  try {
    await assert.rejects(service.sendMessage({ to: "U-blocked", text: "hello" }), (error: unknown) => error instanceof ForbiddenException && error.getStatus() === 403);
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
