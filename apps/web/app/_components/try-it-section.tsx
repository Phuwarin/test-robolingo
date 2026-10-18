import Image from "next/image";
import styles from "../page.module.css";

const lineOaId = process.env.NEXT_PUBLIC_LINE_OA_ID || "@414plwuv";
const lineOaUrl = process.env.NEXT_PUBLIC_LINE_OA_URL || `https://line.me/R/ti/p/${encodeURIComponent(lineOaId)}`;
const lineOaQr = process.env.NEXT_PUBLIC_LINE_OA_QR || "/test-bot-qr.png";

export function TryItSection() {
  return (
    <section className={styles.section}>
      <span className={styles.label}>01 / TRY IT</span>
      <h2>ทดลองใช้งาน</h2>
      <ol className={styles.steps}>
        <li>
          <strong>เพิ่มเพื่อน Test Bot</strong>
          <p>ค้นหา {lineOaId} บน LINE หรือสแกน QR ด้านล่าง</p>
          <a href={lineOaUrl} target="_blank" rel="noreferrer">
            <Image src={lineOaQr} alt={`QR เพิ่มเพื่อน Test Bot ${lineOaId}`} width={180} height={180} priority unoptimized />
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
  );
}
