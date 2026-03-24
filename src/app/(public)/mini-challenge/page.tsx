"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubmitLead } from "@/hooks/use-lead-magnet";
import { cn } from "@/lib/utils";
import {
  Rocket,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Mail,
  User,
  Phone,
  Flame,
  Trophy,
  Target,
  Users,
  Lock,
  Zap,
  Calendar,
  Star,
} from "lucide-react";

// ─── Schema ────────────────────────────────────────────────────

const signupSchema = z.object({
  full_name: z.string().min(2, "Ton nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
});

type SignupForm = z.infer<typeof signupSchema>;

// ─── Constants ─────────────────────────────────────────────────

const CHALLENGE_DAYS = [
  {
    day: 1,
    title: "Clarifie ton offre",
    description:
      "Definis ton client ideal et structure une offre irresistible en moins de 2h.",
  },
  {
    day: 2,
    title: "Cree ton pitch",
    description:
      "Redige un pitch de prospection qui donne envie de repondre, en 3 variantes.",
  },
  {
    day: 3,
    title: "Prospecte (pour de vrai)",
    description:
      "Envoie 20 messages de prospection a des prospects qualifies. Action massive.",
  },
  {
    day: 4,
    title: "Maitrise la vente",
    description:
      "Apprends le framework de vente en 4 etapes et entraine-toi avec un script.",
  },
  {
    day: 5,
    title: "Scale ta methode",
    description:
      "Cree ton systeme reproductible pour generer des leads chaque semaine.",
  },
];

const LOCKED_SECTIONS = [
  { name: "Module Prospection Avancee", icon: Lock },
  { name: "Dashboard CA & KPIs", icon: Lock },
  { name: "Communaute & Coaching", icon: Lock },
  { name: "Gamification & Classement", icon: Lock },
];

// ─── Page ──────────────────────────────────────────────────────

export default function MiniChallengePage() {
  const [submitted, setSubmitted] = useState(false);
  const submitLead = useSubmitLead();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    try {
      await submitLead.mutateAsync({
        ...data,
        revenue_range: "less_5k",
        goals: "Mini-challenge 5 jours",
      });
      setSubmitted(true);
    } catch {
      // handled by mutation
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-zinc-950 to-zinc-950" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px]" />

        <div className="relative max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>

          <div>
            <h1 className="text-3xl font-bold">Tu es inscrit !</h1>
            <p className="text-lg text-zinc-400 mt-3 leading-relaxed">
              Ton acces au mini-challenge de 5 jours est active.
              Consulte ta boite mail pour recevoir tes identifiants.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-300">
              Prochaines etapes :
            </h3>
            <ul className="space-y-2 text-left">
              {[
                "Connecte-toi avec tes identifiants",
                "Accede au Jour 1 du challenge",
                "Complete les 5 jours pour debloquer ton diagnostic",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-zinc-400">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => router.push("/login")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all text-sm"
          >
            Se connecter
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-zinc-950 to-zinc-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-red-600/10 rounded-full blur-[120px]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-8">
            <Flame className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-300">
              Challenge gratuit — Places limitees
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight max-w-4xl mx-auto">
            5 jours pour lancer ta{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
              machine a clients
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mt-6 leading-relaxed">
            Un mini-challenge intensif pour passer de &quot;je cherche des
            clients&quot; a &quot;j&apos;ai un systeme qui m&apos;en amene
            chaque semaine&quot;.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-10">
            {[
              { value: "5", label: "Jours", icon: Calendar },
              { value: "250", label: "XP a gagner", icon: Zap },
              { value: "100%", label: "Gratuit", icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <stat.icon className="w-5 h-5 text-red-400" />
                  <p className="text-2xl sm:text-3xl font-bold text-white">
                    {stat.value}
                  </p>
                </div>
                <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content: Days + Form */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          {/* Left: Days breakdown (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-2xl font-bold text-white">
              Le programme jour par jour
            </h2>

            <div className="space-y-3">
              {CHALLENGE_DAYS.map((day) => (
                <div
                  key={day.day}
                  className="flex gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-red-400">
                      J{day.day}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{day.title}</h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      {day.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* What you get */}
            <div className="pt-4 space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Ce que tu debloques
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  {
                    icon: Target,
                    text: "Acces aux 5 missions du challenge",
                  },
                  {
                    icon: Users,
                    text: "Acces a la communaute pendant 5 jours",
                  },
                  {
                    icon: Trophy,
                    text: "Systeme de gamification (XP, progression)",
                  },
                  {
                    icon: Zap,
                    text: "Apercu de l'application complete",
                  },
                ].map((item) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/30"
                  >
                    <item.icon className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="text-sm text-zinc-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Teasing locked sections (CDC 8.2) */}
            <div className="pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
                Reserve aux membres du programme
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {LOCKED_SECTIONS.map((section) => (
                  <div
                    key={section.name}
                    className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/20 border border-zinc-800/20 opacity-50"
                  >
                    <section.icon className="w-4 h-4 text-zinc-600 shrink-0" />
                    <span className="text-sm text-zinc-600">
                      {section.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Signup form (2 cols) */}
          <div className="lg:col-span-2 lg:sticky lg:top-8">
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  Rejoins le challenge
                </h2>
                <p className="text-sm text-zinc-400 mt-2">
                  Inscris-toi et commence le Jour 1 immediatement.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Prenom et nom *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      {...register("full_name")}
                      placeholder="Jean Dupont"
                      className={cn(
                        "w-full pl-10 pr-4 py-2.5 bg-zinc-800/60 border rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 transition-all text-sm",
                        errors.full_name
                          ? "border-red-500/60"
                          : "border-zinc-700/60"
                      )}
                    />
                  </div>
                  {errors.full_name && (
                    <p className="text-xs text-red-400 mt-1">
                      {errors.full_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="jean@email.com"
                      className={cn(
                        "w-full pl-10 pr-4 py-2.5 bg-zinc-800/60 border rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 transition-all text-sm",
                        errors.email
                          ? "border-red-500/60"
                          : "border-zinc-700/60"
                      )}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-400 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Telephone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      {...register("phone")}
                      type="tel"
                      placeholder="06 12 34 56 78"
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 transition-all text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || submitLead.isPending}
                  className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-600/20"
                >
                  {isSubmitting || submitLead.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Inscription...
                    </>
                  ) : (
                    <>
                      Commencer le challenge
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {submitLead.isError && (
                  <p className="text-xs text-red-400 text-center">
                    Une erreur est survenue. Veuillez reessayer.
                  </p>
                )}

                <p className="text-[11px] text-zinc-600 text-center">
                  Acces gratuit pendant 5 jours. Aucun engagement, aucun
                  paiement requis.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8 text-center">
        <p className="text-sm text-zinc-600">
          &copy; {new Date().getFullYear()} Off Market. Tous droits reserves.
        </p>
      </footer>
    </div>
  );
}
