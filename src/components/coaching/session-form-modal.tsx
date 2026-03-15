"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Loader2, CalendarCheck, Plus, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { useSupabase } from "@/hooks/use-supabase";
import {
  useCreateSession,
  useUpdateSession,
  type SessionWithRelations,
  type SessionType,
  type ActionItem,
} from "@/hooks/use-sessions";
import { cn } from "@/lib/utils";

// ── Constants ──────────────────────────────────────────────────────────────

const SESSION_TYPES: { value: SessionType; label: string }[] = [
  { value: "individual", label: "Individuelle" },
  { value: "group", label: "Groupe" },
  { value: "emergency", label: "Urgence" },
];

const DURATION_OPTIONS = [
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1h" },
  { value: 90, label: "1h30" },
];

// ── Props ──────────────────────────────────────────────────────────────────

interface SessionFormModalProps {
  open: boolean;
  onClose: () => void;
  editSession?: SessionWithRelations | null;
}

interface ProfileOption {
  id: string;
  full_name: string;
}

// ── Component ──────────────────────────────────────────────────────────────

export function SessionFormModal({
  open,
  onClose,
  editSession,
}: SessionFormModalProps) {
  const supabase = useSupabase();
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [sessionType, setSessionType] = useState<SessionType>("individual");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState("");
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [newActionText, setNewActionText] = useState("");
  const [clients, setClients] = useState<ProfileOption[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch client profiles
  useEffect(() => {
    if (!open) return;
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "client")
      .order("full_name")
      .then(({ data }) => setClients(data ?? []));
  }, [open, supabase]);

  // Populate form for edit mode
  useEffect(() => {
    if (editSession) {
      setTitle(editSession.title);
      setClientId(editSession.client_id);
      setSessionType(editSession.session_type);
      const dt = new Date(editSession.scheduled_at);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const d = String(dt.getDate()).padStart(2, "0");
      setDate(`${y}-${m}-${d}`);
      setTime(`${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`);
      setDuration(editSession.duration_minutes);
      setNotes(editSession.notes ?? "");
      setActionItems(editSession.action_items ?? []);
      setNewActionText("");
    } else {
      setTitle("");
      setClientId("");
      setSessionType("individual");
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      setDate(`${y}-${m}-${d}`);
      setTime("09:00");
      setDuration(60);
      setNotes("");
      setActionItems([]);
      setNewActionText("");
    }
  }, [editSession, open]);

  const addActionItem = useCallback(() => {
    const text = newActionText.trim();
    if (!text) return;
    setActionItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text, done: false },
    ]);
    setNewActionText("");
  }, [newActionText]);

  const removeActionItem = useCallback((id: string) => {
    setActionItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleActionItem = useCallback((id: string) => {
    setActionItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    );
  }, []);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientId || !date) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
    setSaving(true);

    try {
      if (editSession) {
        await updateSession.mutateAsync({
          id: editSession.id,
          title,
          client_id: clientId,
          session_type: sessionType,
          scheduled_at: scheduledAt,
          duration_minutes: duration,
          notes: notes || undefined,
          action_items: actionItems,
        });
      } else {
        await createSession.mutateAsync({
          title,
          client_id: clientId,
          session_type: sessionType,
          scheduled_at: scheduledAt,
          duration_minutes: duration,
          notes: notes || undefined,
          action_items: actionItems,
        });
      }
      onClose();
    } catch {
      // Error handled by mutation callbacks
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full h-10 px-4 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow";
  const selectClass =
    "w-full h-10 px-4 bg-muted/50 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow";
  const labelClass =
    "block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="bg-surface rounded-2xl max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto"
        style={{ boxShadow: "var(--shadow-elevated)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50 sticky top-0 bg-surface rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-display font-semibold text-foreground">
              {editSession ? "Modifier la session" : "Nouvelle session"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className={labelClass}>Titre *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Session de coaching"
              required
              className={inputClass}
            />
          </div>

          {/* Client */}
          <div>
            <label className={labelClass}>Client *</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              className={selectClass}
            >
              <option value="">Selectionner un client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Type + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Type</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as SessionType)}
                className={selectClass}
              >
                {SESSION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Duree</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className={selectClass}
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Heure *</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Notes pour la session..."
              className="w-full px-4 py-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-shadow"
            />
          </div>

          {/* Action Items */}
          <div>
            <label className={labelClass}>Actions a suivre</label>
            <div className="space-y-2">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 group"
                >
                  <button
                    type="button"
                    onClick={() => toggleActionItem(item.id)}
                    className={cn(
                      "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                      item.done
                        ? "bg-primary border-primary text-white"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    {item.done && <Check className="w-3 h-3" />}
                  </button>
                  <span
                    className={cn(
                      "text-sm flex-1",
                      item.done && "line-through text-muted-foreground",
                    )}
                  >
                    {item.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeActionItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <div className="flex gap-2">
                <input
                  value={newActionText}
                  onChange={(e) => setNewActionText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addActionItem();
                    }
                  }}
                  placeholder="Ajouter une action..."
                  className={cn(inputClass, "flex-1")}
                />
                <button
                  type="button"
                  onClick={addActionItem}
                  disabled={!newActionText.trim()}
                  className="h-10 w-10 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editSession ? "Modifier" : "Creer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
