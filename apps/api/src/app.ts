import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module.js";
import { HttpExceptionFilter } from "./common/http-exception.filter.js";
export async function createApp() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    logger: process.env.NODE_ENV === "test" ? false : undefined,
  });
  app.setGlobalPrefix("api");
  app.useBodyParser("json", {
    limit: "1mb",
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  return app;
}
