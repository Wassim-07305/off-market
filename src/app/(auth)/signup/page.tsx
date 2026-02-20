"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Le mot de passe doit faire au moins 6 caracteres");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Compte cree ! Verifie tes emails pour confirmer.");
    }
  };

  const handleGoogleSignup = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error("Erreur de connexion Google");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <Image
          src="/logo.png"
          alt="Off Market"
          width={72}
          height={72}
          className="mx-auto mb-4 rounded-2xl"
          priority
        />
        <h1
          className="text-4xl text-white mb-2"
          style={{ fontFamily: "Instrument Serif, serif" }}
        >
          Off Market
        </h1>
        <p className="text-zinc-400 text-sm">Cree ton compte</p>
      </div>

      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              Nom complet
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Prenom Nom"
              required
              className="w-full h-11 px-4 bg-zinc-800/50 border border-zinc-700 rounded-[10px] text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
            />
          </div>

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

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6 caracteres minimum"
                required
                minLength={6}
                className="w-full h-11 px-4 pr-11 bg-zinc-800/50 border border-zinc-700 rounded-[10px] text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
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
            className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-medium rounded-[10px] transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Creer mon compte
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-zinc-900/50 px-3 text-zinc-500">ou</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignup}
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
