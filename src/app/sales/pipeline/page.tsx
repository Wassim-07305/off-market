"use client";

import { useState, useMemo, useCallback, useRef, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageTransition } from "@/components/ui/page-transition";
import { HeroMetric } from "@/components/dashboard/hero-metric";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import {
  usePipelineContacts,
  useCloserPipeline,
  useUpdateContactStage,
  useContactInteractions,
  useAddInteraction,
  useUpdateLeadScore,
  useClaimProspect,
  useReturnToSetter,
  useCancelDeal,
  type PipelineMode,
} from "@/hooks/use-pipeline";
import { AddProspectModal } from "@/components/crm/add-prospect-modal";
import { AssignCloserModal } from "@/components/crm/assign-closer-modal";
import { SetterBilan } from "@/components/crm/setter-bilan";
import {
  PIPELINE_STAGES,
  SETTER_STAGES,
  CLOSER_STAGES,
  CONTACT_SOURCES,
  INTERACTION_TYPES,
  type CrmContact,
  type PipelineStage,
  type CloserStage,
  type InteractionType,
} from "@/types/pipeline";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import {
  Search,
  Users,
  TrendingUp,
  BarChart3,
  X,
  Phone,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Plus,
  Activity,
  Clock,
  Hash,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────

const SETTER_KANBAN_STAGES = SETTER_STAGES.filter((s) => s.value !== "perdu");
const CLOSER_KANBAN_STAGES = CLOSER_STAGES.filter((s) => s.value !== "perdu");

function getScoreColor(score: number): string {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  if (score >= 25) return "bg-orange-500";
  return "bg-red-500";
}

function getScoreTextColor(score: number): string {
  if (score >= 75) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  if (score >= 25) return "text-orange-600";
  return "text-red-600";
}

const INTERACTION_ICON_MAP: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  message: MessageSquare,
};

// ─── Stats Bar ───────────────────────────────────────────────

function StatsBar({ contacts, stages }: { contacts: CrmContact[]; stages: typeof PIPELINE_STAGES }) {
  const totalContacts = contacts.length;
  const avgScore =
    totalContacts > 0
      ? Math.round(
          contacts.reduce((sum, c) => sum + (c.lead_score ?? 0), 0) /
            totalContacts,
        )
      : 0;

  const perStage = stages.map((s) => ({
    ...s,
    count: contacts.filter((c) => c.stage === s.value).length,
  }));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-surface border border-border rounded-md p-3">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Users className="w-3.5 h-3.5" />
          <span className="text-[10px] font-medium uppercase tracking-wider">
            Total contacts
          </span>
        </div>
        <p className="text-lg font-semibold text-foreground">{totalContacts}</p>
      </div>
      <div className="bg-surface border border-border rounded-md p-3">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="text-[10px] font-medium uppercase tracking-wider">
            Score moyen
          </span>
        </div>
        <p className={cn("text-lg font-semibold", getScoreTextColor(avgScore))}>
          {avgScore}/100
        </p>
      </div>
      {perStage.slice(0, 2).map((s) => (
        <div
          key={s.value}
          className="bg-surface border border-border rounded-md p-3"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium uppercase tracking-wider">
              {s.label}
            </span>
          </div>
          <p className={cn("text-lg font-semibold", s.color)}>{s.count}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Contact Card ────────────────────────────────────────────

function ContactCard({
  contact,
  onClick,
  isCloserView,
}: {
  contact: CrmContact;
  onClick: () => void;
  /** When true, don't apply the "with closer" lock (we ARE the closer) */
  isCloserView?: boolean;
}) {
  const score = contact.lead_score ?? 0;
  const isWithCloser = !isCloserView && !!contact.closer_id && !!contact.closer_stage && !contact.returned_by_closer;
  const isReturned = !isCloserView && !!contact.returned_by_closer;

  // Find closer stage label
  const closerStageLabel = isWithCloser
    ? CLOSER_STAGES.find((s) => s.value === contact.closer_stage)?.label ?? ""
    : "";

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.4, 0, 1] }}
      layout
      onClick={isWithCloser ? undefined : onClick}
      disabled={isWithCloser}
      className={cn(
        "w-full text-left bg-surface border border-border rounded-md p-3 transition-all group",
        isWithCloser
          ? "opacity-50 cursor-not-allowed"
          : "hover:border-hover hover:shadow-sm hover:-translate-y-[1px]",
      )}
    >
      <div className="flex items-start justify-between mb-1.5">
        <p className="text-sm font-medium text-foreground truncate pr-2">
          {contact.full_name}
        </p>
        {!isWithCloser && (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors shrink-0 mt-0.5" />
        )}
      </div>

      {/* Closer progress badge */}
      {isWithCloser && (
        <div className="mb-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
            Closer: {closerStageLabel}
          </span>
        </div>
      )}

      {/* Returned badge */}
      {isReturned && (
        <div className="mb-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600">
            Retourne
          </span>
        </div>
      )}

      {/* Non inscrit badge — closed without profile */}
      {isCloserView && contact.closer_stage === "close" && !contact.converted_profile_id && (
        <div className="mb-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600">
            Non inscrit — contrat a envoyer
          </span>
        </div>
      )}

      {contact.email && (
        <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1 mb-1.5">
          <Mail className="w-2.5 h-2.5 shrink-0" />
          {contact.email}
        </p>
      )}

      {/* Lead score bar */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              getScoreColor(score),
            )}
            style={{ width: `${score}%` }}
          />
        </div>
        <span
          className={cn(
            "text-[10px] font-mono font-medium",
            getScoreTextColor(score),
          )}
        >
          {score}
        </span>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        {contact.last_interaction_at && (
          <span className="flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />
            {formatDate(contact.last_interaction_at, "relative")}
          </span>
        )}
        {(contact.interaction_count ?? 0) > 0 && (
          <span className="flex items-center gap-0.5 bg-muted px-1.5 py-0.5 rounded-md font-medium">
            <Activity className="w-2.5 h-2.5" />
            {contact.interaction_count}
          </span>
        )}
      </div>
    </motion.button>
  );
}

// ─── Stage Column ────────────────────────────────────────────

function DraggableContactCard({
  contact,
  onClick,
  isCloserView,
}: {
  contact: CrmContact;
  onClick: () => void;
  isCloserView?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: contact.id });

  const style: CSSProperties = {
    ...(transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : {}),
    touchAction: "none",
    opacity: isDragging ? 0.3 : 1,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <ContactCard
        contact={contact}
        onClick={onClick}
        isCloserView={isCloserView}
      />
    </div>
  );
}

function StageColumn({
  stage,
  contacts,
  onCardClick,
  isCloserView,
}: {
  stage: { value: string; label: string; color: string; bg: string; dotColor: string };
  contacts: CrmContact[];
  onCardClick: (contact: CrmContact) => void;
  isCloserView?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.value });
  const total = contacts.reduce(
    (sum, c) => sum + Number(c.estimated_value ?? 0),
    0,
  );

  return (
    <div ref={setNodeRef} className="flex flex-col min-w-[260px] w-[260px] shrink-0">
      <div className="rounded-md px-3 py-2 mb-2 border border-border bg-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={cn("w-2 h-2 rounded-full shrink-0", stage.dotColor)}
            />
            <span className="text-xs font-semibold text-foreground">
              {stage.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-semibold min-w-[1rem] text-center px-1.5 py-0.5 rounded-md bg-foreground/10 text-foreground border border-border">
              {contacts.length}
            </span>
            {total > 0 && (
              <span className="text-[10px] text-muted-foreground font-mono">
                {total.toLocaleString("fr-FR")} EUR
              </span>
            )}
          </div>
        </div>
      </div>
      <div className={cn(
        "flex-1 space-y-2 min-h-[100px] rounded-lg p-1 -m-1 transition-all duration-200",
        isOver && "bg-primary/5 ring-1 ring-inset ring-primary/20",
      )}>
        {contacts.map((contact) => (
          <DraggableContactCard
            key={contact.id}
            contact={contact}
            onClick={() => onCardClick(contact)}
            isCloserView={isCloserView}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Contact Detail Drawer ───────────────────────────────────

function ContactDetailDrawer({
  contact,
  onClose,
  onAssignCloser,
  stageList,
}: {
  contact: CrmContact;
  onClose: () => void;
  onAssignCloser?: (contactId: string) => void;
  stageList?: typeof PIPELINE_STAGES;
}) {
  const { data: interactions, isLoading: loadingInteractions } =
    useContactInteractions(contact.id);
  const addInteraction = useAddInteraction();
  const updateLeadScore = useUpdateLeadScore();
  const updateStage = useUpdateContactStage();
  const stages = stageList ?? PIPELINE_STAGES;

  const [newType, setNewType] = useState<InteractionType>("note");
  const [newContent, setNewContent] = useState("");
  const [localScore, setLocalScore] = useState(contact.lead_score ?? 0);
  const [localStage, setLocalStage] = useState<PipelineStage>(contact.stage);
  const scoreTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleScoreChange = useCallback(
    (score: number) => {
      setLocalScore(score);
      if (scoreTimerRef.current) clearTimeout(scoreTimerRef.current);
      scoreTimerRef.current = setTimeout(() => {
        updateLeadScore.mutate({ id: contact.id, lead_score: score });
      }, 400);
    },
    [contact.id, updateLeadScore],
  );

  const handleStageChange = useCallback(
    (stage: PipelineStage) => {
      // If moving to "closing" and we have a closer assignment callback, open the modal
      if (stage === "closing" && onAssignCloser) {
        onAssignCloser(contact.id);
        return;
      }
      setLocalStage(stage);
      updateStage.mutate({ id: contact.id, stage });
    },
    [contact.id, updateStage, onAssignCloser],
  );

  const handleAddInteraction = useCallback(() => {
    if (!newContent.trim()) return;
    addInteraction.mutate(
      {
        contact_id: contact.id,
        type: newType,
        content: newContent,
      },
      {
        onSuccess: () => {
          setNewContent("");
        },
      },
    );
  }, [contact.id, newType, newContent, addInteraction]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full max-w-lg bg-surface border-l border-border h-full overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface/80 backdrop-blur-sm border-b border-border px-5 py-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              {contact.full_name}
            </h2>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Contact info */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Informations
            </h3>
            <div className="bg-muted/50 rounded-xl p-3 space-y-1.5">
              {contact.email && (
                <p className="text-sm text-foreground flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  {contact.email}
                </p>
              )}
              {contact.phone && (
                <p className="text-sm text-foreground flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  {contact.phone}
                </p>
              )}
              {contact.company && (
                <p className="text-sm text-foreground flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                  {contact.company}
                </p>
              )}
            </div>
          </div>

          {/* Lead score slider */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Score du lead
            </h3>
            <div className="bg-muted/50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={cn(
                    "text-lg font-semibold font-mono",
                    getScoreTextColor(localScore),
                  )}
                >
                  {localScore}
                </span>
                <span className="text-[10px] text-muted-foreground">/100</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={localScore}
                onChange={(e) => handleScoreChange(Number(e.target.value))}
                className="w-full h-2 bg-border dark:bg-zinc-600 rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md"
              />
            </div>
          </div>

          {/* Stage selector */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Étape
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {stages.map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleStageChange(s.value)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                    localStage === s.value
                      ? cn(
                          s.bg,
                          s.color,
                          "ring-1 ring-offset-1 ring-primary/20",
                        )
                      : "text-muted-foreground border-border hover:border-primary/30",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Add interaction form */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ajouter une interaction
            </h3>
            <div className="bg-muted/50 rounded-xl p-3 space-y-2">
              <div className="flex gap-1.5">
                {INTERACTION_TYPES.map((t) => {
                  const Icon = INTERACTION_ICON_MAP[t.value] ?? FileText;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setNewType(t.value)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border transition-all",
                        newType === t.value
                          ? "bg-primary text-white border-primary"
                          : "text-muted-foreground border-border hover:border-primary/30",
                      )}
                    >
                      <Icon className="w-2.5 h-2.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Decrivez l'interaction..."
                rows={3}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <button
                onClick={handleAddInteraction}
                disabled={!newContent.trim() || addInteraction.isPending}
                className="w-full h-8 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                Ajouter
              </button>
            </div>
          </div>

          {/* Interaction timeline */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Historique des interactions
            </h3>
            {loadingInteractions ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-muted rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : !interactions?.length ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Aucune interaction
              </p>
            ) : (
              <div className="space-y-1">
                {interactions.map((interaction) => {
                  const Icon =
                    INTERACTION_ICON_MAP[interaction.type] ?? FileText;
                  const typeConfig = INTERACTION_TYPES.find(
                    (t) => t.value === interaction.type,
                  );
                  return (
                    <div
                      key={interaction.id}
                      className="flex gap-3 py-2 border-b border-border/50 last:border-0"
                    >
                      <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-medium text-foreground">
                            {typeConfig?.label ?? interaction.type}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(interaction.created_at, "relative")}
                          </span>
                        </div>
                        {interaction.content && (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {interaction.content}
                          </p>
                        )}
                        {interaction.author && (
                          <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                            par {interaction.author.full_name}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Add Contact Modal ───────────────────────────────────────

function AddContactModal({
  open,
  onClose,
  onAdd,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (
    data: {
      full_name: string;
      email?: string;
      phone?: string;
      company?: string;
      source?: string;
      estimated_value?: number;
    },
    callbacks: { onSuccess: () => void },
  ) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [source, setSource] = useState("");
  const [value, setValue] = useState("");

  if (!open) return null;

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setSource("");
    setValue("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(
      {
        full_name: name,
        email: email || undefined,
        phone: phone || undefined,
        company: company || undefined,
        source: source || undefined,
        estimated_value: parseFloat(value) || undefined,
      },
      {
        onSuccess: () => {
          resetForm();
          onClose();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-foreground">
            Nouveau contact
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom complet *"
            required
            className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Telephone"
              className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Entreprise"
              className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Source</option>
              {CONTACT_SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Valeur estimee (EUR)"
            type="number"
            className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="flex-1 h-9 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Closer Kanban (reuses ContactCard + StageColumn shape) ──

export function CloserPipelineView() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const { contacts, isLoading, moveCloserStage } = useCloserPipeline(isAdmin);
  const returnToSetter = useReturnToSetter();
  const cancelDeal = useCancelDeal();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<CrmContact | null>(null);
  const [confirmModifyContact, setConfirmModifyContact] = useState<CrmContact | null>(null);

  const handleCardClick = useCallback((c: CrmContact) => {
    if (c.closer_stage === "close") {
      setConfirmModifyContact(c);
    } else {
      setSelectedContact(c);
    }
  }, []);

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    const term = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.full_name.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.company?.toLowerCase().includes(term),
    );
  }, [contacts, search]);

  const contactsByStage = useMemo(() => {
    const map = new Map<string, CrmContact[]>();
    CLOSER_KANBAN_STAGES.forEach((s) => map.set(s.value, []));
    filteredContacts.forEach((c) => {
      if (c.closer_stage) {
        const list = map.get(c.closer_stage);
        if (list) list.push(c);
      }
    });
    return map;
  }, [filteredContacts]);

  const totalValue = contacts
    .filter((c) => c.closer_stage !== "perdu")
    .reduce((sum, c) => sum + Number(c.estimated_value ?? 0), 0);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem}>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">
            Pipeline Closer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vos leads a closer — assignes par les setters
          </p>
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <HeroMetric
          label="Valeur du pipeline"
          value={`${totalValue.toLocaleString("fr-FR")} EUR`}
          change={
            contacts.length > 0
              ? { value: `${contacts.length} lead${contacts.length !== 1 ? "s" : ""} actif${contacts.length !== 1 ? "s" : ""}`, positive: true }
              : undefined
          }
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full h-8 pl-8 pr-3 bg-muted border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {CLOSER_KANBAN_STAGES.map((s) => (
              <div key={s.value} className="min-w-[260px] space-y-2">
                <div className="h-8 bg-muted rounded-xl animate-pulse" />
                <div className="h-24 bg-muted rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {CLOSER_KANBAN_STAGES.map((stage) => (
              <StageColumn
                key={stage.value}
                stage={stage}
                contacts={contactsByStage.get(stage.value) ?? []}
                onCardClick={handleCardClick}
                isCloserView
              />
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedContact && (
          <CloserDetailDrawer
            contact={selectedContact}
            onClose={() => setSelectedContact(null)}
            onStageChange={(stage) =>
              moveCloserStage.mutate({ id: selectedContact.id, closer_stage: stage })
            }
            onReturn={(id) => {
              returnToSetter.mutate(id);
              setSelectedContact(null);
            }}
            onCloseWithPrice={async (id, price) => {
              try {
                const res = await fetch("/api/pipeline/close-deal", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ contactId: id, finalPrice: price }),
                });
                if (res.ok) {
                  const result = await res.json();
                  if (result.contractId) {
                    toast.success("Deal close ! Contrat envoye au prospect.");
                  } else if (!result.profileId) {
                    toast.success("Deal close ! Prospect non inscrit — contrat a envoyer manuellement.");
                  } else {
                    toast.success("Deal close ! Contrat non genere automatiquement.");
                  }
                  queryClient.invalidateQueries({ queryKey: ["closer-pipeline"] });
                  queryClient.invalidateQueries({ queryKey: ["commissions"] });
                  setSelectedContact(null);
                } else {
                  toast.error("Erreur lors du closing");
                }
              } catch {
                toast.error("Erreur lors du closing");
              }
            }}
            isAdmin={isAdmin}
            onCancel={isAdmin ? (id, reason) => {
              cancelDeal.mutate({ contactId: id, reason });
              setSelectedContact(null);
            } : undefined}
          />
        )}
      </AnimatePresence>

      {/* Confirm modify closed deal */}
      {confirmModifyContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface border border-border rounded-2xl shadow-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Modifier un deal close</h3>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{confirmModifyContact.full_name}</span> est deja close. Si vous modifiez l'étape, le contrat envoye sera automatiquement supprime. Voulez-vous continuer ?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmModifyContact(null)}
                className="flex-1 h-9 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setSelectedContact(confirmModifyContact);
                  setConfirmModifyContact(null);
                }}
                className="flex-1 h-9 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                Oui, modifier
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Closer Detail Drawer (interactive — full editing) ──────

function CloserDetailDrawer({
  contact,
  onClose,
  onStageChange,
  onReturn,
  onCloseWithPrice,
  isAdmin,
  onCancel,
}: {
  contact: CrmContact;
  onClose: () => void;
  onStageChange: (stage: CloserStage) => void;
  onReturn: (contactId: string) => void;
  onCloseWithPrice: (contactId: string, price: number) => void;
  isAdmin?: boolean;
  onCancel?: (contactId: string, reason: string) => void;
}) {
  const { data: interactions, isLoading: loadingInteractions } =
    useContactInteractions(contact.id);
  const addInteraction = useAddInteraction();
  const updateLeadScore = useUpdateLeadScore();

  const [localStage, setLocalStage] = useState<CloserStage>(
    contact.closer_stage ?? "a_appeler",
  );
  const [localScore, setLocalScore] = useState(contact.lead_score ?? 0);
  const [newType, setNewType] = useState<InteractionType>("note");
  const [newContent, setNewContent] = useState("");
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [finalPrice, setFinalPrice] = useState(
    Number(contact.estimated_value ?? 0),
  );
  const closerScoreTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const wasClosedBefore = contact.closer_stage === "close";

  const handleStageClick = async (stage: CloserStage) => {
    if (stage === "close") {
      setShowCloseModal(true);
      return;
    }
    setLocalStage(stage);

    // If was previously closed, revert: delete contract + cancel commissions
    if (wasClosedBefore) {
      try {
        await fetch("/api/pipeline/revert-close", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contactId: contact.id, newStage: stage }),
        });
        toast.success("Deal modifie — contrat et commissions annules");
      } catch {
        toast.error("Erreur lors de la modification");
      }
    } else {
      onStageChange(stage);
    }
  };

  const handleConfirmClose = () => {
    setLocalStage("close");
    setShowCloseModal(false);
    onCloseWithPrice(contact.id, finalPrice);
  };

  const handleScoreChange = useCallback(
    (score: number) => {
      setLocalScore(score);
      if (closerScoreTimerRef.current) clearTimeout(closerScoreTimerRef.current);
      closerScoreTimerRef.current = setTimeout(() => {
        updateLeadScore.mutate({ id: contact.id, lead_score: score });
      }, 400);
    },
    [contact.id, updateLeadScore],
  );

  const handleAddInteraction = useCallback(() => {
    if (!newContent.trim()) return;
    addInteraction.mutate(
      { contact_id: contact.id, type: newType, content: newContent },
      { onSuccess: () => setNewContent("") },
    );
  }, [contact.id, newType, newContent, addInteraction]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full max-w-lg bg-surface border-l border-border h-full overflow-y-auto"
      >
        <div className="sticky top-0 bg-surface/80 backdrop-blur-sm border-b border-border px-5 py-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">{contact.full_name}</h2>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Contact info */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Informations</h3>
            <div className="bg-muted/50 rounded-xl p-3 space-y-1.5">
              {contact.email && (
                <p className="text-sm text-foreground flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" /> {contact.email}
                </p>
              )}
              {contact.phone && (
                <p className="text-sm text-foreground flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" /> {contact.phone}
                </p>
              )}
              {contact.company && (
                <p className="text-sm text-foreground flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground" /> {contact.company}
                </p>
              )}
              {contact.estimated_value > 0 && (
                <p className="text-sm font-semibold text-foreground">
                  Estimation: {Number(contact.estimated_value).toLocaleString("fr-FR")} EUR
                </p>
              )}
            </div>
          </div>

          {/* Lead score */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Score: <span className={getScoreTextColor(localScore)}>{localScore}/100</span>
            </h3>
            <input
              type="range"
              min={0}
              max={100}
              value={localScore}
              onChange={(e) => handleScoreChange(Number(e.target.value))}
              className="w-full h-2 bg-border dark:bg-zinc-600 rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md"
            />
          </div>

          {/* Closer stage selector */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Étape</h3>
            <div className="flex flex-wrap gap-1.5">
              {CLOSER_STAGES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleStageClick(s.value)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                    localStage === s.value
                      ? cn(s.bg, s.color, "ring-1 ring-offset-1 ring-primary/20")
                      : "text-muted-foreground border-border hover:border-primary/30",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Add interaction */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajouter une interaction</h3>
            <div className="bg-muted/50 rounded-xl p-3 space-y-2">
              <div className="flex gap-1.5">
                {INTERACTION_TYPES.map((t) => {
                  const Icon = INTERACTION_ICON_MAP[t.value] ?? FileText;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setNewType(t.value)}
                      className={cn(
                        "h-7 px-2 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all",
                        newType === t.value
                          ? "bg-primary text-white"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Ajouter une note..."
                rows={2}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none"
              />
              <button
                onClick={handleAddInteraction}
                disabled={!newContent.trim() || addInteraction.isPending}
                className="h-7 px-3 rounded-md bg-primary text-white text-xs font-medium disabled:opacity-50"
              >
                Ajouter
              </button>
            </div>
          </div>

          {/* Interaction timeline */}
          {!loadingInteractions && (interactions ?? []).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Historique</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {(interactions ?? []).map((i) => {
                  const Icon = INTERACTION_ICON_MAP[i.type] ?? FileText;
                  return (
                    <div key={i.id} className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg">
                      <Icon className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground">{i.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {i.author?.full_name} · {formatDate(i.created_at, "relative")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Return to setter */}
          <div className="pt-2 border-t border-border space-y-2">
            <button
              onClick={() => onReturn(contact.id)}
              className="w-full h-9 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-colors dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
            >
              Retourner au setter
            </button>
            {/* Admin: manual contract for non-inscrit prospects */}
            {isAdmin && contact.closer_stage === "close" && !contact.converted_profile_id && (
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/pipeline/generate-manual-contract", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ contactId: contact.id }),
                    });
                    const result = await res.json();
                    if (result.html) {
                      // Download as HTML file
                      const blob = new Blob([result.html], { type: "text/html" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = result.fileName;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success("Contrat telecharge — envoyez-le au prospect par email ou telephone");
                    } else {
                      toast.error(result.error ?? "Erreur");
                    }
                  } catch {
                    toast.error("Erreur lors de la generation du contrat");
                  }
                }}
                className="w-full h-9 rounded-xl border border-blue-300 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
              >
                Telecharger le contrat (non inscrit)
              </button>
            )}

            {/* Admin: create platform contract for inscrit prospects */}
            {isAdmin && contact.closer_stage === "close" && contact.converted_profile_id && (
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/pipeline/generate-manual-contract", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ contactId: contact.id }),
                    });
                    const result = await res.json();
                    if (result.contractId) {
                      toast.success("Contrat envoye au prospect sur la plateforme");
                    } else {
                      toast.error(result.error ?? "Erreur");
                    }
                  } catch {
                    toast.error("Erreur lors de l'envoi du contrat");
                  }
                }}
                className="w-full h-9 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
              >
                Envoyer le contrat sur la plateforme
              </button>
            )}

            {isAdmin && contact.closer_stage === "close" && onCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full h-9 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
              >
                Annuler le deal
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Close confirmation modal with price */}
      {showCloseModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface border border-border rounded-2xl shadow-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Confirmer le closing</h3>
            <p className="text-xs text-muted-foreground">
              Entrez le prix final negocie pour <span className="font-medium text-foreground">{contact.full_name}</span>. Un contrat sera envoye automatiquement au prospect.
            </p>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Prix final (EUR)</label>
              <input
                type="number"
                value={finalPrice || ""}
                onChange={(e) => setFinalPrice(Number(e.target.value))}
                placeholder="Ex: 5000"
                className="w-full h-10 px-3 rounded-lg border border-border bg-muted/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowCloseModal(false)} className="flex-1 h-9 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
                Annuler
              </button>
              <button onClick={handleConfirmClose} disabled={!finalPrice || finalPrice <= 0} className="flex-1 h-9 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin cancel modal */}
      {showCancelModal && onCancel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface border border-border rounded-2xl shadow-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-red-600">Annuler le deal</h3>
            <p className="text-xs text-muted-foreground">
              Cette action annulera le deal de <span className="font-medium text-foreground">{contact.full_name}</span> et les commissions associees.
            </p>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Raison de l'annulation</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: Le prospect a change d'avis..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-muted/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 h-9 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
                Retour
              </button>
              <button
                onClick={() => {
                  onCancel(contact.id, cancelReason);
                  setShowCancelModal(false);
                }}
                disabled={!cancelReason.trim()}
                className="flex-1 h-9 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Annuler le deal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export default function SalesPipelinePage() {
  const { profile } = useAuth();
  const isCloser = profile?.role === "closer";

  // Closer sees their own pipeline
  if (isCloser) {
    return (
      <PageTransition>
        <CloserPipelineView />
      </PageTransition>
    );
  }

  // Setter / Admin sees setter pipeline
  return (
    <PageTransition>
      <SetterPipelineView />
    </PageTransition>
  );
}

// ─── Setter Pipeline View ───────────────────────────────────

export function SetterPipelineView() {
  const [tab, setTab] = useState<PipelineMode | "bilan">("manual");
  const pipelineMode: PipelineMode = tab === "bilan" ? "manual" : tab;
  const { contacts, isLoading, createContact, moveContact } =
    usePipelineContacts(undefined, pipelineMode);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showAddProspect, setShowAddProspect] = useState(false);
  const [selectedContact, setSelectedContact] = useState<CrmContact | null>(null);
  const [assignCloserFor, setAssignCloserFor] = useState<CrmContact | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const contactId = String(active.id);
    const newStage = String(over.id) as PipelineStage;
    if (!SETTER_KANBAN_STAGES.some((s) => s.value === newStage)) return;
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact || contact.stage === newStage) return;
    moveContact.mutate({ id: contactId, stage: newStage });
  };

  const activeContact = activeId ? contacts.find((c) => c.id === activeId) ?? null : null;

  const freshSelectedContact = useMemo(() => {
    if (!selectedContact) return null;
    return contacts.find((c) => c.id === selectedContact.id) ?? selectedContact;
  }, [contacts, selectedContact]);

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    const term = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.full_name.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.company?.toLowerCase().includes(term) ||
        c.phone?.includes(term),
    );
  }, [contacts, search]);

  const contactsByStage = useMemo(() => {
    const map = new Map<PipelineStage, CrmContact[]>();
    SETTER_KANBAN_STAGES.forEach((s) => map.set(s.value, []));
    filteredContacts.forEach((c) => {
      const list = map.get(c.stage);
      if (list) list.push(c);
    });
    return map;
  }, [filteredContacts]);

  const totalValue = contacts
    .filter((c) => c.stage !== "perdu")
    .reduce((sum, c) => sum + Number(c.estimated_value ?? 0), 0);

  const handleAssignCloser = useCallback((contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId) ?? null;
    setAssignCloserFor(contact);
  }, [contacts]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">
              Pipeline CRM
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerez vos prospects et opportunites commerciales
            </p>
          </div>
          {tab !== "bilan" && (
          <button
            onClick={() =>
              tab === "signup" ? setShowAddProspect(true) : setShowAdd(true)
            }
            className="h-8 px-3 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            {tab === "signup" ? "Prospect" : "Contact"}
          </button>
          )}
        </div>
      </motion.div>

      {/* Tab switcher */}
      <motion.div variants={staggerItem}>
        <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
          <button
            onClick={() => { setTab("manual"); setSelectedContact(null); }}
            className={cn(
              "px-4 py-2 text-xs font-medium rounded-lg transition-all",
              tab === "manual"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Leads manuels
          </button>
          <button
            onClick={() => { setTab("signup"); setSelectedContact(null); }}
            className={cn(
              "px-4 py-2 text-xs font-medium rounded-lg transition-all",
              tab === "signup"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Prospects inscrits
          </button>
          <button
            onClick={() => { setTab("bilan"); setSelectedContact(null); }}
            className={cn(
              "px-4 py-2 text-xs font-medium rounded-lg transition-all",
              tab === "bilan"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Bilan
          </button>
        </div>
      </motion.div>

      {/* Bilan tab — SetterBilan component */}
      {tab === "bilan" && (
        <motion.div variants={staggerItem}>
          <SetterBilan />
        </motion.div>
      )}

      {/* Pipeline value hero */}
      {tab !== "bilan" && (
      <motion.div variants={staggerItem}>
        <HeroMetric
          label="Valeur du pipeline"
          value={`${totalValue.toLocaleString("fr-FR")} EUR`}
          change={
            contacts.length > 0
              ? {
                  value: `${contacts.filter((c) => c.stage !== "perdu").length} contacts actifs`,
                  positive: true,
                }
              : undefined
          }
        />
      </motion.div>
      )}

      {/* Stats */}
      {tab !== "bilan" && (
      <motion.div variants={staggerItem}>
        <StatsBar contacts={contacts} stages={SETTER_KANBAN_STAGES} />
      </motion.div>
      )}

      {/* Search */}
      {tab !== "bilan" && (
      <motion.div variants={staggerItem}>
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un contact..."
              className="w-full h-8 pl-8 pr-3 bg-muted border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <span className="text-xs font-medium text-foreground font-mono shrink-0">
            Pipeline: {totalValue.toLocaleString("fr-FR")} EUR
          </span>
        </div>
      </motion.div>
      )}

      {/* Kanban Board — Setter stages (no "client") */}
      {tab !== "bilan" && (
      <motion.div variants={staggerItem}>
        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {SETTER_KANBAN_STAGES.map((s) => (
              <div key={s.value} className="min-w-[260px] space-y-2">
                <div className="h-8 bg-muted rounded-xl animate-pulse" />
                <div className="h-24 bg-muted rounded-xl animate-pulse" />
                <div className="h-24 bg-muted rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <DndContext
            sensors={dndSensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {SETTER_KANBAN_STAGES.map((stage) => (
                <StageColumn
                  key={stage.value}
                  stage={stage}
                  contacts={contactsByStage.get(stage.value) ?? []}
                  onCardClick={(contact) => setSelectedContact(contact)}
                />
              ))}
            </div>
            <DragOverlay>
              {activeContact ? (
                <div className="w-[240px] opacity-90">
                  <ContactCard contact={activeContact} onClick={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </motion.div>
      )}

      {/* Contact detail drawer */}
      <AnimatePresence>
        {freshSelectedContact && (
          <ContactDetailDrawer
            key={freshSelectedContact.id}
            contact={freshSelectedContact}
            onClose={() => setSelectedContact(null)}
            onAssignCloser={handleAssignCloser}
            stageList={SETTER_STAGES}
          />
        )}
      </AnimatePresence>

      {/* Assign closer modal — shown when setter moves to "closing" */}
      <AssignCloserModal
        open={!!assignCloserFor}
        contactId={assignCloserFor?.id ?? null}
        contactName={assignCloserFor?.full_name ?? ""}
        onClose={() => setAssignCloserFor(null)}
      />

      {/* Add contact modal (manual leads) */}
      <AddContactModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={(data, { onSuccess }) =>
          createContact.mutate(data, { onSuccess })
        }
        isPending={createContact.isPending}
      />

      {/* Add prospect modal (signed-up prospects) */}
      <AddProspectModal
        open={showAddProspect}
        onClose={() => setShowAddProspect(false)}
      />
    </motion.div>
  );
}
