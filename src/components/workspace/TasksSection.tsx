import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentUserId, useMemberOptions, useMyRole } from "@/lib/team-queries";
import { useRows, useSaveRow, type Row } from "@/lib/workspace-queries";

const TASK_STATUSES = ["To Do", "In Progress", "Done"] as const;
const UNASSIGNED = "unassigned";

type Task = Row & {
  title: string;
  description: string;
  module: string;
  completed: boolean;
  status: string;
  assignee_id: string | null;
};

export function TasksSection({ projectId }: { projectId: string }) {
  const { data: tasks, isLoading } = useRows<Task>("tasks", projectId);
  const save = useSaveRow("tasks", projectId);
  const { data: members } = useMemberOptions(projectId);
  const { data: userId } = useCurrentUserId();
  const { role } = useMyRole(projectId);
  const canManage = role === "owner" || role === "project_manager";

  const [newTask, setNewTask] = useState("");
  const [mine, setMine] = useState(false);

  const visible = (tasks ?? []).filter((t) => (mine ? t.assignee_id === userId : true));
  const done = tasks?.filter((t) => t.completed).length ?? 0;
  const nameOf = (id: string | null) => members?.find((m) => m.id === id)?.name ?? null;

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Implementation tasks</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {done} of {tasks?.length ?? 0} complete — assign them and tick them off as you build.
          </p>
        </div>
        <Button
          size="sm"
          variant={mine ? "default" : "outline"}
          onClick={() => setMine((m) => !m)}
          aria-pressed={mine}
        >
          My tasks
        </Button>
      </div>

      <form
        className="mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const title = newTask.trim();
          if (!title) return;
          save.mutate(
            { title, description: "", module: "Custom", position: tasks?.length ?? 0 },
            { onSuccess: () => setNewTask("") },
          );
        }}
      >
        <Input
          value={newTask}
          maxLength={200}
          placeholder="Add your own task…"
          onChange={(e) => setNewTask(e.target.value)}
        />
        <Button type="submit" disabled={save.isPending}>
          Add
        </Button>
      </form>

      <div className="mt-4 space-y-2">
        {isLoading ? (
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)
        ) : !visible.length ? (
          <div className="card-elevated px-6 py-14 text-center text-sm text-muted-foreground">
            {mine ? "Nothing assigned to you yet." : "No tasks yet."}
          </div>
        ) : (
          visible.map((task) => (
            <div key={task.id} className="card-elevated flex flex-wrap items-start gap-3 p-4">
              <Checkbox
                checked={task.completed}
                className="mt-1"
                onCheckedChange={(checked) =>
                  save.mutate({
                    id: task.id,
                    completed: checked === true,
                    status: checked === true ? "Done" : "To Do",
                  })
                }
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-sm font-medium ${task.completed ? "text-muted-foreground line-through" : ""}`}
                  >
                    {task.title}
                  </span>
                  {task.module && (
                    <Badge variant="secondary" className="font-normal">
                      {task.module}
                    </Badge>
                  )}
                  {task.assignee_id && (
                    <Badge variant="outline" className="font-normal">
                      {nameOf(task.assignee_id) ?? "Assigned"}
                    </Badge>
                  )}
                </div>
                {task.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                )}
              </div>

              <Select
                value={task.status || "To Do"}
                onValueChange={(v) =>
                  save.mutate({ id: task.id, status: v, completed: v === "Done" })
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {canManage && (
                <Select
                  value={task.assignee_id ?? UNASSIGNED}
                  onValueChange={(v) =>
                    save.mutate({ id: task.id, assignee_id: v === UNASSIGNED ? null : v })
                  }
                >
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Assign…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                    {(members ?? []).map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
