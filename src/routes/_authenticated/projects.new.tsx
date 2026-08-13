import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { generateProjectPlan } from "@/lib/plan.functions";
import { PROJECT_TYPES } from "@/lib/plan-schema";

export const Route = createFileRoute("/_authenticated/projects/new")({
  head: () => ({
    meta: [
      { title: "New Project — Project Workspace" },
      {
        name: "description",
        content:
          "Describe your software idea and generate a complete development plan with requirements, architecture and tasks.",
      },
      { property: "og:title", content: "New Project — Project Workspace" },
      {
        property: "og:description",
        content: "Turn a short idea description into a full structured development plan.",
      },
    ],
  }),
  component: NewProject,
});

const schema = z.object({
  name: z.string().trim().min(3, "Give your project a name of at least 3 characters").max(100),
  description: z
    .string()
    .trim()
    .min(30, "Describe the idea in at least 30 characters so the AI has something to work with")
    .max(2000),
  tech_preference: z.string().trim().max(120),
  project_type: z.string().trim().max(60),
});

const STEPS = [
  "Analysing your idea",
  "Drafting requirements & user stories",
  "Designing modules and architecture",
  "Modelling data and APIs",
  "Building the task breakdown",
];

function NewProject() {
  const navigate = useNavigate();
  const generate = useServerFn(generateProjectPlan);
  const [form, setForm] = useState({
    name: "",
    description: "",
    tech_preference: "",
    project_type: PROJECT_TYPES[0] as string,
  });
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }

    setBusy(true);
    setStep(0);
    const ticker = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 3500);

    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Your session expired. Please sign in again.");

      const { data: project, error } = await supabase
        .from("projects")
        .insert({ ...parsed.data, user_id: auth.user.id })
        .select("id")
        .single();
      if (error) throw error;

      await generate({ data: { projectId: project.id } });
      toast.success("Your development plan is ready");
      navigate({
        to: "/projects/$projectId",
        params: { projectId: project.id },
        search: { section: "overview" },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate the plan");
    } finally {
      clearInterval(ticker);
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to projects
      </Link>

      <div className="mx-auto mt-6 max-w-2xl">
        <h1 className="text-2xl font-semibold">Describe your idea</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The more specific you are, the sharper the generated plan will be.
        </p>

        <form onSubmit={submit} className="card-elevated mt-6 space-y-5 p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Project name</Label>
            <Input
              id="name"
              value={form.name}
              maxLength={100}
              disabled={busy}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="TaskFlow — team task tracker"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">What should it do?</Label>
            <Textarea
              id="description"
              rows={6}
              maxLength={2000}
              disabled={busy}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="A tool where small teams create projects, assign tasks with due dates, comment on them, and see a weekly progress report. Managers need an overview dashboard; members only see their own work."
            />
            <p className="text-xs text-muted-foreground">
              {form.description.length}/2000 characters
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tech">Technology preference</Label>
              <Input
                id="tech"
                value={form.tech_preference}
                maxLength={120}
                disabled={busy}
                onChange={(e) => setForm({ ...form, tech_preference: e.target.value })}
                placeholder="React + Node.js + PostgreSQL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Project type</Label>
              <Select
                value={form.project_type}
                disabled={busy}
                onValueChange={(v) => setForm({ ...form, project_type: v })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {busy ? "Generating your plan…" : "Generate development plan"}
          </Button>

          {busy && (
            <ul className="space-y-2 rounded-lg bg-muted/60 p-4">
              {STEPS.map((label, i) => (
                <li
                  key={label}
                  className={`flex items-center gap-2 text-sm ${
                    i <= step ? "text-foreground" : "text-muted-foreground/60"
                  }`}
                >
                  {i < step ? (
                    <span className="size-1.5 rounded-full bg-success" />
                  ) : i === step ? (
                    <Loader2 className="size-3.5 animate-spin text-primary" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                  )}
                  {label}
                </li>
              ))}
            </ul>
          )}
        </form>
      </div>
    </AppShell>
  );
}
