import { Injectable } from "@nestjs/common";
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
  ) {}
  async sendMessage(data: { to: string; text: string; id: string }) {
    if (!(await this.users.findByPk(data.to))) return false;
    if (await this.messages.findByPk(data.id)) return true;
    await line("message/push", { method: "POST", headers: { "X-Line-Retry-Key": data.id }, body: JSON.stringify({ to: data.to, messages: [{ type: "text", text: data.text.trim() }] }) });
    await this.database.transaction(async (transaction) => {
      await this.messages.findOrCreate({ where: { id: data.id }, defaults: { id: data.id, line_user_id: data.to, direction: "out", body: data.text.trim() }, transaction });
      await this.users.update({ updated_at: new Date() }, { where: { id: data.to }, transaction });
    });
    return true;
  }
}
