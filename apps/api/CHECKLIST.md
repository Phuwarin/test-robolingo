# API Checklist

รายการสำหรับเช็คโค้ดแยกตาม module, controller และ service โดยทำเครื่องหมายตามที่ตรวจแล้ว

## App

- [ ] `app.module.ts` — `AppModule`

## Webhook

- [ ] `webhook.module.ts` — `WebhookModule`
- Controller: `webhook.controller.ts` — `WebhookController`
  - [ ] `receive()` — POST /api/webhook
    - [ ] follow
    - [ ] unfollow
    - [ ] message
- Service: `webhook.service.ts` — `WebhookService`
  - [ ] `processEvents()`
  - [ ] `handleFollow()`
  - [ ] `handleUnfollow()`
  - [ ] `handleMessage()`

## Messages

- [ ] `messages.module.ts` — `MessagesModule`
- Controller: `messages.controller.ts` — `MessagesController`
  - [ ] `list()` — GET /api/messages?lineUserId=:lineUserId
  - [ ] `send()` — POST /api/messages
- Service: `messages.service.ts` — `MessagesService`
  - [ ] `listMessages()`
  - [ ] `sendMessage()`

## Conversations

- [ ] `conversations.module.ts` — `ConversationsModule`
- Controller: `conversations.controller.ts` — `ConversationsController`
  - [ ] `list()` — GET /api/conversations
  - [ ] `unreadCount()` — GET /api/conversations/unread-count
  - [ ] `markRead()` — POST /api/conversations/:lineUserId/read
- Service: `conversations.service.ts` — `ConversationsService`
  - [ ] `listConversations()`
  - [ ] `getUnreadCount()`
  - [ ] `markRead()`

## Line Users

- [ ] `line-users.module.ts` — `LineUsersModule`
- Controller: `line-users.controller.ts` — `LineUsersController`
  - [ ] `list()` — GET /api/line-users
- Service: `line-users.service.ts` — `LineUsersService`
  - [ ] `list()`

## Realtime

- [ ] `realtime.module.ts` — `RealtimeModule`
- Gateway: `realtime.gateway.ts` — `RealtimeGateway` (ไม่มี controller หรือ service แยก)
  - [ ] `allowedSocketOrigin()`
  - [ ] `publishConversation()` — message.update
  - [ ] `publishMessage()` — message.update แล้ว message.sent
  - [ ] `publishUserUpdated()` — workspace.updated

## Unread

- [ ] `LineUser.unreadCount`
- [ ] `Message.readAt`
- [ ] `message.update` — อัปเดต unread และ readReceipt
