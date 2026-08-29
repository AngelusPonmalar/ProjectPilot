import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { MailOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listMyInvitations, respondToInvitation } from "@/lib/team.functions";
import { ROLE_LABEL, type ProjectRole } from "@/lib/team-queries";

export function InvitationsInbox() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const fetchInvitations = useServerFn(listMyInvitations);
  const respond = useServerFn(respondToInvitation);

  const { data: invitations } = useQuery({
    queryKey: ["my-invitations"],
    queryFn: () => fetchInvitations(),
  });

  const answer = useMutation({
    mutationFn: (input: { invitationId: string; accept: boolean }) => respond({ data: input }),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["my-invitations"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      if (result.accepted) {
        toast.success("You joined the project");
        navigate({ to: "/projects/$projectId", params: { projectId: result.projectId } });
      } else {
        toast.success("Invitation declined");
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!invitations?.length) return null;

  return (
    <div className="card-elevated mb-8 p-5">
      <div className="flex items-center gap-2">
        <MailOpen className="size-4 text-primary" />
        <h2 className="text-sm font-semibold">
          You have {invitations.length} project invitation{invitations.length > 1 ? "s" : ""}
        </h2>
      </div>
      <div className="mt-4 space-y-2">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{invitation.projectName}</p>
              <p className="text-xs text-muted-foreground">
                Invited by {invitation.invitedBy}
              </p>
            </div>
            <Badge variant="secondary" className="font-normal">
              {ROLE_LABEL[invitation.role as ProjectRole] ?? invitation.role}
            </Badge>
            <Button
              size="sm"
              disabled={answer.isPending}
              onClick={() => answer.mutate({ invitationId: invitation.id, accept: true })}
            >
              Join
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={answer.isPending}
              onClick={() => answer.mutate({ invitationId: invitation.id, accept: false })}
            >
              Decline
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
