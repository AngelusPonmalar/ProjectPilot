import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataSection } from "@/components/workspace/DataSection";
import { DetailDrawer, type DetailField } from "@/components/workspace/DetailDrawer";
import { FlowCanvas } from "@/components/workspace/FlowCanvas";
import { SectionHeader, ViewToggle } from "@/components/workspace/ViewToggle";
import { useWorkspaceView } from "@/lib/use-workspace-view";
import { buildStoryMap } from "@/lib/project-graphs";
import { usePlanData } from "@/lib/use-plan-data";
import { PRIORITIES, STORY_STATUSES } from "@/lib/plan-schema";
import type { Row } from "@/lib/workspace-queries";

const str = (row: Row | undefined, key: string) => String(row?.[key] ?? "");
const list = (row: Row | undefined, key: string): string[] =>
  Array.isArray(row?.[key]) ? (row![key] as unknown[]).map(String) : [];

export function StoriesSection({ projectId }: { projectId: string }) {
  const [view, setView] = useWorkspaceView("stories");
  const [selected, setSelected] = useState<string | null>(null);
  const [listSearch, setListSearch] = useState("");
  const { plan, isLoading } = usePlanData(projectId);

  const { items, links } = buildStoryMap(plan);
  const node = items.find((i) => i.id === selected);
  const row = node?.payload?.["row"] as Row | undefined;

  const fields: DetailField[] = [];
  if (node) {
    if (node.kind === "story" && row) {
      const code = str(row, "code").toLowerCase();
      const modName = str(row, "module").toLowerCase();
      fields.push(
        { label: "Story", values: [str(row, "story")].filter(Boolean) },
        {
          label: "Persona / priority",
          values: [`${str(row, "persona") || "—"} · ${str(row, "priority")} · ${str(row, "status")}`],
        },
        { label: "Goal / epic", values: [`${str(row, "goal") || "—"} → ${str(row, "epic") || "—"}`] },
        { label: "Linked requirements", values: list(row, "related_requirements") },
        { label: "Module", values: [str(row, "module")].filter(Boolean) },
        { label: "Acceptance criteria", values: list(row, "acceptance_criteria") },
        {
          label: "Tasks",
          values: plan.tasks
            .filter(
              (t) =>
                (code && str(t, "related_story").toLowerCase() === code) ||
                (modName && str(t, "module").toLowerCase() === modName),
            )
            .map((t) => `${str(t, "title")} — ${str(t, "status")}`),
        },
      );
    } else if (node.kind === "task" && row) {
      fields.push(
        { label: "Task", values: [str(row, "title")] },
        { label: "Status", values: [`${str(row, "status")} · ${str(row, "priority")}`] },
        { label: "Module", values: [str(row, "module")].filter(Boolean) },
      );
    } else if (node.kind === "criteria") {
      fields.push({ label: "Acceptance criteria", values: [String(node.payload?.["text"] ?? "")] });
    } else {
      const label = node.label.toLowerCase();
      fields.push({
        label: node.kind === "goal" ? "Stories under this goal" : "Stories in this epic",
        values: plan.stories
          .filter((s) =>
            node.kind === "goal"
              ? (str(s, "goal") || str(s, "persona") || "Product goals").toLowerCase() === label
              : (str(s, "epic") || str(s, "module") || "General").toLowerCase() === label,
          )
          .map((s) => `${str(s, "code")} — ${str(s, "story")}`),
      });
    }
  }

  return (
    <section>
      <SectionHeader
        title="User stories"
        description="A story map from user goals down to the tasks that satisfy them."
      >
        <ViewToggle value={view} onChange={setView} flowLabel="Story map" />
      </SectionHeader>

      {view === "flow" ? (
        <div className="mt-6">
          {isLoading ? (
            <Skeleton className="h-[560px] rounded-xl" />
          ) : (
            <FlowCanvas
              items={items}
              links={links}
              selectedId={selected}
              onSelect={setSelected}
              emptyLabel="No user stories yet — add one in list view."
            />
          )}
          <DetailDrawer
            open={Boolean(node)}
            onOpenChange={(open) => !open && setSelected(null)}
            kind={node?.kind ?? ""}
            title={node?.label ?? ""}
            subtitle={node?.badge}
            fields={fields}
            footer={
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setListSearch(str(row, "code") || node?.label || "");
                  setSelected(null);
                  setView("list");
                }}
              >
                Edit in list view
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6">
          <DataSection
            key={listSearch}
            initialSearch={listSearch}
            table="user_stories"
            projectId={projectId}
            title="All user stories"
            description="Edit stories and the requirements, modules and tasks they connect to."
            addLabel="Add story"
            emptyLabel="No user stories yet."
            searchKeys={["code", "story", "persona", "epic", "goal"]}
            filterKey="status"
            filterOptions={STORY_STATUSES}
            filterLabel="All statuses"
            fields={[
              { key: "code", label: "Code", type: "text", placeholder: "US-01", maxLength: 20 },
              { key: "persona", label: "Persona", type: "text", maxLength: 80 },
              { key: "story", label: "Story", type: "textarea" },
              { key: "goal", label: "User goal", type: "text", maxLength: 80, hint: "Top level of the story map." },
              { key: "epic", label: "Epic / activity", type: "text", maxLength: 80 },
              {
                key: "related_requirements",
                label: "Related requirement codes",
                type: "list",
                hint: "One code per line, e.g. FR-01.",
              },
              { key: "module", label: "Module", type: "text", maxLength: 80, hint: "Must match a module name to link them." },
              {
                key: "acceptance_criteria",
                label: "Acceptance criteria",
                type: "list",
                hint: "One criterion per line.",
              },
              { key: "priority", label: "Priority", type: "select", options: PRIORITIES },
              { key: "status", label: "Status", type: "select", options: STORY_STATUSES },
            ]}
            renderRow={(r) => (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{str(r, "code")}</span>
                  <Badge variant="outline" className="font-normal">
                    {str(r, "persona")}
                  </Badge>
                  <Badge variant="secondary" className="font-normal">
                    {str(r, "status")}
                  </Badge>
                  {str(r, "epic") && (
                    <Badge variant="outline" className="font-normal">
                      {str(r, "epic")}
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-sm">{str(r, "story")}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {list(r, "related_requirements").map((code) => (
                    <span
                      key={code}
                      className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </>
            )}
          />
        </div>
      )}
    </section>
  );
}
