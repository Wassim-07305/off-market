"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Module } from "@/types/database";

type DripType = "immediate" | "after_days" | "after_module" | "after_level";
import {
  Clock,
  Layers,
  Lock,
  Unlock,
  TrendingUp,
  Save,
  Loader2,
} from "lucide-react";

interface DripSettingsProps {
  module: Module;
  allModules: Module[];
  onSave: (updates: {
    drip_type: DripType;
    drip_days: number | null;
    drip_after_module_id: string | null;
    drip_min_level: number | null;
  }) => void;
  isSaving?: boolean;
}

const DRIP_OPTIONS: {
  value: DripType;
  label: string;
  description: string;
  icon: typeof Clock;
}[] = [
  {
    value: "immediate",
    label: "Immediat",
    description: "Le module est accessible des l'inscription",
    icon: Unlock,
  },
  {
    value: "after_days",
    label: "Apres X jours",
    description: "Deblocage automatique apres un nombre de jours",
    icon: Clock,
  },
  {
    value: "after_module",
    label: "Apres completion d'un module",
    description: "Se debloque quand un autre module est termine",
    icon: Layers,
  },
  {
    value: "after_level",
    label: "Apres niveau minimum",
    description: "Necessite un niveau de gamification minimum",
    icon: TrendingUp,
  },
];

export function DripSettings({
  module: mod,
  allModules,
  onSave,
  isSaving,
}: DripSettingsProps) {
  const modAny = mod as any;
  const [dripType, setDripType] = useState<DripType>(
    modAny.drip_type ?? "immediate",
  );
  const [dripDays, setDripDays] = useState<number>(modAny.drip_days ?? 7);
  const [dripAfterModuleId, setDripAfterModuleId] = useState<string>(
    modAny.drip_after_module_id ?? "",
  );
  const [dripMinLevel, setDripMinLevel] = useState<number>(
    modAny.drip_min_level ?? 1,
  );

  useEffect(() => {
    const m = mod as any;
    setDripType(m.drip_type ?? "immediate");
    setDripDays(m.drip_days ?? 7);
    setDripAfterModuleId(m.drip_after_module_id ?? "");
    setDripMinLevel(m.drip_min_level ?? 1);
  }, [mod]);

  const otherModules = allModules.filter((m) => m.id !== mod.id);

  const handleSave = () => {
    onSave({
      drip_type: dripType,
      drip_days: dripType === "after_days" ? dripDays : null,
      drip_after_module_id:
        dripType === "after_module" ? dripAfterModuleId || null : null,
      drip_min_level: dripType === "after_level" ? dripMinLevel : null,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">
          Deblocage du module
        </span>
      </div>

      {/* Drip type selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {DRIP_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = dripType === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDripType(opt.value)}
              className={cn(
                "text-left p-3 rounded-xl border-2 transition-all",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30",
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isSelected ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {opt.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{opt.description}</p>
            </button>
          );
        })}
      </div>

      {/* Conditional fields */}
      {dripType === "after_days" && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Nombre de jours apres l'inscription
          </label>
          <input
            type="number"
            min={1}
            max={365}
            value={dripDays}
            onChange={(e) => setDripDays(Math.max(1, Number(e.target.value)))}
            className="w-32 h-9 px-3 bg-muted/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Le module sera accessible {dripDays} jour{dripDays > 1 ? "s" : ""}{" "}
            apres l'inscription de l'eleve
          </p>
        </div>
      )}

      {dripType === "after_module" && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Module prerequis
          </label>
          {otherModules.length > 0 ? (
            <select
              value={dripAfterModuleId}
              onChange={(e) => setDripAfterModuleId(e.target.value)}
              className="w-full h-9 px-3 bg-muted/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Selectionner un module...</option>
              {otherModules
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
            </select>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Aucun autre module disponible
            </p>
          )}
        </div>
      )}

      {dripType === "after_level" && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Niveau minimum requis
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={dripMinLevel}
            onChange={(e) =>
              setDripMinLevel(Math.max(1, Number(e.target.value)))
            }
            className="w-32 h-9 px-3 bg-muted/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-xs text-muted-foreground mt-1">
            L'eleve doit atteindre le niveau {dripMinLevel} pour acceder a ce
            module
          </p>
        </div>
      )}

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          Enregistrer le deblocage
        </button>
      </div>
    </div>
  );
}
