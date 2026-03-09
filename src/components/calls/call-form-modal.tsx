"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCalls } from "@/hooks/use-calls";
import { useSupabase } from "@/hooks/use-supabase";
import { CALL_TYPES, CALL_STATUSES, type CallCalendarWithRelations } from "@/types/calls";
import { CallNotesForm } from "@/components/calls/call-notes-form";

interface CallFormModalProps {
  open: boolean;
  onClose: () => void;
  editCall?: CallCalendarWithRelations | null;
  defaultDate?: string;
  defaultTime?: string;
}

interface ProfileOption {
  id: string;
  full_name: string;
}

export function CallFormModal({ open, onClose, editCall, defaultDate, defaultTime }: CallFormModalProps) {
  const { createCall, updateCall, deleteCall } = useCalls();
  const supabase = useSupabase();
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(30);
  const [callType, setCallType] = useState("manuel");
  const [status, setStatus] = useState("planifie");
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [clients, setClients] = useState<ProfileOption[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "client")
      .order("full_name")
      .then(({ data }) => setClients(data ?? []));
  }, [open, supabase]);

  useEffect(() => {
    if (editCall) {
      setTitle(editCall.title);
      setClientId(editCall.client_id ?? "");
      setDate(editCall.date);
      setTime(editCall.time?.slice(0, 5) ?? "09:00");
      setDuration(editCall.duration_minutes);
      setCallType(editCall.call_type);
      setStatus(editCall.status);
      setLink(editCall.link ?? "");
      setNotes(editCall.notes ?? "");
    } else {
      setTitle("");
      setClientId("");
      setDate(defaultDate ?? new Date().toISOString().split("T")[0]);
      setTime(defaultTime ?? "09:00");
      setDuration(30);
      setCallType("manuel");
      setStatus("planifie");
      setLink("");
      setNotes("");
    }
  }, [editCall, open, defaultDate, defaultTime]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    setSaving(true);
    try {
      if (editCall) {
        await updateCall.mutateAsync({
          id: editCall.id,
          title,
          client_id: clientId || null,
          date,
          time,
          duration_minutes: duration,
          call_type: callType,
          status,
          link: link || null,
          notes: notes || null,
        });
        toast.success("Appel modifie");
      } else {
        await createCall.mutateAsync({
          title,
          client_id: clientId || undefined,
          date,
          time,
          duration_minutes: duration,
          call_type: callType,
          status,
          link: link || undefined,
          notes: notes || undefined,
        });
        toast.success("Appel cree");
      }
      onClose();
    } catch {
      toast.error("Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editCall) return;
    setSaving(true);
    try {
      await deleteCall.mutateAsync(editCall.id);
      toast.success("Appel supprime");
      onClose();
    } catch {
      toast.error("Erreur");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full h-10 px-4 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow";
  const selectClass = "w-full h-10 px-4 bg-muted/50 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow";
  const labelClass = "block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="bg-surface rounded-2xl max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto"
        style={{ boxShadow: "var(--shadow-elevated)" }}
      >
        <div className="flex items-center justify-between p-5 border-b border-border/50 sticky top-0 bg-surface rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-display font-semibold text-foreground">
              {editCall ? "Modifier l'appel" : "Nouvel appel"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelClass}>Titre *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Appel decouverte"
              required
              className={inputClass}
            />
          </div>

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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Type</label>
              <select
                value={callType}
                onChange={(e) => setCallType(e.target.value)}
                className={selectClass}
              >
                {CALL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Duree (min)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className={selectClass}
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1h</option>
                <option value={90}>1h30</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className={selectClass}
            >
              <option value="">Sans client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </div>

          {editCall && (
            <div>
              <label className={labelClass}>Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={selectClass}
              >
                {CALL_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={labelClass}>Lien visio</label>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://meet.google.com/..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Notes sur l'appel..."
              className="w-full px-4 py-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-shadow"
            />
          </div>

          {/* Post-call notes (only when editing a completed/done call) */}
          {editCall && (editCall.status === "realise" || editCall.status === "no_show") && (
            <div className="pt-4 border-t border-border/50">
              <CallNotesForm callId={editCall.id} />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {editCall && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="h-10 px-4 rounded-xl border-l-[3px] border-l-error bg-error/5 text-sm text-error hover:bg-error/10 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer
              </button>
            )}
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
              {editCall ? "Modifier" : "Creer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
