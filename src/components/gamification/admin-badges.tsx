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

const RARITY_BORDER_COLORS: Record<BadgeRarity, string> = {
  common: "border-gray-300 dark:border-gray-600",
  uncommon: "border-emerald-400 dark:border-emerald-500",
  rare: "border-blue-400 dark:border-blue-500",
  epic: "border-purple-400 dark:border-purple-500",
  legendary: "border-amber-400 dark:border-amber-500",
};

const RARITY_BG_TINTS: Record<BadgeRarity, string> = {
  common: "bg-gray-50 dark:bg-gray-500/5",
  uncommon: "bg-emerald-50/50 dark:bg-emerald-500/5",
  rare: "bg-blue-50/50 dark:bg-blue-500/5",
  epic: "bg-purple-50/50 dark:bg-purple-500/5",
  legendary: "bg-amber-50/50 dark:bg-amber-500/5",
};

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
  icon: "\u{1F3C6}",
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
  "\u{1F3C6}",
  "\u{1F947}",
  "\u{1F948}",
  "\u{1F949}",
  "\u2B50",
  "\u{1F31F}",
  "\u{1F48E}",
  "\u{1F525}",
  "\u26A1",
  "\u{1F680}",
  "\u{1F3AF}",
  "\u{1F4AA}",
  "\u{1F9E0}",
  "\u{1F4DA}",
  "\u{1F4B0}",
  "\u{1F91D}",
  "\u{1F393}",
  "\u{1F451}",
  "\u{1F981}",
  "\u{1F409}",
  "\u{1F308}",
  "\u{1F4AB}",
  "\u{1F396}\uFE0F",
  "\u{1F3C5}",
  "\u2728",
  "\u{1F52E}",
  "\u{1F3AA}",
  "\u{1F3A8}",
  "\u{1F3B8}",
  "\u{1F984}",
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
      icon: badge.icon ?? "\u{1F3C6}",
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Badges ({badges.length})
          </h2>
          <button
            onClick={openCreate}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#AF0000] to-[#DC2626] text-white text-xs font-medium hover:shadow-lg hover:shadow-[#AF0000]/25 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouveau badge
          </button>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterCategory("all")}
            className={cn(
              "h-7 px-2.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all",
              filterCategory === "all"
                ? "bg-gradient-to-r from-[#AF0000] to-[#DC2626] text-white"
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
                  ? "bg-gradient-to-r from-[#AF0000] to-[#DC2626] text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {CATEGORY_CONFIG[cat.value].emoji} {cat.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-muted animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : filteredBadges.length === 0 ? (
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 border border-dashed border-border rounded-2xl p-8 text-center">
            <Award className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {filterCategory === "all"
                ? "Aucun badge cree"
                : "Aucun badge dans cette categorie"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredBadges.map((badge) => {
              const rarityConfig = RARITY_CONFIG[badge.rarity];
              const categoryConfig = CATEGORY_CONFIG[badge.category];
              const condition = badge.condition as {
                action?: string;
                count?: number;
              };
              const borderColor = RARITY_BORDER_COLORS[badge.rarity];
              const bgTint = RARITY_BG_TINTS[badge.rarity];

              return (
                <div
                  key={badge.id}
                  className={cn(
                    "rounded-2xl border-2 p-4 transition-all hover:shadow-md hover:-translate-y-px duration-200",
                    borderColor,
                    bgTint,
                    !badge.is_active && "opacity-50",
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Large Icon */}
                    <div className="w-12 h-12 rounded-xl bg-surface dark:bg-surface/10 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                      {badge.icon ?? "\u{1F3C6}"}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {badge.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
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
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs font-medium text-[#AF0000] flex items-center gap-0.5 bg-[#AF0000]/10 px-1.5 py-0.5 rounded-full">
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
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 justify-end">
                    <button
                      onClick={() =>
                        setViewEarnersId(
                          viewEarnersId === badge.id ? null : badge.id,
                        )
                      }
                      className={cn(
                        "p-2 rounded-lg hover:bg-surface/50 dark:hover:bg-surface/10 transition-colors",
                        viewEarnersId === badge.id
                          ? "text-[#AF0000] bg-[#AF0000]/10"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      title="Voir qui a obtenu ce badge"
                    >
                      <Users className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEdit(badge)}
                      className="p-2 rounded-lg hover:bg-surface/50 dark:hover:bg-surface/10 transition-colors text-muted-foreground hover:text-foreground"
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
                      className="p-2 rounded-lg hover:bg-surface/50 dark:hover:bg-surface/10 transition-colors"
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
            className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full mx-4 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
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
                    className="w-full h-10 px-4 bg-muted border border-border rounded-xl text-sm text-left flex items-center gap-2 focus:ring-2 focus:ring-[#AF0000]/20 focus:outline-none"
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
                                "bg-[#AF0000]/10 ring-1 ring-[#AF0000]/30",
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
                  className="w-full h-10 px-4 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#AF0000]/20"
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
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#AF0000]/20 resize-none"
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
                    className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#AF0000]/20"
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
                    className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#AF0000]/20"
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
                  className="w-full h-10 px-4 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#AF0000]/20"
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
                    className="h-9 px-3 bg-surface border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-[#AF0000]/20"
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
                      className="h-9 px-3 bg-surface border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-[#AF0000]/20"
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
                className="h-9 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
                className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#AF0000] to-[#DC2626] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#AF0000]/25 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
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

// Badge earners sub-panel
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
      className="bg-gradient-to-br from-blue-500/5 to-blue-500/[0.02] rounded-2xl p-5 border border-blue-500/10"
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
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors"
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
