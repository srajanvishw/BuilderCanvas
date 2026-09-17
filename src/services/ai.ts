import { GraphNode, GraphEdge } from "../types/graph";

export type AITaskSuggestion = {
  title: string;
};

export type AIBreakdownResult = {
  success: boolean;
  tasks?: AITaskSuggestion[];
  error?: string;
};

const MAX_TASKS = 10;

const SYSTEM_PROMPT = `You are an expert software architect helping developers break down implementation tasks.

Given information about a component in a software architecture, generate a list of specific, actionable implementation tasks.

Rules:
- Return ONLY valid JSON matching the schema
- Each task title should be concise (5-10 words)
- Tasks should be specific to the component type and context
- Order tasks logically (setup before implementation before testing)
- Generate 3-8 tasks, never more than ${MAX_TASKS}
- Consider the component's connections when relevant
- Do not include markdown formatting or code blocks, just raw JSON`;

function buildPrompt(
  node: GraphNode,
  connectedNodes: { label: string; type: string; direction: "incoming" | "outgoing" }[]
): string {
  const connections = connectedNodes.length > 0
    ? connectedNodes.map((n) => `- ${n.label} (${n.type}, ${n.direction})`).join("\n")
    : "None";

  return `Generate implementation tasks for this software component:

Label: ${node.label}
Type: ${node.type}
${node.description ? `Description: ${node.description}` : ""}

Connections:
${connections}

Return JSON with this exact shape:
{
  "tasks": [
    { "title": "Task description here" }
  ]
}`;
}

export async function generateTaskBreakdown(
  node: GraphNode,
  edges: GraphEdge[],
  nodes: GraphNode[]
): Promise<AIBreakdownResult> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey === "YOUR_API_KEY") {
    return {
      success: false,
      error: "API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.",
    };
  }

  const nodesMap = new Map(nodes.map((n) => [n.id, n]));

  const connectedNodes: { label: string; type: string; direction: "incoming" | "outgoing" }[] = [];

  for (const edge of edges) {
    if (edge.source === node.id) {
      const target = nodesMap.get(edge.target);
      if (target) {
        connectedNodes.push({
          label: target.label,
          type: target.type,
          direction: "outgoing",
        });
      }
    }
    if (edge.target === node.id) {
      const source = nodesMap.get(edge.source);
      if (source) {
        connectedNodes.push({
          label: source.label,
          type: source.type,
          direction: "incoming",
        });
      }
    }
  }

  const prompt = buildPrompt(node, connectedNodes);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: "Invalid API key. Please check your VITE_OPENAI_API_KEY.",
        };
      }
      if (response.status === 429) {
        return {
          success: false,
          error: "Rate limit exceeded. Please wait a moment and try again.",
        };
      }
      return {
        success: false,
        error: `API request failed (${response.status}). Please try again.`,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        error: "Empty response from AI. Please try again.",
      };
    }

    let parsed: { tasks: AITaskSuggestion[] };
    try {
      parsed = JSON.parse(content);
    } catch {
      return {
        success: false,
        error: "Invalid JSON response from AI. Please try again.",
      };
    }

    if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
      return {
        success: false,
        error: "Response missing tasks array. Please try again.",
      };
    }

    const validTasks = parsed.tasks
      .filter((t): t is AITaskSuggestion => typeof t?.title === "string" && t.title.trim().length > 0)
      .slice(0, MAX_TASKS);

    if (validTasks.length === 0) {
      return {
        success: false,
        error: "No valid tasks generated. Please try again.",
      };
    }

    return {
      success: true,
      tasks: validTasks,
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        success: false,
        error: "Network error. Please check your connection and try again.",
      };
    }
    return {
      success: false,
      error: "Unexpected error occurred. Please try again.",
    };
  }
}
