import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const explainInput = z.object({
  projectId: z.string().uuid(),
  moduleId: z.string().uuid(),
  category: z.string().max(40),
  upstream: z.array(z.string().max(120)).max(20),
  downstream: z.array(z.string().max(120)).max(20),
});

export const explainModule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => explainInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { explainModuleWithAI } = await import("./ai.server");

    const [{ data: project }, { data: mod }] = await Promise.all([
      supabase
        .from("projects")
        .select("name, description")
        .eq("id", data.projectId)
        .maybeSingle(),
      supabase
        .from("modules")
        .select("name, description, related_requirements")
        .eq("id", data.moduleId)
        .maybeSingle(),
    ]);

    if (!project || !mod) throw new Error("Module not found.");

    const [{ data: endpoints }, { data: entities }, { data: tasks }] = await Promise.all([
      supabase.from("api_endpoints").select("method, path, module").eq("project_id", data.projectId),
      supabase.from("database_entities").select("name").eq("project_id", data.projectId),
      supabase.from("tasks").select("title, module").eq("project_id", data.projectId),
    ]);

    const name = mod.name ?? "";
    const matches = (value: string | null) =>
      !!value && value.toLowerCase().trim() === name.toLowerCase().trim();

    const explanation = await explainModuleWithAI({
      projectName: project.name ?? "",
      projectDescription: project.description ?? "",
      moduleName: name,
      moduleDescription: mod.description ?? "",
      category: data.category,
      requirements: Array.isArray(mod.related_requirements)
        ? (mod.related_requirements as string[]).map(String)
        : [],
      upstream: data.upstream,
      downstream: data.downstream,
      endpoints: (endpoints ?? [])
        .filter((e) => matches(e.module))
        .map((e) => `${e.method} ${e.path}`),
      entities: (entities ?? []).map((e) => e.name ?? "").filter(Boolean),
      tasks: (tasks ?? []).filter((t) => matches(t.module)).map((t) => t.title ?? ""),
    });

    return { explanation };
  });
