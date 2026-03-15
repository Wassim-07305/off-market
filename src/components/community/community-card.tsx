"use client";

import { Lock, Users, LogIn, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Community } from "@/hooks/use-communities";

interface CommunityCardProps {
  community: Community;
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
  onClick: (community: Community) => void;
  isJoining?: boolean;
  isLeaving?: boolean;
}

export function CommunityCard({
  community,
  onJoin,
  onLeave,
  onClick,
  isJoining,
  isLeaving,
}: CommunityCardProps) {
  const isFull =
    community.max_members !== null &&
    community.member_count >= community.max_members;

  return (
    <div
      className="bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group"
      style={{ boxShadow: "var(--shadow-card)" }}
      onClick={() => onClick(community)}
    >
      {/* Colored header */}
      <div
        className="h-16 relative flex items-center justify-center"
        style={{ backgroundColor: community.color + "18" }}
      >
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{ backgroundColor: community.color + "30" }}
        />
        <span className="text-2xl select-none">{community.icon || "💬"}</span>
        {community.is_private && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/80 flex items-center justify-center">
            <Lock className="w-3 h-3 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {community.name}
          </h3>
          {community.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {community.description}
            </p>
          )}
        </div>

        {/* Members */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>
            {community.member_count} membre
            {community.member_count !== 1 ? "s" : ""}
          </span>
          {community.max_members && (
            <span className="text-muted-foreground/60">
              / {community.max_members}
            </span>
          )}
        </div>

        {/* Action button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (community.is_member) {
              onLeave(community.id);
            } else {
              onJoin(community.id);
            }
          }}
          disabled={
            isJoining ||
            isLeaving ||
            (community.is_private && !community.is_member) ||
            (!community.is_member && isFull)
          }
          className={cn(
            "w-full h-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5",
            community.is_member
              ? "border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              : "bg-primary text-white hover:bg-primary/90 disabled:opacity-50",
          )}
        >
          {isJoining || isLeaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : community.is_member ? (
            <>
              <LogOut className="w-3.5 h-3.5" />
              Membre
            </>
          ) : community.is_private ? (
            <>
              <Lock className="w-3.5 h-3.5" />
              Privee
            </>
          ) : isFull ? (
            "Complet"
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5" />
              Rejoindre
            </>
          )}
        </button>
      </div>
    </div>
  );
}
