// Browser-safe layered layout helpers shared by every project visualisation.

export type Tone =
  | "foundation"
  | "core"
  | "data"
  | "integration"
  | "insight"
  | "operations";

export type FlowItem = {
  id: string;
  label: string;
  sublabel?: string;
  badge?: string;
  tone: Tone;
  /** Domain kind, e.g. "requirement" | "story" | "screen". */
  kind: string;
  /** Vertical band. */
  layer: number;
  /** Arbitrary payload surfaced in the detail drawer. */
  payload?: Record<string, unknown>;
};

export type FlowLink = { from: string; to: string };

export const NODE_W = 232;
export const NODE_H = 78;
const GAP_X = 40;
const GAP_Y = 96;

export type PositionedItem = FlowItem & { x: number; y: number };

export const MAX_PER_ROW = 6;

export function layoutLayered(items: FlowItem[], links: FlowLink[]) {
  const layers = [...new Set(items.map((i) => i.layer))].sort((a, b) => a - b);
  const byLayer = layers.map((l) => items.filter((i) => i.layer === l));

  // Wide layers wrap into several rows so the diagram stays readable.
  const rows: FlowItem[][] = [];
  for (const group of byLayer) {
    for (let i = 0; i < group.length; i += MAX_PER_ROW) {
      rows.push(group.slice(i, i + MAX_PER_ROW));
    }
  }

  const widest = Math.max(1, ...rows.map((r) => r.length));
  const width = widest * NODE_W + (widest - 1) * GAP_X;

  const positioned: PositionedItem[] = [];
  rows.forEach((group, row) => {
    const rowWidth = group.length * NODE_W + (group.length - 1) * GAP_X;
    const startX = (width - rowWidth) / 2;
    group.forEach((item, i) => {
      positioned.push({
        ...item,
        x: startX + i * (NODE_W + GAP_X),
        y: row * (NODE_H + GAP_Y),
      });
    });
  });

  const ids = new Set(items.map((i) => i.id));
  const edges = links.filter((l) => ids.has(l.from) && ids.has(l.to) && l.from !== l.to);
  return { nodes: positioned, edges };
}

/** Assigns a depth to every node based on incoming edges (roots first). */
export function depthLayers(ids: string[], links: FlowLink[]): Record<string, number> {
  const incoming = new Map<string, string[]>();
  for (const id of ids) incoming.set(id, []);
  for (const link of links) {
    if (incoming.has(link.to) && incoming.has(link.from)) incoming.get(link.to)!.push(link.from);
  }
  const depth: Record<string, number> = {};
  const visit = (id: string, seen: Set<string>): number => {
    if (depth[id] !== undefined) return depth[id]!;
    if (seen.has(id)) return 0;
    seen.add(id);
    const parents = incoming.get(id) ?? [];
    const value = parents.length ? Math.max(...parents.map((p) => visit(p, seen) + 1)) : 0;
    depth[id] = value;
    return value;
  };
  for (const id of ids) visit(id, new Set());
  return depth;
}

export function neighborsOf(links: FlowLink[], id: string) {
  const up = links.filter((l) => l.to === id).map((l) => l.from);
  const down = links.filter((l) => l.from === id).map((l) => l.to);
  return { up, down, all: new Set([...up, ...down, id]) };
}

export const TONE_VAR: Record<Tone, string> = {
  foundation: "var(--node-foundation)",
  core: "var(--node-core)",
  data: "var(--node-data)",
  integration: "var(--node-integration)",
  insight: "var(--node-insight)",
  operations: "var(--node-operations)",
};
