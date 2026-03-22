"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useBrandingContext } from "@/components/providers/branding-provider";
import { colorVariants } from "@/hooks/use-branding";
import { translateSupabaseError } from "@/lib/supabase-errors";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cguAccepted, setCguAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { branding } = useBrandingContext();
  const primaryColor = branding?.primary_color ?? "#DC2626";
  const brandVariants = colorVariants(primaryColor);

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
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      toast.error(translateSupabaseError(error.message));
    } else {
      toast.success("Compte cree !");
      window.location.href = "/login";
    }
  };

  const inputClass =
    "w-full h-11 px-4 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm backdrop-blur-sm";

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8 block">
        <h1 className="text-xl lg:text-2xl text-white mb-2 font-display font-bold tracking-tight">
          Inscription
        </h1>
        <p className="text-white/40 text-sm">Cree ton compte</p>
      </div>

      <div
        className="backdrop-blur-2xl bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8"
        style={{
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5"
            >
              Nom complet
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Prenom Nom"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5"
            >
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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
            <label
              htmlFor="confirmPassword"
              className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5"
            >
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetez le mot de passe"
                required
                minLength={6}
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input
              id="cgu"
              type="checkbox"
              checked={cguAccepted}
              onChange={(e) => setCguAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/[0.06] text-primary focus:ring-primary/40 cursor-pointer"
            />
            <label htmlFor="cgu" className="text-white/50 text-xs cursor-pointer">
              J&apos;accepte les{" "}
              <a
                href="/cgv"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-hover underline transition-colors"
              >
                CGV
              </a>{" "}
              et la{" "}
              <a
                href="/confidentialite"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-hover underline transition-colors"
              >
                politique de confidentialite
              </a>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !cguAccepted}
            className="w-full h-11 text-white font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-6"
            style={{
              backgroundColor: primaryColor,
              boxShadow: brandVariants.glow + ", 0 4px 12px rgba(0, 0, 0, 0.3)",
            }}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Creer mon compte
          </button>
        </form>
      </div>

      <p className="text-center text-white/30 text-sm mt-6">
        Deja un compte ?{" "}
        <Link
          href="/login"
          className="text-primary hover:text-primary-hover transition-colors font-medium"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
