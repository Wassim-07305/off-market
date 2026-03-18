"use client";

import { useState } from "react";
import Image from "next/image";
import { useAlumni } from "@/hooks/use-upsell";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  Heart,
  BarChart3,
  Users,
  Search,
  TrendingUp,
  Star,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";

export function AlumniSection() {
  const { alumni, alumniStats, isLoading } = useAlumni();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAlumni = searchQuery.trim()
    ? alumni.filter(
        (a) =>
          a.profile?.full_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          a.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : alumni;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alumni stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {alumniStats.totalAlumni}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total alumni</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {alumniStats.retentionRate}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Taux de retention
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {alumniStats.averageNPS}/100
          </p>
          <p className="text-xs text-muted-foreground mt-1">Score NPS moyen</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {formatCurrency(alumniStats.totalLTV)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">LTV totale</p>
        </div>
      </div>

      {/* Alumni list */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            Membres alumni
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-9 pr-3 bg-muted/50 rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow w-48"
            />
          </div>
        </div>

        {filteredAlumni.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="w-6 h-6" />}
            title="Aucun alumni"
            description="Les eleves qui terminent le programme apparaitront ici."
          />
        ) : (
          <div className="space-y-2">
            {filteredAlumni.map((alumnus) => (
              <div
                key={alumnus.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {alumnus.profile?.avatar_url ? (
                    <Image
                      src={alumnus.profile.avatar_url}
                      alt={alumnus.profile.full_name}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center text-xs font-semibold text-purple-600">
                      {getInitials(alumnus.profile?.full_name ?? "?")}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {alumnus.profile?.full_name ?? "Inconnu"}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {alumnus.program ?? "Programme standard"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Inscrit le {formatDate(alumnus.enrollment_date)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-medium text-foreground">
                      {formatCurrency(alumnus.lifetime_value)}
                    </p>
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="w-3 h-3 text-amber-500" />
                      <span className="text-[10px] text-muted-foreground">
                        {alumnus.health_score}/100
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={alumnus.tag === "vip" ? "success" : "secondary"}
                  >
                    {alumnus.tag === "vip" ? "VIP" : "Alumni"}
                  </Badge>

                  <button
                    onClick={() =>
                      toast.success(
                        `Invitation envoyee a ${alumnus.profile?.full_name}`,
                      )
                    }
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                    title="Inviter a un live exclusif"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
