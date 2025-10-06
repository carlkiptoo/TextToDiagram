"use client";

import { useState } from "react";
import MermaidDiagram from "../components/MermaidDiagram";

export default function Home() {
  const [text, setText] = useState("");
  const [chart, setChart] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setChart("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.chart) {
        setChart(data.chart);
      } else {
        alert("Failed to generate diagram");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to generate diagram");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 bg-white flex flex-col items-center">
      <h1 className="text-3xl text-black font-bold mb-4">
        Text to Diagram Gen
      </h1>
      <textarea
        className="border text-black w-full max-w-2xl p-3 rounded-mb mb-4"
        rows={4}
        placeholder="Describe your process here.."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={handleGenerate}
        className={`px-4 py-2 rounded-md mb-6 text-white ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-700"
        }`}
        disabled={loading || !text.trim()}
      >
        {loading ? "Generating..." : "Generate"}
      </button>
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {loading && (
        <div className="text-gray-600 mb-4 animate-pulse">
          Generating diagram...
        </div>
      )}
      {chart && !loading && (
        <div className="w-full max-w-4xl">
          <MermaidDiagram chart={chart} />
        </div>
      )}
    </main>
  );
}
