"use client";

import { useState } from "react";
import { useStudents } from "@/hooks/use-students";
import { STUDENT_TAGS } from "@/lib/constants";
import { getInitials, formatDate, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  Search,
  Download,
  Plus,
  ChevronRight,
  Kanban,
  List,
} from "lucide-react";
import { AddClientModal } from "@/components/crm/add-client-modal";
import { PipelineKanban } from "@/components/crm/pipeline-kanban";

type CrmView = "clients" | "pipeline";

export default function CRMPage() {
  const [view, setView] = useState<CrmView>("clients");
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const prefix = useRoutePrefix();
  const { students, isLoading } = useStudents({ search, tag: activeTag });

  const handleExportCSV = () => {
    const headers = ["Nom", "Email", "Tag", "Score", "Revenus", "Inscription"];
    const rows = students.map((s) => {
      const d = s.student_details?.[0];
      return [
        s.full_name,
        s.email,
        d?.tag ?? "",
        String(d?.health_score ?? 0),
        String(d?.revenue ?? 0),
        d?.enrollment_date ?? "",
      ];
    });
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eleves.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            CRM
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {view === "clients"
              ? `${students.length} eleve${students.length !== 1 ? "s" : ""}`
              : "Pipeline commercial"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-xs)" }}>
            <button
              onClick={() => setView("clients")}
              className={cn(
                "h-9 px-3 flex items-center gap-1.5 text-xs font-medium transition-all",
                view === "clients"
                  ? "bg-foreground text-background"
                  : "bg-surface text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="w-3.5 h-3.5" />
              Clients
            </button>
            <button
              onClick={() => setView("pipeline")}
              className={cn(
                "h-9 px-3 flex items-center gap-1.5 text-xs font-medium transition-all",
                view === "pipeline"
                  ? "bg-foreground text-background"
                  : "bg-surface text-muted-foreground hover:text-foreground"
              )}
            >
              <Kanban className="w-3.5 h-3.5" />
              Pipeline
            </button>
          </div>

          {view === "clients" && (
            <>
              <button
                onClick={handleExportCSV}
                className="h-9 px-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Pipeline view */}
      {view === "pipeline" ? (
        <motion.div variants={staggerItem}>
          <PipelineKanban />
        </motion.div>
      ) : (
        <>
          {/* Filters & Search */}
          <motion.div
            variants={staggerItem}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un eleve..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTag("all")}
                className={cn(
                  "h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200",
                  activeTag === "all"
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                Tous
              </button>
              {STUDENT_TAGS.map((tag) => (
                <button
                  key={tag.value}
                  onClick={() => setActiveTag(tag.value)}
                  className={cn(
                    "h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200",
                    activeTag === tag.value
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Table */}
          <motion.div
            variants={staggerItem}
            className="bg-surface rounded-2xl overflow-hidden"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full animate-shimmer" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 animate-shimmer rounded-lg" />
                      <div className="h-2.5 w-48 animate-shimmer rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm text-muted-foreground">
                  {search ? "Aucun resultat" : "Aucun eleve pour le moment"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                        Eleve
                      </th>
                      <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                        Tag
                      </th>
                      <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-5 py-3 hidden lg:table-cell">
                        Progression
                      </th>
                      <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                        Revenus
                      </th>
                      <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-5 py-3 hidden lg:table-cell">
                        Score
                      </th>
                      <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-5 py-3 hidden lg:table-cell">
                        Activite
                      </th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const details = student.student_details?.[0];
                      const tag = STUDENT_TAGS.find(
                        (t) => t.value === details?.tag
                      );
                      const score = details?.health_score ?? 0;
                      return (
                        <tr
                          key={student.id}
                          className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors duration-200 group"
                        >
                          <td className="px-5 py-3.5">
                            <Link
                              href={`${prefix}/crm/${student.id}`}
                              className="flex items-center gap-3"
                            >
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-xs text-primary font-medium shrink-0">
                                {getInitials(student.full_name)}
                              </div>
                              <div>
                                <p className="text-[13px] font-medium text-foreground">
                                  {student.full_name}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {student.email}
                                </p>
                              </div>
                            </Link>
                          </td>
                          <td className="px-5 py-3.5 hidden md:table-cell">
                            {tag && (
                              <span
                                className={cn(
                                  "inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-medium",
                                  tag.color
                                )}
                              >
                                {tag.label}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 hidden lg:table-cell">
                            <div className="flex items-center gap-2 w-28">
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-500"
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                              <span className="text-[11px] text-muted-foreground font-mono tabular-nums w-8 text-right">
                                {score}%
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 hidden md:table-cell">
                            <span className="text-[13px] text-foreground font-mono tabular-nums">
                              {formatCurrency(Number(details?.revenue ?? 0))}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5">
                                <div
                                  className={cn(
                                    "w-2 h-2 rounded-full",
                                    score >= 70
                                      ? "bg-success"
                                      : score >= 40
                                        ? "bg-warning"
                                        : "bg-error"
                                  )}
                                />
                                <span className="text-[13px] text-foreground font-mono tabular-nums">
                                  {score}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 hidden lg:table-cell">
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {details?.last_engagement_at
                                ? formatDate(details.last_engagement_at, "relative")
                                : "-"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <Link
                              href={`${prefix}/crm/${student.id}`}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 opacity-0 group-hover:opacity-100"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </>
      )}

      <AddClientModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </motion.div>
  );
}
