export type Contact = {
  id: string;
  name: string;
  preview: string;
  friendStatus?: "follow" | "unfollow" | "unknown";
  unreadCount?: number;
  pictureUrl?: string | null;
  lastMessageId?: string | null;
  lastMessageAt?: string | null;
  updatedAt?: string;
};
export type ChatMessage = { id: string; contactId: string; direction: "received" | "botSent"; body: string; readAt?: string | null; createdAt: string };
export type ConversationUpdated = { lineUserId: string; contact: Contact; readReceipt?: { messageIds: string[]; readAt: string } };
export type MessageCreated = { lineUserId: string; message: ChatMessage };
export function mergeConversation(current: Contact[], incoming: Contact) {
  const existing = current.find((contact) => contact.id === incoming.id);
  if (existing?.updatedAt && incoming.updatedAt && Date.parse(existing.updatedAt) > Date.parse(incoming.updatedAt)) return current;
  const result = existing ? current.map((contact) => (contact.id === incoming.id ? { ...contact, ...incoming } : contact)) : [...current, incoming];
  return result.sort((a, b) => Date.parse(b.lastMessageAt || b.updatedAt || "1970-01-01") - Date.parse(a.lastMessageAt || a.updatedAt || "1970-01-01"));
}
export function mergeMessage(current: ChatMessage[], incoming: ChatMessage) {
  const existing = current.find((message) => message.id === incoming.id);
  if (existing) {
    if (incoming.readAt && !existing.readAt) return current.map((message) => (message.id === incoming.id ? { ...message, readAt: incoming.readAt } : message));
    return current;
  }
  return [...current, incoming].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.id.localeCompare(b.id));
}
