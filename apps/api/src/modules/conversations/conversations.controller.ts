import { Controller, Get, Header, Inject, ServiceUnavailableException, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard.js";
import { ConversationsService } from "./conversations.service.js";
@Controller("api/conversations")
@UseGuards(AuthGuard)
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
