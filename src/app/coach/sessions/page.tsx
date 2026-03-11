"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import { useSessions } from "@/hooks/use-sessions";
import { useStudents } from "@/hooks/use-students";
import { useAuth } from "@/hooks/use-auth";
import type { Session, SessionType } from "@/types/coaching";
import {
  Video,
  Calendar,
  Plus,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  AlertTriangle,
} from "lucide-react";

function formatDateTime(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SESSION_TYPE_CONFIG: Record<
  SessionType,
  { label: string; icon: typeof Video; color: string }
> = {
  individual: {
    label: "Individuel",
    icon: Video,
    color: "text-blue-500 bg-blue-500/10",
  },
  group: {
    label: "Groupe",
    icon: Users,
    color: "text-purple-500 bg-purple-500/10",
  },
  emergency: {
    label: "Urgence",
    icon: AlertTriangle,
    color: "text-red-500 bg-red-500/10",
  },
};

export default function CoachSessionsPage() {
  const { sessions, isLoading, createSession, completeSession, updateSession } =
    useSessions();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const upcoming = sessions.filter((s) => s.status === "scheduled");
  const past = sessions.filter((s) => s.status !== "scheduled");

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Seances</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Planification et suivi des seances de coaching
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle seance
        </button>
      </motion.div>

      {/* Upcoming */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h2 className="text-sm font-semibold text-foreground mb-3">
          A venir ({upcoming.length})
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Aucune seance planifiee
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onComplete={() => completeSession.mutate({ id: session.id })}
                onCancel={() =>
                  updateSession.mutate({ id: session.id, status: "cancelled" })
                }
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Past sessions */}
      {past.length > 0 && (
        <motion.div variants={fadeInUp} transition={defaultTransition}>
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Historique ({past.length})
          </h2>
          <div className="space-y-2">
            {past.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateSessionModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) => {
            createSession.mutate(data, {
              onSuccess: () => setShowCreateModal(false),
            });
          }}
          isCreating={createSession.isPending}
        />
      )}
    </motion.div>
  );
}

function SessionCard({
  session,
  onComplete,
  onCancel,
}: {
  session: Session;
  onComplete?: () => void;
  onCancel?: () => void;
}) {
  const typeConfig = SESSION_TYPE_CONFIG[session.session_type];
  const Icon = typeConfig.icon;

  return (
    <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeConfig.color}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{session.title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{session.client?.full_name ?? "Client"}</span>
            <span>•</span>
            <span>{formatDateTime(session.scheduled_at)}</span>
            <span>•</span>
            <span>{session.duration_minutes}min</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <SessionStatusBadge status={session.status} />
        {session.status === "scheduled" && onComplete && (
          <>
            <button
              onClick={onComplete}
              className="p-2 rounded-lg hover:bg-emerald-500/10 transition-colors text-emerald-500"
              title="Marquer complete"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={onCancel}
              className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-red-500"
              title="Annuler"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function SessionStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    scheduled: {
      label: "Planifiee",
      className: "bg-blue-500/10 text-blue-600",
    },
    completed: {
      label: "Terminee",
      className: "bg-emerald-500/10 text-emerald-600",
    },
    cancelled: {
      label: "Annulee",
      className: "bg-muted text-muted-foreground",
    },
    no_show: { label: "Absent", className: "bg-red-500/10 text-red-600" },
  };
  const c = config[status] ?? config.scheduled;
  return (
    <span
      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.className}`}
    >
      {c.label}
    </span>
  );
}

function CreateSessionModal({
  onClose,
  onCreate,
  isCreating,
}: {
  onClose: () => void;
  onCreate: (data: {
    client_id: string;
    title: string;
    session_type: SessionType;
    scheduled_at: string;
    duration_minutes?: number;
  }) => void;
  isCreating: boolean;
}) {
  const { students: clients } = useStudents();
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [sessionType, setSessionType] = useState<SessionType>("individual");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState("60");

  const handleCreate = () => {
    if (!clientId || !title || !date) return;
    onCreate({
      client_id: clientId,
      title,
      session_type: sessionType,
      scheduled_at: new Date(`${date}T${time}`).toISOString(),
      duration_minutes: parseInt(duration) || 60,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-lg m-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Nouvelle seance
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Client
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Selectionner un client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Seance de coaching..."
              className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Type
            </label>
            <div className="flex gap-2">
              {(
                Object.entries(SESSION_TYPE_CONFIG) as [
                  SessionType,
                  typeof SESSION_TYPE_CONFIG.individual,
                ][]
              ).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => setSessionType(type)}
                  className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg text-xs font-medium transition-colors ${
                    sessionType === type
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Heure
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Duree (minutes)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">1h</option>
              <option value="90">1h30</option>
              <option value="120">2h</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleCreate}
            disabled={!clientId || !title || !date || isCreating}
            className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isCreating ? "Creation..." : "Planifier"}
          </button>
        </div>
      </div>
    </div>
  );
}
