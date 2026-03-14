"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Phone, Trash2, CalendarClock, Star } from "lucide-react";
import { toast } from "sonner";
import { useCalls } from "@/hooks/use-calls";
import { useSupabase } from "@/hooks/use-supabase";
import {
  CALL_TYPES,
  CALL_STATUSES,
  SATISFACTION_CONFIG,
  type CallCalendarWithRelations,
} from "@/types/calls";
import { CallNotesForm } from "@/components/calls/call-notes-form";
import { CallSummaryPanel } from "@/components/calls/call-summary-panel";
import { cn } from "@/lib/utils";

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

export function CallFormModal({
  open,
  onClose,
  editCall,
  defaultDate,
  defaultTime,
}: CallFormModalProps) {
  const {
    createCall,
    updateCall,
    deleteCall,
    rescheduleCall,
    rateSatisfaction,
  } = useCalls();
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
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("09:00");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [satisfaction, setSatisfaction] = useState<number>(0);

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
      setSatisfaction(editCall.satisfaction_rating ?? 0);
      setShowReschedule(false);
      setRescheduleDate("");
      setRescheduleTime("09:00");
      setRescheduleReason("");
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
      setSatisfaction(0);
      setShowReschedule(false);
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

  const handleReschedule = async () => {
    if (!editCall || !rescheduleDate || !rescheduleReason.trim()) return;
    setSaving(true);
    try {
      await rescheduleCall.mutateAsync({
        id: editCall.id,
        newDate: rescheduleDate,
        newTime: rescheduleTime,
        reason: rescheduleReason,
      });
      toast.success("Appel reporte");
      onClose();
    } catch {
      toast.error("Erreur lors du report");
    } finally {
      setSaving(false);
    }
  };

  const handleSatisfaction = async (rating: number) => {
    if (!editCall) return;
    setSatisfaction(rating);
    try {
      await rateSatisfaction.mutateAsync({ id: editCall.id, rating });
      toast.success("Note de satisfaction enregistree");
    } catch {
      toast.error("Erreur");
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
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
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
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
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
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
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

          {/* Reschedule section */}
          {editCall && editCall.status === "planifie" && (
            <div className="pt-4 border-t border-border/50">
              {!showReschedule ? (
                <button
                  type="button"
                  onClick={() => setShowReschedule(true)}
                  className="flex items-center gap-2 text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
                >
                  <CalendarClock className="w-3.5 h-3.5" />
                  Reporter cet appel
                </button>
              ) : (
                <div className="space-y-3 bg-amber-500/5 border border-amber-500/10 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-amber-700 flex items-center gap-2">
                    <CalendarClock className="w-3.5 h-3.5" />
                    Reporter l&apos;appel
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Nouvelle date *</label>
                      <input
                        type="date"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Nouvelle heure *</label>
                      <input
                        type="time"
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Raison du report *</label>
                    <input
                      value={rescheduleReason}
                      onChange={(e) => setRescheduleReason(e.target.value)}
                      placeholder="Client indisponible, urgence..."
                      className={inputClass}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReschedule(false)}
                      className="h-8 px-3 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleReschedule}
                      disabled={
                        saving || !rescheduleDate || !rescheduleReason.trim()
                      }
                      className="h-8 px-4 rounded-lg bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                      Confirmer le report
                    </button>
                  </div>
                </div>
              )}
              {editCall.original_date && (
                <p className="text-[10px] text-muted-foreground mt-2">
                  Initialement prevu le {editCall.original_date} a{" "}
                  {editCall.original_time?.slice(0, 5)}
                  {editCall.reschedule_reason &&
                    ` — ${editCall.reschedule_reason}`}
                </p>
              )}
            </div>
          )}

          {/* Satisfaction rating (post-call) */}
          {editCall && editCall.status === "realise" && (
            <div className="pt-4 border-t border-border/50">
              <label className="block text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-yellow-500" />
                Satisfaction client
              </label>
              <div className="flex gap-1.5">
                {([1, 2, 3, 4, 5] as const).map((rating) => {
                  const config = SATISFACTION_CONFIG[rating];
                  return (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleSatisfaction(rating)}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-0.5 p-2 rounded-lg border transition-colors",
                        satisfaction === rating
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50",
                      )}
                    >
                      <span className="text-lg">{config.emoji}</span>
                      <span className="text-[9px] text-muted-foreground">
                        {config.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Post-call notes (only when editing a completed/done call) */}
          {editCall &&
            (editCall.status === "realise" ||
              editCall.status === "no_show") && (
              <div className="pt-4 border-t border-border/50">
                <CallNotesForm callId={editCall.id} />
              </div>
            )}

          {/* AI Summary (only for completed calls) */}
          {editCall && editCall.status === "realise" && (
            <div className="pt-4 border-t border-border/50">
              <CallSummaryPanel
                callId={editCall.id}
                callTitle={editCall.title}
                clientName={editCall.client?.full_name}
                callDate={editCall.date}
              />
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
