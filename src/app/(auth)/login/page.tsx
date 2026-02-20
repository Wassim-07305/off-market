"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithMagicLink, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "magic") {
      const { error } = await signInWithMagicLink(email);
      setLoading(false);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Lien de connexion envoye ! Verifie tes emails.");
      }
      return;
    }

    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error("Email ou mot de passe incorrect");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error("Erreur de connexion Google");
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
        <p className="text-zinc-400 text-sm">Connecte-toi a ton espace</p>
      </div>

      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
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

          {mode === "password" && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Mot de passe
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-zinc-400 hover:text-primary transition-colors"
                >
                  Oublie ?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-11 px-4 bg-zinc-800/50 border border-zinc-700 rounded-[10px] text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-medium rounded-[10px] transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "magic" ? "Envoyer le lien" : "Se connecter"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() =>
              setMode(mode === "password" ? "magic" : "password")
            }
            className="text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            {mode === "password"
              ? "Connexion par lien magique"
              : "Connexion par mot de passe"}
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-zinc-900/50 px-3 text-zinc-500">ou</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full h-11 bg-white hover:bg-zinc-100 text-zinc-900 font-medium rounded-[10px] transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-3 text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continuer avec Google
        </button>
      </div>

      <p className="text-center text-zinc-500 text-sm mt-6">
        Pas encore de compte ?{" "}
        <Link
          href="/signup"
          className="text-primary hover:text-primary-hover transition-colors font-medium"
        >
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}
