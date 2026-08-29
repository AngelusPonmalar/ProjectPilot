import { useState } from "react";
import { Plus, Trash2, Unlink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailDrawer, type DetailField } from "@/components/workspace/DetailDrawer";
import { FlowCanvas } from "@/components/workspace/FlowCanvas";
import { SectionHeader, ViewToggle } from "@/components/workspace/ViewToggle";
import { useWorkspaceView } from "@/lib/use-workspace-view";
import {
  ARCH_KINDS,
  archComponents,
  buildArchitecture,
  type ArchComponent,
} from "@/lib/project-graphs";
import type { FlowLink } from "@/lib/flow-graph";
import { useRows, useSaveRow, type Row } from "@/lib/workspace-queries";

export function ArchitectureSection({ projectId }: { projectId: string }) {
  const [view, setView] = useWorkspaceView("architecture");
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<ArchComponent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkFrom, setLinkFrom] = useState("");
  const [linkTo, setLinkTo] = useState("");

  const { data, isLoading } = useRows("architecture", projectId, "created_at");
  const save = useSaveRow("architecture", projectId);
  const arch = data?.[0] as Row | undefined;

  const { components, connections, derived } = archComponents(arch);
  const graph = buildArchitecture(arch);
  const node = graph.items.find((i) => i.id === selected);
  const component = node?.payload?.["component"] as ArchComponent | undefined;

  const persist = (nextComponents: ArchComponent[], nextConnections: FlowLink[]) => {
    const payload = { components: nextComponents, connections: nextConnections };
    save.mutate(arch ? { id: arch.id, ...payload } : { ...payload, layers: [], explanation: "" });
  };

  /** Materialises the derived layer chain so it becomes editable. */
  const ensureEditable = () => ({ components: [...components], connections: [...connections] });

  const upsert = (next: ArchComponent) => {
    const base = ensureEditable();
    const index = base.components.findIndex((c) => c.id === next.id);
    if (index >= 0) base.components[index] = next;
    else base.components.push(next);
    persist(base.components, base.connections);
  };

  const removeComponent = (id: string) => {
    const base = ensureEditable();
    persist(
      base.components.filter((c) => c.id !== id),
      base.connections.filter((c) => c.from !== id && c.to !== id),
    );
  };

  const connect = () => {
    if (!linkFrom || !linkTo || linkFrom === linkTo) return;
    const base = ensureEditable();
    if (base.connections.some((c) => c.from === linkFrom && c.to === linkTo)) return;
    persist(base.components, [...base.connections, { from: linkFrom, to: linkTo }]);
    setLinkFrom("");
    setLinkTo("");
  };

  const disconnect = (link: FlowLink) => {
    const base = ensureEditable();
    persist(
      base.components,
      base.connections.filter((c) => !(c.from === link.from && c.to === link.to)),
    );
  };

  const nameOf = (id: string) => components.find((c) => c.id === id)?.name ?? id;

  const fields: DetailField[] = component
    ? [
        { label: "Type", values: [component.kind ?? "component"] },
        { label: "Technology", values: [component.tech ?? ""].filter(Boolean) },
        { label: "Responsibility", values: [component.description ?? ""].filter(Boolean) },
        {
          label: "Sends to",
          values: connections.filter((c) => c.from === component.id).map((c) => nameOf(c.to)),
        },
        {
          label: "Receives from",
          values: connections.filter((c) => c.to === component.id).map((c) => nameOf(c.from)),
        },
      ]
    : [];

  const openEditor = (item: ArchComponent | null) => {
    setEditing(
      item ?? {
        id: `cmp-${Date.now().toString(36)}`,
        name: "",
        kind: "service",
        tech: "",
        description: "",
      },
    );
    setDialogOpen(true);
  };

  return (
    <section>
      <SectionHeader
        title="Architecture"
        description="The real system structure: components and how they talk to each other."
      >
        <div className="flex flex-wrap items-center gap-2">
          <ViewToggle value={view} onChange={setView} flowLabel="Architecture diagram" />
          <Button size="sm" onClick={() => openEditor(null)}>
            <Plus className="size-4" />
            Add component
          </Button>
        </div>
      </SectionHeader>

      {isLoading ? (
        <Skeleton className="mt-6 h-96 rounded-xl" />
      ) : view === "flow" ? (
        <div className="mt-6">
          <FlowCanvas
            items={graph.items}
            links={graph.links}
            selectedId={selected}
            onSelect={setSelected}
            emptyLabel="No architecture yet — add a component or generate the plan."
          />
          {derived && graph.items.length > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              Showing the generated layer stack. Editing anything here converts it into fully
              editable components.
            </p>
          )}
          <DetailDrawer
            open={Boolean(component)}
            onOpenChange={(open) => !open && setSelected(null)}
            kind="component"
            title={component?.name ?? ""}
            subtitle={component?.tech || undefined}
            fields={fields}
            footer={
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    if (component) openEditor(component);
                    setSelected(null);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-destructive"
                  onClick={() => {
                    if (component) removeComponent(component.id);
                    setSelected(null);
                  }}
                >
                  Delete
                </Button>
              </div>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            {!components.length ? (
              <div className="card-elevated px-6 py-14 text-center text-sm text-muted-foreground">
                No components yet.
              </div>
            ) : (
              components.map((c) => (
                <div key={c.id} className="card-elevated flex items-start gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold">{c.name}</h3>
                      <Badge variant="secondary" className="font-normal">
                        {c.kind ?? "component"}
                      </Badge>
                      {c.tech && (
                        <Badge variant="outline" className="font-normal">
                          {c.tech}
                        </Badge>
                      )}
                    </div>
                    {c.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEditor(c)}>
                      Edit
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => removeComponent(c.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card-elevated p-5">
            <h3 className="text-sm font-semibold">Connections</h3>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Select value={linkFrom} onValueChange={setLinkFrom}>
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="From…" />
                </SelectTrigger>
                <SelectContent>
                  {components.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">→</span>
              <Select value={linkTo} onValueChange={setLinkTo}>
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="To…" />
                </SelectTrigger>
                <SelectContent>
                  {components.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={connect}>
                Connect
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              {!connections.length ? (
                <p className="text-sm text-muted-foreground">No connections yet.</p>
              ) : (
                connections.map((c, i) => (
                  <div
                    key={`${c.from}-${c.to}-${i}`}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span>
                      {nameOf(c.from)} <span className="text-muted-foreground">→</span>{" "}
                      {nameOf(c.to)}
                    </span>
                    <Button size="icon" variant="ghost" onClick={() => disconnect(c)}>
                      <Unlink className="size-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {typeof arch?.["explanation"] === "string" && arch["explanation"] ? (
            <div className="card-elevated p-5">
              <h3 className="text-sm font-semibold">Why this works</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {String(arch["explanation"])}
              </p>
            </div>
          ) : null}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.name ? "Edit component" : "Add component"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cmp-name">Name</Label>
                <Input
                  id="cmp-name"
                  value={editing.name}
                  maxLength={80}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cmp-kind">Type</Label>
                <Select
                  value={editing.kind ?? "service"}
                  onValueChange={(v) => setEditing({ ...editing, kind: v })}
                >
                  <SelectTrigger id="cmp-kind">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ARCH_KINDS.map((kind) => (
                      <SelectItem key={kind} value={kind}>
                        {kind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cmp-tech">Technology</Label>
                <Input
                  id="cmp-tech"
                  value={editing.tech ?? ""}
                  maxLength={80}
                  onChange={(e) => setEditing({ ...editing, tech: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cmp-desc">Responsibility</Label>
                <Textarea
                  id="cmp-desc"
                  rows={3}
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editing?.name.trim()) return;
                upsert({ ...editing, name: editing.name.trim() });
                setDialogOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
