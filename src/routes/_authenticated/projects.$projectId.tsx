import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  Boxes,
  Database,
  GitBranch,
  Layers,
  ListChecks,
  Loader2,
  Monitor,
  Network,
  RefreshCw,
  Save,
  ScrollText,
  SquareCheck,
  Users,
  Workflow,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { DataSection } from "@/components/workspace/DataSection";
import { ArchitectureSection } from "@/components/workspace/ArchitectureSection";
import { RequirementsSection } from "@/components/workspace/RequirementsSection";
import { ScreensSection } from "@/components/workspace/ScreensSection";
import { StoriesSection } from "@/components/workspace/StoriesSection";
import { TasksSection } from "@/components/workspace/TasksSection";
import { TeamSection } from "@/components/workspace/TeamSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { supabase } from "@/integrations/supabase/client";
import { generateProjectPlan, saveProjectVersion } from "@/lib/plan.functions";
import {
  MODULE_STATUSES,
  PHASE_STATUSES,
  PRIORITIES,
  REQUIREMENT_STATUSES,
  SDLC_PHASES,
  STORY_STATUSES,
} from "@/lib/plan-schema";
import { rowsKey, useRows, useSaveRow, type Row } from "@/lib/workspace-queries";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: ScrollText },
  { id: "requirements", label: "Requirements", icon: ListChecks },
  { id: "stories", label: "User stories", icon: ScrollText },
  { id: "modules", label: "Modules", icon: Boxes },
  { id: "ui", label: "UI screens", icon: Monitor },
  { id: "architecture", label: "Architecture", icon: Layers },
  { id: "database", label: "Database", icon: Database },
  { id: "api", label: "API endpoints", icon: Network },
  { id: "tasks", label: "Tasks", icon: SquareCheck },
  { id: "sdlc", label: "SDLC", icon: Workflow },
  { id: "versions", label: "Versions", icon: GitBranch },
  { id: "team", label: "Team", icon: Users },
] as const;

const sectionIds = SECTIONS.map((s) => s.id) as unknown as [string, ...string[]];

export const Route = createFileRoute("/_authenticated/projects/$projectId")({
  validateSearch: z.object({ section: z.enum(sectionIds).catch("overview") }),
  head: () => ({
    meta: [
      { title: "Project Plan — Project Workspace" },
      {
        name: "description",
        content:
          "Review and refine the generated requirements, architecture, data model, API surface and tasks for your project.",
      },
      { property: "og:title", content: "Project Plan — Project Workspace" },
      {
        property: "og:description",
        content: "Your full AI-generated software development plan in one editable workspace.",
      },
    ],
  }),
  component: ProjectWorkspace,
});

function ProjectWorkspace() {
  const { projectId } = Route.useParams();
  const { section } = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const regenerate = useServerFn(generateProjectPlan);
  const [regenerating, setRegenerating] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const { data: tasks } = useRows<Row & { completed: boolean }>("tasks", projectId);
  const total = tasks?.length ?? 0;
  const done = tasks?.filter((t) => t.completed).length ?? 0;
  const progress = total ? Math.round((done / total) * 100) : 0;

  const runRegenerate = async () => {
    setRegenerating(true);
    try {
      await regenerate({ data: { projectId } });
      await qc.invalidateQueries();
      toast.success("Plan regenerated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Regeneration failed");
    } finally {
      setRegenerating(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="mt-6 h-96 rounded-xl" />
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell>
        <div className="card-elevated px-6 py-20 text-center">
          <h1 className="text-lg font-semibold">Project not found</h1>
          <Button asChild className="mt-5">
            <Link to="/dashboard">Back to projects</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All projects
      </Link>

      <div className="card-elevated mt-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{project.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="font-normal">
                {project.project_type}
              </Badge>
              {project.tech_preference && (
                <Badge variant="outline" className="font-normal">
                  {project.tech_preference}
                </Badge>
              )}
              <Badge variant="outline" className="font-normal">
                Phase: {project.current_phase}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <SaveVersionButton projectId={projectId} />
            <Button size="sm" variant="outline" disabled={regenerating} onClick={runRegenerate}>
              {regenerating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Regenerate
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Overall progress</span>
            <span>
              {done}/{total} tasks complete
            </span>
          </div>
          <Progress value={progress} className="mt-2 h-2" />
        </div>

        {project.generation_status === "failed" && (
          <div className="mt-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/8 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{project.generation_error || "The last generation attempt failed."}</span>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <nav className="lg:w-56 lg:shrink-0">
          <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() =>
                    navigate({
                      to: "/projects/$projectId",
                      params: { projectId },
                      search: { section: s.id },
                    })
                  }
                  className={`flex w-full shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors ${
                    section === s.id
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <s.icon className="size-4" />
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 flex-1">
          <SectionContent section={section} projectId={projectId} project={project} />
        </div>
      </div>
    </AppShell>
  );
}

function SaveVersionButton({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const save = useServerFn(saveProjectVersion);
  const [busy, setBusy] = useState(false);

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const result = await save({ data: { projectId, note: "Manual snapshot" } });
          await qc.invalidateQueries({ queryKey: rowsKey("project_versions", projectId) });
          toast.success(`Saved snapshot ${result.label}`);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not save version");
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
      Save version
    </Button>
  );
}

type ProjectRecord = {
  id: string;
  overview: string;
  user_types: unknown;
  current_phase: string;
};

function SectionContent({
  section,
  projectId,
  project,
}: {
  section: string;
  projectId: string;
  project: ProjectRecord;
}) {
  switch (section) {
    case "overview":
      return <OverviewSection project={project} projectId={projectId} />;
    case "requirements":
      return <RequirementsSection projectId={projectId} />;
    case "stories":
      return <StoriesSection projectId={projectId} />;
    case "modules":
      return (
        <DataSection
          table="modules"
          projectId={projectId}
          title="Functional modules"
          description="How the system decomposes into buildable parts."
          addLabel="Add module"
          emptyLabel="No modules yet."
          fields={[
            { key: "name", label: "Name", type: "text", maxLength: 100 },
            { key: "description", label: "Description", type: "textarea" },
            {
              key: "related_requirements",
              label: "Related requirements",
              type: "list",
              hint: "One requirement code per line.",
            },
            { key: "status", label: "Status", type: "select", options: MODULE_STATUSES },
          ]}
          renderRow={(row) => (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold">{String(row["name"])}</h3>
                <Badge variant="secondary" className="font-normal">
                  {String(row["status"])}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{String(row["description"])}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {((row["related_requirements"] as string[]) ?? []).map((code) => (
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
      );
    case "ui":
      return <ScreensSection projectId={projectId} />;
    case "architecture":
      return <ArchitectureSection projectId={projectId} />;
    case "database":
      return (
        <DataSection
          table="database_entities"
          projectId={projectId}
          title="Database design"
          description="Suggested entities, fields and relationships."
          addLabel="Add entity"
          emptyLabel="No entities yet."
          fields={[
            { key: "name", label: "Entity name", type: "text", maxLength: 80 },
            { key: "fields", label: "Fields", type: "list", hint: "One field per line." },
            {
              key: "relationships",
              label: "Relationships",
              type: "list",
              hint: "One relationship per line.",
            },
          ]}
          renderRow={(row) => (
            <>
              <h3 className="font-mono text-sm font-semibold">{String(row["name"])}</h3>
              <ul className="mt-2 space-y-0.5">
                {((row["fields"] as string[]) ?? []).map((f) => (
                  <li key={f} className="font-mono text-xs text-muted-foreground">
                    {f}
                  </li>
                ))}
              </ul>
              {((row["relationships"] as string[]) ?? []).length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {((row["relationships"] as string[]) ?? []).join(" · ")}
                </p>
              )}
            </>
          )}
        />
      );
    case "api":
      return (
        <DataSection
          table="api_endpoints"
          projectId={projectId}
          title="API endpoints"
          description="The service surface, grouped by module."
          addLabel="Add endpoint"
          emptyLabel="No endpoints yet."
          fields={[
            {
              key: "method",
              label: "Method",
              type: "select",
              options: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            },
            { key: "path", label: "Path", type: "text", maxLength: 160 },
            { key: "description", label: "Description", type: "textarea" },
            { key: "module", label: "Module", type: "text", maxLength: 80 },
          ]}
          renderRow={(row) => (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono text-[11px]">
                  {String(row["method"])}
                </Badge>
                <code className="font-mono text-sm">{String(row["path"])}</code>
                <Badge variant="secondary" className="font-normal">
                  {String(row["module"])}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{String(row["description"])}</p>
            </>
          )}
        />
      );
    case "tasks":
      return <TasksSection projectId={projectId} />;
    case "sdlc":
      return <SdlcSection projectId={projectId} project={project} />;
    case "versions":
      return <VersionsSection projectId={projectId} />;
    case "team":
      return <TeamSection projectId={projectId} />;
    default:
      return null;
  }
}

function OverviewSection({
  project,
  projectId,
}: {
  project: ProjectRecord;
  projectId: string;
}) {
  const { data: requirements } = useRows("requirements", projectId);
  const { data: stories } = useRows("user_stories", projectId);
  const { data: modules } = useRows("modules", projectId);
  const { data: endpoints } = useRows("api_endpoints", projectId);
  const userTypes = Array.isArray(project.user_types) ? (project.user_types as string[]) : [];

  const stats = [
    ["Requirements", requirements?.length ?? 0],
    ["User stories", stories?.length ?? 0],
    ["Modules", modules?.length ?? 0],
    ["Endpoints", endpoints?.length ?? 0],
  ] as const;

  return (
    <section className="space-y-6">
      <div className="card-elevated p-6">
        <h2 className="text-xl font-semibold">Overview</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {project.overview || "Generate the plan to see a product overview here."}
        </p>
        {userTypes.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold">User types</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {userTypes.map((t) => (
                <Badge key={t} variant="secondary" className="font-normal">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="card-elevated p-5">
            <p className="text-2xl font-semibold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SdlcSection({ projectId, project }: { projectId: string; project: ProjectRecord }) {
  const qc = useQueryClient();
  const { data: phases, isLoading } = useRows<Row & { name: string; status: string }>(
    "sdlc_phases",
    projectId,
  );
  const save = useSaveRow("sdlc_phases", projectId);

  const setCurrentPhase = async (name: string) => {
    const { error } = await supabase
      .from("projects")
      .update({ current_phase: name })
      .eq("id", projectId);
    if (error) {
      toast.error(error.message);
      return;
    }
    await qc.invalidateQueries({ queryKey: ["project", projectId] });
    await qc.invalidateQueries({ queryKey: ["projects"] });
    toast.success(`Current phase: ${name}`);
  };

  const list = phases?.length
    ? phases
    : SDLC_PHASES.map((name, i) => ({ id: `placeholder-${i}`, name, status: "Not Started" }) as Row & {
        name: string;
        status: string;
      });

  return (
    <section>
      <h2 className="text-xl font-semibold">SDLC phases</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Track where the project stands across the software lifecycle.
      </p>

      <div className="mt-6 space-y-3">
        {isLoading
          ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          : list.map((phase, i) => (
              <div key={phase.id} className="card-elevated flex flex-wrap items-center gap-4 p-5">
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    phase.status === "Completed"
                      ? "bg-success/15 text-success"
                      : phase.status === "In Progress"
                        ? "brand-gradient text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold">{phase.name}</h3>
                  {project.current_phase === phase.name && (
                    <span className="text-xs text-primary">Current phase</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Select
                    value={phase.status}
                    onValueChange={(value) => {
                      if (phase.id.startsWith("placeholder")) return;
                      save.mutate({ id: phase.id, status: value });
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PHASE_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPhase(phase.name)}>
                    Set current
                  </Button>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}

function VersionsSection({ projectId }: { projectId: string }) {
  const { data: versions, isLoading } = useRows<Row & { label: string; note: string; created_at: string }>(
    "project_versions",
    projectId,
    "created_at",
  );

  return (
    <section>
      <h2 className="text-xl font-semibold">Plan versions</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Snapshots of the whole plan, captured with “Save version”.
      </p>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <Skeleton className="h-20 rounded-xl" />
        ) : !versions?.length ? (
          <div className="card-elevated px-6 py-14 text-center text-sm text-muted-foreground">
            No snapshots yet. Save one to keep a record of the plan as it is today.
          </div>
        ) : (
          versions.map((version) => (
            <div key={version.id} className="card-elevated flex items-center gap-4 p-5">
              <GitBranch className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">{version.label}</h3>
                <p className="text-xs text-muted-foreground">{version.note}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {new Date(version.created_at).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
