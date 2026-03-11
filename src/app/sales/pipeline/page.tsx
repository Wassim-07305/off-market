"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/animations";
import {
  usePipelineContacts,
  useUpdateContactStage,
  useContactInteractions,
  useAddInteraction,
  useUpdateLeadScore,
} from "@/hooks/use-pipeline";
import {
  PIPELINE_STAGES,
  CONTACT_SOURCES,
  INTERACTION_TYPES,
  type CrmContact,
  type PipelineStage,
  type InteractionType,
} from "@/types/pipeline";
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

const KANBAN_STAGES = PIPELINE_STAGES.filter((s) => s.value !== "perdu");

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

function StatsBar({ contacts }: { contacts: CrmContact[] }) {
  const totalContacts = contacts.length;
  const avgScore =
    totalContacts > 0
      ? Math.round(
          contacts.reduce((sum, c) => sum + (c.lead_score ?? 0), 0) /
            totalContacts
        )
      : 0;

  const perStage = KANBAN_STAGES.map((s) => ({
    ...s,
    count: contacts.filter((c) => c.stage === s.value).length,
  }));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-surface border border-border rounded-xl p-3">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Users className="w-3.5 h-3.5" />
          <span className="text-[10px] font-medium uppercase tracking-wider">
            Total contacts
          </span>
        </div>
        <p className="text-lg font-semibold text-foreground">{totalContacts}</p>
      </div>
      <div className="bg-surface border border-border rounded-xl p-3">
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
        <div key={s.value} className="bg-surface border border-border rounded-xl p-3">
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
}: {
  contact: CrmContact;
  onClick: () => void;
}) {
  const score = contact.lead_score ?? 0;

  return (
    <motion.button
      variants={fadeInUp}
      onClick={onClick}
      className="w-full text-left bg-surface border border-border rounded-xl p-3 hover:shadow-sm transition-shadow group"
    >
      <div className="flex items-start justify-between mb-1.5">
        <p className="text-sm font-medium text-foreground truncate pr-2">
          {contact.full_name}
        </p>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors shrink-0 mt-0.5" />
      </div>

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
            className={cn("h-full rounded-full transition-all", getScoreColor(score))}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={cn("text-[10px] font-mono font-medium", getScoreTextColor(score))}>
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

function StageColumn({
  stage,
  contacts,
  onCardClick,
}: {
  stage: (typeof PIPELINE_STAGES)[number];
  contacts: CrmContact[];
  onCardClick: (contact: CrmContact) => void;
}) {
  const total = contacts.reduce(
    (sum, c) => sum + Number(c.estimated_value ?? 0),
    0
  );

  return (
    <div className="flex flex-col min-w-[260px] w-[260px] shrink-0">
      <div className={cn("rounded-xl px-3 py-2 mb-2 border", stage.bg)}>
        <div className="flex items-center justify-between">
          <span className={cn("text-xs font-semibold", stage.color)}>
            {stage.label}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-mono">
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
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex-1 space-y-2 min-h-[100px]"
      >
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onClick={() => onCardClick(contact)}
          />
        ))}
      </motion.div>
    </div>
  );
}

// ─── Contact Detail Drawer ───────────────────────────────────

function ContactDetailDrawer({
  contact,
  onClose,
}: {
  contact: CrmContact;
  onClose: () => void;
}) {
  const { data: interactions, isLoading: loadingInteractions } =
    useContactInteractions(contact.id);
  const addInteraction = useAddInteraction();
  const updateLeadScore = useUpdateLeadScore();
  const updateStage = useUpdateContactStage();

  const [newType, setNewType] = useState<InteractionType>("note");
  const [newContent, setNewContent] = useState("");
  const [localScore, setLocalScore] = useState(contact.lead_score ?? 0);
  const [localStage, setLocalStage] = useState<PipelineStage>(contact.stage);

  const handleScoreChange = useCallback(
    (score: number) => {
      setLocalScore(score);
      updateLeadScore.mutate({ id: contact.id, lead_score: score });
    },
    [contact.id, updateLeadScore]
  );

  const handleStageChange = useCallback(
    (stage: PipelineStage) => {
      setLocalStage(stage);
      updateStage.mutate({ id: contact.id, stage });
    },
    [contact.id, updateStage]
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
      }
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
                <span className={cn("text-lg font-semibold font-mono", getScoreTextColor(localScore))}>
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
                className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          {/* Stage selector */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Etape
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {PIPELINE_STAGES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleStageChange(s.value)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                    localStage === s.value
                      ? cn(s.bg, s.color, "ring-1 ring-offset-1 ring-primary/20")
                      : "text-muted-foreground border-border hover:border-primary/30"
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
                          : "text-muted-foreground border-border hover:border-primary/30"
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
                    (t) => t.value === interaction.type
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
  onAdd: (data: {
    full_name: string;
    email?: string;
    phone?: string;
    company?: string;
    source?: string;
    estimated_value?: number;
  }) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [source, setSource] = useState("");
  const [value, setValue] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      full_name: name,
      email: email || undefined,
      phone: phone || undefined,
      company: company || undefined,
      source: source || undefined,
      estimated_value: parseFloat(value) || undefined,
    });
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setSource("");
    setValue("");
    onClose();
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

// ─── Main Page ───────────────────────────────────────────────

export default function SalesPipelinePage() {
  const { contacts, isLoading, createContact, deleteContact } =
    usePipelineContacts();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedContact, setSelectedContact] = useState<CrmContact | null>(
    null
  );

  // Filter contacts by search
  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    const term = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.full_name.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.company?.toLowerCase().includes(term) ||
        c.phone?.includes(term)
    );
  }, [contacts, search]);

  // Group by stage
  const contactsByStage = useMemo(() => {
    const map = new Map<PipelineStage, CrmContact[]>();
    KANBAN_STAGES.forEach((s) => map.set(s.value, []));
    filteredContacts.forEach((c) => {
      const list = map.get(c.stage);
      if (list) list.push(c);
    });
    return map;
  }, [filteredContacts]);

  // Pipeline total
  const totalValue = contacts
    .filter((c) => c.stage !== "perdu")
    .reduce((sum, c) => sum + Number(c.estimated_value ?? 0), 0);

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
            <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
              Pipeline CRM
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerez vos prospects et opportunites commerciales
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="h-8 px-3 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Contact
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={staggerItem}>
        <StatsBar contacts={contacts} />
      </motion.div>

      {/* Search + pipeline value */}
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

      {/* Kanban Board */}
      <motion.div variants={staggerItem}>
        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {KANBAN_STAGES.map((s) => (
              <div key={s.value} className="min-w-[260px] space-y-2">
                <div className="h-8 bg-muted rounded-xl animate-pulse" />
                <div className="h-24 bg-muted rounded-xl animate-pulse" />
                <div className="h-24 bg-muted rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {KANBAN_STAGES.map((stage) => (
              <StageColumn
                key={stage.value}
                stage={stage}
                contacts={contactsByStage.get(stage.value) ?? []}
                onCardClick={(contact) => setSelectedContact(contact)}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Contact detail drawer */}
      <AnimatePresence>
        {selectedContact && (
          <ContactDetailDrawer
            key={selectedContact.id}
            contact={selectedContact}
            onClose={() => setSelectedContact(null)}
          />
        )}
      </AnimatePresence>

      {/* Add contact modal */}
      <AddContactModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={(data) => createContact.mutate(data)}
        isPending={createContact.isPending}
      />
    </motion.div>
  );
}
