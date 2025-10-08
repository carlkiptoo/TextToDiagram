import { NextRequest, NextResponse } from "next/server";


export const maxDuration = 60;

export async function POST(req: NextRequest) {
    const { text } = await req.json();

    const prompt = `

You are a flow extractor. 
Return ONLY valid JSON with the structure:
{
  "nodes": [{"id": string, "label": string}],
  "edges": [{"from": string, "to": string}]
}

Rules:
- IDs must be lowercase
- No comments, no explanations
- No Markdown
- Respond ONLY with JSON
- If a node is missing required fields, omit it entirely.
- Do not invent new fields or typos.
- Validate JSON before responding.


Text: ${text}
`;

    try {
        const completion = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "phi3:mini",
                prompt,
                stream: false,
            })
        });

        if (!completion.ok) {
            throw new Error(`Ollama request failed: ${completion.status}`);
        }

        const data = await completion.json();
        if (!data.response) {
            throw new Error("No response from Ollama");
        }
        let raw = data.response.trim();

        const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            raw = jsonMatch[1].trim();
        }

        const jsonStart = raw.indexOf('{');
        const jsonEnd = raw.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            raw = raw.substring(jsonStart, jsonEnd + 1);
        }
        console.log("Extracted JSON:", raw);

        try {
            const parsed = JSON.parse(raw);

            const chart = jsonToMermaid(parsed);

            return NextResponse.json({ chart });
        } catch (error) {
            console.error("Initial JSON parse error:", error);

            try {
                raw = raw
                    .replace(/,\s*([\]}])/g, '$1')
                    .replace(/}\s*}+/g, '}')
                    .replace(/]\s*]+/g, ']');

                const repaired = JSON.parse(raw);
                const chart = jsonToMermaid(repaired);
                return NextResponse.json({ chart });

            } catch (error) {
                console.error("Ollama error:", error);
                return NextResponse.json({ error: "Failed to generate diagram" }, { status: 500 });
            }
        }
    } catch (finalError) {
        console.error("Final JSON parse error:", finalError);
        return NextResponse.json({ error: "Failed to generate diagram" }, { status: 500 });
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

        const nodeMap = new Map<string, string>();
        
        for (const node of data.nodes) {
            if (!node.id || !node.label) continue;
            nodeMap.set(node.id, node.label);
            chart += `  ${node.id}["${node.label}"]\n`;
        }

        for (const edge of data.edges) {
            if (!edge.from || !edge.to) continue;

            if (!nodeMap.has(edge.from)) {
                chart += ` ${edge.from}["${edge.from}"]\n`;
                nodeMap.set(edge.from, edge.from);
            }

            if (!nodeMap.has(edge.to)) {
                chart += `${edge.to}["${edge.to}"]\n`;
                nodeMap.set(edge.to, edge.to);
            }

            chart += `  ${edge.from} --> ${edge.to}\n`;
        }
        return chart;
    }
}
