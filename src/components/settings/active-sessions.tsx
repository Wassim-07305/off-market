"use client";

import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  LogOut,
  Loader2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserSessions } from "@/hooks/use-user-sessions";
import type { UserSession } from "@/types/invitations";
import type { LucideIcon } from "lucide-react";

function getDeviceIcon(deviceInfo: string | null): LucideIcon {
  if (!deviceInfo) return Globe;
  const lower = deviceInfo.toLowerCase();
  if (lower.includes("android") || lower.includes("iphone")) return Smartphone;
  if (lower.includes("ipad") || lower.includes("tablet")) return Tablet;
  return Monitor;
}

function formatSessionDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "A l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Il y a ${diffDays}j`;

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ActiveSessions() {
  const { sessions, activeSessions, isLoading, revokeSession } =
    useUserSessions();

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Chargement...
      </div>
    );
  }

  return (
    <div
      className="bg-surface rounded-2xl p-6 space-y-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">
          Sessions actives
        </h2>
        {activeSessions.length > 0 && (
          <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
            {activeSessions.length}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Appareils actuellement connectes a ton compte. Tu peux deconnecter une
        session a distance.
      </p>

      {sessions.length === 0 ? (
        <div className="text-center py-8">
          <Monitor className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Aucune session enregistree
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              onRevoke={() => revokeSession.mutate(session.id)}
              isRevoking={revokeSession.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionRow({
  session,
  onRevoke,
  isRevoking,
}: {
  session: UserSession;
  onRevoke: () => void;
  isRevoking: boolean;
}) {
  const DeviceIcon = getDeviceIcon(session.device_info);

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-xl transition-colors",
        session.is_active
          ? "bg-muted/50 hover:bg-muted"
          : "bg-muted/20 opacity-60",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center",
            session.is_active ? "bg-primary/10" : "bg-muted",
          )}
        >
          <DeviceIcon
            className={cn(
              "w-4 h-4",
              session.is_active ? "text-primary" : "text-muted-foreground",
            )}
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">
              {session.device_info || "Appareil inconnu"}
            </p>
            {session.is_active && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {session.ip_address && <span>{session.ip_address}</span>}
            {session.ip_address && <span>-</span>}
            <span>{formatSessionDate(session.last_active_at)}</span>
          </div>
        </div>
      </div>

      {session.is_active && (
        <button
          onClick={onRevoke}
          disabled={isRevoking}
          className="h-8 px-3 rounded-lg text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          {isRevoking ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          Deconnecter
        </button>
      )}

      {!session.is_active && (
        <span className="text-xs text-muted-foreground/60">Deconnectee</span>
      )}
    </div>
  );
}
