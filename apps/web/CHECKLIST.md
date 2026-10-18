# Web Checklist

ไล่ตรวจทีละไฟล์ตามลำดับด้านล่าง ทำเครื่องหมายหลังตรวจด้วยตัวเอง

- **[UI]** หน้าตาและการประกอบหน้าจอ
- **[Logic]** state, API, cache, event และเงื่อนไขการทำงาน
- **[Config/Data]** การตั้งค่า type หรือข้อมูลประกอบ
- ไฟล์ที่มีทั้ง UI และ Logic ระบุแยกในรายการย่อย

## 1. `app/layout.tsx` — [UI] โครงหน้าร่วม

- [x] layout ร่วมทุกหน้า
- [x] ครอบ QueryProvider → RealtimeProvider → Sidebar และหน้าที่เปิด

## 2. `providers/query-provider.tsx` — [Logic] Cache กลาง

- [x] QueryClient เดียวตลอดการเปลี่ยนหน้าในแท็บ
- [x] staleTime 30 วินาที / gcTime 30 นาที
- [x] เปลี่ยนหน้าแล้วใช้ cache แสดงระหว่าง refetch โดยไม่ล้างข้อมูล

## 3. `providers/realtime-provider.tsx` — [Logic] Socket กลาง

- [x] สร้าง connection เดียวและ cleanup ตอนออกจากแอป
- [x] message.update → updateConversationCache
- [x] message.sent → updateMessageCache
- [x] workspace.updated / connect รวมถึง reconnect → refreshWorkspace
- [x] disconnect / connect_error → สถานะ disconnected
- [x] อัปเดต socket / connected ใน Zustand และรีเซ็ตเมื่อ cleanup

### `stores/realtime-store.ts` — [Logic] State ร่วมด้วย Zustand

- [x] เก็บ socket / connected / readingRoomId และ action setReadingRoomId
- [x] Chat ติดตาม connected; Sidebar ติดตาม readingRoomId ผ่าน selector แยกกัน
- [x] ไม่เก็บข้อความและผู้ใช้ใน store ข้อมูลเหล่านี้อยู่ใน TanStack Query
- [x] readingRoomId แชร์ห้องที่กำลังอ่านให้ sidebar โดยไม่เปลี่ยน unread จริงใน cache

## 4. `components/layout/workspace-sidebar.tsx` — [UI + Logic] เมนู

- [x] [UI] ไอคอนหน้าแรก / Users / Chat และเมนูที่เลือก
- [x] [Logic] ใช้ usersQuery ชุดเดียวกับ Users เมื่อไม่มีตัวกรอง
- [x] [Logic] รวม unread ทุก User ยกเว้นห้องที่กำลังอ่านและมีโฟกัส
- [x] [Logic] อัปเดตจาก cache โดยไม่เรียก API ซ้ำทุกข้อความ

## 5. `app/chat/page.tsx` — [UI] ประกอบหน้าแชท

- [ ] เชื่อม props จาก useChat ไปแต่ละ component
- [ ] ยังไม่เลือกห้อง → EmptyConversation
- [ ] เลือกห้อง → Header / MessageThread / Composer
- [ ] แสดง error โดยไม่ถอดห้องแชทออก

## 6. `app/chat/_hooks/use-chat.ts` — [Logic] ควบคุมแชท

ไฟล์นี้ประกอบ hook ย่อยด้านล่าง รายการเกี่ยวกับการส่ง อ่าน และ demo ให้ไล่ตรวจใน hook เจ้าของงาน

### `app/chat/_hooks/use-send-message.ts` — [Logic] ส่งข้อความ

- [ ] จัดการ draft / busy / validation ก่อนส่ง
- [ ] ส่ง API หรือส่งเข้า demo ตาม mode
- [ ] ส่งสำเร็จล้าง draft; Socket หลุดให้ refetch; ส่งไม่สำเร็จแสดง error

### `app/chat/_hooks/use-mark-read.ts` — [Logic] อ่านแล้ว

- [ ] ติดตาม focus / visibility และ cleanup listener
- [ ] markRead ข้อความ received ที่ยังไม่อ่าน ครั้งละไม่เกิน 1,000 และกัน request ซ้ำ
- [ ] อัปเดต cache จาก response และแชร์ readingRoomId ผ่าน Zustand
- [ ] คืน readingRoomId เป็นค่าว่างเมื่อออกจากหน้า เสียโฟกัส หรือเกิด error

### `app/chat/_hooks/use-chat-demo.ts` — [Logic] โหมดทดลอง

- [ ] startDemo รีเซ็ตข้อมูลและคืน ID ห้องแรก; stopDemo กลับ live
- [ ] sendDemoMessage เพิ่มข้อความและอัปเดตข้อความล่าสุดโดยไม่เรียก API

### ตรวจ flow ร่วมของ hook ทั้งสี่

- [ ] เริ่มต้นไม่เลือกห้องเอง ยกเว้นมี ?user= ที่ตรงกับรายการ
- [ ] เลือกห้อง → โหลดประวัติใหม่และแสดง cache ถ้ามี
- [ ] เปลี่ยนห้อง → ล้าง draft/error และยกเลิก request ที่ไม่ใช้แล้วผ่าน query signal
- [ ] ส่งข้อความ → POST /api/messages ด้วย to และ text
- [ ] ส่งสำเร็จ → ล้าง draft; ถ้า Socket หลุดให้ refetch สำรอง
- [ ] ป้องกันข้อความว่าง ส่งซ้ำระหว่างรอ และส่งให้ User ที่บล็อก OA
- [ ] markRead เฉพาะข้อความ received ที่ยังไม่อ่าน ในห้องที่เปิดและแท็บมีโฟกัส
- [ ] ส่ง Message ID ครั้งละไม่เกิน 1,000 และกัน request ซ้ำด้วย readInFlight
- [ ] response markRead → อัปเดต unread/readAt ใน cache
- [ ] ห้องที่กำลังอ่านไม่แสดง unread ชั่วคราว ป้องกัน badge แว๊บ 0 → 1 → 0
- [ ] เสียโฟกัส / ออกจากหน้า / โหลดประวัติผิดพลาด / markRead ผิดพลาด → กลับมาแสดง unread จริง
- [ ] สลับ demo / ข้อมูลจริง และ refresh

## 7. `app/chat/_components/conversation-list.tsx` — [UI + Logic] รายการแชท

- [ ] [UI] รูป ชื่อ preview เวลา และ badge unread
- [ ] [UI] เวลาอยู่ตำแหน่งเดิมเมื่อ badge ขึ้นหรือหาย
- [ ] [Logic] ค้นหาชื่อ / ID ภายใน / ข้อความล่าสุดจากรายการที่โหลด
- [ ] [Logic] แสดงยอด unread รวมจาก conversations ที่รับมา
- [ ] [UI] ปุ่มเลือกห้อง / รีเฟรช / Users / demo และสถานะ Socket
- [ ] [UI] ไม่พบผลค้นหา / ยังไม่มีบทสนทนา

## 8. `app/chat/_components/conversation-header.tsx` — [UI] หัวห้อง

- [x] ข้อมูล User ที่เลือก

## 9. `app/chat/_components/message-thread.tsx` — [UI] ข้อความ

- [ ] แสดงข้อความเฉพาะห้องที่เลือก ใช้ Message ID เป็น key
- [ ] ฝั่ง received / botSent และเวลา
- [ ] เปิดห้องแล้วเห็นข้อความล่าสุดทันที ไม่มี animation scroll ลงมา
- [ ] เลื่อนขึ้นอ่านประวัติและรับข้อความใหม่
- [ ] สถานะกำลังโหลดประวัติ

## 10. `app/chat/_components/message-composer.tsx` — [UI + Logic] ช่องพิมพ์

- [ ] [UI] ช่องข้อความ ปุ่มส่ง และสถานะกำลังส่ง
- [ ] [Logic] Enter ส่ง / Shift+Enter ขึ้นบรรทัดใหม่
- [ ] [Logic] ข้อความว่าง / สูงสุด 5,000 ตัวอักษร
- [ ] [Logic] ปิดพิมพ์และส่งเมื่อ User บล็อก OA

## 11. `app/chat/_components/empty-conversation.tsx` — [UI] ยังไม่เลือกห้อง

- [ ] หน้าว่าง / error / ปุ่ม demo

## 12. `app/chat/_lib/chat-demo.ts` — [Config/Data] ตัวอย่าง

- [ ] conversations และ messages ตัวอย่างสัมพันธ์กัน

## 13. `lib/api-queries.ts` — [Logic] ดึงข้อมูล

- [ ] fetchJson ตรวจ HTTP error และใช้ no-store
- [ ] conversationsQuery → GET /api/conversations คืน conversations
- [ ] messagesQuery → GET /api/messages?lineUserId=... แยก key ตามห้อง
- [ ] usersQuery → GET /api/line-users แยก key ตามคำค้นและสถานะ ไม่มี pagination
- [ ] ส่ง signal ให้ fetch เพื่อยกเลิก request ที่ไม่ใช้แล้ว
- [ ] structuralSharing รวม response กับ cache โดยไม่ใช้ข้อมูลเก่าทับ Socket update

## 14. `lib/realtime-cache.ts` — [Logic] อัปเดต Cache จาก Socket

- [ ] updateConversationCache → รายการแชทและแถว User ที่มีอยู่ใน cache
- [ ] readReceipt → อัปเดต readAt ของ Message ID ที่ระบุ
- [ ] updateMessageCache → เพิ่มข้อความเฉพาะห้องที่เคยโหลดประวัติแล้ว
- [ ] refreshWorkspace → invalidate conversations / line-users / messages
- [ ] รับส่งข้อความปกติไม่ invalidate เพื่อเรียก API ซ้ำ

## 15. `lib/chat-state.ts` — [Logic + Data] รวมและเรียงข้อมูล

- [ ] type Conversation / ChatMessage และ payload event
- [ ] mergeConversation → รวมตาม ID และไม่ใช้ updatedAt เก่าทับใหม่
- [ ] เรียงตาม lastMessageTime หรือ createdAt ถ้ายังไม่มีข้อความ
- [ ] mergeMessage → ไม่ซ้ำตาม ID เรียง createdAt และรักษา readAt
- [ ] mergeUnread → แทนค่ารายคน ไม่บวกซ้ำ และไม่ใช้ข้อมูลเก่าทับใหม่

## 16. `lib/line-user.ts` — [Config/Data] ผู้ใช้

- [ ] type User และข้อความสถานะ follow / unfollow / unknown

## 17. `hooks/use-realtime.ts` — [Logic] สมัคร Listener เพิ่ม

- [ ] ใช้ connection จาก Provider ไม่สร้าง Socket ใหม่
- [ ] สมัครและยกเลิกเฉพาะ listener ของตัวเอง
- [ ] หน้าหลักปัจจุบันรับข้อมูลผ่าน Query cache จาก Provider

## 18. `app/users/page.tsx` — [UI + Logic] หน้าผู้ใช้

- [ ] [Logic] usersQuery ตามคำค้นและสถานะ พร้อม debounce การค้นหา
- [ ] [Logic] เปลี่ยนหน้าไปกลับแล้วยังเห็น cache ระหว่างโหลดใหม่
- [ ] [Logic] message.update อัปเดตแถวจาก cache; workspace.updated / reconnect โหลดใหม่
- [ ] [UI] โหลด / ไม่พบผลลัพธ์ / error / รีเฟรช

## 19. `app/users/_components/user-filters.tsx` — [UI] ตัวกรอง

- [ ] ช่องค้นหาและ dropdown สถานะ พื้นหลังทึบ

## 20. `app/users/_components/user-table.tsx` — [UI] ตารางผู้ใช้

- [ ] รูป ชื่อ สถานะ เวลา โดยไม่แสดง ID
- [ ] ลิงก์ /chat?user= เปิดห้องที่เลือก
- [ ] User ที่บล็อก OA อยู่ท้ายรายการตามข้อมูลจาก API

## 21. `app/page.tsx` — [UI + Config/Data] หน้าแรก

- [x] [UI] ประกอบ section ตามลำดับ โดยมี metadata ของหน้า
- [x] `app/_components/project-header.tsx` — [UI] ชื่อโปรเจกต์ ลิงก์ GitHub และ Resume
- [x] `app/_components/assignment-section.tsx` — [UI] การแก้โจทย์
- [x] `app/_components/try-it-section.tsx` — [UI + Config/Data] วิธีทดลอง LINE ID / QR / ลิงก์จาก env: local @414plwuv / production @641heypb
- [x] `app/_components/features-section.tsx` — [UI] ความสามารถของระบบ
- [x] `app/_components/architecture-section.tsx` — [UI + Config/Data] เทคโนโลยีและโครงสร้าง
- [x] `app/_components/message-flow-section.tsx` — [UI] Flow รับ–ส่งและ EventReference
- [x] `app/_components/diagrams-section.tsx` — [UI] หัวข้อและ ProjectDiagrams
- [x] `app/_components/api-section.tsx` — [UI + Config/Data] ตาราง endpoint
- [x] `app/_components/behavior-section.tsx` — [UI] รายละเอียดการทำงาน

## 22. `app/_components/event-reference.tsx` — [UI] อธิบาย Event

- [ ] เปิด/ปิดรายละเอียด event และชื่อฟังก์ชันที่ publish

## 23. `app/_components/project-diagrams.tsx` — [UI + Logic] Diagram

- [ ] [UI] ปุ่มเลือก UML / sequence แสดงครบโดยไม่เลื่อนแนวนอน
- [ ] [Logic] โหลด Mermaid เมื่อใช้งานและ render diagram ที่เลือก
- [ ] [UI] loading / error

## 24. `app/_lib/diagrams.ts` — [Config/Data] เนื้อหา Diagram

- [ ] UML models / รับข้อความ / ส่งข้อความ / อ่านและ unread ตรงกับระบบ

## 25. `app/project/page.tsx` — [Logic] Route เดิม

- [ ] redirect /project ไป /

## 26. Styles และ UI ร่วม — [UI]

- [x] `app/globals.css` — style ร่วมและ responsive
- [ ] `app/page.module.css` — หน้าแรก
- [ ] `app/users/page.module.css` — เต็มความสูงจอ เลื่อนตารางและตรึงหัวตาราง
- [ ] `app/chat/_components/conversation-list.module.css` — เวลาและ unread ไม่ขยับ
- [ ] `components/ui/` — shadcn components
- [ ] `public/test-bot-qr.png` และ `public/production-bot-qr.png` — ถูกบัญชี

## 27. Configuration และ Utility — [Config/Data]

- [ ] `next.config.ts` — API proxy / allowedDevOrigins / deploymentId
- [ ] `.env.local` / `.env.production` — แยกค่าของแต่ละแอป ไม่ติด Git
- [ ] Local ใช้ Web 3099 / API 4099 และ OA เดิม
- [ ] Production ใช้ https://robolingo-test.9phuwarin.dev ทั้งเว็บ /api/* และ /socket.io/*
- [ ] `lib/utils.ts` — utility ร่วม
