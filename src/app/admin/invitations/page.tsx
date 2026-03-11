"use client";

import { useState } from "react";
import { Mail, Plus, Copy, Check, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";
import { useInvitations } from "@/hooks/use-invitations";
import { InviteUserModal } from "@/components/invitations/invite-user-modal";
import { ROLE_OPTIONS } from "@/types/invitations";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "pending" | "accepted" | "expired";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "En attente", color: "text-amber-500 bg-amber-500/10", icon: Clock },
  accepted: { label: "Acceptee", color: "text-emerald-500 bg-emerald-500/10", icon: CheckCircle },
  expired: { label: "Expiree", color: "text-red-500 bg-red-500/10", icon: XCircle },
};

export default function InvitationsPage() {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { invitations, isLoading, deleteInvitation } = useInvitations();

  const filtered =
    filter === "all"
      ? invitations
      : invitations.filter((i) => i.status === filter);

  const handleCopyLink = async (inviteCode: string, id: string) => {
    const link = `${window.location.origin}/register?code=${inviteCode}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm("Supprimer cette invitation ?")) {
      deleteInvitation.mutate(id);
    }
  };

  const counts = {
    all: invitations.length,
    pending: invitations.filter((i) => i.status === "pending").length,
    accepted: invitations.filter((i) => i.status === "accepted").length,
    expired: invitations.filter((i) => i.status === "expired").length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invitations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerez les invitations pour ajouter des utilisateurs
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="h-10 px-4 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle invitation
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        {(["all", "pending", "accepted", "expired"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "h-8 px-3 rounded-lg text-xs font-medium transition-colors",
              filter === s
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {s === "all" ? "Toutes" : STATUS_LABELS[s].label} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Chargement...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <Mail className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune invitation</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-3 text-sm text-primary hover:text-primary-hover font-medium transition-colors"
          >
            Creer une invitation
          </button>
        </div>
      ) : (
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
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((invite) => {
                const statusInfo = STATUS_LABELS[invite.status];
                const StatusIcon = statusInfo?.icon ?? Clock;
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
                        {ROLE_OPTIONS.find((r) => r.value === invite.role)?.label ?? invite.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                          statusInfo?.color
                        )}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(invite.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {invite.status === "pending" && (
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
      )}

      <InviteUserModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
