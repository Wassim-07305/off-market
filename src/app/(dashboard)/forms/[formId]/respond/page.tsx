"use client";

import { use, useState } from "react";
import { useForm as useFormData } from "@/hooks/use-forms";
import { useFormMutations } from "@/hooks/use-forms";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Check, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
  const [submitted, setSubmitted] = useState(false);

  if (isLoading) {
    return <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 bg-muted rounded-xl" />
      ))}
    </div>;
  }

  if (!form) {
    return <p className="text-center text-muted-foreground py-16">Formulaire non trouve</p>;
  }

  const fields = form.form_fields?.sort((a, b) => a.sort_order - b.sort_order) ?? [];

  const handleSubmit = async () => {
    const required = fields.filter((f) => f.is_required);
    const missing = required.find((f) => !answers[f.id]?.trim());
    if (missing) {
      toast.error(`Le champ "${missing.label}" est requis`);
      return;
    }

    await submitForm.mutateAsync({
      formId,
      respondentId: user?.id,
      answers,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-success" />
        </div>
        <h1
          className="text-2xl font-semibold text-foreground mb-2"
          style={{ fontFamily: "Instrument Serif, serif" }}
        >
          Merci !
        </h1>
        <p className="text-muted-foreground">
          {form.thank_you_message || "Ta reponse a ete enregistree."}
        </p>
        <Link
          href="/forms"
          className="inline-flex items-center gap-1.5 text-sm text-primary mt-6 hover:text-primary-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux formulaires
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href={`/forms/${formId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>

      <div className="bg-surface border border-border rounded-xl p-8">
        <h1
          className="text-2xl font-semibold text-foreground mb-2"
          style={{ fontFamily: "Instrument Serif, serif" }}
        >
          {form.title}
        </h1>
        {form.description && (
          <p className="text-sm text-muted-foreground">{form.description}</p>
        )}
      </div>

      <div className="space-y-4">
        {fields.map((field) => {
          if (field.field_type === "heading") {
            return (
              <h2 key={field.id} className="text-lg font-semibold text-foreground pt-4">
                {field.label}
              </h2>
            );
          }
          if (field.field_type === "paragraph") {
            return (
              <p key={field.id} className="text-sm text-muted-foreground">
                {field.label}
              </p>
            );
          }
          if (field.field_type === "divider") {
            return <hr key={field.id} className="border-border" />;
          }

          return (
            <div key={field.id} className="bg-surface border border-border rounded-xl p-5">
              <label className="block text-sm font-medium text-foreground mb-2">
                {field.label}
                {field.is_required && <span className="text-primary ml-1">*</span>}
              </label>
              {field.description && (
                <p className="text-xs text-muted-foreground mb-3">{field.description}</p>
              )}

              {(field.field_type === "short_text" ||
                field.field_type === "email" ||
                field.field_type === "phone" ||
                field.field_type === "number") && (
                <input
                  type={
                    field.field_type === "email"
                      ? "email"
                      : field.field_type === "number"
                        ? "number"
                        : "text"
                  }
                  value={answers[field.id] ?? ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [field.id]: e.target.value })
                  }
                  placeholder={field.placeholder ?? ""}
                  className="w-full h-11 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              )}

              {field.field_type === "long_text" && (
                <textarea
                  value={answers[field.id] ?? ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [field.id]: e.target.value })
                  }
                  placeholder={field.placeholder ?? ""}
                  rows={4}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              )}

              {(field.field_type === "single_select" ||
                field.field_type === "dropdown") && (
                <select
                  value={answers[field.id] ?? ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [field.id]: e.target.value })
                  }
                  className="w-full h-11 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Selectionner...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {field.field_type === "rating" && (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() =>
                        setAnswers({ ...answers, [field.id]: String(n) })
                      }
                      className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
                        answers[field.id] === String(n)
                          ? "bg-primary text-white border-primary"
                          : "border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}

              {field.field_type === "nps" && (
                <div className="flex gap-1.5 flex-wrap">
                  {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() =>
                        setAnswers({ ...answers, [field.id]: String(n) })
                      }
                      className={`w-9 h-9 rounded-lg border text-xs font-medium transition-colors ${
                        answers[field.id] === String(n)
                          ? "bg-primary text-white border-primary"
                          : "border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}

              {field.field_type === "date" && (
                <input
                  type="date"
                  value={answers[field.id] ?? ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [field.id]: e.target.value })
                  }
                  className="w-full h-11 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              )}

              {field.field_type === "time" && (
                <input
                  type="time"
                  value={answers[field.id] ?? ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [field.id]: e.target.value })
                  }
                  className="w-full h-11 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitForm.isPending}
        className="w-full h-12 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {submitForm.isPending ? "Envoi..." : "Envoyer"}
      </button>
    </div>
  );
}
