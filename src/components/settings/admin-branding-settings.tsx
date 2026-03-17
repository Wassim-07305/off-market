"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/hooks/use-supabase";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Save,
  Sun,
  Moon,
  Monitor,
  Camera,
  Loader2,
  Building2,
  Palette,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BrandingSettings {
  org_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  theme_mode: "light" | "dark" | "system";
}

const DEFAULT_SETTINGS: BrandingSettings = {
  org_name: "Off-Market",
  logo_url: null,
  primary_color: "#dc2626",
  secondary_color: "#1e293b",
  theme_mode: "system",
};

export function AdminBrandingSettings() {
  const { user, isAdmin } = useAuth();
  const supabase = useSupabase();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<BrandingSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Charger les settings depuis app_settings (ou localStorage pour l'instant)
  useEffect(() => {
    const stored = localStorage.getItem("off-market-branding");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as BrandingSettings;
        setSettings(parsed);
      } catch {
        // Ignorer les erreurs de parsing
      }
    }
    setLoaded(true);
  }, []);

  // Synchroniser le theme avec next-themes
  useEffect(() => {
    if (loaded && theme) {
      setSettings((prev) => ({
        ...prev,
        theme_mode: theme as BrandingSettings["theme_mode"],
      }));
    }
  }, [theme, loaded]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const filePath = `branding/logo.${ext}`;

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

    setSettings((prev) => ({ ...prev, logo_url: newUrl }));
    setUploading(false);
    toast.success("Logo mis a jour");
  };

  const handleRemoveLogo = () => {
    setSettings((prev) => ({ ...prev, logo_url: null }));
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
    setSettings((prev) => ({
      ...prev,
      theme_mode: value as BrandingSettings["theme_mode"],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Sauvegarde locale pour l'instant (remplacer par app_settings table plus tard)
      localStorage.setItem("off-market-branding", JSON.stringify(settings));
      toast.success("Parametres de branding sauvegardes");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const themes = [
    { value: "light", label: "Clair", icon: Sun },
    { value: "dark", label: "Sombre", icon: Moon },
    { value: "system", label: "Systeme", icon: Monitor },
  ] as const;

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      {/* Nom de l'organisation */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Organisation
          </h2>
        </div>

        <Input
          label="Nom de l'organisation"
          value={settings.org_name}
          onChange={(e) =>
            setSettings((prev) => ({ ...prev, org_name: e.target.value }))
          }
          placeholder="Nom de ton entreprise"
        />
      </div>

      {/* Logo */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Camera className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Logo</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Le logo apparaitra dans le header, les emails et les PDFs.
        </p>

        <div className="flex items-center gap-4">
          {settings.logo_url ? (
            <div className="relative group">
              <img
                src={settings.logo_url}
                alt="Logo"
                className="w-20 h-20 rounded-xl object-contain border border-border bg-surface p-2"
              />
              <button
                onClick={handleRemoveLogo}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-error text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div className="space-y-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              loading={uploading}
              icon={<Camera className="w-3.5 h-3.5" />}
            >
              {uploading ? "Upload..." : "Choisir un logo"}
            </Button>
            <p className="text-xs text-muted-foreground">
              PNG, JPG ou SVG. Max 2 Mo.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Couleurs */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Couleurs</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Couleur primaire
            </label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      primary_color: e.target.value,
                    }))
                  }
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                />
              </div>
              <Input
                value={settings.primary_color}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    primary_color: e.target.value,
                  }))
                }
                className="font-mono text-xs"
                wrapperClassName="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Couleur secondaire
            </label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={settings.secondary_color}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      secondary_color: e.target.value,
                    }))
                  }
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                />
              </div>
              <Input
                value={settings.secondary_color}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    secondary_color: e.target.value,
                  }))
                }
                className="font-mono text-xs"
                wrapperClassName="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Apercu couleurs */}
        <div className="flex gap-3 mt-2">
          <div
            className="h-10 flex-1 rounded-xl flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: settings.primary_color }}
          >
            Primaire
          </div>
          <div
            className="h-10 flex-1 rounded-xl flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: settings.secondary_color }}
          >
            Secondaire
          </div>
        </div>
      </div>

      {/* Theme */}
      <div
        className="bg-surface rounded-2xl p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sun className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Theme</h2>
        </div>

        <div className="flex gap-3">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => handleThemeChange(t.value)}
              className={cn(
                "flex-1 h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer",
                settings.theme_mode === t.value
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

      {/* Bouton sauvegarder */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          loading={saving}
          icon={<Save className="w-4 h-4" />}
        >
          {saving ? "Sauvegarde..." : "Sauvegarder le branding"}
        </Button>
      </div>
    </div>
  );
}
