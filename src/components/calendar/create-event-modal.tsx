"use client";

import { useState, useEffect } from "react";
import { Loader2, CalendarPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useSupabase } from "@/hooks/use-supabase";
import type { Profile } from "@/types/database";
import { cn } from "@/lib/utils";

const createEventSchema = z
  .object({
    title: z.string().min(1, "Le titre est requis"),
    description: z.string().optional(),
    start_date: z.string().min(1, "La date est requise"),
    start_time: z.string().min(1, "L'heure est requise"),
    end_date: z.string().optional(),
    end_time: z.string().optional(),
    color: z.string(),
  })
  .refine(
    (data) => {
      if (data.end_date && data.end_time) {
        const start = new Date(`${data.start_date}T${data.start_time}`);
        const end = new Date(`${data.end_date}T${data.end_time}`);
        return end > start;
      }
      return true;
    },
    {
      message: "La date de fin doit etre posterieure a la date de debut",
      path: ["end_time"],
    },
  );

type CreateEventFormData = z.infer<typeof createEventSchema>;

const COLOR_OPTIONS = [
  { value: "#8B5CF6", label: "Violet" },
  { value: "#3B82F6", label: "Bleu" },
  { value: "#10B981", label: "Vert" },
  { value: "#F59E0B", label: "Orange" },
  { value: "#EF4444", label: "Rouge" },
  { value: "#EC4899", label: "Rose" },
];

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  defaultDate?: string; // YYYY-MM-DD
  rangeStart: Date;
  rangeEnd: Date;
}

export function CreateEventModal({
  open,
  onClose,
  defaultDate,
  rangeStart,
  rangeEnd,
}: CreateEventModalProps) {
  const { createEvent } = useCalendarEvents(rangeStart, rangeEnd);
  const supabase = useSupabase();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      start_date: defaultDate ?? "",
      start_time: "09:00",
      end_date: "",
      end_time: "",
      color: "#8B5CF6",
    },
  });

  const selectedColor = watch("color");

  // Load profiles for attendee selection
  useEffect(() => {
    if (!open) return;
    supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, role")
      .order("full_name")
      .then(({ data, error }) => {
        if (error) {
          console.error("Erreur chargement des profils :", error.message);
          return;
        }
        if (data) setProfiles(data as Profile[]);
      });
  }, [open, supabase]);

  // Reset form when opening
  useEffect(() => {
    if (open) {
      reset({
        title: "",
        description: "",
        start_date: defaultDate ?? "",
        start_time: "09:00",
        end_date: "",
        end_time: "",
        color: "#8B5CF6",
      });
      setSelectedAttendees([]);
    }
  }, [open, defaultDate, reset]);

  const toggleAttendee = (id: string) => {
    setSelectedAttendees((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const onSubmit = async (data: CreateEventFormData) => {
    const startAt = `${data.start_date}T${data.start_time}:00`;
    const endAt =
      data.end_date && data.end_time
        ? `${data.end_date}T${data.end_time}:00`
        : undefined;

    await createEvent.mutateAsync({
      title: data.title,
      description: data.description || undefined,
      start_at: startAt,
      end_at: endAt,
      color: data.color,
      attendees: selectedAttendees.length > 0 ? selectedAttendees : undefined,
    });

    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouvel événement" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            {...register("title")}
            placeholder="Ex: Réunion d'équipe"
            className={cn(
              "w-full h-10 px-3 rounded-xl border bg-surface text-sm transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              errors.title ? "border-red-300" : "border-border",
            )}
          />
          {errors.title && (
            <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={2}
            placeholder="Détails de l'événement..."
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>

        {/* Start date/time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Date de début <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register("start_date")}
              className={cn(
                "w-full h-10 px-3 rounded-xl border bg-surface text-sm transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                errors.start_date ? "border-red-300" : "border-border",
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Heure de début <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              {...register("start_time")}
              className={cn(
                "w-full h-10 px-3 rounded-xl border bg-surface text-sm transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                errors.start_time ? "border-red-300" : "border-border",
              )}
            />
          </div>
        </div>

        {/* End date/time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Date de fin
            </label>
            <input
              type="date"
              {...register("end_date")}
              className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Heure de fin
            </label>
            <input
              type="time"
              {...register("end_time")}
              className={cn(
                "w-full h-10 px-3 rounded-xl border bg-surface text-sm transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                errors.end_time ? "border-red-300" : "border-border",
              )}
            />
            {errors.end_time && (
              <p className="text-xs text-red-500 mt-1">
                {errors.end_time.message}
              </p>
            )}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Couleur
          </label>
          <div className="flex gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setValue("color", c.value)}
                className={cn(
                  "w-8 h-8 rounded-full transition-all",
                  selectedColor === c.value
                    ? "ring-2 ring-offset-2 ring-foreground scale-110"
                    : "hover:scale-105",
                )}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Attendees */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Participants
          </label>
          <div className="max-h-32 overflow-y-auto rounded-xl border border-border bg-surface p-2 space-y-1">
            {profiles.length === 0 ? (
              <p className="text-xs text-muted-foreground p-2">Chargement...</p>
            ) : (
              profiles.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleAttendee(p.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm transition-colors",
                    selectedAttendees.includes(p.id)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                      selectedAttendees.includes(p.id)
                        ? "border-primary bg-primary"
                        : "border-border",
                    )}
                  >
                    {selectedAttendees.includes(p.id) && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="truncate">{p.full_name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {p.role}
                  </span>
                </button>
              ))
            )}
          </div>
          {selectedAttendees.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {selectedAttendees.length} participant
              {selectedAttendees.length > 1 ? "s" : ""} sélectionné
              {selectedAttendees.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || createEvent.isPending}
            className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting || createEvent.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CalendarPlus className="w-4 h-4" />
            )}
            Créer
          </button>
        </div>
      </form>
    </Modal>
  );
}
