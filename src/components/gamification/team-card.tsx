"use client";

import Image from "next/image";
import { Crown, Users, LogIn, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useJoinTeam, useLeaveTeam, useMyTeam } from "@/hooks/use-teams";
import type { Team } from "@/types/gamification";

interface TeamCardProps {
  team: Team;
  className?: string;
}

export function TeamCard({ team, className }: TeamCardProps) {
  const { user } = useAuth();
  const { data: myTeam } = useMyTeam();
  const joinTeam = useJoinTeam();
  const leaveTeam = useLeaveTeam();

  const isMember = myTeam?.id === team.id;
  const isInAnotherTeam = !!myTeam && myTeam.id !== team.id;
  const isCaptain = team.captain_id === user?.id;
  const memberCount = team.member_count ?? 0;

  const handleJoinLeave = () => {
    if (isMember) {
      leaveTeam.mutate(team.id);
    } else {
      joinTeam.mutate(team.id);
    }
  };

  const isLoading = joinTeam.isPending || leaveTeam.isPending;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:shadow-lg",
        isMember && "ring-2 ring-[#DC2626]/30 border-[#DC2626]/20",
        className,
      )}
    >
      {/* Color accent bar */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: team.color || "#DC2626" }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${team.color || "#DC2626"}15` }}
            >
              {team.avatar_emoji || "🔥"}
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">
                {team.name}
              </h3>
              {team.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {team.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Captain */}
        {team.captain && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-muted/50">
            <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              {team.captain.avatar_url ? (
                <Image
                  src={team.captain.avatar_url}
                  alt=""
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center text-[10px] font-semibold text-amber-600">
                  {team.captain.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
              )}
              <span className="text-xs font-medium text-foreground truncate">
                {team.captain.full_name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Capitaine
              </span>
            </div>
          </div>
        )}

        {/* Members + count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Stacked avatars */}
            <div className="flex -space-x-2">
              {(team.members ?? []).slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  className="w-7 h-7 rounded-full border-2 border-surface bg-muted flex items-center justify-center text-[10px] font-medium text-foreground"
                >
                  {m.profile?.avatar_url ? (
                    <Image
                      src={m.profile.avatar_url}
                      alt=""
                      width={28}
                      height={28}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    (m.profile?.full_name?.charAt(0)?.toUpperCase() ?? "?")
                  )}
                </div>
              ))}
              {memberCount > 4 && (
                <div className="w-7 h-7 rounded-full border-2 border-surface bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                  +{memberCount - 4}
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {memberCount} membre{memberCount !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Join / Leave button */}
          {!isCaptain && (
            <button
              onClick={handleJoinLeave}
              disabled={isLoading || isInAnotherTeam}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isMember
                  ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  : "bg-[#DC2626] text-white hover:bg-[#DC2626]/90",
              )}
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isMember ? (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  Quitter
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  Rejoindre
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
