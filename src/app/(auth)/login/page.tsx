"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/hooks/use-supabase";
import { useBrandingContext } from "@/components/providers/branding-provider";
import { colorVariants } from "@/hooks/use-branding";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { SSOButtons } from "@/components/auth/sso-buttons";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="animate-fade-in text-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" /></div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // 2FA state
  const [needs2FA, setNeeds2FA] = useState(false);
  const [totpCode, setTotpCode] = useState(["", "", "", "", "", ""]);
  const [verifying2FA, setVerifying2FA] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const totpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { signIn } = useAuth();
  const supabase = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("code");
  const { branding } = useBrandingContext();
  const primaryColor = branding?.primary_color ?? "#DC2626";
  const brandVariants = colorVariants(primaryColor);

  // Auto-focus first TOTP input when 2FA screen appears
  useEffect(() => {
    if (needs2FA) {
      setTimeout(() => totpRefs.current[0]?.focus(), 100);
    }
  }, [needs2FA]);

  // If redirected with ?mfa=required, auto-detect and show 2FA screen
  useEffect(() => {
    if (searchParams.get("mfa") === "required" && !needs2FA) {
      (async () => {
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalData?.currentLevel === "aal1" && aalData?.nextLevel === "aal2") {
          const { data: factorsData } = await supabase.auth.mfa.listFactors();
          const verifiedFactor = factorsData?.totp?.find((f) => f.status === "verified");
          if (verifiedFactor) {
            setMfaFactorId(verifiedFactor.id);
            setNeeds2FA(true);
          }
        }
      })();
    }
  }, [searchParams, supabase, needs2FA]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setLoading(false);
      toast.error("Email ou mot de passe incorrect");
      return;
    }

    // Check if MFA is required
    const { data: aalData } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (
      aalData &&
      aalData.currentLevel === "aal1" &&
      aalData.nextLevel === "aal2"
    ) {
      // User has 2FA enabled — need TOTP verification
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const verifiedFactor = factorsData?.totp?.find(
        (f) => f.status === "verified",
      );
      if (verifiedFactor) {
        setMfaFactorId(verifiedFactor.id);
        setNeeds2FA(true);
        setLoading(false);
        return;
      }
    }

    // If logging in with an invite code, apply the invitation (update role)
    if (inviteCode) {
      try {
        await fetch("/api/invitations/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invite_code: inviteCode, apply_role: true }),
        });
        toast.success("Invitation appliquee ! Ton role a ete mis à jour.");
      } catch {
        // Non-blocking — role update failed but login succeeded
      }
    }

    trackEvent("login");
    setLoading(false);
    router.push("/");
    router.refresh();
  };

  const handleTotpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...totpCode];
    newCode[index] = value.slice(-1);
    setTotpCode(newCode);

    // Auto-advance to next input
    if (value && index < 5) {
      totpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    const fullCode = newCode.join("");
    if (fullCode.length === 6) {
      handleVerify2FA(fullCode);
    }
  };

  const handleTotpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !totpCode[index] && index > 0) {
      totpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      const fullCode = totpCode.join("");
      if (fullCode.length === 6) {
        handleVerify2FA(fullCode);
      }
    }
  };

  const handleTotpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split("");
      setTotpCode(newCode);
      handleVerify2FA(pasted);
    }
  };

  const handleVerify2FA = async (code: string) => {
    if (!mfaFactorId || verifying2FA) return;
    setVerifying2FA(true);

    try {
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: mfaFactorId });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) {
        toast.error("Code invalide. Reessaie.");
        setTotpCode(["", "", "", "", "", ""]);
        totpRefs.current[0]?.focus();
        setVerifying2FA(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      toast.error("Erreur de verification 2FA");
      setTotpCode(["", "", "", "", "", ""]);
      setVerifying2FA(false);
    }
  };

  const inputClass =
    "w-full h-11 px-4 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#AF0000]/40 focus:border-[#AF0000]/40 transition-all text-sm backdrop-blur-sm";

  // 2FA verification screen
  if (needs2FA) {
    return (
      <div className="animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#AF0000]/20 to-[#DC2626]/10 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#AF0000]/10">
            <ShieldCheck className="w-8 h-8 text-[#DC2626]" />
          </div>
          <h1 className="text-2xl text-white mb-2 font-display font-bold tracking-tight">
            Verification 2FA
          </h1>
          <p className="text-white/40 text-sm">
            Entre le code a 6 chiffres de ton application
            d&apos;authentification
          </p>
        </div>

        <div
          className="backdrop-blur-2xl bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8"
          style={{
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 80px rgba(175, 0, 0, 0.05)",
          }}
        >
          <div
            className="flex justify-center gap-2 mb-6"
            onPaste={handleTotpPaste}
          >
            {totpCode.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  totpRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleTotpChange(i, e.target.value)}
                onKeyDown={(e) => handleTotpKeyDown(i, e)}
                disabled={verifying2FA}
                className="w-12 h-14 text-center text-xl font-mono font-bold bg-white/[0.06] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#AF0000]/40 focus:border-[#AF0000]/40 transition-all disabled:opacity-50"
              />
            ))}
          </div>

          {verifying2FA && (
            <div className="flex items-center justify-center gap-2 text-white/50 text-sm mb-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verification en cours...
            </div>
          )}

          <button
            onClick={() => {
              setNeeds2FA(false);
              setTotpCode(["", "", "", "", "", ""]);
              setMfaFactorId(null);
              supabase.auth.signOut();
            }}
            className="w-full text-center text-white/30 hover:text-[#DC2626] text-sm transition-colors"
          >
            Annuler et revenir au login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8 block">
        <h1 className="text-xl lg:text-2xl text-white mb-2 font-display font-bold tracking-tight">
          Connexion
        </h1>
        <p className="text-white/40 text-sm">Connecte-toi a ton espace</p>
      </div>

      <div
        className="backdrop-blur-2xl bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8"
        style={{
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 80px rgba(175, 0, 0, 0.05)",
        }}
      >
        {inviteCode && (
          <div className="flex items-center gap-3 p-3 mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-300">
              Connecte-toi pour activer ton invitation et mettre a jour ton role.
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-[11px] font-medium text-white/50 uppercase tracking-wider"
              >
                Mot de passe
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-white/30 hover:text-[#DC2626] transition-colors"
              >
                Oublie ?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
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

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 text-white font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-6 bg-gradient-to-r from-[#AF0000] to-[#DC2626] hover:shadow-xl hover:shadow-[#AF0000]/30"
            style={{
              boxShadow: brandVariants.glow + ", 0 4px 12px rgba(0, 0, 0, 0.3)",
            }}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Se connecter
          </button>
        </form>

        {/* SSO Google & Microsoft */}
        <SSOButtons />
      </div>

      <p className="text-center text-white/30 text-sm mt-6">
        Pas encore de compte ?{" "}
        <Link
          href="/signup"
          className="text-[#DC2626] hover:text-[#AF0000] transition-colors font-medium"
        >
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}
