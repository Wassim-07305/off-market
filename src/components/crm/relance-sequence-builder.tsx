"use client";

import { useState, useCallback } from "react";
import {
  Mail,
  Smartphone,
  Bell,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Clock,
  Zap,
  Eye,
  Power,
  GripVertical,
  Variable,
  Save,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  useRelanceSequence,
  useCreateSequence,
  useUpdateSequence,
  useAddStep,
  useUpdateStep,
  useDeleteStep,
} from "@/hooks/use-relance";
import {
  RELANCE_VARIABLES,
  RELANCE_CHANNELS,
  type RelanceStep,
  type RelanceChannel,
} from "@/types/relance";
import { PIPELINE_STAGES } from "@/types/pipeline";

// ─── Channel icon helper ─────────────────────────────────

function ChannelIcon({
  channel,
  className,
}: {
  channel: RelanceChannel;
  className?: string;
}) {
  switch (channel) {
    case "email":
      return <Mail className={cn("h-4 w-4", className)} />;
    case "sms":
      return <Smartphone className={cn("h-4 w-4", className)} />;
    case "notification":
      return <Bell className={cn("h-4 w-4", className)} />;
  }
}

const channelLabel = (ch: RelanceChannel) =>
  RELANCE_CHANNELS.find((c) => c.value === ch)?.label ?? ch;

// ─── Step Editor Modal ───────────────────────────────────

interface StepEditorProps {
  open: boolean;
  onClose: () => void;
  step?: Partial<RelanceStep>;
  onSave: (data: {
    delay_days: number;
    channel: RelanceChannel;
    subject?: string;
    content: string;
  }) => void;
  loading?: boolean;
}

function StepEditorModal({
  open,
  onClose,
  step,
  onSave,
  loading,
}: StepEditorProps) {
  const [delayDays, setDelayDays] = useState(step?.delay_days ?? 1);
  const [channel, setChannel] = useState<RelanceChannel>(
    step?.channel ?? "email",
  );
  const [subject, setSubject] = useState(step?.subject ?? "");
  const [content, setContent] = useState(step?.content ?? "");
  const [showVars, setShowVars] = useState(false);

  const handleSave = () => {
    if (!content.trim()) return;
    onSave({
      delay_days: delayDays,
      channel,
      subject: channel === "email" ? subject : undefined,
      content,
    });
  };

  const insertVariable = (variable: string) => {
    setContent((prev) => prev + variable);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={step?.id ? "Modifier l'etape" : "Nouvelle etape"}
      size="lg"
    >
      <div className="flex flex-col gap-4">
        {/* Delay */}
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            type="number"
            min={0}
            value={delayDays}
            onChange={(e) => setDelayDays(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-sm text-muted-foreground">
            jour{delayDays !== 1 ? "s" : ""} apres l'etape precedente
          </span>
        </div>

        {/* Channel */}
        <Select
          label="Canal"
          options={RELANCE_CHANNELS.map((c) => ({
            value: c.value,
            label: c.label,
          }))}
          value={channel}
          onChange={(val) => setChannel(val as RelanceChannel)}
        />

        {/* Subject (email only) */}
        {channel === "email" && (
          <Input
            label="Objet de l'email"
            placeholder="Ex: {{prenom}}, on prend 15 min ?"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        )}

        {/* Content */}
        <div className="relative">
          <Textarea
            label="Contenu du message"
            placeholder="Bonjour {{prenom}}, ..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoGrow
            className="min-h-[120px]"
          />
          <button
            type="button"
            onClick={() => setShowVars(!showVars)}
            className={cn(
              "absolute top-0 right-0 flex items-center gap-1 text-xs text-muted-foreground",
              "hover:text-foreground transition-colors cursor-pointer",
              "px-1.5 py-0.5 rounded-md",
              showVars && "bg-secondary text-foreground",
            )}
          >
            <Variable className="h-3 w-3" />
            Variables
          </button>
        </div>

        {/* Variables helper */}
        {showVars && (
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground mb-2">
              Cliquez pour inserer une variable :
            </p>
            <div className="flex flex-wrap gap-1.5">
              {RELANCE_VARIABLES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => insertVariable(v.key)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs",
                    "bg-surface border border-border",
                    "hover:border-primary/40 hover:bg-primary/5",
                    "transition-colors cursor-pointer",
                  )}
                >
                  <code className="text-primary font-mono text-[11px]">
                    {v.key}
                  </code>
                  <span className="text-muted-foreground">— {v.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Preview */}
        {content && (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Apercu
            </p>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {content
                .replace(/\{\{prenom\}\}/g, "Marie")
                .replace(/\{\{entreprise\}\}/g, "Acme SAS")
                .replace(/\{\{etape\}\}/g, "Proposition")
                .replace(/\{\{valeur\}\}/g, "5 000 EUR")
                .replace(/\{\{jours_sans_contact\}\}/g, "7")}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            loading={loading}
            disabled={!content.trim()}
            icon={<Save className="h-4 w-4" />}
          >
            {step?.id ? "Mettre a jour" : "Ajouter l'etape"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Sequence Builder ────────────────────────────────────

interface RelanceSequenceBuilderProps {
  sequenceId?: string | null;
  onBack?: () => void;
}

export function RelanceSequenceBuilder({
  sequenceId,
  onBack,
}: RelanceSequenceBuilderProps) {
  const { data: sequence, isLoading } = useRelanceSequence(sequenceId ?? null);
  const createSequence = useCreateSequence();
  const updateSequence = useUpdateSequence();
  const addStep = useAddStep();
  const updateStep = useUpdateStep();
  const deleteStep = useDeleteStep();

  // Local state for new sequence creation
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetStage, setTargetStage] = useState("prospect");
  const [localSteps, setLocalSteps] = useState<
    Array<{
      delay_days: number;
      channel: RelanceChannel;
      subject?: string;
      content: string;
    }>
  >([]);

  // Step editor modal state
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<RelanceStep | null>(null);
  const [insertAtOrder, setInsertAtOrder] = useState<number>(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isEditMode = !!sequenceId && !!sequence;
  const steps = isEditMode ? (sequence?.steps ?? []) : [];

  // ─── Create new sequence ───────────────
  const handleCreate = useCallback(() => {
    if (!name.trim()) return;
    createSequence.mutate(
      {
        name,
        description: description || undefined,
        target_stage: targetStage,
        steps: localSteps,
      },
      { onSuccess: () => onBack?.() },
    );
  }, [name, description, targetStage, localSteps, createSequence, onBack]);

  // ─── Toggle active state ───────────────
  const toggleActive = useCallback(() => {
    if (!sequence) return;
    updateSequence.mutate({
      id: sequence.id,
      is_active: !sequence.is_active,
    });
  }, [sequence, updateSequence]);

  // ─── Save sequence metadata ────────────
  const handleSaveMetadata = useCallback(() => {
    if (!sequence) return;
    updateSequence.mutate({
      id: sequence.id,
      name: name || sequence.name,
      description: description || sequence.description,
      target_stage: targetStage || sequence.target_stage,
    });
  }, [sequence, name, description, targetStage, updateSequence]);

  // ─── Add step ──────────────────────────
  const handleAddStep = useCallback(
    (data: {
      delay_days: number;
      channel: RelanceChannel;
      subject?: string;
      content: string;
    }) => {
      if (isEditMode) {
        addStep.mutate(
          {
            sequence_id: sequence!.id,
            step_order: insertAtOrder,
            ...data,
          },
          { onSuccess: () => setStepModalOpen(false) },
        );
      } else {
        // Creating new sequence — accumulate steps locally
        setLocalSteps((prev) => {
          const newSteps = [...prev];
          newSteps.splice(insertAtOrder - 1, 0, data);
          return newSteps;
        });
        setStepModalOpen(false);
      }
    },
    [isEditMode, sequence, addStep, insertAtOrder],
  );

  // ─── Update step ──────────────────────
  const handleUpdateStep = useCallback(
    (data: {
      delay_days: number;
      channel: RelanceChannel;
      subject?: string;
      content: string;
    }) => {
      if (!editingStep || !sequence) return;
      updateStep.mutate(
        {
          id: editingStep.id,
          sequence_id: sequence.id,
          ...data,
        },
        {
          onSuccess: () => {
            setStepModalOpen(false);
            setEditingStep(null);
          },
        },
      );
    },
    [editingStep, sequence, updateStep],
  );

  // ─── Delete step ──────────────────────
  const handleDeleteStep = useCallback(
    (stepId: string) => {
      if (!sequence) return;
      deleteStep.mutate(
        { id: stepId, sequence_id: sequence.id },
        { onSuccess: () => setDeleteConfirm(null) },
      );
    },
    [sequence, deleteStep],
  );

  // ─── Move step up/down ─────────────────
  const handleMoveStep = useCallback(
    (step: RelanceStep, direction: "up" | "down") => {
      if (!sequence) return;
      const allSteps = sequence.steps ?? [];
      const idx = allSteps.findIndex((s) => s.id === step.id);
      if (idx < 0) return;

      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= allSteps.length) return;

      const swapStep = allSteps[swapIdx];

      // Swap step_order values
      updateStep.mutate({
        id: step.id,
        sequence_id: sequence.id,
        step_order: swapStep.step_order,
      });
      updateStep.mutate({
        id: swapStep.id,
        sequence_id: sequence.id,
        step_order: step.step_order,
      });
    },
    [sequence, updateStep],
  );

  // ─── Initialize editing fields from loaded sequence
  const effectiveName = isEditMode ? name || (sequence?.name ?? "") : name;
  const effectiveDescription = isEditMode
    ? description || (sequence?.description ?? "")
    : description;
  const effectiveStage = isEditMode
    ? targetStage || (sequence?.target_stage ?? "prospect")
    : targetStage;

  // For new sequence, display local steps
  const displaySteps = isEditMode
    ? steps
    : localSteps.map((s, i) => ({
        ...s,
        id: `local-${i}`,
        sequence_id: "",
        step_order: i + 1,
        is_active: true,
        created_at: "",
      }));

  if (isEditMode && isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isEditMode
                ? "Modifier la sequence"
                : "Nouvelle sequence de relance"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isEditMode
                ? "Gerez les etapes et parametres de cette sequence"
                : "Configurez votre sequence de relance automatique"}
            </p>
          </div>
        </div>
        {isEditMode && sequence && (
          <div className="flex items-center gap-2">
            <Tooltip
              content={
                sequence.is_active
                  ? "Desactiver la sequence"
                  : "Activer la sequence"
              }
            >
              <Button
                variant={sequence.is_active ? "secondary" : "outline"}
                size="sm"
                onClick={toggleActive}
                icon={<Power className="h-4 w-4" />}
              >
                {sequence.is_active ? "Active" : "Inactive"}
              </Button>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Metadata form */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nom de la sequence"
            placeholder="Ex: Relance prospect J+3/J+7/J+14"
            value={effectiveName}
            onChange={(e) => setName(e.target.value)}
          />
          <Select
            label="Etape cible du pipeline"
            options={PIPELINE_STAGES.map((s) => ({
              value: s.value,
              label: s.label,
            }))}
            value={effectiveStage}
            onChange={(val) => setTargetStage(val)}
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Description (optionnel)"
              placeholder="Decrivez l'objectif de cette sequence..."
              value={effectiveDescription}
              onChange={(e) => setDescription(e.target.value)}
              autoGrow
              className="min-h-[60px]"
            />
          </div>
        </div>
        {isEditMode && (
          <div className="flex justify-end mt-4">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSaveMetadata}
              loading={updateSequence.isPending}
              icon={<Save className="h-3.5 w-3.5" />}
            >
              Enregistrer
            </Button>
          </div>
        )}
      </div>

      {/* Steps timeline */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">
            Etapes de la sequence
          </h3>
          <Badge variant="secondary">
            {displaySteps.length} etape{displaySteps.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        {/* Timeline */}
        <div className="relative">
          {displaySteps.length > 0 && (
            <div className="absolute left-[19px] top-6 bottom-6 w-px bg-border" />
          )}

          <div className="flex flex-col gap-0">
            {/* Enrollment start marker */}
            <div className="flex items-center gap-3 mb-3">
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <Zap className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Inscription du contact
                </p>
                <p className="text-xs text-muted-foreground">
                  La sequence demarre automatiquement
                </p>
              </div>
            </div>

            {displaySteps.map((step, idx) => (
              <div key={step.id} className="relative">
                {/* Add step button before */}
                <div className="flex justify-center py-1">
                  <Tooltip content="Inserer une etape ici">
                    <button
                      type="button"
                      onClick={() => {
                        setInsertAtOrder(step.step_order);
                        setEditingStep(null);
                        setStepModalOpen(true);
                      }}
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full",
                        "border border-dashed border-border bg-surface",
                        "text-muted-foreground hover:text-primary hover:border-primary/40",
                        "transition-all cursor-pointer opacity-0 hover:opacity-100",
                        "focus:opacity-100",
                      )}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </Tooltip>
                </div>

                {/* Step card */}
                <div
                  className={cn(
                    "group flex items-start gap-3 rounded-xl border p-3 ml-0",
                    "transition-all duration-200",
                    "hover:shadow-sm hover:border-primary/20",
                    step.is_active
                      ? "border-border bg-surface"
                      : "border-border/50 bg-muted/30 opacity-60",
                  )}
                >
                  {/* Step indicator */}
                  <div className="relative z-10 flex flex-col items-center gap-1 pt-0.5">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full shrink-0",
                        step.channel === "email"
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : step.channel === "sms"
                            ? "bg-purple-100 dark:bg-purple-900/30"
                            : "bg-amber-100 dark:bg-amber-900/30",
                      )}
                    >
                      <ChannelIcon
                        channel={step.channel as RelanceChannel}
                        className={cn(
                          step.channel === "email"
                            ? "text-blue-600"
                            : step.channel === "sms"
                              ? "text-purple-600"
                              : "text-amber-600",
                        )}
                      />
                    </div>
                    {/* Grip for drag indication */}
                    <GripVertical className="h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                  </div>

                  {/* Step content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[11px]">
                          <Clock className="h-3 w-3 mr-1" />
                          J+{step.delay_days}
                        </Badge>
                        <Badge variant="secondary" className="text-[11px]">
                          {channelLabel(step.channel as RelanceChannel)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Etape {idx + 1}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isEditMode && (
                          <>
                            <Tooltip content="Monter">
                              <button
                                type="button"
                                onClick={() =>
                                  handleMoveStep(step as RelanceStep, "up")
                                }
                                disabled={idx === 0}
                                className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                              >
                                <ChevronUp className="h-3.5 w-3.5" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Descendre">
                              <button
                                type="button"
                                onClick={() =>
                                  handleMoveStep(step as RelanceStep, "down")
                                }
                                disabled={idx === displaySteps.length - 1}
                                className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                              >
                                <ChevronDown className="h-3.5 w-3.5" />
                              </button>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip content="Modifier">
                          <button
                            type="button"
                            onClick={() => {
                              if (isEditMode) {
                                setEditingStep(step as RelanceStep);
                              }
                              setStepModalOpen(true);
                            }}
                            className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Supprimer">
                          <button
                            type="button"
                            onClick={() => {
                              if (isEditMode) {
                                setDeleteConfirm(step.id);
                              } else {
                                setLocalSteps((prev) =>
                                  prev.filter((_, i) => i !== idx),
                                );
                              }
                            }}
                            className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </Tooltip>
                      </div>
                    </div>

                    {/* Subject */}
                    {step.subject && (
                      <p className="text-sm font-medium text-foreground mt-1.5 truncate">
                        {step.subject}
                      </p>
                    )}

                    {/* Content preview */}
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {step.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Add step at end */}
            <div className="flex justify-center py-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setInsertAtOrder(displaySteps.length + 1);
                  setEditingStep(null);
                  setStepModalOpen(true);
                }}
                icon={<Plus className="h-3.5 w-3.5" />}
              >
                Ajouter une etape
              </Button>
            </div>

            {/* Completion marker */}
            {displaySteps.length > 0 && (
              <div className="flex items-center gap-3 mt-1">
                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <span className="text-xs font-bold text-muted-foreground">
                    FIN
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Sequence terminee
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Le contact est marque comme "relance terminee"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Empty state */}
        {displaySteps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Aucune etape configuree
            </p>
            <p className="text-xs text-muted-foreground mb-4 max-w-xs">
              Ajoutez des etapes pour definir le rythme et le contenu de vos
              relances automatiques.
            </p>
            <Button
              size="sm"
              onClick={() => {
                setInsertAtOrder(1);
                setEditingStep(null);
                setStepModalOpen(true);
              }}
              icon={<Plus className="h-3.5 w-3.5" />}
            >
              Premiere etape
            </Button>
          </div>
        )}
      </div>

      {/* Create button for new sequences */}
      {!isEditMode && (
        <div className="flex justify-end gap-2">
          {onBack && (
            <Button variant="secondary" onClick={onBack}>
              Annuler
            </Button>
          )}
          <Button
            onClick={handleCreate}
            loading={createSequence.isPending}
            disabled={!name.trim() || localSteps.length === 0}
            icon={<Save className="h-4 w-4" />}
          >
            Creer la sequence
          </Button>
        </div>
      )}

      {/* Step editor modal */}
      <StepEditorModal
        open={stepModalOpen}
        onClose={() => {
          setStepModalOpen(false);
          setEditingStep(null);
        }}
        step={editingStep ?? undefined}
        onSave={editingStep ? handleUpdateStep : handleAddStep}
        loading={addStep.isPending || updateStep.isPending}
      />

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Supprimer cette etape ?"
        size="sm"
      >
        <p className="text-sm text-muted-foreground mb-4">
          Cette action est irreversible. L'etape sera supprimee de la sequence.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteConfirm && handleDeleteStep(deleteConfirm)}
            loading={deleteStep.isPending}
            icon={<Trash2 className="h-4 w-4" />}
          >
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
