export type LineEvent = {
  webhookEventId: string;
  type: string;
  timestamp: number;
  source: { type: string; userId?: string };
  message?: { type: string; text?: string; id: string };
  unsend?: { messageId: string };
  follow?: { isUnblocked?: boolean };
};
