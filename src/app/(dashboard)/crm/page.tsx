"use client";

import { useState } from "react";
import { useStudents } from "@/hooks/use-students";
import { STUDENT_TAGS } from "@/lib/constants";
import { getInitials, formatDate, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, defaultTransition } from "@/lib/animations";
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";

export default function CRMPage() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("all");
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
        variants={fadeInUp}
        transition={defaultTransition}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1
            className="text-3xl font-semibold text-foreground"
            style={{ fontFamily: "Instrument Serif, serif" }}
          >
            CRM
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {students.length} eleve{students.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="h-9 px-3 rounded-[10px] border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="h-9 px-4 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un eleve..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-surface border border-border rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTag("all")}
            className={cn(
              "h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
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
                "h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
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
        variants={fadeInUp}
        transition={defaultTransition}
        className="bg-surface border border-border rounded-xl overflow-hidden"
      >
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-muted rounded" />
                  <div className="h-2.5 w-48 bg-muted rounded" />
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
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Eleve
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                    Tag
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">
                    Progression
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                    Revenus
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">
                    Score
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">
                    Derniere activite
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
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/crm/${student.id}`}
                          className="flex items-center gap-3"
                        >
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium shrink-0">
                            {getInitials(student.full_name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {student.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {student.email}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {tag && (
                          <span
                            className={cn(
                              "inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium border",
                              tag.color
                            )}
                          >
                            {tag.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-2 w-28">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground font-mono w-8 text-right">
                            {score}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-foreground">
                          {formatCurrency(Number(details?.revenue ?? 0))}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
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
                          <span className="text-sm text-foreground font-mono">
                            {score}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {details?.last_engagement_at
                            ? formatDate(details.last_engagement_at, "relative")
                            : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/crm/${student.id}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
    </motion.div>
  );
}
