"use client";

import { use, useState, useCallback, useEffect, useRef } from "react";
import { useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  useQuery,
  useMutation,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { evaluateConditionalLogic } from "@/lib/conditional-logic";
import { toast, Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ArrowLeft,
  ArrowRight,
  Star,
  Upload,
  ChevronDown,
  Minus as MinusIcon,
  Plus as PlusIcon,
  Sun,
  Moon,
} from "lucide-react";
import type { Form, FormField } from "@/types/database";

// ---------------------------------------------------------------------------
// Theme context for public forms (independent from app theme)
// ---------------------------------------------------------------------------

function useFormTheme() {
  const [dark, setDark] = useState(true); // default dark like onboarding
  const toggle = useCallback(() => setDark((d) => !d), []);
  return { dark, toggle };
}

// ---------------------------------------------------------------------------
// Main form content
// ---------------------------------------------------------------------------

function PublicFormContent({ formId }: { formId: string }) {
  const supabase = useMemo(() => createClient(), []);
  const { dark, toggle } = useFormTheme();

  const { data: form, isLoading } = useQuery({
    queryKey: ["public-form", formId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forms")
        .select("*, form_fields(*)")
        .eq("id", formId)
        .single();
      if (error) throw error;
      return data as Form & { form_fields: FormField[] };
    },
  });

  const submitForm = useMutation({
    mutationFn: async (answers: Record<string, unknown>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from("form_submissions") as any)
        .insert({
          form_id: formId,
          respondent_id: null,
          answers,
        })
        .select();
      console.log("[FormSubmit] result:", { data, error });
      if (error) throw new Error(error.message || "Erreur Supabase");
    },
  });

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [direction, setDirection] = useState(1);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const fields =
    form?.form_fields?.sort((a, b) => a.sort_order - b.sort_order) ?? [];
  const visibleFields = fields.filter((f) =>
    evaluateConditionalLogic(f.conditional_logic, answers),
  );
  const questionFields = visibleFields.filter(
    (f) => !["heading", "paragraph", "divider"].includes(f.field_type),
  );

  const currentField = questionFields[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questionFields.length - 1;

  // Find which "pilier" heading the current question belongs to
  const currentPilier = useMemo(() => {
    if (!currentField) return null;
    const currentSortOrder = currentField.sort_order ?? 0;
    const headings = visibleFields.filter((f) => f.field_type === "heading");
    let pilier: FormField | null = null;
    for (const h of headings) {
      if (h.sort_order < currentSortOrder) pilier = h;
    }
    return pilier;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, visibleFields, currentField]);
  const progress =
    questionFields.length > 0
      ? ((currentIndex + 1) / questionFields.length) * 100
      : 0;

  const updateAnswer = useCallback((fieldId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const goNext = useCallback(() => {
    if (!currentField) return;
    if (currentField.is_required && !answers[currentField.id]?.trim()) {
      toast.error("Ce champ est requis");
      return;
    }
    if (!isLast) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    }
  }, [currentField, answers, isLast]);

  const goPrev = useCallback(() => {
    if (!isFirst) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  }, [isFirst]);

  const handleSubmit = async () => {
    if (currentField?.is_required && !answers[currentField.id]?.trim()) {
      toast.error("Ce champ est requis");
      return;
    }
    const missing = questionFields.find(
      (f) => f.is_required && !answers[f.id]?.trim(),
    );
    if (missing) {
      toast.error(`Le champ "${missing.label}" est requis`);
      return;
    }
    try {
      await submitForm.mutateAsync(answers);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[FormSubmit] Error:", msg);
      toast.error(`Erreur lors de l'envoi: ${msg}`);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        if (currentField?.field_type === "long_text") return;
        e.preventDefault();
        if (isLast) {
          handleSubmit();
        } else {
          goNext();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
  }, [currentIndex]);

  // Shared wrapper classes
  const wrapperClass = cn(
    "min-h-screen transition-colors duration-500",
    dark
      ? "bg-gradient-to-br from-slate-950 via-red-950 to-slate-900"
      : "bg-gradient-to-br from-white via-rose-50/30 to-slate-50",
  );
  const textPrimary = dark ? "text-white" : "text-slate-900";
  const textSecondary = dark ? "text-white/50" : "text-slate-500";
  const textMuted = dark ? "text-white/30" : "text-slate-400";

  // Theme toggle is now inline in the header (no fixed overlay)

  if (isLoading) {
    return (
      <div className={cn(wrapperClass, "flex items-center justify-center")}>
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className={cn(wrapperClass, "flex items-center justify-center")}>
        <div className="text-center">
          <p className={cn("text-xl font-semibold mb-2", textPrimary)}>
            Formulaire non trouvé
          </p>
          <p className={cn("text-sm", textSecondary)}>
            Ce lien n&apos;est pas valide ou le formulaire a ete supprime.
          </p>
        </div>
      </div>
    );
  }

  if (form.status === "closed") {
    return (
      <div className={cn(wrapperClass, "flex items-center justify-center")}>
        <div className="text-center">
          <p className={cn("text-xl font-semibold mb-2", textPrimary)}>
            Formulaire ferme
          </p>
          <p className={cn("text-sm", textSecondary)}>
            Ce formulaire n&apos;accepte plus de réponses.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={cn(wrapperClass, "flex items-center justify-center")}>
        {/* Decorative blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className={cn(
              "absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl",
              dark ? "bg-primary/20" : "bg-primary/10",
            )}
          />
          <div
            className={cn(
              "absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl",
              dark ? "bg-rose-500/10" : "bg-rose-200/30",
            )}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.4, 0, 1] }}
          className="text-center max-w-md px-6 relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <Check className="w-10 h-10 text-emerald-500" />
          </motion.div>
          <h1 className={cn("text-3xl font-bold mb-3", textPrimary)}>
            Merci !
          </h1>
          <p className={cn("text-lg", textSecondary)}>
            {form.thank_you_message ||
              "Ta réponse a ete enregistree avec succès."}
          </p>
        </motion.div>
      </div>
    );
  }

  if (questionFields.length === 0) {
    return (
      <div className={cn(wrapperClass, "flex items-center justify-center")}>
        <p className={textSecondary}>Ce formulaire n&apos;a pas de champs</p>
      </div>
    );
  }

  return (
    <div className={cn(wrapperClass, "flex flex-col relative overflow-hidden")}>
      {/* Decorative animated background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className={cn(
            "absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl",
            dark ? "bg-primary/15" : "bg-primary/5",
          )}
        />
        <div
          className={cn(
            "absolute top-1/2 -left-40 w-[400px] h-[400px] rounded-full blur-3xl",
            dark ? "bg-rose-500/10" : "bg-rose-200/20",
          )}
        />
        <div
          className={cn(
            "absolute -bottom-40 right-1/3 w-[300px] h-[300px] rounded-full blur-3xl",
            dark ? "bg-red-500/10" : "bg-red-100/20",
          )}
        />
      </div>

      {/* Progress bar */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 h-1",
          dark ? "bg-white/5" : "bg-slate-200",
        )}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-red-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!isFirst && (
            <button
              onClick={goPrev}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                dark
                  ? "bg-white/5 hover:bg-white/10 text-white/50 hover:text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600",
              )}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h3 className={cn("text-sm font-medium", textSecondary)}>
              {form.title}
            </h3>
            {currentPilier && (
              <p
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider mt-0.5",
                  dark ? "text-primary/70" : "text-primary",
                )}
              >
                {currentPilier.label}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("text-xs font-mono", textMuted)}>
            {currentIndex + 1} / {questionFields.length}
          </span>
          <button
            onClick={toggle}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
              dark
                ? "bg-white/10 hover:bg-white/20 text-white/50 hover:text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600",
            )}
            title={dark ? "Mode clair" : "Mode sombre"}
          >
            {dark ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Question area */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentField.id}
              custom={direction}
              initial={{ opacity: 0, y: direction > 0 ? 40 : -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: direction > 0 ? -40 : 40 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="mb-8">
                <h2
                  className={cn(
                    "text-2xl sm:text-3xl font-bold tracking-tight leading-tight",
                    textPrimary,
                  )}
                >
                  {currentField.label || "Sans titre"}
                  {currentField.is_required && (
                    <span className="text-primary ml-1">*</span>
                  )}
                </h2>
                {currentField.description && (
                  <p className={cn("text-base mt-3", textSecondary)}>
                    {currentField.description}
                  </p>
                )}
              </div>

              <FormFieldInput
                field={currentField}
                value={answers[currentField.id] ?? ""}
                onChange={(val) => updateAnswer(currentField.id, val)}
                inputRef={inputRef}
                dark={dark}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="relative z-10 px-6 pb-6">
        <div className="flex items-center justify-center max-w-xl mx-auto">
          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={submitForm.isPending}
              className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-red-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-red-500/25 transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/40 disabled:opacity-50 disabled:hover:scale-100"
            >
              {submitForm.isPending ? "Envoi..." : "Envoyer"}
              <Check className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>
          ) : (
            <button
              onClick={goNext}
              className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-red-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-red-500/25 transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/40"
            >
              Suivant
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </div>
        <p className={cn("text-center text-xs mt-4", textMuted)}>
          Appuie sur{" "}
          <kbd
            className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-mono",
              dark
                ? "bg-white/10 text-white/40"
                : "bg-slate-100 text-slate-400",
            )}
          >
            Entree
          </kbd>{" "}
          pour continuer
        </p>
      </div>
    </div>
  );
}

/* ─── Form Field Input (themed) ─── */

function FormFieldInput({
  field,
  value,
  onChange,
  inputRef,
  dark,
}: {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  inputRef: React.MutableRefObject<
    HTMLInputElement | HTMLTextAreaElement | null
  >;
  dark: boolean;
}) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const type = field.field_type;

  // Shared input classes
  const inputClass = cn(
    "w-full text-lg sm:text-xl bg-transparent border-b-2 pb-3 outline-none transition-colors",
    dark
      ? "border-white/10 focus:border-primary text-white placeholder:text-white/20"
      : "border-slate-200 focus:border-primary text-slate-900 placeholder:text-slate-300",
  );

  const optionClass = (selected: boolean) =>
    cn(
      "w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center gap-3",
      selected
        ? dark
          ? "border-primary bg-primary/20 text-white"
          : "border-primary bg-primary/5 text-slate-900"
        : dark
          ? "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10"
          : "border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:bg-slate-50",
    );

  const radioClass = (selected: boolean) =>
    cn(
      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
      selected
        ? "border-primary"
        : dark
          ? "border-white/20"
          : "border-slate-300",
    );

  const letterClass = cn(
    "ml-auto text-xs font-mono",
    dark ? "text-white/20" : "text-slate-300",
  );

  if (type === "short_text") {
    return (
      <input
        ref={(el) => {
          inputRef.current = el;
        }}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder ?? "Ecris ta réponse ici..."}
        className={inputClass}
      />
    );
  }

  if (type === "long_text") {
    return (
      <div className="space-y-2">
        <textarea
          ref={(el) => {
            inputRef.current = el;
          }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? "Ecris ta réponse ici..."}
          rows={5}
          className={cn(inputClass, "resize-none")}
        />
        <p
          className={cn(
            "text-xs text-right",
            dark ? "text-white/20" : "text-slate-300",
          )}
        >
          {value.length} caractere{value.length !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }

  if (type === "email") {
    return (
      <input
        ref={(el) => {
          inputRef.current = el;
        }}
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder ?? "nom@exemple.com"}
        className={inputClass}
      />
    );
  }

  if (type === "phone") {
    return (
      <input
        ref={(el) => {
          inputRef.current = el;
        }}
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder ?? "+33 6 00 00 00 00"}
        className={inputClass}
      />
    );
  }

  if (type === "number") {
    const numValue = value ? Number(value) : 0;
    const btnClass = cn(
      "w-12 h-12 rounded-xl border flex items-center justify-center transition-colors",
      dark
        ? "border-white/10 text-white hover:bg-white/10"
        : "border-slate-200 text-slate-700 hover:bg-slate-100",
    );
    return (
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(String(Math.max(0, numValue - 1)))}
          className={btnClass}
        >
          <MinusIcon className="w-5 h-5" />
        </button>
        <input
          ref={(el) => {
            inputRef.current = el;
          }}
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className={cn(
            "w-32 text-center text-3xl font-bold bg-transparent border-b-2 pb-2 outline-none transition-colors",
            dark
              ? "border-white/10 focus:border-primary text-white"
              : "border-slate-200 focus:border-primary text-slate-900",
          )}
        />
        <button
          type="button"
          onClick={() => onChange(String(numValue + 1))}
          className={btnClass}
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  if (type === "single_select") {
    const options = field.options ?? [];
    return (
      <div className="space-y-2.5">
        {options.map((opt, i) => (
          <motion.button
            key={opt.value}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onChange(opt.value)}
            className={optionClass(value === opt.value)}
          >
            <div className={radioClass(value === opt.value)}>
              {value === opt.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2.5 h-2.5 rounded-full bg-primary"
                />
              )}
            </div>
            <span className="text-base font-medium">{opt.label}</span>
            <span className={letterClass}>{String.fromCharCode(65 + i)}</span>
          </motion.button>
        ))}
      </div>
    );
  }

  if (type === "multi_select") {
    const options = field.options ?? [];
    const selected = value ? value.split(",") : [];
    const toggleOption = (optValue: string) => {
      const newSelected = selected.includes(optValue)
        ? selected.filter((v) => v !== optValue)
        : [...selected, optValue];
      onChange(newSelected.join(","));
    };
    return (
      <div className="space-y-2.5">
        <p
          className={cn(
            "text-xs mb-3",
            dark ? "text-white/30" : "text-slate-400",
          )}
        >
          Plusieurs choix possibles
        </p>
        {options.map((opt, i) => {
          const isSelected = selected.includes(opt.value);
          return (
            <motion.button
              key={opt.value}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => toggleOption(opt.value)}
              className={optionClass(isSelected)}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                  isSelected
                    ? "border-primary bg-primary"
                    : dark
                      ? "border-white/20"
                      : "border-slate-300",
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-base font-medium">{opt.label}</span>
              <span className={letterClass}>{String.fromCharCode(65 + i)}</span>
            </motion.button>
          );
        })}
      </div>
    );
  }

  if (type === "dropdown") {
    const options = field.options ?? [];
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center justify-between",
            value
              ? dark
                ? "border-primary text-white"
                : "border-primary text-slate-900"
              : dark
                ? "border-white/10 text-white/40"
                : "border-slate-200 text-slate-400",
          )}
        >
          <span className="text-base">
            {value
              ? (options.find((o) => o.value === value)?.label ?? value)
              : "Sélectionner..."}
          </span>
          <ChevronDown
            className={cn(
              "w-5 h-5 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "absolute top-full left-0 right-0 mt-2 border rounded-xl shadow-lg overflow-hidden z-10",
                dark
                  ? "bg-slate-900 border-white/10"
                  : "bg-white border-slate-200",
              )}
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-5 py-3 text-sm transition-colors",
                    value === opt.value
                      ? "bg-primary/10 text-primary font-medium"
                      : dark
                        ? "text-white/60 hover:bg-white/5"
                        : "text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (type === "rating") {
    const numValue = value ? Number(value) : 0;
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            key={n}
            type="button"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHoveredRating(n)}
            onMouseLeave={() => setHoveredRating(null)}
            onClick={() => onChange(String(n))}
          >
            <Star
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 transition-colors",
                (hoveredRating !== null ? n <= hoveredRating : n <= numValue)
                  ? "fill-amber-400 text-amber-400"
                  : dark
                    ? "text-white/10 hover:text-amber-200/50"
                    : "text-slate-200 hover:text-amber-200",
              )}
            />
          </motion.button>
        ))}
      </div>
    );
  }

  if (type === "nps") {
    return (
      <div className="space-y-3">
        <div className="flex gap-1.5 sm:gap-2 flex-wrap">
          {Array.from({ length: 11 }, (_, n) => {
            const getBg = () => {
              if (value === String(n)) {
                if (n <= 6) return "bg-red-500 text-white border-red-500";
                if (n <= 8) return "bg-amber-500 text-white border-amber-500";
                return "bg-emerald-500 text-white border-emerald-500";
              }
              return dark
                ? "border-white/10 text-white/50 hover:border-white/20"
                : "border-slate-200 text-slate-500 hover:border-primary/40";
            };
            return (
              <motion.button
                key={n}
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onChange(String(n))}
                className={cn(
                  "w-10 h-10 sm:w-11 sm:h-11 rounded-xl border-2 text-sm font-semibold transition-all",
                  getBg(),
                )}
              >
                {n}
              </motion.button>
            );
          })}
        </div>
        <div
          className={cn(
            "flex justify-between text-xs",
            dark ? "text-white/25" : "text-slate-300",
          )}
        >
          <span>Pas du tout probable</span>
          <span>Tres probable</span>
        </div>
      </div>
    );
  }

  if (type === "scale") {
    return (
      <div className="flex gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            key={n}
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(String(n))}
            className={cn(
              "w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 text-lg font-semibold transition-all",
              value === String(n)
                ? "border-primary bg-primary text-white"
                : dark
                  ? "border-white/10 text-white/50 hover:border-white/20"
                  : "border-slate-200 text-slate-500 hover:border-primary/40",
            )}
          >
            {n}
          </motion.button>
        ))}
      </div>
    );
  }

  if (type === "date") {
    return (
      <input
        ref={(el) => {
          inputRef.current = el;
        }}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass, "max-w-xs")}
      />
    );
  }

  if (type === "time") {
    return (
      <input
        ref={(el) => {
          inputRef.current = el;
        }}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass, "max-w-[200px]")}
      />
    );
  }

  if (type === "file_upload") {
    const [isDragOver, setIsDragOver] = useState(false);
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) onChange(file.name);
        }}
        className={cn(
          "border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer",
          isDragOver
            ? "border-primary bg-primary/5"
            : value
              ? "border-emerald-500 bg-emerald-500/10"
              : dark
                ? "border-white/10 hover:border-white/20"
                : "border-slate-200 hover:border-primary/30",
        )}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) onChange(file.name);
          };
          input.click();
        }}
      >
        {value ? (
          <div className="space-y-2">
            <Check className="w-8 h-8 text-emerald-500 mx-auto" />
            <p
              className={cn(
                "text-sm font-medium",
                dark ? "text-white" : "text-slate-900",
              )}
            >
              {value}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload
              className={cn(
                "w-8 h-8 mx-auto",
                dark ? "text-white/20" : "text-slate-300",
              )}
            />
            <p
              className={cn(
                "text-sm",
                dark ? "text-white/40" : "text-slate-400",
              )}
            >
              Glisse un fichier ici ou{" "}
              <span className="text-primary font-medium">parcourir</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <input
      ref={(el) => {
        inputRef.current = el;
      }}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Réponse..."
      className={inputClass}
    />
  );
}

// Wrapper with QueryClient for public page (no AuthProvider needed)
export default function PublicFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PublicFormContent formId={formId} />
      <Toaster position="bottom-center" richColors />
    </QueryClientProvider>
  );
}
