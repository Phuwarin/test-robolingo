import { RealtimeGateway } from "../realtime/realtime.gateway.js";
import { Inject, Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { LineUser, Message } from "../../database/models/index.js";
import { line } from "../../integrations/line/line.client.js";
import type { LineEvent } from "./webhook.types.js";
@Injectable()
export class WebhookService {
  constructor(
    @InjectModel(LineUser) private readonly users: typeof LineUser,
    @InjectModel(Message) private readonly messages: typeof Message,
    @InjectConnection() private readonly database: Sequelize,
    @Inject(RealtimeGateway) private readonly realtime: RealtimeGateway,
  ) {}
  async processEvents(events: LineEvent[]) {
    console.log(events);
    for (const event of events) {
      const userId = event.source?.userId;
      if (event.source?.type !== "user" || !userId) continue;
      if (event.type === "follow") {
        await this.handleFollow(userId, event.timestamp);
        continue;
      }
      if (event.type === "unfollow") {
        await this.handleUnfollow(userId, event.timestamp);
        continue;
      }
      if (event.type !== "message" || !event.message) continue;
      await this.handleMessage(userId, event.timestamp, event.message);
    }
  }
  async handleMessage(userId: string, timestamp: number, message: NonNullable<LineEvent["message"]>) {
    let name: string | null = null;
    try {
      const profile = await (await line(`profile/${encodeURIComponent(userId)}`)).json();
      name = profile.displayName || null;
    } catch {
      /* Preserve the user ID if the profile cannot be loaded. */
    }
    const at = new Date(timestamp);
    const saved = await this.database.transaction(async (transaction) => {
      // คาดว่าจะไม่มีกรณีที่ยังไม่มี User เพราะระบบเริ่มใช้งานพร้อมกัน และ event follow จะสร้าง User ไว้ก่อนแล้ว
      const [user] = await this.users.findOrCreate({
        where: { lineUserId: userId },
        defaults: { lineUserId: userId, name: name || userId, updatedAt: at },
        transaction,
      });
      await user.reload({
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      await user.update(
        {
          name: name || user.name,
          updatedAt: new Date(Math.max(user.updatedAt.getTime(), timestamp)),
        },
        {
          transaction,
        },
      );
      const [storedMessage, created] = await this.messages.findOrCreate({
        where: { lineMessageId: message.id },
        defaults: { lineMessageId: message.id, lineUserId: user.id, direction: "received", body: message.type === "text" ? message.text || "" : `[${message.type}]`, createdAt: at },
        transaction,
      });
      const latest = await this.messages.findOne({
        where: { lineUserId: user.id },
        order: [
          ["createdAt", "DESC"],
          ["id", "DESC"],
        ],
        transaction,
      });
      await user.update(
        {
          lastMessageId: latest?.id || null,
          lastMessageTime: latest?.createdAt || null,
          unreadCount: user.unreadCount + (created ? 1 : 0),
        },
        {
          transaction,
        },
      );
      return { user, message: storedMessage, latest, created };
    });
    if (saved.created) this.realtime.publishMessage(saved.user, saved.message, saved.latest);
  }

  async handleFollow(userId: string, timestamp: number) {
    let name: string | null = null,
      pictureUrl: string | null = null;
    try {
      const profile = await (await line(`profile/${encodeURIComponent(userId)}`)).json();
      name = profile.displayName || null;
      pictureUrl = profile.pictureUrl || null;
    } catch {
      /* Store the follow even if the profile is unavailable. */
    }
    const at = new Date(timestamp);
    await this.database.transaction(async (transaction) => {
      const [user] = await this.users.findOrCreate({
        where: { lineUserId: userId },
        defaults: { lineUserId: userId, name: name || userId, friendStatus: "unknown", updatedAt: at },
        transaction,
      });
      await user.reload({
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (user.friendStatusAt && user.friendStatusAt.getTime() > timestamp) return;
      await user.update(
        {
          name: name || user.name,
          pictureUrl: pictureUrl || user.pictureUrl,
          friendStatus: "follow",
          friendStatusAt: at,
          updatedAt: new Date(Math.max(user.updatedAt.getTime(), timestamp)),
        },
        {
          transaction,
        },
      );
    });
    this.realtime.publishUserUpdated(userId);
  }

  async handleUnfollow(userId: string, timestamp: number) {
    const at = new Date(timestamp);
    await this.database.transaction(async (transaction) => {
      const [user] = await this.users.findOrCreate({
        where: { lineUserId: userId },
        defaults: { lineUserId: userId, name: userId, friendStatus: "unknown", updatedAt: at },
        transaction,
      });
      await user.reload({
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (user.friendStatusAt && user.friendStatusAt.getTime() >= timestamp) return;
      await user.update(
        {
          friendStatus: "unfollow",
          friendStatusAt: at,
          updatedAt: new Date(Math.max(user.updatedAt.getTime(), timestamp)),
        },
        {
          transaction,
        },
      );
    });
    this.realtime.publishUserUpdated(userId);
  }
}
