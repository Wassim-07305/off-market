"use client";

import { useState } from "react";
import { Flag, X } from "lucide-react";
import { REPORT_REASONS } from "@/types/feed";
import type { ReportReason } from "@/types/feed";
import { useFeedReports } from "@/hooks/use-reports-moderation";
import { toast } from "sonner";

export function ReportButton({
  postId,
  commentId,
}: {
  postId?: string;
  commentId?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[11px] text-muted-foreground hover:text-error transition-colors flex items-center gap-1"
      >
        <Flag className="w-3 h-3" />
        Signaler
      </button>
      {open && (
        <ReportModal
          postId={postId}
          commentId={commentId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function ReportModal({
  postId,
  commentId,
  onClose,
}: {
  postId?: string;
  commentId?: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");
  const { createReport } = useFeedReports();

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Veuillez sélectionner une raison");
      return;
    }
    try {
      await createReport.mutateAsync({
        post_id: postId,
        comment_id: commentId,
        reason,
        details: details.trim() || undefined,
      });
      toast.success("Signalement envoye");
      onClose();
    } catch {
      toast.error("Erreur lors du signalement");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative bg-surface rounded-2xl w-full max-w-md p-6 space-y-5"
        style={{ boxShadow: "var(--shadow-elevated)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Signaler le contenu
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Pourquoi signalez-vous ce contenu ?
          </p>
          <div className="space-y-1.5">
            {REPORT_REASONS.map((r) => (
              <button
                key={r.value}
                onClick={() => setReason(r.value)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                  reason === r.value
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "bg-muted text-foreground hover:bg-muted/80 border border-transparent"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">
            Details (optionnel)
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Decrivez le problème..."
            rows={3}
            className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || createReport.isPending}
            className="flex-1 h-10 bg-error text-white rounded-xl text-sm font-medium hover:bg-error/90 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {createReport.isPending ? "Envoi..." : "Signaler"}
          </button>
        </div>
      </div>
    </div>
  );
}
