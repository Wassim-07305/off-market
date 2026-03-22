"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useBrandingContext } from "@/components/providers/branding-provider";
import { colorVariants } from "@/hooks/use-branding";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();
  const { branding } = useBrandingContext();
  const primaryColor = branding?.primary_color ?? "#DC2626";
  const brandVariants = colorVariants(primaryColor);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8 block">
        <h1 className="text-xl lg:text-2xl text-white mb-2 font-display font-bold tracking-tight">
          Mot de passe oublie
        </h1>
        <p className="text-white/40 text-sm">Reinitialise ton mot de passe</p>
      </div>

      <div
        className="backdrop-blur-2xl bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8"
        style={{
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        }}
      >
        {sent ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-white font-medium mb-2">Email envoye</h2>
            <p className="text-zinc-400 text-sm mb-4">
              Si un compte existe avec cet email, tu recevras un lien de
              reinitialisation.
            </p>
            <Link
              href="/login"
              className="text-primary hover:text-primary-hover text-sm font-medium transition-colors"
            >
              Retour a la connexion
            </Link>
          </div>
        ) : (
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton@email.com"
                required
                className="w-full h-11 px-4 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm backdrop-blur-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-white font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              style={{
                backgroundColor: primaryColor,
                boxShadow:
                  brandVariants.glow + ", 0 4px 12px rgba(0, 0, 0, 0.3)",
              }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Envoyer le lien
            </button>
          </form>
        )}
      </div>

      <div className="text-center mt-6">
        <Link
          href="/login"
          className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour a la connexion
        </Link>
      </div>
    </div>
  );
}
