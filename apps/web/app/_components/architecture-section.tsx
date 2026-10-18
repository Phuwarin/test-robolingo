import { Badge } from "@/components/ui/badge";
import styles from "../page.module.css";

const stack = ["Next.js", "TypeScript", "NestJS", "PostgreSQL", "Sequelize", "Socket.IO", "React Query", "shadcn/ui", "Bun"];

export function ArchitectureSection() {
  return (
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
  );
}
