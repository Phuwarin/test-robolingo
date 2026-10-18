# API Checklist

- Webhook

  - [x] POST /api/webhook
    - [x] follow
    - [x] unfollow
    - [x] message

- Messages

  - [ ] POST /api/messages
  - [ ] GET /api/messages?lineUserId=:lineUserId

- Conversations

  - [x] GET /api/conversations

- Line Users

  - [ ] GET /api/line-users

- Realtime (Socket.IO)
  - [ ] workspace.updated � message / user

- Unread
  - [ ] GET /api/conversations/unread-count
  - [ ] POST /api/conversations/:lineUserId/read
  - [ ] unreadCount / readAt / message.update
