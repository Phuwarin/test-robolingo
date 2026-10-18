# API Checklist

รายการสำหรับเช็คโค้ดแยกตาม module, controller และ service โดยทำเครื่องหมายตามที่ตรวจแล้ว

## App

- [X] `app.module.ts` — `AppModule`

## Webhook

- [X] `webhook.module.ts` — `WebhookModule`

- Controller: `webhook.controller.ts` — `WebhookController`
  - [X] `receive()` — POST /api/webhook
    - [X] follow
    - [X] unfollow
    - [X] message
- Service: `webhook.service.ts` — `WebhookService`
  - [X] `processEvents()`
  - [X] `handleFollow()`
  - [X] `handleUnfollow()`
  - [X] `handleMessage()`

## Messages

- [X] `messages.module.ts` — `MessagesModule`

- Controller: `messages.controller.ts` — `MessagesController`
  - [X] `list()` — GET /api/messages?lineUserId=:lineUserId
  - [X] `send()` — POST /api/messages
- Service: `messages.service.ts` — `MessagesService`
  - [X] `listMessages()`
  - [X] `sendMessage()`

## Conversations

- [X] `conversations.module.ts` — `ConversationsModule`

- Controller: `conversations.controller.ts` — `ConversationsController`
  - [X] `list()` — GET /api/conversations
  - [X] `markRead()` — POST /api/conversations/:lineUserId/read
- Service: `conversations.service.ts` — `ConversationsService`
  - [X] `listConversations()`
  - [X] `markRead()`

## Line Users

- [X] `line-users.module.ts` — `LineUsersModule`

- Controller: `line-users.controller.ts` — `LineUsersController`
  - [X] `list()` — GET /api/line-users
- Service: `line-users.service.ts` — `LineUsersService`
  - [X] `list()`

## Realtime

- [X] `realtime.module.ts` — `RealtimeModule`

- Gateway: `realtime.gateway.ts` — `RealtimeGateway` (ไม่มี controller หรือ service แยก)
  - [X] `allowedSocketOrigin()`
  - [X] `publishConversation()` — message.update
  - [X] `publishMessage()` — message.update แล้ว message.sent
  - [X] `publishUserUpdated()` — workspace.updated

## Unread

- [X] `LineUser.unreadCount`
- [X] `Message.readAt`
- [X] `message.update` — อัปเดต unread และ readReceipt
