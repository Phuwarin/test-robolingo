import { ProjectDiagrams } from "./project-diagrams";
import styles from "../page.module.css";

export function DiagramsSection() {
  return (
    <section className={styles.section}>
      <span className={styles.label}>05 / UML & SEQUENCE</span>
      <h2>โครงสร้างข้อมูลและลำดับการทำงาน</h2>
      <ProjectDiagrams />
    </section>
  );
}
