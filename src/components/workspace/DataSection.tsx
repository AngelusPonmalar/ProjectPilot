import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteRow,
  useRows,
  useSaveRow,
  type Row,
  type WorkspaceTable,
} from "@/lib/workspace-queries";

export type FieldConfig = {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "list";
  options?: readonly string[];
  placeholder?: string;
  maxLength?: number;
  hint?: string;
};

type Props = {
  table: WorkspaceTable;
  projectId: string;
  title: string;
  description: string;
  addLabel: string;
  fields: FieldConfig[];
  emptyLabel: string;
  renderRow: (row: Row) => ReactNode;
};

function toFormValue(field: FieldConfig, value: unknown): string {
  if (field.type === "list") {
    return Array.isArray(value) ? (value as string[]).join("\n") : "";
  }
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

export function DataSection({
  table,
  projectId,
  title,
  description,
  addLabel,
  fields,
  emptyLabel,
  renderRow,
}: Props) {
  const { data: rows, isLoading } = useRows(table, projectId);
  const save = useSaveRow(table, projectId);
  const remove = useDeleteRow(table, projectId);

  const [editing, setEditing] = useState<Row | null>(null);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const openFor = (row: Row | null) => {
    setEditing(row);
    const next: Record<string, string> = {};
    for (const field of fields) next[field.key] = toFormValue(field, row?.[field.key]);
    setValues(next);
    setOpen(true);
  };

  const submit = () => {
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const raw = values[field.key] ?? "";
      payload[field.key] =
        field.type === "list"
          ? raw
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
          : raw.trim();
    }
    if (!editing) payload["position"] = rows?.length ?? 0;
    save.mutate(editing ? { ...payload, id: editing.id } : payload, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button size="sm" onClick={() => openFor(null)}>
          <Plus className="size-4" />
          {addLabel}
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : !rows?.length ? (
          <div className="card-elevated px-6 py-14 text-center text-sm text-muted-foreground">
            {emptyLabel}
          </div>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="card-elevated group flex items-start gap-4 p-5">
              <div className="min-w-0 flex-1">{renderRow(row)}</div>
              <div className="flex shrink-0 gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                <Button size="icon" variant="ghost" onClick={() => openFor(row)} aria-label="Edit">
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setPendingDelete(row.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${title.toLowerCase()}` : addLabel}</DialogTitle>
            <DialogDescription>
              Refine the AI's suggestion or add your own entry.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.type === "select" ? (
                  <Select
                    value={values[field.key] ?? ""}
                    onValueChange={(v) => setValues((s) => ({ ...s, [field.key]: v }))}
                  >
                    <SelectTrigger id={field.key}>
                      <SelectValue placeholder="Choose…" />
                    </SelectTrigger>
                    <SelectContent>
                      {(field.options ?? []).map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "text" ? (
                  <Input
                    id={field.key}
                    maxLength={field.maxLength ?? 200}
                    value={values[field.key] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) => setValues((s) => ({ ...s, [field.key]: e.target.value }))}
                  />
                ) : (
                  <Textarea
                    id={field.key}
                    rows={field.type === "list" ? 5 : 4}
                    maxLength={field.maxLength ?? 2000}
                    value={values[field.key] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) => setValues((s) => ({ ...s, [field.key]: e.target.value }))}
                  />
                )}
                {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={save.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={pendingDelete !== null} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes it from your plan. You can always regenerate or add it back manually.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) remove.mutate(pendingDelete);
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
