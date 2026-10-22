"use client";
import { useMemo } from "react";
import { useChat } from "@/app/chat/_hooks/use-chat";
import { ConversationList } from "@/app/chat/_components/conversation-list";
import { ConversationHeader } from "@/app/chat/_components/conversation-header";
import { MessageThread } from "@/app/chat/_components/message-thread";
import { MessageComposer } from "@/app/chat/_components/message-composer";
import { EmptyConversation } from "@/app/chat/_components/empty-conversation";
export function ChatWorkspace() {
  const chat = useChat();
  const messages = useMemo(() => chat.messages.filter((message) => message.lineUserId === chat.selected), [chat.messages, chat.selected]);
  return (
    <main className="chat-workspace">
      <header className="chat-topbar">
        <span>LINE Official Account</span>
        <span className="connection-label">
          <i />
          กล่องข้อความ
        </span>
      </header>
      <section className="inbox">
        <ConversationList
          conversations={chat.conversations}
          selected={chat.selected}
          query={chat.query}
          refreshing={chat.refreshing}
          connected={chat.connected}
          onQueryChange={chat.setQuery}
          onSelect={chat.selectConversation}
          onRefresh={() => void chat.refresh()}
        />
        <article className="chat-detail" aria-label="บทสนทนา">
          {chat.conversation ? (
            <>
              <ConversationHeader conversation={chat.conversation} />
              {chat.error && (
                <p className="error" role="alert">
                  {chat.error}
                </p>
              )}
              <MessageThread key={chat.selected} name={chat.conversation.name} messages={messages} loading={chat.loadingHistory} />
              <MessageComposer draft={chat.draft} busy={chat.busy} isBlocked={chat.isBlocked} onDraftChange={chat.setDraft} onSend={chat.send} />
            </>
          ) : (
            <EmptyConversation error={chat.error} />
          )}
        </article>
      </section>
    </main>
  );
}
