import { Controller, Post, HttpCode, Inject, Req, ServiceUnavailableException, UnauthorizedException, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";
import { validSignature } from "../../common/security.js";
import { WebhookService } from "./webhook.service.js";
import type { LineEvent } from "./webhook.types.js";
@Controller("webhook")
export class WebhookController {
  constructor(@Inject(WebhookService) private readonly service: WebhookService) {}
  @Post()
  @HttpCode(200)
  async receive(@Req() request: RawBodyRequest<Request>) {
    const secret = process.env.LINE_CHANNEL_SECRET;
    if (!secret) throw new ServiceUnavailableException("Not configured");
    const body = request.rawBody?.toString("utf8");
    if (body === undefined || !validSignature(body, request.get("x-line-signature") || "", secret)) throw new UnauthorizedException("Invalid signature");
    const payload = request.body as { events: LineEvent[] };
    if (!Array.isArray(payload?.events)) throw new BadRequestException("Invalid events");
    try {
      await this.service.processEvents(payload.events);
    } catch {
      throw new InternalServerErrorException("Webhook processing failed");
    }
    return { ok: true };
  }
}
