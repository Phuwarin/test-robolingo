import { Controller, Get, Query, Inject, BadRequestException, ServiceUnavailableException } from "@nestjs/common";
import { LineUsersService } from "./line-users.service.js";
@Controller("line-users")
export class LineUsersController {
  constructor(@Inject(LineUsersService) private readonly service: LineUsersService) {}
  @Get()
  async list(@Query("q") query = "", @Query("status") status = "", @Query("page") rawPage = "1", @Query("limit") rawLimit = "25") {
    const page = Number(rawPage),
      limit = Number(rawLimit);
    if (
      typeof query !== "string" ||
      query.length > 200 ||
      !["", "follow", "unfollow", "unknown"].includes(status) ||
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    )
      throw new BadRequestException("Invalid filters or pagination");
    try {
      return await this.service.list(query.trim(), status, page, limit);
    } catch {
      throw new ServiceUnavailableException("โหลดรายชื่อผู้ใช้ไม่สำเร็จ");
    }
  }
}
