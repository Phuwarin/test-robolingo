import { Body, Controller, Delete, HttpCode, Inject, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import { AuthService } from "./auth.service.js";
@Controller("api/login")
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}
  @Post()
  @HttpCode(200)
  login(@Body() data: { password?: unknown }, @Res({ passthrough: true }) response: Response) {
    response.cookie("session", this.auth.login(data?.password), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 28800000 });
    return { ok: true };
  }
  @Delete()
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie("session", { path: "/" });
    return { ok: true };
  }
}
