# API Checklist

รายการสำหรับเช็คโค้ดแยกตาม module, controller และ service โดยทำเครื่องหมายตามที่ตรวจแล้ว

## App

- [x] `app.module.ts` — `AppModule`

## Webhook

- [x] `webhook.module.ts` — `WebhookModule`

- Controller: `webhook.controller.ts` — `WebhookController`
  - [x] `receive()` — POST /api/webhook
    - [x] follow
    - [x] unfollow
    - [x] message
- Service: `webhook.service.ts` — `WebhookService`
  - [x] `processEvents()`
  - [x] `handleFollow()`
  - [x] `handleUnfollow()`
  - [x] `handleMessage()`

## Messages

- [x] `messages.module.ts` — `MessagesModule`

- Controller: `messages.controller.ts` — `MessagesController`
  - [x] `list()` — GET /api/messages?lineUserId=:lineUserId
  - [x] `send()` — POST /api/messages
- Service: `messages.service.ts` — `MessagesService`
  - [x] `listMessages()`
  - [x] `sendMessage()`

## Conversations

- [x] `conversations.module.ts` — `ConversationsModule`

- Controller: `conversations.controller.ts` — `ConversationsController`
  - [x] `list()` — GET /api/conversations
  - [x] `markRead()` — POST /api/conversations/:lineUserId/read
- Service: `conversations.service.ts` — `ConversationsService`
  - [x] `listConversations()`
  - [x] `markRead()`

## Line Users

- [x] `line-users.module.ts` — `LineUsersModule`

- Controller: `line-users.controller.ts` — `LineUsersController`
  - [x] `list()` — GET /api/line-users
- Service: `line-users.service.ts` — `LineUsersService`
  - [x] `list()`

## Realtime

- [x] `realtime.module.ts` — `RealtimeModule`

- Gateway: `realtime.gateway.ts` — `RealtimeGateway` (ไม่มี controller หรือ service แยก)
  - [x] `allowedSocketOrigin()`
  - [x] `publishConversation()` — message.update
  - [x] `publishMessage()` — message.update แล้ว message.sent
  - [x] `publishUserUpdated()` — workspace.updated

## Unread

- [x] `LineUser.unreadCount`
- [x] `Message.readAt`
- [x] `message.update` — อัปเดต unread และ readReceipt
