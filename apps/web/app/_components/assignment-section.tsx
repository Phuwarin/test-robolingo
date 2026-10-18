import styles from "../page.module.css";

export function AssignmentSection() {
  return (
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
  );
}
