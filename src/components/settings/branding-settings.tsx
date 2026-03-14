"use client";

import { useState, useRef, useEffect } from "react";
import {
  useBranding,
  useUpdateBranding,
  useUploadBrandingAsset,
} from "@/hooks/use-branding";
import { useBrandingContext } from "@/components/providers/branding-provider";
import {
  Paintbrush,
  Upload,
  Loader2,
  Save,
  RotateCcw,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter", sample: "Aa" },
  { value: "Poppins", label: "Poppins", sample: "Aa" },
  { value: "DM Sans", label: "DM Sans", sample: "Aa" },
  { value: "Plus Jakarta Sans", label: "Plus Jakarta", sample: "Aa" },
  { value: "Outfit", label: "Outfit", sample: "Aa" },
];

const RADIUS_OPTIONS = [
  { value: "4", label: "Carre" },
  { value: "8", label: "Leger" },
  { value: "12", label: "Moyen" },
  { value: "16", label: "Arrondi" },
  { value: "20", label: "Tres arrondi" },
];

const PRESET_COLORS = [
  { name: "Rouge", light: "#c41e3a", dark: "#e8374e" },
  { name: "Bleu", light: "#2563eb", dark: "#3b82f6" },
  { name: "Violet", light: "#7c3aed", dark: "#8b5cf6" },
  { name: "Emeraude", light: "#059669", dark: "#10b981" },
  { name: "Orange", light: "#ea580c", dark: "#f97316" },
  { name: "Rose", light: "#db2777", dark: "#ec4899" },
  { name: "Indigo", light: "#4f46e5", dark: "#6366f1" },
  { name: "Cyan", light: "#0891b2", dark: "#06b6d4" },
];

export function BrandingSettings() {
  const { data: branding, isLoading } = useBranding();
  const updateBranding = useUpdateBranding();
  const uploadAsset = useUploadBrandingAsset();
  const { branding: liveBranding } = useBrandingContext();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const [appName, setAppName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#c41e3a");
  const [primaryColorDark, setPrimaryColorDark] = useState("#e8374e");
  const [accentColor, setAccentColor] = useState("#f97316");
  const [accentColorDark, setAccentColorDark] = useState("#fb923c");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [borderRadius, setBorderRadius] = useState("12");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  useEffect(() => {
    if (branding) {
      setAppName(branding.app_name);
      setPrimaryColor(branding.primary_color);
      setPrimaryColorDark(branding.primary_color_dark);
      setAccentColor(branding.accent_color);
      setAccentColorDark(branding.accent_color_dark);
      setFontFamily(branding.font_family);
      setBorderRadius(branding.border_radius);
    }
  }, [branding]);

  const handleSave = () => {
    updateBranding.mutate({
      app_name: appName,
      primary_color: primaryColor,
      primary_color_dark: primaryColorDark,
      accent_color: accentColor,
      accent_color_dark: accentColorDark,
      font_family: fontFamily,
      border_radius: borderRadius,
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Le fichier doit etre une image");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas depasser 2 Mo");
      return;
    }

    setUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop();
      const url = await uploadAsset.mutateAsync({
        file,
        path: `logo.${ext}`,
      });
      await updateBranding.mutateAsync({ logo_url: url });
    } catch {
      toast.error("Erreur lors de l'upload du logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 512 * 1024) {
      toast.error("Le favicon ne doit pas depasser 512 Ko");
      return;
    }

    setUploadingFavicon(true);
    try {
      const ext = file.name.split(".").pop();
      const url = await uploadAsset.mutateAsync({
        file,
        path: `favicon.${ext}`,
      });
      await updateBranding.mutateAsync({ favicon_url: url });
    } catch {
      toast.error("Erreur lors de l'upload du favicon");
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleResetDefaults = () => {
    setPrimaryColor("#c41e3a");
    setPrimaryColorDark("#e8374e");
    setAccentColor("#f97316");
    setAccentColorDark("#fb923c");
    setFontFamily("Inter");
    setBorderRadius("12");
    setAppName("Off Market");
  };

  const hasChanges =
    branding &&
    (appName !== branding.app_name ||
      primaryColor !== branding.primary_color ||
      primaryColorDark !== branding.primary_color_dark ||
      accentColor !== branding.accent_color ||
      accentColorDark !== branding.accent_color_dark ||
      fontFamily !== branding.font_family ||
      borderRadius !== branding.border_radius);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      className="bg-surface rounded-2xl p-6 space-y-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paintbrush className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Branding & White-Label
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="h-8 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reinitialiser
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || updateBranding.isPending}
            className="h-8 px-4 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            {updateBranding.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Enregistrer
          </button>
        </div>
      </div>

      {/* App Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Nom de l&apos;application
        </label>
        <input
          type="text"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          className="w-full h-10 px-3 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Off Market"
        />
      </div>

      {/* Logo & Favicon */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Logo
          </label>
          <input
            type="file"
            ref={logoInputRef}
            onChange={handleLogoUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => logoInputRef.current?.click()}
            disabled={uploadingLogo}
            className="w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2"
          >
            {uploadingLogo ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : liveBranding?.logo_url ? (
              <img
                src={liveBranding.logo_url}
                alt="Logo"
                className="w-12 h-12 rounded-lg object-contain"
              />
            ) : (
              <>
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Upload logo (max 2 Mo)
                </span>
              </>
            )}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Favicon
          </label>
          <input
            type="file"
            ref={faviconInputRef}
            onChange={handleFaviconUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => faviconInputRef.current?.click()}
            disabled={uploadingFavicon}
            className="w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2"
          >
            {uploadingFavicon ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : liveBranding?.favicon_url ? (
              <img
                src={liveBranding.favicon_url}
                alt="Favicon"
                className="w-8 h-8 rounded object-contain"
              />
            ) : (
              <>
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Upload favicon (max 512 Ko)
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary Color */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Couleur principale
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.light}
              onClick={() => {
                setPrimaryColor(color.light);
                setPrimaryColorDark(color.dark);
              }}
              className={cn(
                "w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center",
                primaryColor === color.light
                  ? "border-foreground scale-110"
                  : "border-transparent hover:scale-105",
              )}
              style={{ backgroundColor: color.light }}
              title={color.name}
            >
              {primaryColor === color.light && (
                <Check className="w-4 h-4 text-white" />
              )}
            </button>
          ))}
          {/* Custom color picker */}
          <div className="relative">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => {
                setPrimaryColor(e.target.value);
                // Auto-generate lighter dark variant
                const hex = e.target.value;
                const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + 20);
                const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + 20);
                const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + 20);
                setPrimaryColorDark(`#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`);
              }}
              className="w-10 h-10 rounded-xl cursor-pointer border-2 border-border"
              title="Couleur personnalisee"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Light:</span>
            <code className="text-xs font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">
              {primaryColor}
            </code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Dark:</span>
            <code className="text-xs font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">
              {primaryColorDark}
            </code>
          </div>
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Couleur d&apos;accent
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={accentColor}
            onChange={(e) => {
              setAccentColor(e.target.value);
              const hex = e.target.value;
              const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + 20);
              const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + 20);
              const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + 20);
              setAccentColorDark(`#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`);
            }}
            className="w-10 h-10 rounded-xl cursor-pointer border-2 border-border"
          />
          <code className="text-xs font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">
            {accentColor}
          </code>
        </div>
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Police de caracteres
        </label>
        <div className="grid grid-cols-5 gap-2">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.value}
              onClick={() => setFontFamily(font.value)}
              className={cn(
                "h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
                fontFamily === font.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border/80",
              )}
            >
              <span
                className="text-lg font-semibold text-foreground"
                style={{ fontFamily: font.value }}
              >
                {font.sample}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {font.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Arrondi des coins
        </label>
        <div className="flex gap-2">
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setBorderRadius(opt.value)}
              className={cn(
                "flex-1 h-12 border-2 flex flex-col items-center justify-center gap-0.5 transition-all",
                borderRadius === opt.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border/80",
              )}
              style={{ borderRadius: `${parseInt(opt.value)}px` }}
            >
              <div
                className="w-5 h-5 bg-primary/20"
                style={{ borderRadius: `${parseInt(opt.value)}px` }}
              />
              <span className="text-[10px] text-muted-foreground">
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="border border-border rounded-xl p-4 space-y-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Apercu
        </span>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center text-white text-sm font-bold"
            style={{
              backgroundColor: primaryColor,
              borderRadius: `${parseInt(borderRadius)}px`,
            }}
          >
            {appName.charAt(0)}
          </div>
          <span
            className="text-lg font-bold text-foreground"
            style={{ fontFamily }}
          >
            {appName}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            className="h-9 px-4 text-sm font-medium text-white"
            style={{
              backgroundColor: primaryColor,
              borderRadius: `${parseInt(borderRadius)}px`,
            }}
          >
            Bouton primaire
          </button>
          <button
            className="h-9 px-4 text-sm font-medium text-white"
            style={{
              backgroundColor: accentColor,
              borderRadius: `${parseInt(borderRadius)}px`,
            }}
          >
            Bouton accent
          </button>
        </div>
      </div>
    </div>
  );
}
