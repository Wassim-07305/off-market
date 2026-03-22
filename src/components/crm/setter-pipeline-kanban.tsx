"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus, GripVertical, CalendarClock, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SetterLead, PipelineColumn } from "@/types/setter-crm";
import {
  usePipelineColumns,
  useSetterLeads,
  useCreateSetterLead,
  useMoveSetterLeadToColumn,
} from "@/hooks/use-setter-crm";
import { SetterProspectDrawer } from "@/components/crm/setter-prospect-drawer";
import { SetterPipelineConfig } from "@/components/crm/setter-pipeline-config";

// ─── Color utils ───────────────────────────────────────────

const COLOR_BORDER_MAP: Record<string, string> = {
  red: "border-t-red-500",
  blue: "border-t-blue-500",
  green: "border-t-green-500",
  amber: "border-t-amber-500",
  violet: "border-t-violet-500",
  indigo: "border-t-indigo-500",
  rose: "border-t-rose-500",
  cyan: "border-t-cyan-500",
  emerald: "border-t-emerald-500",
  orange: "border-t-orange-500",
};

const COLOR_BG_MAP: Record<string, string> = {
  red: "bg-red-50 text-red-700",
  blue: "bg-blue-50 text-blue-700",
  green: "bg-green-50 text-green-700",
  amber: "bg-amber-50 text-amber-700",
  violet: "bg-violet-50 text-violet-700",
  indigo: "bg-indigo-50 text-indigo-700",
  rose: "bg-rose-50 text-rose-700",
  cyan: "bg-cyan-50 text-cyan-700",
  emerald: "bg-emerald-50 text-emerald-700",
  orange: "bg-orange-50 text-orange-700",
};

function getColumnBorderClass(color: string) {
  return COLOR_BORDER_MAP[color] ?? "border-t-zinc-400";
}

function getColumnBgClass(color: string) {
  return COLOR_BG_MAP[color] ?? "bg-zinc-100 text-zinc-700";
}

// ─── Draggable Card ────────────────────────────────────────

function isRelanceOverdue(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

function ProspectCard({
  lead,
  isDragging,
  onClick,
}: {
  lead: SetterLead;
  isDragging?: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const overdue = isRelanceOverdue(lead.date_relance);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-surface border border-border rounded-xl p-3 group transition-all duration-200 cursor-pointer touch-none",
        isDragging
          ? "shadow-2xl opacity-80 rotate-1 scale-[1.03] ring-2 ring-primary/20"
          : "hover:border-zinc-300 hover:shadow-md hover:-translate-y-0.5",
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex flex-col items-center gap-0.5 mt-0.5 shrink-0 opacity-30 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground truncate">
              {lead.name}
            </span>
            {overdue && (
              <Badge
                variant="destructive"
                className="shrink-0 flex items-center gap-1"
              >
                <CalendarClock className="w-3 h-3" />
                Relance
              </Badge>
            )}
          </div>
          {(lead.ca_contracte ?? 0) > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(lead.ca_contracte ?? 0)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Overlay Card (drag preview) ───────────────────────────

function OverlayCard({ lead }: { lead: SetterLead }) {
  const overdue = isRelanceOverdue(lead.date_relance);
  return (
    <div className="bg-surface border border-border rounded-xl p-3 shadow-2xl rotate-2 scale-105 w-64">
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground truncate flex-1">
          {lead.name}
        </span>
        {overdue && (
          <Badge variant="destructive" className="shrink-0 text-[10px]">
            Relance
          </Badge>
        )}
      </div>
    </div>
  );
}

// ─── Droppable Column ──────────────────────────────────────

function KanbanColumn({
  column,
  leads,
  onOpenDrawer,
  onQuickAdd,
  isFirst,
}: {
  column: PipelineColumn;
  leads: SetterLead[];
  onOpenDrawer: (lead: SetterLead) => void;
  onQuickAdd?: (name: string) => void;
  isFirst: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [quickAddValue, setQuickAddValue] = useState("");

  function handleQuickAdd() {
    if (!quickAddValue.trim() || !onQuickAdd) return;
    onQuickAdd(quickAddValue.trim());
    setQuickAddValue("");
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl border border-border bg-muted/30 min-w-[280px] w-[280px] shrink-0 border-t-4 transition-colors",
        getColumnBorderClass(column.color),
        isOver && "bg-primary/5 border-primary/20",
      )}
    >
      {/* Header */}
      <div className="px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {column.name}
          </span>
          <span
            className={cn(
              "text-[11px] font-medium px-1.5 py-0.5 rounded-md",
              getColumnBgClass(column.color),
            )}
          >
            {leads.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
        {leads.map((lead) => (
          <ProspectCard
            key={lead.id}
            lead={lead}
            onClick={() => onOpenDrawer(lead)}
          />
        ))}

        {leads.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground">
            Aucun prospect
          </div>
        )}
      </div>

      {/* Quick add (first column only) */}
      {isFirst && (
        <div className="px-2 pb-2">
          <input
            type="text"
            value={quickAddValue}
            onChange={(e) => setQuickAddValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleQuickAdd();
            }}
            placeholder="Ajouter un prospect..."
            className={cn(
              "w-full h-8 px-3 text-xs rounded-lg border border-dashed border-border bg-surface/50",
              "placeholder:text-muted-foreground/50 text-foreground",
              "focus:outline-none focus:border-primary/40 focus:bg-surface transition-all",
            )}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Kanban ───────────────────────────────────────────

export function SetterPipelineKanban() {
  const { columns } = usePipelineColumns();
  const { leads } = useSetterLeads();
  const createLead = useCreateSetterLead();
  const moveLead = useMoveSetterLeadToColumn();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [drawerLead, setDrawerLead] = useState<SetterLead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // Group leads by column
  const leadsByColumn = useMemo(() => {
    const map: Record<string, SetterLead[]> = {};
    for (const col of columns) {
      map[col.id] = [];
    }
    for (const lead of leads) {
      const colId = lead.column_id;
      if (colId && map[colId]) {
        map[colId].push(lead);
      }
    }
    return map;
  }, [columns, leads]);

  const draggingLead = useMemo(
    () => (draggingId ? leads.find((l) => l.id === draggingId) : null),
    [draggingId, leads],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setDraggingId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setDraggingId(null);

      if (!over) return;

      const leadId = String(active.id);
      const targetColumnId = String(over.id);
      const lead = leads.find((l) => l.id === leadId);

      if (!lead || lead.column_id === targetColumnId) return;

      // Verify target is a valid column
      if (!columns.some((c) => c.id === targetColumnId)) return;

      moveLead.mutate({ id: leadId, columnId: targetColumnId });
    },
    [leads, columns, moveLead],
  );

  function handleQuickAdd(name: string) {
    if (columns.length === 0) {
      toast.error("Creez d'abord une colonne");
      return;
    }
    createLead.mutate(
      { name, column_id: columns[0].id } as any,
      { onSuccess: () => toast.success("Prospect ajoute") },
    );
  }

  function openDrawer(lead: SetterLead) {
    setDrawerLead(lead);
    setDrawerOpen(true);
  }

  function handleAddFirstColumn() {
    if (columns.length === 0) {
      toast.error("Creez d'abord une colonne");
      return;
    }
    // Open drawer with null to signal new lead, or just quick-add
    const name = prompt("Nom du prospect :");
    if (name?.trim()) {
      createLead.mutate(
        { name: name.trim(), column_id: columns[0].id } as any,
        { onSuccess: () => toast.success("Prospect ajoute") },
      );
    }
  }

  return (
    <div className="space-y-4">
      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2">
          {columns.map((col, idx) => (
            <KanbanColumn
              key={col.id}
              column={col}
              leads={leadsByColumn[col.id] ?? []}
              onOpenDrawer={openDrawer}
              onQuickAdd={idx === 0 ? handleQuickAdd : undefined}
              isFirst={idx === 0}
            />
          ))}

          {columns.length === 0 && (
            <div className="flex-1 flex items-center justify-center py-16 text-sm text-muted-foreground">
              <div className="text-center space-y-3">
                <p>Aucune colonne configuree.</p>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Settings2 className="w-3.5 h-3.5" />}
                  onClick={() => setConfigOpen(true)}
                >
                  Configurer les colonnes
                </Button>
              </div>
            </div>
          )}
        </div>

        <DragOverlay>
          {draggingLead ? <OverlayCard lead={draggingLead} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Prospect drawer */}
      <SetterProspectDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerLead(null);
        }}
        lead={drawerLead}
        columns={columns}
      />
    </div>
  );
}
