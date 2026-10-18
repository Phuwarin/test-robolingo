# API Checklist

- Webhook

  - [x] POST /api/webhook
    - [x] follow
    - [x] unfollow
    - [x] message

- Messages

  - [ ] POST /api/messages

- Conversations

  - [ ] GET /api/conversations

- Line Users

  - [ ] GET /api/line-users

- Realtime (Socket.IO)
  - [ ] workspace.updated � message / user

- Unread
  - [ ] GET /api/conversations/unread-count
  - [ ] POST /api/conversations/:lineUserId/read
  - [ ] unreadCount / readAt / conversation.updated
