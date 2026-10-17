import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import type { Server } from "socket.io";

export function allowedSocketOrigin(origin: string | undefined) {
  const origins = [process.env.WEB_ORIGIN || "http://localhost:3099"];
  if (process.env.NODE_ENV !== "production") origins.push("http://localhost:3099");
  return !!origin && origins.includes(origin);
}

@WebSocketGateway({
  transports: ["websocket"],
  cors: { origin: (origin: string | undefined, callback: (error: Error | null, allowed: boolean) => void) => callback(null, allowedSocketOrigin(origin)) },
  allowRequest: (request: { headers: { origin?: string } }, callback: (error: string | null, allowed: boolean) => void) => callback(null, allowedSocketOrigin(request.headers.origin)),
})
export class RealtimeGateway {
  @WebSocketServer()
  declare server: Server;

  notify(lineUserId: string, reason: "message" | "user") {
    this.server?.emit("workspace.updated", { lineUserId, reason });
  }
}
