import { EventReference } from "./event-reference";
import styles from "../page.module.css";

export function MessageFlowSection() {
  return (
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
  );
}
