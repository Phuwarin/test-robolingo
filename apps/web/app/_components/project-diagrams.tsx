"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { diagrams } from "../_lib/diagrams";
import styles from "../page.module.css";

export function ProjectDiagrams() {
  const [selected, setSelected] = useState(0);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const diagram = diagrams[selected];

  useEffect(() => {
    let active = true;
    setSvg("");
    setError("");
    void (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "neutral",
          fontFamily: "Arial, sans-serif",
          sequence: { useMaxWidth: true, wrap: true },
        });
        const result = await mermaid.render(`project-${id}-${diagram.id}`, diagram.source);
        if (active) setSvg(result.svg);
      } catch {
        if (active) setError("ไม่สามารถแสดง diagram ได้ กรุณาลองเลือกใหม่");
      }
    })();
    return () => {
      active = false;
    };
  }, [id, diagram]);

  return (
    <div>
      <div className={styles.links} aria-label="เลือก diagram">
        {diagrams.map((item, index) => (
          <Button key={item.id} variant={selected === index ? "default" : "outline"} aria-pressed={selected === index} onClick={() => setSelected(index)}>
            {item.title}
          </Button>
        ))}
      </div>
      <p>{diagram.description}</p>
      <div className={styles.diagram} role="region" aria-label={diagram.title} tabIndex={0} aria-busy={!svg && !error}>
        {error ? <p role="alert">{error}</p> : svg ? <div dangerouslySetInnerHTML={{ __html: svg }} /> : <p role="status">กำลังวาด diagram…</p>}
      </div>
    </div>
  );
}
