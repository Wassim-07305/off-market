"use client";

import {
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ROLE_OPTIONS } from "@/types/invitations";
import type { UserInvite } from "@/types/invitations";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: typeof Clock }
> = {
  pending: {
    label: "En attente",
    color: "text-amber-500 bg-amber-500/10",
    icon: Clock,
  },
  accepted: {
    label: "Acceptee",
    color: "text-emerald-500 bg-emerald-500/10",
    icon: CheckCircle,
  },
  expired: {
    label: "Expiree",
    color: "text-red-500 bg-red-500/10",
    icon: XCircle,
  },
};

interface InvitationStatusTableProps {
  invitations: UserInvite[];
  onDelete: (id: string) => void;
  onResend: (id: string) => void;
  isResending?: boolean;
}

export function InvitationStatusTable({
  invitations,
  onDelete,
  onResend,
  isResending,
}: InvitationStatusTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = async (inviteCode: string, id: string) => {
    const link = `${window.location.origin}/register?code=${inviteCode}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm("Supprimer cette invitation ?")) {
      onDelete(id);
    }
  };

  if (invitations.length === 0) return null;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
              Nom
            </th>
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
              Email
            </th>
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
              Role
            </th>
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
              Statut
            </th>
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
              Date
            </th>
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
              Renvois
            </th>
            <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {invitations.map((invite) => {
            const statusInfo = STATUS_CONFIG[invite.status];
            const StatusIcon = statusInfo?.icon ?? Clock;
            const daysAgo = Math.floor(
              (Date.now() - new Date(invite.created_at).getTime()) /
                (1000 * 60 * 60 * 24),
            );

            return (
              <tr
                key={invite.id}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  {invite.full_name}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {invite.email}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-foreground">
                    {ROLE_OPTIONS.find((r) => r.value === invite.role)?.label ??
                      invite.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                      statusInfo?.color,
                    )}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusInfo?.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  <div>
                    {new Date(invite.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  {invite.status === "pending" && daysAgo > 0 && (
                    <div className="text-muted-foreground/60">
                      Il y a {daysAgo}j
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {invite.resent_count > 0 ? (
                    <span className="text-xs">
                      {invite.resent_count}x
                      {invite.resent_at && (
                        <span className="block text-muted-foreground/60">
                          {new Date(invite.resent_at).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          )}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/40">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {invite.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleCopyLink(invite.invite_code, invite.id)
                          }
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Copier le lien"
                        >
                          {copiedId === invite.id ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => onResend(invite.id)}
                          disabled={isResending}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                          title="Renvoyer l'invitation"
                        >
                          {isResending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(invite.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
