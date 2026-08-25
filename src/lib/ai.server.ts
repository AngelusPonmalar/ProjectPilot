import { planToolSchema, type GeneratedPlan } from "./plan-schema";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

export type PlanInput = {
  name: string;
  description: string;
  techPreference: string;
  projectType: string;
};

export async function generatePlanWithAI(input: PlanInput): Promise<GeneratedPlan> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI service is not configured.");

  const system =
    "You are a principal software architect. Given a short product idea, you produce a complete, " +
    "realistic and internally consistent software development plan. Requirement codes (FR-01...) " +
    "must be referenced consistently by modules. Endpoints, entities and tasks must match the " +
    "modules you define. Be concrete and specific to the idea — never generic filler.";

  const user = [
    `Project name: ${input.name}`,
    `Project type: ${input.projectType}`,
    `Technology preference: ${input.techPreference || "No strong preference"}`,
    `Idea description: ${input.description}`,
    "",
    "Produce the full structured development plan using the emit_development_plan tool.",
  ].join("\n");

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      tools: [{ type: "function", function: planToolSchema }],
      tool_choice: { type: "function", function: { name: planToolSchema.name } },
    }),
  });

  if (response.status === 429) {
    throw new Error("The AI service is busy right now. Please try again in a moment.");
  }
  if (response.status === 402) {
    throw new Error("AI credits are exhausted. Add credits in your workspace settings.");
  }
  if (!response.ok) {
    const detail = await response.text();
    console.error("AI gateway error", response.status, detail.slice(0, 500));
    throw new Error("The AI service could not generate a plan. Please try again.");
  }

  const payload = (await response.json()) as {
    choices?: { message?: { tool_calls?: { function?: { arguments?: string } }[] } }[];
  };
  const args = payload.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error("The AI service returned an unexpected response.");

  try {
    return JSON.parse(args) as GeneratedPlan;
  } catch {
    throw new Error("The AI service returned a malformed plan.");
  }
}

export type ModuleExplainInput = {
  projectName: string;
  projectDescription: string;
  moduleName: string;
  moduleDescription: string;
  category: string;
  requirements: string[];
  upstream: string[];
  downstream: string[];
  endpoints: string[];
  entities: string[];
  tasks: string[];
};

export async function explainModuleWithAI(input: ModuleExplainInput): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI service is not configured.");

  const system =
    "You are a senior software architect explaining one module of a system to a mixed audience of " +
    "developers and non-technical stakeholders. Answer in 3 short paragraphs max, plain language, " +
    "no markdown headings, no bullet lists. Cover: what the module does, how it connects to the " +
    "other modules named, and what needs to be built for it.";

  const user = [
    `Project: ${input.projectName} — ${input.projectDescription}`,
    `Module: ${input.moduleName} (${input.category})`,
    `Module description: ${input.moduleDescription}`,
    `Linked requirements: ${input.requirements.join(", ") || "none recorded"}`,
    `Depends on: ${input.upstream.join(", ") || "nothing upstream"}`,
    `Depended on by: ${input.downstream.join(", ") || "nothing downstream"}`,
    `APIs: ${input.endpoints.join(", ") || "none recorded"}`,
    `Database entities: ${input.entities.join(", ") || "none recorded"}`,
    `Tasks: ${input.tasks.join(", ") || "none recorded"}`,
  ].join("\n");

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (response.status === 429) throw new Error("The AI service is busy right now. Please try again in a moment.");
  if (response.status === 402) throw new Error("AI credits are exhausted. Add credits in your workspace settings.");
  if (!response.ok) throw new Error("The AI service could not explain this module. Please try again.");

  const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("The AI service returned an unexpected response.");
  return content;
}
