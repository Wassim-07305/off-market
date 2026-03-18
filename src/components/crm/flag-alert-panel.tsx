"use client";

import { cn, formatDate, getInitials } from "@/lib/utils";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useFlaggedClients } from "@/hooks/use-client-flags";
import { ClientFlagBadge } from "./client-flag-badge";
import { AlertTriangle, ArrowRight, User, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ClientFlagValue } from "@/types/roadmap";

interface FlagAlertPanelProps {
  className?: string;
  limit?: number;
}

export function FlagAlertPanel({ className, limit = 10 }: FlagAlertPanelProps) {
  const { data: flaggedClients, isLoading } = useFlaggedClients();
  const prefix = useRoutePrefix();

  const clients = (flaggedClients ?? []).slice(0, limit);
  const redClients = clients.filter((c) => c.flag === "red");
  const orangeClients = clients.filter((c) => c.flag === "orange");

  if (isLoading) {
    return (
      <div className={cn("rounded-xl border border-border p-4", className)}>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-muted animate-shimmer rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border p-6 text-center",
          className,
        )}
      >
        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-5 h-5 text-emerald-500" />
        </div>
        <p className="text-sm font-medium text-foreground">
          Aucun client en alerte
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Tous les clients sont en bonne voie
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border overflow-hidden",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-semibold text-foreground">
            Clients en alerte
          </h3>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
            {clients.length}
          </span>
        </div>
      </div>

      {/* Red alerts first */}
      {redClients.length > 0 && (
        <div className="border-b border-border">
          <div className="px-4 py-2 bg-red-50/50">
            <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider">
              Critiques ({redClients.length})
            </p>
          </div>
          {redClients.map((item) => (
            <FlagAlertItem key={item.id} item={item} prefix={prefix} />
          ))}
        </div>
      )}

      {/* Orange alerts */}
      {orangeClients.length > 0 && (
        <div>
          <div className="px-4 py-2 bg-orange-50/50">
            <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider">
              Attention ({orangeClients.length})
            </p>
          </div>
          {orangeClients.map((item) => (
            <FlagAlertItem key={item.id} item={item} prefix={prefix} />
          ))}
        </div>
      )}
    </div>
  );
}

function FlagAlertItem({
  item,
  prefix,
}: {
  item: {
    id: string;
    client_id: string;
    flag: ClientFlagValue;
    reason: string | null;
    updated_at: string;
    client?: { id: string; full_name: string; avatar_url: string | null };
  };
  prefix: string;
}) {
  return (
    <Link
      href={`${prefix}/clients/${item.client_id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
    >
      {/* Avatar */}
      <div className="relative">
        {item.client?.avatar_url ? (
          <Image
            src={item.client.avatar_url}
            alt={item.client.full_name}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-medium">
            {item.client ? (
              getInitials(item.client.full_name)
            ) : (
              <User className="w-3.5 h-3.5" />
            )}
          </div>
        )}
        <div className="absolute -bottom-0.5 -right-0.5">
          <ClientFlagBadge flag={item.flag} size="sm" pulse />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {item.client?.full_name ?? "Client inconnu"}
        </p>
        {item.reason && (
          <p className="text-[11px] text-muted-foreground truncate">
            {item.reason}
          </p>
        )}
        <div className="flex items-center gap-1 mt-0.5">
          <Clock className="w-2.5 h-2.5 text-muted-foreground/50" />
          <span className="text-[10px] text-muted-foreground/50">
            {formatDate(item.updated_at, "relative")}
          </span>
        </div>
      </div>

      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
    </Link>
  );
}
