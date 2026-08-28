import { useRows, type Row } from "@/lib/workspace-queries";
import type { PlanData } from "@/lib/project-graphs";

export function usePlanData(projectId: string): { plan: PlanData; isLoading: boolean } {
  const requirements = useRows("requirements", projectId);
  const stories = useRows("user_stories", projectId);
  const modules = useRows("modules", projectId);
  const screens = useRows("ui_recommendations", projectId);
  const endpoints = useRows("api_endpoints", projectId);
  const tasks = useRows("tasks", projectId);

  const plan: PlanData = {
    requirements: (requirements.data ?? []) as Row[],
    stories: (stories.data ?? []) as Row[],
    modules: (modules.data ?? []) as Row[],
    screens: (screens.data ?? []) as Row[],
    endpoints: (endpoints.data ?? []) as Row[],
    tasks: (tasks.data ?? []) as Row[],
  };

  return {
    plan,
    isLoading:
      requirements.isLoading ||
      stories.isLoading ||
      modules.isLoading ||
      screens.isLoading ||
      endpoints.isLoading ||
      tasks.isLoading,
  };
}
