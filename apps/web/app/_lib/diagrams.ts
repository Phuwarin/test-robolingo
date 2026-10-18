export const diagrams = [
  {
    id: "models",
    title: "UML · Data models",
    description: "ความสัมพันธ์ของ Sequelize model ใช้ UUID ภายในเป็น Primary Key และ Foreign Key ส่วน ID จาก LINE เก็บแยกไว้",
    source: `classDiagram
      class LineUser {
        +string id
        +string lineUserId
        +string name
        +string friendStatus
        +Date friendStatusAt
        +string lastMessageId
        +Date lastMessageTime
        +int unreadCount
        +Date createdAt
        +Date updatedAt
      }
      class Message {
        +string id
        +string lineMessageId
        +string lineUserId
        +string direction
        +string body
        +Date readAt
        +Date createdAt
        +Date updatedAt
      }
      LineUser "1" --> "0..*" Message : messages / lineUserId
      LineUser "0..*" --> "0..1" Message : lastMessage / lastMessageId`,
  },
  {
    id: "receive",
    title: "Sequence · รับข้อความ",
    description: "LINE ส่ง webhook เข้ามา ตรวจ signature ก่อนประมวลผล แล้วส่ง Socket หลัง transaction สำเร็จ ข้อความซ้ำไม่เพิ่ม unread และไม่ส่ง event ข้อความซ้ำ",
    source: `sequenceDiagram
      autonumber
      participant LINE as LINE Platform
      participant C as WebhookController
      participant S as WebhookService
      participant DB as PostgreSQL
      participant G as RealtimeGateway
      participant Q as React Query cache
      participant UI as Web UI
      LINE->>C: POST /api/webhook
      C->>C: Verify raw-body signature
      C->>S: processEvents / handleMessage
      S->>LINE: GET profile
      LINE-->>S: User profile (or failure)
      S->>DB: Transaction: find User and lock row
      S->>DB: findOrCreate Message by lineMessageId
      alt New message
        S->>DB: Update lastMessageId / lastMessageTime / unreadCount
        DB-->>S: Commit
        S->>G: publishMessage(user, message, latest)
        G-->>Q: message.update
        G-->>Q: message.sent
        Q-->>UI: Update list, unread and loaded history
      else Duplicate message
        DB-->>S: Commit without new message
        Note over S,G: No message events emitted
      end
      C-->>LINE: HTTP 200`,
  },
  {
    id: "send",
    title: "Sequence · ส่งข้อความ",
    description: "ส่งให้ LINE ก่อน แล้วค่อยบันทึก DB ทั้งขารับและขาส่งใช้ publishMessage() เพื่ออัปเดตรายการแชทและห้องที่เคยโหลดไว้",
    source: `sequenceDiagram
      autonumber
      participant UI as Web UI
      participant C as MessagesController
      participant S as MessagesService
      participant DB as PostgreSQL
      participant LINE as LINE Push API
      participant G as RealtimeGateway
      participant Q as React Query cache
      UI->>C: POST /api/messages {to, text}
      C->>C: Validate origin and payload
      C->>S: sendMessage
      S->>DB: Find recipient by internal UUID
      alt User blocked OA
        S-->>UI: HTTP 403
      else Recipient allowed
        S->>S: Capture sentAt
        S->>LINE: Push using recipient.lineUserId
        LINE-->>S: sentMessages.id
        S->>DB: Transaction: create botSent Message
        S->>DB: Lock User and update latest message
        DB-->>S: Commit
        S->>G: publishMessage(user, message, latest)
        G-->>Q: message.update then message.sent
        Q-->>UI: Update cached list and room
        C-->>UI: HTTP 200 {ok: true}
      end`,
  },
  {
    id: "read",
    title: "Sequence · อ่าน / unread",
    description: "อ่านเฉพาะ ID ข้อความที่แสดงในห้อง เมื่อแท็บมองเห็นและมีโฟกัส แล้วส่ง readReceipt ให้ทุกแท็บอัปเดต cache ตรงกัน",
    source: `sequenceDiagram
      autonumber
      participant UI as Focused chat tab
      participant C as ConversationsController
      participant S as ConversationsService
      participant DB as PostgreSQL
      participant G as RealtimeGateway
      participant Q as All connected tabs
      UI->>C: POST /api/conversations/:id/read {messageIds}
      C->>C: Validate 1-1000 IDs
      C->>S: markRead(userId, messageIds)
      S->>DB: Transaction: lock User
      S->>DB: Set readAt for matching unread received messages
      S->>DB: Count remaining unread and update User
      DB-->>S: Commit
      alt Read state changed
        S->>G: publishConversation(user, latest, receipt)
        G-->>Q: message.update + readReceipt
        Q->>Q: Update list, sidebar unread and message readAt
      end
      C-->>UI: unreadCount, updatedAt, messageIds, readAt`,
  },
];
