"use client";

import { useState, useCallback } from "react";
import { useStudents } from "@/hooks/use-students";
import { STUDENT_TAGS } from "@/lib/constants";
import { getInitials, formatDate, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useSupabase } from "@/hooks/use-supabase";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { toast } from "sonner";
import {
  Search,
  Download,
  Plus,
  ChevronRight,
  Tag,
  X,
  Loader2,
  CheckSquare,
} from "lucide-react";
import { AddClientModal } from "@/components/crm/add-client-modal";
import { StudentSidePanel } from "@/components/crm/student-side-panel";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const prefix = useRoutePrefix();
  const supabase = useSupabase();
  const { students, isLoading, updateStudentTag } = useStudents({
    search,
    tag: activeTag,
  });

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === students.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(students.map((s) => s.id)));
    }
  }, [students, selectedIds.size]);

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkTag = async (tag: string) => {
    setBulkLoading(true);
    try {
      const ids = Array.from(selectedIds);
      for (const id of ids) {
        const student = students.find((s) => s.id === id);
        const detailId = student?.student_details?.[0]?.id;
        if (detailId) {
          await supabase
            .from("student_details")
            .update({ tag })
            .eq("id", detailId);
        }
      }
      toast.success(`Tag mis a jour pour ${ids.length} eleve(s)`);
      clearSelection();
      setBulkAction(null);
      window.location.reload();
    } catch {
      toast.error("Erreur lors de la mise a jour");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Nom", "Email", "Tag", "Score", "Revenus", "Inscription"];
    const targetStudents =
      selectedIds.size > 0
        ? students.filter((s) => selectedIds.has(s.id))
        : students;
    const rows = targetStudents.map((s) => {
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
    const csv =
      "\uFEFF" + [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clients.csv";
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
            Clients
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {students.length} client{students.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="h-9 px-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="h-9 px-4 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </motion.div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-600/5 border border-red-600/20 rounded-xl p-3 flex items-center gap-3 flex-wrap"
        >
          <span className="text-sm font-medium text-foreground flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-red-600" />
            {selectedIds.size} selectionne{selectedIds.size > 1 ? "s" : ""}
          </span>

          <div className="flex-1" />

          <div className="relative">
            <button
              onClick={() => setBulkAction(bulkAction === "tag" ? null : "tag")}
              disabled={bulkLoading}
              className="h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {bulkLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Tag className="w-3 h-3" />
              )}
              Changer le tag
            </button>
            {bulkAction === "tag" && (
              <div className="absolute top-full mt-1 right-0 bg-surface border border-border rounded-xl shadow-lg z-50 py-1 w-40">
                {STUDENT_TAGS.map((tag) => (
                  <button
                    key={tag.value}
                    onClick={() => handleBulkTag(tag.value)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                  >
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        tag.color.split(" ")[0].replace("text-", "bg-"),
                      )}
                    />
                    {tag.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={clearSelection}
            className="h-8 px-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Filters & Search */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all duration-200"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTag("all")}
            className={cn(
              "h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200",
              activeTag === "all"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground",
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
                  : "bg-muted text-muted-foreground hover:text-foreground",
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
              {search ? "Aucun resultat" : "Aucun client pour le moment"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.size === students.length &&
                        students.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-border text-red-600 focus:ring-red-600/20 cursor-pointer"
                    />
                  </th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                    Client
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
                    (t) => t.value === details?.tag,
                  );
                  const score = details?.health_score ?? 0;
                  const isSelected = selectedIds.has(student.id);
                  return (
                    <tr
                      key={student.id}
                      className={cn(
                        "border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors duration-200 group",
                        isSelected && "bg-red-600/5",
                      )}
                    >
                      <td className="px-3 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(student.id)}
                          className="w-4 h-4 rounded border-border text-red-600 focus:ring-red-600/20 cursor-pointer"
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setSelectedStudentId(student.id)}
                          className="flex items-center gap-3 text-left"
                        >
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600/10 to-red-600/5 flex items-center justify-center text-xs text-red-600 font-medium shrink-0">
                            {getInitials(student.full_name)}
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-foreground hover:text-red-600 transition-colors">
                              {student.full_name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {student.email}
                            </p>
                          </div>
                        </button>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        {tag && (
                          <span
                            className={cn(
                              "inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-medium",
                              tag.color,
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
                              className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
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
                                    : "bg-error",
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
                            ? formatDate(
                                details.last_engagement_at,
                                "relative",
                              )
                            : "-"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setSelectedStudentId(student.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AddClientModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <AnimatePresence>
        {selectedStudentId && (
          <StudentSidePanel
            studentId={selectedStudentId}
            onClose={() => setSelectedStudentId(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
