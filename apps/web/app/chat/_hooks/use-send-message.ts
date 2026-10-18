"use client";
import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationKey, messageKey, fetchJson } from "@/lib/api-queries";

type Options = {
  mode: "live" | "demo";
  selected: string;
  connected: boolean;
  isBlocked: boolean;
  setError: (error: string) => void;
  sendDemoMessage: (selected: string, text: string) => void;
};
export function useSendMessage({ mode, selected, connected, isBlocked, setError, sendDemoMessage }: Options) {
  const client = useQueryClient();
  const [draft, setDraft] = useState("");
  const sendMutation = useMutation({
    mutationFn: (data: { to: string; text: string }) => {
      return fetchJson("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    },
  });

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim() || !selected || sendMutation.isPending || isBlocked) return;
    setError("");
    const data = { to: selected, text: draft.trim() };
    try {
      if (mode === "demo") {
        sendDemoMessage(selected, data.text);
      } else {
        await sendMutation.mutateAsync(data);
        if (!connected) {
          await Promise.all([client.invalidateQueries({ queryKey: conversationKey }), client.invalidateQueries({ queryKey: messageKey(data.to) })]);
        }
      }
      setDraft("");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "ส่งไม่ได้");
    }
  }

  return { draft, setDraft, send, busy: sendMutation.isPending };
}
