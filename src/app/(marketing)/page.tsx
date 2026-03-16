"use client";

import Link from "next/link";
import { useState, useEffect, useRef, type ReactNode } from "react";
import {
  Crown,
  Users,
  GraduationCap,
  MessageCircle,
  Video,
  Trophy,
  BarChart3,
  ArrowRight,
  TrendingUp,
  Star,
  Menu,
  X,
  Shield,
  Clock,
  Zap,
  UserPlus,
  Compass,
  Rocket,
  ChevronRight,
  Check,
  Quote,
  Flame,
  Target,
  LineChart,
  Sparkles,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Intersection Observer hook                                         */
/* ------------------------------------------------------------------ */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

/* ------------------------------------------------------------------ */
/*  FadeIn wrapper                                                     */
/* ------------------------------------------------------------------ */

function FadeIn({
  children,
  className = "",
  delay = 0,
  isInView,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  isInView: boolean;
}) {
  return (
    <div
      className={`transition-all duration-700 ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated counter                                                   */
/* ------------------------------------------------------------------ */

function AnimatedCounter({
  target,
  suffix,
  isInView,
}: {
  target: number;
  suffix: string;
  isInView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let frame: number;
    const duration = 2000;
    const start = performance.now();

    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    }

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isInView, target]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const ACCENT = "#AF0000"; // Off-Market red
const ACCENT_LIGHT = "#DC2626"; // red-600
const ACCENT_GLOW = "rgba(175, 0, 0, 0.18)";

const navLinks = [
  { label: "Fonctionnalites", href: "#features" },
  { label: "Comment ca marche", href: "#how-it-works" },
  { label: "Pourquoi Off-Market", href: "#why" },
  { label: "Temoignages", href: "#testimonials" },
];

const stats = [
  { value: 35, suffix: "+", label: "Professionnels actifs" },
  { value: 500, suffix: "+", label: "Eleves accompagnes" },
  { value: 97, suffix: "%", label: "De satisfaction" },
];

const features = [
  {
    icon: Users,
    title: "CRM & Pipeline",
    desc: "Fiches eleves, tags d'engagement, pipeline Kanban, alertes automatiques et suivi de progression en temps reel.",
    gradient: "from-red-700/20 to-red-700/5",
  },
  {
    icon: GraduationCap,
    title: "Formation LMS",
    desc: "Cours modulaires, quiz interactifs, certificats, parcours d'apprentissage personnalises et suivi de completion.",
    gradient: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    icon: MessageCircle,
    title: "Messagerie",
    desc: "Chat temps reel, canaux publics et prives, threads, mentions, assistant IA integre et mode Ne Pas Deranger.",
    gradient: "from-blue-500/20 to-blue-500/5",
  },
  {
    icon: Video,
    title: "Appels Video & IA",
    desc: "Visioconference WebRTC native, transcription automatique, generation de documents post-appel et scoring IA.",
    gradient: "from-violet-500/20 to-violet-500/5",
  },
  {
    icon: Trophy,
    title: "Gamification",
    desc: "XP, badges, leaderboard, challenges hebdomadaires, competitions d'equipe et catalogue de recompenses.",
    gradient: "from-rose-500/20 to-rose-500/5",
  },
  {
    icon: BarChart3,
    title: "Analytics & Finances",
    desc: "KPIs temps reel, MRR/ARR, facturation automatique, signature electronique, Stripe et rapports financiers.",
    gradient: "from-cyan-500/20 to-cyan-500/5",
  },
];

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Configurez votre espace",
    desc: "Personnalisez votre branding, creez vos formations et invitez votre equipe en quelques minutes.",
  },
  {
    icon: Compass,
    number: "02",
    title: "Onboardez vos eleves",
    desc: "Parcours d'accueil interactif, attribution CSM automatique, video personnalisee et checklist guidee.",
  },
  {
    icon: Rocket,
    number: "03",
    title: "Scalez votre business",
    desc: "Suivez la progression, automatisez les relances, analysez vos KPIs et maximisez la retention.",
  },
];

const valueProps = [
  {
    icon: Target,
    title: "10 outils en 1",
    desc: "Remplacez Slack, Skool, Lovable, Google Meet, Fathom, Google Docs, YouSign, Airtable, Excel et WhatsApp par une seule plateforme premium.",
    items: [
      "Zero friction entre les outils",
      "Une seule source de verite",
      "Experience client premium",
    ],
  },
  {
    icon: LineChart,
    title: "ROI mesurable",
    desc: "Chaque interaction est tracee. Vous savez exactement quel eleve a besoin d'attention, quel module performe et ou concentrer vos efforts.",
    items: [
      "Health score automatique",
      "Alertes at-risk predictives",
      "LTV par client visible",
    ],
  },
  {
    icon: Flame,
    title: "Engagement maximal",
    desc: "La gamification, les check-ins quotidiens et la communaute creent un ecosysteme ou vos eleves restent motives et progressent.",
    items: [
      "Retention +40% vs outils classiques",
      "Streaks et challenges",
      "Communaute intergenerationnelle",
    ],
  },
];

const testimonials = [
  {
    name: "Marie L.",
    role: "Coach business, 8 eleves",
    text: "Avant Off-Market, je passais 2h par jour a jongler entre Slack, Skool et Google Docs. Maintenant tout est centralise, mes eleves ont une experience premium et mon taux de renouvellement a explose.",
    rating: 5,
    metric: "+65% de retention",
  },
  {
    name: "Julien R.",
    role: "Consultant marketing, 15 eleves",
    text: "La gamification a tout change. Mes eleves se connectent tous les jours, completent les modules et partagent leurs wins. L'engagement est a un niveau que je n'avais jamais vu.",
    rating: 5,
    metric: "95% d'engagement",
  },
  {
    name: "Sophie D.",
    role: "Coach carriere, 22 eleves",
    text: "Le systeme de flags et l'analyse IA me permettent de detecter les eleves en difficulte avant qu'ils ne decrochent. J'ai divise par 3 mon taux de churn en 2 mois.",
    rating: 5,
    metric: "Churn / 3",
  },
];

const footerSections = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalites", href: "#features" },
      { label: "Pourquoi Off-Market", href: "#why" },
      { label: "Temoignages", href: "#testimonials" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Documentation", href: "/documentation" },
      { label: "Contact", href: "mailto:hello@offmarket.fr" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "CGV", href: "/cgv" },
      { label: "Mentions legales", href: "/mentions-legales" },
      { label: "Confidentialite", href: "/confidentialite" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Dashboard Mockup                                                   */
/* ------------------------------------------------------------------ */

function DashboardMockup() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-px">
      <div className="overflow-hidden rounded-[15px] bg-[#0F0E0C]">
        {/* Browser bar */}
        <div className="flex items-center gap-2 border-b border-white/[0.04] px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-red-500/60" />
            <span className="size-2.5 rounded-full bg-amber-500/60" />
            <span className="size-2.5 rounded-full bg-green-500/60" />
          </div>
          <div className="ml-3 flex-1 rounded-md bg-white/[0.04] px-3 py-1 text-[11px] text-white/30">
            app.offmarket.fr/dashboard
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3 p-4">
          {/* Sidebar */}
          <div className="col-span-2 hidden space-y-2 lg:block">
            <div className="h-3 w-16 rounded bg-red-700/20" />
            <div className="mt-4 space-y-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2.5 rounded ${i === 0 ? "w-full bg-red-700/15" : "w-3/4 bg-white/[0.04]"}`}
                />
              ))}
            </div>
          </div>

          {/* Main */}
          <div className="col-span-12 space-y-3 lg:col-span-10">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {["Eleves", "Progression", "Revenue", "Sessions"].map(
                (label, i) => (
                  <div
                    key={label}
                    className={`rounded-lg border border-white/[0.04] bg-white/[0.02] p-2.5 ${i === 3 ? "hidden sm:block" : ""}`}
                  >
                    <div className="text-[9px] text-white/30">{label}</div>
                    <div className="mt-1 text-sm font-bold text-white/80">
                      {["32", "78%", "24.5k", "156"][i]}
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <div className="h-1 flex-1 rounded-full bg-white/[0.04]">
                        <div
                          className="h-1 rounded-full bg-red-700/40"
                          style={{ width: `${[85, 78, 65, 72][i]}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>

            {/* Chart */}
            <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[10px] font-medium text-white/40">
                  Chiffre d&apos;affaires
                </div>
                <div className="flex gap-2">
                  <div className="h-1.5 w-6 rounded bg-red-700/30" />
                  <div className="h-1.5 w-6 rounded bg-emerald-500/30" />
                </div>
              </div>
              <div className="flex h-16 items-end gap-1 sm:h-24">
                {[30, 45, 35, 60, 50, 72, 55, 80, 65, 88, 75, 95].map(
                  (h, i) => (
                    <div key={i} className="flex flex-1 flex-col gap-0.5">
                      <div
                        className="rounded-t bg-red-700/25 transition-all duration-500"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Pipeline */}
            <div className="grid grid-cols-3 gap-2">
              {["Onboarding", "Active", "Consolidation"].map((col, ci) => (
                <div
                  key={col}
                  className="rounded-lg border border-white/[0.04] bg-white/[0.015] p-2"
                >
                  <div className="mb-2 text-[9px] font-medium text-white/30">
                    {col}
                  </div>
                  {[...Array(ci === 0 ? 3 : ci === 1 ? 4 : 2)].map((_, j) => (
                    <div
                      key={j}
                      className="mb-1.5 rounded border border-white/[0.04] bg-white/[0.03] p-1.5"
                    >
                      <div className="h-1.5 w-3/4 rounded bg-white/[0.08]" />
                      <div className="mt-1 h-1 w-1/2 rounded bg-white/[0.04]" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const statsSection = useInView(0.3);
  const featuresSection = useInView(0.1);
  const howSection = useInView(0.1);
  const whySection = useInView(0.1);
  const testimonialsSection = useInView(0.1);
  const ctaSection = useInView(0.2);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0C0A09] text-white antialiased selection:bg-red-700/20 selection:text-white">
      {/* Dot grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* ================================================================ */}
      {/*  NAVIGATION                                                       */}
      {/* ================================================================ */}
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "border-b border-white/[0.06] bg-[#0C0A09]/80 backdrop-blur-2xl backdrop-saturate-150"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="flex size-8 items-center justify-center rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
                boxShadow: `0 0 16px ${ACCENT_GLOW}`,
              }}
            >
              <Crown className="size-4 text-[#0C0A09]" />
            </div>
            <span className="text-lg font-bold tracking-tight">Off-Market</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-white/50 transition-colors duration-200 hover:bg-white/[0.04] hover:text-white/90"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline-flex">
              <button
                type="button"
                className="h-9 rounded-lg px-4 text-[13px] font-medium text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                Connexion
              </button>
            </Link>
            <Link href="/signup" className="hidden sm:inline-flex">
              <button
                type="button"
                className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-[13px] font-semibold text-[#0C0A09] transition-all duration-200 hover:shadow-[0_0_24px_rgba(245,158,11,0.25)]"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
                }}
              >
                Commencer
                <ArrowRight className="size-3.5" />
              </button>
            </Link>

            {/* Mobile toggle */}
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`overflow-hidden border-t border-white/[0.04] bg-[#0C0A09]/98 backdrop-blur-2xl transition-all duration-300 md:hidden ${
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 border-t border-white/[0.04] pt-3">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <button
                  type="button"
                  className="w-full rounded-lg py-2.5 text-center text-[15px] font-medium text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white"
                >
                  Connexion
                </button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-[15px] font-semibold text-[#0C0A09] transition-colors"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
                  }}
                >
                  Commencer
                  <ArrowRight className="size-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* ============================================================== */}
        {/*  1. HERO                                                        */}
        {/* ============================================================== */}
        <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28 lg:pt-44 lg:pb-36">
          {/* Orbs */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <div className="absolute left-1/2 top-0 h-[700px] w-[1000px] -translate-x-1/2 rounded-full bg-red-700/[0.04] blur-[160px]" />
            <div className="absolute right-1/4 top-1/4 h-[300px] w-[300px] rounded-full bg-orange-500/[0.02] blur-[100px]" />
            <div className="absolute left-1/4 top-1/3 h-[250px] w-[250px] rounded-full bg-red-600/[0.02] blur-[120px]" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              {/* Badge */}
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 text-[13px] font-medium text-white/50 backdrop-blur-sm">
                <span
                  className="flex size-1.5 rounded-full"
                  style={{
                    backgroundColor: ACCENT,
                    boxShadow: `0 0 8px ${ACCENT_GLOW}`,
                  }}
                />
                Plateforme tout-en-un pour freelances, coachs &amp; consultants
              </div>

              {/* Headline */}
              <h1 className="text-[2.75rem] font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-[4.25rem]">
                L&apos;ecosysteme{" "}
                <span className="relative inline-block">
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT}, ${ACCENT})`,
                    }}
                  >
                    complet
                  </span>
                  <span
                    className="absolute -bottom-1 left-0 h-px w-full"
                    style={{
                      backgroundImage: `linear-gradient(to right, transparent, ${ACCENT}66, transparent)`,
                    }}
                    aria-hidden="true"
                  />
                </span>{" "}
                pour atteindre les 10 000&euro; par mois
              </h1>

              {/* Subheadline */}
              <p className="mx-auto mt-6 max-w-xl text-[1.125rem] leading-relaxed text-white/45 sm:text-lg">
                CRM, formation, messagerie, appels video, gamification et IA
                centralises dans une seule plateforme. Fini la fragmentation
                entre Slack, Skool et Google Docs.
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/signup">
                  <button
                    type="button"
                    className="group flex h-12 items-center gap-2 rounded-xl px-7 text-[15px] font-semibold text-[#0C0A09] transition-all duration-300 hover:shadow-[0_0_60px_rgba(245,158,11,0.25)] active:scale-[0.98]"
                    style={{
                      background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
                      boxShadow: `0 0 40px ${ACCENT_GLOW}, 0 1px 2px rgba(0,0,0,0.2)`,
                    }}
                  >
                    Demander un acces
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>
                </Link>
                <a href="#features">
                  <button
                    type="button"
                    className="h-12 rounded-xl border border-white/[0.08] bg-white/[0.03] px-7 text-[15px] font-medium text-white/70 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-white"
                  >
                    Decouvrir la plateforme
                  </button>
                </a>
              </div>

              {/* Trust pills */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-[13px] text-white/50">
                <span className="flex items-center gap-1.5">
                  <Shield className="size-3.5" />
                  Acces sur invitation
                </span>
                <span className="h-3 w-px bg-white/10" aria-hidden="true" />
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  Setup en 5 min
                </span>
                <span className="h-3 w-px bg-white/10" aria-hidden="true" />
                <span className="flex items-center gap-1.5">
                  <Zap className="size-3.5" />
                  Donnees securisees RGPD
                </span>
              </div>
            </div>

            {/* Mockup */}
            <div className="mx-auto mt-16 max-w-4xl sm:mt-20">
              <DashboardMockup />
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/*  2. STATS                                                       */}
        {/* ============================================================== */}
        <section
          ref={statsSection.ref}
          className="relative border-y border-white/[0.04] py-16 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="mb-10 text-center text-[13px] font-medium uppercase tracking-[0.15em] text-white/30">
              Deja adopte par des professionnels ambitieux
            </p>
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
              {stats.map((stat, i) => (
                <div key={stat.label} className="text-center">
                  <div
                    className={`text-4xl font-bold tracking-tight text-white sm:text-5xl transition-all duration-700 ${
                      statsSection.isInView
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                    style={{ transitionDelay: `${i * 150}ms` }}
                  >
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                      isInView={statsSection.isInView}
                    />
                  </div>
                  <div
                    className={`mt-2 text-[13px] font-medium tracking-wide text-white/50 uppercase transition-all duration-700 ${
                      statsSection.isInView
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                    style={{ transitionDelay: `${i * 150 + 100}ms` }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/*  3. FEATURES                                                    */}
        {/* ============================================================== */}
        <section
          id="features"
          ref={featuresSection.ref}
          className="scroll-mt-20 py-24 sm:py-32 lg:py-40"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <FadeIn
              isInView={featuresSection.isInView}
              className="mx-auto max-w-2xl text-center"
            >
              <p
                className="mb-4 text-[13px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: `${ACCENT}B3` }}
              >
                Fonctionnalites
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem]">
                Tout ce dont vous avez besoin,
                <br className="hidden sm:block" />
                <span className="text-white/40">dans un seul endroit</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/50 sm:text-lg">
                Une suite d&apos;outils premium concue pour les freelances,
                coachs et consultants qui visent l&apos;excellence.
              </p>
            </FadeIn>

            <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-20 lg:grid-cols-3">
              {features.map((feature, i) => (
                <article
                  key={feature.title}
                  className={`group relative overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.02] p-7 transition-all duration-500 hover:border-white/[0.08] hover:bg-white/[0.04] hover:scale-[1.02] sm:p-8 ${
                    featuresSection.isInView
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div
                    className={`pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br ${feature.gradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100`}
                    aria-hidden="true"
                  />
                  <div className="relative">
                    <div className="mb-5 flex size-10 items-center justify-center rounded-lg bg-white/[0.06] text-white/70 transition-colors duration-300 group-hover:bg-red-700/10 group-hover:text-red-400">
                      <feature.icon className="size-5" />
                    </div>
                    <h3 className="text-[15px] font-semibold tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="mt-2.5 text-[14px] leading-relaxed text-white/50">
                      {feature.desc}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/*  4. HOW IT WORKS                                                */}
        {/* ============================================================== */}
        <section
          id="how-it-works"
          ref={howSection.ref}
          className="scroll-mt-20 border-y border-white/[0.04] bg-[#0A0908] py-24 sm:py-32 lg:py-40"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <FadeIn
              isInView={howSection.isInView}
              className="mx-auto max-w-2xl text-center"
            >
              <p
                className="mb-4 text-[13px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: `${ACCENT}B3` }}
              >
                Comment ca marche
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Operationnel en <span className="text-white/40">3 etapes</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/50 sm:text-lg">
                De la configuration au scaling, tout est fluide et intuitif.
              </p>
            </FadeIn>

            <div className="relative mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 lg:mt-20">
              <div
                className="pointer-events-none absolute top-16 left-[16.66%] hidden h-px w-[66.66%] md:block"
                aria-hidden="true"
                style={{
                  backgroundImage: `linear-gradient(to right, ${ACCENT}33, ${ACCENT}1A, ${ACCENT}33)`,
                }}
              />

              {steps.map((step, i) => (
                <FadeIn
                  key={step.number}
                  isInView={howSection.isInView}
                  delay={i * 120}
                  className="relative text-center"
                >
                  <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
                    <step.icon className="size-6 text-red-400/70" />
                  </div>
                  <div
                    className="mb-3 text-[12px] font-bold tracking-[0.2em]"
                    style={{ color: `${ACCENT}80` }}
                  >
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mx-auto mt-2.5 max-w-xs text-[14px] leading-relaxed text-white/50">
                    {step.desc}
                  </p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/*  5. POURQUOI OFF-MARKET                                         */}
        {/* ============================================================== */}
        <section
          id="why"
          ref={whySection.ref}
          className="scroll-mt-20 py-24 sm:py-32 lg:py-40"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <FadeIn
              isInView={whySection.isInView}
              className="mx-auto max-w-2xl text-center"
            >
              <p
                className="mb-4 text-[13px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: `${ACCENT}B3` }}
              >
                Pourquoi Off-Market
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Plus qu&apos;un outil,{" "}
                <span className="text-white/40">un avantage competitif</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/50 sm:text-lg">
                Vos eleves meritent mieux qu&apos;un patchwork de SaaS
                generiques.
              </p>
            </FadeIn>

            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3 lg:mt-20">
              {valueProps.map((vp, i) => (
                <article
                  key={vp.title}
                  className={`group relative overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.02] p-7 transition-all duration-500 hover:border-white/[0.08] hover:bg-white/[0.04] sm:p-8 ${
                    whySection.isInView
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="mb-5 flex size-10 items-center justify-center rounded-lg bg-red-700/10 text-red-400">
                    <vp.icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {vp.title}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-white/50">
                    {vp.desc}
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {vp.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-[13px] text-white/55"
                      >
                        <Check className="mt-0.5 size-3.5 shrink-0 text-red-400/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/*  6. TESTIMONIALS                                                */}
        {/* ============================================================== */}
        <section
          id="testimonials"
          ref={testimonialsSection.ref}
          className="scroll-mt-20 border-y border-white/[0.04] bg-[#0A0908] py-24 sm:py-32 lg:py-40"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <FadeIn
              isInView={testimonialsSection.isInView}
              className="mx-auto max-w-2xl text-center"
            >
              <p
                className="mb-4 text-[13px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: `${ACCENT}B3` }}
              >
                Temoignages
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ils ont transforme leur activite
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/50 sm:text-lg">
                Decouvrez les retours de professionnels qui utilisent Off-Market
                au quotidien.
              </p>
            </FadeIn>

            <div className="mt-16 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 lg:mt-20">
              {testimonials.map((t, i) => (
                <article
                  key={t.name}
                  className={`group relative overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.02] p-7 transition-all duration-500 hover:border-white/[0.08] hover:bg-white/[0.04] sm:p-8 ${
                    testimonialsSection.isInView
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  {/* Metric badge */}
                  <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-red-700/10 bg-red-700/[0.06] px-3 py-1 text-[12px] font-medium text-red-400/80">
                    <TrendingUp className="size-3" />
                    {t.metric}
                  </div>

                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star
                        key={idx}
                        className="size-3.5 fill-red-400/80 text-red-400/80"
                      />
                    ))}
                  </div>

                  <blockquote className="text-[14px] leading-relaxed text-white/55">
                    <Quote className="mb-2 size-4 text-white/15" />
                    {t.text}
                  </blockquote>

                  <div className="mt-6 flex items-center gap-3 border-t border-white/[0.04] pt-5">
                    <div className="flex size-9 items-center justify-center rounded-full bg-white/[0.06] text-[13px] font-semibold text-white/60">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-white/80">
                        {t.name}
                      </div>
                      <div className="text-[12px] text-white/50">{t.role}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/*  7. CTA FINAL                                                   */}
        {/* ============================================================== */}
        <section
          ref={ctaSection.ref}
          className="relative overflow-hidden py-24 sm:py-32 lg:py-40"
        >
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <div
              className="absolute left-1/2 bottom-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full blur-[160px]"
              style={{ backgroundColor: `${ACCENT}08` }}
            />
          </div>
          <FadeIn
            isInView={ctaSection.isInView}
            className="relative mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8"
          >
            <div className="mb-6 inline-flex items-center justify-center">
              <Sparkles className="size-6 text-red-400/60" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Pret a offrir une experience
              <br />
              <span className="text-white/40">exceptionnelle</span> a vos eleves
              ?
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-white/50 sm:text-lg">
              Rejoignez les professionnels qui ont fait le choix de
              l&apos;excellence. Demandez votre acces des maintenant.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <Link href="/signup">
                <button
                  type="button"
                  className="group flex h-13 items-center gap-2 rounded-xl px-10 text-[15px] font-semibold text-[#0C0A09] transition-all duration-300 hover:shadow-[0_0_60px_rgba(245,158,11,0.25)] active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
                    boxShadow: `0 0 40px ${ACCENT_GLOW}`,
                  }}
                >
                  Demander un acces
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </Link>
              <span className="text-[13px] text-white/45">
                Plateforme sur invitation uniquement
              </span>
            </div>
          </FadeIn>
        </section>
      </main>

      {/* ================================================================ */}
      {/*  8. FOOTER                                                        */}
      {/* ================================================================ */}
      <footer className="border-t border-white/[0.04] bg-[#0A0908] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <div
                  className="flex size-7 items-center justify-center rounded-md"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
                  }}
                >
                  <Crown className="size-3.5 text-[#0C0A09]" />
                </div>
                <span className="text-[15px] font-bold">Off-Market</span>
              </Link>
              <p className="mt-4 max-w-[220px] text-[13px] leading-relaxed text-white/50">
                La plateforme tout-en-un pour freelances, coachs et consultants
                qui visent les 10K&euro;/mois.
              </p>
            </div>

            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-white/40">
                  {section.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-[13px] text-white/50 transition-colors duration-200 hover:text-white/70"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 border-t border-white/[0.04] pt-8 text-center text-[12px] text-white/45">
            &copy; {new Date().getFullYear()} Off-Market. Tous droits reserves.
          </div>
        </div>
      </footer>
    </div>
  );
}
