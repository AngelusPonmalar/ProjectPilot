import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataSection } from "@/components/workspace/DataSection";
import { DetailDrawer, type DetailField } from "@/components/workspace/DetailDrawer";
import { FlowCanvas } from "@/components/workspace/FlowCanvas";
import { SectionHeader, ViewToggle } from "@/components/workspace/ViewToggle";
import { useWorkspaceView } from "@/lib/use-workspace-view";
import { buildTraceability } from "@/lib/project-graphs";
import { usePlanData } from "@/lib/use-plan-data";
import { PRIORITIES, REQUIREMENT_STATUSES } from "@/lib/plan-schema";
import type { Row } from "@/lib/workspace-queries";

const str = (row: Row | undefined, key: string) => String(row?.[key] ?? "");
const list = (row: Row | undefined, key: string): string[] =>
  Array.isArray(row?.[key]) ? (row![key] as unknown[]).map(String) : [];

export function RequirementsSection({ projectId }: { projectId: string }) {
  const [view, setView] = useWorkspaceView("requirements");
  const [selected, setSelected] = useState<string | null>(null);
  const [listSearch, setListSearch] = useState("");
  const { plan, isLoading } = usePlanData(projectId);

  const { items, links } = buildTraceability(plan);
  const node = items.find((i) => i.id === selected);
  const row = node?.payload?.["row"] as Row | undefined;

  const fields: DetailField[] = [];
  if (node && row) {
    if (node.kind === "requirement") {
      const code = str(row, "code").toLowerCase();
      const matches = (candidate: Row) =>
        list(candidate, "related_requirements").map((c) => c.toLowerCase()).includes(code);
      const modules = plan.modules.filter(matches);
      const modNames = modules.map((m) => str(m, "name").toLowerCase());
      fields.push(
        { label: "Description", values: [str(row, "description")].filter(Boolean) },
        { label: "Priority / status", values: [`${str(row, "priority")} · ${str(row, "status")}`] },
        {
          label: "Related user stories",
          values: plan.stories.filter(matches).map((s) => `${str(s, "code")} — ${str(s, "story")}`),
        },
        { label: "Related modules", values: modules.map((m) => str(m, "name")) },
        {
          label: "Related UI screens",
          values: plan.screens
            .filter((s) => matches(s) || modNames.includes(str(s, "module").toLowerCase()))
            .map((s) => str(s, "screen")),
        },
        {
          label: "Related APIs",
          values: plan.endpoints
            .filter((a) => modNames.includes(str(a, "module").toLowerCase()))
            .map((a) => `${str(a, "method")} ${str(a, "path")}`),
        },
        {
          label: "Related tasks",
          values: plan.tasks
            .filter((t) => matches(t) || modNames.includes(str(t, "module").toLowerCase()))
            .map((t) => str(t, "title")),
        },
      );
    } else {
      fields.push(
        {
          label: "Summary",
          values: [str(row, "description") || str(row, "story") || str(row, "purpose")].filter(
            Boolean,
          ),
        },
        {
          label: "Linked requirements",
          values: list(row, "related_requirements"),
        },
      );
    }
  }

  return (
    <section>
      <SectionHeader
        title="Functional requirements"
        description="What the system must do — and everything downstream that delivers it."
      >
        <ViewToggle value={view} onChange={setView} flowLabel="Traceability flow" />
      </SectionHeader>

      {view === "flow" ? (
        <div className="mt-6">
          {isLoading ? (
            <Skeleton className="h-[560px] rounded-xl" />
          ) : (
            <>
              <FlowCanvas
                items={items}
                links={links}
                selectedId={selected}
                onSelect={setSelected}
                emptyLabel="No requirements yet — add one in list view."
              />
              <p className="mt-3 text-xs text-muted-foreground">
                Only real relationships are drawn: requirement codes referenced by stories, modules
                and tasks, plus module names referenced by screens and endpoints.
              </p>
            </>
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
            table="requirements"
            projectId={projectId}
            title="All requirements"
            description="Standard create, edit and delete."
            addLabel="Add requirement"
            emptyLabel="No requirements yet."
            searchKeys={["code", "title", "description"]}
            filterKey="status"
            filterOptions={REQUIREMENT_STATUSES}
            filterLabel="All statuses"
            fields={[
              { key: "code", label: "Code", type: "text", placeholder: "FR-01", maxLength: 20 },
              { key: "title", label: "Title", type: "text", maxLength: 160 },
              { key: "description", label: "Description", type: "textarea" },
              { key: "priority", label: "Priority", type: "select", options: PRIORITIES },
              { key: "status", label: "Status", type: "select", options: REQUIREMENT_STATUSES },
            ]}
            renderRow={(r) => (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{str(r, "code")}</span>
                  <h3 className="text-sm font-semibold">{str(r, "title")}</h3>
                  <Badge variant="outline" className="font-normal">
                    {str(r, "priority")}
                  </Badge>
                  <Badge variant="secondary" className="font-normal">
                    {str(r, "status")}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{str(r, "description")}</p>
              </>
            )}
          />
        </div>
      )}
    </section>
  );
}
