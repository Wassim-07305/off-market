"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  TrendingUp,
  Plus,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Euro,
  Timer,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import {
  useUpsellRules,
  useCreateUpsellRule,
  useUpdateUpsellRule,
} from "@/hooks/use-upsell";
import type { UpsellRule, UpsellTriggerType } from "@/types/upsell";
import { UPSELL_TRIGGER_TYPE_CONFIG } from "@/types/upsell";

const upsellRuleSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  trigger_type: z.enum([
    "revenue_threshold",
    "milestone_completion",
    "time_based",
  ]),
  threshold: z.coerce.number().min(0).optional(),
  milestone_key: z.string().optional(),
  days_after: z.coerce.number().min(0).optional(),
  offer_title: z.string().min(1, "Le titre de l'offre est requis"),
  offer_description: z.string().optional(),
  offer_url: z.string().url().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

type UpsellRuleFormData = z.infer<typeof upsellRuleSchema>;

const TRIGGER_ICONS: Record<UpsellTriggerType, typeof Euro> = {
  revenue_threshold: Euro,
  milestone_completion: Target,
  time_based: Timer,
};

export function UpsellRulesManager() {
  const { data: rules = [], isLoading } = useUpsellRules();
  const createRule = useCreateUpsellRule();
  const updateRule = useUpdateUpsellRule();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<UpsellRule | null>(null);

  const form = useForm<UpsellRuleFormData>({
    resolver: zodResolver(upsellRuleSchema) as any,
    defaultValues: {
      name: "",
      trigger_type: "revenue_threshold",
      threshold: 7000,
      offer_title: "",
      offer_description: "",
      offer_url: "",
      is_active: true,
    },
  });

  const triggerType = form.watch("trigger_type");

  function openCreate() {
    setEditingRule(null);
    form.reset({
      name: "",
      trigger_type: "revenue_threshold",
      threshold: 7000,
      offer_title: "",
      offer_description: "",
      offer_url: "",
      is_active: true,
    });
    setModalOpen(true);
  }

  function openEdit(rule: UpsellRule) {
    setEditingRule(rule);
    const config = rule.trigger_config as Record<string, unknown>;
    form.reset({
      name: rule.name,
      trigger_type: rule.trigger_type as UpsellTriggerType,
      threshold: (config.threshold as number) ?? 0,
      milestone_key: (config.milestone_key as string) ?? "",
      days_after: (config.days_after as number) ?? 0,
      offer_title: rule.offer_title,
      offer_description: rule.offer_description ?? "",
      offer_url: rule.offer_url ?? "",
      is_active: rule.is_active,
    });
    setModalOpen(true);
  }

  function buildTriggerConfig(
    data: UpsellRuleFormData,
  ): Record<string, unknown> {
    switch (data.trigger_type) {
      case "revenue_threshold":
        return { threshold: data.threshold ?? 7000, currency: "EUR" };
      case "milestone_completion":
        return { milestone_key: data.milestone_key ?? "" };
      case "time_based":
        return { days_after: data.days_after ?? 90 };
      default:
        return {};
    }
  }

  async function onSubmit(data: UpsellRuleFormData) {
    const payload = {
      name: data.name,
      trigger_type: data.trigger_type,
      trigger_config: buildTriggerConfig(data),
      offer_title: data.offer_title,
      offer_description: data.offer_description || null,
      offer_url: data.offer_url || null,
      is_active: data.is_active,
    };

    if (editingRule) {
      await updateRule.mutateAsync({ id: editingRule.id, ...payload });
    } else {
      await createRule.mutateAsync(payload);
    }
    setModalOpen(false);
  }

  async function toggleActive(rule: UpsellRule) {
    await updateRule.mutateAsync({
      id: rule.id,
      is_active: !rule.is_active,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Regles d&apos;upsell
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configurez les declencheurs automatiques d&apos;upsell pour
            maximiser la LTV client.
          </p>
        </div>
        <Button onClick={openCreate} icon={<Plus className="h-4 w-4" />}>
          Nouvelle regle
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-32" />
            </Card>
          ))}
        </div>
      ) : rules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <TrendingUp className="mx-auto h-10 w-10 mb-3 opacity-30" />
            <p>Aucune regle d&apos;upsell configuree.</p>
            <p className="text-sm mt-1">
              Creez votre premiere regle pour automatiser les offres.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rules.map((rule) => {
            const Icon =
              TRIGGER_ICONS[rule.trigger_type as UpsellTriggerType] ?? Target;
            const config = rule.trigger_config as Record<string, unknown>;
            return (
              <Card key={rule.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          rule.is_active
                            ? "bg-primary/10 text-primary"
                            : "bg-zinc-100 text-zinc-400",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{rule.name}</CardTitle>
                        <span className="text-xs text-muted-foreground">
                          {
                            UPSELL_TRIGGER_TYPE_CONFIG[
                              rule.trigger_type as UpsellTriggerType
                            ]?.label
                          }
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleActive(rule)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        title={rule.is_active ? "Desactiver" : "Activer"}
                      >
                        {rule.is_active ? (
                          <ToggleRight className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-zinc-400" />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(rule)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{rule.offer_title}</p>
                    {rule.offer_description && (
                      <p className="text-muted-foreground line-clamp-2">
                        {rule.offer_description}
                      </p>
                    )}
                    {rule.trigger_type === "revenue_threshold" && (
                      <div className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                        <Euro className="h-3 w-3" />
                        Seuil :{" "}
                        {(config.threshold as number)?.toLocaleString(
                          "fr-FR",
                        )}{" "}
                        EUR
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRule ? "Modifier la regle" : "Nouvelle regle d'upsell"}
        size="lg"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nom de la regle</label>
            <Input {...form.register("name")} placeholder="Ex: Upsell 7K" />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Type de declencheur</label>
            <select
              {...form.register("trigger_type")}
              className="w-full mt-1 rounded-xl border border-border px-3 py-2 text-sm bg-white"
            >
              {(
                Object.entries(UPSELL_TRIGGER_TYPE_CONFIG) as [
                  UpsellTriggerType,
                  { label: string },
                ][]
              ).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {triggerType === "revenue_threshold" && (
            <div>
              <label className="text-sm font-medium">Seuil de CA (EUR)</label>
              <Input
                type="number"
                {...form.register("threshold")}
                placeholder="7000"
              />
            </div>
          )}

          {triggerType === "milestone_completion" && (
            <div>
              <label className="text-sm font-medium">Cle de l&apos;etape</label>
              <Input
                {...form.register("milestone_key")}
                placeholder="Ex: module_5_completed"
              />
            </div>
          )}

          {triggerType === "time_based" && (
            <div>
              <label className="text-sm font-medium">
                Jours apres inscription
              </label>
              <Input
                type="number"
                {...form.register("days_after")}
                placeholder="90"
              />
            </div>
          )}

          <hr className="border-border" />

          <div>
            <label className="text-sm font-medium">Titre de l&apos;offre</label>
            <Input
              {...form.register("offer_title")}
              placeholder="Ex: Programme Premium"
            />
            {form.formState.errors.offer_title && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.offer_title.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">
              Description de l&apos;offre
            </label>
            <textarea
              {...form.register("offer_description")}
              className="w-full rounded-xl border border-border px-3 py-2 text-sm min-h-[80px] bg-white"
              placeholder="Decrivez l'offre proposee au client..."
            />
          </div>

          <div>
            <label className="text-sm font-medium">URL de l&apos;offre</label>
            <Input {...form.register("offer_url")} placeholder="https://..." />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={createRule.isPending || updateRule.isPending}
            >
              {editingRule ? "Enregistrer" : "Creer"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
