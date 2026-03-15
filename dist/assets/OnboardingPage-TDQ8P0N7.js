import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { f as A, r as m } from "./vendor-react-Cci7g3Cb.js";
import {
  y as I,
  aE as P,
  T as E,
  aX as g,
  J as R,
  N as _,
  ag as F,
  av as V,
  q as z,
  V as y,
  t as v,
} from "./vendor-ui-DDdrexJZ.js";
import { j as N, O as L, c, s as w } from "./index-DY9GA2La.js";
import { u as M } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
const B = {
    fullName: "",
    phone: "",
    activity: "",
    experience: "",
    currentRevenue: "",
    goal: "",
    challenges: [],
    source: "",
  },
  D = [
    "Coach / Consultant",
    "Freelance (dev, design, marketing…)",
    "Formateur / Infopreneur",
    "Commercial indépendant",
    "Autre",
  ],
  U = ["Moins de 6 mois", "6 mois – 1 an", "1 – 3 ans", "Plus de 3 ans"],
  q = [
    "Moins de 2 000 €/mois",
    "2 000 – 5 000 €/mois",
    "5 000 – 10 000 €/mois",
    "Plus de 10 000 €/mois",
  ],
  G = [
    "Atteindre 5 000 €/mois",
    "Atteindre 10 000 €/mois",
    "Dépasser 10 000 €/mois",
    "Structurer mon activité",
  ],
  X = [
    "Trouver des clients",
    "Organiser mon temps",
    "Closer les ventes",
    "Fixer mes prix",
    "Créer du contenu",
    "Tenir un suivi régulier",
  ],
  H = [
    "Instagram",
    "Bouche à oreille",
    "Recommandation",
    "LinkedIn",
    "Recherche Google",
    "Autre",
  ],
  h = [
    { id: "profil", label: "Profil", icon: I },
    { id: "activite", label: "Activité", icon: P },
    { id: "objectifs", label: "Objectifs", icon: E },
    { id: "bienvenue", label: "C'est parti !", icon: g },
  ];
function J({ currentStep: l }) {
  return e.jsx("div", {
    className: "flex items-center gap-2",
    children: h.map((n, o) => {
      const r = n.icon,
        x = o === l,
        t = o < l;
      return e.jsxs(
        "div",
        {
          className: "flex items-center gap-2",
          children: [
            o > 0 &&
              e.jsx("div", {
                className: c(
                  "h-px w-6 sm:w-10 transition-colors duration-300",
                  t ? "bg-red-400" : "bg-border",
                ),
              }),
            e.jsx("div", {
              className: c(
                "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300",
                x
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                  : t
                    ? "bg-red-100 text-red-600"
                    : "bg-muted text-muted-foreground",
              ),
              children: t
                ? e.jsx(y, { className: "h-4 w-4" })
                : e.jsx(r, { className: "h-4 w-4" }),
            }),
          ],
        },
        n.id,
      );
    }),
  });
}
function u({ label: l, selected: n, onClick: o }) {
  return e.jsx("button", {
    type: "button",
    onClick: o,
    className: c(
      "rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 text-left cursor-pointer",
      n
        ? "border-red-400 bg-red-50 text-red-700 shadow-sm"
        : "border-border bg-white text-foreground hover:border-red-200 hover:bg-red-50/30",
    ),
    children: l,
  });
}
function Q({ label: l, selected: n, onClick: o }) {
  return e.jsxs("button", {
    type: "button",
    onClick: o,
    className: c(
      "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer",
      n
        ? "border-red-400 bg-red-50 text-red-700 shadow-sm"
        : "border-border bg-white text-foreground hover:border-red-200 hover:bg-red-50/30",
    ),
    children: [
      e.jsx("div", {
        className: c(
          "flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-200",
          n ? "border-red-500 bg-red-500" : "border-border",
        ),
        children: n && e.jsx(y, { className: "h-3 w-3 text-white" }),
      }),
      l,
    ],
  });
}
function te() {
  M("Bienvenue");
  const l = A(),
    n = N((s) => s.profile),
    o = N((s) => s.setProfile),
    [r, x] = m.useState(0),
    [t, p] = m.useState({
      ...B,
      fullName: n?.full_name ?? "",
      phone: n?.phone ?? "",
    }),
    [f, b] = m.useState(!1),
    i = m.useCallback((s, a) => {
      p((d) => ({ ...d, [s]: a }));
    }, []),
    C = m.useCallback((s) => {
      p((a) => ({
        ...a,
        challenges: a.challenges.includes(s)
          ? a.challenges.filter((d) => d !== s)
          : [...a.challenges, s],
      }));
    }, []),
    k = () => {
      switch (r) {
        case 0:
          return t.fullName.trim().length >= 2;
        case 1:
          return t.activity !== "" && t.experience !== "";
        case 2:
          return t.goal !== "" && t.challenges.length > 0;
        case 3:
          return !0;
        default:
          return !1;
      }
    },
    O = async () => {
      if (!f) {
        b(!0);
        try {
          const s = { full_name: t.fullName.trim(), onboarding_completed: !0 };
          t.phone.trim() && (s.phone = t.phone.trim());
          const { error: a } = await w
            .from("profiles")
            .update(s)
            .eq("id", n?.id);
          if (a) throw a;
          const d = [
            {
              step: "activity",
              data: { activity: t.activity, experience: t.experience },
            },
            { step: "revenue", data: { currentRevenue: t.currentRevenue } },
            { step: "goals", data: { goal: t.goal, challenges: t.challenges } },
            { step: "source", data: { source: t.source } },
          ];
          try {
            await w
              .from("onboarding_responses")
              .insert(d.map((j) => ({ ...j, user_id: n?.id, data: j.data })));
          } catch {}
          (n &&
            o({ ...n, full_name: t.fullName.trim(), onboarding_completed: !0 }),
            v.success("Bienvenue sur Off-Market ! 🎉"),
            l("/", { replace: !0 }));
        } catch {
          v.error("Une erreur est survenue. Réessayez.");
        } finally {
          b(!1);
        }
      }
    },
    S = () => {
      r < h.length - 1 ? x(r + 1) : O();
    },
    T = () => {
      r > 0 && x(r - 1);
    };
  return e.jsxs("div", {
    className:
      "flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-red-50/20",
    children: [
      e.jsxs("header", {
        className: "flex items-center justify-between px-6 py-5 sm:px-10",
        children: [
          e.jsx(L, {
            size: 32,
            showText: !0,
            textClassName: "text-foreground",
          }),
          e.jsxs("span", {
            className: "text-xs text-muted-foreground",
            children: ["Étape ", r + 1, " / ", h.length],
          }),
        ],
      }),
      e.jsx("main", {
        className:
          "flex flex-1 flex-col items-center justify-center px-4 pb-12",
        children: e.jsxs("div", {
          className: "w-full max-w-lg",
          children: [
            e.jsx("div", {
              className: "mb-10 flex justify-center",
              children: e.jsx(J, { currentStep: r }),
            }),
            e.jsx(R, {
              mode: "wait",
              children: e.jsxs(
                _.div,
                {
                  initial: { opacity: 0, x: 20 },
                  animate: { opacity: 1, x: 0 },
                  exit: { opacity: 0, x: -20 },
                  transition: { duration: 0.2 },
                  className: "space-y-6",
                  children: [
                    r === 0 &&
                      e.jsxs(e.Fragment, {
                        children: [
                          e.jsxs("div", {
                            children: [
                              e.jsx("h2", {
                                className: "text-2xl font-bold text-foreground",
                                children: "Bienvenue sur Off-Market",
                              }),
                              e.jsx("p", {
                                className: "mt-2 text-sm text-muted-foreground",
                                children:
                                  "Faisons connaissance pour personnaliser votre expérience.",
                              }),
                            ],
                          }),
                          e.jsxs("div", {
                            className: "space-y-4",
                            children: [
                              e.jsxs("div", {
                                children: [
                                  e.jsx("label", {
                                    className:
                                      "mb-1.5 block text-sm font-medium text-foreground",
                                    children: "Votre nom complet",
                                  }),
                                  e.jsx("input", {
                                    type: "text",
                                    value: t.fullName,
                                    onChange: (s) =>
                                      i("fullName", s.target.value),
                                    placeholder: "Prénom Nom",
                                    className:
                                      "h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none transition-all focus:border-red-400 focus:ring-2 focus:ring-red-400/20",
                                  }),
                                ],
                              }),
                              e.jsxs("div", {
                                children: [
                                  e.jsxs("label", {
                                    className:
                                      "mb-1.5 block text-sm font-medium text-foreground",
                                    children: [
                                      "Téléphone",
                                      " ",
                                      e.jsx("span", {
                                        className: "text-muted-foreground",
                                        children: "(optionnel)",
                                      }),
                                    ],
                                  }),
                                  e.jsx("input", {
                                    type: "tel",
                                    value: t.phone,
                                    onChange: (s) => i("phone", s.target.value),
                                    placeholder: "+33 6 00 00 00 00",
                                    className:
                                      "h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none transition-all focus:border-red-400 focus:ring-2 focus:ring-red-400/20",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    r === 1 &&
                      e.jsxs(e.Fragment, {
                        children: [
                          e.jsxs("div", {
                            children: [
                              e.jsx("h2", {
                                className: "text-2xl font-bold text-foreground",
                                children: "Votre activité",
                              }),
                              e.jsx("p", {
                                className: "mt-2 text-sm text-muted-foreground",
                                children:
                                  "Aidez-nous à comprendre votre situation actuelle.",
                              }),
                            ],
                          }),
                          e.jsxs("div", {
                            className: "space-y-5",
                            children: [
                              e.jsxs("div", {
                                children: [
                                  e.jsx("label", {
                                    className:
                                      "mb-2 block text-sm font-medium text-foreground",
                                    children: "Quel est votre métier ?",
                                  }),
                                  e.jsx("div", {
                                    className: "grid gap-2",
                                    children: D.map((s) =>
                                      e.jsx(
                                        u,
                                        {
                                          label: s,
                                          selected: t.activity === s,
                                          onClick: () => i("activity", s),
                                        },
                                        s,
                                      ),
                                    ),
                                  }),
                                ],
                              }),
                              e.jsxs("div", {
                                children: [
                                  e.jsx("label", {
                                    className:
                                      "mb-2 block text-sm font-medium text-foreground",
                                    children: "Depuis combien de temps ?",
                                  }),
                                  e.jsx("div", {
                                    className: "grid grid-cols-2 gap-2",
                                    children: U.map((s) =>
                                      e.jsx(
                                        u,
                                        {
                                          label: s,
                                          selected: t.experience === s,
                                          onClick: () => i("experience", s),
                                        },
                                        s,
                                      ),
                                    ),
                                  }),
                                ],
                              }),
                              e.jsxs("div", {
                                children: [
                                  e.jsx("label", {
                                    className:
                                      "mb-2 block text-sm font-medium text-foreground",
                                    children: "CA mensuel actuel",
                                  }),
                                  e.jsx("div", {
                                    className: "grid grid-cols-2 gap-2",
                                    children: q.map((s) =>
                                      e.jsx(
                                        u,
                                        {
                                          label: s,
                                          selected: t.currentRevenue === s,
                                          onClick: () => i("currentRevenue", s),
                                        },
                                        s,
                                      ),
                                    ),
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    r === 2 &&
                      e.jsxs(e.Fragment, {
                        children: [
                          e.jsxs("div", {
                            children: [
                              e.jsx("h2", {
                                className: "text-2xl font-bold text-foreground",
                                children: "Vos objectifs",
                              }),
                              e.jsx("p", {
                                className: "mt-2 text-sm text-muted-foreground",
                                children:
                                  "Définissons ensemble ce que vous voulez accomplir.",
                              }),
                            ],
                          }),
                          e.jsxs("div", {
                            className: "space-y-5",
                            children: [
                              e.jsxs("div", {
                                children: [
                                  e.jsx("label", {
                                    className:
                                      "mb-2 block text-sm font-medium text-foreground",
                                    children: "Votre objectif principal",
                                  }),
                                  e.jsx("div", {
                                    className: "grid gap-2",
                                    children: G.map((s) =>
                                      e.jsx(
                                        u,
                                        {
                                          label: s,
                                          selected: t.goal === s,
                                          onClick: () => i("goal", s),
                                        },
                                        s,
                                      ),
                                    ),
                                  }),
                                ],
                              }),
                              e.jsxs("div", {
                                children: [
                                  e.jsxs("label", {
                                    className:
                                      "mb-2 block text-sm font-medium text-foreground",
                                    children: [
                                      "Vos défis actuels",
                                      " ",
                                      e.jsx("span", {
                                        className: "text-muted-foreground",
                                        children: "(plusieurs choix possibles)",
                                      }),
                                    ],
                                  }),
                                  e.jsx("div", {
                                    className: "grid gap-2 sm:grid-cols-2",
                                    children: X.map((s) =>
                                      e.jsx(
                                        Q,
                                        {
                                          label: s,
                                          selected: t.challenges.includes(s),
                                          onClick: () => C(s),
                                        },
                                        s,
                                      ),
                                    ),
                                  }),
                                ],
                              }),
                              e.jsxs("div", {
                                children: [
                                  e.jsx("label", {
                                    className:
                                      "mb-2 block text-sm font-medium text-foreground",
                                    children: "Comment nous avez-vous connu ?",
                                  }),
                                  e.jsx("div", {
                                    className:
                                      "grid grid-cols-2 gap-2 sm:grid-cols-3",
                                    children: H.map((s) =>
                                      e.jsx(
                                        u,
                                        {
                                          label: s,
                                          selected: t.source === s,
                                          onClick: () => i("source", s),
                                        },
                                        s,
                                      ),
                                    ),
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    r === 3 &&
                      e.jsxs("div", {
                        className:
                          "flex flex-col items-center text-center py-6",
                        children: [
                          e.jsx("div", {
                            className:
                              "mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 shadow-xl shadow-red-500/25",
                            children: e.jsx(g, {
                              className: "h-10 w-10 text-white",
                            }),
                          }),
                          e.jsxs("h2", {
                            className: "text-2xl font-bold text-foreground",
                            children: [
                              "Tout est prêt, ",
                              t.fullName.split(" ")[0],
                              " !",
                            ],
                          }),
                          e.jsxs("p", {
                            className:
                              "mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed",
                            children: [
                              "Votre espace Off-Market est configuré. Explorez votre dashboard, découvrez les formations, et commencez à suivre votre progression vers",
                              " ",
                              t.goal ? t.goal.toLowerCase() : "vos objectifs",
                              ".",
                            ],
                          }),
                          e.jsx("div", {
                            className:
                              "mt-8 grid w-full max-w-sm gap-3 text-left",
                            children: [
                              { icon: "📊", text: "Dashboard personnalisé" },
                              { icon: "🎓", text: "Formations accessibles" },
                              {
                                icon: "💬",
                                text: "Messagerie avec votre coach",
                              },
                              { icon: "🏆", text: "Système de progression" },
                            ].map((s) =>
                              e.jsxs(
                                "div",
                                {
                                  className:
                                    "flex items-center gap-3 rounded-xl border border-border/50 bg-white px-4 py-3 shadow-sm",
                                  children: [
                                    e.jsx("span", {
                                      className: "text-lg",
                                      children: s.icon,
                                    }),
                                    e.jsx("span", {
                                      className:
                                        "text-sm font-medium text-foreground",
                                      children: s.text,
                                    }),
                                    e.jsx(F, {
                                      className:
                                        "ml-auto h-4 w-4 text-muted-foreground",
                                    }),
                                  ],
                                },
                                s.text,
                              ),
                            ),
                          }),
                        ],
                      }),
                  ],
                },
                r,
              ),
            }),
            e.jsxs("div", {
              className: "mt-10 flex items-center justify-between",
              children: [
                r > 0
                  ? e.jsxs("button", {
                      onClick: T,
                      className:
                        "flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer",
                      children: [e.jsx(V, { className: "h-4 w-4" }), "Retour"],
                    })
                  : e.jsx("div", {}),
                e.jsx("button", {
                  onClick: S,
                  disabled: !k() || f,
                  className: c(
                    "flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer",
                    "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25",
                    "hover:shadow-xl hover:shadow-red-500/30 hover:from-red-600 hover:to-red-700",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
                  ),
                  children: f
                    ? "Chargement..."
                    : r === h.length - 1
                      ? e.jsxs(e.Fragment, {
                          children: [
                            "Accéder à mon espace",
                            e.jsx(g, { className: "h-4 w-4" }),
                          ],
                        })
                      : e.jsxs(e.Fragment, {
                          children: [
                            "Continuer",
                            e.jsx(z, { className: "h-4 w-4" }),
                          ],
                        }),
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
}
export { te as default };
