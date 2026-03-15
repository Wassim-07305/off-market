"use client";

import { useState } from "react";
import {
  Plus,
  Zap,
  Trash2,
  Power,
  BarChart3,
  Users,
  Mail,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import {
  useRelanceSequences,
  useDeleteSequence,
  useRelanceStats,
} from "@/hooks/use-relance";
import { PIPELINE_STAGES } from "@/types/pipeline";
import { RelanceSequenceBuilder } from "@/components/crm/relance-sequence-builder";

export function RelanceSequencesView() {
  const { data: sequences, isLoading } = useRelanceSequences();
  const { data: stats } = useRelanceStats();
  const deleteSequence = useDeleteSequence();

  const [selectedSequenceId, setSelectedSequenceId] = useState<string | null>(
    null,
  );
  const [showCreate, setShowCreate] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // If editing or creating, show the builder
  if (showCreate || selectedSequenceId) {
    return (
      <RelanceSequenceBuilder
        sequenceId={selectedSequenceId}
        onBack={() => {
          setSelectedSequenceId(null);
          setShowCreate(false);
        }}
      />
    );
  }

  const getStageLabel = (stage: string) =>
    PIPELINE_STAGES.find((s) => s.value === stage)?.label ?? stage;

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Sequences actives",
              value: stats.total_sequences,
              icon: Zap,
              color: "text-primary",
            },
            {
              label: "Contacts inscrits",
              value: stats.active_enrollments,
              icon: Users,
              color: "text-emerald-600",
            },
            {
              label: "Messages envoyes",
              value: stats.total_sent,
              icon: Mail,
              color: "text-blue-600",
            },
            {
              label: "Taux d'ouverture",
              value: `${stats.open_rate}%`,
              icon: BarChart3,
              color: "text-amber-600",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={cn("h-4 w-4", stat.color)} />
                  <span className="text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
                <p className="text-xl font-bold text-foreground font-mono tabular-nums">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Sequences de relance
          </h2>
          <p className="text-sm text-muted-foreground">
            Automatisez vos follow-ups pour chaque etape du pipeline
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Nouvelle sequence
        </Button>
      </div>

      {/* Sequences list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-muted/50 animate-shimmer"
            />
          ))}
        </div>
      ) : !sequences?.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/50 mb-4">
            <Zap className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            Aucune sequence
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Creez votre premiere sequence de relance pour automatiser le suivi
            de vos prospects et maximiser vos conversions.
          </p>
          <Button
            onClick={() => setShowCreate(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            Creer une sequence
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {sequences.map((seq) => (
            <button
              key={seq.id}
              type="button"
              onClick={() => setSelectedSequenceId(seq.id)}
              className={cn(
                "w-full flex items-center gap-4 rounded-xl border p-4 text-left",
                "transition-all cursor-pointer",
                "hover:shadow-sm hover:border-primary/20",
                seq.is_active
                  ? "border-border bg-white"
                  : "border-border/50 bg-muted/30 opacity-70",
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl shrink-0",
                  seq.is_active ? "bg-primary/10" : "bg-muted",
                )}
              >
                <Zap
                  className={cn(
                    "h-5 w-5",
                    seq.is_active ? "text-primary" : "text-muted-foreground",
                  )}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {seq.name}
                  </p>
                  {!seq.is_active && (
                    <Badge variant="secondary" className="text-[10px]">
                      <Power className="h-2.5 w-2.5 mr-0.5" />
                      Inactive
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">
                    Cible : {getStageLabel(seq.target_stage)}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {seq.step_count} etape
                    {(seq.step_count ?? 0) !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {seq.enrollment_count} inscrit
                    {(seq.enrollment_count ?? 0) !== 1 ? "s" : ""}
                  </span>
                </div>
                {seq.description && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {seq.description}
                  </p>
                )}
              </div>

              {/* Delete */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirm(seq.id);
                }}
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </button>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Supprimer cette sequence ?"
        size="sm"
      >
        <p className="text-sm text-muted-foreground mb-4">
          Cette action supprimera la sequence et toutes ses etapes. Les
          inscriptions en cours seront annulees.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (deleteConfirm) {
                deleteSequence.mutate(deleteConfirm, {
                  onSuccess: () => setDeleteConfirm(null),
                });
              }
            }}
            loading={deleteSequence.isPending}
            icon={<Trash2 className="h-4 w-4" />}
          >
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
