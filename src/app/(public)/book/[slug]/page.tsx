"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  useBookingPageBySlug,
  useAvailableSlots,
  useCreateBooking,
  useTrackPageView,
  type QualificationField,
} from "@/hooks/use-booking-pages";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  Loader2,
  User,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";
import {
  format,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  addMonths,
  subMonths,
  getDay,
  startOfDay,
  addHours,
} from "date-fns";
import { fr } from "date-fns/locale";

type Step = "qualification" | "date" | "slot" | "confirm" | "done";

export default function PublicBookingPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { data: page, isLoading, error } = useBookingPageBySlug(slug);
  const trackView = useTrackPageView();

  // Track page view once
  useEffect(() => {
    if (page?.id) {
      trackView.mutate(page.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <CalendarCheck className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Page introuvable
          </h1>
          <p className="text-zinc-400">
            Cette page de reservation n&apos;existe pas ou n&apos;est plus
            active.
          </p>
        </div>
      </div>
    );
  }

  return <BookingFlow page={page} />;
}

// ─── Booking Flow ───────────────────────────────────────────

function BookingFlow({
  page,
}: {
  page: {
    id: string;
    title: string;
    description: string | null;
    brand_color: string;
    slot_duration: number;
    min_notice_hours: number;
    max_days_ahead: number;
    qualification_fields: QualificationField[];
  };
}) {
  const [step, setStep] = useState<Step>("qualification");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    custom: {} as Record<string, string>,
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    start_time: string;
    end_time: string;
  } | null>(null);

  const createBooking = useCreateBooking();

  const dateStr = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : undefined;

  const { data: slots, isLoading: slotsLoading } = useAvailableSlots(
    page.id,
    dateStr,
  );

  const brandColor = page.brand_color || "#AF0000";

  const handleConfirm = () => {
    if (!selectedDate || !selectedSlot) return;

    createBooking.mutate(
      {
        booking_page_id: page.id,
        prospect_name: formData.name,
        prospect_email: formData.email || undefined,
        prospect_phone: formData.phone || undefined,
        date: format(selectedDate, "yyyy-MM-dd"),
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        qualification_answers: formData.custom,
      },
      {
        onSuccess: () => setStep("done"),
      },
    );
  };

  const canProceedFromQualification = formData.name.trim().length > 0;

  const steps: { key: Step; label: string }[] = [
    { key: "qualification", label: "Infos" },
    { key: "date", label: "Date" },
    { key: "slot", label: "Heure" },
    { key: "confirm", label: "Confirmation" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: brandColor + "20" }}
          >
            <CalendarCheck
              className="w-5 h-5"
              style={{ color: brandColor }}
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{page.title}</h1>
            {page.description && (
              <p className="text-sm text-zinc-400 mt-0.5">
                {page.description}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Progress */}
      {step !== "done" && (
        <div className="max-w-2xl mx-auto w-full px-6 pt-6">
          <div className="flex items-center gap-1">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center flex-1">
                <div
                  className={cn(
                    "h-1.5 rounded-full w-full transition-all duration-300",
                    step === s.key || steps.findIndex((x) => x.key === step) > i
                      ? "opacity-100"
                      : "bg-zinc-800 opacity-50",
                  )}
                  style={{
                    backgroundColor:
                      step === s.key ||
                      steps.findIndex((x) => x.key === step) > i
                        ? brandColor
                        : undefined,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((s) => (
              <span
                key={s.key}
                className={cn(
                  "text-[10px] font-medium",
                  step === s.key ? "text-white" : "text-zinc-600",
                )}
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 py-8">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {step === "qualification" && (
              <StepQualification
                key="qualification"
                formData={formData}
                setFormData={setFormData}
                customFields={page.qualification_fields ?? []}
                brandColor={brandColor}
                onNext={() => setStep("date")}
                canProceed={canProceedFromQualification}
              />
            )}

            {step === "date" && (
              <StepDate
                key="date"
                selectedDate={selectedDate}
                onSelectDate={(d) => {
                  setSelectedDate(d);
                  setSelectedSlot(null);
                  setStep("slot");
                }}
                onBack={() => setStep("qualification")}
                brandColor={brandColor}
                minNoticeHours={page.min_notice_hours}
                maxDaysAhead={page.max_days_ahead}
              />
            )}

            {step === "slot" && (
              <StepSlot
                key="slot"
                slots={slots ?? []}
                isLoading={slotsLoading}
                selectedSlot={selectedSlot}
                onSelectSlot={(s) => {
                  setSelectedSlot(s);
                  setStep("confirm");
                }}
                onBack={() => setStep("date")}
                brandColor={brandColor}
                selectedDate={selectedDate!}
                slotDuration={page.slot_duration}
              />
            )}

            {step === "confirm" && (
              <StepConfirm
                key="confirm"
                formData={formData}
                selectedDate={selectedDate!}
                selectedSlot={selectedSlot!}
                slotDuration={page.slot_duration}
                brandColor={brandColor}
                onBack={() => setStep("slot")}
                onConfirm={handleConfirm}
                isPending={createBooking.isPending}
              />
            )}

            {step === "done" && (
              <StepDone
                key="done"
                brandColor={brandColor}
                name={formData.name}
                selectedDate={selectedDate!}
                selectedSlot={selectedSlot!}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-4 text-center">
        <p className="text-xs text-zinc-600">
          Propulse par{" "}
          <span className="text-zinc-400 font-medium">Off Market</span>
        </p>
      </footer>
    </div>
  );
}

// ─── Step: Qualification ────────────────────────────────────

function StepQualification({
  formData,
  setFormData,
  customFields,
  brandColor,
  onNext,
  canProceed,
}: {
  formData: {
    name: string;
    email: string;
    phone: string;
    custom: Record<string, string>;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<typeof formData>
  >;
  customFields: QualificationField[];
  brandColor: string;
  onNext: () => void;
  canProceed: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Vos coordonnees</h2>
        <p className="text-sm text-zinc-400">
          Remplissez vos informations pour prendre rendez-vous
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
            Nom complet *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((p) => ({ ...p, name: e.target.value }))
              }
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:border-transparent"
              style={
                {
                  "--tw-ring-color": brandColor + "40",
                } as React.CSSProperties
              }
              placeholder="Jean Dupont"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((p) => ({ ...p, email: e.target.value }))
              }
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:border-transparent"
              style={
                {
                  "--tw-ring-color": brandColor + "40",
                } as React.CSSProperties
              }
              placeholder="jean@exemple.com"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
            Telephone
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData((p) => ({ ...p, phone: e.target.value }))
              }
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:border-transparent"
              style={
                {
                  "--tw-ring-color": brandColor + "40",
                } as React.CSSProperties
              }
              placeholder="06 12 34 56 78"
            />
          </div>
        </div>

        {/* Custom fields */}
        {customFields.map((field) => (
          <div key={field.id}>
            <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
              {field.label}
              {field.required && " *"}
            </label>
            {field.type === "textarea" ? (
              <textarea
                value={formData.custom[field.id] ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    custom: { ...p.custom, [field.id]: e.target.value },
                  }))
                }
                rows={3}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                style={
                  {
                    "--tw-ring-color": brandColor + "40",
                  } as React.CSSProperties
                }
              />
            ) : field.type === "select" ? (
              <select
                value={formData.custom[field.id] ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    custom: { ...p.custom, [field.id]: e.target.value },
                  }))
                }
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:border-transparent"
                style={
                  {
                    "--tw-ring-color": brandColor + "40",
                  } as React.CSSProperties
                }
              >
                <option value="">Selectionnez...</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                value={formData.custom[field.id] ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    custom: { ...p.custom, [field.id]: e.target.value },
                  }))
                }
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:border-transparent"
                style={
                  {
                    "--tw-ring-color": brandColor + "40",
                  } as React.CSSProperties
                }
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        style={{ backgroundColor: brandColor }}
      >
        Choisir une date
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Step: Date ─────────────────────────────────────────────

function StepDate({
  selectedDate,
  onSelectDate,
  onBack,
  brandColor,
  minNoticeHours,
  maxDaysAhead,
}: {
  selectedDate: Date | null;
  onSelectDate: (d: Date) => void;
  onBack: () => void;
  brandColor: string;
  minNoticeHours: number;
  maxDaysAhead: number;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const minDate = useMemo(
    () => startOfDay(addHours(new Date(), minNoticeHours)),
    [minNoticeHours],
  );
  const maxDate = useMemo(
    () => addDays(new Date(), maxDaysAhead),
    [maxDaysAhead],
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Padding for the first row
  const startDayOfWeek = getDay(monthStart);
  // In fr locale, weeks start on Monday. getDay() returns 0 for Sunday.
  const paddingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Choisissez une date</h2>
          <p className="text-sm text-zinc-400">
            Selectionnez un jour dans le calendrier
          </p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-white capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: fr })}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
            <div
              key={d}
              className="text-center text-[11px] font-medium text-zinc-500 py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Padding */}
          {Array.from({ length: paddingDays }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}

          {days.map((day) => {
            const disabled =
              isBefore(day, minDate) ||
              isBefore(maxDate, day) ||
              !isSameMonth(day, currentMonth);
            const selected =
              selectedDate !== null && isSameDay(day, selectedDate);
            const today = isToday(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => !disabled && onSelectDate(day)}
                disabled={disabled}
                className={cn(
                  "aspect-square rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-center",
                  disabled
                    ? "text-zinc-700 cursor-not-allowed"
                    : "text-zinc-200 hover:bg-zinc-800 cursor-pointer",
                  selected && "text-white ring-2",
                  today && !selected && "text-white font-bold",
                )}
                style={
                  selected
                    ? {
                        backgroundColor: brandColor,
                        // @ts-expect-error CSS custom property
                        "--tw-ring-color": brandColor,
                      }
                    : undefined
                }
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Step: Slot ─────────────────────────────────────────────

function StepSlot({
  slots,
  isLoading,
  selectedSlot,
  onSelectSlot,
  onBack,
  brandColor,
  selectedDate,
  slotDuration,
}: {
  slots: { start_time: string; end_time: string }[];
  isLoading: boolean;
  selectedSlot: { start_time: string; end_time: string } | null;
  onSelectSlot: (s: { start_time: string; end_time: string }) => void;
  onBack: () => void;
  brandColor: string;
  selectedDate: Date;
  slotDuration: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">
            Choisissez un creneau
          </h2>
          <p className="text-sm text-zinc-400">
            {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })} &middot;{" "}
            {slotDuration} min
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm text-zinc-400">
            Aucun creneau disponible pour cette date
          </p>
          <button
            onClick={onBack}
            className="mt-3 text-sm font-medium hover:underline"
            style={{ color: brandColor }}
          >
            Choisir une autre date
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map((slot) => {
            const isSelected =
              selectedSlot?.start_time === slot.start_time;

            return (
              <button
                key={slot.start_time}
                onClick={() => onSelectSlot(slot)}
                className={cn(
                  "py-3 px-3 rounded-xl text-sm font-medium transition-all duration-150 border",
                  isSelected
                    ? "text-white border-transparent"
                    : "text-zinc-200 border-zinc-800 bg-zinc-900 hover:border-zinc-600",
                )}
                style={
                  isSelected
                    ? { backgroundColor: brandColor, borderColor: brandColor }
                    : undefined
                }
              >
                {slot.start_time}
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ─── Step: Confirm ──────────────────────────────────────────

function StepConfirm({
  formData,
  selectedDate,
  selectedSlot,
  slotDuration,
  brandColor,
  onBack,
  onConfirm,
  isPending,
}: {
  formData: { name: string; email: string; phone: string };
  selectedDate: Date;
  selectedSlot: { start_time: string; end_time: string };
  slotDuration: number;
  brandColor: string;
  onBack: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Confirmation</h2>
          <p className="text-sm text-zinc-400">
            Verifiez les informations avant de confirmer
          </p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: brandColor + "20" }}
          >
            <User className="w-5 h-5" style={{ color: brandColor }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{formData.name}</p>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              {formData.email && <span>{formData.email}</span>}
              {formData.phone && <span>{formData.phone}</span>}
            </div>
          </div>
        </div>

        <div className="h-px bg-zinc-800" />

        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: brandColor + "20" }}
          >
            <CalendarCheck
              className="w-5 h-5"
              style={{ color: brandColor }}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-white capitalize">
              {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
            </p>
            <p className="text-xs text-zinc-400">
              {selectedSlot.start_time} - {selectedSlot.end_time} ({slotDuration}{" "}
              min)
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onConfirm}
        disabled={isPending}
        className="w-full py-3.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ backgroundColor: brandColor }}
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Reservation en cours...
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            Confirmer le rendez-vous
          </>
        )}
      </button>
    </motion.div>
  );
}

// ─── Step: Done ─────────────────────────────────────────────

function StepDone({
  brandColor,
  name,
  selectedDate,
  selectedSlot,
}: {
  brandColor: string;
  name: string;
  selectedDate: Date;
  selectedSlot: { start_time: string; end_time: string };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center py-12"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
        style={{ backgroundColor: brandColor + "20" }}
      >
        <Check className="w-8 h-8" style={{ color: brandColor }} />
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">
        Rendez-vous confirme !
      </h2>
      <p className="text-zinc-400 mb-6">
        Merci {name.split(" ")[0]}, votre rendez-vous est bien enregistre.
      </p>

      <div className="inline-block bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4">
        <p className="text-sm font-semibold text-white capitalize">
          {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
        </p>
        <p className="text-sm text-zinc-400 mt-1">
          {selectedSlot.start_time} - {selectedSlot.end_time}
        </p>
      </div>

      <p className="text-xs text-zinc-500 mt-8">
        Vous recevrez un email de confirmation avec les details du rendez-vous.
      </p>
    </motion.div>
  );
}
