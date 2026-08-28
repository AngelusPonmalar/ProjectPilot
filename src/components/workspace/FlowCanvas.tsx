import "@xyflow/react/dist/style.css";

import { useEffect, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { Maximize2, Search, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  layoutLayered,
  neighborsOf,
  NODE_H,
  NODE_W,
  TONE_VAR,
  type FlowItem,
  type FlowLink,
} from "@/lib/flow-graph";

type NodePayload = {
  label: string;
  sublabel?: string;
  badge?: string;
  tone: string;
  dim: boolean;
  active: boolean;
};

function FlowNode({ data }: NodeProps) {
  const d = data as unknown as NodePayload;
  const accent = TONE_VAR[d.tone as keyof typeof TONE_VAR] ?? TONE_VAR.core;
  return (
    <div
      className="flex h-full w-full flex-col justify-center rounded-xl border bg-card px-3.5 py-2.5 shadow-sm transition-all"
      style={{
        width: NODE_W,
        height: NODE_H,
        borderColor: d.active ? accent : "var(--border)",
        boxShadow: d.active ? `0 0 0 2px color-mix(in oklab, ${accent} 40%, transparent)` : undefined,
        opacity: d.dim ? 0.28 : 1,
      }}
    >
      <Handle type="target" position={Position.Top} className="!size-1.5 !border-0 !bg-muted-foreground" />
      <div className="flex items-center gap-1.5">
        <span className="size-2 shrink-0 rounded-full" style={{ background: accent }} />
        {d.badge ? (
          <span className="truncate font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
            {d.badge}
          </span>
        ) : null}
      </div>
      <p className="mt-0.5 truncate text-[13px] font-semibold leading-tight">{d.label}</p>
      {d.sublabel ? (
        <p className="truncate text-[11px] text-muted-foreground">{d.sublabel}</p>
      ) : null}
      <Handle type="source" position={Position.Bottom} className="!size-1.5 !border-0 !bg-muted-foreground" />
    </div>
  );
}

const nodeTypes = { flowNode: FlowNode };

type Props = {
  items: FlowItem[];
  links: FlowLink[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  emptyLabel?: string;
  toolbar?: React.ReactNode;
  height?: number;
};

function Canvas({ items, links, selectedId, onSelect, emptyLabel, toolbar, height = 560 }: Props) {
  const [query, setQuery] = useState("");
  const [layoutSeed, setLayoutSeed] = useState(0);
  const flow = useReactFlow();

  const { nodes: positioned, edges: validLinks } = useMemo(
    () => layoutLayered(items, links),
    [items, links],
  );

  const highlight = useMemo(
    () => (selectedId ? neighborsOf(validLinks, selectedId).all : null),
    [validLinks, selectedId],
  );

  const q = query.trim().toLowerCase();
  const matches = useMemo(
    () =>
      q
        ? new Set(
            positioned
              .filter((n) =>
                `${n.label} ${n.sublabel ?? ""} ${n.badge ?? ""}`.toLowerCase().includes(q),
              )
              .map((n) => n.id),
          )
        : null,
    [positioned, q],
  );

  const nodes: Node[] = useMemo(
    () =>
      positioned.map((n) => {
        const dim =
          (matches ? !matches.has(n.id) : false) ||
          (highlight && !matches ? !highlight.has(n.id) : false);
        return {
          id: n.id,
          type: "flowNode",
          position: { x: n.x, y: n.y },
          data: {
            label: n.label,
            sublabel: n.sublabel,
            badge: n.badge,
            tone: n.tone,
            dim,
            active: n.id === selectedId || (matches?.has(n.id) ?? false),
          },
          style: { width: NODE_W, height: NODE_H },
          draggable: true,
        } satisfies Node;
      }),
    [positioned, matches, highlight, selectedId],
  );

  const edges: Edge[] = useMemo(
    () =>
      validLinks.map((l, i) => {
        const active = highlight ? highlight.has(l.from) && highlight.has(l.to) : false;
        return {
          id: `${l.from}->${l.to}-${i}`,
          source: l.from,
          target: l.to,
          type: "smoothstep",
          animated: active,
          style: {
            stroke: active ? "var(--primary)" : "var(--border)",
            strokeWidth: active ? 2 : 1.5,
            opacity: highlight && !active ? 0.25 : 1,
          },
          markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
        } satisfies Edge;
      }),
    [validLinks, highlight],
  );

  useEffect(() => {
    const id = setTimeout(() => flow.fitView({ padding: 0.2, duration: 300 }), 60);
    return () => clearTimeout(id);
  }, [flow, layoutSeed, items.length]);

  if (!items.length) {
    return (
      <div className="card-elevated px-6 py-20 text-center text-sm text-muted-foreground">
        {emptyLabel ?? "Nothing to visualise yet."}
      </div>
    );
  }

  return (
    <div className="card-elevated overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nodes…"
            className="h-9 pl-9"
          />
        </div>
        {toolbar}
        <Button
          size="sm"
          variant="outline"
          onClick={() => flow.fitView({ padding: 0.2, duration: 300 })}
        >
          <Maximize2 className="size-4" />
          Fit
        </Button>
        <Button size="sm" variant="outline" onClick={() => setLayoutSeed((s) => s + 1)}>
          <Wand2 className="size-4" />
          Auto layout
        </Button>
      </div>
      <div style={{ height }} className="bg-muted/25">
        <ReactFlow
          key={layoutSeed}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => onSelect(node.id)}
          onPaneClick={() => onSelect(null)}
          minZoom={0.15}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1} />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable className="!bg-card" />
        </ReactFlow>
      </div>
    </div>
  );
}

export function FlowCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
}
