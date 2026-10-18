import { queryOptions } from "@tanstack/react-query";
import { mergeConversation, mergeMessage, type Conversation, type ChatMessage } from "@/lib/chat-state";
import type { User } from "@/lib/line-user";
export const conversationKey = ["conversations"] as const;
export const messageKey = (lineUserId: string) => ["messages", lineUserId] as const;
export const userKey = (query = "", status = "") => ["line-users", query, status] as const;
export type UsersData = {
  users: User[];
  total: number;
};
export async function fetchJson(url: string, options?: RequestInit) {
  const response = await fetch(url, { cache: "no-store", ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "โหลดข้อมูลไม่สำเร็จ");
  return data;
}
export function conversationsQuery() {
  return queryOptions({
    queryKey: conversationKey,
    queryFn: async ({ signal }) => {
      const data = await fetchJson("/api/conversations", { signal });
      if (!Array.isArray(data.conversations)) throw new Error("รูปแบบข้อมูลรายการแชทไม่ถูกต้อง");
      return data.conversations as Conversation[];
    },
    refetchOnMount: "always",
    structuralSharing: (previous, incoming) => {
      return (incoming as Conversation[]).reduce(mergeConversation, (previous as Conversation[] | undefined) || []);
    },
  });
}
export function messagesQuery(lineUserId: string) {
  return queryOptions({
    queryKey: messageKey(lineUserId),
    queryFn: async ({ signal }) => {
      const data = await fetchJson(`/api/messages?lineUserId=${encodeURIComponent(lineUserId)}`, { signal });
      if (!Array.isArray(data)) throw new Error("รูปแบบข้อมูลข้อความไม่ถูกต้อง");
      return data as ChatMessage[];
    },
    staleTime: 0,
    structuralSharing: (previous, incoming) => {
      return (incoming as ChatMessage[]).reduce(mergeMessage, (previous as ChatMessage[] | undefined) || []);
    },
    enabled: !!lineUserId,
    refetchOnMount: "always",
  });
}
export function usersQuery(query = "", status = "") {
  return queryOptions({
    queryKey: userKey(query, status),
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({ q: query, status });
      const data = await fetchJson(`/api/line-users?${params}`, { signal });
      if (!Array.isArray(data.users)) throw new Error("รูปแบบข้อมูลผู้ใช้ไม่ถูกต้อง");
      return data as UsersData;
    },
    structuralSharing: (previous, incoming) => {
      const data = incoming as UsersData;
      const existing = new Map(((previous as UsersData | undefined)?.users || []).map((user) => [user.id, user]));
      return {
        ...data,
        users: data.users.map((user) => {
          const cached = existing.get(user.id);
          return cached && Date.parse(cached.updatedAt) > Date.parse(user.updatedAt) ? cached : user;
        }),
      };
    },
  });
}
