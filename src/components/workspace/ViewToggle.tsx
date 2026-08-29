import { List, Workflow } from "lucide-react";

export type WorkspaceView = "flow" | "list";

export function ViewToggle({
  value,
  onChange,
  flowLabel = "Normal View",
}: {
  value: WorkspaceView;
  onChange: (value: WorkspaceView) => void;
  /** Tooltip describing the normal visualisation, e.g. "Traceability flow". */
  flowLabel?: string;
}) {
  const base =
    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors whitespace-nowrap";
  return (
    <div className="inline-flex rounded-lg border border-border bg-muted/50 p-1">
      <button
        type="button"
        onClick={() => onChange("flow")}
        aria-pressed={value === "flow"}
        title={flowLabel}
        className={`${base} ${value === "flow" ? "bg-card font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
      >
        <Workflow className="size-4" />
        Normal View
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        aria-pressed={value === "list"}
        className={`${base} ${value === "list" ? "bg-card font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
      >
        <List className="size-4" />
        List view
      </button>
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
