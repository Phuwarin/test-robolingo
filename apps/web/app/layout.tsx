import { RealtimeProvider } from "@/providers/realtime-provider";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import "./globals.css";
export const metadata = { title: "LINE Desk · Webchat", description: "กล่องข้อความสำหรับ LINE Official Account" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <RealtimeProvider>
          <WorkspaceSidebar />
          <div className="workspace-content">{children}</div>
        </RealtimeProvider>
      </body>
    </html>
  );
}
