"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { staggerItem } from "@/lib/animations";
import {
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
} from "@/hooks/useAnnouncements";
import { useSupabase } from "@/hooks/use-supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn, formatDate } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Megaphone,
  Info,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";
import type { Announcement } from "@/types/database";

const TYPES = [
  { value: "info", label: "Info", icon: Info, color: "text-blue-500 bg-blue-500/10" },
  { value: "success", label: "Succes", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
  { value: "warning", label: "Attention", icon: AlertTriangle, color: "text-amber-500 bg-amber-500/10" },
  { value: "urgent", label: "Urgent", icon: Zap, color: "text-red-500 bg-red-500/10" },
  { value: "update", label: "Mise a jour", icon: Sparkles, color: "text-purple-500 bg-purple-500/10" },
] as const;

const ROLES = [
  { value: "admin", label: "Admins" },
  { value: "coach", label: "Coaches" },
  { value: "setter", label: "Setters" },
  { value: "closer", label: "Closers" },
  { value: "client", label: "Clients" },
  { value: "prospect", label: "Prospects" },
];

export default function AdminAnnouncementsPage() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<string>("info");
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  // Fetch ALL announcements (not just active)
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    },
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setType("info");
    setTargetRoles([]);
    setIsActive(true);
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setTitle(a.title);
    setContent(a.content);
    setType(a.type);
    setTargetRoles(a.target_roles ?? []);
    setIsActive(a.is_active);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    const payload = {
      title: title.trim(),
      content: content.trim(),
      type: type as Announcement["type"],
      target_roles: targetRoles.length > 0 ? targetRoles : null,
      is_active: isActive,
    };

    if (editing) {
      await updateAnnouncement.mutateAsync({ id: editing.id, ...payload });
    } else {
      await createAnnouncement.mutateAsync(payload as Omit<Announcement, "id" | "created_at" | "created_by">);
    }

    queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await deleteAnnouncement.mutateAsync(id);
    queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
    setDeleteConfirm(null);
  };

  const toggleRole = (role: string) => {
    setTargetRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const active = (announcements ?? []).filter((a) => a.is_active);
  const inactive = (announcements ?? []).filter((a) => !a.is_active);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <motion.div variants={staggerItem} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-primary" />
              Annonces
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Communiquez avec vos equipes et clients
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Nouvelle annonce
          </button>
        </div>
      </motion.div>

      {/* Create/Edit Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-border rounded-xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              {editing ? "Modifier l'annonce" : "Nouvelle annonce"}
            </h2>
            <button onClick={resetForm} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted">
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de l'annonce"
            className="w-full h-9 px-3 bg-muted/50 border border-border/30 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Contenu de l'annonce..."
            rows={4}
            className="w-full px-3 py-2 bg-muted/50 border border-border/30 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />

          {/* Type */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type</label>
            <div className="flex gap-1.5 flex-wrap">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={cn(
                    "h-7 px-2.5 rounded-md text-xs font-medium flex items-center gap-1 border transition-colors",
                    type === t.value ? cn(t.color, "border-current") : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  <t.icon className="w-3 h-3" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target roles */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Audience cible {targetRoles.length === 0 && <span className="text-muted-foreground/60">(tous si vide)</span>}
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => toggleRole(r.value)}
                  className={cn(
                    "h-7 px-2.5 rounded-md text-xs font-medium border transition-colors",
                    targetRoles.includes(r.value) ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Active</span>
            <button
              onClick={() => setIsActive(!isActive)}
              className={cn("relative w-10 h-5 rounded-full transition-colors", isActive ? "bg-primary" : "bg-muted")}
            >
              <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-surface shadow-sm transition-transform", isActive ? "translate-x-5" : "translate-x-0.5")} />
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/20">
            <button onClick={resetForm} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || createAnnouncement.isPending || updateAnnouncement.isPending}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {editing ? "Enregistrer" : "Publier"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Active announcements */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Actives ({active.length})</h2>
        {isLoading ? (
          <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}</div>
        ) : active.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <Megaphone className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucune annonce active</p>
          </div>
        ) : (
          active.map((a) => {
            const typeConf = TYPES.find((t) => t.value === a.type) ?? TYPES[0];
            return (
              <div key={a.id} className="bg-surface border border-border rounded-xl p-4 flex items-start gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", typeConf.color)}>
                  <typeConf.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{a.content}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-muted-foreground">{formatDate(a.created_at, "relative")}</span>
                    {a.target_roles?.length ? (
                      <div className="flex gap-1">
                        {a.target_roles.map((r) => (
                          <span key={r} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{r}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/60">Tous les roles</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(a)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {deleteConfirm === a.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(a.id)} className="px-2 py-1 text-[10px] font-medium bg-red-500 text-white rounded hover:bg-red-600">Supprimer</button>
                      <button onClick={() => setDeleteConfirm(null)} className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(a.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Inactive announcements */}
      {inactive.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Inactives ({inactive.length})</h2>
          {inactive.map((a) => {
            const typeConf = TYPES.find((t) => t.value === a.type) ?? TYPES[0];
            return (
              <div key={a.id} className="bg-surface border border-border rounded-xl p-4 flex items-start gap-3 opacity-50">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", typeConf.color)}>
                  <typeConf.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(a.created_at, "relative")}</p>
                </div>
                <button onClick={() => openEdit(a)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
