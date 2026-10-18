export type Conversation = {
  id: string;
  name: string;
  lastMessage?: { body: string; createdAt: string } | null;
  friendStatus?: "follow" | "unfollow" | "unknown";
  unreadCount?: number;
  pictureUrl?: string | null;
  lastMessageId?: string | null;
  updatedAt?: string;
};
export type ChatMessage = { id: string; lineUserId: string; direction: "received" | "botSent"; body: string; readAt?: string | null; createdAt: string };
export type ConversationUpdated = { lineUserId: string; conversation: Conversation; readReceipt?: { messageIds: string[]; readAt: string } };
export type MessageCreated = { lineUserId: string; message: ChatMessage };
export type UnreadUser = { id: string; unreadCount: number; updatedAt?: string };
export function mergeUnread(current: Record<string, UnreadUser>, incoming: UnreadUser) {
  const existing = current[incoming.id];
  if (existing?.updatedAt && incoming.updatedAt && Date.parse(existing.updatedAt) > Date.parse(incoming.updatedAt)) return current;
  return { ...current, [incoming.id]: incoming };
}
export function mergeConversation(current: Conversation[], incoming: Conversation) {
  const existing = current.find((conversation) => conversation.id === incoming.id);
  if (existing?.updatedAt && incoming.updatedAt && Date.parse(existing.updatedAt) > Date.parse(incoming.updatedAt)) return current;
  const result = existing ? current.map((conversation) => (conversation.id === incoming.id ? { ...conversation, ...incoming } : conversation)) : [...current, incoming];
  return result.sort((a, b) => Date.parse(b.lastMessage?.createdAt || "1970-01-01") - Date.parse(a.lastMessage?.createdAt || "1970-01-01"));
}
export function mergeMessage(current: ChatMessage[], incoming: ChatMessage) {
  const existing = current.find((message) => message.id === incoming.id);
  if (existing) {
    if (incoming.readAt && !existing.readAt) return current.map((message) => (message.id === incoming.id ? { ...message, readAt: incoming.readAt } : message));
    return current;
  }
  return [...current, incoming].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.id.localeCompare(b.id));
}
