import { NextRequest, NextResponse } from "next/server";


export const maxDuration = 60;

export async function POST(req: NextRequest) {
    const { text } = await req.json();

    const prompt = `Extract flow as JSON: {"nodes":[{"id":"1","label":"Start"}],"edges":[{"from":"1","to":"2"}]}

Text: ${text}

JSON only:`;

    try {
        const completion = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({

                model: "mistral",
                prompt,
                stream: false,
            })
        })

        const data = await completion.json();
        const raw = data.completion.trim();

        const parsed = JSON.parse(raw);

        const chart = jsonToMermaid(parsed);

        return NextResponse.json({ chart });
    } catch (error) {
        console.error("Ollama error:", error);
        return NextResponse.json({ error: "Failed to generate diagram" }, { status: 500 });
    }
}

interface Node {
    id: string;
    label: string;
}

interface Edge {
    from: string;
    to: string;
}

interface GraphData {
    nodes: Node[];
    edges: Edge[];
}

function jsonToMermaid(data: GraphData) {
    let chart = `graph TD\n`;

    for (const node of data.nodes) {
        chart += `${node.id} ${node.label}\n`;
    }

    for (const edge of data.edges) {
        chart += `${edge.from} --> ${edge.to}\n`;
    }
    return chart;
}