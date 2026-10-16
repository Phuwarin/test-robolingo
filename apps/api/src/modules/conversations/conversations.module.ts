import { SequelizeModule } from "@nestjs/sequelize";
import { LineUser, Message } from "../../database/models/index.js";
import { Module } from "@nestjs/common";
import { ConversationsController } from "./conversations.controller.js";
import { ConversationsService } from "./conversations.service.js";
@Module({
  imports: [SequelizeModule.forFeature([LineUser, Message])],
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule {}
