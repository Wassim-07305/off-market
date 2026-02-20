"use client";

import { use } from "react";
import Link from "next/link";
import { useForm } from "@/hooks/use-forms";
import { ArrowLeft } from "lucide-react";

export default function EditFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);
  const { data: form, isLoading } = useForm(formId);

  if (isLoading) {
    return <div className="h-64 bg-muted rounded-xl animate-pulse" />;
  }

  if (!form) {
    return <p className="text-center text-muted-foreground py-16">Formulaire non trouve</p>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href={`/forms/${formId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>

      <div className="bg-surface border border-border rounded-xl p-6">
        <h1
          className="text-2xl font-semibold text-foreground font-bold"
        >
          Modifier : {form.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          L&apos;editeur de formulaire complet est en cours de developpement.
        </p>
      </div>
    </div>
  );
}
