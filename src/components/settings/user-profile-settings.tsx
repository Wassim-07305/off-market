"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/hooks/use-supabase";
import { toast } from "sonner";
import {
  User,
  Save,
  Camera,
  Loader2,
  Download,
  Trash2,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Languages,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

const TIMEZONE_OPTIONS = [
  { value: "Europe/Paris", label: "Paris (UTC+1)" },
  { value: "Europe/London", label: "Londres (UTC+0)" },
  { value: "Europe/Berlin", label: "Berlin (UTC+1)" },
  { value: "Europe/Madrid", label: "Madrid (UTC+1)" },
  { value: "Europe/Rome", label: "Rome (UTC+1)" },
  { value: "Europe/Brussels", label: "Bruxelles (UTC+1)" },
  { value: "Europe/Zurich", label: "Zurich (UTC+1)" },
  { value: "America/New_York", label: "New York (UTC-5)" },
  { value: "America/Los_Angeles", label: "Los Angeles (UTC-8)" },
  { value: "America/Montreal", label: "Montreal (UTC-5)" },
  { value: "Africa/Casablanca", label: "Casablanca (UTC+0)" },
  { value: "Africa/Tunis", label: "Tunis (UTC+1)" },
  { value: "Asia/Dubai", label: "Dubai (UTC+4)" },
];

const LANGUAGE_OPTIONS = [
  { value: "fr", label: "Francais" },
  { value: "en", label: "English" },
];

export function UserProfileSettings() {
  const { profile, user, signOut } = useAuth();
  const supabase = useSupabase();

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [timezone, setTimezone] = useState(profile?.timezone ?? "Europe/Paris");
  const [language, setLanguage] = useState("fr");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Changement de mot de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Suppression de compte
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync quand le profile se charge
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setBio(profile.bio ?? "");
      setAvatarUrl(profile.avatar_url ?? "");
      setTimezone(profile.timezone ?? "Europe/Paris");
    }
  }, [profile]);

  // Charger la langue depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem("off-market-language");
    if (stored) setLanguage(stored);
  }, []);

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
      .update({ avatar_url: newUrl } as any)
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
      .update({ full_name: fullName, phone, bio, timezone } as any)
      .eq("id", user.id);

    // Sauvegarder la langue en local
    localStorage.setItem("off-market-language", language);

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

  return (
    <div className="space-y-6">
      {/* Profil */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Profil</h2>
        </div>

        {/* Avatar */}
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
              className="text-xs text-primary hover:text-primary-hover transition-colors mt-1 cursor-pointer"
            >
              Changer la photo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nom complet"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            label="Telephone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+33 6 00 00 00 00"
          />
        </div>

        <Textarea
          label="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Quelques mots sur toi..."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Fuseau horaire"
            options={TIMEZONE_OPTIONS}
            value={timezone}
            onChange={(val) => setTimezone(val)}
          />
          <Select
            label="Langue"
            options={LANGUAGE_OPTIONS}
            value={language}
            onChange={(val) => {
              setLanguage(val);
            }}
          />
        </div>

        <Button
          onClick={handleSave}
          loading={saving}
          icon={<Save className="w-4 h-4" />}
        >
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      {/* Securite */}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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

          <Button
            variant="secondary"
            onClick={handleChangePassword}
            disabled={changingPassword || !newPassword || !confirmPassword}
            loading={changingPassword}
            icon={<Lock className="w-3.5 h-3.5" />}
          >
            {changingPassword ? "Mise a jour..." : "Changer le mot de passe"}
          </Button>
        </div>
      </div>

      {/* Donnees & RGPD */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4 border-l-[3px] border-l-error"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-error" />
          <h2 className="text-sm font-semibold text-error">
            Donnees & confidentialite
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Conformement au RGPD, tu peux exporter ou supprimer tes donnees a tout
          moment.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={handleExportData}
            loading={exporting}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            {exporting ? "Export..." : "Telecharger mes donnees"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Supprimer mon compte
          </Button>
        </div>

        {/* Modal de confirmation */}
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
                Toutes tes donnees seront definitivement supprimees. Tape{" "}
                <span className="font-mono font-semibold text-error">
                  SUPPRIMER
                </span>{" "}
                pour confirmer.
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Tape SUPPRIMER"
                className="w-full h-10 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-error/30"
              />
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                  }}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmText !== "SUPPRIMER"}
                  loading={deleting}
                >
                  {deleting ? "Suppression..." : "Confirmer"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
