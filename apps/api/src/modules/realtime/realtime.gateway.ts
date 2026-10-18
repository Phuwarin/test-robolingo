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
      contact: {
        id: user.id,
        name: user.name,
        pictureUrl: user.pictureUrl,
        friendStatus: user.friendStatus,
        lastMessageId: user.lastMessageId,
        unreadCount: user.unreadCount,
        lastMessageAt: latest?.createdAt || null,
        preview: latest?.body || "",
        updatedAt: user.updatedAt,
      },
      readReceipt,
    };
    this.server?.emit("conversation.updated", event);
    return event;
  }

  publishMessage(user: LineUser, message: Message, latest: Message | null) {
    this.publishConversation(user, latest);
    this.server?.emit("message.created", {
      lineUserId: user.id,
      message: {
        id: message.id,
        contactId: user.id,
        direction: message.direction,
        body: message.body,
        createdAt: message.createdAt,
        readAt: message.readAt,
      },
    });
  }

  notify(lineUserId: string, reason: "message" | "user") {
    this.server?.emit("workspace.updated", { lineUserId, reason });
  }
}
