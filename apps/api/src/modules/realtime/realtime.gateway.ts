import type { LineUser, Message } from "../../database/models/index.js";
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

  publishConversation(user: LineUser, latest: Message | null, readReceipt?: { messageIds: string[]; readAt: string }) {
    const event = {
      lineUserId: user.id,
      conversation: {
        id: user.id,
        name: user.name,
        pictureUrl: user.pictureUrl,
        friendStatus: user.friendStatus,
        lastMessageId: user.lastMessageId,
        unreadCount: user.unreadCount,
        lastMessage: latest ? { body: latest.body, createdAt: latest.createdAt } : null,
        updatedAt: user.updatedAt,
      },
      readReceipt,
    };
    this.server?.emit("message.update", event);
    return event;
  }

  publishMessage(user: LineUser, message: Message, latest: Message | null) {
    this.publishConversation(user, latest);
    this.server?.emit("message.sent", {
      lineUserId: user.id,
      message: {
        id: message.id,
        lineUserId: user.id,
        direction: message.direction,
        body: message.body,
        createdAt: message.createdAt,
        readAt: message.readAt,
      },
    });
  }

  publishUserUpdated(lineUserId: string) {
    this.server?.emit("workspace.updated", { lineUserId, reason: "user" });
  }
}
