import { Controller, Get, Header, Inject, ServiceUnavailableException, Post, Param, Body, BadRequestException, HttpCode } from "@nestjs/common";
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
  @Post(":lineUserId/read")
  @HttpCode(200)
  async markRead(@Param("lineUserId") lineUserId: string, @Body() data: { messageIds?: unknown }) {
    if (!Array.isArray(data?.messageIds) || data.messageIds.length < 1 || data.messageIds.length > 1000 || data.messageIds.some((id) => typeof id !== "string" || !id || id.length > 200))
      throw new BadRequestException("Provide 1–1000 message IDs");
    return this.service.markRead(lineUserId, data.messageIds);
  }
  @Get("unread-count")
  @Header("Cache-Control", "no-store")
  async unreadCount() {
    return this.service.getUnreadCount();
  }
}
