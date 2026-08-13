import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const generateInput = z.object({ projectId: z.string().uuid() });

export const generateProjectPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => generateInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { generatePlanWithAI } = await import("./ai.server");
    const { SDLC_PHASES } = await import("./plan-schema");

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, name, description, tech_preference, project_type")
      .eq("id", data.projectId)
      .maybeSingle();

    if (projectError) throw new Error(projectError.message);
    if (!project) throw new Error("Project not found.");

    await supabase
      .from("projects")
      .update({ generation_status: "generating", generation_error: null })
      .eq("id", project.id);

    try {
      const plan = await generatePlanWithAI({
        name: project.name,
        description: project.description,
        techPreference: project.tech_preference,
        projectType: project.project_type,
      });

      // Regenerating replaces the previous AI output for this project.
      for (const table of [
        "requirements",
        "user_stories",
        "modules",
        "ui_recommendations",
        "architecture",
        "database_entities",
        "api_endpoints",
        "tasks",
        "sdlc_phases",
      ] as const) {
        await supabase.from(table).delete().eq("project_id", project.id);
      }

      const pid = project.id;
      const inserts = [
        supabase.from("requirements").insert(
          plan.requirements.map((r, i) => ({
            project_id: pid,
            code: r.code,
            title: r.title,
            description: r.description,
            priority: r.priority,
            position: i,
          })),
        ),
        supabase.from("user_stories").insert(
          plan.user_stories.map((s, i) => ({
            project_id: pid,
            code: s.code,
            story: s.story,
            persona: s.persona,
            priority: s.priority,
            position: i,
          })),
        ),
        supabase.from("modules").insert(
          plan.modules.map((m, i) => ({
            project_id: pid,
            name: m.name,
            description: m.description,
            related_requirements: m.related_requirements,
            position: i,
          })),
        ),
        supabase.from("ui_recommendations").insert(
          plan.ui_recommendations.map((u, i) => ({
            project_id: pid,
            screen: u.screen,
            purpose: u.purpose,
            position: i,
          })),
        ),
        supabase.from("architecture").insert({
          project_id: pid,
          layers: plan.architecture.layers,
          explanation: plan.architecture.explanation,
        }),
        supabase.from("database_entities").insert(
          plan.database_entities.map((e, i) => ({
            project_id: pid,
            name: e.name,
            fields: e.fields,
            relationships: e.relationships,
            position: i,
          })),
        ),
        supabase.from("api_endpoints").insert(
          plan.api_endpoints.map((a, i) => ({
            project_id: pid,
            method: a.method,
            path: a.path,
            description: a.description,
            module: a.module,
            position: i,
          })),
        ),
        supabase.from("tasks").insert(
          plan.tasks.map((t, i) => ({
            project_id: pid,
            title: t.title,
            description: t.description,
            module: t.module,
            position: i,
          })),
        ),
        supabase.from("sdlc_phases").insert(
          SDLC_PHASES.map((name, i) => ({
            project_id: pid,
            name,
            status: i === 0 ? "In Progress" : "Not Started",
            position: i,
          })),
        ),
      ];

      await Promise.all(inserts);

      await supabase
        .from("projects")
        .update({
          overview: plan.overview,
          user_types: plan.user_types,
          generation_status: "ready",
          generation_error: null,
        })
        .eq("id", pid);

      return { ok: true as const };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Plan generation failed.";
      await supabase
        .from("projects")
        .update({ generation_status: "failed", generation_error: message })
        .eq("id", project.id);
      throw new Error(message);
    }
  });

const snapshotInput = z.object({ projectId: z.string().uuid(), note: z.string().max(200) });

export const saveProjectVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => snapshotInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const pid = data.projectId;

    const [project, requirements, stories, modules, ui, arch, entities, endpoints, tasks, phases, versions] =
      await Promise.all([
        supabase.from("projects").select("*").eq("id", pid).maybeSingle(),
        supabase.from("requirements").select("*").eq("project_id", pid),
        supabase.from("user_stories").select("*").eq("project_id", pid),
        supabase.from("modules").select("*").eq("project_id", pid),
        supabase.from("ui_recommendations").select("*").eq("project_id", pid),
        supabase.from("architecture").select("*").eq("project_id", pid).maybeSingle(),
        supabase.from("database_entities").select("*").eq("project_id", pid),
        supabase.from("api_endpoints").select("*").eq("project_id", pid),
        supabase.from("tasks").select("*").eq("project_id", pid),
        supabase.from("sdlc_phases").select("*").eq("project_id", pid),
        supabase.from("project_versions").select("id").eq("project_id", pid),
      ]);

    if (!project.data) throw new Error("Project not found.");

    const label = `v1.${(versions.data?.length ?? 0) + 1}`;
    const { error } = await supabase.from("project_versions").insert({
      project_id: pid,
      label,
      note: data.note,
      snapshot: {
        project: project.data,
        requirements: requirements.data ?? [],
        user_stories: stories.data ?? [],
        modules: modules.data ?? [],
        ui_recommendations: ui.data ?? [],
        architecture: arch.data ?? null,
        database_entities: entities.data ?? [],
        api_endpoints: endpoints.data ?? [],
        tasks: tasks.data ?? [],
        sdlc_phases: phases.data ?? [],
      },
    });
    if (error) throw new Error(error.message);
    return { label };
  });
