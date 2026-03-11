"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error("Email ou mot de passe incorrect");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const inputClass =
    "w-full h-11 px-4 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm backdrop-blur-sm";

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <Image
          src="/logo.png"
          alt="Off Market"
          width={72}
          height={72}
          className="mx-auto mb-4 rounded-2xl"
          style={{ filter: "drop-shadow(0 0 20px rgba(196, 30, 58, 0.3))" }}
          priority
        />
        <h1 className="text-4xl text-white mb-2 font-display font-bold tracking-tight">
          Off Market
        </h1>
        <p className="text-white/40 text-sm">Connecte-toi a ton espace</p>
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
                className="text-[11px] text-white/30 hover:text-primary transition-colors"
              >
                Oublie ?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
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
            className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-6"
            style={{
              boxShadow:
                "0 0 20px rgba(196, 30, 58, 0.25), 0 4px 12px rgba(0, 0, 0, 0.3)",
            }}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Se connecter
          </button>
        </form>
      </div>

      <p className="text-center text-white/30 text-sm mt-6">
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
