"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  useCommunities,
  useJoinCommunity,
  useLeaveCommunity,
} from "@/hooks/use-communities";
import { useRole } from "@/hooks/useRole";
import { cn } from "@/lib/utils";
import { Search, Users, Plus, Loader2 } from "lucide-react";
import { CommunityCard } from "./community-card";
import { CreateCommunityModal } from "./create-community-modal";
import type { Community } from "@/hooks/use-communities";

interface CommunityListProps {
  onSelectCommunity?: (community: Community) => void;
}

export function CommunityList({ onSelectCommunity }: CommunityListProps) {
  const { data: rawCommunities = [], isLoading } = useCommunities();
  const communities = rawCommunities as Community[];
  const { isAdmin, isCoach } = useRole();
  const joinCommunity = useJoinCommunity();
  const leaveCommunity = useLeaveCommunity();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "joined" | "available">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [actionCommunityId, setActionCommunityId] = useState<string | null>(null);

  const canCreate = isAdmin || isCoach;

  const filtered = useMemo(() => {
    let result = communities;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)),
      );
    }

    // Filter
    if (filter === "joined") {
      result = result.filter((c) => c.is_member);
    } else if (filter === "available") {
      result = result.filter((c) => !c.is_member);
    }

    return result;
  }, [communities, search, filter]);

  const handleJoin = (communityId: string) => {
    setActionCommunityId(communityId);
    joinCommunity.mutate(communityId, {
      onSettled: () => setActionCommunityId(null),
    });
  };

  const handleLeave = (communityId: string) => {
    setActionCommunityId(communityId);
    leaveCommunity.mutate(communityId, {
      onSettled: () => setActionCommunityId(null),
    });
  };

  const handleClick = (community: Community) => {
    if (onSelectCommunity) {
      onSelectCommunity(community);
    }
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
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Groupes thematiques
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {communities.length} groupe{communities.length !== 1 ? "s" : ""} disponible{communities.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setCreateOpen(true)}
            className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Creer un groupe
          </button>
        )}
      </motion.div>

      {/* Search + filter */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un groupe..."
            className="w-full h-10 pl-10 pr-4 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
          {(
            [
              { value: "all", label: "Tous" },
              { value: "joined", label: "Mes groupes" },
              { value: "available", label: "Disponibles" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                "h-8 px-3 rounded-lg text-xs font-medium transition-all",
                filter === tab.value
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-52 bg-muted/50 animate-shimmer rounded-xl"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="bg-surface rounded-2xl p-12 text-center border border-border"
        >
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {search
              ? "Aucun groupe ne correspond a votre recherche"
              : filter === "joined"
                ? "Vous n'avez rejoint aucun groupe"
                : "Aucun groupe disponible pour le moment"}
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerItem}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              onJoin={handleJoin}
              onLeave={handleLeave}
              onClick={handleClick}
              isJoining={
                joinCommunity.isPending && actionCommunityId === community.id
              }
              isLeaving={
                leaveCommunity.isPending && actionCommunityId === community.id
              }
            />
          ))}
        </motion.div>
      )}

      {/* Create modal */}
      <CreateCommunityModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </motion.div>
  );
}
