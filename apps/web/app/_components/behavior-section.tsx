import styles from "../page.module.css";

export function BehaviorSection() {
  return (
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
  );
}
