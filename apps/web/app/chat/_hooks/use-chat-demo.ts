"use client";
import { useState } from "react";
import { mergeConversation, type ChatMessage as Message } from "@/lib/chat-state";
import { samples, sampleMessages } from "../_lib/chat-demo";

export function useChatDemo() {
  const [mode, setMode] = useState<"live" | "demo">("live");
  const [demoConversations, setDemoConversations] = useState(samples);
  const [demoMessages, setDemoMessages] = useState(sampleMessages);
  function startDemo() {
    setMode("demo");
    setDemoConversations(samples);
    setDemoMessages(sampleMessages);
    return samples[0].id;
  }
  function stopDemo() {
    setMode("live");
  }
  function sendDemoMessage(selected: string, text: string) {
    const data = { text };
    const message: Message = {
      id: crypto.randomUUID(),
      lineUserId: selected,
      direction: "botSent",
      body: data.text,
      createdAt: new Date().toISOString(),
    };
    setDemoMessages((current) => [...current, message]);
    setDemoConversations((current) => {
      const room = current.find((item) => item.id === selected)!;
      return mergeConversation(current, { ...room, lastMessage: { body: data.text }, lastMessageTime: message.createdAt });
    });
  }
  return { mode, demoConversations, demoMessages, startDemo, stopDemo, sendDemoMessage };
}
