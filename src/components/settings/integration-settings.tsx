"use client";

import { useState, useEffect } from "react";
import {
  Settings2,
  Eye,
  EyeOff,
  Save,
  Check,
  Loader2,
  MessageSquare,
  CreditCard,
  Mail,
  Phone,
  BarChart3,
  Calendar,
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SettingRow {
  key: string;
  value: string;
  description: string;
  is_secret: boolean;
  hasValue: boolean;
  updated_at: string;
}

const GROUPS: {
  title: string;
  icon: typeof Settings2;
  color: string;
  keys: string[];
}[] = [
  {
    title: "Stripe (Paiements)",
    icon: CreditCard,
    color: "from-violet-500 to-purple-600",
    keys: [
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
    ],
  },
  {
    title: "Twilio (SMS)",
    icon: Phone,
    color: "from-red-500 to-rose-600",
    keys: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"],
  },
  {
    title: "Slack (Notifications)",
    icon: MessageSquare,
    color: "from-emerald-500 to-green-600",
    keys: ["SLACK_WEBHOOK_URL"],
  },
  {
    title: "Resend (Email)",
    icon: Mail,
    color: "from-orange-500 to-amber-600",
    keys: ["RESEND_API_KEY"],
  },
  {
    title: "OpenRouter (IA)",
    icon: Bot,
    color: "from-blue-500 to-cyan-600",
    keys: ["OPENROUTER_API_KEY"],
  },
  {
    title: "Google",
    icon: Calendar,
    color: "from-sky-500 to-blue-600",
    keys: [
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "NEXT_PUBLIC_GA_MEASUREMENT_ID",
    ],
  },
];

// Labels lisibles pour chaque clé
const KEY_LABELS: Record<string, string> = {
  TWILIO_ACCOUNT_SID: "Account SID",
  TWILIO_AUTH_TOKEN: "Auth Token",
  TWILIO_PHONE_NUMBER: "Numéro de téléphone",
  SLACK_WEBHOOK_URL: "URL Webhook",
  STRIPE_SECRET_KEY: "Clé secrète",
  STRIPE_WEBHOOK_SECRET: "Secret Webhook",
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "Clé publique",
  OPENROUTER_API_KEY: "Clé API",
  RESEND_API_KEY: "Clé API",
  GOOGLE_CLIENT_ID: "Client ID",
  GOOGLE_CLIENT_SECRET: "Client Secret",
  NEXT_PUBLIC_GA_MEASUREMENT_ID: "Measurement ID",
};

export function IntegrationSettings() {
  const [settings, setSettings] = useState<SettingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSettings(data);
    } catch {
      toast.error("Erreur lors du chargement des paramètres");
    } finally {
      setLoading(false);
    }
  }

  async function saveKey(key: string) {
    const value = editValues[key];
    if (value === undefined) return;

    setSavingKey(key);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });

      if (!res.ok) throw new Error();

      toast.success("Paramètre sauvegardé");
      setSavedKeys((prev) => new Set(prev).add(key));
      setTimeout(() => {
        setSavedKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }, 2000);

      // Clear edit state and refresh
      setEditValues((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      fetchSettings();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSavingKey(null);
    }
  }

  function toggleVisibility(key: string) {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function getSettingByKey(key: string): SettingRow | undefined {
    return settings.find((s) => s.key === key);
  }

  if (loading) {
    return (
      <div className="bg-surface rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="size-7 rounded-lg bg-gradient-to-br from-[#AF0000] to-[#DC2626] flex items-center justify-center">
            <Settings2 className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">
            Intégrations
          </h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-lg bg-gradient-to-br from-[#AF0000] to-[#DC2626] flex items-center justify-center">
          <Settings2 className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Intégrations
          </h2>
          <p className="text-xs text-muted-foreground">
            Configurez vos clés API pour activer les services
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {GROUPS.map((group) => (
          <div
            key={group.title}
            className="rounded-xl border border-border/60 overflow-hidden"
          >
            {/* Group header */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/30">
              <div
                className={cn(
                  "size-6 rounded-md bg-gradient-to-br flex items-center justify-center",
                  group.color,
                )}
              >
                <group.icon className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-semibold text-foreground">
                {group.title}
              </span>
              {/* Status indicator */}
              {group.keys.every((k) => getSettingByKey(k)?.hasValue) ? (
                <span className="ml-auto text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Configuré
                </span>
              ) : group.keys.some((k) => getSettingByKey(k)?.hasValue) ? (
                <span className="ml-auto text-[10px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  Partiel
                </span>
              ) : (
                <span className="ml-auto text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Non configuré
                </span>
              )}
            </div>

            {/* Keys */}
            <div className="divide-y divide-border/40">
              {group.keys.map((key) => {
                const setting = getSettingByKey(key);
                if (!setting) return null;

                const isEditing = editValues[key] !== undefined;
                const isVisible = visibleKeys.has(key);
                const isSaving = savingKey === key;
                const isSaved = savedKeys.has(key);

                return (
                  <div key={key} className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <label className="text-xs font-medium text-foreground">
                          {KEY_LABELS[key] || key}
                        </label>
                        {setting.description && (
                          <p className="text-[10px] text-muted-foreground truncate">
                            {setting.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="relative flex-1">
                        <input
                          type={
                            setting.is_secret && !isVisible
                              ? "password"
                              : "text"
                          }
                          value={
                            isEditing
                              ? editValues[key]
                              : setting.hasValue
                                ? setting.value
                                : ""
                          }
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          placeholder={
                            setting.hasValue
                              ? "Valeur configurée"
                              : "Non configuré..."
                          }
                          className="w-full h-8 px-3 bg-muted/50 border-0 rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-[#AF0000]/20 font-mono"
                        />
                      </div>

                      {setting.is_secret && (
                        <button
                          type="button"
                          onClick={() => toggleVisibility(key)}
                          className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                        >
                          {isVisible ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => saveKey(key)}
                          disabled={isSaving}
                          className={cn(
                            "size-8 flex items-center justify-center rounded-lg transition-colors",
                            isSaved
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-[#AF0000]/10 text-[#AF0000] hover:bg-[#AF0000]/20",
                          )}
                        >
                          {isSaving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : isSaved ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground">
        Les clés sont stockées de manière sécurisée. Les variables
        d&apos;environnement Vercel priment sur ces valeurs.
      </p>
    </div>
  );
}
