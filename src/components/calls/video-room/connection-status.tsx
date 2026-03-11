"use client";

import { useCallStore, type CallPhase } from "@/stores/call-store";
import { Loader2, Wifi, WifiOff } from "lucide-react";

const STATUS_CONFIG: Record<
  CallPhase,
  { label: string; icon: "loading" | "ok" | "error"; color: string } | null
> = {
  idle: null,
  joining: {
    label: "Acces aux peripheriques...",
    icon: "loading",
    color: "text-muted-foreground",
  },
  connecting: {
    label: "Connexion en cours...",
    icon: "loading",
    color: "text-yellow-500",
  },
  connected: { label: "Connecte", icon: "ok", color: "text-green-500" },
  reconnecting: {
    label: "Reconnexion...",
    icon: "loading",
    color: "text-orange-500",
  },
  ended: {
    label: "Appel termine",
    icon: "error",
    color: "text-muted-foreground",
  },
};

export function ConnectionStatus() {
  const phase = useCallStore((s) => s.phase);
  const isRemoteConnected = useCallStore((s) => s.isRemoteConnected);

  const config = STATUS_CONFIG[phase];
  if (!config) return null;

  // When connected but alone, show "waiting for participant"
  const label =
    phase === "connected" && !isRemoteConnected
      ? "En attente du participant..."
      : config.label;

  return (
    <div className={`flex items-center gap-1.5 ${config.color}`}>
      {config.icon === "loading" && (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      )}
      {config.icon === "ok" && <Wifi className="w-3.5 h-3.5" />}
      {config.icon === "error" && <WifiOff className="w-3.5 h-3.5" />}
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
