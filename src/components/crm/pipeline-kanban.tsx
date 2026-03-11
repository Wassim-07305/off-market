"use client";

import { useState, useMemo } from "react";
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
import { usePipelineContacts } from "@/hooks/use-pipeline";
import {
  PIPELINE_STAGES,
  CONTACT_SOURCES,
  type CrmContact,
  type PipelineStage,
} from "@/types/pipeline";
import { cn } from "@/lib/utils";
import {
  Plus,
  X,
  GripVertical,
  Mail,
  Phone,
  Building2,
  DollarSign,
  Trash2,
  User,
} from "lucide-react";

// ─── Contact Card ────────────────────────────────────────────

function ContactCard({
  contact,
  isDragging,
  onDelete,
}: {
  contact: CrmContact;
  isDragging?: boolean;
  onDelete?: () => void;
}) {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-xl p-3 group transition-shadow",
        isDragging ? "shadow-lg opacity-90 rotate-2" : "hover:shadow-sm",
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0 cursor-grab" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground truncate">
              {contact.full_name}
            </p>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 text-muted-foreground/0 group-hover:text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
            {contact.company && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Building2 className="w-2.5 h-2.5" />
                {contact.company}
              </span>
            )}
            {contact.email && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Mail className="w-2.5 h-2.5" />
                {contact.email.split("@")[0]}
              </span>
            )}
            {contact.phone && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Phone className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
          {contact.estimated_value > 0 && (
            <span className="inline-flex items-center gap-0.5 mt-1.5 text-[10px] font-medium text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
              <DollarSign className="w-2.5 h-2.5" />
              {Number(contact.estimated_value).toLocaleString("fr-FR")} EUR
            </span>
          )}
          {contact.assigned_profile && (
            <span className="inline-flex items-center gap-0.5 mt-1 text-[10px] text-muted-foreground ml-1">
              <User className="w-2.5 h-2.5" />
              {contact.assigned_profile.full_name.split(" ")[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Draggable wrapper ───────────────────────────────────────

function DraggableContact({
  contact,
  onDelete,
}: {
  contact: CrmContact;
  onDelete: () => void;
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
      <ContactCard contact={contact} onDelete={onDelete} />
    </div>
  );
}

// ─── Droppable Column ────────────────────────────────────────

function StageColumn({
  stage,
  contacts,
  total,
  onDelete,
}: {
  stage: (typeof PIPELINE_STAGES)[number];
  contacts: CrmContact[];
  total: number;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.value });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col min-w-[260px] w-[260px] shrink-0",
        isOver && "ring-2 ring-primary/30 rounded-xl",
      )}
    >
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
      <div className="flex-1 space-y-2 min-h-[100px]">
        {contacts.map((contact) => (
          <DraggableContact
            key={contact.id}
            contact={contact}
            onDelete={() => onDelete(contact.id)}
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
      <div
        className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full mx-4"
        style={{ boxShadow: "var(--shadow-elevated)" }}
      >
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

// ─── Main Kanban Board ───────────────────────────────────────

export function PipelineKanban() {
  const { contacts, isLoading, createContact, moveContact, deleteContact } =
    usePipelineContacts();
  const [showAdd, setShowAdd] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

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

    // Only move if dropped on a valid stage column
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
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.slice(0, 4).map((s) => (
          <div key={s.value} className="min-w-[260px] space-y-2">
            <div className="h-8 bg-muted rounded-xl animate-shimmer" />
            <div className="h-24 bg-muted rounded-xl animate-shimmer" />
            <div className="h-24 bg-muted rounded-xl animate-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
          </span>
          <span className="text-xs font-medium text-foreground font-mono">
            Pipeline: {totalValue.toLocaleString("fr-FR")} EUR
          </span>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="h-8 px-3 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Contact
        </button>
      </div>

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
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
        onAdd={(data) => createContact.mutate(data)}
        isPending={createContact.isPending}
      />
    </div>
  );
}
