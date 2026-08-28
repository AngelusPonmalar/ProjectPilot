// Builds each visualisation strictly from relationships that exist in the database.
import { depthLayers, type FlowItem, type FlowLink } from "@/lib/flow-graph";
import type { Row } from "@/lib/workspace-queries";

const str = (row: Row, key: string) => String(row[key] ?? "");
const list = (row: Row, key: string): string[] =>
  Array.isArray(row[key]) ? (row[key] as unknown[]).map(String).filter(Boolean) : [];

const norm = (value: string) => value.trim().toLowerCase();

export type GraphResult = { items: FlowItem[]; links: FlowLink[] };

export type PlanData = {
  requirements: Row[];
  stories: Row[];
  modules: Row[];
  screens: Row[];
  endpoints: Row[];
  tasks: Row[];
};

/** Requirement → story → module → screen → API → task, using real links only. */
export function buildTraceability(plan: PlanData): GraphResult {
  const items: FlowItem[] = [];
  const links: FlowLink[] = [];
  const push = (item: FlowItem) => {
    if (!items.some((i) => i.id === item.id)) items.push(item);
  };

  const reqCodes = new Map<string, Row>();
  for (const req of plan.requirements) {
    const code = norm(str(req, "code"));
    if (code) reqCodes.set(code, req);
    push({
      id: `req:${req.id}`,
      label: str(req, "title") || "Untitled requirement",
      sublabel: str(req, "status"),
      badge: str(req, "code"),
      tone: "foundation",
      kind: "requirement",
      layer: 0,
      payload: { row: req },
    });
  }

  const moduleByName = new Map<string, Row>();
  for (const mod of plan.modules) moduleByName.set(norm(str(mod, "name")), mod);

  // stories linked to requirements
  for (const story of plan.stories) {
    const codes = list(story, "related_requirements").map(norm);
    const linked = codes.filter((c) => reqCodes.has(c));
    if (!linked.length) continue;
    const id = `story:${story.id}`;
    push({
      id,
      label: str(story, "story").slice(0, 70) || "User story",
      sublabel: str(story, "persona"),
      badge: str(story, "code") || "STORY",
      tone: "core",
      kind: "story",
      layer: 1,
      payload: { row: story },
    });
    for (const code of linked) links.push({ from: `req:${reqCodes.get(code)!.id}`, to: id });
  }

  // modules linked to requirements
  for (const mod of plan.modules) {
    const codes = list(mod, "related_requirements").map(norm);
    const linked = codes.filter((c) => reqCodes.has(c));
    if (!linked.length) continue;
    const id = `module:${mod.id}`;
    push({
      id,
      label: str(mod, "name"),
      sublabel: str(mod, "status"),
      badge: "MODULE",
      tone: "insight",
      kind: "module",
      layer: 2,
      payload: { row: mod },
    });
    for (const code of linked) {
      links.push({ from: `req:${reqCodes.get(code)!.id}`, to: id });
      for (const story of plan.stories) {
        if (list(story, "related_requirements").map(norm).includes(code)) {
          links.push({ from: `story:${story.id}`, to: id });
        }
      }
    }
  }

  // screens linked by requirement code or module name
  for (const screen of plan.screens) {
    const codes = list(screen, "related_requirements").map(norm).filter((c) => reqCodes.has(c));
    const modName = norm(str(screen, "module"));
    const mod = modName ? moduleByName.get(modName) : undefined;
    const modLinked = mod && items.some((i) => i.id === `module:${mod.id}`);
    if (!codes.length && !modLinked) continue;
    const id = `screen:${screen.id}`;
    push({
      id,
      label: str(screen, "screen"),
      sublabel: str(screen, "module"),
      badge: "SCREEN",
      tone: "integration",
      kind: "screen",
      layer: 3,
      payload: { row: screen },
    });
    if (modLinked) links.push({ from: `module:${mod!.id}`, to: id });
    else for (const code of codes) links.push({ from: `req:${reqCodes.get(code)!.id}`, to: id });
  }

  // endpoints linked by module name
  for (const api of plan.endpoints) {
    const mod = moduleByName.get(norm(str(api, "module")));
    if (!mod || !items.some((i) => i.id === `module:${mod.id}`)) continue;
    const id = `api:${api.id}`;
    push({
      id,
      label: `${str(api, "method")} ${str(api, "path")}`,
      sublabel: str(api, "module"),
      badge: "API",
      tone: "data",
      kind: "api",
      layer: 4,
      payload: { row: api },
    });
    links.push({ from: `module:${mod.id}`, to: id });
  }

  // tasks linked by requirement code, story code or module name
  const storyByCode = new Map<string, Row>();
  for (const story of plan.stories) {
    const code = norm(str(story, "code"));
    if (code) storyByCode.set(code, story);
  }
  for (const task of plan.tasks) {
    const id = `task:${task.id}`;
    const sources: string[] = [];
    for (const code of list(task, "related_requirements").map(norm)) {
      if (reqCodes.has(code)) sources.push(`req:${reqCodes.get(code)!.id}`);
    }
    const storyCode = norm(str(task, "related_story"));
    if (storyCode && storyByCode.has(storyCode)) {
      const target = `story:${storyByCode.get(storyCode)!.id}`;
      if (items.some((i) => i.id === target)) sources.push(target);
    }
    const mod = moduleByName.get(norm(str(task, "module")));
    if (mod && items.some((i) => i.id === `module:${mod.id}`)) sources.push(`module:${mod.id}`);
    if (!sources.length) continue;
    push({
      id,
      label: str(task, "title"),
      sublabel: str(task, "status") || (task["completed"] ? "Done" : "To Do"),
      badge: "TASK",
      tone: "operations",
      kind: "task",
      layer: 5,
      payload: { row: task },
    });
    for (const source of sources) links.push({ from: source, to: id });
  }

  return { items, links };
}

/** Goal → epic → story → acceptance criteria → task. */
export function buildStoryMap(plan: PlanData): GraphResult {
  const items: FlowItem[] = [];
  const links: FlowLink[] = [];
  const seen = new Set<string>();
  const push = (item: FlowItem) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    items.push(item);
  };

  for (const story of plan.stories) {
    const goal = str(story, "goal") || str(story, "persona") || "Product goals";
    const epic = str(story, "epic") || str(story, "module") || "General";
    const goalId = `goal:${norm(goal)}`;
    const epicId = `epic:${norm(goal)}|${norm(epic)}`;
    const storyId = `story:${story.id}`;

    push({ id: goalId, label: goal, badge: "GOAL", tone: "foundation", kind: "goal", layer: 0 });
    push({ id: epicId, label: epic, badge: "EPIC", tone: "core", kind: "epic", layer: 1 });
    push({
      id: storyId,
      label: str(story, "story").slice(0, 70) || "User story",
      sublabel: str(story, "priority"),
      badge: str(story, "code") || "STORY",
      tone: "insight",
      kind: "story",
      layer: 2,
      payload: { row: story },
    });
    links.push({ from: goalId, to: epicId });
    links.push({ from: epicId, to: storyId });

    list(story, "acceptance_criteria").forEach((criterion, i) => {
      const id = `ac:${story.id}:${i}`;
      push({
        id,
        label: criterion.slice(0, 60),
        badge: "CRITERIA",
        tone: "data",
        kind: "criteria",
        layer: 3,
        payload: { text: criterion, row: story },
      });
      links.push({ from: storyId, to: id });
    });

    const code = norm(str(story, "code"));
    const modName = norm(str(story, "module"));
    for (const task of plan.tasks) {
      const matchesStory = code && norm(str(task, "related_story")) === code;
      const matchesModule = modName && norm(str(task, "module")) === modName;
      if (!matchesStory && !matchesModule) continue;
      const id = `task:${task.id}`;
      push({
        id,
        label: str(task, "title"),
        sublabel: str(task, "status"),
        badge: "TASK",
        tone: "operations",
        kind: "task",
        layer: 4,
        payload: { row: task },
      });
      links.push({ from: storyId, to: id });
    }
  }

  return { items, links };
}

/** Screen navigation graph built from each screen's `next_screens`. */
export function buildScreenFlow(plan: PlanData): GraphResult {
  const byName = new Map<string, Row>();
  for (const screen of plan.screens) byName.set(norm(str(screen, "screen")), screen);

  const links: FlowLink[] = [];
  for (const screen of plan.screens) {
    for (const next of list(screen, "next_screens")) {
      const target = byName.get(norm(next));
      if (target && target.id !== screen.id) {
        links.push({ from: `screen:${screen.id}`, to: `screen:${target.id}` });
      }
    }
  }

  const ids = plan.screens.map((s) => `screen:${s.id}`);
  const depth = depthLayers(ids, links);
  const items: FlowItem[] = plan.screens.map((screen) => ({
    id: `screen:${screen.id}`,
    label: str(screen, "screen"),
    sublabel: str(screen, "module") || str(screen, "purpose").slice(0, 40),
    badge: "SCREEN",
    tone: "integration",
    kind: "screen",
    layer: depth[`screen:${screen.id}`] ?? 0,
    payload: { row: screen },
  }));

  return { items, links };
}

export type ArchComponent = {
  id: string;
  name: string;
  kind?: string;
  tech?: string;
  description?: string;
};

const KIND_TONE: Record<string, FlowItem["tone"]> = {
  frontend: "foundation",
  ui: "foundation",
  api: "core",
  backend: "insight",
  service: "insight",
  database: "data",
  storage: "data",
  ai: "integration",
  external: "integration",
  auth: "operations",
  infrastructure: "operations",
};

export function archComponents(arch: Row | undefined): {
  components: ArchComponent[];
  connections: FlowLink[];
  derived: boolean;
} {
  if (!arch) return { components: [], connections: [], derived: false };

  const raw = Array.isArray(arch["components"]) ? (arch["components"] as ArchComponent[]) : [];
  if (raw.length) {
    const connections = Array.isArray(arch["connections"])
      ? (arch["connections"] as FlowLink[]).filter((c) => c && c.from && c.to)
      : [];
    return { components: raw, connections, derived: false };
  }

  // Fall back to the generated layer stack — a real, ordered relationship.
  const layers = Array.isArray(arch["layers"])
    ? (arch["layers"] as { name: string; responsibility?: string; tech?: string }[])
    : [];
  const components: ArchComponent[] = layers.map((layer, i) => ({
    id: `layer-${i}`,
    name: layer.name,
    kind: guessKind(layer.name),
    tech: layer.tech ?? "",
    description: layer.responsibility ?? "",
  }));
  const connections: FlowLink[] = components
    .slice(0, -1)
    .map((c, i) => ({ from: c.id, to: components[i + 1]!.id }));
  return { components, connections, derived: true };
}

function guessKind(name: string) {
  const n = norm(name);
  if (n.includes("front") || n.includes("client") || n.includes("ui")) return "frontend";
  if (n.includes("api") || n.includes("gateway")) return "api";
  if (n.includes("data") || n.includes("db") || n.includes("persist")) return "database";
  if (n.includes("ai") || n.includes("model")) return "ai";
  if (n.includes("auth") || n.includes("security")) return "auth";
  if (n.includes("storage") || n.includes("file")) return "storage";
  return "service";
}

export function buildArchitecture(arch: Row | undefined): GraphResult & { derived: boolean } {
  const { components, connections, derived } = archComponents(arch);
  const links = connections.map((c) => ({ from: `cmp:${c.from}`, to: `cmp:${c.to}` }));
  const depth = depthLayers(
    components.map((c) => `cmp:${c.id}`),
    links,
  );
  const items: FlowItem[] = components.map((c) => ({
    id: `cmp:${c.id}`,
    label: c.name,
    sublabel: c.tech || c.description?.slice(0, 40),
    badge: (c.kind ?? "component").toUpperCase(),
    tone: KIND_TONE[norm(c.kind ?? "")] ?? "core",
    kind: "component",
    layer: depth[`cmp:${c.id}`] ?? 0,
    payload: { component: c },
  }));
  return { items, links, derived };
}

export const ARCH_KINDS = [
  "frontend",
  "api",
  "backend",
  "service",
  "database",
  "storage",
  "ai",
  "auth",
  "external",
  "infrastructure",
] as const;
