"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  useDraggable,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { usePipelineContacts, type PipelineMode } from "@/hooks/use-pipeline";
import { AddProspectModal } from "@/components/crm/add-prospect-modal";
import {
  PIPELINE_STAGES,
  CONTACT_SOURCES,
  type CrmContact,
  type PipelineStage,
} from "@/types/pipeline";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Plus,
  X,
  GripVertical,
  Mail,
  Phone,
  Building2,
  Trash2,
  User,
  Loader2,
  Sparkles,
  Linkedin,
  Instagram,
  Video,
  Facebook,
  Globe,
  Upload,
} from "lucide-react";
import dynamic from "next/dynamic";
const EnrichmentPanel = dynamic(
  () =>
    import("@/components/crm/enrichment-panel").then((m) => ({
      default: m.EnrichmentPanel,
    })),
  { ssr: false },
);
import { CsvImportModal } from "@/components/crm/csv-import-modal";
import { RelanceEnrollmentBadge } from "@/components/crm/relance-enrollment-badge";
import {
  SegmentManager,
  type SegmentFilters,
} from "@/components/crm/segment-manager";
import { useBulkEnrich } from "@/hooks/use-enrichment";

// ─── Contact Card ────────────────────────────────────────────

function ContactCard({
  contact,
  isDragging,
  onDelete,
  onEnrich,
}: {
  contact: CrmContact;
  isDragging?: boolean;
  onDelete?: () => void;
  onEnrich?: () => void;
}) {
  const enrichmentStatus = contact.enrichment_status;
  const isHighValue = contact.estimated_value >= 3000;
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-xl p-3.5 group transition-all duration-200 relative",
        isDragging
          ? "shadow-2xl opacity-90 rotate-1 scale-[1.03] ring-2 ring-[#AF0000]/20"
          : "hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-md hover:-translate-y-0.5",
        isHighValue && "border-l-[3px] border-l-[#AF0000]",
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex flex-col items-center gap-0.5 mt-0.5 shrink-0 cursor-grab opacity-40 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-foreground truncate tracking-tight">
              {contact.full_name}
            </p>
            <div className="flex items-center gap-0.5">
              {onEnrich && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEnrich();
                  }}
                  className={cn(
                    "p-1 transition-colors",
                    enrichmentStatus === "enriched"
                      ? "text-emerald-500"
                      : "text-transparent group-hover:text-muted-foreground hover:!text-[#AF0000]",
                  )}
                  title="Enrichir via Apify"
                >
                  <Sparkles className="w-3 h-3" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="p-1 text-transparent group-hover:text-muted-foreground hover:!text-[#AF0000] transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {(contact.company || contact.email || contact.phone) && (
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1.5">
              {contact.company && (
                <span className="text-[11px] text-muted-foreground/80 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {contact.company}
                </span>
              )}
              {contact.email && (
                <span className="text-[11px] text-muted-foreground/80 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {contact.email.split("@")[0]}
                </span>
              )}
              {contact.phone && (
                <span className="text-[11px] text-muted-foreground/80 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mt-2.5">
            {contact.estimated_value > 0 && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-md font-mono tabular-nums",
                  isHighValue
                    ? "bg-gradient-to-r from-[#AF0000] to-[#DC2626] text-white"
                    : "text-foreground bg-zinc-100 dark:bg-zinc-800",
                )}
              >
                {formatCurrency(Number(contact.estimated_value))}
              </span>
            )}
            {contact.assigned_profile && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="w-4 h-4 rounded-full bg-gradient-to-br from-[#AF0000] to-[#DC2626] flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">
                  <User className="w-2.5 h-2.5 text-white" />
                </span>
                {contact.assigned_profile.full_name.split(" ")[0]}
              </span>
            )}
            {contact.linkedin_url && (
              <Linkedin className="w-3 h-3 text-[#0A66C2]" />
            )}
            {contact.instagram_url && (
              <Instagram className="w-3 h-3 text-[#E4405F]" />
            )}
            {contact.tiktok_url && (
              <Video className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
            )}
            {contact.facebook_url && (
              <Facebook className="w-3 h-3 text-[#1877F2]" />
            )}
            {contact.website_url && <Globe className="w-3 h-3 text-zinc-500" />}
            {/* Relance enrollment badge */}
            <RelanceEnrollmentBadge contactId={contact.id} compact />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Draggable wrapper ───────────────────────────────────────

function DraggableContact({
  contact,
  onDelete,
  onEnrich,
}: {
  contact: CrmContact;
  onDelete: () => void;
  onEnrich: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: contact.id });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(isDragging && "opacity-30")}
    >
      <ContactCard contact={contact} onDelete={onDelete} onEnrich={onEnrich} />
    </div>
  );
}

// ─── Droppable Column ────────────────────────────────────────

function StageColumn({
  stage,
  contacts,
  total,
  onDelete,
  onEnrich,
}: {
  stage: (typeof PIPELINE_STAGES)[number];
  contacts: CrmContact[];
  total: number;
  onDelete: (id: string) => void;
  onEnrich: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.value });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col min-w-[270px] w-[270px] shrink-0"
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-2 mb-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-2.5 h-2.5 rounded-full ring-2 ring-offset-1 ring-offset-surface",
              stage.dotColor,
              stage.dotColor
                .replace("bg-", "ring-")
                .replace("500", "200")
                .replace("400", "200")
                .replace("300", "100")
                .replace("600", "200"),
            )}
          />
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
            {stage.label}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono tabular-nums bg-muted px-1.5 py-0.5 rounded-md">
            {contacts.length}
          </span>
        </div>
        {total > 0 && (
          <span className="text-[11px] font-semibold text-muted-foreground font-mono tabular-nums">
            {formatCurrency(total)}
          </span>
        )}
      </div>

      {/* Cards */}
      <div
        className={cn(
          "flex-1 space-y-2.5 min-h-[60vh] rounded-xl p-2 -m-2 transition-all duration-200",
          isOver &&
            "bg-[#AF0000]/5 ring-1 ring-inset ring-[#AF0000]/20 shadow-inner",
        )}
      >
        {contacts.map((contact) => (
          <DraggableContact
            key={contact.id}
            contact={contact}
            onDelete={() => onDelete(contact.id)}
            onEnrich={() => onEnrich(contact.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Add Contact Form ────────────────────────────────────────

function AddContactForm({
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
    notes?: string;
    linkedin_url?: string;
    instagram_url?: string;
    tiktok_url?: string;
    facebook_url?: string;
    website_url?: string;
  }) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [source, setSource] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      full_name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      company: company.trim() || undefined,
      source: source || undefined,
      estimated_value: parseFloat(value) || undefined,
      notes: notes.trim() || undefined,
      linkedin_url: linkedinUrl.trim() || undefined,
      instagram_url: instagramUrl.trim() || undefined,
      tiktok_url: tiktokUrl.trim() || undefined,
      facebook_url: facebookUrl.trim() || undefined,
      website_url: websiteUrl.trim() || undefined,
    });
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setSource("");
    setValue("");
    setNotes("");
    setLinkedinUrl("");
    setInstagramUrl("");
    setTiktokUrl("");
    setFacebookUrl("");
    setWebsiteUrl("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full mx-4"
        style={{ boxShadow: "var(--shadow-elevated)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Nouveau contact
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ajouter un prospect au pipeline
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Nom complet *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jean Dupont"
              required
              autoFocus
              className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@email.com"
                type="email"
                className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Telephone
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+33 6 00 00 00 00"
                className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Entreprise / Niche
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Coaching fitness"
                className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
              >
                <option value="">Selectionner</option>
                {CONTACT_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Valeur estimee (EUR)
            </label>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="3000"
              type="number"
              min="0"
              className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contexte, besoins identifies..."
              rows={2}
              className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-foreground mb-1">
                <Linkedin className="w-3 h-3 text-[#0A66C2]" />
                LinkedIn
              </label>
              <input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="linkedin.com/in/..."
                className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-foreground mb-1">
                <Instagram className="w-3 h-3 text-[#E4405F]" />
                Instagram
              </label>
              <input
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="@username"
                className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-foreground mb-1">
                <Video className="w-3 h-3" />
                TikTok
              </label>
              <input
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                placeholder="@username"
                className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-foreground mb-1">
                <Facebook className="w-3 h-3 text-[#1877F2]" />
                Facebook
              </label>
              <input
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="facebook.com/page"
                className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-foreground mb-1">
                <Globe className="w-3 h-3 text-zinc-500" />
                Site web
              </label>
              <input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://..."
                className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="flex-1 h-10 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Ajout..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Kanban Board ───────────────────────────────────────

export function PipelineKanban() {
  const [pipelineMode, setPipelineMode] = useState<PipelineMode>("manual");
  const {
    contacts: allContacts,
    isLoading,
    createContact,
    moveContact,
    deleteContact,
  } = usePipelineContacts(undefined, pipelineMode);
  const bulkEnrich = useBulkEnrich();
  const [showAdd, setShowAdd] = useState(false);
  const [showAddProspect, setShowAddProspect] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [enrichContactId, setEnrichContactId] = useState<string | null>(null);
  const [segmentFilters, setSegmentFilters] = useState<SegmentFilters>({});

  const hasActiveFilters = Object.values(segmentFilters).some(Boolean);

  const handleApplySegment = useCallback((filters: SegmentFilters) => {
    setSegmentFilters(filters);
  }, []);

  // Apply segment filters to contacts
  const contacts = useMemo(() => {
    if (!hasActiveFilters) return allContacts;
    return allContacts.filter((c) => {
      if (segmentFilters.search) {
        const q = segmentFilters.search.toLowerCase();
        const match =
          c.full_name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (segmentFilters.stage && c.stage !== segmentFilters.stage)
        return false;
      if (segmentFilters.source && c.source !== segmentFilters.source)
        return false;
      if (segmentFilters.coachId && c.assigned_to !== segmentFilters.coachId)
        return false;
      if (segmentFilters.tag && !c.tags?.includes(segmentFilters.tag))
        return false;
      return true;
    });
  }, [allContacts, segmentFilters, hasActiveFilters]);
  const enrichContact = enrichContactId
    ? (contacts.find((c) => c.id === enrichContactId) ?? null)
    : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // Group contacts by stage
  const contactsByStage = useMemo(() => {
    const map = new Map<PipelineStage, CrmContact[]>();
    PIPELINE_STAGES.forEach((s) => map.set(s.value, []));
    contacts.forEach((c) => {
      const list = map.get(c.stage);
      if (list) list.push(c);
    });
    return map;
  }, [contacts]);

  const activeContact = activeId
    ? (contacts.find((c) => c.id === activeId) ?? null)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const contactId = String(active.id);
    const newStage = String(over.id) as PipelineStage;

    if (!PIPELINE_STAGES.some((s) => s.value === newStage)) return;

    const contact = contacts.find((c) => c.id === contactId);
    if (!contact || contact.stage === newStage) return;

    moveContact.mutate({ id: contactId, stage: newStage });
  };

  // Stats
  const totalValue = contacts
    .filter((c) => c.stage !== "perdu")
    .reduce((sum, c) => sum + Number(c.estimated_value), 0);

  if (isLoading) {
    return (
      <div className="flex gap-5 overflow-x-auto pb-4">
        {PIPELINE_STAGES.slice(0, 5).map((s) => (
          <div key={s.value} className="min-w-[260px] space-y-3">
            <div className="h-6 w-24 bg-muted rounded-lg animate-shimmer" />
            <div className="h-20 bg-muted rounded-xl animate-shimmer" />
            <div className="h-20 bg-muted rounded-xl animate-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Tab switcher */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        <button
          onClick={() => setPipelineMode("manual")}
          className={cn(
            "px-4 py-2 text-xs font-medium rounded-lg transition-all",
            pipelineMode === "manual"
              ? "bg-surface text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Leads manuels
        </button>
        <button
          onClick={() => setPipelineMode("signup")}
          className={cn(
            "px-4 py-2 text-xs font-medium rounded-lg transition-all",
            pipelineMode === "signup"
              ? "bg-surface text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Prospects inscrits
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {contacts.length}
            </span>{" "}
            contact{contacts.length !== 1 ? "s" : ""}
          </span>
          {totalValue > 0 && (
            <span className="text-sm font-bold text-foreground font-mono tabular-nums bg-gradient-to-r from-[#AF0000] to-[#DC2626] bg-clip-text text-transparent">
              {formatCurrency(totalValue)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SegmentManager
            currentFilters={segmentFilters}
            onApplySegment={handleApplySegment}
            hasActiveFilters={hasActiveFilters}
          />
          {pipelineMode === "manual" && (
            <>
              <button
                onClick={() => bulkEnrich.mutate(contacts)}
                disabled={bulkEnrich.isPending}
                className="h-9 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:border-zinc-300 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {bulkEnrich.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {bulkEnrich.isPending ? "Enrichissement..." : "Enrichir tout"}
              </button>
              <button
                onClick={() => setShowImport(true)}
                className="h-9 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:border-zinc-300 transition-all flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                Importer CSV
              </button>
            </>
          )}
          <button
            onClick={() =>
              pipelineMode === "signup"
                ? setShowAddProspect(true)
                : setShowAdd(true)
            }
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#AF0000] to-[#DC2626] text-white text-sm font-semibold hover:from-[#8B0000] hover:to-[#B91C1C] transition-all active:scale-[0.98] shadow-sm shadow-red-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            {pipelineMode === "signup" ? "Prospect" : "Contact"}
          </button>
        </div>
      </div>

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-5 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageContacts = contactsByStage.get(stage.value) ?? [];
            const stageTotal = stageContacts.reduce(
              (sum, c) => sum + Number(c.estimated_value),
              0,
            );
            return (
              <StageColumn
                key={stage.value}
                stage={stage}
                contacts={stageContacts}
                total={stageTotal}
                onDelete={(id) => deleteContact.mutate(id)}
                onEnrich={(id) => setEnrichContactId(id)}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeContact ? (
            <div className="w-[240px]">
              <ContactCard contact={activeContact} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add contact modal */}
      <AddContactForm
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={(data) =>
          createContact.mutate(data, {
            onSuccess: () => setShowAdd(false),
          })
        }
        isPending={createContact.isPending}
      />

      {/* Add prospect modal (signed-up prospects) */}
      <AddProspectModal
        open={showAddProspect}
        onClose={() => setShowAddProspect(false)}
      />

      {/* CSV import modal */}
      <CsvImportModal open={showImport} onClose={() => setShowImport(false)} />

      {/* Enrichment panel */}
      {enrichContact && (
        <EnrichmentPanel
          contact={enrichContact}
          open={!!enrichContactId}
          onClose={() => setEnrichContactId(null)}
        />
      )}
    </div>
  );
}
