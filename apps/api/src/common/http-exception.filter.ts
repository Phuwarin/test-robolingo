import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import type { Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = exception.getResponse();
    const error = typeof response === "string" ? response : (response as { message?: string | string[] }).message || exception.message;
    host.switchToHttp().getResponse<Response>().status(exception.getStatus()).json({ error });
  }
}
