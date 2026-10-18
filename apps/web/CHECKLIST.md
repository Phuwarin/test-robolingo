# Web Checklist

ไล่ตรวจทีละไฟล์ตามลำดับด้านล่าง ทำเครื่องหมายหลังตรวจด้วยตัวเอง

- **[UI]** หน้าตาและการประกอบหน้าจอ
- **[Logic]** state, API, cache, event และเงื่อนไขการทำงาน
- **[Config/Data]** การตั้งค่า type หรือข้อมูลประกอบ
- ไฟล์ที่มีทั้ง UI และ Logic ระบุแยกในรายการย่อย

## 1. `app/layout.tsx` — [UI] โครงหน้าร่วม

- [X] layout ร่วมทุกหน้า
- [X] ครอบ QueryProvider → RealtimeProvider → Sidebar และหน้าที่เปิด

## 2. `providers/query-provider.tsx` — [Logic] Cache กลาง

- [X] QueryClient เดียวตลอดการเปลี่ยนหน้าในแท็บ
- [X] staleTime 30 วินาที / gcTime 30 นาที
- [X] เปลี่ยนหน้าแล้วใช้ cache แสดงระหว่าง refetch โดยไม่ล้างข้อมูล

## 3. `providers/realtime-provider.tsx` — [Logic] Socket กลาง

- [X] สร้าง connection เดียวและ cleanup ตอนออกจากแอป
- [X] message.update → updateConversationCache
- [X] message.sent → updateMessageCache
- [X] workspace.updated / connect รวมถึง reconnect → refreshWorkspace
- [X] disconnect / connect_error → สถานะ disconnected
- [X] อัปเดต socket / connected ใน Zustand และรีเซ็ตเมื่อ cleanup

### `stores/realtime-store.ts` — [Logic] State ร่วมด้วย Zustand

- [X] เก็บ socket / connected / readingRoomId และ action setReadingRoomId
- [X] Chat ติดตาม connected; Sidebar ติดตาม readingRoomId ผ่าน selector แยกกัน
- [X] ไม่เก็บข้อความและผู้ใช้ใน store ข้อมูลเหล่านี้อยู่ใน TanStack Query
- [X] readingRoomId แชร์ห้องที่กำลังอ่านให้ sidebar โดยไม่เปลี่ยน unread จริงใน cache

## 4. `components/layout/workspace-sidebar.tsx` — [UI + Logic] เมนู

- [X] [UI] ไอคอนหน้าแรก / Users / Chat และเมนูที่เลือก
- [X] [Logic] ใช้ usersQuery ชุดเดียวกับ Users เมื่อไม่มีตัวกรอง
- [X] [Logic] รวม unread ทุก User ยกเว้นห้องที่กำลังอ่านและมีโฟกัส
- [X] [Logic] อัปเดตจาก cache โดยไม่เรียก API ซ้ำทุกข้อความ

## 5. Route และหน้าจอ Chat — [UI + Logic]

- [X] pp/chat/layout.tsx — ใช้ ChatWorkspace ร่วมระหว่าง /chat และ /chat/[id]
- [X] pp/chat/page.tsx — /chat ไม่เลือกห้อง และ redirect ลิงก์เก่า ?user= ไป /chat/[id]
- [X] pp/chat/[id]/page.tsx — route ห้องแชทตาม UUID ภายใน
- [X] เลือกห้องแล้ว URL เปลี่ยน รีเฟรชเปิดห้องเดิม และ Back/Forward เปลี่ยนห้องตาม URL

### pp/chat/_components/chat-workspace.tsx — [UI] ประกอบหน้าแชท

- [ ] เชื่อม props จาก useChat ไปแต่ละ component
- [ ] ยังไม่เลือกห้อง → EmptyConversation
- [ ] เลือกห้อง → Header / MessageThread / Composer
- [ ] แสดง error โดยไม่ถอดห้องแชทออก

## 6. `app/chat/_hooks/use-chat.ts` — [Logic] ควบคุมแชท

- [ ] ประกอบ useChatDemo / useMarkRead / useSendMessage แล้วคืน props ให้หน้า Chat
- [ ] ใช้ useParams อ่านห้องจาก /chat/[id] ไม่เก็บ selected ซ้ำใน state ของ live; /chat เป็น empty state
- [ ] โหลดรายการแชทและประวัติเฉพาะห้องจาก React Query
- [ ] เปลี่ยนห้องแล้วล้าง draft/error ใช้ cache ของห้องนั้นระหว่างโหลดใหม่
- [ ] ซ่อน unread ของ readingRoomId เฉพาะข้อมูลสำหรับแสดงผล ไม่แก้ cache จริง
- [ ] refresh กลับจาก demo เป็น live และ invalidate ข้อมูล
- [ ] รวม error จาก action / query และคืน loadingHistory / refreshing / connected

### `app/chat/_hooks/use-send-message.ts` — [Logic] ส่งข้อความ

- [ ] จัดการ draft / busy ป้องกันข้อความว่าง ส่งซ้ำระหว่างรอ และส่งให้ User ที่บล็อก OA
- [ ] ส่ง API หรือส่งเข้า demo ตาม mode
- [ ] ส่งสำเร็จล้าง draft; Socket หลุดให้ refetch; ส่งไม่สำเร็จแสดง error

### `app/chat/_hooks/use-mark-read.ts` — [Logic] อ่านแล้ว

- [ ] ติดตาม focus / visibility และ cleanup listener
- [ ] markRead ข้อความ received ที่ยังไม่อ่าน ครั้งละไม่เกิน 1,000 และกัน request ซ้ำ
- [ ] response markRead อัปเดต unread/readAt ใน cache และแชร์ readingRoomId ผ่าน Zustand
- [ ] คืน readingRoomId เป็นค่าว่างเมื่อออกจากหน้า เสียโฟกัส หรือเกิด error

### `app/chat/_hooks/use-chat-demo.ts` — [Logic] โหมดทดลอง

- [ ] startDemo รีเซ็ตข้อมูลและคืน ID ห้องแรก; stopDemo กลับ live
- [ ] sendDemoMessage เพิ่มข้อความและอัปเดตข้อความล่าสุดโดยไม่เรียก API

## 7. `app/chat/_components/conversation-list.tsx` — [UI + Logic] รายการแชท

- [ ] [UI] รูป ชื่อ preview เวลา และ badge unread
- [ ] [UI] เวลาอยู่ตำแหน่งเดิมเมื่อ badge ขึ้นหรือหาย
- [ ] [Logic] ค้นหาเฉพาะชื่อผู้ใช้จากรายการที่โหลด
- [ ] [Logic] แสดงยอด unread รวมจาก conversations ที่รับมา
- [ ] [UI] ปุ่มเลือกห้อง / รีเฟรช / Users / demo และสถานะ Socket
- [ ] [UI] ไม่พบผลค้นหา / ยังไม่มีบทสนทนา

## 8. `app/chat/_components/conversation-header.tsx` — [UI] หัวห้อง

- [X] ข้อมูล User ที่เลือก

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

- [X] type User และข้อความสถานะ follow / unfollow / unknown

## 17. `hooks/use-realtime.ts` — [Logic] สมัคร Listener เพิ่ม

- [X] อ่าน socket / connected จาก Zustand ด้วย selector ไม่สร้าง Socket ใหม่
- [X] สมัครและยกเลิกเฉพาะ listener ของตัวเอง
- [X] หน้าหลักปัจจุบันรับข้อมูลผ่าน Query cache จาก Provider

## 18. `app/users/page.tsx` — [UI + Logic] หน้าผู้ใช้

- [X] [Logic] usersQuery ตามคำค้นและสถานะ พร้อม debounce การค้นหา
- [X] [Logic] เปลี่ยนหน้าไปกลับแล้วยังเห็น cache ระหว่างโหลดใหม่
- [X] [Logic] message.update อัปเดตแถวจาก cache; workspace.updated / reconnect โหลดใหม่
- [X] [UI] โหลด / ไม่พบผลลัพธ์ / error / รีเฟรช

## 19. `app/users/_components/user-filters.tsx` — [UI] ตัวกรอง

- [X] ช่องค้นหาและ dropdown สถานะ พื้นหลังทึบ

## 20. `app/users/_components/user-table.tsx` — [UI] ตารางผู้ใช้

- [X] รูป ชื่อ สถานะ เวลา โดยไม่แสดง ID
- [ ] ลิงก์ /chat/[id] เปิดห้องที่เลือก
- [ ] User ที่บล็อก OA อยู่ท้ายรายการตามข้อมูลจาก API

## 21. `app/page.tsx` — [UI + Config/Data] หน้าแรก

- [X] [UI] ประกอบ section ตามลำดับ โดยมี metadata ของหน้า
- [X] `app/_components/project-header.tsx` — [UI] ชื่อโปรเจกต์ ลิงก์ GitHub และ Resume
- [X] `app/_components/assignment-section.tsx` — [UI] การแก้โจทย์
- [X] `app/_components/try-it-section.tsx` — [UI + Config/Data] วิธีทดลอง LINE ID / QR / ลิงก์จาก env: local @414plwuv / production @641heypb
- [X] `app/_components/features-section.tsx` — [UI] ความสามารถของระบบ
- [X] `app/_components/architecture-section.tsx` — [UI + Config/Data] เทคโนโลยีและโครงสร้าง
- [X] `app/_components/message-flow-section.tsx` — [UI] Flow รับ–ส่งและ EventReference
- [X] `app/_components/diagrams-section.tsx` — [UI] หัวข้อและ ProjectDiagrams
- [X] `app/_components/api-section.tsx` — [UI + Config/Data] ตาราง endpoint
- [X] `app/_components/behavior-section.tsx` — [UI] รายละเอียดการทำงาน

## 22. `app/_components/event-reference.tsx` — [UI] อธิบาย Event

- [X] เปิด/ปิดรายละเอียด event และชื่อฟังก์ชันที่ publish

## 23. `app/_components/project-diagrams.tsx` — [UI + Logic] Diagram

- [X] [UI] ปุ่มเลือก UML / sequence แสดงครบโดยไม่เลื่อนแนวนอน
- [X] [Logic] โหลด Mermaid เมื่อใช้งานและ render diagram ที่เลือก
- [X] [UI] loading / error

## 24. `app/_lib/diagrams.ts` — [Config/Data] เนื้อหา Diagram

- [X] UML models / รับข้อความ / ส่งข้อความ / อ่านและ unread ตรงกับระบบ

## 25. `app/project/page.tsx` — [Logic] Route เดิม

- [X] redirect /project ไป /

## 26. Styles และ UI ร่วม — [UI]

- [X] `app/globals.css` — style ร่วมและ responsive
- [X] `app/page.module.css` — หน้าแรก
- [X] `app/users/page.module.css` — เต็มความสูงจอ เลื่อนตารางและตรึงหัวตาราง
- [X] `app/chat/_components/conversation-list.module.css` — เวลาและ unread ไม่ขยับ
- [X] `components/ui/` — shadcn components
- [X] `public/test-bot-qr.png` และ `public/production-bot-qr.png` — ถูกบัญชี

## 27. Configuration และ Utility — [Config/Data]

- [X] `next.config.ts` — API proxy / allowedDevOrigins / deploymentId
- [X] `.env.local` / `.env.production` — แยกค่าของแต่ละแอป ไม่ติด Git
- [X] Local ใช้ Web 3099 / API 4099 และ OA เดิม
- [X] Production ใช้ https://robolingo-test.9phuwarin.dev ทั้งเว็บ /api/* และ /socket.io/*
- [X] `lib/utils.ts` — utility ร่วม
