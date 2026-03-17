"use client";

import { useState, useCallback } from "react";
import { useStudents } from "@/hooks/use-students";
import { STUDENT_TAGS } from "@/lib/constants";
import { getInitials, formatDate, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useSupabase } from "@/hooks/use-supabase";
import { useQueryClient } from "@tanstack/react-query";
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
import { SavedSegments } from "@/components/crm/saved-segments";
import type { SegmentFilters } from "@/components/crm/saved-segments";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const prefix = useRoutePrefix();

  const handleApplySegment = useCallback((filters: SegmentFilters) => {
    setSearch(filters.search ?? "");
    setActiveTag(filters.tag ?? "all");
  }, []);

  const hasActiveFilters = search !== "" || activeTag !== "all";
  const supabase = useSupabase();
  const queryClient = useQueryClient();
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
      queryClient.invalidateQueries({
        queryKey: ["students"],
        refetchType: "all",
      });
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
            className="h-8 px-3 rounded-lg border border-border text-[13px] text-muted-foreground hover:text-foreground hover:border-zinc-300 transition-all duration-200 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="h-8 px-3.5 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-all duration-200 active:scale-[0.98] flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter
          </button>
        </div>
      </motion.div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/10 rounded-lg p-2.5 flex items-center gap-2.5 flex-wrap"
        >
          <span className="text-[13px] font-medium text-foreground flex items-center gap-1.5 pl-1">
            <CheckSquare className="w-3.5 h-3.5 text-primary" />
            {selectedIds.size} selectionne{selectedIds.size > 1 ? "s" : ""}
          </span>

          <div className="flex-1" />

          <div className="relative">
            <button
              onClick={() => setBulkAction(bulkAction === "tag" ? null : "tag")}
              disabled={bulkLoading}
              className="h-7 px-2.5 rounded-md border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-zinc-300 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              {bulkLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Tag className="w-3 h-3" />
              )}
              Changer le tag
            </button>
            {bulkAction === "tag" && (
              <div className="absolute top-full mt-1 right-0 bg-surface border border-border rounded-lg shadow-sm z-50 py-0.5 w-36">
                {STUDENT_TAGS.map((tag) => (
                  <button
                    key={tag.value}
                    onClick={() => handleBulkTag(tag.value)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[13px] hover:bg-muted/50 transition-colors text-left"
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
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
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* Filters & Search */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 bg-muted/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60 border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          <SavedSegments
            currentFilters={{
              tag: activeTag !== "all" ? activeTag : undefined,
              search: search || undefined,
            }}
            onApplySegment={handleApplySegment}
            hasActiveFilters={hasActiveFilters}
          />
          <div className="w-px h-4 bg-border/40 mx-1" />
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setActiveTag("all")}
              className={cn(
                "h-7 px-2.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all duration-200",
                activeTag === "all"
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Tous
            </button>
            {STUDENT_TAGS.map((tag) => (
              <button
                key={tag.value}
                onClick={() => setActiveTag(tag.value)}
                className={cn(
                  "h-7 px-2.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all duration-200",
                  activeTag === tag.value
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        variants={staggerItem}
        className="bg-surface border border-border rounded-xl overflow-hidden"
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
                <tr className="border-b border-border">
                  <th className="w-10 px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.size === students.length &&
                        students.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 rounded border-zinc-300 text-primary focus:ring-primary/20 cursor-pointer"
                    />
                  </th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider px-4 py-2.5">
                    Client
                  </th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider px-4 py-2.5 hidden md:table-cell">
                    Tag
                  </th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider px-4 py-2.5 hidden lg:table-cell">
                    Progression
                  </th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider px-4 py-2.5 hidden md:table-cell">
                    Revenus
                  </th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider px-4 py-2.5 hidden lg:table-cell">
                    Score
                  </th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider px-4 py-2.5 hidden lg:table-cell">
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
                        "border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors duration-150 group",
                        isSelected && "bg-primary/[0.03]",
                      )}
                    >
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(student.id)}
                          className="w-3.5 h-3.5 rounded border-zinc-300 text-primary focus:ring-primary/20 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => setSelectedStudentId(student.id)}
                          className="flex items-center gap-2.5 text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[11px] text-zinc-600 font-medium shrink-0">
                            {getInitials(student.full_name)}
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-foreground hover:text-primary transition-colors">
                              {student.full_name}
                            </p>
                            <p className="text-[11px] text-muted-foreground/70">
                              {student.email}
                            </p>
                          </div>
                        </button>
                      </td>
                      <td className="px-4 py-2.5 hidden md:table-cell">
                        {tag && (
                          <span
                            className={cn(
                              "inline-flex items-center h-5 px-2 rounded-md text-[10px] font-medium",
                              tag.color,
                            )}
                          >
                            {tag.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 hidden lg:table-cell">
                        <div className="flex items-center gap-2 w-24">
                          <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-muted-foreground font-mono tabular-nums w-7 text-right">
                            {score}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 hidden md:table-cell">
                        <span className="text-[13px] text-foreground font-mono tabular-nums">
                          {formatCurrency(Number(details?.revenue ?? 0))}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              score >= 70
                                ? "bg-emerald-500"
                                : score >= 40
                                  ? "bg-amber-500"
                                  : "bg-red-500",
                            )}
                          />
                          <span className="text-[13px] text-foreground font-mono tabular-nums">
                            {score}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 hidden lg:table-cell">
                        <span className="text-[11px] text-muted-foreground/70 font-mono">
                          {details?.last_engagement_at
                            ? formatDate(details.last_engagement_at, "relative")
                            : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => setSelectedStudentId(student.id)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-150 opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
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
