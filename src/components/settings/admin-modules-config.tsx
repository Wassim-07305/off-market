"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Save,
  Blocks,
  Zap,
  AlertTriangle,
  Trophy,
  MessageSquare,
  Phone,
  Target,
  Users,
  GraduationCap,
  Bell,
  FileText,
  BarChart3,
  Wallet,
  Instagram,
  BookOpen,
  Gamepad2,
  ClipboardList,
  Bot,
  Newspaper,
  FileSignature,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface ModuleConfig {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}

interface AlertThresholds {
  inactivity_days: number;
  churn_threshold_days: number;
  low_engagement_score: number;
}

interface GamificationConfig {
  xp_message_sent: number;
  xp_checkin_completed: number;
  xp_module_completed: number;
  xp_call_attended: number;
  xp_form_submitted: number;
  xp_streak_bonus: number;
}

const DEFAULT_MODULES: ModuleConfig[] = [
  {
    key: "messaging",
    label: "Messagerie",
    description: "Chat temps reel et canaux",
    icon: MessageSquare,
    enabled: true,
  },
  {
    key: "formations",
    label: "Formations",
    description: "LMS, modules et suivi progression",
    icon: GraduationCap,
    enabled: true,
  },
  {
    key: "pipeline",
    label: "Pipeline",
    description: "Gestion des leads et CRM",
    icon: Target,
    enabled: true,
  },
  {
    key: "calls",
    label: "Appels",
    description: "Calendrier d'appels et closer calls",
    icon: Phone,
    enabled: true,
  },
  {
    key: "coaching",
    label: "Coaching",
    description: "Sessions, objectifs et suivi",
    icon: Users,
    enabled: true,
  },
  {
    key: "gamification",
    label: "Gamification",
    description: "XP, badges, streaks et classements",
    icon: Gamepad2,
    enabled: true,
  },
  {
    key: "journal",
    label: "Journal & Rituels",
    description: "Check-ins et suivi d'habitudes",
    icon: BookOpen,
    enabled: true,
  },
  {
    key: "forms",
    label: "Formulaires",
    description: "Form builder et reponses",
    icon: ClipboardList,
    enabled: true,
  },
  {
    key: "finances",
    label: "Finances",
    description: "Revenus, couts et echeanciers",
    icon: Wallet,
    enabled: true,
  },
  {
    key: "analytics",
    label: "Analytics",
    description: "KPIs et graphiques",
    icon: BarChart3,
    enabled: true,
  },
  {
    key: "contracts",
    label: "Contrats",
    description: "Templates et signatures",
    icon: FileSignature,
    enabled: true,
  },
  {
    key: "notifications",
    label: "Notifications",
    description: "Notifications in-app et push",
    icon: Bell,
    enabled: true,
  },
  {
    key: "instagram",
    label: "Instagram",
    description: "Planification contenu social",
    icon: Instagram,
    enabled: true,
  },
  {
    key: "assistant",
    label: "AlexIA",
    description: "Assistant IA intelligent avec base de connaissances",
    icon: Bot,
    enabled: true,
  },
  {
    key: "feed",
    label: "Communaute",
    description: "Fil d'actualite et annonces",
    icon: Newspaper,
    enabled: true,
  },
  {
    key: "documentation",
    label: "Documentation",
    description: "Base de connaissances",
    icon: FileText,
    enabled: true,
  },
];

const DEFAULT_THRESHOLDS: AlertThresholds = {
  inactivity_days: 7,
  churn_threshold_days: 30,
  low_engagement_score: 20,
};

const DEFAULT_GAMIFICATION: GamificationConfig = {
  xp_message_sent: 5,
  xp_checkin_completed: 15,
  xp_module_completed: 50,
  xp_call_attended: 25,
  xp_form_submitted: 10,
  xp_streak_bonus: 20,
};

const XP_LABELS: Record<keyof GamificationConfig, string> = {
  xp_message_sent: "Message envoye",
  xp_checkin_completed: "Check-in complete",
  xp_module_completed: "Module termine",
  xp_call_attended: "Appel effectue",
  xp_form_submitted: "Formulaire soumis",
  xp_streak_bonus: "Bonus streak (par jour)",
};

export function AdminModulesConfig() {
  const { isAdmin } = useAuth();
  const [modules, setModules] = useState<ModuleConfig[]>(DEFAULT_MODULES);
  const [thresholds, setThresholds] =
    useState<AlertThresholds>(DEFAULT_THRESHOLDS);
  const [gamification, setGamification] =
    useState<GamificationConfig>(DEFAULT_GAMIFICATION);
  const [saving, setSaving] = useState(false);

  // Charger depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem("off-market-modules-config");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.modules) setModules(parsed.modules);
        if (parsed.thresholds) setThresholds(parsed.thresholds);
        if (parsed.gamification) setGamification(parsed.gamification);
      } catch {
        // Ignorer
      }
    }
  }, []);

  const handleToggleModule = (key: string) => {
    setModules((prev) =>
      prev.map((m) => (m.key === key ? { ...m, enabled: !m.enabled } : m)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem(
        "off-market-modules-config",
        JSON.stringify({ modules, thresholds, gamification }),
      );
      toast.success("Configuration des modules sauvegardee");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) return null;

  const enabledCount = modules.filter((m) => m.enabled).length;

  return (
    <div className="space-y-6">
      {/* Modules actifs */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Blocks className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              Modules actifs
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {enabledCount}/{modules.length} actifs
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Active ou desactive les modules de la plateforme.
        </p>

        <div className="space-y-1">
          {modules.map((mod) => (
            <div
              key={mod.key}
              className={cn(
                "flex items-center justify-between py-3 px-3 rounded-xl transition-colors",
                mod.enabled ? "hover:bg-muted/50" : "opacity-60",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center",
                    mod.enabled ? "bg-primary/10" : "bg-muted",
                  )}
                >
                  <mod.icon
                    className={cn(
                      "w-4 h-4",
                      mod.enabled ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {mod.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {mod.description}
                  </p>
                </div>
              </div>
              <Switch
                checked={mod.enabled}
                onCheckedChange={() => handleToggleModule(mod.key)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Seuils d'alerte */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Seuils d'alerte
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Configure les seuils pour declencher les alertes automatiques.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Jours d'inactivite"
            type="number"
            min={1}
            max={90}
            value={thresholds.inactivity_days}
            onChange={(e) =>
              setThresholds((prev) => ({
                ...prev,
                inactivity_days: Number(e.target.value),
              }))
            }
            icon={<Zap className="w-4 h-4" />}
          />
          <Input
            label="Seuil churn (jours)"
            type="number"
            min={1}
            max={180}
            value={thresholds.churn_threshold_days}
            onChange={(e) =>
              setThresholds((prev) => ({
                ...prev,
                churn_threshold_days: Number(e.target.value),
              }))
            }
            icon={<AlertTriangle className="w-4 h-4" />}
          />
          <Input
            label="Score engagement min"
            type="number"
            min={0}
            max={100}
            value={thresholds.low_engagement_score}
            onChange={(e) =>
              setThresholds((prev) => ({
                ...prev,
                low_engagement_score: Number(e.target.value),
              }))
            }
            icon={<BarChart3 className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Gamification */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Gamification — XP par action
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Definis combien de points XP chaque action rapporte.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.keys(gamification) as Array<keyof GamificationConfig>).map(
            (key) => (
              <Input
                key={key}
                label={XP_LABELS[key]}
                type="number"
                min={0}
                max={500}
                value={gamification[key]}
                onChange={(e) =>
                  setGamification((prev) => ({
                    ...prev,
                    [key]: Number(e.target.value),
                  }))
                }
                icon={<Zap className="w-4 h-4" />}
              />
            ),
          )}
        </div>
      </div>

      {/* Bouton sauvegarder */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          loading={saving}
          icon={<Save className="w-4 h-4" />}
        >
          {saving ? "Sauvegarde..." : "Sauvegarder la configuration"}
        </Button>
      </div>
    </div>
  );
}
