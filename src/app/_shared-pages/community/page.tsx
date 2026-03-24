"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { staggerItem } from "@/lib/animations";
import { useMembers, type MemberEntry } from "@/hooks/use-members";
import { useAuth } from "@/hooks/use-auth";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { cn, getInitials } from "@/lib/utils";
import Link from "next/link";
import {
  Search,
  Users,
  Trophy,
  Zap,
  Crown,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  MessageSquare,
  Plus,
} from "lucide-react";
import { CreateCommunityModal } from "@/components/community/create-community-modal";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: "Admin", color: "text-red-600 bg-red-500/10" },
  coach: { label: "Coach", color: "text-purple-600 bg-purple-500/10" },
  client: { label: "Membre", color: "text-blue-600 bg-blue-500/10" },
  setter: { label: "Setter", color: "text-amber-600 bg-amber-500/10" },
  closer: { label: "Closer", color: "text-emerald-600 bg-emerald-500/10" },
  sales: { label: "Sales", color: "text-orange-600 bg-orange-500/10" },
};

type SortBy = "name" | "level" | "xp" | "recent";
type ViewMode = "grid" | "list";

export default function CommunityPage() {
  const { members, isLoading, error } = useMembers();
  const { user } = useAuth();
  const prefix = useRoutePrefix();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("level");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Available roles for filtering
  const roles = useMemo(() => {
    const uniqueRoles = new Set(members.map((m) => m.role));
    return ["all", ...Array.from(uniqueRoles)];
  }, [members]);

  // Filter and sort
  const filteredMembers = useMemo(() => {
    let result = members;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.full_name.toLowerCase().includes(q) ||
          (m.bio && m.bio.toLowerCase().includes(q)),
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      result = result.filter((m) => m.role === roleFilter);
    }

    // Sort
    switch (sortBy) {
      case "name":
        result = [...result].sort((a, b) =>
          a.full_name.localeCompare(b.full_name),
        );
        break;
      case "level":
        result = [...result].sort((a, b) => b.total_xp - a.total_xp);
        break;
      case "xp":
        result = [...result].sort((a, b) => b.total_xp - a.total_xp);
        break;
      case "recent":
        result = [...result].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
    }

    return result;
  }, [members, search, sortBy, roleFilter]);

  return (
    <motion.div
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
      initial="visible"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            Communaute
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {members.length} membres dans la communaute
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Nouveau groupe
        </button>
      </motion.div>

      {/* Search and controls */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row gap-3"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un membre..."
            className="w-full h-10 pl-10 pr-4 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
          />
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-3 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r === "all" ? "Tous les roles" : (ROLE_LABELS[r]?.label ?? r)}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="h-10 px-3 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="level">Par niveau</option>
            <option value="xp">Par XP</option>
            <option value="name">Par nom</option>
            <option value="recent">Recent</option>
          </select>

          {/* View toggle */}
          <div className="flex bg-muted/50 rounded-xl p-1 gap-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "grid"
                  ? "bg-surface shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "list"
                  ? "bg-surface shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Members */}
      {error ? (
        <motion.div variants={staggerItem} className="bg-surface rounded-2xl p-12 text-center border border-border">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Impossible de charger les membres. Veuillez reessayer.</p>
        </motion.div>
      ) : isLoading ? (
        <div
          className={cn(
            "gap-3",
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
              : "space-y-2",
          )}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "bg-muted/50 animate-shimmer rounded-xl",
                viewMode === "grid" ? "h-44" : "h-16",
              )}
            />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="bg-surface rounded-2xl p-12 text-center border border-border"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {search
              ? "Aucun membre ne correspond a votre recherche"
              : "Aucun membre pour le moment"}
          </p>
        </motion.div>
      ) : viewMode === "grid" ? (
        <motion.div
          variants={staggerItem}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
        >
          {filteredMembers.map((member, i) => (
            <MemberGridCard
              key={member.id}
              member={member}
              prefix={prefix}
              isSelf={member.id === user?.id}
              index={i}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          variants={staggerItem}
          className="bg-surface border border-border rounded-2xl divide-y divide-border overflow-hidden"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {filteredMembers.map((member, i) => (
            <MemberListRow
              key={member.id}
              member={member}
              prefix={prefix}
              isSelf={member.id === user?.id}
              index={i}
            />
          ))}
        </motion.div>
      )}

      <CreateCommunityModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </motion.div>
  );
}

// ─── Grid Card ───────────────────────
function MemberGridCard({
  member,
  prefix,
  isSelf,
  index,
}: {
  member: MemberEntry;
  prefix: string;
  isSelf: boolean;
  index: number;
}) {
  const role = ROLE_LABELS[member.role] ?? ROLE_LABELS.client;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5), duration: 0.3 }}
    >
      <Link
        href={`${prefix}/profile/${member.id}`}
        className={cn(
          "block bg-surface border border-border rounded-xl p-4 text-center hover:border-primary/20 hover:shadow-md transition-all",
          isSelf && "border-primary/20",
        )}
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {/* Avatar */}
        <div className="relative mx-auto w-14 h-14 mb-3">
          {member.avatar_url ? (
            <Image
              src={member.avatar_url}
              alt={member.full_name}
              width={56}
              height={56}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-lg text-primary font-semibold">
              {getInitials(member.full_name)}
            </div>
          )}
          {/* Level icon badge */}
          <span className="absolute -bottom-1 -right-1 text-sm bg-surface rounded-full p-0.5 border border-border">
            {member.level_icon}
          </span>
        </div>

        {/* Name */}
        <p
          className={cn(
            "text-sm font-medium truncate",
            isSelf ? "text-primary" : "text-foreground",
          )}
        >
          {isSelf ? "Toi" : member.full_name}
        </p>

        {/* Role */}
        <span
          className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded-full inline-block mt-1",
            role.color,
          )}
        >
          {role.label}
        </span>

        {/* Stats */}
        <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Zap className="w-3 h-3 text-amber-500" />
            {member.total_xp.toLocaleString("fr-FR")}
          </span>
          {member.badge_count > 0 && (
            <span className="flex items-center gap-0.5">
              <Trophy className="w-3 h-3 text-purple-500" />
              {member.badge_count}
            </span>
          )}
        </div>

        {/* Level name */}
        <p className="text-[10px] text-muted-foreground mt-1 truncate">
          Niv. {member.level} — {member.level_name}
        </p>
      </Link>
    </motion.div>
  );
}

// ─── List Row ────────────────────────
function MemberListRow({
  member,
  prefix,
  isSelf,
  index,
}: {
  member: MemberEntry;
  prefix: string;
  isSelf: boolean;
  index: number;
}) {
  const role = ROLE_LABELS[member.role] ?? ROLE_LABELS.client;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.4), duration: 0.2 }}
    >
      <Link
        href={`${prefix}/profile/${member.id}`}
        className={cn(
          "flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors",
          isSelf && "bg-primary/5",
        )}
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          {member.avatar_url ? (
            <Image
              src={member.avatar_url}
              alt={member.full_name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-sm text-primary font-semibold">
              {getInitials(member.full_name)}
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 text-[10px] bg-surface rounded-full p-0.5 border border-border">
            {member.level_icon}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "text-sm font-medium truncate",
                isSelf ? "text-primary" : "text-foreground",
              )}
            >
              {isSelf ? "Toi" : member.full_name}
            </p>
            <span
              className={cn(
                "text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0",
                role.color,
              )}
            >
              {role.label}
            </span>
          </div>
          {member.bio && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {member.bio}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 shrink-0">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Zap className="w-3 h-3 text-amber-500" />
            {member.total_xp.toLocaleString("fr-FR")} XP
          </span>
          {member.badge_count > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Trophy className="w-3 h-3 text-purple-500" />
              {member.badge_count}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            Niv. {member.level}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
