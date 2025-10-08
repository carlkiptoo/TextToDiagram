"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      const renderDiagram = async () => {
        try {
          mermaid.initialize({
            startOnLoad: false,
            theme: "default",
            securityLevel: "loose",
          });

          const id = `mermaid-${Date.now()}`;

          const { svg } = await mermaid.render(id, chart);

          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        } catch (error) {
          console.error("Mermaid rendering error:", error);
          if (ref.current) {
            ref.current.innerHTML = `<div class=text-red-500>Failed to render diagram: ${error}</div>`;
          }
        }
      };
      renderDiagram();
    }
  }, [chart]);

  return (
    <div
      ref={ref}
      className="bg-gray-50 text-black rounded-xl border border-gray-200 overflow-auto p-4 min-h-[200px]"
    />
  );
}
