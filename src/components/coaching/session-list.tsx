"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  CalendarCheck,
  Clock,
  User,
  Plus,
  Loader2,
  CalendarX,
} from "lucide-react";
import {
  useSessions,
  type SessionWithRelations,
  type SessionStatus,
  type SessionFilters,
} from "@/hooks/use-sessions";
import { SessionFormModal } from "./session-form-modal";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  SessionStatus,
  {
    label: string;
    variant: "default" | "success" | "warning" | "destructive" | "secondary";
  }
> = {
  scheduled: { label: "Planifiee", variant: "default" },
  completed: { label: "Terminee", variant: "success" },
  cancelled: { label: "Annulee", variant: "destructive" },
  no_show: { label: "Absent", variant: "warning" },
};

const TYPE_LABELS: Record<string, string> = {
  individual: "Individuelle",
  group: "Groupe",
  emergency: "Urgence",
};

const STATUS_FILTER_OPTIONS: { value: SessionStatus | "all"; label: string }[] =
  [
    { value: "all", label: "Toutes" },
    { value: "scheduled", label: "Planifiees" },
    { value: "completed", label: "Terminees" },
    { value: "cancelled", label: "Annulees" },
    { value: "no_show", label: "Absents" },
  ];

// ── Component ──────────────────────────────────────────────────────────────

export function SessionList() {
  const [statusFilter, setStatusFilter] = useState<SessionStatus | "all">(
    "all",
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editSession, setEditSession] = useState<SessionWithRelations | null>(
    null,
  );

  const filters: SessionFilters | undefined = useMemo(() => {
    const f: SessionFilters = {};
    if (statusFilter !== "all") f.status = statusFilter;
    if (dateFrom) f.dateFrom = new Date(`${dateFrom}T00:00:00`).toISOString();
    if (dateTo) f.dateTo = new Date(`${dateTo}T23:59:59`).toISOString();
    return Object.keys(f).length > 0 ? f : undefined;
  }, [statusFilter, dateFrom, dateTo]);

  const { data: sessions, isLoading } = useSessions(filters);

  const handleOpenCreate = () => {
    setEditSession(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (session: SessionWithRelations) => {
    setEditSession(session);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditSession(null);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const inputClass =
    "h-9 px-3 bg-muted/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-display font-semibold text-foreground">
              Sessions de coaching
            </h3>
            <p className="text-xs text-muted-foreground">
              {(sessions ?? []).length} session(s)
            </p>
          </div>
        </div>
        <button
          onClick={handleOpenCreate}
          className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle session
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status filter pills */}
        <div className="flex gap-1">
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                "h-7 px-2.5 rounded-lg text-[11px] font-medium transition-colors",
                statusFilter === opt.value
                  ? "bg-foreground text-background"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={inputClass}
            placeholder="Du"
          />
          <span className="text-xs text-muted-foreground">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={inputClass}
            placeholder="Au"
          />
        </div>
      </div>

      {/* Session list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (sessions ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
            <CalendarX className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Aucune session trouvee
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Creez votre première session de coaching
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-3 h-8 px-3 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouvelle session
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {(sessions ?? []).map((session) => {
            const statusConfig = STATUS_CONFIG[session.status];
            return (
              <button
                key={session.id}
                onClick={() => handleOpenEdit(session)}
                className="w-full text-left rounded-xl border border-border/50 bg-surface p-4 hover:bg-muted/30 hover:border-border transition-all group"
              >
                <div className="flex items-center gap-4">
                  {/* Date block */}
                  <div className="w-14 text-center shrink-0">
                    <div className="text-xs font-semibold text-primary uppercase">
                      {formatDate(session.scheduled_at).split(" ")[0]}
                    </div>
                    <div className="text-lg font-bold text-foreground leading-tight">
                      {new Date(session.scheduled_at).getDate()}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase">
                      {new Date(session.scheduled_at).toLocaleDateString(
                        "fr-FR",
                        { month: "short" },
                      )}
                    </div>
                  </div>

                  {/* Session info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {session.title}
                      </span>
                      <Badge variant={statusConfig.variant}>
                        {statusConfig.label}
                      </Badge>
                      <span className="text-[10px] font-medium text-muted-foreground px-1.5 py-0.5 rounded bg-muted/50">
                        {TYPE_LABELS[session.session_type] ??
                          session.session_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {session.client && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {session.client.full_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(session.scheduled_at)} —{" "}
                        {session.duration_minutes} min
                      </span>
                    </div>
                    {session.notes && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {session.notes}
                      </p>
                    )}
                  </div>

                  {/* Client avatar */}
                  {session.client?.avatar_url ? (
                    <Image
                      src={session.client.avatar_url}
                      alt={session.client.full_name}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                  ) : session.client ? (
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {session.client.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <SessionFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        editSession={editSession}
      />
    </div>
  );
}
