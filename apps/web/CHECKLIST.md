# Web Checklist

รายการสำหรับตรวจหน้าเว็บ component และ hook ทำเครื่องหมายหลังตรวจด้วยตัวเอง

## Layout และ Sidebar

- [x] `app/layout.tsx` — layout ร่วมทุกหน้า
- [x] `app/globals.css` — style ร่วมและ responsive
- [ ] `components/workspace-sidebar.tsx`
  - [ ] ลิงก์หน้าแรก / Users / Chat และสถานะเมนูที่เปิด
  - [ ] ยอด unread รวมจาก Line User ทั้งหมด
  - [ ] อัปเดต unread จาก Socket โดยไม่เรียก API ซ้ำทุกข้อความ

## หน้าแรก

- [ ] `app/page.tsx`
  - [ ] ชื่อ Test Bot และ LINE ID @414plwuv
  - [ ] QR Code และลิงก์เพิ่มเพื่อน LINE
  - [ ] ลิงก์เปิดเว็บแชท /chat
  - [ ] ลิงก์ GitHub repository
  - [ ] ลิงก์ Resume
- [ ] `app/page.module.css` — layout และการแสดงผลบนมือถือ
- [ ] `public/test-bot-qr.png` — QR Code ถูกบัญชี

## หน้า Chat

- [ ] `app/chat/page.tsx` — ประกอบ component หน้าแชท
- [ ] `app/chat/_components/conversation-list.tsx`
  - [ ] แสดงรายชื่อ รูป ข้อความล่าสุด และเวลา
  - [ ] เรียงตาม lastMessageTime หรือเวลาสร้าง User ถ้ายังไม่มีข้อความ
  - [ ] ค้นหาชื่อ / ID / ข้อความล่าสุด
  - [ ] unread ราย User และยอดรวม
  - [ ] เลือกห้องแชท / รีเฟรช / สถานะการเชื่อมต่อ
- [x] `app/chat/_components/conversation-header.tsx` — ข้อมูล User ที่เลือก
- [ ] `app/chat/_components/message-thread.tsx`
  - [ ] แสดงข้อความเฉพาะห้องที่เปิด
  - [ ] ลำดับเวลาและฝั่ง received / botSent
  - [ ] เปิดห้องหรือรีเฟรชแล้วเห็นข้อความล่าสุดทันที ไม่มีจังหวะ scroll ลงมา
  - [ ] เลื่อนขึ้นอ่านประวัติและรับข้อความใหม่
  - [ ] สถานะกำลังโหลดประวัติ
- [ ] `app/chat/_components/message-composer.tsx`
  - [ ] ส่งข้อความ / Enter เพื่อส่ง / Shift+Enter ขึ้นบรรทัดใหม่
  - [ ] ข้อความว่าง / สูงสุด 5,000 ตัวอักษร / สถานะกำลังส่ง
  - [ ] ปิดพิมพ์และส่งเมื่อ User บล็อก OA
- [ ] `app/chat/_components/empty-conversation.tsx` — หน้าว่างและ error
- [ ] `app/chat/_hooks/use-chat.ts`
  - [ ] GET /api/conversations โหลดรายการแชท
  - [ ] GET /api/messages?lineUserId=:lineUserId โหลดประวัติทุกครั้งที่เปลี่ยนห้อง
  - [ ] ยกเลิก request เก่าเมื่อเปลี่ยนห้อง
  - [ ] POST /api/messages ส่งข้อความ
  - [ ] POST /api/conversations/:lineUserId/read ทำเครื่องหมายอ่านเฉพาะข้อความที่แสดงในแท็บที่มองเห็นและมีโฟกัส
  - [ ] message.update อัปเดตรายการแชทและ readReceipt
  - [ ] message.sent เพิ่มข้อความเฉพาะห้องที่เปิด ไม่ซ้ำตาม Message ID
  - [ ] workspace.updated / reconnect โหลดข้อมูลใหม่
  - [ ] การแสดง error และตรวจรูปแบบ response
- [ ] `app/chat/_lib/chat-demo.ts` — โหมดทดลองและกลับไปข้อมูลจริง

## หน้า Users

- [ ] `app/users/page.tsx`
  - [ ] GET /api/line-users แสดงผู้ใช้ทั้งหมด ไม่มี pagination
  - [ ] ค้นหา / กรองสถานะ / รีเฟรช
  - [ ] ผู้ใช้ที่บล็อก OA อยู่ท้ายรายการจาก API
  - [ ] อัปเดตแถวจาก message.update โดยไม่เรียก API ซ้ำ
  - [ ] workspace.updated / reconnect โหลดข้อมูลใหม่
  - [ ] สถานะกำลังโหลด / ไม่พบผู้ใช้ / error
- [ ] `app/users/_components/user-filters.tsx` — ช่องค้นหาและ dropdown สถานะ พื้นหลังทึบ
- [ ] `app/users/_components/user-table.tsx` — รูป ชื่อ LINE User ID สถานะ เวลา และลิงก์เปิดห้องแชทของ User
- [ ] `lib/line-user.ts` — type User และข้อความสถานะ

## Realtime และ State ร่วม

- [ ] `providers/realtime-provider.tsx` — connection เดียวครอบ layout และ cleanup เมื่อออกจากแอป
- [ ] `hooks/use-realtime.ts`
  - [ ] เชื่อมต่อ Socket กับ API origin
  - [ ] message.update
  - [ ] message.sent
  - [ ] workspace.updated
  - [ ] connect / disconnect / connect_error / reconnect
  - [ ] ยกเลิกเฉพาะ listener ของ component เมื่อเลิกใช้งาน โดยไม่ disconnect connection ที่แชร์
- [ ] `lib/chat-state.ts`
  - [ ] `mergeConversation()` — อัปเดตแถวและเรียงลำดับ ไม่ใช้ข้อมูลเก่าทับใหม่
  - [ ] `mergeMessage()` — รวมข้อความ ไม่ซ้ำ และรักษา readAt
  - [ ] `mergeUnread()` — แทนค่า unread รายคน ไม่บวกซ้ำ และไม่ใช้ข้อมูลเก่าทับใหม่
- [ ] `lib/utils.ts` — utility ร่วม

## UI และ Configuration

- [ ] `components/ui/` — shadcn Avatar / Badge / Button / Input / ScrollArea / Select / Separator / Table / Textarea
- [ ] `next.config.ts` — API proxy / allowedDevOrigins / deploymentId สำหรับ cache ของ asset
- [ ] Desktop และมือถือ — หน้าแรก / Users / Chat

## React Query

- [ ] `providers/query-provider.tsx` — cache กลางข้ามหน้า อายุ cache 30 นาที
- [ ] `lib/api-queries.ts` — query ของรายชื่อผู้ใช้ รายการแชท และข้อความแยกห้อง
- [ ] `lib/realtime-cache.ts` — Socket อัปเดต cache แม้หน้าที่เกี่ยวข้องไม่ได้เปิดอยู่
- [ ] เปลี่ยนหน้าไปกลับแล้วแสดงข้อมูล cache ทันที โดยไม่ล้างข้อมูลระหว่าง refetch
- [ ] เลือกห้องแชทแล้วโหลดประวัติใหม่เบื้องหลัง พร้อมแสดง cache ของห้องนั้นถ้ามี
- [ ] Sidebar และ Users ใช้ cache รายชื่อผู้ใช้ชุดเดียวกันเมื่อไม่มีตัวกรอง
- [ ] ไม่ใช้ response เก่าทับ unread/readAt ที่อัปเดตผ่าน Socket
