"use client";

import { useState } from "react";
import {
  Shield,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Users,
  Check,
  GraduationCap,
  Phone,
  Target,
  User,
  Star,
  Briefcase,
  Heart,
  Zap,
  Crown,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCustomRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "@/hooks/use-custom-roles";
import type { Module } from "@/lib/permissions";
import type { CustomRole } from "@/types/database";

// ─── Module definitions for the permission matrix ──────────

const ALL_MODULES: { slug: Module; label: string; category: string }[] = [
  { slug: "dashboard", label: "Dashboard", category: "General" },
  { slug: "messaging", label: "Messagerie", category: "General" },
  { slug: "notifications", label: "Notifications", category: "General" },
  { slug: "settings", label: "Reglages", category: "General" },
  { slug: "resources", label: "Ressources", category: "General" },
  { slug: "documentation", label: "Documentation", category: "General" },
  { slug: "clients", label: "Clients", category: "CRM" },
  { slug: "eleves", label: "Élèves", category: "CRM" },
  { slug: "pipeline", label: "Pipeline", category: "CRM" },
  { slug: "calendrier", label: "Calendrier", category: "CRM" },
  { slug: "closer-calls", label: "Appels closer", category: "CRM" },
  { slug: "contracts", label: "Contrats", category: "Ventes" },
  { slug: "finances", label: "Finances", category: "Ventes" },
  { slug: "billing", label: "Facturation", category: "Ventes" },
  { slug: "formations", label: "Formations", category: "Ecole" },
  { slug: "school", label: "Ecole", category: "Ecole" },
  { slug: "coaching", label: "Coaching", category: "Ecole" },
  { slug: "forms", label: "Formulaires", category: "Ecole" },
  { slug: "gamification", label: "Gamification", category: "Engagement" },
  { slug: "journal", label: "Journal", category: "Engagement" },
  { slug: "rituals", label: "Rituels", category: "Engagement" },
  { slug: "feed", label: "Fil d'actu", category: "Engagement" },
  { slug: "community", label: "Communaute", category: "Engagement" },
  { slug: "hall-of-fame", label: "Hall of Fame", category: "Engagement" },
  { slug: "activité", label: "Activite", category: "Engagement" },
  { slug: "social-content", label: "Contenu social", category: "Marketing" },
  { slug: "instagram", label: "Instagram", category: "Marketing" },
  { slug: "analytics", label: "Analytics", category: "Admin" },
  { slug: "users", label: "Utilisateurs", category: "Admin" },
  { slug: "invitations", label: "Invitations", category: "Admin" },
  { slug: "audit", label: "Audit", category: "Admin" },
  { slug: "assistant", label: "AlexIA", category: "Admin" },
  { slug: "roadmap", label: "Roadmap", category: "Admin" },
];

const MODULE_CATEGORIES = [...new Set(ALL_MODULES.map((m) => m.category))];

const ICON_OPTIONS = [
  { value: "Shield", component: Shield },
  { value: "ShieldCheck", component: ShieldCheck },
  { value: "GraduationCap", component: GraduationCap },
  { value: "Phone", component: Phone },
  { value: "Target", component: Target },
  { value: "User", component: User },
  { value: "Star", component: Star },
  { value: "Briefcase", component: Briefcase },
  { value: "Heart", component: Heart },
  { value: "Zap", component: Zap },
  { value: "Crown", component: Crown },
  { value: "Eye", component: Eye },
];

const COLOR_OPTIONS = [
  "#DC2626",
  "#2563EB",
  "#7C3AED",
  "#059669",
  "#F59E0B",
  "#EC4899",
  "#6B7280",
  "#0EA5E9",
  "#D97706",
  "#8B5CF6",
];

function getIconComponent(iconName: string) {
  const found = ICON_OPTIONS.find((i) => i.value === iconName);
  return found?.component ?? Shield;
}

// ─── Role Form Modal ───────────────────────────────────────

interface RoleFormModalProps {
  open: boolean;
  onClose: () => void;
  editRole?: CustomRole | null;
}

function RoleFormModal({ open, onClose, editRole }: RoleFormModalProps) {
  const isEdit = !!editRole;
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const [name, setName] = useState(editRole?.name ?? "");
  const [description, setDescription] = useState(editRole?.description ?? "");
  const [color, setColor] = useState(editRole?.color ?? "#DC2626");
  const [icon, setIcon] = useState(editRole?.icon ?? "Shield");
  const [permissions, setPermissions] = useState<string[]>(
    editRole?.permissions ?? [],
  );

  if (!open) return null;

  const togglePermission = (slug: string) => {
    setPermissions((prev) =>
      prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug],
    );
  };

  const toggleCategory = (category: string) => {
    const categorySlugs = ALL_MODULES.filter(
      (m) => m.category === category,
    ).map((m) => m.slug);
    const allSelected = categorySlugs.every((s) => permissions.includes(s));
    if (allSelected) {
      setPermissions((prev) =>
        prev.filter((p) => !categorySlugs.includes(p as Module)),
      );
    } else {
      setPermissions((prev) => [
        ...prev,
        ...categorySlugs.filter((s) => !prev.includes(s)),
      ]);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    if (isEdit && editRole) {
      updateRole.mutate(
        {
          id: editRole.id,
          name,
          description: description || null,
          color,
          icon,
          permissions: permissions as unknown as string[],
        },
        { onSuccess: () => onClose() },
      );
    } else {
      createRole.mutate(
        {
          name,
          description: description || null,
          color,
          icon,
          permissions: permissions as unknown as string[],
          is_active: true,
        },
        { onSuccess: () => onClose() },
      );
    }
  };

  const isPending = createRole.isPending || updateRole.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              {(() => {
                const IconComp = getIconComponent(icon);
                return <IconComp className="w-5 h-5" style={{ color }} />;
              })()}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {isEdit ? "Modifier le role" : "Creer un role"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Definis les permissions d'acces
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Name & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Nom du role *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Manager"
                disabled={isEdit && editRole?.is_system}
                className="w-full h-10 px-4 bg-muted/50 border-0 rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Description
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Acces etendu..."
                className="w-full h-10 px-4 bg-muted/50 border-0 rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Couleur
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center",
                    color === c
                      ? "border-foreground scale-110"
                      : "border-transparent hover:scale-105",
                  )}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Icone
            </label>
            <div className="flex gap-2 flex-wrap">
              {ICON_OPTIONS.map((opt) => {
                const IconComp = opt.component;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setIcon(opt.value)}
                    className={cn(
                      "w-10 h-10 rounded-xl border flex items-center justify-center transition-all",
                      icon === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <IconComp className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Permission matrix */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Permissions ({permissions.length}/{ALL_MODULES.length} modules)
            </label>
            <div className="space-y-4">
              {MODULE_CATEGORIES.map((category) => {
                const categoryModules = ALL_MODULES.filter(
                  (m) => m.category === category,
                );
                const allSelected = categoryModules.every((m) =>
                  permissions.includes(m.slug),
                );
                const someSelected =
                  !allSelected &&
                  categoryModules.some((m) => permissions.includes(m.slug));

                return (
                  <div
                    key={category}
                    className="border border-border rounded-xl p-3"
                  >
                    <button
                      onClick={() => toggleCategory(category)}
                      className="flex items-center gap-2 mb-2 w-full text-left"
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                          allSelected
                            ? "bg-primary border-primary"
                            : someSelected
                              ? "bg-primary/50 border-primary"
                              : "border-border",
                        )}
                      >
                        {(allSelected || someSelected) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        {category}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {
                          categoryModules.filter((m) =>
                            permissions.includes(m.slug),
                          ).length
                        }
                        /{categoryModules.length}
                      </span>
                    </button>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                      {categoryModules.map((mod) => {
                        const selected = permissions.includes(mod.slug);
                        return (
                          <button
                            key={mod.slug}
                            onClick={() => togglePermission(mod.slug)}
                            className={cn(
                              "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                              selected
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                            )}
                          >
                            <div
                              className={cn(
                                "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0",
                                selected
                                  ? "bg-primary border-primary"
                                  : "border-border",
                              )}
                            >
                              {selected && (
                                <Check className="w-2.5 h-2.5 text-white" />
                              )}
                            </div>
                            {mod.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0 border-t border-border mt-0 pt-4!">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-[10px] border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || isPending}
            className="flex-1 h-10 rounded-[10px] bg-[#DC2626] text-white text-sm font-medium hover:bg-[#DC2626]/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? "Mettre a jour" : "Creer le role"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Role Manager Component ────────────────────────────────

export function RoleManager() {
  const { data: roles, isLoading } = useCustomRoles();
  const deleteRole = useDeleteRole();
  const [showForm, setShowForm] = useState(false);
  const [editRole, setEditRole] = useState<CustomRole | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleEdit = (role: CustomRole) => {
    setEditRole(role);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditRole(null);
  };

  const handleDelete = (roleId: string) => {
    deleteRole.mutate(roleId, {
      onSuccess: () => setDeleteConfirm(null),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Gestion des roles
            </h2>
            <p className="text-sm text-muted-foreground">
              Cree et gere les roles personnalises avec des permissions
              granulaires
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditRole(null);
            setShowForm(true);
          }}
          className="h-10 px-4 rounded-xl bg-[#DC2626] text-white text-sm font-medium hover:bg-[#DC2626]/90 transition-all active:scale-[0.98] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Creer un role
        </button>
      </div>

      {/* Roles grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Chargement...
        </div>
      ) : !roles || roles.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <Shield className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Aucun role personnalise
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => {
            const IconComp = getIconComponent(role.icon);
            return (
              <div
                key={role.id}
                className="bg-surface border border-border rounded-xl p-4 space-y-3 hover:shadow-sm transition-shadow"
              >
                {/* Role header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${role.color}20` }}
                    >
                      <IconComp
                        className="w-5 h-5"
                        style={{ color: role.color }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">
                          {role.name}
                        </h3>
                        {role.is_system && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                            Systeme
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {role.description || "Pas de description"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Permissions count */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    {role.permissions.length} module
                    {role.permissions.length > 1 ? "s" : ""}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {role.user_count ?? 0} utilisateur
                    {(role.user_count ?? 0) > 1 ? "s" : ""}
                  </div>
                </div>

                {/* Permission tags */}
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 5).map((p: string) => (
                    <span
                      key={p}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                    >
                      {ALL_MODULES.find((m) => m.slug === p)?.label ?? p}
                    </span>
                  ))}
                  {role.permissions.length > 5 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      +{role.permissions.length - 5}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1 border-t border-border">
                  <button
                    onClick={() => handleEdit(role)}
                    className="flex-1 h-8 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Modifier
                  </button>
                  {!role.is_system && (
                    <>
                      {deleteConfirm === role.id ? (
                        <div className="flex gap-1 flex-1">
                          <button
                            onClick={() => handleDelete(role.id)}
                            disabled={deleteRole.isPending}
                            className="flex-1 h-8 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                          >
                            {deleteRole.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Oui"
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1 h-8 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            Non
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(role.id)}
                          className="flex-1 h-8 rounded-lg text-xs font-medium text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Supprimer
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      <RoleFormModal
        open={showForm}
        onClose={handleCloseForm}
        editRole={editRole}
      />
    </div>
  );
}
