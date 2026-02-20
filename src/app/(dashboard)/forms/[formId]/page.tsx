"use client";

import { use } from "react";
import Link from "next/link";
import { useForm, useFormSubmissions } from "@/hooks/use-forms";
import { getInitials, formatDate, cn } from "@/lib/utils";
import { ArrowLeft, Edit, Download, Send } from "lucide-react";

export default function FormResponsesPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);
  const { data: form, isLoading: formLoading } = useForm(formId);
  const { data: submissions, isLoading: subsLoading } = useFormSubmissions(formId);

  if (formLoading) {
    return <div className="h-64 bg-muted rounded-xl animate-pulse" />;
  }

  if (!form) {
    return <p className="text-center text-muted-foreground py-16">Formulaire non trouve</p>;
  }

  const fields = form.form_fields?.sort((a, b) => a.sort_order - b.sort_order) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/forms"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/forms/builder/${formId}`}
            className="h-9 px-3 rounded-[10px] border border-border text-sm flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </Link>
          <Link
            href={`/forms/${formId}/respond`}
            className="h-9 px-3 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Remplir
          </Link>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <h1 className="text-xl font-semibold text-foreground">{form.title}</h1>
        {form.description && (
          <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
        )}
        <p className="text-xs text-muted-foreground mt-3">
          {submissions?.length ?? 0} reponse{(submissions?.length ?? 0) !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Responses table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {subsLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : !submissions || submissions.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Aucune reponse pour le moment
          </div>
        ) : (
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
                  {fields.slice(0, 3).map((field) => (
                    <th
                      key={field.id}
                      className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell"
                    >
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => {
                  const answers = sub.answers as Record<string, unknown>;
                  return (
                    <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-muted/50">
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
                      {fields.slice(0, 3).map((field) => (
                        <td
                          key={field.id}
                          className="px-4 py-3 text-foreground truncate max-w-[200px] hidden lg:table-cell"
                        >
                          {String(answers[field.id] ?? "-")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
