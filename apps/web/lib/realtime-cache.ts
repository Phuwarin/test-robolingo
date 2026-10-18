import type { QueryClient } from "@tanstack/react-query";
import { conversationKey, messageKey, type UsersData } from "@/lib/api-queries";
import { mergeConversation, mergeMessage, type Conversation, type ConversationUpdated, type ChatMessage, type MessageCreated } from "@/lib/chat-state";

export function updateConversationCache(client: QueryClient, event: ConversationUpdated) {
  if (!event.conversation) return;
  const incoming = event.conversation;
  client.setQueriesData<Conversation[]>({ queryKey: conversationKey }, (current) => {
    if (!current) return current;
    return mergeConversation(current, incoming);
  });
  client.setQueriesData<UsersData>({ queryKey: ["line-users"] }, (current) => {
    if (!current) return current;
    const users = current.users.map((user) => {
      if (user.id !== incoming.id) return user;
      const isOlder = user.updatedAt && incoming.updatedAt && Date.parse(user.updatedAt) > Date.parse(incoming.updatedAt);
      if (isOlder) return user;
      return { ...user, ...incoming };
    });
    users.sort((a, b) => {
      const statusOrder = Number(a.friendStatus === "unfollow") - Number(b.friendStatus === "unfollow");
      const timeOrder = Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
      return statusOrder || timeOrder || a.id.localeCompare(b.id);
    });
    return { ...current, users };
  });
  if (event.readReceipt) {
    const { messageIds, readAt } = event.readReceipt;
    const ids = new Set(messageIds);
    client.setQueriesData<ChatMessage[]>({ queryKey: messageKey(event.lineUserId) }, (current) => {
      return current?.map((message) => {
        if (!ids.has(message.id)) return message;
        return { ...message, readAt };
      });
    });
  }
}

export function updateMessageCache(client: QueryClient, event: MessageCreated) {
  // Update only rooms whose history has already been loaded. Other rooms fetch on opening.
  client.setQueriesData<ChatMessage[]>({ queryKey: messageKey(event.lineUserId) }, (current) => {
    if (!current) return current;
    return mergeMessage(current, event.message);
  });
}

export function refreshWorkspace(client: QueryClient) {
  const conversations = client.invalidateQueries({ queryKey: conversationKey });
  const users = client.invalidateQueries({ queryKey: ["line-users"] });
  const messages = client.invalidateQueries({ queryKey: ["messages"] });
  return Promise.all([conversations, users, messages]);
}
