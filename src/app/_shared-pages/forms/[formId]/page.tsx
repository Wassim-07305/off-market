"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useForm, useFormSubmissions } from "@/hooks/use-forms";
import { getInitials, formatDate, cn } from "@/lib/utils";
import { copyLink } from "@/lib/clipboard";
import {
  ArrowLeft,
  Edit,
  Send,
  FileText,
  Table,
  Link2,
  ExternalLink,
  Copy,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  CheckCircle,
  User,
  Calendar,
  Hash,
} from "lucide-react";
import { ExportDropdown } from "@/components/shared/export-dropdown";
import { exportToCSV, exportTableToPDF } from "@/lib/export";
import { motion, AnimatePresence } from "framer-motion";
import type { FormField } from "@/types/database";

export default function FormResponsesPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);
  const { data: form, isLoading: formLoading } = useForm(formId);
  const { data: submissions, isLoading: subsLoading } =
    useFormSubmissions(formId);
  const prefix = useRoutePrefix();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const getPublicUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/f/${formId}`;
    }
    return `/f/${formId}`;
  };

  if (formLoading) {
    return <div className="h-64 bg-muted rounded-xl animate-pulse" />;
  }

  if (!form) {
    return (
      <p className="text-center text-muted-foreground py-16">
        Formulaire non trouve
      </p>
    );
  }

  const fields =
    form.form_fields?.sort((a, b) => a.sort_order - b.sort_order) ?? [];

  // Only question fields for display
  const questionFields = fields.filter(
    (f) => !["heading", "paragraph", "divider"].includes(f.field_type),
  );

  const exportColumns = [
    { key: "respondent", label: "Repondant" },
    { key: "date", label: "Date" },
    ...questionFields.map((f) => ({ key: f.id, label: f.label })),
  ];

  const exportRows = (submissions ?? []).map((sub) => {
    const answers = sub.answers as Record<string, unknown>;
    const row: Record<string, unknown> = {
      respondent: sub.respondent?.full_name ?? "Anonyme",
      date: new Date(sub.submitted_at).toLocaleDateString("fr-FR"),
    };
    for (const f of questionFields) {
      row[f.id] = answers[f.id] ?? "";
    }
    return row;
  });

  const handleExportCSV = () => {
    exportToCSV(exportRows, exportColumns, `${form.title} - Reponses`);
  };

  const handleExportPDF = () => {
    exportTableToPDF({
      title: `${form.title} — Reponses`,
      subtitle: `${exportRows.length} reponse(s)`,
      columns: exportColumns,
      rows: exportRows,
    });
  };

  const handleExportMarkdown = () => {
    const subs = submissions ?? [];
    let md = `# ${form.title} — Reponses\n\n`;
    md += `> ${subs.length} reponse(s) — Exporte le ${new Date().toLocaleDateString("fr-FR")}\n\n---\n\n`;

    for (let i = 0; i < subs.length; i++) {
      const sub = subs[i];
      const answers = sub.answers as Record<string, unknown>;
      const name = sub.respondent?.full_name ?? "Anonyme";
      const date = new Date(sub.submitted_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      md += `## Reponse ${i + 1} — ${name}\n\n`;
      md += `*Soumis le ${date}*\n\n`;

      for (const f of questionFields) {
        const raw = answers[f.id];
        if (raw === undefined || raw === "") continue;
        // Resolve option labels for select fields
        let displayValue = String(raw);
        if (["single_select", "dropdown"].includes(f.field_type) && f.options) {
          const opt = f.options.find((o) => o.value === raw);
          if (opt) displayValue = `**${raw}** — ${opt.label}`;
        }
        if (f.field_type === "multi_select" && f.options) {
          const vals = String(raw).split(",");
          displayValue = vals
            .map((v) => {
              const opt = f.options?.find((o) => o.value === v);
              return opt ? `- **${v}** — ${opt.label}` : `- ${v}`;
            })
            .join("\n");
        }
        md += `### ${f.label}\n\n${displayValue}\n\n`;
      }
      md += "---\n\n";
    }

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.title} - Reponses.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`${prefix}/forms`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
        <div className="flex items-center gap-2">
          {submissions && submissions.length > 0 && (
            <ExportDropdown
              options={[
                {
                  label: "Exporter CSV",
                  icon: Table,
                  onClick: handleExportCSV,
                },
                {
                  label: "Exporter PDF",
                  icon: FileText,
                  onClick: handleExportPDF,
                },
                {
                  label: "Exporter Markdown",
                  icon: FileText,
                  onClick: handleExportMarkdown,
                },
              ]}
            />
          )}
          <Link
            href={`${prefix}/forms/builder/${formId}`}
            className="h-9 px-3 rounded-[10px] border border-border text-sm flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </Link>
          <Link
            href={`${prefix}/forms/${formId}/respond`}
            className="h-9 px-3 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Remplir
          </Link>
        </div>
      </div>

      {/* Form info + share link */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-semibold text-foreground">
                {form.title}
              </h1>
              <span
                className={cn(
                  "text-xs font-medium px-2.5 py-1 rounded-full",
                  form.status === "active"
                    ? "bg-success/10 text-success"
                    : "bg-zinc-200 text-zinc-600",
                )}
              >
                {form.status === "active" ? "Actif" : "Ferme"}
              </span>
            </div>
            {form.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {form.description}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-center shrink-0">
            <div className="bg-muted/50 rounded-lg px-4 py-2">
              <p className="text-lg font-bold text-foreground">
                {submissions?.length ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Reponses
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg px-4 py-2">
              <p className="text-lg font-bold text-foreground">
                {questionFields.length}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Champs
              </p>
            </div>
          </div>
        </div>

        {/* Shareable link */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <label className="block text-xs font-medium text-muted-foreground mb-2">
            Lien de partage public
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-9 px-3 bg-muted border border-border rounded-lg flex items-center overflow-hidden">
              <Link2 className="w-3.5 h-3.5 text-muted-foreground shrink-0 mr-2" />
              <span className="text-sm text-foreground truncate">
                {getPublicUrl()}
              </span>
            </div>
            <button
              onClick={() => copyLink(getPublicUrl())}
              className="h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
              Copier
            </button>
            <Link
              href={`/f/${formId}`}
              target="_blank"
              className="h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ouvrir
            </Link>
          </div>
        </div>
      </div>

      {/* View toggle */}
      {submissions && submissions.length > 0 && (
        <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg p-1 w-fit">
          <button
            onClick={() => setViewMode("table")}
            className={cn(
              "h-8 px-3 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
              viewMode === "table"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Table className="w-3.5 h-3.5" />
            Tableau
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={cn(
              "h-8 px-3 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
              viewMode === "cards"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            Fiches
          </button>
        </div>
      )}

      {/* Responses */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {subsLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : !submissions || submissions.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p>Aucune reponse pour le moment</p>
            <Link
              href={`${prefix}/forms/${formId}/respond`}
              className="inline-flex items-center gap-1.5 text-primary text-xs mt-3 hover:underline"
            >
              <Send className="w-3 h-3" />
              Remplir le formulaire
            </Link>
          </div>
        ) : viewMode === "table" ? (
          /* Table view */
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                    Repondant
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                    Date
                  </th>
                  {questionFields.slice(0, 4).map((field) => (
                    <th
                      key={field.id}
                      className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell"
                    >
                      {field.label}
                    </th>
                  ))}
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => {
                  const answers = sub.answers as Record<string, unknown>;
                  const isExpanded = expandedId === sub.id;
                  return (
                    <>
                      <tr
                        key={sub.id}
                        className={cn(
                          "border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors",
                          isExpanded && "bg-muted/30",
                        )}
                        onClick={() =>
                          setExpandedId(isExpanded ? null : sub.id)
                        }
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-medium">
                              {sub.respondent
                                ? getInitials(sub.respondent.full_name)
                                : "?"}
                            </div>
                            <span className="text-foreground">
                              {sub.respondent?.full_name ?? "Anonyme"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {formatDate(sub.submitted_at, "relative")}
                        </td>
                        {questionFields.slice(0, 4).map((field) => (
                          <td
                            key={field.id}
                            className="px-4 py-3 text-foreground truncate max-w-[200px] hidden lg:table-cell"
                          >
                            <AnswerPreview
                              field={field}
                              value={String(answers[field.id] ?? "")}
                            />
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </td>
                      </tr>
                      {/* Expanded detail row */}
                      {isExpanded && (
                        <tr key={`${sub.id}-detail`}>
                          <td
                            colSpan={questionFields.slice(0, 4).length + 3}
                            className="px-4 py-0"
                          >
                            <SubmissionDetail
                              answers={answers}
                              fields={questionFields}
                              respondent={sub.respondent}
                              submittedAt={sub.submitted_at}
                              onClose={() => setExpandedId(null)}
                            />
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Card view */
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {submissions.map((sub) => {
              const answers = sub.answers as Record<string, unknown>;
              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-surface border border-border rounded-xl p-5 hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium">
                        {sub.respondent
                          ? getInitials(sub.respondent.full_name)
                          : "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {sub.respondent?.full_name ?? "Anonyme"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(sub.submitted_at, "relative")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {questionFields.map((field) => {
                      const answer = String(answers[field.id] ?? "");
                      if (!answer) return null;
                      return (
                        <div key={field.id}>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
                            {field.label}
                          </p>
                          <AnswerPreview field={field} value={answer} full />
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Answer Preview ─── */

function AnswerPreview({
  field,
  value,
  full = false,
}: {
  field: FormField;
  value: string;
  full?: boolean;
}) {
  if (!value || value === "-") {
    return <span className="text-muted-foreground/50">—</span>;
  }

  const type = field.field_type;

  // Rating: show stars
  if (type === "rating") {
    const n = Number(value) || 0;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={cn(
              "w-3.5 h-3.5",
              s <= n ? "fill-amber-400 text-amber-400" : "text-border",
            )}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">{n}/5</span>
      </div>
    );
  }

  // NPS: colored badge
  if (type === "nps") {
    const n = Number(value) || 0;
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold text-white",
          n <= 6 ? "bg-red-500" : n <= 8 ? "bg-amber-500" : "bg-emerald-500",
        )}
      >
        {n}
      </span>
    );
  }

  // Scale
  if (type === "scale") {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold bg-primary text-white">
        {value}
      </span>
    );
  }

  // Multi-select: show as tags
  if (type === "multi_select") {
    const selected = value.split(",").filter(Boolean);
    return (
      <div className="flex gap-1 flex-wrap">
        {selected.map((v) => {
          const opt = field.options?.find((o) => o.value === v);
          return (
            <span
              key={v}
              className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
            >
              {opt?.label ?? v}
            </span>
          );
        })}
      </div>
    );
  }

  // Single-select / dropdown: show label
  if (type === "single_select" || type === "dropdown") {
    const opt = field.options?.find((o) => o.value === value);
    return (
      <span className="text-sm text-foreground">{opt?.label ?? value}</span>
    );
  }

  // Likert
  if (type === "likert") {
    const opt = field.options?.find((o) => o.value === value);
    return (
      <span className="text-sm text-foreground">{opt?.label ?? value}</span>
    );
  }

  // Signature
  if (type === "signature") {
    return (
      <span
        className="text-sm italic text-foreground"
        style={{ fontFamily: "cursive" }}
      >
        {value}
      </span>
    );
  }

  // Matrix: parse JSON
  if (type === "matrix") {
    try {
      const parsed = JSON.parse(value) as Record<string, string>;
      const rows = field.options ?? [];
      return (
        <div className="space-y-0.5">
          {rows.map((row) => (
            <div key={row.value} className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">{row.label}:</span>
              <span className="font-medium text-foreground">
                {parsed[row.value] ?? "—"}
              </span>
            </div>
          ))}
        </div>
      );
    } catch {
      return <span className="text-sm text-foreground">{value}</span>;
    }
  }

  // File upload: show checkmark
  if (type === "file_upload") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
        <CheckCircle className="w-3 h-3" />
        {value}
      </span>
    );
  }

  // Default: text with truncation
  return (
    <span
      className={cn(
        "text-sm text-foreground",
        !full && "truncate block max-w-[200px]",
      )}
    >
      {value}
    </span>
  );
}

/* ─── Submission Detail ─── */

function SubmissionDetail({
  answers,
  fields,
  respondent,
  submittedAt,
  onClose,
}: {
  answers: Record<string, unknown>;
  fields: FormField[];
  respondent: { full_name: string } | null;
  submittedAt: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="border-b border-border pb-4 mb-0"
    >
      <div className="bg-muted/30 rounded-xl p-5 my-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium">
              {respondent ? getInitials(respondent.full_name) : "?"}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {respondent?.full_name ?? "Anonyme"}
              </p>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(submittedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {fields.filter((f) => answers[f.id]).length} reponses
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Answers grid */}
        <div className="space-y-4">
          {fields.map((field, i) => {
            const answer = String(answers[field.id] ?? "");
            return (
              <div
                key={field.id}
                className="bg-surface rounded-lg p-3 border border-border/50"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono text-muted-foreground/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-xs font-medium text-muted-foreground">
                    {field.label}
                    {field.is_required && (
                      <span className="text-primary ml-0.5">*</span>
                    )}
                  </p>
                </div>
                {answer ? (
                  <div className="ml-6">
                    <AnswerPreview field={field} value={answer} full />
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/40 ml-6 italic">
                    Non renseigne
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
