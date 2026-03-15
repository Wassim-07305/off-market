"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubmitLead } from "@/hooks/use-lead-magnet";
import {
  Rocket,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Mail,
  Phone,
  User,
  Building2,
  Target,
  MessageSquare,
  Star,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const leadCaptureSchema = z.object({
  full_name: z.string().min(2, "Votre nom est requis"),
  email: z.string().email("Veuillez entrer un email valide"),
  phone: z.string().optional(),
  company: z.string().optional(),
  revenue_range: z.enum(["less_5k", "5k_10k", "10k_20k", "20k_plus"], {
    message: "Selectionnez votre tranche de revenus",
  }),
  goals: z.string().optional(),
});

type LeadCaptureForm = z.infer<typeof leadCaptureSchema>;

const REVENUE_OPTIONS = [
  { value: "less_5k" as const, label: "< 5k\u20AC/mois" },
  { value: "5k_10k" as const, label: "5k - 10k\u20AC/mois" },
  { value: "10k_20k" as const, label: "10k - 20k\u20AC/mois" },
  { value: "20k_plus" as const, label: "20k+\u20AC/mois" },
];

const BENEFITS = [
  {
    icon: TrendingUp,
    title: "Strategie sur-mesure",
    description:
      "Un plan d'action personnalise pour atteindre vos objectifs de revenus.",
  },
  {
    icon: Shield,
    title: "Accompagnement premium",
    description:
      "Un coaching intensif avec des experts qui ont deja fait le chemin.",
  },
  {
    icon: Zap,
    title: "Resultats rapides",
    description:
      "Des methodes prouvees pour accelerer votre croissance des le premier mois.",
  },
];

const TESTIMONIALS = [
  {
    name: "Marie L.",
    role: "Coach en nutrition",
    text: "En 3 mois, j'ai triple mon chiffre d'affaires. L'accompagnement est exceptionnel.",
    rating: 5,
  },
  {
    name: "Thomas D.",
    role: "Consultant digital",
    text: "J'ai enfin depasse les 10k/mois grace a leur methode structuree.",
    rating: 5,
  },
];

export default function LeadMagnetPage() {
  const [submitted, setSubmitted] = useState(false);
  const submitLead = useSubmitLead();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<LeadCaptureForm>({
    resolver: zodResolver(leadCaptureSchema),
  });

  const selectedRevenue = watch("revenue_range");

  const onSubmit = async (data: LeadCaptureForm) => {
    try {
      await submitLead.mutateAsync(data);
      setSubmitted(true);
    } catch {
      // Error is handled by the mutation
    }
  };

  if (submitted) {
    return <SuccessView />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-zinc-950 to-zinc-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-red-600/10 rounded-full blur-[120px]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
              <Rocket className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-300">
                Programme d&apos;acceleration
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-center text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight max-w-4xl mx-auto">
            Pret a passer au{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
              niveau superieur
            </span>{" "}
            ?
          </h1>

          <p className="text-center text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mt-6 leading-relaxed">
            Rejoignez les entrepreneurs et coaches qui ont transforme leur
            activite avec notre methode prouvee. Passez de freelance a business
            structure.
          </p>

          {/* Stats bar */}
          <div className="flex flex-wrap justify-center gap-8 mt-10">
            {[
              { value: "150+", label: "Entrepreneurs accompagnes" },
              { value: "89%", label: "Atteignent 10k/mois" },
              { value: "4.9/5", label: "Satisfaction client" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content: Form + Benefits */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Benefits */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Ce que vous allez obtenir
              </h2>
              <p className="text-zinc-400 mt-3">
                Un diagnostic gratuit de votre situation et des recommandations
                actionnables pour scaler votre activite.
              </p>
            </div>

            <div className="space-y-5">
              {BENEFITS.map((benefit) => (
                <div
                  key={benefit.title}
                  className="flex gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                    <benefit.icon className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
                Ils nous font confiance
              </h3>
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/30"
                >
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-zinc-300 italic">
                    &quot;{t.text}&quot;
                  </p>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 sm:p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Demandez votre diagnostic gratuit
                </h2>
                <p className="text-sm text-zinc-400 mt-2">
                  Remplissez le formulaire et nous vous recontacterons sous 24h.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full name */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Nom complet *
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
                          : "border-zinc-700/60",
                      )}
                    />
                  </div>
                  {errors.full_name && (
                    <p className="text-xs text-red-400 mt-1">
                      {errors.full_name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="jean@entreprise.com"
                      className={cn(
                        "w-full pl-10 pr-4 py-2.5 bg-zinc-800/60 border rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 transition-all text-sm",
                        errors.email
                          ? "border-red-500/60"
                          : "border-zinc-700/60",
                      )}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-400 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
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

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Entreprise
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      {...register("company")}
                      placeholder="Mon Entreprise SAS"
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Revenue range */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    <Target className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                    Chiffre d&apos;affaires mensuel actuel *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {REVENUE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setValue("revenue_range", opt.value, {
                            shouldValidate: true,
                          })
                        }
                        className={cn(
                          "py-2.5 px-3 rounded-xl border text-sm font-medium transition-all",
                          selectedRevenue === opt.value
                            ? "bg-red-500/20 border-red-500/60 text-red-300"
                            : "bg-zinc-800/40 border-zinc-700/40 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {errors.revenue_range && (
                    <p className="text-xs text-red-400 mt-1">
                      {errors.revenue_range.message}
                    </p>
                  )}
                </div>

                {/* Goals */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    <MessageSquare className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                    Vos objectifs
                  </label>
                  <textarea
                    {...register("goals")}
                    rows={3}
                    placeholder="Decrivez vos objectifs business et les defis que vous rencontrez..."
                    className="w-full px-4 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 transition-all text-sm resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || submitLead.isPending}
                  className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-600/20"
                >
                  {isSubmitting || submitLead.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      Recevoir mon diagnostic gratuit
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {submitLead.isError && (
                  <p className="text-xs text-red-400 text-center">
                    {submitLead.error?.message ||
                      "Une erreur est survenue. Veuillez reessayer."}
                  </p>
                )}

                <p className="text-[11px] text-zinc-600 text-center">
                  En soumettant ce formulaire, vous acceptez d&apos;etre
                  contacte par notre equipe. Vos donnees sont protegees et ne
                  seront jamais partagees.
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

// ─── Success View ───────────────────────────────────────────────

function SuccessView() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-zinc-950 to-zinc-950" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px]" />

      <div className="relative max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Merci !</h1>
          <p className="text-lg text-zinc-400 mt-3 leading-relaxed">
            Nous avons bien recu votre demande. Notre equipe vous recontactera
            sous <span className="text-white font-semibold">24h</span> pour
            planifier votre diagnostic gratuit.
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-300">
            En attendant, voici ce qui va se passer :
          </h3>
          <ul className="space-y-2 text-left">
            {[
              "Analyse de votre profil par notre equipe",
              "Preparation de recommandations personnalisees",
              "Appel de decouverte de 30 minutes offert",
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

        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Retour au site
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
