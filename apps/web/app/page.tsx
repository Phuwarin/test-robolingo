import type { Metadata } from "next";
import { ProjectHeader } from "./_components/project-header";
import { AssignmentSection } from "./_components/assignment-section";
import { TryItSection } from "./_components/try-it-section";
import { FeaturesSection } from "./_components/features-section";
import { ArchitectureSection } from "./_components/architecture-section";
import { MessageFlowSection } from "./_components/message-flow-section";
import { DiagramsSection } from "./_components/diagrams-section";
import { ApiSection } from "./_components/api-section";
import { BehaviorSection } from "./_components/behavior-section";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Project overview · LINE Desk",
  robots: { index: false, follow: false },
};

export default function ProjectPage() {
  return (
    <main className={styles.page}>
      <ProjectHeader />
      <AssignmentSection />
      <TryItSection />
      <FeaturesSection />
      <ArchitectureSection />
      <MessageFlowSection />
      <DiagramsSection />
      <ApiSection />
      <BehaviorSection />
    </main>
  );
}
