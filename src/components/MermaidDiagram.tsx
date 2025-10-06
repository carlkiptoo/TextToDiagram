"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
    chart: string;
}


export default function MermaidDiagram({chart}: MermaidDiagramProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            mermaid.initialize({startOnLoad: true});
            mermaid.contentLoaded();
            ref.current.innerHTML = `<div class="mermaid">${chart}</div>`;
            mermaid.init(undefined, ref.current);
        }
    }, [chart]);

    return (
        <div ref={ref} className="bg-gray-50 rounded-xl border border-gray-200 overflow-auto" />
    )
}