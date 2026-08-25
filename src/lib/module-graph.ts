// Browser-safe helpers that turn flat module rows into a layered architecture graph.
import type { Row } from "@/lib/workspace-queries";

export type ModuleCategory =
  | "Foundation"
  | "Core"
  | "Data"
  | "Integration"
  | "Insight"
  | "Operations";

export const MODULE_CATEGORIES: ModuleCategory[] = [
  "Foundation",
  "Core",
  "Data",
  "Integration",
  "Insight",
  "Operations",
];

const RULES: { category: ModuleCategory; words: string[] }[] = [
  {
    category: "Foundation",
    words: ["auth", "user", "account", "login", "identity", "role", "permission", "profile", "onboard"],
  },
  {
    category: "Integration",
    words: ["payment", "gateway", "billing", "checkout", "notification", "email", "sms", "webhook", "third", "integration", "external", "delivery"],
  },
  {
    category: "Data",
    words: ["catalog", "inventory", "storage", "database", "content", "media", "search", "index", "record"],
  },
  {
    category: "Insight",
    words: ["analytic", "report", "dashboard", "insight", "metric", "recommend", "ai", "stat"],
  },
  {
    category: "Operations",
    words: ["admin", "settings", "config", "moderation", "support", "audit", "log", "ops", "monitor"],
  },
];

const RANK: Record<ModuleCategory, number> = {
  Foundation: 0,
  Data: 1,
  Core: 2,
  Integration: 3,
  Insight: 4,
  Operations: 5,
};

export function categoryOf(row: Row): ModuleCategory {
  const text = `${String(row["name"] ?? "")} ${String(row["description"] ?? "")}`.toLowerCase();
  for (const rule of RULES) {
    if (rule.words.some((word) => text.includes(word))) return rule.category;
  }
  return "Core";
}

export function requirementsOf(row: Row): string[] {
  const value = row["related_requirements"];
  return Array.isArray(value) ? (value as string[]).map(String) : [];
}

export type GraphNode = {
  row: Row;
  id: string;
  name: string;
  description: string;
  status: string;
  category: ModuleCategory;
  requirements: string[];
  layer: number;
  x: number;
  y: number;
};

export type GraphEdge = { from: string; to: string };

export const NODE_W = 248;
export const NODE_H = 116;
const GAP_X = 56;
const GAP_Y = 92;
const PAD = 40;

export function buildGraph(rows: Row[]): {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
} {
  const base = rows.map((row, index) => {
    const category = categoryOf(row);
    return {
      row,
      id: row.id,
      name: String(row["name"] ?? "Untitled module"),
      description: String(row["description"] ?? ""),
      status: String(row["status"] ?? "Planned"),
      category,
      requirements: requirementsOf(row),
      order: index,
      rank: RANK[category],
    };
  });

  const layerKeys = [...new Set(base.map((n) => n.rank))].sort((a, b) => a - b);
  const layered = layerKeys.map((rank) =>
    base.filter((n) => n.rank === rank).sort((a, b) => a.order - b.order),
  );

  const maxPerLayer = Math.max(1, ...layered.map((l) => l.length));
  const width = PAD * 2 + maxPerLayer * NODE_W + (maxPerLayer - 1) * GAP_X;

  const nodes: GraphNode[] = [];
  layered.forEach((layerNodes, layer) => {
    const rowWidth = layerNodes.length * NODE_W + (layerNodes.length - 1) * GAP_X;
    const startX = (width - rowWidth) / 2;
    layerNodes.forEach((node, i) => {
      nodes.push({
        row: node.row,
        id: node.id,
        name: node.name,
        description: node.description,
        status: node.status,
        category: node.category,
        requirements: node.requirements,
        layer,
        x: startX + i * (NODE_W + GAP_X),
        y: PAD + layer * (NODE_H + GAP_Y),
      });
    });
  });

  const edges: GraphEdge[] = [];
  layered.forEach((layerNodes, layer) => {
    if (layer === 0) return;
    const previous = layered[layer - 1]!;
    for (const node of layerNodes) {
      const reqs = requirementsOf(node.row);
      const linked = previous.filter((p) =>
        requirementsOf(p.row).some((code) => reqs.includes(code)),
      );
      const sources = linked.length ? linked : [previous[0]!];
      for (const source of sources) edges.push({ from: source.row.id, to: node.row.id });
    }
  });

  const height = PAD * 2 + layered.length * NODE_H + Math.max(0, layered.length - 1) * GAP_Y;
  return { nodes, edges, width, height };
}

export function neighborsOf(edges: GraphEdge[], id: string) {
  return {
    upstream: edges.filter((e) => e.to === id).map((e) => e.from),
    downstream: edges.filter((e) => e.from === id).map((e) => e.to),
  };
}

export const CATEGORY_STYLE: Record<
  ModuleCategory,
  { accent: string; tint: string; icon: string }
> = {
  Foundation: { accent: "var(--node-foundation)", tint: "var(--node-foundation-tint)", icon: "ShieldCheck" },
  Core: { accent: "var(--node-core)", tint: "var(--node-core-tint)", icon: "Boxes" },
  Data: { accent: "var(--node-data)", tint: "var(--node-data-tint)", icon: "Database" },
  Integration: { accent: "var(--node-integration)", tint: "var(--node-integration-tint)", icon: "Plug" },
  Insight: { accent: "var(--node-insight)", tint: "var(--node-insight-tint)", icon: "LineChart" },
  Operations: { accent: "var(--node-operations)", tint: "var(--node-operations-tint)", icon: "Settings2" },
};
