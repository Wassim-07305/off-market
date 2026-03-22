"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useValidateInviteCode } from "@/hooks/use-invitations";
import { useBrandingContext } from "@/components/providers/branding-provider";
import { colorVariants } from "@/hooks/use-branding";
import { ROLE_OPTIONS } from "@/types/invitations";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, AlertCircle, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-fade-in text-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm">Chargement...</p>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const { data: invite, isLoading: validating } = useValidateInviteCode(code);
  const { signUp } = useAuth();
  const { branding } = useBrandingContext();
  const primaryColor = branding?.primary_color ?? "#DC2626";
  const brandVariants = colorVariants(primaryColor);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid = invite?.valid === true;
  const roleLabel = ROLE_OPTIONS.find((r) => r.value === invite?.role)?.label;

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
    const { error } = await signUp(
      invite!.email!,
      password,
      invite!.full_name!,
    );
    setLoading(false);

    if (error) {
      // User already exists — redirect to login with invite code to apply role
      if (
        error.message?.toLowerCase().includes("already registered") ||
        error.message?.toLowerCase().includes("already been registered")
      ) {
        toast.info(
          "Ce compte existe deja. Connecte-toi pour appliquer ton invitation.",
        );
        window.location.href = `/login?code=${code}`;
        return;
      }
      toast.error(error.message);
    } else {
      // Mark invitation as accepted AND force role update via API (bypasses RLS)
      if (code) {
        await fetch("/api/invitations/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invite_code: code, apply_role: true }),
        }).catch(() => {});
      }
      toast.success("Compte cree ! Connecte-toi maintenant.");
      window.location.href = "/login";
    }
  };

  const inputClass =
    "w-full h-11 px-4 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm backdrop-blur-sm";

  // Pas de code d'invitation — rediriger vers l'inscription libre
  if (!code) {
    return (
      <div className="animate-fade-in text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Invitation requise</h1>
        <p className="text-white/40 text-sm mb-6">
          Cette page necessite un code d&apos;invitation. Pour creer un compte
          librement, utilisez la page d&apos;inscription.
        </p>
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-red-500 text-white text-sm font-medium transition-all hover:scale-105"
          >
            Creer un compte
          </Link>
          <Link
            href="/login"
            className="text-primary hover:text-primary-hover font-medium text-sm transition-colors"
          >
            Deja un compte ? Se connecter
          </Link>
        </div>
      </div>
    );
  }

  // Validation en cours
  if (validating) {
    return (
      <div className="animate-fade-in text-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
        <p className="text-white/40 text-sm">
          Verification de l&apos;invitation...
        </p>
      </div>
    );
  }

  // Code invalide ou expire
  if (!isValid) {
    return (
      <div className="animate-fade-in text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">
          Invitation invalide
        </h1>
        <p className="text-white/40 text-sm mb-6">
          Cette invitation a expire ou a deja ete utilisee.
        </p>
        <Link
          href="/login"
          className="text-primary hover:text-primary-hover font-medium text-sm transition-colors"
        >
          Retour a la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8 hidden lg:block">
        <h1 className="text-2xl text-white mb-2 font-display font-bold tracking-tight">
          Inscription
        </h1>
        <p className="text-white/40 text-sm">Finalisez votre inscription</p>
      </div>

      <div
        className="backdrop-blur-2xl bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8"
        style={{
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        }}
      >
        {/* Invite info banner */}
        <div className="flex items-center gap-3 p-3 mb-6 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-white font-medium truncate">
              {invite.full_name}
            </p>
            <p className="text-xs text-white/40">
              {invite.email} — {roleLabel}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
              Mot de passe
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
                type={showConfirmPassword ? "text" : "password"}
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

          <button
            type="submit"
            disabled={loading}
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
