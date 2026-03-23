"use client";

import { Modal } from "@/components/ui/modal";
import {
  Calendar,
  Clock,
  Trash2,
  Video,
  BookOpen,
  CalendarDays,
} from "lucide-react";
import type { CalendarEvent } from "@/types/calendar";
import { EVENT_TYPE_LABELS } from "@/types/calendar";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useAuth } from "@/hooks/use-auth";

interface EventDetailModalProps {
  open: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  rangeStart: Date;
  rangeEnd: Date;
}

export function EventDetailModal({
  open,
  onClose,
  event,
  rangeStart,
  rangeEnd,
}: EventDetailModalProps) {
  const { deleteEvent } = useCalendarEvents(rangeStart, rangeEnd);
  const { isAdmin, isCoach } = useAuth();

  if (!event) return null;

  const startDate = new Date(event.start);
  const endDate = event.end ? new Date(event.end) : null;

  const formatDate = (d: Date) =>
    d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const isCustomEvent = event.type === "event";
  const canDelete = isCustomEvent && (isAdmin || isCoach);

  const handleDelete = async () => {
    if (!window.confirm("Supprimer cet événement ?")) return;
    const eventId =
      (event.metadata?.event_id as string) ?? event.id.replace("event-", "");
    await deleteEvent.mutateAsync(eventId);
    onClose();
  };

  const TypeIcon =
    event.type === "session"
      ? BookOpen
      : event.type === "call"
        ? Video
        : CalendarDays;

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="space-y-4">
        {/* Header with colored stripe */}
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${event.color}20` }}
          >
            <TypeIcon className="w-5 h-5" style={{ color: event.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground">
              {event.title}
            </h3>
            <span
              className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${event.color}15`,
                color: event.color,
              }}
            >
              {EVENT_TYPE_LABELS[event.type]}
            </span>
          </div>
        </div>

        {event.description ? (
          <p className="text-sm text-muted-foreground">{event.description}</p>
        ) : null}

        {/* Date & Time */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{formatDate(startDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>
              {formatTime(startDate)}
              {endDate && ` — ${formatTime(endDate)}`}
            </span>
          </div>
        </div>

        {/* Metadata */}
        {event.metadata?.status != null ? (
          <div className="text-xs text-muted-foreground">
            Statut :{" "}
            <span className="font-medium">{String(event.metadata.status)}</span>
          </div>
        ) : null}

        {/* Actions */}
        {canDelete && (
          <div className="flex justify-end pt-2 border-t border-border/30">
            <button
              onClick={handleDelete}
              disabled={deleteEvent.isPending}
              className="h-8 px-3 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
