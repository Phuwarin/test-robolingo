import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { ConversationsModule } from "./modules/conversations/conversations.module.js";
import { MessagesModule } from "./modules/messages/messages.module.js";
import { WebhookModule } from "./modules/webhook/webhook.module.js";
@Module({ imports: [AuthModule, ConversationsModule, MessagesModule, WebhookModule], controllers: [AppController] })
export class AppModule {}
