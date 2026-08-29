import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FolderPlus, Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { InvitationsInbox } from "@/components/workspace/InvitationsInbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Projects — Project Workspace" },
      {
        name: "description",
        content: "All of your AI-generated software development plans and their current progress.",
      },
      { property: "og:title", content: "Your Projects — Project Workspace" },
      {
        property: "og:description",
        content: "Track requirements, tasks and SDLC progress across every project you plan.",
      },
    ],
  }),
  component: Dashboard,
});

type ProjectCard = {
  id: string;
  name: string;
  description: string;
  project_type: string;
  tech_preference: string;
  current_phase: string;
  generation_status: string;
  created_at: string;
  progress: number;
  taskCount: number;
  doneCount: number;
};

function Dashboard() {
  const { data: projects, isLoading } = useQuery<ProjectCard[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, name, description, project_type, tech_preference, current_phase, generation_status, created_at, tasks(completed)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((p) => {
        const tasks = (p.tasks ?? []) as { completed: boolean }[];
        const doneCount = tasks.filter((t) => t.completed).length;
        return {
          id: p.id,
          name: p.name,
          description: p.description,
          project_type: p.project_type,
          tech_preference: p.tech_preference,
          current_phase: p.current_phase,
          generation_status: p.generation_status,
          created_at: p.created_at,
          taskCount: tasks.length,
          doneCount,
          progress: tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0,
        };
      });
    },
  });

  return (
    <AppShell>
      <InvitationsInbox />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Your projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every idea you've turned into a structured development plan.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : !projects?.length ? (
        <div className="card-elevated mt-8 flex flex-col items-center px-6 py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <FolderPlus className="size-6" />
          </div>
          <h2 className="mt-5 text-lg font-semibold">No projects yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Describe your first idea and let the AI draft the requirements, architecture, data model
            and task list for you.
          </p>
          <Button asChild className="mt-6">
            <Link to="/projects/new">Create your first project</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              to="/projects/$projectId"
              params={{ projectId: p.id }}
              search={{ section: "overview" }}
              className="card-elevated flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="line-clamp-1 text-base font-semibold">{p.name}</h2>
                <StatusBadge status={p.generation_status} />
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="font-normal">
                  {p.project_type}
                </Badge>
                {p.tech_preference && (
                  <Badge variant="outline" className="font-normal">
                    {p.tech_preference}
                  </Badge>
                )}
              </div>

              <div className="mt-auto pt-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Phase: {p.current_phase}</span>
                  <span>
                    {p.doneCount}/{p.taskCount} tasks
                  </span>
                </div>
                <Progress value={p.progress} className="mt-2 h-1.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "generating")
    return (
      <Badge variant="secondary" className="shrink-0 gap-1">
        <Loader2 className="size-3 animate-spin" />
        Generating
      </Badge>
    );
  if (status === "failed")
    return (
      <Badge variant="destructive" className="shrink-0 gap-1">
        <AlertCircle className="size-3" />
        Failed
      </Badge>
    );
  if (status === "pending")
    return (
      <Badge variant="outline" className="shrink-0 gap-1">
        <Clock className="size-3" />
        Draft
      </Badge>
    );
  return (
    <Badge variant="outline" className="shrink-0 gap-1 border-transparent bg-success/12 text-success">
      <CheckCircle2 className="size-3" />
      Ready
    </Badge>
  );
}
