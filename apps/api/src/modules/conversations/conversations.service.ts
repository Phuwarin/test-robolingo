import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { LineUser, Message } from "../../database/models/index.js";
@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(LineUser) private readonly users: typeof LineUser,
    @InjectModel(Message) private readonly messages: typeof Message,
  ) {}
  async listConversations() {
    const users = await this.users.findAll({
      order: [["updatedAt", "DESC"]],
      raw: true,
    });
    const rows = await this.messages.findAll({
      order: [
        ["createdAt", "ASC"],
        ["id", "ASC"],
      ],
      raw: true,
    });
    const previews = new Map<string, string>();
    for (const message of rows) previews.set(message.lineUserId, message.body);
    return {
      contacts: users.map((user) => ({ ...user, preview: previews.get(user.id) || "" })),
      messages: rows.map((message) => ({ ...message, contactId: message.lineUserId })),
    };
  }
}
