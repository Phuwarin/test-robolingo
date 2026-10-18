import type { Metadata } from "next";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EventReference } from "./_components/event-reference";
import { ProjectDiagrams } from "./_components/project-diagrams";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Project overview · LINE Desk",
  robots: { index: false, follow: false },
};

const stack = ["Next.js", "TypeScript", "NestJS", "PostgreSQL", "Sequelize", "Socket.IO", "React Query", "shadcn/ui", "Bun"];
const endpoints = [
  ["POST /api/webhook", "รับ event follow, unfollow และ message จาก LINE พร้อมตรวจ signature"],
  ["GET /api/line-users", "รายชื่อผู้ใช้ ค้นหาและกรองสถานะ ไม่มี pagination ผู้ใช้ที่บล็อก OA อยู่ท้ายรายการ"],
  ["GET /api/conversations", "รายการแชท JOIN ข้อความล่าสุด เรียงตาม lastMessageTime ถ้าไม่มีใช้เวลาสร้าง User"],
  ["GET /api/messages?lineUserId=...", "ประวัติข้อความเฉพาะห้อง เรียงเก่าไปใหม่"],
  ["POST /api/messages", "ส่งข้อความด้วย LINE User ID หลังสำเร็จจึงบันทึก DB และส่ง Socket"],
  ["POST /api/conversations/:lineUserId/read", "อ่านเฉพาะ Message ID ที่ระบุ แล้วคำนวณ unread ที่เหลือ"],
];

export default function ProjectPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Badge variant="secondary">PROJECT OVERVIEW</Badge>
        <h1>LINE Desk</h1>
        <p className={styles.lead}>เว็บจัดการบทสนทนาของ LINE Official Account</p>
        <p>รับข้อความจากผู้ใช้ LINE เลือกห้องแชทแล้วตอบกลับในนาม Test Bot พร้อมอัปเดตข้อความและสถานะอ่านแบบ realtime</p>
        <div className={styles.links}>
          <Button asChild>
            <a href="https://github.com/Phuwarin/test-robolingo" target="_blank" rel="noreferrer">
              GitHub repository ↗
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="https://resume.9phuwarin.dev/en/" target="_blank" rel="noreferrer">
              Resume ↗
            </a>
          </Button>
        </div>
      </header>

      <section className={styles.section}>
        <span className={styles.label}>THE ASSIGNMENT</span>
        <h2>การแก้โจทย์</h2>
        <p>โจทย์คือสร้างเว็บแชทที่เชื่อมกับ LINE Official Account โดยเว็บนี้เป็นหน้าจอของผู้ดูแล OA ผู้ใช้ส่งข้อความหา Test Bot ผ่าน LINE แล้วผู้ดูแลเลือกผู้ใช้และตอบกลับผ่านเว็บ</p>
        <div className={styles.features}>
          <article>
            <h3>ใช้ Next.js และ TypeScript</h3>
            <p>หน้าเว็บพัฒนาด้วย Next.js และ TypeScript แยก API เป็น NestJS เพื่อรับ webhook ส่งข้อความ และจัดการข้อมูล</p>
          </article>
          <article>
            <h3>รับข้อความจาก LINE</h3>
            <p>LINE ส่ง message event มายัง webhook ระบบบันทึกผู้ส่งและข้อความลง PostgreSQL แล้วส่ง Socket event ให้เว็บแสดงข้อความทันที</p>
          </article>
          <article>
            <h3>เลือกผู้ใช้และส่งข้อความกลับ</h3>
            <p>แสดงรายชื่อและประวัติแชทแยกตามผู้ใช้ เมื่อผู้ดูแลกดส่ง API จะเรียก LINE Messaging API ในนาม Test Bot แล้วบันทึกข้อความที่ส่งสำเร็จ</p>
          </article>
          <article>
            <h3>ส่งมอบและเผยแพร่</h3>
            <p>โค้ดอยู่ใน GitHub repository ที่ลิงก์ด้านบน ส่วน hosting โจทย์เดิมระบุ Vercel แต่แผนของโปรเจกต์นี้เปลี่ยนเป็น DigitalOcean สำหรับ Web, API และฐานข้อมูล</p>
          </article>
        </div>
        <p>ผลลัพธ์คือผู้ดูแลเห็นว่าใครส่งข้อความมา เลือกห้องเพื่ออ่านและตอบกลับได้ พร้อมสถานะเพิ่มเพื่อนหรือบล็อก OA และจำนวนข้อความที่ยังไม่อ่าน</p>
      </section>

      <section className={styles.section}>
        <span className={styles.label}>01 / TRY IT</span>
        <h2>ทดลองใช้งาน</h2>
        <ol className={styles.steps}>
          <li>
            <strong>เพิ่มเพื่อน Test Bot</strong>
            <p>ค้นหา @414plwuv บน LINE หรือสแกน QR ด้านล่าง</p>
            <a href="https://line.me/R/ti/p/%40414plwuv" target="_blank" rel="noreferrer">
              <Image src="/test-bot-qr.png" alt="QR เพิ่มเพื่อน Test Bot @414plwuv" width={180} height={180} priority unoptimized />
            </a>
          </li>
          <li>
            <strong>ส่งข้อความจาก LINE</strong>
            <p>ข้อความจะเข้า API ผ่าน webhook แล้วเก็บในฐานข้อมูล</p>
          </li>
          <li>
            <strong>เปิดเมนู Chat แล้วเลือกผู้ใช้</strong>
            <p>อ่านข้อความและพิมพ์ตอบกลับ จากนั้นตรวจข้อความตอบบน LINE</p>
          </li>
        </ol>
      </section>

      <section className={styles.section}>
        <span className={styles.label}>02 / FEATURES</span>
        <h2>สิ่งที่ระบบทำได้</h2>
        <div className={styles.features}>
          <article>
            <h3>Users</h3>
            <p>ค้นหาผู้ใช้และดูสถานะเพิ่มเพื่อนหรือบล็อก OA ปิดพิมพ์และส่งให้ผู้ใช้ที่บล็อกแล้ว</p>
          </article>
          <article>
            <h3>Chat</h3>
            <p>แยกห้องตาม User ดูประวัติ รับและส่งข้อความ แสดงข้อความล่าสุดทันทีเมื่อเปิดห้อง</p>
          </article>
          <article>
            <h3>Unread</h3>
            <p>บันทึก unread รายผู้ใช้และ readAt รายข้อความ พร้อมยอดรวมใน sidebar เป็นสถานะอ่านร่วมของผู้ดูแลเว็บ</p>
          </article>
          <article>
            <h3>Realtime & cache</h3>
            <p>Socket connection เดียวต่อแท็บ อัปเดต React Query cache ข้ามหน้าโดยไม่ล้างข้อมูลระหว่างโหลดใหม่เบื้องหลัง</p>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <span className={styles.label}>03 / ARCHITECTURE</span>
        <h2>โครงสร้างและเทคโนโลยี</h2>
        <div className={styles.stack}>
          {stack.map((item) => (
            <Badge key={item} variant="outline">
              {item}
            </Badge>
          ))}
        </div>
        <p>
          <code>apps/web</code> เป็น Next.js ส่วน <code>apps/api</code> เป็น NestJS แยก package, dependencies และ Prettier ของแต่ละแอป รันด้วย Bun
        </p>
        <p>
          ข้อมูลหลักอยู่ในตาราง <code>line_users</code> และ <code>messages</code> ใช้ UUID ภายใน ส่วน ID ของ LINE เก็บแยกไว้ใน lineUserId / lineMessageId
        </p>
      </section>

      <section className={styles.section}>
        <span className={styles.label}>04 / MESSAGE FLOW</span>
        <h2>ข้อความเดินทางอย่างไร</h2>
        <div className={styles.flow}>
          <span>รับเข้า</span>
          <p>LINE → Webhook → บันทึก DB → Socket → อัปเดต cache และเว็บ</p>
        </div>
        <div className={styles.flow}>
          <span>ส่งออก</span>
          <p>เว็บ → API → LINE → บันทึก DB → Socket → อัปเดต cache และเว็บ</p>
        </div>
        <p>ข้อความขารับใช้ timestamp จาก LINE ขาส่งใช้เวลาเครื่องก่อนเรียก LINE API นาฬิกาเครื่อง API ต้องตรงกับเวลามาตรฐานเพื่อเรียงข้อความข้ามฝั่งได้ถูกต้อง</p>
        <EventReference />
      </section>

      <section className={styles.section}>
        <span className={styles.label}>05 / UML & SEQUENCE</span>
        <h2>โครงสร้างข้อมูลและลำดับการทำงาน</h2>
        <ProjectDiagrams />
      </section>
      <section className={styles.section}>
        <span className={styles.label}>06 / API</span>
        <h2>API ที่ใช้</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Endpoint</TableHead>
              <TableHead>หน้าที่</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {endpoints.map(([endpoint, description]) => (
              <TableRow key={endpoint}>
                <TableCell>
                  <code>{endpoint}</code>
                </TableCell>
                <TableCell>{description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className={styles.section}>
        <span className={styles.label}>07 / BEHAVIOR</span>
        <h2>รายละเอียดที่ควรรู้</h2>
        <ul className={styles.notes}>
          <li>เข้า /chat จะเห็น empty state ก่อน เลือกห้องจึงโหลดประวัติ เปลี่ยนห้องจะเรียก API ใหม่โดยใช้ cache แสดงระหว่างรอถ้ามี</li>
          <li>ขณะรับหรือส่งข้อความใช้ Socket อัปเดต cache ส่วน follow/unfollow และ reconnect โหลดข้อมูลใหม่เบื้องหลัง</li>
          <li>ทำเครื่องหมายอ่านเมื่อห้องเปิดในแท็บที่มองเห็นและมีโฟกัส ไม่ใช่สถานะอ่านในแอป LINE</li>
          <li>ข้อความส่งผ่านเว็บนี้ถูกเก็บในระบบ ข้อความส่งจากแอป LINE OA โดยตรงไม่ได้เข้ามาเป็นประวัติในเว็บนี้</li>
        </ul>
      </section>
    </main>
  );
}
