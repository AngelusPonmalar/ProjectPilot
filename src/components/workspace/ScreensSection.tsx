import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataSection } from "@/components/workspace/DataSection";
import { DetailDrawer, type DetailField } from "@/components/workspace/DetailDrawer";
import { FlowCanvas } from "@/components/workspace/FlowCanvas";
import { SectionHeader, ViewToggle, type WorkspaceView } from "@/components/workspace/ViewToggle";
import { buildScreenFlow } from "@/lib/project-graphs";
import { usePlanData } from "@/lib/use-plan-data";
import type { Row } from "@/lib/workspace-queries";

const str = (row: Row | undefined, key: string) => String(row?.[key] ?? "");
const list = (row: Row | undefined, key: string): string[] =>
  Array.isArray(row?.[key]) ? (row![key] as unknown[]).map(String) : [];

export function ScreensSection({ projectId }: { projectId: string }) {
  const [view, setView] = useState<WorkspaceView>("flow");
  const [selected, setSelected] = useState<string | null>(null);
  const [listSearch, setListSearch] = useState("");
  const { plan, isLoading } = usePlanData(projectId);

  const { items, links } = buildScreenFlow(plan);
  const node = items.find((i) => i.id === selected);
  const row = node?.payload?.["row"] as Row | undefined;

  const fields: DetailField[] = [];
  if (row) {
    const modName = str(row, "module").toLowerCase();
    const codes = list(row, "related_requirements").map((c) => c.toLowerCase());
    fields.push(
      { label: "Purpose", values: [str(row, "purpose")].filter(Boolean) },
      { label: "Related module", values: [str(row, "module")].filter(Boolean) },
      {
        label: "Related requirements",
        values: plan.requirements
          .filter((r) => codes.includes(str(r, "code").toLowerCase()))
          .map((r) => `${str(r, "code")} — ${str(r, "title")}`),
      },
      {
        label: "Related user stories",
        values: plan.stories
          .filter((s) => list(row, "related_stories").map((c) => c.toLowerCase()).includes(str(s, "code").toLowerCase()))
          .map((s) => `${str(s, "code")} — ${str(s, "story")}`),
      },
      {
        label: "Related APIs",
        values: plan.endpoints
          .filter((a) => modName && str(a, "module").toLowerCase() === modName)
          .map((a) => `${str(a, "method")} ${str(a, "path")}`),
      },
      {
        label: "Related tasks",
        values: plan.tasks
          .filter((t) => modName && str(t, "module").toLowerCase() === modName)
          .map((t) => `${str(t, "title")} — ${str(t, "status")}`),
      },
      { label: "Navigates to", values: list(row, "next_screens") },
    );
  }

  return (
    <section>
      <SectionHeader
        title="UI screens"
        description="How people move through the product, screen by screen."
      >
        <ViewToggle value={view} onChange={setView} flowLabel="Screen flow" />
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
                emptyLabel="No screens yet — add one in list view."
              />
              <p className="mt-3 text-xs text-muted-foreground">
                Connect screens by listing destination screen names under “Navigates to” in list
                view; remove a name to disconnect them.
              </p>
            </>
          )}
          <DetailDrawer
            open={Boolean(node)}
            onOpenChange={(open) => !open && setSelected(null)}
            kind="screen"
            title={node?.label ?? ""}
            subtitle={str(row, "module") || undefined}
            fields={fields}
            footer={
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setListSearch(str(row, "screen"));
                  setSelected(null);
                  setView("list");
                }}
              >
                Edit screen
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6">
          <DataSection
            key={listSearch}
            initialSearch={listSearch}
            table="ui_recommendations"
            projectId={projectId}
            title="All screens"
            description="Create, edit, delete and connect the interfaces this product needs."
            addLabel="Add screen"
            emptyLabel="No screens suggested yet."
            searchKeys={["screen", "purpose", "module"]}
            fields={[
              { key: "screen", label: "Screen name", type: "text", maxLength: 100 },
              { key: "purpose", label: "Purpose", type: "textarea" },
              { key: "module", label: "Related module", type: "text", maxLength: 80 },
              {
                key: "related_requirements",
                label: "Related requirement codes",
                type: "list",
                hint: "One code per line.",
              },
              {
                key: "related_stories",
                label: "Related story codes",
                type: "list",
                hint: "One code per line.",
              },
              {
                key: "next_screens",
                label: "Navigates to",
                type: "list",
                hint: "One destination screen name per line — this draws the arrows.",
              },
            ]}
            renderRow={(r) => (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">{str(r, "screen")}</h3>
                  {str(r, "module") && (
                    <Badge variant="secondary" className="font-normal">
                      {str(r, "module")}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{str(r, "purpose")}</p>
                {list(r, "next_screens").length > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    → {list(r, "next_screens").join(" · ")}
                  </p>
                )}
              </>
            )}
          />
        </div>
      )}
    </section>
  );
}
