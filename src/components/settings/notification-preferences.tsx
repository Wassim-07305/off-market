"use client";

import { useState, useEffect } from "react";
import { usePreferences, useUpdatePreferences } from "@/hooks/use-preferences";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { toast } from "sonner";
import {
  Bell,
  BellRing,
  Mail,
  Smartphone,
  MessageSquare,
  Phone,
  Target,
  Users,
  GraduationCap,
  Settings,
  Clock,
  Save,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useNotificationSound } from "@/hooks/use-notification-sound";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

// Types de notifications
interface NotificationCategory {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  prefKey: string;
}

const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  {
    key: "messages",
    label: "Messages",
    description: "Nouveaux messages et mentions",
    icon: MessageSquare,
    prefKey: "notify_messages",
  },
  {
    key: "calls",
    label: "Appels",
    description: "Rappels et confirmations d'appels",
    icon: Phone,
    prefKey: "notify_calls",
  },
  {
    key: "goals",
    label: "Objectifs",
    description: "Nouveaux objectifs et taches assignees",
    icon: Target,
    prefKey: "notify_goals",
  },
  {
    key: "feed",
    label: "Communaute",
    description: "Activite sur le fil d'actualite",
    icon: Users,
    prefKey: "notify_feed",
  },
  {
    key: "formations",
    label: "Formations",
    description: "Progressions et nouveaux contenus",
    icon: GraduationCap,
    prefKey: "notify_certificates",
  },
  {
    key: "system",
    label: "Systeme",
    description: "Mises a jour et maintenance",
    icon: Settings,
    prefKey: "notify_forms",
  },
];

// Canaux
type Channel = "in_app" | "email" | "push";

interface ChannelInfo {
  key: Channel;
  label: string;
  icon: React.ElementType;
}

const CHANNELS: ChannelInfo[] = [
  { key: "in_app", label: "In-app", icon: Bell },
  { key: "email", label: "Email", icon: Mail },
  { key: "push", label: "Push", icon: Smartphone },
];

// Preferences par type × canal (stockees localement)
type NotifMatrix = Record<string, Record<Channel, boolean>>;

const DIGEST_OPTIONS = [
  { value: "none", label: "Aucun" },
  { value: "daily", label: "Quotidien" },
  { value: "weekly", label: "Hebdomadaire" },
] as const;

function getDefaultMatrix(): NotifMatrix {
  const matrix: NotifMatrix = {};
  for (const cat of NOTIFICATION_CATEGORIES) {
    matrix[cat.key] = { in_app: true, email: true, push: true };
  }
  return matrix;
}

export function NotificationPreferences() {
  const { data: preferences } = usePreferences();
  const updatePreferences = useUpdatePreferences();
  const push = usePushNotifications();
  const { soundEnabled, setSoundEnabled, playSound } = useNotificationSound();

  const [matrix, setMatrix] = useState<NotifMatrix>(getDefaultMatrix);
  const [dndEnabled, setDndEnabled] = useState(false);
  const [dndStart, setDndStart] = useState("22:00");
  const [dndEnd, setDndEnd] = useState("08:00");
  const [saving, setSaving] = useState(false);

  // Charger depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem("off-market-notif-matrix");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.matrix) setMatrix(parsed.matrix);
        if (parsed.dndEnabled !== undefined) setDndEnabled(parsed.dndEnabled);
        if (parsed.dndStart) setDndStart(parsed.dndStart);
        if (parsed.dndEnd) setDndEnd(parsed.dndEnd);
      } catch {
        // Ignorer
      }
    }
  }, []);

  const handleToggleCell = (categoryKey: string, channel: Channel) => {
    setMatrix((prev) => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        [channel]: !prev[categoryKey][channel],
      },
    }));
  };

  const handleToggleMainPref = (prefKey: string, value: boolean) => {
    updatePreferences.mutate(
      { [prefKey]: value },
      { onError: () => toast.error("Erreur lors de la mise a jour") },
    );
  };

  const handleDigestChange = (value: string) => {
    updatePreferences.mutate(
      { email_digest: value as "none" | "daily" | "weekly" },
      { onError: () => toast.error("Erreur lors de la mise a jour") },
    );
  };

  const handleMarketingToggle = (value: boolean) => {
    updatePreferences.mutate(
      { email_marketing: value },
      { onError: () => toast.error("Erreur lors de la mise a jour") },
    );
  };

  const handleSaveMatrix = async () => {
    setSaving(true);
    try {
      localStorage.setItem(
        "off-market-notif-matrix",
        JSON.stringify({ matrix, dndEnabled, dndStart, dndEnd }),
      );
      toast.success("Preferences de notifications sauvegardees");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Matrice type × canal */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Notifications par type
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Choisis quel canal utiliser pour chaque type de notification.
        </p>

        {/* Header */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4 min-w-[200px]">
                  Type
                </th>
                {CHANNELS.map((ch) => (
                  <th
                    key={ch.key}
                    className="text-center text-xs font-medium text-muted-foreground pb-3 w-20"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <ch.icon className="w-4 h-4" />
                      <span>{ch.label}</span>
                    </div>
                  </th>
                ))}
                <th className="text-center text-xs font-medium text-muted-foreground pb-3 w-20">
                  Global
                </th>
              </tr>
            </thead>
            <tbody>
              {NOTIFICATION_CATEGORIES.map((cat) => {
                const globalEnabled = preferences
                  ? (preferences[
                      cat.prefKey as keyof typeof preferences
                    ] as boolean)
                  : true;

                return (
                  <tr
                    key={cat.key}
                    className={cn(
                      "border-t border-border/50",
                      !globalEnabled && "opacity-50",
                    )}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <cat.icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {cat.label}
                          </p>
                          <p className="text-xs text-muted-foreground hidden sm:block">
                            {cat.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    {CHANNELS.map((ch) => (
                      <td key={ch.key} className="py-3 text-center">
                        <div className="flex justify-center">
                          <button
                            role="switch"
                            aria-checked={
                              matrix[cat.key]?.[ch.key] && globalEnabled
                            }
                            disabled={!globalEnabled}
                            onClick={() => handleToggleCell(cat.key, ch.key)}
                            className={cn(
                              "relative w-10 h-6 rounded-full transition-colors shrink-0 cursor-pointer",
                              matrix[cat.key]?.[ch.key] && globalEnabled
                                ? "bg-primary"
                                : "bg-muted-foreground/30",
                              !globalEnabled && "cursor-not-allowed",
                            )}
                          >
                            <span
                              className={cn(
                                "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm",
                                matrix[cat.key]?.[ch.key] &&
                                  globalEnabled &&
                                  "translate-x-4",
                              )}
                            />
                          </button>
                        </div>
                      </td>
                    ))}
                    <td className="py-3 text-center">
                      <div className="flex justify-center">
                        <button
                          role="switch"
                          aria-checked={globalEnabled}
                          onClick={() =>
                            handleToggleMainPref(cat.prefKey, !globalEnabled)
                          }
                          className={cn(
                            "relative w-10 h-6 rounded-full transition-colors shrink-0 cursor-pointer",
                            globalEnabled
                              ? "bg-emerald-500"
                              : "bg-muted-foreground/30",
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm",
                              globalEnabled && "translate-x-4",
                            )}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Push notifications */}
      {push.isSupported && (
        <div
          className="bg-surface rounded-2xl p-6 space-y-4"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <BellRing className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              Notifications push
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <BellRing className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Notifications push navigateur
                </p>
                <p className="text-xs text-muted-foreground">
                  {push.permission === "denied"
                    ? "Bloquees dans les parametres du navigateur"
                    : "Recois des alertes meme quand le site est ferme"}
                </p>
              </div>
            </div>
            <Switch
              checked={push.isSubscribed}
              onCheckedChange={push.toggle}
              disabled={push.isLoading || push.permission === "denied"}
            />
          </div>
        </div>
      )}

      {/* Sons de notification */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-muted-foreground" />
          ) : (
            <VolumeX className="w-4 h-4 text-muted-foreground" />
          )}
          <h2 className="text-sm font-semibold text-foreground">
            Sons de notification
          </h2>
        </div>

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
                Un son different pour les notifications normales et urgentes
              </p>
            </div>
          </div>
          <Switch
            checked={soundEnabled}
            onCheckedChange={(val) => setSoundEnabled(val)}
          />
        </div>

        {soundEnabled && (
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => playSound("normal")}
              className="h-9 px-4 rounded-xl text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Tester normal
            </button>
            <button
              type="button"
              onClick={() => playSound("urgent")}
              className="h-9 px-4 rounded-xl text-xs font-medium bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <BellRing className="w-3.5 h-3.5" />
              Tester urgent
            </button>
          </div>
        )}
      </div>

      {/* Plages horaires DND */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              Mode ne pas deranger
            </h2>
          </div>
          <Switch checked={dndEnabled} onCheckedChange={setDndEnabled} />
        </div>
        <p className="text-xs text-muted-foreground">
          Suspends toutes les notifications pendant une plage horaire.
        </p>

        {dndEnabled && (
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Debut du silence
              </label>
              <input
                type="time"
                value={dndStart}
                onChange={(e) => setDndStart(e.target.value)}
                className="w-full h-10 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Fin du silence
              </label>
              <input
                type="time"
                value={dndEnd}
                onChange={(e) => setDndEnd(e.target.value)}
                className="w-full h-10 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        )}
      </div>

      {/* Email preferences */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Preferences email
          </h2>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-2">
            Resume par email
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Recois un resume de ton activite par email.
          </p>
          <div className="flex gap-2">
            {DIGEST_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleDigestChange(opt.value)}
                className={cn(
                  "h-9 px-4 rounded-xl text-xs font-medium transition-all cursor-pointer",
                  preferences?.email_digest === opt.value
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <Switch
            label="Emails marketing"
            description="Nouveautes, conseils et offres speciales"
            wrapperClassName="w-full"
            checked={preferences?.email_marketing ?? true}
            onCheckedChange={(val) => handleMarketingToggle(val)}
          />
        </div>
      </div>

      {/* Sauvegarder matrice */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveMatrix}
          loading={saving}
          icon={<Save className="w-4 h-4" />}
        >
          {saving ? "Sauvegarde..." : "Sauvegarder les preferences"}
        </Button>
      </div>
    </div>
  );
}
