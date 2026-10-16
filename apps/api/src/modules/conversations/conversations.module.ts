import { Module } from "@nestjs/common";
import { ConversationsController } from "./conversations.controller.js";
import { ConversationsService } from "./conversations.service.js";
import { AuthModule } from "../auth/auth.module.js";
@Module({ imports: [AuthModule], controllers: [ConversationsController], providers: [ConversationsService] })
export class ConversationsModule {}
