"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Clock,
  Loader2,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import {
  useSmsReminders,
  useCreateSmsReminder,
  useCancelSmsReminder,
} from "@/hooks/use-sms-reminders";
import type { SmsReminder } from "@/hooks/use-sms-reminders";
import { cn } from "@/lib/utils";

interface SmsReminderButtonProps {
  /** Pre-filled phone number from client profile */
  recipientPhone?: string;
  /** Related entity type */
  relatedType: "call" | "coaching" | "payment";
  /** Related entity ID */
  relatedId: string;
  /** Client name for display */
  clientName?: string;
  /** Call/session date for template */
  eventDate?: string;
  /** Call/session time for template */
  eventTime?: string;
}

const STATUS_CONFIG: Record<
  SmsReminder["status"],
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  pending: {
    label: "En attente",
    icon: Clock,
    className: "text-amber-500",
  },
  sent: {
    label: "Envoye",
    icon: CheckCircle2,
    className: "text-green-500",
  },
  failed: {
    label: "Echoue",
    icon: AlertCircle,
    className: "text-red-500",
  },
  cancelled: {
    label: "Annule",
    icon: XCircle,
    className: "text-muted-foreground",
  },
};

function buildDefaultMessage(
  clientName?: string,
  eventDate?: string,
  eventTime?: string,
): string {
  const name = clientName ?? "Client";
  if (eventDate && eventTime) {
    const formatted = new Date(`${eventDate}T${eventTime}`).toLocaleDateString(
      "fr-FR",
      { weekday: "long", day: "numeric", month: "long" },
    );
    return `Bonjour ${name}, ceci est un rappel pour votre rendez-vous prevu le ${formatted} a ${eventTime.slice(0, 5)}. A bientot !`;
  }
  return `Bonjour ${name}, ceci est un rappel pour votre prochain rendez-vous. N'hesitez pas a nous contacter si besoin.`;
}

export function SmsReminderButton({
  recipientPhone,
  relatedType,
  relatedId,
  clientName,
  eventDate,
  eventTime,
}: SmsReminderButtonProps) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(recipientPhone ?? "");
  const [message, setMessage] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: reminders, isLoading: loadingReminders } = useSmsReminders({
    relatedType,
    relatedId,
  });
  const createReminder = useCreateSmsReminder();
  const cancelReminder = useCancelSmsReminder();

  // Init default message on open
  useEffect(() => {
    if (open) {
      setPhone(recipientPhone ?? "");
      setMessage(buildDefaultMessage(clientName, eventDate, eventTime));

      // Default scheduled date: event date minus 1 day, or tomorrow
      if (eventDate) {
        const d = new Date(eventDate);
        d.setDate(d.getDate() - 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        setScheduledDate(`${y}-${m}-${day}`);
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const y = tomorrow.getFullYear();
        const m = String(tomorrow.getMonth() + 1).padStart(2, "0");
        const day = String(tomorrow.getDate()).padStart(2, "0");
        setScheduledDate(`${y}-${m}-${day}`);
      }
      setScheduledTime("09:00");
    }
  }, [open, recipientPhone, clientName, eventDate, eventTime]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleSubmit = async () => {
    if (!phone.trim() || !message.trim() || !scheduledDate) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const scheduledAt = new Date(
      `${scheduledDate}T${scheduledTime}:00`,
    ).toISOString();

    await createReminder.mutateAsync({
      recipient_phone: phone.trim(),
      message: message.trim(),
      scheduled_at: scheduledAt,
      related_type: relatedType,
      related_id: relatedId,
    });

    setOpen(false);
  };

  const handleCancel = async (id: string) => {
    await cancelReminder.mutateAsync(id);
  };

  const existingReminders = reminders ?? [];
  const pendingCount = existingReminders.filter(
    (r) => r.status === "pending",
  ).length;

  const inputClass =
    "w-full h-9 px-3 bg-muted/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow";
  const labelClass =
    "block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1";

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
          open
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
        )}
        title="Rappel SMS"
      >
        <MessageSquare className="w-4 h-4" />
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
            {pendingCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-80 bg-surface rounded-xl border border-border/50 z-50"
          style={{ boxShadow: "var(--shadow-elevated)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-foreground">
                Rappel SMS
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form */}
          <div className="p-3 space-y-3">
            <div>
              <label className={labelClass}>Telephone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+33 6 12 34 56 78"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Votre message de rappel..."
                className="w-full px-3 py-2 bg-muted/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-shadow"
              />
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {message.length}/160 caracteres
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Date d&apos;envoi</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Heure</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                createReminder.isPending ||
                !phone.trim() ||
                !message.trim() ||
                !scheduledDate
              }
              className="w-full h-9 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createReminder.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Programmer le rappel
            </button>
          </div>

          {/* Existing reminders */}
          {existingReminders.length > 0 && (
            <div className="border-t border-border/50 p-3">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Rappels programmes ({existingReminders.length})
              </p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {loadingReminders ? (
                  <div className="flex items-center justify-center py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  existingReminders.map((reminder) => {
                    const config = STATUS_CONFIG[reminder.status];
                    const StatusIcon = config.icon;
                    const scheduledDate = new Date(
                      reminder.scheduled_at,
                    ).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={reminder.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                      >
                        <StatusIcon
                          className={cn("w-3.5 h-3.5 shrink-0", config.className)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-foreground truncate">
                            {reminder.recipient_phone}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {scheduledDate} — {config.label}
                          </p>
                        </div>
                        {reminder.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => handleCancel(reminder.id)}
                            disabled={cancelReminder.isPending}
                            className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                            title="Annuler le rappel"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
