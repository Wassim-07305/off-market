"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

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
      <div className="text-center mb-8">
        <h1
          className="text-4xl text-white mb-2"
          style={{ fontFamily: "Instrument Serif, serif" }}
        >
          Off Market
        </h1>
        <p className="text-zinc-400 text-sm">Reinitialise ton mot de passe</p>
      </div>

      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
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
                className="block text-sm font-medium text-zinc-300 mb-1.5"
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
                className="w-full h-11 px-4 bg-zinc-800/50 border border-zinc-700 rounded-[10px] text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-medium rounded-[10px] transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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
