import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export const PROJECT_ROLES = [
  "owner",
  "project_manager",
  "developer",
  "designer",
  "viewer",
] as const;

export type ProjectRole = (typeof PROJECT_ROLES)[number];

export const ROLE_LABEL: Record<ProjectRole, string> = {
  owner: "Owner",
  project_manager: "Project manager",
  developer: "Developer",
  designer: "Designer",
  viewer: "Viewer",
};

export function useCurrentUserId() {
  return useQuery({
    queryKey: ["current-user-id"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.id ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** The signed-in user's role on a project, resolved from membership rows. */
export function useMyRole(projectId: string) {
  const { data: userId } = useCurrentUserId();
  const query = useQuery({
    queryKey: ["my-role", projectId, userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_members")
        .select("role")
        .eq("project_id", projectId)
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data?.role ?? null) as ProjectRole | null;
    },
  });
  return { role: query.data ?? null, userId: userId ?? null, isLoading: query.isLoading };
}

export type MemberOption = { id: string; name: string; email: string };

/** Project members, shaped for assignee pickers. */
export function useMemberOptions(projectId: string) {
  return useQuery<MemberOption[]>({
    queryKey: ["member-options", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_members")
        .select("user_id, profiles(name, email)")
        .eq("project_id", projectId);
      if (error) throw new Error(error.message);
      return (data ?? []).map((row: Record<string, any>) => ({
        id: row["user_id"],
        name: row["profiles"]?.name ?? row["profiles"]?.email ?? "Teammate",
        email: row["profiles"]?.email ?? "",
      }));
    },
  });
}
