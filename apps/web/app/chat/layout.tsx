import type { ReactNode } from "react";
import { ChatWorkspace } from "./_components/chat-workspace";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ChatWorkspace />
      {children}
    </>
  );
}
