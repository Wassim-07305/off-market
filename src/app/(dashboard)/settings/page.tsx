"use client";

import { useState, useRef } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { profile, user } = useAuth();
  const supabase = useSupabase();
  const { theme, setTheme } = useTheme();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      className="max-w-2xl space-y-8"
    >
      <div>
        <h1
          className="text-3xl font-semibold text-foreground"
          style={{ fontFamily: "Instrument Serif, serif" }}
        >
          Reglages
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gere ton profil et tes preferences
        </p>
      </div>

      {/* Profile */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
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
            <p className="text-sm font-medium text-foreground">{profile?.email}</p>
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

      {/* Appearance */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
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
                  : "border-border hover:border-border/80"
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

      {/* Danger zone */}
      <div className="bg-surface border border-error/30 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-error" />
          <h2 className="text-sm font-semibold text-error">Zone dangereuse</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Ces actions sont irreversibles. Sois prudent.
        </p>
        <div className="flex gap-3">
          <button className="h-9 px-4 rounded-[10px] border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            Exporter mes donnees
          </button>
          <button className="h-9 px-4 rounded-[10px] border border-error/30 text-sm text-error hover:bg-error/5 transition-colors">
            Supprimer mon compte
          </button>
        </div>
      </div>
    </motion.div>
  );
}
