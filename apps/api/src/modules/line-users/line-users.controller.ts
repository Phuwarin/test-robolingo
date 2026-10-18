import { Controller, Get, Query, Inject, BadRequestException, ServiceUnavailableException } from "@nestjs/common";
import { LineUsersService } from "./line-users.service.js";
@Controller("line-users")
export class LineUsersController {
  constructor(@Inject(LineUsersService) private readonly service: LineUsersService) {}
  @Get()
  async list(@Query("q") query = "", @Query("status") status = "") {
    if (typeof query !== "string" || query.length > 200 || !["", "follow", "unfollow", "unknown"].includes(status)) throw new BadRequestException("Invalid filters");
    try {
      return await this.service.list(query.trim(), status);
    } catch {
      throw new ServiceUnavailableException("โหลดรายชื่อผู้ใช้ไม่สำเร็จ");
    }
  }
}
