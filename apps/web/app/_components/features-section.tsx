import styles from "../page.module.css";

export function FeaturesSection() {
  return (
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
  );
}
