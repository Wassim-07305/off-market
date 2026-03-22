"use client";

import { useState, useMemo } from "react";
import { useStudents, getStudentDetail } from "@/hooks/use-students";
import { getInitials, formatDate, cn } from "@/lib/utils";
import {
  Search,
  MessageSquare,
  Phone,
  ChevronDown,
  ArrowUpDown,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Tag = "at_risk" | "new" | "standard" | "vip" | "churned";
type SortField = "health_score" | "last_engagement_at";

const TAG_CONFIG: Record<
  Tag,
  { label: string; color: string; dotColor: string }
> = {
  at_risk: {
    label: "A risque",
    color: "bg-red-500/10 text-red-600",
    dotColor: "bg-red-500",
  },
  churned: {
    label: "Churned",
    color: "bg-gray-500/10 text-gray-600",
    dotColor: "bg-gray-500",
  },
  new: {
    label: "Nouveau",
    color: "bg-blue-500/10 text-blue-600",
    dotColor: "bg-blue-500",
  },
  standard: {
    label: "Standard",
    color: "bg-amber-500/10 text-amber-600",
    dotColor: "bg-amber-500",
  },
  vip: {
    label: "VIP",
    color: "bg-emerald-500/10 text-emerald-600",
    dotColor: "bg-emerald-500",
  },
};

const TAG_ORDER: Tag[] = ["at_risk", "new", "standard", "vip", "churned"];

const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "at_risk", label: "A risque" },
  { value: "new", label: "Nouveaux" },
  { value: "standard", label: "Standard" },
  { value: "vip", label: "VIP" },
  { value: "churned", label: "Churned" },
];

export function CoachStudentsOverview() {
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("health_score");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const { students, isLoading } = useStudents({ limit: 100 });

  const filtered = useMemo(() => {
    let result = [...students];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.full_name.toLowerCase().includes(q));
    }

    // Tag filter
    if (tagFilter !== "all") {
      result = result.filter((s) => getStudentDetail(s)?.tag === tagFilter);
    }

    // Sort
    result.sort((a, b) => {
      const aDetails = getStudentDetail(a);
      const bDetails = getStudentDetail(b);

      if (sortField === "health_score") {
        return (aDetails?.health_score ?? 0) - (bDetails?.health_score ?? 0);
      }

      const aDate = aDetails?.last_engagement_at ?? a.created_at;
      const bDate = bDetails?.last_engagement_at ?? b.created_at;
      return new Date(aDate).getTime() - new Date(bDate).getTime();
    });

    // Group by tag order (at_risk first)
    if (sortField === "health_score" && tagFilter === "all") {
      result.sort((a, b) => {
        const aTag = (getStudentDetail(a)?.tag ?? "standard") as Tag;
        const bTag = (getStudentDetail(b)?.tag ?? "standard") as Tag;
        return TAG_ORDER.indexOf(aTag) - TAG_ORDER.indexOf(bTag);
      });
    }

    return result;
  }, [students, search, tagFilter, sortField]);

  if (isLoading) {
    return (
      <div
        className="bg-surface rounded-2xl p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <h3 className="text-[13px] font-semibold text-foreground mb-4">
          Vue eleves
        </h3>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full animate-shimmer" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 animate-shimmer rounded-lg" />
                <div className="h-2 w-full animate-shimmer rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-surface rounded-2xl p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-foreground">
          Vue eleves
        </h3>
        <span className="text-xs text-muted-foreground font-mono">
          {filtered.length} eleve{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un eleve..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[13px] bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          />
        </div>

        {/* Tag filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-1.5 px-3 py-2 text-[13px] bg-muted/50 border border-border rounded-xl text-foreground hover:bg-muted transition-colors"
          >
            {FILTER_OPTIONS.find((o) => o.value === tagFilter)?.label}
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {showFilterDropdown && (
            <div className="absolute right-0 top-full mt-1 z-20 bg-surface border border-border rounded-xl shadow-lg py-1 min-w-[140px]">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setTagFilter(opt.value);
                    setShowFilterDropdown(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-[13px] hover:bg-muted transition-colors",
                    tagFilter === opt.value
                      ? "text-primary font-medium"
                      : "text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort toggle */}
        <button
          onClick={() =>
            setSortField((f) =>
              f === "health_score" ? "last_engagement_at" : "health_score",
            )
          }
          className="flex items-center gap-1.5 px-3 py-2 text-[13px] bg-muted/50 border border-border rounded-xl text-foreground hover:bg-muted transition-colors"
          title={
            sortField === "health_score"
              ? "Trier par score de sante"
              : "Trier par dernier engagement"
          }
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Student list */}
      <div className="space-y-2 max-h-[520px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">Aucun eleve trouve</p>
          </div>
        ) : (
          filtered.map((student) => {
            const details = getStudentDetail(student);
            const tag = (details?.tag ?? "standard") as Tag;
            const healthScore = details?.health_score ?? 0;
            const lastEngagement = details?.last_engagement_at;
            const config = TAG_CONFIG[tag];

            const healthColor =
              healthScore >= 70
                ? "bg-emerald-500"
                : healthScore >= 40
                  ? "bg-amber-500"
                  : "bg-red-500";

            return (
              <div
                key={student.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors group"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-xs text-primary font-medium shrink-0">
                  {student.avatar_url ? (
                    <Image
                      src={student.avatar_url}
                      alt={student.full_name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    getInitials(student.full_name)
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-foreground truncate">
                      {student.full_name}
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0",
                        config.color,
                      )}
                    >
                      {config.label}
                    </span>
                  </div>
                  {/* Health score bar */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          healthColor,
                        )}
                        style={{ width: `${healthScore}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono tabular-nums shrink-0">
                      {healthScore}%
                    </span>
                  </div>
                  {lastEngagement && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Dernier engagement :{" "}
                      {formatDate(lastEngagement, "relative")}
                    </p>
                  )}
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Link
                    href={`/coach/messaging?student=${student.id}`}
                    className="w-8 h-8 rounded-lg bg-muted/50 hover:bg-primary/10 flex items-center justify-center transition-colors"
                    title="Envoyer un message"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                  </Link>
                  <Link
                    href={`/coach/calls?student=${student.id}`}
                    className="w-8 h-8 rounded-lg bg-muted/50 hover:bg-primary/10 flex items-center justify-center transition-colors"
                    title="Planifier un appel"
                  >
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
