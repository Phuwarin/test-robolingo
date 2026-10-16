import { Injectable, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { equal, token, validToken } from "../../common/security.js";
@Injectable()
export class AuthService {
  authorized(request: Request) {
    const secret = process.env.SESSION_SECRET;
    const cookie =
      request.headers.cookie
        ?.split(";")
        .map((p) => p.trim())
        .find((p) => p.startsWith("session="))
        ?.slice(8) || "";
    return !!secret && validToken(cookie, secret);
  }
  login(password: unknown) {
    if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) throw new ServiceUnavailableException("กรุณาตั้งค่า ADMIN_PASSWORD และ SESSION_SECRET บนเซิร์ฟเวอร์");
    if (typeof password !== "string" || !equal(password, process.env.ADMIN_PASSWORD)) throw new UnauthorizedException("รหัสผ่านไม่ถูกต้อง");
    return token(process.env.SESSION_SECRET);
  }
}
