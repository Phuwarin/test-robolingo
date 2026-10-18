"use client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Conversation } from "@/lib/chat-state";
export function ConversationHeader({ conversation }: { conversation: Conversation }) {
  return (
    <div className="chat-header">
      <Avatar className="avatar">
        <AvatarImage src={conversation.pictureUrl || undefined} alt="" />
        <AvatarFallback>{conversation.name.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <div>
        <strong>{conversation.name}</strong>
        <small>{conversation.id}</small>
      </div>
      <Badge variant="secondary" className="channel">
        LINE
      </Badge>
    </div>
  );
}
