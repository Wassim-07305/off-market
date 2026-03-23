"use client";

import { use, useState, useCallback, useEffect, useRef } from "react";
import { useForm as useFormData } from "@/hooks/use-forms";
import { useFormMutations } from "@/hooks/use-forms";
import { useAuth } from "@/hooks/use-auth";
import { evaluateConditionalLogic } from "@/lib/conditional-logic";
import { toast } from "sonner";
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
} from "lucide-react";
import Link from "next/link";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import type { FormField } from "@/types/database";

export default function FormRespondPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);
  const { data: form, isLoading } = useFormData(formId);
  const { submitForm } = useFormMutations();
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const prefix = useRoutePrefix();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const fields =
    form?.form_fields?.sort((a, b) => a.sort_order - b.sort_order) ?? [];

  // Filter visible fields
  const visibleFields = fields.filter((f) =>
    evaluateConditionalLogic(f.conditional_logic, answers),
  );

  // Only question fields (skip structural)
  const questionFields = visibleFields.filter(
    (f) => !["heading", "paragraph", "divider"].includes(f.field_type),
  );

  const currentField = questionFields[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questionFields.length - 1;
  const progress =
    questionFields.length > 0
      ? ((currentIndex + 1) / questionFields.length) * 100
      : 0;

  const updateAnswer = useCallback((fieldId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const goNext = useCallback(() => {
    if (!currentField) return;
    // Validate required
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

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        // Don't advance from textarea
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

  // Auto-focus input
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
  }, [currentIndex]);

  const handleSubmit = async () => {
    if (!currentField) return;
    if (currentField.is_required && !answers[currentField.id]?.trim()) {
      toast.error("Ce champ est requis");
      return;
    }

    // Validate all required visible fields
    const missing = questionFields.find(
      (f) => f.is_required && !answers[f.id]?.trim(),
    );
    if (missing) {
      toast.error(`Le champ "${missing.label}" est requis`);
      return;
    }

    try {
      await submitForm.mutateAsync({
        formId,
        respondentId: user?.id,
        answers,
      });
      setSubmitted(true);
    } catch {
      toast.error("Erreur lors de l'envoi");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Formulaire non trouvé</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0, 1] }}
        className="min-h-[60vh] flex items-center justify-center"
      >
        <div className="text-center max-w-md">
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
          <h1 className="text-3xl font-bold text-foreground mb-3">Merci !</h1>
          <p className="text-lg text-muted-foreground">
            {form.thank_you_message ||
              "Ta réponse a ete enregistree avec succès."}
          </p>
          <Link
            href={`${prefix}/forms`}
            className="inline-flex items-center gap-2 text-sm text-primary mt-8 hover:text-primary-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux formulaires
          </Link>
        </div>
      </motion.div>
    );
  }

  if (questionFields.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Ce formulaire n&apos;a pas de champs
          </p>
          <Link
            href={`${prefix}/forms/${formId}`}
            className="text-sm text-primary hover:text-primary-hover"
          >
            Retour
          </Link>
        </div>
      </div>
    );
  }

  // Intro screen (first view showing title)
  if (currentIndex === 0 && !answers[questionFields[0]?.id]) {
    // Show intro only if we haven't started answering yet
  }

  return (
    <div className="min-h-[60vh] flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      {/* Question counter */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href={`${prefix}/forms/${formId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quitter
        </Link>
        <span className="text-xs text-muted-foreground">
          {currentIndex + 1} / {questionFields.length}
        </span>
      </div>

      {/* Question area */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentField.id}
              custom={direction}
              initial={{ opacity: 0, y: direction * 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: direction * -40 }}
              transition={{ duration: 0.35, ease: [0.25, 0.4, 0, 1] }}
            >
              {/* Field label */}
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                  {currentField.label || "Sans titre"}
                  {currentField.is_required && (
                    <span className="text-primary ml-1">*</span>
                  )}
                </h2>
                {currentField.description && (
                  <p className="text-base text-muted-foreground mt-3">
                    {currentField.description}
                  </p>
                )}
              </div>

              {/* Field input */}
              <TypeformField
                field={currentField}
                value={answers[currentField.id] ?? ""}
                onChange={(val) => updateAnswer(currentField.id, val)}
                inputRef={inputRef}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-12 pb-4">
        <button
          onClick={goPrev}
          disabled={isFirst}
          className={cn(
            "h-11 px-5 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
            isFirst
              ? "opacity-0 pointer-events-none"
              : "bg-muted text-foreground hover:bg-border/50",
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          Precedent
        </button>

        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={submitForm.isPending}
            className="h-11 px-6 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
          >
            {submitForm.isPending ? "Envoi..." : "Envoyer"}
            <Check className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={goNext}
            className="h-11 px-6 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center gap-2"
          >
            Suivant
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-xs text-muted-foreground/50 pb-2">
        Appuie sur{" "}
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
          Entree
        </kbd>{" "}
        pour continuer
      </p>
    </div>
  );
}

/* ─── Typeform Field ─── */

function TypeformField({
  field,
  value,
  onChange,
  inputRef,
}: {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  inputRef: React.MutableRefObject<
    HTMLInputElement | HTMLTextAreaElement | null
  >;
}) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const type = field.field_type;

  // Short text
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
        className="w-full text-lg sm:text-xl bg-transparent border-b-2 border-border focus:border-primary pb-3 outline-none placeholder:text-muted-foreground/30 text-foreground transition-colors"
      />
    );
  }

  // Long text
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
          className="w-full text-lg bg-transparent border-b-2 border-border focus:border-primary pb-3 outline-none placeholder:text-muted-foreground/30 text-foreground transition-colors resize-none"
        />
        <p className="text-xs text-muted-foreground/40 text-right">
          {value.length} caractere{value.length !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }

  // Email
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
        className="w-full text-lg sm:text-xl bg-transparent border-b-2 border-border focus:border-primary pb-3 outline-none placeholder:text-muted-foreground/30 text-foreground transition-colors"
      />
    );
  }

  // Phone
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
        className="w-full text-lg sm:text-xl bg-transparent border-b-2 border-border focus:border-primary pb-3 outline-none placeholder:text-muted-foreground/30 text-foreground transition-colors"
      />
    );
  }

  // Number
  if (type === "number") {
    const numValue = value ? Number(value) : 0;
    return (
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(String(Math.max(0, numValue - 1)))}
          className="w-12 h-12 rounded-xl border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors"
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
          className="w-32 text-center text-3xl font-bold bg-transparent border-b-2 border-border focus:border-primary pb-2 outline-none text-foreground transition-colors"
        />
        <button
          type="button"
          onClick={() => onChange(String(numValue + 1))}
          className="w-12 h-12 rounded-xl border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Single select (radio cards)
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
            className={cn(
              "w-full text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center gap-3",
              value === opt.value
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border hover:border-primary/30 text-foreground/80",
            )}
          >
            <div
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                value === opt.value ? "border-primary" : "border-border",
              )}
            >
              {value === opt.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2.5 h-2.5 rounded-full bg-primary"
                />
              )}
            </div>
            <span className="text-base font-medium">{opt.label}</span>
            <span className="ml-auto text-xs text-muted-foreground/50 font-mono">
              {String.fromCharCode(65 + i)}
            </span>
          </motion.button>
        ))}
      </div>
    );
  }

  // Multi select (checkbox cards)
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
        <p className="text-xs text-muted-foreground mb-3">
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
              className={cn(
                "w-full text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center gap-3",
                isSelected
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border hover:border-primary/30 text-foreground/80",
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                  isSelected ? "border-primary bg-primary" : "border-border",
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-base font-medium">{opt.label}</span>
              <span className="ml-auto text-xs text-muted-foreground/50 font-mono">
                {String.fromCharCode(65 + i)}
              </span>
            </motion.button>
          );
        })}
      </div>
    );
  }

  // Dropdown
  if (type === "dropdown") {
    const options = field.options ?? [];
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center justify-between",
            value
              ? "border-primary text-foreground"
              : "border-border text-muted-foreground",
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
              className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-10"
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
                    "w-full text-left px-5 py-3 text-sm transition-colors hover:bg-muted",
                    value === opt.value &&
                      "bg-primary/5 text-primary font-medium",
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

  // Rating (stars)
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
            className="transition-colors"
          >
            <Star
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 transition-colors",
                (hoveredRating !== null ? n <= hoveredRating : n <= numValue)
                  ? "fill-amber-400 text-amber-400"
                  : "text-border hover:text-amber-200",
              )}
            />
          </motion.button>
        ))}
      </div>
    );
  }

  // NPS (0-10 with color gradient)
  if (type === "nps") {
    return (
      <div className="space-y-3">
        <div className="flex gap-1.5 sm:gap-2 flex-wrap">
          {Array.from({ length: 11 }, (_, n) => {
            // Color gradient: red(0-6) -> yellow(7-8) -> green(9-10)
            const getBg = () => {
              if (value === String(n)) {
                if (n <= 6) return "bg-red-500 text-white border-red-500";
                if (n <= 8) return "bg-amber-500 text-white border-amber-500";
                return "bg-emerald-500 text-white border-emerald-500";
              }
              return "border-border text-foreground hover:border-primary/40";
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
        <div className="flex justify-between text-xs text-muted-foreground/50">
          <span>Pas du tout probable</span>
          <span>Tres probable</span>
        </div>
      </div>
    );
  }

  // Scale (1-5 likert)
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
                : "border-border text-foreground hover:border-primary/40",
            )}
          >
            {n}
          </motion.button>
        ))}
      </div>
    );
  }

  // Date
  if (type === "date") {
    return (
      <input
        ref={(el) => {
          inputRef.current = el;
        }}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full max-w-xs text-lg bg-transparent border-b-2 border-border focus:border-primary pb-3 outline-none text-foreground transition-colors"
      />
    );
  }

  // Time
  if (type === "time") {
    return (
      <input
        ref={(el) => {
          inputRef.current = el;
        }}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full max-w-[200px] text-lg bg-transparent border-b-2 border-border focus:border-primary pb-3 outline-none text-foreground transition-colors"
      />
    );
  }

  // File upload
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
              ? "border-emerald-500 bg-emerald-50"
              : "border-border hover:border-primary/30",
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
            <p className="text-sm font-medium text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">Clique pour changer</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="w-8 h-8 text-muted-foreground/40 mx-auto" />
            <p className="text-sm text-muted-foreground">
              Glisse un fichier ici ou{" "}
              <span className="text-primary font-medium">parcourir</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  // Heading (should not appear in questions but just in case)
  if (type === "heading") {
    return <h2 className="text-xl font-bold text-foreground">{field.label}</h2>;
  }

  // Paragraph
  if (type === "paragraph") {
    return <p className="text-muted-foreground">{field.label}</p>;
  }

  // Divider
  if (type === "divider") {
    return <hr className="border-border" />;
  }

  // Fallback
  return (
    <input
      ref={(el) => {
        inputRef.current = el;
      }}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Réponse..."
      className="w-full text-lg bg-transparent border-b-2 border-border focus:border-primary pb-3 outline-none text-foreground"
    />
  );
}
