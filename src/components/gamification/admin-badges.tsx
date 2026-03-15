"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, defaultTransition } from "@/lib/animations";
import {
  useAdminBadges,
  useBadgeEarners,
  useCreateBadge,
  useUpdateBadge,
  useToggleBadgeActive,
} from "@/hooks/use-admin-badges";
import { RARITY_CONFIG, CATEGORY_CONFIG } from "@/types/gamification";
import type { Badge, BadgeCategory, BadgeRarity } from "@/types/gamification";
import {
  Plus,
  X,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Award,
  Users,
  Zap,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_OPTIONS: { value: BadgeCategory; label: string }[] = [
  { value: "learning", label: "Formation" },
  { value: "engagement", label: "Engagement" },
  { value: "revenue", label: "Chiffre d'affaires" },
  { value: "social", label: "Social" },
  { value: "special", label: "Special" },
];

const RARITY_OPTIONS: { value: BadgeRarity; label: string }[] = [
  { value: "common", label: "Commun" },
  { value: "uncommon", label: "Peu commun" },
  { value: "rare", label: "Rare" },
  { value: "epic", label: "Epique" },
  { value: "legendary", label: "Legendaire" },
];

interface BadgeFormData {
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  xp_reward: number;
  condition_action: string;
  condition_count: number;
}

const EMPTY_FORM: BadgeFormData = {
  name: "",
  description: "",
  icon: "🏆",
  category: "engagement",
  rarity: "common",
  xp_reward: 50,
  condition_action: "",
  condition_count: 1,
};

const CONDITION_ACTIONS = [
  { value: "lessons_completed", label: "Lecons terminees" },
  { value: "courses_completed", label: "Formations terminees" },
  { value: "messages_sent", label: "Messages envoyes" },
  { value: "journal_entries", label: "Entrees de journal" },
  { value: "coaching_sessions", label: "Sessions de coaching" },
  { value: "calls_made", label: "Appels effectues" },
  { value: "clients_won", label: "Clients gagnes" },
  { value: "revenue_earned", label: "Revenus generes (EUR)" },
  { value: "streak_days", label: "Jours de streak" },
  { value: "xp_earned", label: "XP total gagne" },
  { value: "posts_created", label: "Publications creees" },
  { value: "comments_made", label: "Commentaires" },
  { value: "challenges_completed", label: "Defis completes" },
];

const EMOJI_PRESETS = [
  "🏆",
  "🥇",
  "🥈",
  "🥉",
  "⭐",
  "🌟",
  "💎",
  "🔥",
  "⚡",
  "🚀",
  "🎯",
  "💪",
  "🧠",
  "📚",
  "💰",
  "🤝",
  "🎓",
  "👑",
  "🦁",
  "🐉",
  "🌈",
  "💫",
  "🎖️",
  "🏅",
  "✨",
  "🔮",
  "🎪",
  "🎨",
  "🎸",
  "🦄",
];

export function AdminBadges() {
  const { badges, isLoading } = useAdminBadges();
  const createBadge = useCreateBadge();
  const updateBadge = useUpdateBadge();
  const toggleActive = useToggleBadgeActive();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BadgeFormData>(EMPTY_FORM);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [viewEarnersId, setViewEarnersId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<BadgeCategory | "all">(
    "all",
  );

  const filteredBadges =
    filterCategory === "all"
      ? badges
      : badges.filter((b) => b.category === filterCategory);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (badge: Badge) => {
    setEditingId(badge.id);
    const condition = badge.condition as Record<string, unknown>;
    setForm({
      name: badge.name,
      description: badge.description ?? "",
      icon: badge.icon ?? "🏆",
      category: badge.category,
      rarity: badge.rarity,
      xp_reward: badge.xp_reward,
      condition_action: (condition.action as string) ?? "",
      condition_count: (condition.count as number) ?? 1,
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || form.xp_reward <= 0) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      icon: form.icon || null,
      category: form.category,
      rarity: form.rarity,
      xp_reward: form.xp_reward,
      condition: form.condition_action
        ? { action: form.condition_action, count: form.condition_count }
        : {},
    };

    if (editingId) {
      updateBadge.mutate(
        { id: editingId, ...payload },
        { onSuccess: () => setShowForm(false) },
      );
    } else {
      createBadge.mutate(payload, {
        onSuccess: () => setShowForm(false),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Badge list */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Badges ({badges.length})
          </h2>
          <button
            onClick={openCreate}
            className="h-8 px-3 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouveau badge
          </button>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterCategory("all")}
            className={cn(
              "h-7 px-2.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all",
              filterCategory === "all"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            Tous
          </button>
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={cn(
                "h-7 px-2.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all",
                filterCategory === cat.value
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {CATEGORY_CONFIG[cat.value].emoji} {cat.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredBadges.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <Award className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {filterCategory === "all"
                ? "Aucun badge cree"
                : "Aucun badge dans cette categorie"}
            </p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl divide-y divide-border">
            {filteredBadges.map((badge) => {
              const rarityConfig = RARITY_CONFIG[badge.rarity];
              const categoryConfig = CATEGORY_CONFIG[badge.category];
              const condition = badge.condition as {
                action?: string;
                count?: number;
              };

              return (
                <div
                  key={badge.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3",
                    !badge.is_active && "opacity-50",
                  )}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg shrink-0">
                    {badge.icon ?? "🏆"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {badge.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span
                        className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                          rarityConfig.color,
                          rarityConfig.bg,
                        )}
                      >
                        {rarityConfig.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {categoryConfig.emoji} {categoryConfig.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5" />
                        {badge.xp_reward} XP
                      </span>
                      {condition.action && (
                        <span className="text-[10px] text-muted-foreground">
                          {CONDITION_ACTIONS.find(
                            (a) => a.value === condition.action,
                          )?.label ?? String(condition.action)}{" "}
                          &ge; {String(condition.count ?? 1)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() =>
                        setViewEarnersId(
                          viewEarnersId === badge.id ? null : badge.id,
                        )
                      }
                      className={cn(
                        "p-2 rounded-lg hover:bg-muted transition-colors",
                        viewEarnersId === badge.id
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      title="Voir qui a obtenu ce badge"
                    >
                      <Users className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEdit(badge)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      title="Modifier"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        toggleActive.mutate({
                          id: badge.id,
                          is_active: !badge.is_active,
                        })
                      }
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      title={badge.is_active ? "Desactiver" : "Activer"}
                    >
                      {badge.is_active ? (
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

      {/* Badge earners panel */}
      {viewEarnersId && (
        <BadgeEarnersPanel
          badgeId={viewEarnersId}
          badgeName={
            badges.find((b) => b.id === viewEarnersId)?.name ?? "Badge"
          }
          onClose={() => setViewEarnersId(null)}
        />
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full mx-4 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                {editingId ? "Modifier le badge" : "Nouveau badge"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Icon picker */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Icone
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-full h-10 px-4 bg-muted border border-border rounded-[10px] text-sm text-left flex items-center gap-2"
                  >
                    <span className="text-lg">{form.icon}</span>
                    <span className="text-muted-foreground flex-1">
                      Choisir un emoji
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute top-full mt-1 left-0 bg-surface border border-border rounded-xl shadow-lg z-10 p-3 w-full">
                      <div className="grid grid-cols-10 gap-1">
                        {EMOJI_PRESETS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              setForm((f) => ({ ...f, icon: emoji }));
                              setShowEmojiPicker(false);
                            }}
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-muted transition-colors",
                              form.icon === emoji &&
                                "bg-primary/10 ring-1 ring-primary/30",
                            )}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t border-border">
                        <input
                          type="text"
                          value={form.icon}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, icon: e.target.value }))
                          }
                          placeholder="Ou tapez un emoji..."
                          className="w-full h-8 px-3 bg-muted border border-border rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nom *
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Ex: Premier pas"
                  className="w-full h-10 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Description */}
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
                  placeholder="Description du badge..."
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              {/* Category + Rarity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Categorie
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        category: e.target.value as BadgeCategory,
                      }))
                    }
                    className="w-full h-10 px-3 bg-muted border border-border rounded-[10px] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Rarete
                  </label>
                  <select
                    value={form.rarity}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        rarity: e.target.value as BadgeRarity,
                      }))
                    }
                    className="w-full h-10 px-3 bg-muted border border-border rounded-[10px] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {RARITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* XP Reward */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Recompense XP *
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.xp_reward}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      xp_reward: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full h-10 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Unlock condition */}
              <div className="bg-muted/50 border border-border rounded-xl p-3 space-y-2">
                <p className="text-xs font-medium text-foreground">
                  Condition de deblocage
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={form.condition_action}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        condition_action: e.target.value,
                      }))
                    }
                    className="h-9 px-3 bg-surface border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Aucune (manuel)</option>
                    {CONDITION_ACTIONS.map((action) => (
                      <option key={action.value} value={action.value}>
                        {action.label}
                      </option>
                    ))}
                  </select>
                  {form.condition_action && (
                    <input
                      type="number"
                      min={1}
                      value={form.condition_count}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          condition_count: parseInt(e.target.value) || 1,
                        }))
                      }
                      placeholder="Seuil"
                      className="h-9 px-3 bg-surface border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  )}
                </div>
                {form.condition_action && (
                  <p className="text-[10px] text-muted-foreground">
                    Le badge sera debloque quand l&apos;utilisateur atteindra{" "}
                    {form.condition_count}{" "}
                    {CONDITION_ACTIONS.find(
                      (a) => a.value === form.condition_action,
                    )?.label.toLowerCase() ?? form.condition_action}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="h-9 px-4 rounded-[10px] border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  !form.name.trim() ||
                  form.xp_reward <= 0 ||
                  createBadge.isPending ||
                  updateBadge.isPending
                }
                className="h-9 px-4 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
              >
                {(createBadge.isPending || updateBadge.isPending) && (
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

// ─── Badge earners sub-panel ────────────────────────────
function BadgeEarnersPanel({
  badgeId,
  badgeName,
  onClose,
}: {
  badgeId: string;
  badgeName: string;
  onClose: () => void;
}) {
  const { data: earners, isLoading } = useBadgeEarners(badgeId);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={defaultTransition}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          Detenteurs de &laquo; {badgeName} &raquo; ({earners?.length ?? 0})
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="h-16 bg-muted animate-pulse rounded-xl" />
      ) : !earners || earners.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-6 text-center">
          <Users className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            Personne n&apos;a encore obtenu ce badge
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl divide-y divide-border max-h-64 overflow-y-auto">
          {earners.map((earner) => (
            <div
              key={earner.id}
              className="flex items-center gap-3 px-4 py-2.5"
            >
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-foreground shrink-0">
                {earner.profile?.avatar_url ? (
                  <img
                    src={earner.profile.avatar_url}
                    alt={earner.profile.full_name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  (earner.profile?.full_name?.charAt(0)?.toUpperCase() ?? "?")
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {earner.profile?.full_name ?? "Utilisateur"}
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {new Date(earner.earned_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
