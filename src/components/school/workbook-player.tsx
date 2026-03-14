"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Save,
  Send,
  Loader2,
  CheckCircle2,
  Star,
  MessageSquare,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  useWorkbook,
  useWorkbookSubmission,
  useSubmitWorkbook,
  useReviewWorkbook,
} from "@/hooks/use-workbooks";
import type { WorkbookField } from "@/types/database";

interface WorkbookPlayerProps {
  workbookId: string;
  clientId?: string;
  callId?: string;
  readOnly?: boolean;
  onSubmitted?: () => void;
}

export function WorkbookPlayer({
  workbookId,
  clientId,
  callId,
  readOnly = false,
  onSubmitted,
}: WorkbookPlayerProps) {
  const { user, isStaff } = useAuth();
  const { data: workbook, isLoading: loadingWorkbook } =
    useWorkbook(workbookId);
  const resolvedClientId = clientId ?? user?.id ?? "";
  const { data: existingSubmission, isLoading: loadingSubmission } =
    useWorkbookSubmission(workbookId, resolvedClientId);

  const submitWorkbook = useSubmitWorkbook();
  const reviewWorkbook = useReviewWorkbook();

  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [reviewNotes, setReviewNotes] = useState("");
  const isReviewMode = readOnly && isStaff && existingSubmission?.status === "submitted";

  // Load existing answers
  useEffect(() => {
    if (existingSubmission?.answers) {
      setAnswers(existingSubmission.answers);
    }
  }, [existingSubmission]);

  useEffect(() => {
    if (existingSubmission?.reviewer_notes) {
      setReviewNotes(existingSubmission.reviewer_notes);
    }
  }, [existingSubmission]);

  const setAnswer = (fieldId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = (status: "draft" | "submitted") => {
    submitWorkbook.mutate(
      {
        workbookId,
        clientId: resolvedClientId,
        answers,
        status,
        callId,
      },
      {
        onSuccess: () => {
          if (status === "submitted") onSubmitted?.();
        },
      },
    );
  };

  const handleReview = () => {
    if (!existingSubmission) return;
    reviewWorkbook.mutate({
      submissionId: existingSubmission.id,
      reviewerNotes: reviewNotes,
    });
  };

  if (loadingWorkbook || loadingSubmission) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workbook) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Workbook introuvable
      </div>
    );
  }

  const isReadOnly =
    readOnly || existingSubmission?.status === "submitted" || existingSubmission?.status === "reviewed";
  const fields = workbook.fields as WorkbookField[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            {workbook.title}
          </h3>
          {existingSubmission?.status === "submitted" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[11px] font-medium">
              <Send className="w-3 h-3" />
              Soumis
            </span>
          )}
          {existingSubmission?.status === "reviewed" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Revise
            </span>
          )}
          {isReadOnly && !readOnly && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
              <Eye className="w-3 h-3" />
              Lecture seule
            </span>
          )}
        </div>
        {workbook.description && (
          <p className="text-sm text-muted-foreground">
            {workbook.description}
          </p>
        )}
        {workbook.module_type && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium capitalize">
            {workbook.module_type}
          </span>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-5">
        {fields.map((field, index) => (
          <FieldRenderer
            key={field.id}
            field={field}
            index={index}
            value={answers[field.id]}
            onChange={(val) => setAnswer(field.id, val)}
            readOnly={isReadOnly}
          />
        ))}
      </div>

      {/* Reviewer notes (coach) */}
      {existingSubmission?.reviewer_notes && !isReviewMode && (
        <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-4 space-y-2">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-violet-500" />
            Notes du coach
          </h4>
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">
            {existingSubmission.reviewer_notes}
          </p>
        </div>
      )}

      {/* Review form (coach) */}
      {isReviewMode && (
        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-violet-500" />
            Ajouter une revue
          </h4>
          <textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={4}
            placeholder="Tes notes de revue pour le client..."
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
          <button
            onClick={handleReview}
            disabled={reviewWorkbook.isPending || !reviewNotes.trim()}
            className="inline-flex items-center gap-2 h-9 px-4 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-500 transition-colors disabled:opacity-50"
          >
            {reviewWorkbook.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Valider la revue
          </button>
        </div>
      )}

      {/* Actions (client) */}
      {!isReadOnly && (
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => handleSave("draft")}
            disabled={submitWorkbook.isPending}
            className="inline-flex items-center gap-2 h-10 px-5 border border-border bg-white text-foreground rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            {submitWorkbook.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Enregistrer le brouillon
          </button>
          <button
            onClick={() => handleSave("submitted")}
            disabled={submitWorkbook.isPending}
            className="inline-flex items-center gap-2 h-10 px-5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {submitWorkbook.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Soumettre
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Field Renderer
// ---------------------------------------------------------------------------

function FieldRenderer({
  field,
  index,
  value,
  onChange,
  readOnly,
}: {
  field: WorkbookField;
  index: number;
  value: unknown;
  onChange: (val: unknown) => void;
  readOnly: boolean;
}) {
  const baseInputClass =
    "w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <div className="space-y-2">
      <label className="flex items-start gap-2">
        <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1">
          <span className="text-sm font-medium text-foreground">
            {field.label}
            {field.required && (
              <span className="text-red-500 ml-0.5">*</span>
            )}
          </span>
          {field.description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {field.description}
            </p>
          )}
        </div>
      </label>

      <div className="pl-8">
        {field.type === "text" && (
          <input
            type="text"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? ""}
            disabled={readOnly}
            className={baseInputClass}
          />
        )}

        {field.type === "textarea" && (
          <textarea
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? ""}
            disabled={readOnly}
            rows={4}
            className={cn(baseInputClass, "resize-none")}
          />
        )}

        {field.type === "number" && (
          <input
            type="number"
            value={value !== undefined && value !== null ? Number(value) : ""}
            onChange={(e) =>
              onChange(e.target.value ? Number(e.target.value) : null)
            }
            placeholder={field.placeholder ?? ""}
            disabled={readOnly}
            min={field.min}
            max={field.max}
            className={cn(baseInputClass, "max-w-[200px]")}
          />
        )}

        {field.type === "select" && field.options && (
          <select
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            className={cn(baseInputClass, "max-w-[400px]")}
          >
            <option value="">Selectionner...</option>
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {field.type === "rating" && (
          <RatingInput
            value={typeof value === "number" ? value : 0}
            onChange={onChange}
            max={field.max ?? 5}
            readOnly={readOnly}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rating Input
// ---------------------------------------------------------------------------

function RatingInput({
  value,
  onChange,
  max,
  readOnly,
}: {
  value: number;
  onChange: (val: number) => void;
  max: number;
  readOnly: boolean;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          onClick={() => !readOnly && onChange(star)}
          className={cn(
            "p-0.5 transition-colors disabled:cursor-default",
            !readOnly && "hover:scale-110",
          )}
        >
          <Star
            className={cn(
              "w-6 h-6 transition-colors",
              (hovered ? star <= hovered : star <= value)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30",
            )}
          />
        </button>
      ))}
      <span className="text-xs text-muted-foreground ml-2">
        {value}/{max}
      </span>
    </div>
  );
}
