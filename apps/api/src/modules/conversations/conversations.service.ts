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
    const users = await this.users.findAll({ order: [["updated_at", "DESC"]], raw: true });
    const rows = await this.messages.findAll({
      order: [
        ["created_at", "ASC"],
        ["id", "ASC"],
      ],
      raw: true,
    });
    const previews = new Map<string, string>();
    for (const message of rows) previews.set(message.line_user_id, message.body);
    return { contacts: users.map((user) => ({ ...user, preview: previews.get(user.id) || "" })), messages: rows.map((message) => ({ ...message, contact_id: message.line_user_id })) };
  }
}
