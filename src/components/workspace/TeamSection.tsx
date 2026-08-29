import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, Trash2, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { PROJECT_ROLES, ROLE_LABEL, useMyRole, type ProjectRole } from "@/lib/team-queries";

export function TeamSection({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const { role: myRole, userId, isLoading: roleLoading } = useMyRole(projectId);
  const canManage = myRole === "owner" || myRole === "project_manager";

  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<ProjectRole>("developer");

  const members = useQuery({
    queryKey: ["members", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_members")
        .select("id, role, user_id, joined_at, profiles(name, email)")
        .eq("project_id", projectId)
        .order("joined_at", { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const invitations = useQuery({
    queryKey: ["invitations", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_invitations")
        .select("id, invited_email, role, status, expires_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["members", projectId] });
    qc.invalidateQueries({ queryKey: ["invitations", projectId] });
  };

  const invite = useMutation({
    mutationFn: async () => {
      const value = email.trim().toLowerCase();
      if (!value.includes("@")) throw new Error("Enter a valid email address.");
      if (!userId) throw new Error("You must be signed in.");
      const { error } = await supabase.from("project_invitations").insert({
        project_id: projectId,
        invited_email: value,
        invited_by: userId,
        role: inviteRole,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setEmail("");
      refresh();
      toast.success("Invitation sent — it appears on their dashboard.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const changeRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: ProjectRole }) => {
      const { error } = await supabase.from("project_members").update({ role }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      refresh();
      toast.success("Role updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_members").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      refresh();
      toast.success("Member removed");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const revokeInvite = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_invitations").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      refresh();
      toast.success("Invitation revoked");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section>
      <h2 className="text-xl font-semibold">Team</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Invite people to this project and control what they can change.
        {!roleLoading && myRole ? ` You are a ${ROLE_LABEL[myRole].toLowerCase()}.` : ""}
      </p>

      {canManage && (
        <div className="card-elevated mt-6 p-5">
          <h3 className="text-sm font-semibold">Invite a teammate</h3>
          <form
            className="mt-3 flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              invite.mutate();
            }}
          >
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@company.com"
              className="min-w-[220px] flex-1"
            />
            <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as ProjectRole)}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_ROLES.filter((r) => r !== "owner").map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={invite.isPending}>
              <UserPlus className="size-4" />
              Invite
            </Button>
          </form>
        </div>
      )}

      <h3 className="mt-8 text-sm font-semibold">Members</h3>
      <div className="mt-3 space-y-2">
        {members.isLoading ? (
          [0, 1].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)
        ) : !members.data?.length ? (
          <div className="card-elevated px-6 py-10 text-center text-sm text-muted-foreground">
            No members yet.
          </div>
        ) : (
          members.data.map((member: any) => (
            <div key={member.id} className="card-elevated flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {member.profiles?.name ?? "Teammate"}
                  {member.user_id === userId ? " (you)" : ""}
                </p>
                <p className="truncate text-xs text-muted-foreground">{member.profiles?.email}</p>
              </div>
              {canManage && member.role !== "owner" ? (
                <>
                  <Select
                    value={member.role}
                    onValueChange={(v) => changeRole.mutate({ id: member.id, role: v as ProjectRole })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_ROLES.filter((r) => r !== "owner").map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABEL[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Remove member"
                    onClick={() => removeMember.mutate(member.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </>
              ) : (
                <Badge variant="secondary" className="font-normal">
                  {ROLE_LABEL[member.role as ProjectRole]}
                </Badge>
              )}
            </div>
          ))
        )}
      </div>

      <h3 className="mt-8 text-sm font-semibold">Invitations</h3>
      <div className="mt-3 space-y-2">
        {!invitations.data?.length ? (
          <p className="text-sm text-muted-foreground">No invitations yet.</p>
        ) : (
          invitations.data.map((invitation: any) => (
            <div key={invitation.id} className="card-elevated flex flex-wrap items-center gap-3 p-4">
              <Mail className="size-4 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-sm">{invitation.invited_email}</span>
              <Badge variant="outline" className="font-normal">
                {ROLE_LABEL[invitation.role as ProjectRole]}
              </Badge>
              <Badge
                variant={invitation.status === "pending" ? "secondary" : "outline"}
                className="font-normal capitalize"
              >
                {invitation.status}
              </Badge>
              {canManage && invitation.status === "pending" && (
                <Button size="sm" variant="ghost" onClick={() => revokeInvite.mutate(invitation.id)}>
                  Revoke
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
