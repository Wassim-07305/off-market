"use client";

import { useState } from "react";
import Link from "next/link";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useForms } from "@/hooks/use-forms";
import { useAuth } from "@/hooks/use-auth";
import { cn, formatDate } from "@/lib/utils";
import { copyLink } from "@/lib/clipboard";
import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import {
  FileText,
  Plus,
  BarChart2,
  Calendar,
  Link2,
  ExternalLink,
} from "lucide-react";

export default function FormsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: forms, isLoading } = useForms(statusFilter);
  const { isStaff } = useAuth();
  const prefix = useRoutePrefix();

  const filters = [
    { value: "all", label: "Tous" },
    { value: "active", label: "Actifs" },
    { value: "draft", label: "Brouillons" },
    { value: "closed", label: "Fermes" },
  ];

  const getPublicUrl = (formId: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/f/${formId}`;
    }
    return `/f/${formId}`;
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Formulaires
          </h1>
          <p className="text-sm text-muted-foreground/80 mt-1.5 leading-relaxed">
            {forms?.length ?? 0} formulaire
            {(forms?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        {isStaff && (
          <Link
            href={`${prefix}/forms/new`}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#AF0000] to-[#DC2626] text-white text-sm font-semibold hover:from-[#8B0000] hover:to-[#B91C1C] transition-all active:scale-[0.98] shadow-sm shadow-red-500/20 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau formulaire
          </Link>
        )}
      </motion.div>

      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="flex items-center gap-0.5 border-b border-border"
      >
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              "h-9 px-3.5 text-xs font-medium transition-all relative",
              statusFilter === f.value
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
            {statusFilter === f.value && (
              <span className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full bg-gradient-to-r from-[#AF0000] to-[#DC2626]" />
            )}
          </button>
        ))}
      </motion.div>

      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-xl p-5 animate-pulse space-y-3"
            >
              <div className="h-4 w-2/3 bg-muted rounded" />
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </div>
          ))
        ) : !forms || forms.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucun formulaire</p>
          </div>
        ) : (
          forms.map((form) => {
            const responseCount = form.form_submissions?.[0]?.count ?? 0;
            const statusConfig = {
              active: {
                label: "Actif",
                className:
                  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20",
                dotColor: "bg-emerald-500",
              },
              draft: {
                label: "Brouillon",
                className: "bg-muted text-muted-foreground ring-1 ring-border",
                dotColor: "bg-zinc-400",
              },
              closed: {
                label: "Ferme",
                className:
                  "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 ring-1 ring-zinc-200 dark:ring-zinc-700",
                dotColor: "bg-zinc-400",
              },
              archived: {
                label: "Archive",
                className:
                  "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 ring-1 ring-zinc-200 dark:ring-zinc-700",
                dotColor: "bg-zinc-300",
              },
            };
            const sc =
              statusConfig[form.status as keyof typeof statusConfig] ??
              statusConfig.draft;
            return (
              <div
                key={form.id}
                className="bg-surface border border-border rounded-xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group relative overflow-hidden"
              >
                <Link href={`${prefix}/forms/${form.id}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#AF0000]/10 to-[#DC2626]/5 flex items-center justify-center ring-1 ring-[#AF0000]/10">
                      <FileText className="w-5 h-5 text-[#AF0000]" />
                    </div>
                    <span
                      className={cn(
                        "text-[11px] font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1.5",
                        sc.className,
                      )}
                    >
                      <span
                        className={cn("w-1.5 h-1.5 rounded-full", sc.dotColor)}
                      />
                      {sc.label}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-[#AF0000] transition-colors tracking-tight">
                    {form.title}
                  </h3>
                  {form.description && (
                    <p className="text-xs text-muted-foreground/80 mt-1.5 line-clamp-2 leading-relaxed">
                      {form.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-3.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md">
                      <BarChart2 className="w-3.5 h-3.5" />
                      {responseCount} reponse{responseCount !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(form.created_at)}
                    </span>
                  </div>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-1.5 mt-3.5 pt-3.5 border-t border-border/50">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      copyLink(getPublicUrl(form.id));
                    }}
                    className="h-7 px-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-1.5"
                  >
                    <Link2 className="w-3 h-3" />
                    Copier le lien
                  </button>
                  <Link
                    href={`/f/${form.id}`}
                    target="_blank"
                    className="h-7 px-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Ouvrir
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
}
