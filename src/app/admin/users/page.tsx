"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Users,
  Search,
  UserMinus,
  UserCog,
  Archive,
  RotateCcw,
  Shield,
  Loader2,
  ChevronDown,
  CheckSquare,
  UserX,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials, formatDate } from "@/lib/utils";
import { useUserManagement } from "@/hooks/use-user-management";
import { UserOffboardingModal } from "@/components/admin/user-offboarding-modal";
import { OffboardingWizard } from "@/components/settings/offboarding-wizard";
import { ROLE_OPTIONS } from "@/types/invitations";
import type { Profile } from "@/types/database";
import { motion } from "framer-motion";
import { fadeInUp, defaultTransition } from "@/lib/animations";
import { CSVImportModal } from "@/components/shared/CSVImportModal";
import type { CSVColumn } from "@/components/shared/CSVImportModal";

type UserFilter = "all" | "active" | "archived";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<UserFilter>("active");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [offboardingUser, setOffboardingUser] = useState<
    (Profile & { is_archived?: boolean }) | null
  >(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [showOffboardingWizard, setShowOffboardingWizard] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);

  const { users, isLoading, error: usersError, changeUserRole, archiveUser, restoreUser } =
    useUserManagement();

  const filtered = useMemo(() => {
    let result = users;

    // Status filter
    if (statusFilter === "active") {
      result = result.filter((u) => !u.is_archived);
    } else if (statusFilter === "archived") {
      result = result.filter((u) => u.is_archived);
    }

    // Role filter
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.full_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }

    return result;
  }, [users, search, roleFilter, statusFilter]);

  const counts = useMemo(
    () => ({
      all: users.length,
      active: users.filter((u) => !u.is_archived).length,
      archived: users.filter((u) => u.is_archived).length,
    }),
    [users],
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((u) => u.id)));
    }
  }, [filtered, selectedIds.size]);

  const handleBulkArchive = async () => {
    if (!confirm(`Archiver ${selectedIds.size} utilisateur(s) ?`)) return;
    for (const id of selectedIds) {
      await archiveUser.mutateAsync(id);
    }
    setSelectedIds(new Set());
  };

  const handleBulkRestore = async () => {
    for (const id of selectedIds) {
      await restoreUser.mutateAsync(id);
    }
    setSelectedIds(new Set());
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    changeUserRole.mutate(
      { userId, newRole },
      {
        onSuccess: () => setEditingRoleId(null),
      },
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={defaultTransition}
      className="p-6 max-w-6xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Gestion utilisateurs
            </h1>
            <p className="text-sm text-muted-foreground">
              {counts.active} actif(s), {counts.archived} archive(s)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCsvImport(true)}
            className="h-10 px-4 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-all active:scale-[0.98] flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Importer CSV
          </button>
          <button
            onClick={() => setShowOffboardingWizard(true)}
            className="h-10 px-4 rounded-xl bg-[#DC2626] text-white text-sm font-medium hover:bg-[#DC2626]/90 transition-all active:scale-[0.98] flex items-center gap-2"
          >
            <UserX className="w-4 h-4" />
            Offboarding
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
          />
        </div>

        <div className="flex gap-2">
          {/* Status filter */}
          {(["active", "archived", "all"] as UserFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setSelectedIds(new Set());
              }}
              className={cn(
                "h-10 px-3 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
                statusFilter === s
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {s === "active"
                ? `Actifs (${counts.active})`
                : s === "archived"
                  ? `Archives (${counts.archived})`
                  : `Tous (${counts.all})`}
            </button>
          ))}

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">Tous les roles</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
          <CheckSquare className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {selectedIds.size} selectionne(s)
          </span>
          <div className="flex gap-2 ml-auto">
            {statusFilter !== "archived" && (
              <button
                onClick={handleBulkArchive}
                disabled={archiveUser.isPending}
                className="h-8 px-3 rounded-lg text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
              >
                {archiveUser.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Archive className="w-3.5 h-3.5" />
                )}
                Archiver
              </button>
            )}
            {statusFilter === "archived" && (
              <button
                onClick={handleBulkRestore}
                disabled={restoreUser.isPending}
                className="h-8 px-3 rounded-lg text-xs font-medium text-emerald-500 hover:bg-emerald-500/10 transition-colors flex items-center gap-1.5"
              >
                {restoreUser.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5" />
                )}
                Restaurer
              </button>
            )}
            <button
              onClick={() => setSelectedIds(new Set())}
              className="h-8 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {usersError ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Impossible de charger les utilisateurs. Veuillez reessayer.
          </p>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Chargement...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Aucun utilisateur trouve
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.size === filtered.length &&
                        filtered.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                    />
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Utilisateur
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Role
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                    Inscription
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">
                    Dernière connexion
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Statut
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isSelected = selectedIds.has(u.id);
                  const isArchived = u.is_archived;

                  return (
                    <tr
                      key={u.id}
                      className={cn(
                        "border-b border-border last:border-0 hover:bg-muted/30 transition-colors",
                        isSelected && "bg-primary/5",
                        isArchived && "opacity-60",
                      )}
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(u.id)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <Image
                              src={u.avatar_url}
                              alt={u.full_name}
                              width={36}
                              height={36}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-semibold">
                              {getInitials(u.full_name)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {u.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {editingRoleId === u.id ? (
                          <div className="flex items-center gap-1">
                            <select
                              defaultValue={u.role}
                              onChange={(e) =>
                                handleRoleChange(u.id, e.target.value)
                              }
                              className="h-8 px-2 bg-muted border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                              autoFocus
                              onBlur={() => setEditingRoleId(null)}
                            >
                              {ROLE_OPTIONS.map((r) => (
                                <option key={r.value} value={r.value}>
                                  {r.label}
                                </option>
                              ))}
                            </select>
                            {changeUserRole.isPending && (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingRoleId(u.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                            title="Cliquer pour changer le role"
                          >
                            {ROLE_OPTIONS.find((r) => r.value === u.role)
                              ?.label ?? u.role}
                            <ChevronDown className="w-3 h-3 text-muted-foreground" />
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                        {u.last_seen_at
                          ? formatDate(u.last_seen_at, "relative")
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {isArchived ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full text-red-500 bg-red-500/10">
                            <Archive className="w-3 h-3" />
                            Archive
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full text-emerald-500 bg-emerald-500/10">
                            Actif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {!isArchived ? (
                            <>
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Archiver ${u.full_name} ? L'utilisateur ne pourra plus se connecter.`,
                                    )
                                  ) {
                                    archiveUser.mutate(u.id);
                                  }
                                }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                                title="Archiver"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setOffboardingUser(u)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                title="Offboarding"
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => restoreUser.mutate(u.id)}
                              disabled={restoreUser.isPending}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                              title="Restaurer"
                            >
                              {restoreUser.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <RotateCcw className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Offboarding modal (quick, per-user) */}
      <UserOffboardingModal
        open={!!offboardingUser}
        onClose={() => setOffboardingUser(null)}
        user={offboardingUser}
      />

      {/* Offboarding wizard (full workflow with data transfer) */}
      <OffboardingWizard
        open={showOffboardingWizard}
        onClose={() => setShowOffboardingWizard(false)}
        users={users}
      />

      {/* CSV import modal */}
      <CSVImportModal
        open={showCsvImport}
        onClose={() => setShowCsvImport(false)}
        title="Importer des utilisateurs"
        description="Importez des utilisateurs depuis un fichier CSV"
        columns={[
          { key: "full_name", label: "Nom complet", required: true },
          { key: "email", label: "Email", required: true },
          { key: "role", label: "Role" },
          { key: "phone", label: "Telephone" },
        ]}
        onImport={async (rows) => {
          const res = await fetch("/api/admin/users/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ users: rows }),
          });
          const data = await res.json();
          return { success: data.success ?? 0, errors: data.errors ?? 0 };
        }}
        templateFilename="users-import-template"
      />
    </motion.div>
  );
}
