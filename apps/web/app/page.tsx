import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { CodeXml, MessageCircle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <main className={styles["bot-home"]}>
      <section className={styles["bot-intro"]} aria-labelledby="bot-name">
        <Badge variant="secondary">LINE OFFICIAL ACCOUNT</Badge>
        <div className={styles["bot-icon"]}>
          <MessageCircle size={36} />
        </div>
        <h1 id="bot-name">Test Bot</h1>
        <p className={styles["bot-handle"]}>@414plwuv</p>
        <p className={styles["bot-description"]}>
          เพิ่มเพื่อนแล้วส่งข้อความหา Test Bot บน LINE
          <br />
          ดูและตอบกลับบทสนทนาได้ผ่านเว็บแชทนี้
        </p>
        <div className={styles["bot-actions"]}>
          <Button asChild>
            <a href="https://line.me/R/ti/p/%40414plwuv" target="_blank" rel="noreferrer">
              <MessageCircle size={17} />
              เพิ่มเพื่อน LINE
              <ArrowUpRight size={16} />
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/chat">เปิดเว็บแชท</Link>
          </Button>
        </div>
        <a className={styles["bot-repository"]} href="https://github.com/Phuwarin/test-robolingo" target="_blank" rel="noreferrer">
          <CodeXml size={17} />
          Phuwarin/test-robolingo
          <ArrowUpRight size={14} />
        </a>
      </section>
      <section className={styles["bot-qr"]} aria-label="QR เพิ่มเพื่อน Test Bot">
        <Image src="/test-bot-qr.png" alt="QR Code สำหรับเพิ่มเพื่อน Test Bot บน LINE" width={360} height={360} priority unoptimized />
        <h2>สแกนเพื่อเพิ่มเพื่อน</h2>
        <p>
          เปิด LINE แล้วสแกน QR Code นี้
          <br />
          หรือค้นหา ID <strong>@414plwuv</strong>
        </p>
      </section>
    </main>
  );
}
