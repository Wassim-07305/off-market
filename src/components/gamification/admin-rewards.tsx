"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, defaultTransition } from "@/lib/animations";
import { useManageRewards, usePendingRedemptions } from "@/hooks/use-rewards";
import {
  REWARD_TYPE_CONFIG,
  REDEMPTION_STATUS_CONFIG,
} from "@/types/gamification";
import type {
  Reward,
  RewardType,
  RedemptionStatus,
} from "@/types/gamification";
import {
  Plus,
  X,
  Loader2,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Clock,
  Coins,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS: { value: RewardType; label: string }[] = [
  { value: "session_bonus", label: "Session bonus" },
  { value: "resource_unlock", label: "Ressource" },
  { value: "badge_exclusive", label: "Badge exclusif" },
  { value: "custom", label: "Special" },
];

interface RewardFormData {
  title: string;
  description: string;
  cost_xp: number;
  type: RewardType;
  stock: number | null;
  image_url: string;
}

const EMPTY_FORM: RewardFormData = {
  title: "",
  description: "",
  cost_xp: 100,
  type: "custom",
  stock: null,
  image_url: "",
};

export function AdminRewards() {
  const { rewards, isLoading, createReward, updateReward, toggleActive } =
    useManageRewards();
  const {
    redemptions,
    isLoading: redemptionsLoading,
    fulfillRedemption,
    cancelRedemption,
  } = usePendingRedemptions();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RewardFormData>(EMPTY_FORM);
  const [hasStock, setHasStock] = useState(false);

  const pendingRedemptions = redemptions.filter((r) => r.status === "pending");

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setHasStock(false);
    setShowForm(true);
  };

  const openEdit = (reward: Reward) => {
    setEditingId(reward.id);
    setForm({
      title: reward.title,
      description: reward.description ?? "",
      cost_xp: reward.cost_xp,
      type: reward.type,
      stock: reward.stock,
      image_url: reward.image_url ?? "",
    });
    setHasStock(reward.stock !== null);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || form.cost_xp <= 0) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      cost_xp: form.cost_xp,
      type: form.type,
      stock: hasStock ? (form.stock ?? 1) : null,
      image_url: form.image_url.trim() || null,
    };

    if (editingId) {
      updateReward.mutate(
        { id: editingId, ...payload },
        { onSuccess: () => setShowForm(false) },
      );
    } else {
      createReward.mutate(payload, {
        onSuccess: () => setShowForm(false),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending redemptions */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Echanges en attente ({pendingRedemptions.length})
          </h2>
        </div>

        {redemptionsLoading ? (
          <div className="h-16 bg-muted animate-pulse rounded-2xl" />
        ) : pendingRedemptions.length === 0 ? (
          <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl p-6 text-center">
            <CheckCircle className="w-6 h-6 text-emerald-500/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              Aucun echange en attente
            </p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl divide-y divide-border">
            {pendingRedemptions.map((redemption) => {
              const profile = redemption.profile;
              const reward = redemption.reward;
              const statusConfig =
                REDEMPTION_STATUS_CONFIG[redemption.status as RedemptionStatus];

              return (
                <div
                  key={redemption.id}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/20 transition-colors"
                >
                  {/* User avatar */}
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground shrink-0">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      (profile?.full_name?.charAt(0)?.toUpperCase() ?? "?")
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {profile?.full_name ?? "Utilisateur"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {reward?.title ?? "Recompense"} •{" "}
                      <span className="font-medium text-[#AF0000]">
                        {redemption.xp_spent} XP
                      </span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(redemption.redeemed_at).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => fulfillRedemption.mutate(redemption.id)}
                      disabled={fulfillRedemption.isPending}
                      className="h-8 px-3 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-medium hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
                      title="Marquer comme rempli"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Rempli
                    </button>
                    <button
                      onClick={() => cancelRedemption.mutate(redemption.id)}
                      disabled={cancelRedemption.isPending}
                      className="h-8 px-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-error transition-colors"
                      title="Annuler"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Rewards management */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#AF0000]" />
            Catalogue des recompenses ({rewards.length})
          </h2>
          <button
            onClick={openCreate}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#AF0000] to-[#DC2626] text-white text-xs font-medium hover:shadow-lg hover:shadow-[#AF0000]/25 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-muted animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : rewards.length === 0 ? (
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 border border-dashed border-border rounded-2xl p-8 text-center">
            <Coins className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Aucune recompense creee
            </p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl divide-y divide-border">
            {rewards.map((reward) => {
              const typeConfig = REWARD_TYPE_CONFIG[reward.type];
              return (
                <div
                  key={reward.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 hover:bg-muted/20 transition-colors",
                    !reward.is_active && "opacity-50",
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      typeConfig.bg,
                    )}
                  >
                    <Coins className={cn("w-4 h-4", typeConfig.color)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {reward.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                          typeConfig.color,
                          typeConfig.bg,
                        )}
                      >
                        {typeConfig.label}
                      </span>
                      <span className="text-xs font-medium text-[#AF0000] bg-[#AF0000]/10 px-1.5 py-0.5 rounded-full">
                        {reward.cost_xp} XP
                      </span>
                      {reward.stock !== null && (
                        <span
                          className={cn(
                            "text-xs font-medium px-1.5 py-0.5 rounded-full",
                            reward.stock <= 0
                              ? "text-red-600 bg-red-500/10"
                              : reward.stock <= 3
                                ? "text-amber-600 bg-amber-500/10"
                                : "text-muted-foreground bg-muted",
                          )}
                        >
                          Stock: {reward.stock}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(reward)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      title="Modifier"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        toggleActive.mutate({
                          id: reward.id,
                          is_active: !reward.is_active,
                        })
                      }
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      title={reward.is_active ? "Desactiver" : "Activer"}
                    >
                      {reward.is_active ? (
                        <ToggleRight className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* All redemptions history */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-3">
          <Users className="w-4 h-4" />
          Historique des echanges ({redemptions.length})
        </h2>
        {redemptions.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-6 text-center">
            <p className="text-xs text-muted-foreground">
              Aucun echange pour le moment
            </p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl divide-y divide-border max-h-96 overflow-y-auto">
            {redemptions.map((redemption) => {
              const profile = redemption.profile;
              const reward = redemption.reward;
              const status = redemption.status as RedemptionStatus;
              const statusConfig = REDEMPTION_STATUS_CONFIG[status];

              return (
                <div
                  key={redemption.id}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-foreground shrink-0">
                    {profile?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {profile?.full_name ?? "Utilisateur"} —{" "}
                      {reward?.title ?? "Recompense"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(redemption.redeemed_at).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "short",
                        },
                      )}{" "}
                      • {redemption.xp_spent} XP
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0",
                      statusConfig.color,
                      statusConfig.bg,
                    )}
                  >
                    {statusConfig.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full mx-4 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {editingId ? "Modifier la recompense" : "Nouvelle recompense"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Titre *
                </label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Ex: Session bonus coaching"
                  className="w-full h-10 px-4 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#AF0000]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={2}
                  placeholder="Description de la recompense..."
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#AF0000]/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Cout XP *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.cost_xp}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        cost_xp: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full h-10 px-4 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#AF0000]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        type: e.target.value as RewardType,
                      }))
                    }
                    className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#AF0000]/20"
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stock toggle */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={hasStock}
                    onClick={() => {
                      setHasStock(!hasStock);
                      if (!hasStock) {
                        setForm((f) => ({ ...f, stock: 10 }));
                      }
                    }}
                    className={cn(
                      "relative w-10 h-6 rounded-full transition-colors shrink-0",
                      hasStock ? "bg-[#AF0000]" : "bg-muted-foreground/30",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm",
                        hasStock && "translate-x-4",
                      )}
                    />
                  </button>
                  <span className="text-sm font-medium text-foreground">
                    Stock limite
                  </span>
                </label>
                {hasStock && (
                  <input
                    type="number"
                    min={1}
                    value={form.stock ?? 1}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        stock: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-full h-10 px-4 mt-2 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#AF0000]/20"
                    placeholder="Nombre d'unites"
                  />
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="h-9 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  !form.title.trim() ||
                  form.cost_xp <= 0 ||
                  createReward.isPending ||
                  updateReward.isPending
                }
                className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#AF0000] to-[#DC2626] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#AF0000]/25 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
              >
                {(createReward.isPending || updateReward.isPending) && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                {editingId ? "Mettre a jour" : "Creer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
