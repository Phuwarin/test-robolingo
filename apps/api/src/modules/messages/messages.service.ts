import { RealtimeGateway } from "../realtime/realtime.gateway.js";
import { randomUUID } from "node:crypto";
import { Inject, Injectable, ForbiddenException } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { LineUser, Message } from "../../database/models/index.js";
import { line } from "../../integrations/line/line.client.js";
@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(LineUser) private readonly users: typeof LineUser,
    @InjectModel(Message) private readonly messages: typeof Message,
    @InjectConnection() private readonly database: Sequelize,
    @Inject(RealtimeGateway) private readonly realtime: RealtimeGateway,
  ) {}
  async listMessages(lineUserId: string) {
    return this.messages.findAll({
      where: { lineUserId },
      order: [
        ["createdAt", "ASC"],
        ["id", "ASC"],
      ],
    });
  }
  async sendMessage(data: { to: string; text: string }) {
    const recipient = await this.users.findOne({
      where: { id: data.to },
    });
    if (!recipient) {
      return false;
    }

    if (recipient.friendStatus === "unfollow") {
      throw new ForbiddenException("ผู้ใช้บล็อก OA ไม่สามารถส่งข้อความได้");
    }

    const sentAt = new Date();
    const response = await line("message/push", {
      method: "POST",
      body: JSON.stringify({ to: recipient.lineUserId, messages: [{ type: "text", text: data.text.trim() }] }),
    });
    const result = (await response.json()) as { sentMessages?: Array<{ id: string }> };
    const messageId = randomUUID();
    const lineMessageId = result.sentMessages?.[0]?.id || null;

    const saved = await this.database.transaction(async (transaction) => {
      const user = await this.users.findOne({
        where: { id: data.to },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!user) throw new Error("User no longer exists");
      const message = await this.messages.create({ id: messageId, lineMessageId, lineUserId: data.to, direction: "botSent", body: data.text.trim(), createdAt: sentAt }, { transaction });
      const latest = await this.messages.findOne({
        where: { lineUserId: data.to },
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
          updatedAt: new Date(),
        },
        {
          transaction,
        },
      );
      return { user, message, latest };
    });
    this.realtime.publishMessage(saved.user, saved.message, saved.latest);
    return true;
  }
}
