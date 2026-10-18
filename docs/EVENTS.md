# Event ของระบบ LINE OA

เอกสารนี้อธิบายพฤติกรรมของโค้ดปัจจุบัน แบ่งเป็น webhook ที่ LINE ส่งเข้า API และ Socket ที่ API ส่งให้เว็บ

## 1. LINE webhook

LINE เรียก `POST /api/webhook` โดย controller ตรวจ signature ก่อนส่งให้ `WebhookService.processEvents()` ระบบประมวลผลเฉพาะ source ประเภท `user`

| Event      | Handler            | สิ่งที่บันทึก                                                                             | Socket หลัง transaction สำเร็จ       |
| ---------- | ------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------ |
| `follow`   | `handleFollow()`   | ค้นหา/สร้าง User ดึงชื่อและรูป ตั้ง `friendStatus = follow` และ `friendStatusAt`          | `workspace.updated`                  |
| `unfollow` | `handleUnfollow()` | ค้นหา/สร้าง User ตั้ง `friendStatus = unfollow` และ `friendStatusAt` โดยเก็บข้อมูลเดิมไว้ | `workspace.updated`                  |
| `message`  | `handleMessage()`  | เก็บข้อความ `received` อัปเดต `lastMessageId` และเพิ่ม `unreadCount` เฉพาะข้อความใหม่     | `message.update` แล้ว `message.sent` |

- User และ Message มี UUID ภายใน ส่วน ID จาก LINE เก็บใน `LineUser.lineUserId` และ `Message.lineMessageId`
- ข้อความ webhook ซ้ำตรวจด้วย `lineMessageId` จึงไม่สร้างข้อความ เพิ่ม unread หรือส่ง Socket ข้อความซ้ำ
- ข้อความที่ไม่ใช่ text เก็บเป็นชื่อประเภท เช่น `[image]` หรือ `[sticker]`
- `handleMessage()` ยังมี `findOrCreate` พร้อม comment ว่าคาดว่าจะมี User จาก `follow` แล้ว เพราะเริ่มระบบพร้อมกัน
- ไม่มี handler `unsend` ในระบบนี้

## 2. Socket จาก API ไปเว็บ

Socket.IO ใช้ WebSocket ที่พอร์ตเดียวกับ API ผ่าน `/socket.io/` ส่ง event ไปยังทุก connection ที่ผ่านการตรวจ origin ปัจจุบันไม่ได้แยก room ตาม User

| Event               | ฟังก์ชันที่ส่ง          | หน้าที่                                                              |
| ------------------- | ----------------------- | -------------------------------------------------------------------- |
| `message.update`    | `publishConversation()` | ส่งข้อมูลแถวแชทล่าสุดและ unread ของ User คนนั้น                      |
| `message.sent`      | `publishMessage()`      | ส่งข้อความใหม่ ทั้งขาเข้า `received` และขาออก `botSent`              |
| `workspace.updated` | `publishUserUpdated()`  | แจ้งว่าข้อมูล User เปลี่ยนหลัง follow/unfollow ให้เว็บโหลดข้อมูลใหม่ |

`publishMessage()` เรียก `publishConversation()` ก่อน จึงส่งสอง event ตามลำดับ ไม่ใช่ส่งเฉพาะ `message.sent`

### `message.update`

โครงสร้าง payload:

```ts
{
  lineUserId, // UUID ภายในของ User
  conversation: {
    id,
    name,
    pictureUrl,
    friendStatus,
    lastMessageId,
    lastMessageTime,
    unreadCount, // ยอดของ User คนนี้ ไม่ใช่ยอดรวมทุกคน
    lastMessage: { body }, // null ถ้ายังไม่มีข้อความ
    createdAt,
    updatedAt,
  },
  readReceipt: { messageIds, readAt }, // มีเฉพาะตอนอัปเดตการอ่าน
}
```

| จุดรับบนเว็บ | พฤติกรรมปัจจุบัน                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| หน้าแชท      | ใช้ `conversation` อัปเดตแถวนั้นโดยตรง เรียงตามเวลาข้อความล่าสุด และใช้ `readReceipt` อัปเดตสถานะอ่าน |
| หน้า Users   | อัปเดตแถว User ที่อยู่ในรายการปัจจุบันจาก `conversation` โดยไม่เรียก API ซ้ำ                          |
| Sidebar      | แทนค่า unread ของ User คนนั้นใน state แล้วรวมยอดใหม่ โดยไม่เรียก API ซ้ำ                              |

ทั้งหน้าแชท Users และ sidebar ใช้ payload โดยตรง สำหรับ Users จะคงสมาชิกของรายการปัจจุบันไว้ การค้นหา เปลี่ยนตัวกรอง รีเฟรช และ reconnect จึงโหลดรายการจาก API ใหม่ ส่วน sidebar โหลด Line User ทั้งหมดซึ่งมี `id`, `unreadCount`, `updatedAt` จาก `GET /api/line-users` โดยไม่ส่งตัวกรอง ตอนเริ่ม/reconnect แล้วแทนยอดรายคนจาก Socket ไม่บวกสะสม จึงไม่เพิ่มซ้ำเมื่อรับ event เดิม

### `message.sent`

```ts
{
  lineUserId, // UUID ภายในของ User
  message: {
    id, // UUID ภายในของ Message
    lineUserId, // UUID ภายในของ User
    direction, // received หรือ botSent
    body,
    createdAt,
    readAt,
  },
}
```

หน้าแชทเพิ่มข้อความเข้า state โดยไม่เรียก API ซ้ำ ตรวจ ID เพื่อไม่เพิ่มซ้ำ และแสดงข้อความเฉพาะห้องที่เลือกอยู่ หน้า Users กับ sidebar ไม่ใช้ event นี้

### `workspace.updated`

```ts
{
  lineUserId, // ปัจจุบัน follow/unfollow ส่ง LINE User ID มาในช่องนี้
  reason: "user",
}
```

หน้าแชทโหลด `GET /api/conversations` ใหม่ หน้า Users โหลด `GET /api/line-users` ใหม่ และ sidebar โหลดยอด unread รวมใหม่ ฝั่งเว็บปัจจุบันใช้ event นี้เป็นสัญญาณ refresh ไม่ได้ใช้ ID ใน payload เลือกแถว

ข้อสังเกต: `lineUserId` ใน `workspace.updated` ปัจจุบันเป็น ID จาก LINE แต่ช่องชื่อเดียวกันใน `message.update` และ `message.sent` เป็น UUID ภายใน

## 3. Flow รับ ส่ง และอ่านข้อความ

| การกระทำ         | ลำดับ                                                                                                                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ผู้ใช้ส่งเข้า OA | webhook `message` → บันทึก DB และเพิ่ม unread → commit → `message.update` → `message.sent`                                                                                                                                                       |
| ส่งจากเว็บ       | `POST /api/messages` ด้วย `{ to, text }` โดย `to` เป็น UUID ภายใน → ค้นหาผู้รับ → ส่งไป LINE ด้วย LINE User ID → บันทึก DB และ last message → commit → `message.update` → `message.sent`                                                         |
| อ่านบนเว็บ       | ห้องที่เลือกอยู่บนแท็บที่มองเห็นและมีโฟกัส → `POST /api/conversations/:lineUserId/read` พร้อม Message UUID ที่แสดง → บันทึก `readAt` และคำนวณ unread ที่เหลือ → commit → `message.update` พร้อม `readReceipt` หากมีข้อความถูกเปลี่ยนเป็นอ่านแล้ว |

- ข้อความส่งออกไม่เพิ่ม unread และส่งไม่ได้ถ้า User มีสถานะ `unfollow`
- เรียงแชทจากเวลาข้อความล่าสุดทั้งขาเข้าและขาออก ใหม่สุดอยู่บนสุด ถ้ายังไม่มีข้อความจะใช้เวลาสร้าง User (`createdAt`) แทน จึงแสดงผู้ใช้ที่เพิ่งเพิ่มเข้ามาตามเวลานั้น การอ่านหรือเปลี่ยนสถานะเพื่อนไม่ทำให้แชทขึ้นบน
- unread เป็นสถานะร่วมของเว็บทุกผู้ดูแล ไม่ใช่สถานะอ่านบนแอป LINE
- Socket ส่งหลัง transaction สำเร็จ หาก transaction ล้มเหลวจะไม่ส่ง event จากขั้นตอนนั้น

## 4. สถานะการเชื่อมต่อ

| Event ของ Socket.IO               | เว็บทำอะไร                                                          |
| --------------------------------- | ------------------------------------------------------------------- |
| `connect` รวมถึง reconnect สำเร็จ | ตั้งสถานะเชื่อมต่อ แล้วโหลดข้อมูลจาก API เพื่อรับข้อมูลที่อาจพลาดไป |
| `disconnect`                      | ตั้งสถานะไม่ได้เชื่อมต่อ                                            |
| `connect_error`                   | ตั้งสถานะไม่ได้เชื่อมต่อ                                            |

การเรียก refresh จาก Socket รวม event ที่เข้ามาใกล้กันด้วยเวลา 75 ms ไม่มี polling ทุก 4 วินาที และไม่ reload ทั้งหน้า ไม่มี popup หรือเสียงแจ้งเตือน

## 5. API รายการแชทและประวัติข้อความ

- `GET /api/conversations` คืน `{ conversations }` เป็น User พร้อม `lastMessage` จาก JOIN เรียงตามเวลาข้อความล่าสุดด้วย ORDER BY ใน DB ไม่โหลดประวัติข้อความทุกคน
- `GET /api/messages?lineUserId=<User UUID>` คืน array ข้อความเฉพาะห้องที่เปิด เรียง `createdAt ASC, id ASC` โดย `Message.lineUserId` อ้างถึง UUID ภายใน
- เว็บโหลดประวัติเมื่อเลือกห้อง และโหลดใหม่เมื่อ refresh หรือ reconnect ส่วน `message.sent` เพิ่มข้อความเฉพาะห้องที่เปิดจาก payload ได้ทันที
- เวลาสลับห้อง เว็บยกเลิก request ประวัติของห้องก่อนหน้าเพื่อไม่ให้ผลลัพธ์เก่ารบกวนห้องใหม่

หน้า Users และ `GET /api/line-users` ไม่มี pagination คืนผู้ใช้ทั้งหมดที่ตรงกับคำค้นหาและสถานะ ไม่มี `page` หรือ `limit`

## 6. Connection ร่วมบนเว็บ

`providers/realtime-provider.tsx` ครอบที่ `app/layout.tsx` และสร้าง Socket connection เดียวต่อแท็บ Sidebar, Chat และ Users เรียก `useRealtime()` เพื่อสมัครรับ event จาก connection นี้ เมื่อเปลี่ยนหน้า hook ยกเลิกเฉพาะ listener ของตัวเอง ไม่ตัด connection ร่วม Provider จัดการ connect/disconnect และสถานะการเชื่อมต่อ โดย reconnect สำเร็จจะเรียก refresh ของผู้ใช้งานแต่ละจุด

## 7. Cache ข้ามหน้าด้วย React Query

`providers/query-provider.tsx` ครอบ RealtimeProvider ใน layout และเก็บ QueryClient เดียวต่อแท็บ ข้อมูล API อยู่ใน cache แทน state ของแต่ละหน้า จึงกลับมาหน้าเดิมแล้วแสดงข้อมูลได้ทันที ไม่ล้างตารางหรือประวัติระหว่างโหลดใหม่เบื้องหลัง Cache ที่ไม่ได้ใช้งานเก็บไว้ 30 นาที ไม่ persist หลังปิดแท็บหรือ reload ทั้งหน้า

- รายชื่อผู้ใช้: `["line-users", query, status]` Sidebar ใช้ query ที่ไม่มีตัวกรองร่วมกับหน้า Users
- รายการแชท: `["conversations"]`
- ประวัติข้อความ: `["messages", lineUserId]` เปลี่ยนห้องแล้วยังโหลด API ใหม่ แต่แสดง cache ของห้องนั้นทันทีหากเคยโหลด
- `message.update` และ `message.sent` อัปเดต cache ใน RealtimeProvider โดยตรง แม้หน้าที่เกี่ยวข้องถูก unmount ไปแล้ว ไม่เรียก API ซ้ำทุกข้อความ
- `workspace.updated` และ Socket connect/reconnect ทำให้ query โหลดข้อมูลใหม่เบื้องหลัง ข้อมูลเดิมยังแสดงอยู่
- การอ่านและการส่งใช้ mutation ส่วน draft คำค้นหา และโหมด demo ยังเป็น state ในหน้า ไม่ใช้ Zustand
