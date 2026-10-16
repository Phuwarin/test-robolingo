import { Injectable } from "@nestjs/common";
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
  ) {}
  async processEvents(events: LineEvent[]) {
    console.log(
      "Processing events:",
      events.map((e) => e.type),
    );
    for (const event of events) {
      const type = event.type;
      const userId = event.source?.userId;
      if (event.source?.type !== "user" || !userId) continue;
      if (event.type === "follow") {
        await this.handleFollow(userId, event.timestamp);
        continue;
      }
      if (event.type === "unsend" && event.unsend) {
        await this.messages.destroy({ where: { id: event.unsend.messageId, line_user_id: userId } });
        continue;
      }
      if (event.type !== "message" || !event.message) continue;
      let name: string | null = null;
      try {
        const profile = await (await line(`profile/${encodeURIComponent(userId)}`)).json();
        name = profile.displayName || null;
      } catch {
        /* Preserve the user ID if the profile cannot be loaded. */
      }
      const at = new Date(event.timestamp),
        message = event.message;
      await this.database.transaction(async (transaction) => {
        const [user] = await this.users.findOrCreate({ where: { id: userId }, defaults: { id: userId, name: name || userId, updated_at: at }, transaction });
        await user.reload({ transaction, lock: transaction.LOCK.UPDATE });
        await user.update({ name: name || user.name, updated_at: new Date(Math.max(user.updated_at.getTime(), event.timestamp)) }, { transaction });
        await this.messages.findOrCreate({
          where: { id: message.id },
          defaults: { id: message.id, line_user_id: userId, direction: "in", body: message.type === "text" ? message.text || "" : `[${message.type}]`, created_at: at },
          transaction,
        });
      });
    }
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
      const [user] = await this.users.findOrCreate({ where: { id: userId }, defaults: { id: userId, name: name || userId, friend_status: "unknown", updated_at: at }, transaction });
      await user.reload({ transaction, lock: transaction.LOCK.UPDATE });
      if (user.friend_status_at && user.friend_status_at.getTime() > timestamp) return;
      await user.update(
        {
          name: name || user.name,
          picture_url: pictureUrl || user.picture_url,
          friend_status: "follow",
          friend_status_at: at,
          followed_at: at,
          updated_at: new Date(Math.max(user.updated_at.getTime(), timestamp)),
        },
        { transaction },
      );
    });
  }
}
