import { Body, Controller, Post, HttpCode, Inject, Req, ForbiddenException, BadRequestException, NotFoundException, BadGatewayException } from "@nestjs/common";
import type { Request } from "express";
import { MessagesService } from "./messages.service.js";
@Controller("messages")
export class MessagesController {
  constructor(@Inject(MessagesService) private readonly service: MessagesService) {}
  @Post()
  @HttpCode(200)
  async send(@Req() request: Request, @Body() data: { to?: unknown; text?: unknown }) {
    if (request.headers.origin !== (process.env.WEB_ORIGIN || "http://localhost:3099")) throw new ForbiddenException("Invalid origin");
    if (!data || typeof data.to !== "string" || typeof data.text !== "string" || !data.text.trim() || data.text.length > 5000)
      throw new BadRequestException("ข้อมูลข้อความไม่ถูกต้อง (สูงสุด 5,000 ตัวอักษร)");
    let found: boolean;
    try {
      found = await this.service.sendMessage({
        to: data.to,
        text: data.text,
      });
    } catch {
      throw new BadGatewayException("ส่งไม่สำเร็จ กรุณาตรวจสอบ LINE token / โควตา แล้วลองอีกครั้ง");
    }
    if (!found) throw new NotFoundException("ไม่พบผู้ใช้");
    return {
      ok: true,
    };
  }
}
