"use client";

import { useState, useCallback } from "react";
import { useStudents, getStudentDetail } from "@/hooks/use-students";
import {
  STUDENT_TAGS,
  STUDENT_FLAGS,
  STUDENT_PIPELINE_STAGES,
} from "@/lib/constants";
import { getInitials, formatDate, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useSupabase } from "@/hooks/use-supabase";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
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
import { PageTransition } from "@/components/ui/page-transition";
import { HeroMetric } from "@/components/dashboard/hero-metric";
import dynamic from "next/dynamic";
const StudentSidePanel = dynamic(
  () =>
    import("@/components/crm/student-side-panel").then((m) => ({
      default: m.StudentSidePanel,
    })),
  { ssr: false },
);
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
  const [page, setPage] = useState(0);
  const [flagFilter, setFlagFilter] = useState("all");
  const PAGE_SIZE = 10;
  const prefix = useRoutePrefix();

  const handleApplySegment = useCallback((filters: SegmentFilters) => {
    setSearch(filters.search ?? "");
    setActiveTag(filters.tag ?? "all");
    setPage(0);
  }, []);

  const hasActiveFilters = search !== "" || activeTag !== "all" || flagFilter !== "all";
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const { students, totalCount, isLoading, updateStudentTag } = useStudents({
    search,
    tag: activeTag,
    flag: flagFilter !== "all" ? flagFilter : undefined,
    limit: PAGE_SIZE,
    page,
  });
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Fetch coach assignments + coach list (admin only)
  const { data: assignmentMap } = useQuery({
    queryKey: ["client-coach-map"],
    enabled: isAdmin,
    staleTime: 60_000,
    queryFn: async () => {
      const { data: assignments } = await supabase
        .from("coach_assignments")
        .select("client_id, coach_id")
        .eq("status", "active");
      const map = new Map<string, string>();
      for (const a of (assignments ?? []) as { client_id: string; coach_id: string }[]) {
        map.set(a.client_id, a.coach_id);
      }
      return map;
    },
  });

  const { data: coachesList } = useQuery({
    queryKey: ["coaches-list"],
    enabled: isAdmin,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("role", ["coach", "admin"])
        .order("full_name");
      return (data ?? []) as { id: string; full_name: string }[];
    },
  });

  const getCoachName = (clientId: string) => {
    const coachId = assignmentMap?.get(clientId);
    if (!coachId) return null;
    return coachesList?.find((c) => c.id === coachId)?.full_name ?? null;
  };

  const handleAssignCoach = async (clientId: string, coachId: string | null) => {
    if (coachId) {
      // Delete old then insert new (avoids UNIQUE constraint issues)
      await supabase
        .from("coach_assignments")
        .delete()
        .eq("client_id", clientId);

      await supabase.from("coach_assignments").insert({
        client_id: clientId,
        coach_id: coachId,
        status: "active",
      });
    } else {
      // Unassign: just delete
      await supabase
        .from("coach_assignments")
        .delete()
        .eq("client_id", clientId);
    }

    queryClient.invalidateQueries({ queryKey: ["client-coach-map"] });
    queryClient.invalidateQueries({ queryKey: ["csm-coaches-stats"] });
    queryClient.invalidateQueries({ queryKey: ["students"] });
  };

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
      setSelectedIds(new Set(displayedStudents.map((s) => s.id)));
    }
  }, [students, selectedIds.size]);

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkTag = async (tag: string) => {
    setBulkLoading(true);
    try {
      const ids = Array.from(selectedIds);
      for (const id of ids) {
        const student = students.find((s) => s.id === id);
        const detailId = student ? getStudentDetail(student)?.id : undefined;
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
      const d = getStudentDetail(s);
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

  const activeCount = totalCount;

  // Flag filter is now server-side — displayedStudents = students
  const displayedStudents = students;

  return (
    <PageTransition>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Hero Metric */}
        <motion.div variants={staggerItem}>
          <HeroMetric
            label="Clients actifs"
            value={isLoading ? "..." : String(activeCount)}
          />
        </motion.div>

        {/* Header */}
        <motion.div
          variants={staggerItem}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-[family-name:var(--font-heading)] font-bold text-foreground tracking-tight">
              Clients
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalCount} client{totalCount !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="h-8 px-3 rounded-lg border border-border text-[13px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-200 flex items-center gap-1.5"
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
            {[
              { value: "all", label: "Tous", dot: "" },
              { value: "green", label: "En bonne voie", dot: "bg-emerald-500" },
              { value: "yellow", label: "Attention", dot: "bg-amber-500" },
              { value: "orange", label: "A risque", dot: "bg-orange-500" },
              { value: "red", label: "Critique", dot: "bg-red-500" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => { setFlagFilter(f.value); setPage(0); }}
                className={cn(
                  "h-7 px-2.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5",
                  flagFilter === f.value
                    ? "bg-primary text-white"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {f.dot && <span className={cn("w-2 h-2 rounded-full", f.dot)} />}
                {f.label}
              </button>
            ))}
            <div className="w-px h-5 bg-border mx-1" />
            <SavedSegments
              currentFilters={{
                tag: activeTag !== "all" ? activeTag : undefined,
                search: search || undefined,
              }}
              onApplySegment={handleApplySegment}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          variants={staggerItem}
          className="bg-surface border border-border rounded-lg overflow-hidden"
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
                <thead className="sticky top-0 z-10 bg-surface">
                  <tr className="border-b border-border">
                    <th className="w-10 px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.size === students.length &&
                          students.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                      />
                    </th>
                    <th className="text-left text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider px-4 py-2.5">
                      Client
                    </th>
                    <th className="text-left text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider px-4 py-2.5">
                      Drapeau
                    </th>
                    {isAdmin && (
                      <th className="text-left text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider px-4 py-2.5 hidden md:table-cell">
                        Coach
                      </th>
                    )}
                    <th className="text-left text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider px-4 py-2.5 hidden md:table-cell">
                      Etape
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
                  {displayedStudents.map((student) => {
                    const details = getStudentDetail(student);
                    const tag = STUDENT_TAGS.find(
                      (t) => t.value === details?.tag,
                    );
                    const score = details?.health_score ?? 0;
                    const isSelected = selectedIds.has(student.id);
                    return (
                      <tr
                        key={student.id}
                        onClick={() => setSelectedStudentId(student.id)}
                        className={cn(
                          "border-b border-border/50 last:border-0 hover:bg-surface-hover transition-colors duration-100 group cursor-pointer",
                          isSelected && "bg-primary/[0.03]",
                          selectedStudentId === student.id && "bg-primary/10",
                        )}
                      >
                        <td
                          className="px-3 py-2.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(student.id)}
                            className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <button
                            onClick={() => setSelectedStudentId(student.id)}
                            className="flex items-center gap-2.5 text-left"
                          >
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[11px] text-muted-foreground font-medium shrink-0">
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
                        <td className="px-4 py-2.5">
                          {(() => {
                            const f = details?.flag ?? "green";
                            const flagConfig = STUDENT_FLAGS.find(
                              (fl) => fl.value === f,
                            );
                            return flagConfig ? (
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 h-5 px-2 rounded-sm text-[10px] font-medium border",
                                  flagConfig.bgColor,
                                  flagConfig.textColor,
                                  flagConfig.borderColor,
                                )}
                              >
                                <span
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    flagConfig.dotColor,
                                  )}
                                />
                                {flagConfig.label}
                              </span>
                            ) : null;
                          })()}
                        </td>
                        {isAdmin && (
                          <td
                            className="px-4 py-2.5 hidden md:table-cell"
                            
                          >
                            {(() => {
                              const coachName = getCoachName(student.id);
                              return coachName ? (
                                <span className="text-[11px] text-foreground font-medium">
                                  {coachName}
                                </span>
                              ) : (
                                <span className="text-[10px] text-amber-500 font-medium">
                                  Non assigne
                                </span>
                              );
                            })()}
                          </td>
                        )}
                        <td className="px-4 py-2.5 hidden md:table-cell">
                          {details?.pipeline_stage && (
                            <span className="text-[11px] text-muted-foreground capitalize">
                              {STUDENT_PIPELINE_STAGES.find(
                                (s) => s.value === details.pipeline_stage,
                              )?.label ?? details.pipeline_stage}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 hidden lg:table-cell">
                          <div className="flex items-center gap-2 w-24">
                            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
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
                              ? formatDate(
                                  details.last_engagement_at,
                                  "relative",
                                )
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 px-1">
              <p className="text-xs text-muted-foreground">
                Page {page + 1} sur {totalPages} ({totalCount} clients)
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  Precedent
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                  const p = start + i;
                  if (p >= totalPages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                        p === page
                          ? "bg-primary text-white"
                          : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {p + 1}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  Suivant
                </button>
              </div>
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
              assignedCoachId={isAdmin ? assignmentMap?.get(selectedStudentId) ?? null : undefined}
              coaches={isAdmin ? coachesList ?? [] : undefined}
              onAssignCoach={isAdmin ? handleAssignCoach : undefined}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </PageTransition>
  );
}
