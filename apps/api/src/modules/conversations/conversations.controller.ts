import { Controller, Get, Header, Inject, ServiceUnavailableException } from "@nestjs/common";
import { ConversationsService } from "./conversations.service.js";
@Controller("conversations")
export class ConversationsController {
  constructor(@Inject(ConversationsService) private readonly service: ConversationsService) {}
  @Get()
  @Header("Cache-Control", "no-store")
  async list() {
    try {
      return await this.service.listConversations();
    } catch {
      throw new ServiceUnavailableException("โหลดข้อมูลไม่ได้ ตรวจสอบฐานข้อมูลและ schema.sql");
    }
  }
}
