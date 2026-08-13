import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type Row = Record<string, unknown> & { id: string };

export type WorkspaceTable =
  | "requirements"
  | "user_stories"
  | "modules"
  | "ui_recommendations"
  | "database_entities"
  | "api_endpoints"
  | "tasks"
  | "sdlc_phases"
  | "project_versions"
  | "architecture";

// The Supabase generated types resolve per-literal-table, so a union table name
// needs a loose handle here. Every call is still RLS-scoped to the signed-in user.
const table = (name: WorkspaceTable) =>
  (supabase as unknown as {
    from: (n: string) => ReturnType<typeof supabase.from<never>>;
  }).from(name) as never as {
    select: (columns: string) => any;
    insert: (values: unknown) => any;
    update: (values: unknown) => any;
    delete: () => any;
  };

export function rowsKey(name: WorkspaceTable, projectId: string) {
  return ["workspace", name, projectId] as const;
}

export function useRows<T = Row>(name: WorkspaceTable, projectId: string, orderBy = "position") {
  return useQuery<T[]>({
    queryKey: rowsKey(name, projectId),
    queryFn: async () => {
      const { data, error } = await table(name)
        .select("*")
        .eq("project_id", projectId)
        .order(orderBy, { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as T[];
    },
  });
}

export function useSaveRow(name: WorkspaceTable, projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown> & { id?: string }) => {
      const { id, ...rest } = values;
      if (id) {
        const { error } = await table(name).update(rest).eq("id", id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await table(name).insert({ ...rest, project_id: projectId });
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rowsKey(name, projectId) });
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteRow(name: WorkspaceTable, projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await table(name).delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rowsKey(name, projectId) });
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
