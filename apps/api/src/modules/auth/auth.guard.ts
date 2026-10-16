import { CanActivate, ExecutionContext, Injectable, Inject, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}
  canActivate(context: ExecutionContext) {
    if (!this.auth.authorized(context.switchToHttp().getRequest())) throw new UnauthorizedException("Unauthorized");
    return true;
  }
}
