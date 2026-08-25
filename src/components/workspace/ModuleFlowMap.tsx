import { useCallback, useEffect, useRef, useState } from "react";
import {
  Boxes,
  Database,
  LineChart,
  Maximize2,
  Minus,
  Plug,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MODULE_STATUSES } from "@/lib/plan-schema";
import {
  CATEGORY_STYLE,
  MODULE_CATEGORIES,
  NODE_H,
  NODE_W,
  neighborsOf,
  type GraphEdge,
  type GraphNode,
} from "@/lib/module-graph";

const ICONS = { ShieldCheck, Boxes, Database, Plug, LineChart, Settings2 } as const;

type Props = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function ModuleFlowMap({ nodes, edges, width, height, selectedId, onSelect }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");

  const fit = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const scale = Math.min(1, (el.clientWidth - 24) / width, (el.clientHeight - 24) / height);
    setZoom(Math.max(0.35, scale));
    setOffset({ x: 0, y: 0 });
  }, [width, height]);

  useEffect(() => {
    fit();
  }, [fit]);

  const related = selectedId ? neighborsOf(edges, selectedId) : { upstream: [], downstream: [] };
  const connected = new Set([...related.upstream, ...related.downstream]);

  const query = search.trim().toLowerCase();
  const matches = (node: GraphNode) => {
    if (status !== "all" && node.status !== status) return false;
    if (category !== "all" && node.category !== category) return false;
    if (query && !`${node.name} ${node.description}`.toLowerCase().includes(query)) return false;
    return true;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-node]")) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    setOffset({ x: drag.ox + (e.clientX - drag.x), y: drag.oy + (e.clientY - drag.y) });
  };

  return (
    <div className="card-elevated overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <div className="relative min-w-[180px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules…"
            className="h-9 pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {MODULE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {MODULE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          {[
            { icon: Minus, label: "Zoom out", run: () => setZoom((z) => Math.max(0.35, z - 0.15)) },
            { icon: Plus, label: "Zoom in", run: () => setZoom((z) => Math.min(1.8, z + 0.15)) },
            { icon: Maximize2, label: "Fit to screen", run: fit },
            {
              icon: RotateCcw,
              label: "Reset view",
              run: () => {
                setZoom(1);
                setOffset({ x: 0, y: 0 });
              },
            },
          ].map(({ icon: Icon, label, run }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="size-9" onClick={run} aria-label={label}>
                  <Icon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => setDrag(null)}
        onPointerLeave={() => setDrag(null)}
        className={`flow-canvas relative h-[min(70vh,620px)] touch-none overflow-hidden ${
          drag ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <div
          className="absolute left-1/2 top-0 origin-top transition-transform duration-200 ease-out"
          style={{
            width,
            height,
            transform: `translate(calc(-50% + ${offset.x}px), ${offset.y}px) scale(${zoom})`,
          }}
        >
          <svg width={width} height={height} className="absolute inset-0 overflow-visible">
            <defs>
              <marker id="flow-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
                <path d="M0,0 L9,4.5 L0,9 z" fill="var(--edge-line)" />
              </marker>
              <marker id="flow-arrow-active" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
                <path d="M0,0 L9,4.5 L0,9 z" fill="var(--primary)" />
              </marker>
            </defs>
            {edges.map((edge) => {
              const from = nodes.find((n) => n.id === edge.from);
              const to = nodes.find((n) => n.id === edge.to);
              if (!from || !to) return null;
              const x1 = from.x + NODE_W / 2;
              const y1 = from.y + NODE_H;
              const x2 = to.x + NODE_W / 2;
              const y2 = to.y - 10;
              const mid = (y1 + y2) / 2;
              const active =
                !!selectedId && (edge.from === selectedId || edge.to === selectedId);
              return (
                <path
                  key={`${edge.from}-${edge.to}`}
                  d={`M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`}
                  fill="none"
                  stroke={active ? "var(--primary)" : "var(--edge-line)"}
                  strokeWidth={active ? 2.2 : 1.4}
                  strokeDasharray={active ? "0" : "5 5"}
                  markerEnd={`url(#${active ? "flow-arrow-active" : "flow-arrow"})`}
                  className="transition-all duration-300"
                  opacity={selectedId && !active ? 0.35 : 1}
                />
              );
            })}
          </svg>

          {nodes.map((node) => {
            const style = CATEGORY_STYLE[node.category];
            const Icon = ICONS[style.icon as keyof typeof ICONS];
            const isSelected = node.id === selectedId;
            const isConnected = connected.has(node.id);
            const dim = !matches(node) || (!!selectedId && !isSelected && !isConnected);
            return (
              <button
                key={node.id}
                data-node
                onClick={() => onSelect(node.id)}
                style={{
                  left: node.x,
                  top: node.y,
                  width: NODE_W,
                  minHeight: NODE_H,
                  borderColor: isSelected || isConnected ? style.accent : undefined,
                  boxShadow: isSelected ? `0 0 0 3px color-mix(in oklab, ${style.accent} 22%, transparent)` : undefined,
                }}
                className={`card-elevated absolute overflow-hidden p-0 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] ${
                  dim ? "opacity-35" : "opacity-100"
                }`}
              >
                <span className="block h-1 w-full" style={{ background: style.accent }} />
                <span className="block p-4">
                  <span className="flex items-center gap-2">
                    <span
                      className="flex size-7 items-center justify-center rounded-lg"
                      style={{ background: `color-mix(in oklab, ${style.accent} 16%, transparent)` }}
                    >
                      <Icon className="size-4" style={{ color: style.accent }} />
                    </span>
                    <span className="truncate text-sm font-semibold">{node.name}</span>
                  </span>
                  <span className="mt-2 line-clamp-2 block text-xs text-muted-foreground">
                    {node.description}
                  </span>
                  <span className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span
                      className="rounded-full px-2 py-0.5 font-medium"
                      style={{
                        background: `color-mix(in oklab, ${style.accent} 12%, transparent)`,
                        color: style.accent,
                      }}
                    >
                      {node.category}
                    </span>
                    <span>{node.requirements.length} req</span>
                    <span aria-hidden>·</span>
                    <span>{node.status}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur">
          Drag to pan · click a module for details
        </p>
      </div>
    </div>
  );
}
