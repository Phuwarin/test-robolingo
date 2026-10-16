import { LineUsersModule } from "./modules/line-users/line-users.module.js";
import { SequelizeModule } from "@nestjs/sequelize";
import { LineUser, Message } from "./database/models/index.js";
import { Module } from "@nestjs/common";
import { ConversationsModule } from "./modules/conversations/conversations.module.js";
import { MessagesModule } from "./modules/messages/messages.module.js";
import { WebhookModule } from "./modules/webhook/webhook.module.js";
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: () => ({
        dialect: "postgres" as const,
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT || 5433),
        database: process.env.DB_NAME || "line_desk",
        username: process.env.DB_USER || "line_desk",
        password: process.env.DB_PASSWORD,
        models: [LineUser, Message],
        autoLoadModels: false,
        synchronize: false,
        logging: false,
        manualInitialization: true,
        pool: { max: 5, min: 0, idle: 10000 },
        dialectOptions: { connectionTimeoutMillis: 5000 },
      }),
    }),
    LineUsersModule,
    ConversationsModule,
    MessagesModule,
    WebhookModule,
  ],
})
export class AppModule {}
