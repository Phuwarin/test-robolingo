import { SequelizeModule } from "@nestjs/sequelize";
import { LineUser, Message } from "../../database/models/index.js";
import { Module } from "@nestjs/common";
import { MessagesController } from "./messages.controller.js";
import { MessagesService } from "./messages.service.js";
@Module({
  imports: [SequelizeModule.forFeature([LineUser, Message])],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
