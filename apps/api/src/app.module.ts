import { SequelizeModule } from "@nestjs/sequelize";
import { LineUser, Message } from "./database/models/index.js";
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { ConversationsModule } from "./modules/conversations/conversations.module.js";
import { MessagesModule } from "./modules/messages/messages.module.js";
import { WebhookModule } from "./modules/webhook/webhook.module.js";
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: () => ({
        dialect: "postgres" as const,
        uri: process.env.DATABASE_URL || "postgres://localhost/line_desk",
        models: [LineUser, Message],
        autoLoadModels: false,
        synchronize: false,
        logging: false,
        manualInitialization: true,
        pool: { max: 5, min: 0, idle: 10000 },
        dialectOptions: { connectionTimeoutMillis: 5000 },
      }),
    }),
    ConversationsModule,
    MessagesModule,
    WebhookModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
