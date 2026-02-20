"use client";

import { useState } from "react";
import Link from "next/link";
import { useForms } from "@/hooks/use-forms";
import { useAuth } from "@/hooks/use-auth";
import { cn, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, defaultTransition } from "@/lib/animations";
import {
  FileText,
  Plus,
  BarChart2,
  Users,
  Calendar,
  ChevronRight,
} from "lucide-react";

export default function FormsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: forms, isLoading } = useForms(statusFilter);
  const { isAdmin } = useAuth();

  const filters = [
    { value: "all", label: "Tous" },
    { value: "active", label: "Actifs" },
    { value: "draft", label: "Brouillons" },
    { value: "closed", label: "Fermes" },
  ];

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
          <h1
            className="text-3xl font-semibold text-foreground font-bold"
          >
            Formulaires
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {forms?.length ?? 0} formulaire{(forms?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/forms/builder"
            className="h-9 px-4 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau formulaire
          </Link>
        )}
      </motion.div>

      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="flex items-center gap-1.5"
      >
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              "h-8 px-3 rounded-full text-xs font-medium transition-colors",
              statusFilter === f.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
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
            <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse space-y-3">
              <div className="h-4 w-2/3 bg-muted rounded" />
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </div>
          ))
        ) : !forms || forms.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucun formulaire
            </p>
          </div>
        ) : (
          forms.map((form) => {
            const responseCount = form.form_submissions?.[0]?.count ?? 0;
            return (
              <Link
                key={form.id}
                href={`/forms/${form.id}`}
                className="bg-surface border border-border rounded-xl p-5 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium px-2.5 py-1 rounded-full",
                      form.status === "active"
                        ? "bg-success/10 text-success"
                        : form.status === "draft"
                          ? "bg-muted text-muted-foreground"
                          : "bg-zinc-200 text-zinc-600"
                    )}
                  >
                    {form.status === "active"
                      ? "Actif"
                      : form.status === "draft"
                        ? "Brouillon"
                        : form.status === "closed"
                          ? "Ferme"
                          : "Archive"}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {form.title}
                </h3>
                {form.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {form.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BarChart2 className="w-3.5 h-3.5" />
                    {responseCount} reponse{responseCount !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(form.created_at)}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
}
