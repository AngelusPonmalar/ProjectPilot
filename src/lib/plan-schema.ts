// Browser-safe shared types + JSON schema for the AI-generated development plan.

export type GeneratedPlan = {
  overview: string;
  user_types: string[];
  requirements: { code: string; title: string; description: string; priority: string }[];
  user_stories: { code: string; story: string; persona: string; priority: string }[];
  modules: { name: string; description: string; related_requirements: string[] }[];
  ui_recommendations: { screen: string; purpose: string }[];
  architecture: { layers: { name: string; responsibility: string; tech: string }[]; explanation: string };
  database_entities: { name: string; fields: string[]; relationships: string[] }[];
  api_endpoints: { method: string; path: string; description: string; module: string }[];
  tasks: { title: string; description: string; module: string }[];
};

export const PRIORITIES = ["High", "Medium", "Low"] as const;
export const REQUIREMENT_STATUSES = ["Draft", "Approved", "In Progress", "Done"] as const;
export const STORY_STATUSES = ["To Do", "In Progress", "Done"] as const;
export const MODULE_STATUSES = ["Planned", "In Progress", "Done"] as const;
export const PHASE_STATUSES = ["Not Started", "In Progress", "Completed"] as const;
export const PROJECT_TYPES = [
  "Web Application",
  "Mobile Application",
  "API / Backend Service",
  "Desktop Application",
  "Data / AI Platform",
] as const;

export const SDLC_PHASES = [
  "Requirements",
  "Design",
  "Development",
  "Testing",
  "Deployment",
] as const;

export const planToolSchema = {
  name: "emit_development_plan",
  description: "Return a complete structured software development plan for the described idea.",
  parameters: {
    type: "object",
    properties: {
      overview: { type: "string", description: "2-4 sentence professional summary of the product." },
      user_types: { type: "array", items: { type: "string" }, description: "Distinct user roles." },
      requirements: {
        type: "array",
        description: "8-14 functional requirements.",
        items: {
          type: "object",
          properties: {
            code: { type: "string", description: "Identifier like FR-01." },
            title: { type: "string" },
            description: { type: "string" },
            priority: { type: "string", enum: ["High", "Medium", "Low"] },
          },
          required: ["code", "title", "description", "priority"],
        },
      },
      user_stories: {
        type: "array",
        description: "8-14 user stories in 'As a ... I want ... so that ...' form.",
        items: {
          type: "object",
          properties: {
            code: { type: "string", description: "Identifier like US-01." },
            story: { type: "string" },
            persona: { type: "string" },
            priority: { type: "string", enum: ["High", "Medium", "Low"] },
          },
          required: ["code", "story", "persona", "priority"],
        },
      },
      modules: {
        type: "array",
        description: "4-8 functional modules.",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            related_requirements: { type: "array", items: { type: "string" } },
          },
          required: ["name", "description", "related_requirements"],
        },
      },
      ui_recommendations: {
        type: "array",
        description: "5-10 screens to build.",
        items: {
          type: "object",
          properties: { screen: { type: "string" }, purpose: { type: "string" } },
          required: ["screen", "purpose"],
        },
      },
      architecture: {
        type: "object",
        properties: {
          layers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                responsibility: { type: "string" },
                tech: { type: "string" },
              },
              required: ["name", "responsibility", "tech"],
            },
          },
          explanation: { type: "string" },
        },
        required: ["layers", "explanation"],
      },
      database_entities: {
        type: "array",
        description: "4-10 entities.",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            fields: { type: "array", items: { type: "string" }, description: "e.g. 'email: string (unique)'" },
            relationships: { type: "array", items: { type: "string" } },
          },
          required: ["name", "fields", "relationships"],
        },
      },
      api_endpoints: {
        type: "array",
        description: "8-16 endpoints.",
        items: {
          type: "object",
          properties: {
            method: { type: "string", enum: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
            path: { type: "string" },
            description: { type: "string" },
            module: { type: "string" },
          },
          required: ["method", "path", "description", "module"],
        },
      },
      tasks: {
        type: "array",
        description: "10-20 concrete implementation tasks in build order.",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            module: { type: "string" },
          },
          required: ["title", "description", "module"],
        },
      },
    },
    required: [
      "overview",
      "user_types",
      "requirements",
      "user_stories",
      "modules",
      "ui_recommendations",
      "architecture",
      "database_entities",
      "api_endpoints",
      "tasks",
    ],
  },
} as const;
