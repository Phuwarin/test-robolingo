import { RealtimeModule } from "../realtime/realtime.module.js";
import { SequelizeModule } from "@nestjs/sequelize";
import { LineUser, Message } from "../../database/models/index.js";
import { Module } from "@nestjs/common";
import { WebhookController } from "./webhook.controller.js";
import { WebhookService } from "./webhook.service.js";
@Module({
  imports: [SequelizeModule.forFeature([LineUser, Message]), RealtimeModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
