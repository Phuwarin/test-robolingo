import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import styles from "../page.module.css";

export function ProjectHeader() {
  return (
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
  );
}
