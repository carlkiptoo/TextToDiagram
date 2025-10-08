import { NextRequest, NextResponse } from "next/server";

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

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    const { text } = await req.json();

    const prompt = `You are a flow extractor. Extract the workflow steps and connections from the text below.

CRITICAL: Return ONLY a single valid JSON object in this EXACT format:
{
  "nodes": [
    {"id": "step1", "label": "Step 1 Description"},
    {"id": "step2", "label": "Step 2 Description"}
  ],
  "edges": [
    {"from": "step1", "to": "step2"}
  ]
}

RULES:
1. ALL nodes must be in ONE "nodes" array
2. ALL edges must be in ONE "edges" array
3. IDs must be lowercase with underscores (no spaces)
4. No markdown, no code blocks, no explanations
5. Return ONLY the JSON object
6. Do NOT split into multiple JSON objects

Text: ${text}

JSON:`;

    try {
        const completion = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "phi3:mini",
                prompt,
                stream: false,
                temperature: 0.1, 
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
        console.log("Raw LLM response:", raw);

        
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

       
        let parsed: GraphData;
        
        try {
            parsed = JSON.parse(raw);
        } catch (error) {
            console.error("Initial JSON parse error:", error);
            
            
            try {
                parsed = repairAndParseJSON(raw);
                console.log("Successfully repaired JSON");
            } catch (repairError) {
                console.error("Repair failed:", repairError);
                return NextResponse.json({ 
                    error: "Failed to parse LLM response. The model generated invalid JSON." 
                }, { status: 500 });
            }
        }

        if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
            parsed.nodes = [];
        }
        if (!parsed.edges || !Array.isArray(parsed.edges)) {
            parsed.edges = [];
        }

        const chart = jsonToMermaid(parsed);
        console.log("Generated Mermaid chart:", JSON.stringify(chart));

        return NextResponse.json({ chart });

    } catch (finalError) {
        console.error("Final error:", finalError);
        return NextResponse.json({ 
            error: "Failed to generate diagram" 
        }, { status: 500 });
    }
}

function repairAndParseJSON(raw: string): GraphData {
  
    const repaired = raw
        .replace(/,\s*([\]}])/g, '$1') 
        .replace(/}\s*}+/g, '}')        
        .replace(/]\s*]+/g, ']');        

    try {
        return JSON.parse(repaired);
    } catch {
        
        return extractAndMergeJSON(raw);
    }
}

function extractAndMergeJSON(raw: string): GraphData {
    const allNodes: Node[] = [];
    const allEdges: Edge[] = [];

    const nodeMatches = raw.matchAll(/"nodes"\s*:\s*\[([\s\S]*?)\]/g);
    for (const match of nodeMatches) {
        try {
            const nodesArray = JSON.parse(`[${match[1]}]`);
            allNodes.push(...nodesArray);
        } catch (e) {
            console.warn("Failed to parse node section:", match[0], e);
        }
    }


    const edgeMatches = raw.matchAll(/(?:"edges"\s*:\s*)?\[\s*\{"from"[\s\S]*?\}\s*\]/g);
    for (const match of edgeMatches) {
        try {
            let edgeStr = match[0];
           
            edgeStr = edgeStr.replace(/"edges"\s*:\s*/, '');
            const edgesArray = JSON.parse(edgeStr);
            allEdges.push(...edgesArray);
        } catch (e) {
            console.warn("Failed to parse edge section:", match[0], e);
        }
    }

    if (allNodes.length === 0) {
        throw new Error("No valid nodes found in response");
    }

    return {
        nodes: allNodes,
        edges: allEdges
    };
}

function jsonToMermaid(data: GraphData): string {
    let chart = "graph TD\n";

    const nodeMap = new Map<string, string>();

    
    for (const node of data.nodes) {
        if (!node.id || !node.label) continue;
        
        const safeId = normalizeId(node.id);
        
        if (!/^[a-z0-9_-]+$/.test(safeId)) {
            console.warn("Invalid node id found:", node.id, "normalized to:", safeId);
        }
        
        nodeMap.set(safeId, node.label);
        chart += `  ${safeId}["${node.label}"]\n`;
    }


    for (const edge of data.edges) {
        if (!edge.from || !edge.to) continue;
        const from = normalizeId(edge.from);
        const to = normalizeId(edge.to);

     
        if (!nodeMap.has(from)) {
            chart += `  ${from}["${from}"]\n`;
            nodeMap.set(from, from);
        }
        if (!nodeMap.has(to)) {
            chart += `  ${to}["${to}"]\n`;
            nodeMap.set(to, to);
        }

        chart += `  ${from} --> ${to}\n`;
    }

    return chart;
}

function normalizeId(id: string): string {
    return id
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')  
        .toLowerCase()
        .replace(/\s+/g, '_')                     
        .replace(/[^a-z0-9_-]/g, '');            
}