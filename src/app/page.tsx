"use client";

import { useState } from "react";
import MermaidDiagram from "../components/MermaidDiagram";

export default function Home() {
  const [text, setText] = useState("");
  const [chart, setChart] = useState("");

  const handleGenerate = async () => {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    if (data.chart) {
      setChart(data.chart);
    } else {
      alert("Failed to generate diagram");
    }
  };

  return (
    <main className="min-h-screen p-6 bg-white flex flex-col items-center">
      <h1 className="text-3xl text-black font-bold mb-4">Text to Diagram Gen</h1>
      <textarea
        className="border text-black w-full max-w-2xl p-3 rounded-mb mb-4"
        rows={4}
        placeholder="Describe your process here.."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={handleGenerate} className="bg-blue-500 text-white px-4 py-2 rounded-md mb-6 hover:bg-blue-700">
        Generate Diagram
      </button>
      {chart && (
        <div className="w-full max-w-4xl">
          <MermaidDiagram chart={chart} />
        </div>
      )}
    </main>
  );
}
