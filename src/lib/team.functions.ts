import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type InvitationSummary = {
  id: string;
  projectId: string;
  projectName: string;
  role: string;
  invitedBy: string;
  expiresAt: string;
};

/** Invitations addressed to the signed-in user's email, with project names attached. */
export const listMyInvitations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<InvitationSummary[]> => {
    const email = String(context.claims["email"] ?? "").toLowerCase();
    if (!email) return [];

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("project_invitations")
      .select("id, project_id, role, expires_at, invited_by, projects(name), profiles(name, email)")
      .eq("invited_email", email)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString());
    if (error) throw new Error(error.message);

    return (data ?? []).map((row: Record<string, any>) => ({
      id: row["id"],
      projectId: row["project_id"],
      projectName: row["projects"]?.name ?? "Untitled project",
      role: row["role"],
      invitedBy: row["profiles"]?.name ?? row["profiles"]?.email ?? "A teammate",
      expiresAt: row["expires_at"],
    }));
  });

export const respondToInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ invitationId: z.string().uuid(), accept: z.boolean() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const email = String(context.claims["email"] ?? "").toLowerCase();
    if (!email) throw new Error("Your account has no email address.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invitation, error } = await supabaseAdmin
      .from("project_invitations")
      .select("id, project_id, role, status, expires_at, invited_email")
      .eq("id", data.invitationId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!invitation || invitation.invited_email.toLowerCase() !== email) {
      throw new Error("Invitation not found.");
    }
    if (invitation.status !== "pending") throw new Error("This invitation was already answered.");
    if (new Date(invitation.expires_at) < new Date()) throw new Error("This invitation expired.");

    if (data.accept) {
      const { error: memberError } = await supabaseAdmin.from("project_members").upsert(
        {
          project_id: invitation.project_id,
          user_id: context.userId,
          role: invitation.role,
        },
        { onConflict: "project_id,user_id" },
      );
      if (memberError) throw new Error(memberError.message);
    }

    const { error: updateError } = await supabaseAdmin
      .from("project_invitations")
      .update({ status: data.accept ? "accepted" : "declined" })
      .eq("id", invitation.id);
    if (updateError) throw new Error(updateError.message);

    return { projectId: invitation.project_id, accepted: data.accept };
  });
