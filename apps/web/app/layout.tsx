import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import "./globals.css";
export const metadata = { title: "LINE Desk · Webchat", description: "กล่องข้อความสำหรับ LINE Official Account" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <WorkspaceSidebar />
        <div className="workspace-content">{children}</div>
      </body>
    </html>
  );
}
