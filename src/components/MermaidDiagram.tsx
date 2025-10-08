"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      mermaid.initialize({ startOnLoad: false });
      ref.current.innerHTML = `<div class="mermaid">${chart}</div>`;
      try {
        mermaid.init(undefined, ref.current);
      } catch (e) {
        console.error("Mermaid rendering errror:", e);
      }
    }
  }, [chart]);

  return (
    <div
      ref={ref}
      className="bg-gray-50 text-black rounded-xl border border-gray-200 overflow-auto"
    />
  );
}
