"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/hooks/use-supabase";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { fadeInUp, defaultTransition } from "@/lib/animations";
import { getInitials } from "@/lib/utils";
import {
  User,
  Palette,
  Shield,
  Save,
  Sun,
  Moon,
  Monitor,
  Camera,
  Loader2,
  Download,
  Trash2,
  AlertTriangle,
  Calendar,
  Unlink,
  ExternalLink,
  Bell,
  BellRing,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGoogleCalendarStatus,
  useDisconnectGoogleCalendar,
} from "@/hooks/use-google-calendar";
import { usePreferences, useUpdatePreferences } from "@/hooks/use-preferences";
import { usePushNotifications } from "@/hooks/use-push-notifications";

const NOTIFICATION_TOGGLES = [
  {
    key: "notify_messages",
    label: "Messages",
    description: "Nouveaux messages et mentions",
  },
  {
    key: "notify_feed",
    label: "Communaute",
    description: "Activite sur le fil d'actualite",
  },
  {
    key: "notify_calls",
    label: "Appels",
    description: "Rappels et confirmations d'appels",
  },
  {
    key: "notify_badges",
    label: "Badges & XP",
    description: "Badges debloques et niveaux atteints",
  },
  {
    key: "notify_checkins",
    label: "Check-ins",
    description: "Check-ins hebdomadaires soumis",
  },
  {
    key: "notify_goals",
    label: "Objectifs",
    description: "Nouveaux objectifs assignes",
  },
  {
    key: "notify_forms",
    label: "Formulaires",
    description: "Nouvelles reponses aux formulaires",
  },
  {
    key: "notify_reports",
    label: "Signalements",
    description: "Signalements de contenu",
  },
  {
    key: "notify_certificates",
    label: "Certificats",
    description: "Certificats obtenus",
  },
] as const;

const DIGEST_OPTIONS = [
  { value: "none", label: "Aucun" },
  { value: "daily", label: "Quotidien" },
  { value: "weekly", label: "Hebdomadaire" },
] as const;

export default function SettingsPage() {
  const { profile, user, signOut } = useAuth();
  const supabase = useSupabase();
  const { theme, setTheme } = useTheme();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const googleStatus = useGoogleCalendarStatus();
  const disconnectGoogle = useDisconnectGoogleCalendar();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Preferences
  const { data: preferences } = usePreferences();
  const updatePreferences = useUpdatePreferences();
  const push = usePushNotifications();

  // Toast on Google Calendar OAuth callback redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleParam = params.get("google");
    if (googleParam === "success") {
      toast.success("Google Agenda connecte avec succes");
      window.history.replaceState({}, "", window.location.pathname);
      googleStatus.refetch();
    } else if (googleParam === "error") {
      toast.error("Erreur lors de la connexion a Google Agenda");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Sync state when profile loads (useState initial value only runs once)
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setBio(profile.bio ?? "");
      setAvatarUrl(profile.avatar_url ?? "");
    }
  }, [profile]);

  const initials = fullName ? getInitials(fullName) : "U";

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Seules les images sont acceptees");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image ne doit pas depasser 2 Mo");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Erreur lors de l'upload");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const newUrl = data.publicUrl + "?t=" + Date.now();

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: newUrl })
      .eq("id", user.id);

    setUploading(false);
    if (updateError) {
      toast.error("Erreur lors de la mise a jour");
    } else {
      setAvatarUrl(newUrl);
      toast.success("Photo de profil mise a jour");
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, bio })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error("Erreur lors de la sauvegarde");
    else toast.success("Profil mis a jour");
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Remplis tous les champs");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Le mot de passe doit faire au moins 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setChangingPassword(true);
    try {
      // Verify current password by re-authenticating
      if (currentPassword) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: profile?.email ?? "",
          password: currentPassword,
        });
        if (signInErr) {
          toast.error("Mot de passe actuel incorrect");
          setChangingPassword(false);
          return;
        }
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      toast.success("Mot de passe mis a jour");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Erreur lors du changement de mot de passe");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleToggleNotification = (key: string, value: boolean) => {
    updatePreferences.mutate(
      { [key]: value },
      { onError: () => toast.error("Erreur lors de la mise a jour") },
    );
  };

  const handleDigestChange = (value: string) => {
    updatePreferences.mutate(
      { email_digest: value as "none" | "daily" | "weekly" },
      { onError: () => toast.error("Erreur lors de la mise a jour") },
    );
  };

  const handleMarketingToggle = (value: boolean) => {
    updatePreferences.mutate(
      { email_marketing: value },
      { onError: () => toast.error("Erreur lors de la mise a jour") },
    );
  };

  const handleExportData = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const [profileRes, messagesRes, checkinsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("messages")
          .select("content, created_at")
          .eq("sender_id", user.id)
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("weekly_checkins")
          .select("*")
          .eq("client_id", user.id)
          .order("week_start", { ascending: false }),
      ]);
      const exportData = {
        exported_at: new Date().toISOString(),
        profile: profileRes.data,
        messages: messagesRes.data ?? [],
        checkins: checkinsRes.data ?? [],
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `off-market-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Donnees exportees");
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      await signOut();
      toast.success("Compte supprime");
    } catch {
      toast.error("Erreur lors de la suppression");
      setDeleting(false);
    }
  };

  const themes = [
    { value: "light", label: "Clair", icon: Sun },
    { value: "dark", label: "Sombre", icon: Moon },
    { value: "system", label: "Systeme", icon: Monitor },
  ] as const;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={defaultTransition}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          Reglages
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gere ton profil et tes preferences
        </p>
      </div>

      {/* Profile */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Profil</h2>
        </div>

        {/* Avatar with upload */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl text-primary font-semibold">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {profile?.email}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {profile?.role}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-primary hover:text-primary-hover transition-colors mt-1"
            >
              Changer la photo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nom complet
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-10 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Telephone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+33 6 00 00 00 00"
              className="w-full h-10 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Quelques mots sur toi..."
            className="w-full px-4 py-3 bg-muted border border-border rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="h-10 px-4 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </div>

      {/* Notifications */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Notifications
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Choisis les notifications que tu souhaites recevoir.
        </p>

        <div className="space-y-1">
          {NOTIFICATION_TOGGLES.map((item) => {
            const checked = preferences
              ? (preferences[item.key as keyof typeof preferences] as boolean)
              : true;
            return (
              <label
                key={item.key}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={checked}
                  onClick={() => handleToggleNotification(item.key, !checked)}
                  className={cn(
                    "relative w-10 h-6 rounded-full transition-colors shrink-0",
                    checked ? "bg-primary" : "bg-muted-foreground/30",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm",
                      checked && "translate-x-4",
                    )}
                  />
                </button>
              </label>
            );
          })}
        </div>

        {/* Push notifications */}
        {push.isSupported && (
          <div className="border-t border-border pt-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BellRing className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Notifications push
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {push.permission === "denied"
                      ? "Bloquees dans les parametres du navigateur"
                      : "Recois des alertes meme quand le site est ferme"}
                  </p>
                </div>
              </div>
              <button
                role="switch"
                aria-checked={push.isSubscribed}
                onClick={push.toggle}
                disabled={push.isLoading || push.permission === "denied"}
                className={cn(
                  "relative w-10 h-6 rounded-full transition-colors shrink-0",
                  push.isSubscribed ? "bg-primary" : "bg-muted-foreground/30",
                  (push.isLoading || push.permission === "denied") && "opacity-50 cursor-not-allowed",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm",
                    push.isSubscribed && "translate-x-4",
                  )}
                />
              </button>
            </label>
          </div>
        )}
      </div>

      {/* Appearance */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Apparence</h2>
        </div>

        <div className="flex gap-3">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                "flex-1 h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all",
                theme === t.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border/80",
              )}
            >
              <t.icon className="w-5 h-5 text-foreground" />
              <span className="text-xs font-medium text-foreground">
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Security */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Securite</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                type={showCurrentPwd ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-4 pr-10 bg-muted border border-border rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCurrentPwd ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNewPwd ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 caracteres"
                  className="w-full h-10 px-4 pr-10 bg-muted border border-border rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd(!showNewPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPwd ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Confirmer
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmer le mot de passe"
                className="w-full h-10 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {newPassword &&
            confirmPassword &&
            newPassword !== confirmPassword && (
              <p className="text-xs text-error">
                Les mots de passe ne correspondent pas
              </p>
            )}

          <button
            onClick={handleChangePassword}
            disabled={changingPassword || !newPassword || !confirmPassword}
            className="h-9 px-4 rounded-[10px] bg-foreground text-background text-sm font-medium hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
          >
            {changingPassword ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
            {changingPassword ? "Mise a jour..." : "Changer le mot de passe"}
          </button>
        </div>
      </div>

      {/* Email preferences */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Preferences email
          </h2>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-2">
            Resume par email
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Recois un resume de ton activite par email.
          </p>
          <div className="flex gap-2">
            {DIGEST_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleDigestChange(opt.value)}
                className={cn(
                  "h-9 px-4 rounded-xl text-xs font-medium transition-all",
                  preferences?.email_digest === opt.value
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-foreground">
                Emails marketing
              </p>
              <p className="text-xs text-muted-foreground">
                Nouveautes, conseils et offres speciales
              </p>
            </div>
            <button
              role="switch"
              aria-checked={preferences?.email_marketing ?? true}
              onClick={() =>
                handleMarketingToggle(!(preferences?.email_marketing ?? true))
              }
              className={cn(
                "relative w-10 h-6 rounded-full transition-colors shrink-0",
                (preferences?.email_marketing ?? true)
                  ? "bg-primary"
                  : "bg-muted-foreground/30",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm",
                  (preferences?.email_marketing ?? true) && "translate-x-4",
                )}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Google Agenda */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Google Agenda
          </h2>
        </div>

        {googleStatus.data?.connected ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Connecte</p>
                <p className="text-xs text-muted-foreground">
                  {googleStatus.data.google_email}
                </p>
              </div>
            </div>
            <button
              onClick={() => disconnectGoogle.mutate()}
              disabled={disconnectGoogle.isPending}
              className="h-9 px-4 rounded-[10px] border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2"
            >
              {disconnectGoogle.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Unlink className="w-3.5 h-3.5" />
              )}
              Deconnecter
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Connecte ton agenda Google pour voir tes evenements dans la page
              Appels.
            </p>
            <a
              href="/api/google-calendar/connect"
              className="h-9 px-4 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center gap-2 shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Connecter
            </a>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4 border-l-[3px] border-l-error"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-error" />
          <h2 className="text-sm font-semibold text-error">Zone dangereuse</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Ces actions sont irreversibles. Sois prudent.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="h-9 px-4 rounded-[10px] border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2"
          >
            {exporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {exporting ? "Export..." : "Exporter mes donnees"}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="h-9 px-4 rounded-[10px] border border-error/30 text-sm text-error hover:bg-error/5 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Supprimer mon compte
          </button>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-error" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Supprimer le compte
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Cette action est irreversible
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Toutes tes donnees seront definitivement supprimees. Es-tu sur ?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-9 px-4 rounded-[10px] border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="h-9 px-4 rounded-[10px] bg-error text-white text-sm font-medium hover:bg-error/90 transition-colors flex items-center gap-2"
                >
                  {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {deleting ? "Suppression..." : "Confirmer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
