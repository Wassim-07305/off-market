"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/hooks/use-supabase";
import { useBrandingContext } from "@/components/providers/branding-provider";
import { colorVariants } from "@/hooks/use-branding";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const { branding } = useBrandingContext();
  const primaryColor = branding?.primary_color ?? "#DC2626";
  const brandVariants = colorVariants(primaryColor);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  // La session est déjà établie par le callback serveur
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!ready) {
        toast.error("Lien expiré ou invalide. Demande un nouveau lien.");
        router.push("/forgot-password");
      }
    }, 5000);

    supabase.auth.getUser().then(({ data: { user } }) => {
      clearTimeout(timeout);
      if (user) {
        setReady(true);
      } else {
        toast.error("Lien expiré ou invalide. Demande un nouveau lien.");
        router.push("/forgot-password");
      }
    }).catch(() => {
      clearTimeout(timeout);
      toast.error("Erreur de vérification. Demande un nouveau lien.");
      router.push("/forgot-password");
    });

    return () => clearTimeout(timeout);
  }, [supabase, router, ready]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Le mot de passe doit faire au moins 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Mot de passe mis a jour avec succes !");
      router.push("/login");
    }
  };

  const inputClass =
    "w-full h-11 px-4 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm backdrop-blur-sm";

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8 block">
        <h1 className="text-xl lg:text-2xl text-white mb-2 font-display font-bold tracking-tight">
          Nouveau mot de passe
        </h1>
        <p className="text-white/40 text-sm">
          Choisis ton nouveau mot de passe
        </p>
      </div>

      <div
        className="backdrop-blur-2xl bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8"
        style={{
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        }}
      >
        {!ready ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-white/40 text-sm">
              Verification du lien en cours...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6 caracteres minimum"
                  required
                  minLength={6}
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repetez le mot de passe"
                  required
                  minLength={6}
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-white font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-6"
              style={{
                backgroundColor: primaryColor,
                boxShadow:
                  brandVariants.glow + ", 0 4px 12px rgba(0, 0, 0, 0.3)",
              }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              Mettre a jour le mot de passe
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
