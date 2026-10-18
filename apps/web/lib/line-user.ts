export type User = {
  id: string;
  lineUserId: string;
  name: string;
  pictureUrl: string | null;
  friendStatus: string;
  friendStatusAt: string | null;
  createdAt: string;
  lastMessageId: string | null;
  unreadCount: number;
  updatedAt: string;
};

export const statusLabels: Record<string, string> = {
  follow: "เพิ่มเพื่อนแล้ว",
  unfollow: "บล็อก OA",
  unknown: "ไม่ทราบสถานะ",
};
