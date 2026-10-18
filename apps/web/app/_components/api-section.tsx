import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import styles from "../page.module.css";

const endpoints = [
  ["POST /api/webhook", "รับ event follow, unfollow และ message จาก LINE พร้อมตรวจ signature"],
  ["GET /api/line-users", "รายชื่อผู้ใช้ ค้นหาและกรองสถานะ ไม่มี pagination ผู้ใช้ที่บล็อก OA อยู่ท้ายรายการ"],
  ["GET /api/conversations", "รายการแชท JOIN ข้อความล่าสุด เรียงตาม lastMessageTime ถ้าไม่มีใช้เวลาสร้าง User"],
  ["GET /api/messages?lineUserId=...", "ประวัติข้อความเฉพาะห้อง เรียงเก่าไปใหม่"],
  ["POST /api/messages", "ส่งข้อความด้วย LINE User ID หลังสำเร็จจึงบันทึก DB และส่ง Socket"],
  ["POST /api/conversations/:lineUserId/read", "อ่านเฉพาะ Message ID ที่ระบุ แล้วคำนวณ unread ที่เหลือ"],
];

export function ApiSection() {
  return (
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
  );
}
