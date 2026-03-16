"use client";

import {
  Volume2,
  VolumeX,
  Play,
  Bell,
  AlertTriangle,
  MessageSquare,
  Trophy,
  Clock,
  Phone,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useNotificationSound } from "@/hooks/use-notification-sound";
import {
  type NotificationSoundType,
  SOUND_TYPE_LABELS,
  SOUND_TYPE_DESCRIPTIONS,
} from "@/lib/notification-sounds";

const SOUND_TYPE_ICONS: Record<NotificationSoundType, React.ElementType> = {
  default: Bell,
  urgent: AlertTriangle,
  message: MessageSquare,
  achievement: Trophy,
  reminder: Clock,
  call: Phone,
};

const SOUND_TYPES: NotificationSoundType[] = [
  "default",
  "urgent",
  "message",
  "achievement",
  "reminder",
  "call",
];

export function SoundSettings() {
  const {
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume,
    perType,
    setTypeEnabled,
    preview,
  } = useNotificationSound();

  return (
    <div
      className="bg-surface rounded-2xl p-6 space-y-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        {soundEnabled ? (
          <Volume2 className="w-4 h-4 text-muted-foreground" />
        ) : (
          <VolumeX className="w-4 h-4 text-muted-foreground" />
        )}
        <h2 className="text-sm font-semibold text-foreground">
          Sons de notification
        </h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Un son different pour chaque type de notification. Ajuste le volume et
        desactive les sons individuellement.
      </p>

      {/* Global toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Volume2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Activer les sons
            </p>
            <p className="text-xs text-muted-foreground">
              Joue un son a chaque nouvelle notification
            </p>
          </div>
        </div>
        <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
      </div>

      {soundEnabled && (
        <>
          {/* Volume slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Volume
              </label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={Math.round(volume * 100)}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Per-type toggles + preview */}
          <div className="space-y-1 pt-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Sons par type
            </p>
            <div className="space-y-2">
              {SOUND_TYPES.map((type) => {
                const Icon = SOUND_TYPE_ICONS[type];
                const enabled = perType[type];
                return (
                  <div
                    key={type}
                    className={cn(
                      "flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors",
                      enabled ? "bg-muted/30" : "bg-muted/10 opacity-60",
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {SOUND_TYPE_LABELS[type]}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {SOUND_TYPE_DESCRIPTIONS[type]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <button
                        type="button"
                        onClick={() => preview(type)}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                          "bg-primary/10 text-primary hover:bg-primary/20",
                        )}
                        title={`Ecouter "${SOUND_TYPE_LABELS[type]}"`}
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(val) => setTypeEnabled(type, val)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
