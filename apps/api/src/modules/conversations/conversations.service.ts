import { Op, literal } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { RealtimeGateway } from "../realtime/realtime.gateway.js";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/sequelize";
import { LineUser, Message } from "../../database/models/index.js";
@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(LineUser) private readonly users: typeof LineUser,
    @InjectModel(Message) private readonly messages: typeof Message,
    @InjectConnection() private readonly database: Sequelize,
    @Inject(RealtimeGateway) private readonly realtime: RealtimeGateway,
  ) {}
  async listConversations() {
    const conversations = await this.users.findAll({
      include: [{ model: Message, as: "lastMessage", attributes: ["body"], required: false }],
      order: [
        [literal('COALESCE("LineUser"."last_message_time", "LineUser"."created_at")'), "DESC"],
        ["id", "ASC"],
      ],
    });
    return { conversations };
  }
  async getUnreadCount() {
    const users = await this.users.findAll({
      attributes: ["id", "unreadCount", "updatedAt"],
      raw: true,
    });
    return { unreadCount: users.reduce((total, user) => total + user.unreadCount, 0), users };
  }
  async markRead(lineUserId: string, messageIds: string[]) {
    const readAt = new Date();
    const saved = await this.database.transaction(async (transaction) => {
      const user = await this.users.findOne({ where: { id: lineUserId }, transaction, lock: transaction.LOCK.UPDATE });
      if (!user) throw new NotFoundException("User not found");
      const [changed, rows] = await this.messages.update(
        { readAt },
        {
          where: { id: { [Op.in]: messageIds }, lineUserId, direction: "received", readAt: null },
          returning: true,
          transaction,
        },
      );
      const unreadCount = await this.messages.count({ where: { lineUserId, direction: "received", readAt: null }, transaction });
      await user.update({ unreadCount }, { transaction });
      const latest = await this.messages.findOne({
        where: { lineUserId },
        order: [
          ["createdAt", "DESC"],
          ["id", "DESC"],
        ],
        transaction,
      });
      return { user, latest, changed, messageIds: rows.map((message) => message.id) };
    });
    const receipt = { messageIds: saved.messageIds, readAt: readAt.toISOString() };
    if (saved.changed) this.realtime.publishConversation(saved.user, saved.latest, receipt);
    return { unreadCount: saved.user.unreadCount, updatedAt: saved.user.updatedAt, messageIds, readAt: readAt.toISOString() };
  }
}
