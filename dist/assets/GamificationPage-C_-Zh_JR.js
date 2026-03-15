import { u as x, a as E, b as K, j as e } from "./vendor-query-sBpsl8Kt.js";
import { r as j } from "./vendor-react-Cci7g3Cb.js";
import { s as u, S as h, c as d, i as D } from "./index-DY9GA2La.js";
import {
  t as P,
  aM as v,
  ah as T,
  aN as N,
  aO as q,
  T as p,
  as as M,
  aP as A,
  aQ as L,
  aR as B,
  W as I,
  e as k,
  aS as C,
} from "./vendor-ui-DDdrexJZ.js";
import { C as y, d as w } from "./card-Dkj99_H3.js";
import { B as b } from "./badge-CFrXqKTx.js";
import { T as O, a as _ } from "./tabs-oT6f7FFv.js";
import { u as Q } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
async function f() {
  const {
    data: { user: s },
    error: t,
  } = await u.auth.getUser();
  if (t || !s) throw new Error("Utilisateur non connecté");
  return s.id;
}
function $() {
  return x({
    queryKey: ["gamification", "my-xp"],
    queryFn: async () => {
      const s = await f(),
        { data: t, error: a } = await u
          .from("xp_transactions")
          .select("xp_amount")
          .eq("profile_id", s);
      if (a) throw a;
      return t.reduce((r, c) => r + c.xp_amount, 0);
    },
  });
}
function U(s = 1, t = 20) {
  const a = (s - 1) * t,
    n = a + t - 1;
  return x({
    queryKey: ["gamification", "xp-history", s],
    queryFn: async () => {
      const r = await f(),
        {
          data: c,
          error: o,
          count: i,
        } = await u
          .from("xp_transactions")
          .select("*", { count: "exact" })
          .eq("profile_id", r)
          .order("created_at", { ascending: !1 })
          .range(a, n);
      if (o) throw o;
      return { data: c, count: i ?? 0 };
    },
  });
}
function V() {
  return x({
    queryKey: ["gamification", "levels"],
    queryFn: async () => {
      const { data: s, error: t } = await u
        .from("level_config")
        .select("*")
        .order("level", { ascending: !0 });
      if (t) throw t;
      return s;
    },
    staleTime: 1e3 * 60 * 60,
  });
}
function H() {
  return x({
    queryKey: ["gamification", "badges"],
    queryFn: async () => {
      const { data: s, error: t } = await u
        .from("badges")
        .select("*")
        .eq("is_active", !0)
        .order("category", { ascending: !0 });
      if (t) throw t;
      return s;
    },
    staleTime: 1e3 * 60 * 30,
  });
}
function X() {
  return x({
    queryKey: ["gamification", "my-badges"],
    queryFn: async () => {
      const s = await f(),
        { data: t, error: a } = await u
          .from("user_badges")
          .select("*, badge:badges(*)")
          .eq("profile_id", s)
          .order("earned_at", { ascending: !1 });
      if (a) throw a;
      return t;
    },
  });
}
function Y() {
  return x({
    queryKey: ["gamification", "challenges"],
    queryFn: async () => {
      const s = new Date().toISOString(),
        { data: t, error: a } = await u
          .from("challenges")
          .select("*")
          .eq("is_active", !0)
          .or(`ends_at.is.null,ends_at.gte.${s}`)
          .order("created_at", { ascending: !1 });
      if (a) throw a;
      return t;
    },
  });
}
function G() {
  return x({
    queryKey: ["gamification", "my-participations"],
    queryFn: async () => {
      const s = await f(),
        { data: t, error: a } = await u
          .from("challenge_participants")
          .select("*")
          .eq("profile_id", s);
      if (a) throw a;
      return t;
    },
  });
}
function J() {
  const s = E();
  return K({
    mutationFn: async (t) => {
      const a = await f(),
        { data: n, error: r } = await u
          .from("challenge_participants")
          .insert({
            challenge_id: t,
            profile_id: a,
            progress: 0,
            completed: !1,
          })
          .select()
          .single();
      if (r) throw r;
      return n;
    },
    onSuccess: () => {
      (s.invalidateQueries({ queryKey: ["gamification", "my-participations"] }),
        s.invalidateQueries({ queryKey: ["gamification", "challenges"] }),
        P.success("Vous avez rejoint le defi !"));
    },
    onError: (t) => {
      P.error(`Erreur: ${t.message}`);
    },
  });
}
const W = {
  trophy: k,
  star: C,
  flame: q,
  target: p,
  zap: v,
  medal: N,
  crown: A,
  clock: M,
  trending_up: T,
  award: B,
  shield_check: L,
  sparkles: I,
};
function F({ name: s, className: t }) {
  const a = W[s ?? ""] ?? C;
  return e.jsx(a, { className: t });
}
const S = {
    commun: {
      badge: "bg-zinc-100 text-zinc-600",
      border: "border-zinc-200",
      bg: "from-zinc-50 to-zinc-100/50",
    },
    rare: {
      badge: "bg-blue-100 text-blue-700",
      border: "border-blue-200",
      bg: "from-blue-50 to-blue-100/50",
    },
    epique: {
      badge: "bg-purple-100 text-purple-700",
      border: "border-purple-200",
      bg: "from-purple-50 to-purple-100/50",
    },
    legendaire: {
      badge: "bg-amber-100 text-amber-700",
      border: "border-amber-200",
      bg: "from-amber-50 to-amber-100/50",
    },
  },
  Z = {
    commun: "Commun",
    rare: "Rare",
    epique: "Épique",
    legendaire: "Légendaire",
  };
function R(s, t) {
  return (
    [...t].sort((n, r) => r.min_xp - n.min_xp).find((n) => s >= n.min_xp) ??
    t[0] ?? { level: 1, name: "Débutant", min_xp: 0, icon: "star", color: null }
  );
}
function ee(s, t) {
  return t.find((a) => a.level === s.level + 1) ?? null;
}
function se(s, t, a) {
  if (!a) return 100;
  const n = a.min_xp - t.min_xp;
  if (n <= 0) return 100;
  const r = s - t.min_xp;
  return Math.min(100, Math.round((r / n) * 100));
}
const te = {
    lead_created: "Nouveau lead créé",
    call_completed: "Appel réalisé",
    deal_closed: "Deal conclu",
    message_sent: "Message envoyé",
    formation_completed: "Formation terminée",
    ritual_completed: "Rituel complété",
    daily_login: "Connexion quotidienne",
    badge_earned: "Badge obtenu",
    challenge_completed: "Défi terminé",
  },
  ae = {
    lead_created: p,
    call_completed: v,
    deal_closed: k,
    message_sent: I,
    formation_completed: B,
    ritual_completed: L,
    daily_login: q,
    badge_earned: N,
    challenge_completed: A,
  };
function re({ xp: s, levels: t }) {
  const a = R(s, t),
    n = ee(a, t),
    r = se(s, a, n);
  return e.jsx(y, {
    className:
      "overflow-hidden border-0 bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 text-white shadow-lg shadow-red-500/20",
    children: e.jsxs(w, {
      className: "p-6",
      children: [
        e.jsxs("div", {
          className: "flex items-center justify-between mb-4",
          children: [
            e.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                e.jsx("div", {
                  className:
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm",
                  children: e.jsx(F, {
                    name: a.icon,
                    className: "h-6 w-6 text-white",
                  }),
                }),
                e.jsxs("div", {
                  children: [
                    e.jsxs("p", {
                      className: "text-sm font-medium text-white/80",
                      children: ["Niveau ", a.level],
                    }),
                    e.jsx("p", {
                      className: "text-xl font-bold",
                      children: a.name,
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs("div", {
              className: "text-right",
              children: [
                e.jsx("p", {
                  className: "text-3xl font-bold",
                  children: s.toLocaleString("fr-FR"),
                }),
                e.jsx("p", {
                  className: "text-sm text-white/80",
                  children: "XP total",
                }),
              ],
            }),
          ],
        }),
        n
          ? e.jsxs("div", {
              children: [
                e.jsxs("div", {
                  className: "flex items-center justify-between mb-2 text-sm",
                  children: [
                    e.jsxs("span", {
                      className: "text-white/80",
                      children: ["Progression vers ", n.name],
                    }),
                    e.jsxs("span", {
                      className: "font-semibold",
                      children: [r, "%"],
                    }),
                  ],
                }),
                e.jsx("div", {
                  className:
                    "h-3 w-full rounded-full bg-white/20 overflow-hidden",
                  children: e.jsx("div", {
                    className:
                      "h-full rounded-full bg-white transition-all duration-700 ease-out",
                    style: { width: `${r}%` },
                  }),
                }),
                e.jsxs("p", {
                  className: "mt-2 text-xs text-white/60",
                  children: [
                    (n.min_xp - s).toLocaleString("fr-FR"),
                    " XP restants",
                  ],
                }),
              ],
            })
          : e.jsx("p", {
              className: "text-sm text-white/80",
              children: "Niveau maximum atteint !",
            }),
      ],
    }),
  });
}
function ne({ xp: s, level: t, badgesCount: a }) {
  const n = [
    {
      label: "XP Total",
      value: s.toLocaleString("fr-FR"),
      icon: v,
      color: "text-amber-500",
      bgLight: "bg-amber-50",
    },
    {
      label: "Niveau actuel",
      value: `Niv. ${t.level}`,
      icon: T,
      color: "text-blue-500",
      bgLight: "bg-blue-50",
    },
    {
      label: "Badges gagnés",
      value: a.toString(),
      icon: N,
      color: "text-purple-500",
      bgLight: "bg-purple-50",
    },
    {
      label: "Streak actuel",
      value: "--",
      icon: q,
      color: "text-rose-500",
      bgLight: "bg-rose-50",
    },
  ];
  return e.jsx("div", {
    className: "grid grid-cols-2 lg:grid-cols-4 gap-4",
    children: n.map((r) =>
      e.jsx(
        y,
        {
          className: "group",
          children: e.jsx(w, {
            className: "p-5",
            children: e.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                e.jsx("div", {
                  className: d(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    r.bgLight,
                  ),
                  children: e.jsx(r.icon, { className: d("h-5 w-5", r.color) }),
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("p", {
                      className: "text-2xl font-bold text-foreground",
                      children: r.value,
                    }),
                    e.jsx("p", {
                      className: "text-xs text-muted-foreground",
                      children: r.label,
                    }),
                  ],
                }),
              ],
            }),
          }),
        },
        r.label,
      ),
    ),
  });
}
function ie({ badge: s, earned: t }) {
  const a = s.rarity ?? "commun",
    n = S[a] ?? S.commun;
  return e.jsxs(y, {
    className: d(
      "relative overflow-hidden transition-all duration-300",
      t
        ? d("border", n.border, "shadow-md")
        : "opacity-50 grayscale border-border/30",
    ),
    children: [
      e.jsx("div", {
        className: d(
          "absolute inset-0 bg-gradient-to-br opacity-40",
          t ? n.bg : "from-gray-50 to-gray-100",
        ),
      }),
      e.jsx(w, {
        className: "relative p-5",
        children: e.jsxs("div", {
          className: "flex flex-col items-center text-center gap-3",
          children: [
            e.jsx("div", {
              className: d(
                "flex h-14 w-14 items-center justify-center rounded-2xl",
                t ? "bg-white shadow-sm" : "bg-muted",
              ),
              children: e.jsx(F, {
                name: s.icon,
                className: d(
                  "h-7 w-7",
                  t ? "text-foreground" : "text-muted-foreground",
                ),
              }),
            }),
            e.jsxs("div", {
              children: [
                e.jsx("p", {
                  className: "font-semibold text-sm text-foreground",
                  children: s.name,
                }),
                s.description &&
                  e.jsx("p", {
                    className:
                      "mt-1 text-xs text-muted-foreground line-clamp-2",
                    children: s.description,
                  }),
              ],
            }),
            e.jsxs("div", {
              className: "flex items-center gap-2",
              children: [
                e.jsx(b, {
                  className: d("text-[10px]", n.badge),
                  children: Z[a] ?? a,
                }),
                s.xp_reward > 0 &&
                  e.jsxs(b, {
                    variant: "outline",
                    className: "text-[10px]",
                    children: ["+", s.xp_reward, " XP"],
                  }),
              ],
            }),
            t &&
              e.jsx("div", {
                className: "absolute top-3 right-3",
                children: e.jsx(L, { className: "h-4 w-4 text-green-500" }),
              }),
          ],
        }),
      }),
    ],
  });
}
function oe() {
  const { data: s, isLoading: t } = H(),
    { data: a, isLoading: n } = X(),
    r = t || n,
    c = j.useMemo(() => new Set(a?.map((i) => i.badge_id) ?? []), [a]);
  if (r)
    return e.jsx("div", {
      className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
      children: Array.from({ length: 8 }).map((i, l) =>
        e.jsx(h, { className: "h-48 w-full rounded-xl" }, l),
      ),
    });
  if (!s?.length)
    return e.jsxs("div", {
      className:
        "flex flex-col items-center justify-center py-16 text-muted-foreground",
      children: [
        e.jsx(N, { className: "h-12 w-12 mb-3 opacity-40" }),
        e.jsx("p", {
          className: "text-sm",
          children: "Aucun badge disponible pour le moment.",
        }),
      ],
    });
  const o = [...s].sort((i, l) => {
    const m = c.has(i.id) ? 0 : 1,
      g = c.has(l.id) ? 0 : 1;
    return m - g;
  });
  return e.jsxs("div", {
    children: [
      e.jsxs("p", {
        className: "text-sm text-muted-foreground mb-4",
        children: [c.size, " / ", s.length, " badges débloqués"],
      }),
      e.jsx("div", {
        className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
        children: o.map((i) =>
          e.jsx(ie, { badge: i, earned: c.has(i.id) }, i.id),
        ),
      }),
    ],
  });
}
function le() {
  const { data: s, isLoading: t } = Y(),
    { data: a, isLoading: n } = G(),
    r = J(),
    c = t || n,
    o = j.useMemo(() => {
      const i = new Map();
      return (
        a?.forEach((l) => {
          i.set(l.challenge_id, {
            progress: l.progress,
            completed: l.completed,
          });
        }),
        i
      );
    }, [a]);
  return c
    ? e.jsx("div", {
        className: "space-y-4",
        children: Array.from({ length: 4 }).map((i, l) =>
          e.jsx(h, { className: "h-28 w-full rounded-xl" }, l),
        ),
      })
    : s?.length
      ? e.jsx("div", {
          className: "space-y-4",
          children: s.map((i) => {
            const l = o.get(i.id),
              m = !!l,
              g = l ? Math.min(100, Math.round(l.progress)) : 0;
            return e.jsx(
              y,
              {
                className: "overflow-hidden",
                children: e.jsx(w, {
                  className: "p-5",
                  children: e.jsxs("div", {
                    className: "flex items-start justify-between gap-4",
                    children: [
                      e.jsxs("div", {
                        className: "flex items-start gap-4 flex-1",
                        children: [
                          e.jsx("div", {
                            className:
                              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-50 to-orange-50",
                            children: e.jsx(p, {
                              className: "h-5 w-5 text-rose-500",
                            }),
                          }),
                          e.jsxs("div", {
                            className: "flex-1 min-w-0",
                            children: [
                              e.jsxs("div", {
                                className: "flex items-center gap-2 mb-1",
                                children: [
                                  e.jsx("p", {
                                    className: "font-semibold text-foreground",
                                    children: i.title,
                                  }),
                                  l?.completed &&
                                    e.jsx(b, {
                                      variant: "success",
                                      className: "text-[10px]",
                                      children: "Terminé",
                                    }),
                                ],
                              }),
                              i.description &&
                                e.jsx("p", {
                                  className:
                                    "text-sm text-muted-foreground mb-3",
                                  children: i.description,
                                }),
                              m &&
                                e.jsxs("div", {
                                  children: [
                                    e.jsxs("div", {
                                      className:
                                        "flex items-center justify-between mb-1.5 text-xs text-muted-foreground",
                                      children: [
                                        e.jsx("span", {
                                          children: "Progression",
                                        }),
                                        e.jsxs("span", {
                                          className:
                                            "font-medium text-foreground",
                                          children: [g, "%"],
                                        }),
                                      ],
                                    }),
                                    e.jsx("div", {
                                      className:
                                        "h-2 w-full rounded-full bg-muted overflow-hidden",
                                      children: e.jsx("div", {
                                        className: d(
                                          "h-full rounded-full transition-all duration-500",
                                          l?.completed
                                            ? "bg-green-500"
                                            : "bg-gradient-to-r from-rose-500 to-orange-500",
                                        ),
                                        style: { width: `${g}%` },
                                      }),
                                    }),
                                  ],
                                }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "flex flex-col items-end gap-2 shrink-0",
                        children: [
                          e.jsxs(b, {
                            variant: "outline",
                            className: "text-xs whitespace-nowrap",
                            children: [
                              e.jsx(v, { className: "h-3 w-3 mr-1" }),
                              "+",
                              i.xp_reward,
                              " XP",
                            ],
                          }),
                          !m &&
                            e.jsx("button", {
                              onClick: () => r.mutate(i.id),
                              disabled: r.isPending,
                              className: d(
                                "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium",
                                "bg-gradient-to-r from-rose-500 to-orange-500 text-white",
                                "shadow-sm shadow-rose-500/20",
                                "hover:shadow-md hover:shadow-rose-500/30 transition-all duration-200",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                "cursor-pointer",
                              ),
                              children: "Rejoindre",
                            }),
                        ],
                      }),
                    ],
                  }),
                }),
              },
              i.id,
            );
          }),
        })
      : e.jsxs("div", {
          className:
            "flex flex-col items-center justify-center py-16 text-muted-foreground",
          children: [
            e.jsx(p, { className: "h-12 w-12 mb-3 opacity-40" }),
            e.jsx("p", {
              className: "text-sm",
              children: "Aucun défi actif pour le moment.",
            }),
          ],
        });
}
function ce() {
  const [s, t] = j.useState(1),
    { data: a, isLoading: n } = U(s);
  if (n)
    return e.jsx("div", {
      className: "space-y-3",
      children: Array.from({ length: 6 }).map((o, i) =>
        e.jsx(h, { className: "h-14 w-full rounded-xl" }, i),
      ),
    });
  const r = a?.data ?? [],
    c = Math.ceil((a?.count ?? 0) / 20);
  return r.length === 0
    ? e.jsxs("div", {
        className:
          "flex flex-col items-center justify-center py-16 text-muted-foreground",
        children: [
          e.jsx(M, { className: "h-12 w-12 mb-3 opacity-40" }),
          e.jsx("p", {
            className: "text-sm",
            children: "Aucune transaction XP pour le moment.",
          }),
        ],
      })
    : e.jsxs("div", {
        className: "space-y-4",
        children: [
          e.jsx("div", {
            className: "space-y-2",
            children: r.map((o) => {
              const i = ae[o.action] ?? C,
                l = te[o.action] ?? o.action,
                m = o.xp_amount >= 0;
              return e.jsxs(
                "div",
                {
                  className:
                    "flex items-center gap-4 rounded-xl border border-border/40 bg-white p-4 transition-colors hover:bg-muted/20",
                  children: [
                    e.jsx("div", {
                      className:
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/50",
                      children: e.jsx(i, {
                        className: "h-5 w-5 text-muted-foreground",
                      }),
                    }),
                    e.jsxs("div", {
                      className: "flex-1 min-w-0",
                      children: [
                        e.jsx("p", {
                          className: "text-sm font-medium text-foreground",
                          children: l,
                        }),
                        e.jsx("p", {
                          className: "text-xs text-muted-foreground",
                          children: D(o.created_at),
                        }),
                      ],
                    }),
                    e.jsxs("span", {
                      className: d(
                        "text-sm font-bold tabular-nums",
                        m ? "text-green-600" : "text-red-500",
                      ),
                      children: [m ? "+" : "", o.xp_amount, " XP"],
                    }),
                  ],
                },
                o.id,
              );
            }),
          }),
          c > 1 &&
            e.jsxs("div", {
              className: "flex items-center justify-center gap-2 pt-2",
              children: [
                e.jsx("button", {
                  onClick: () => t((o) => Math.max(1, o - 1)),
                  disabled: s <= 1,
                  className:
                    "rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors",
                  children: "Précédent",
                }),
                e.jsxs("span", {
                  className: "text-sm text-muted-foreground",
                  children: [s, " / ", c],
                }),
                e.jsx("button", {
                  onClick: () => t((o) => Math.min(c, o + 1)),
                  disabled: s >= c,
                  className:
                    "rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors",
                  children: "Suivant",
                }),
              ],
            }),
        ],
      });
}
const de = [
  { value: "badges", label: "Badges" },
  { value: "defis", label: "Défis" },
  { value: "historique", label: "Historique XP" },
];
function Ne() {
  Q("Progression");
  const [s, t] = j.useState("badges"),
    { data: a, isLoading: n } = $(),
    { data: r, isLoading: c } = V(),
    { data: o } = X(),
    i = n || c,
    l = a ?? 0,
    m = r?.length
      ? R(l, r)
      : { level: 1, name: "Débutant", min_xp: 0, icon: "star", color: null };
  return e.jsxs("div", {
    className: "space-y-8",
    children: [
      e.jsxs("div", {
        children: [
          e.jsx("h1", {
            className: "text-xl sm:text-2xl font-bold text-foreground",
            children: "Progression",
          }),
          e.jsx("p", {
            className: "mt-1 text-sm text-muted-foreground",
            children:
              "Gagnez de l'XP, débloquez des badges et relevez des défis.",
          }),
        ],
      }),
      i
        ? e.jsx(h, { className: "h-44 w-full rounded-xl" })
        : r?.length
          ? e.jsx(re, { xp: l, levels: r })
          : null,
      i
        ? e.jsx("div", {
            className: "grid grid-cols-2 lg:grid-cols-4 gap-4",
            children: Array.from({ length: 4 }).map((g, z) =>
              e.jsx(h, { className: "h-24 w-full rounded-xl" }, z),
            ),
          })
        : e.jsx(ne, { xp: l, level: m, badgesCount: o?.length ?? 0 }),
      e.jsxs("div", {
        children: [
          e.jsx(O, { tabs: de, value: s, onChange: t }),
          e.jsx(_, {
            value: "badges",
            activeValue: s,
            children: e.jsx(oe, {}),
          }),
          e.jsx(_, { value: "defis", activeValue: s, children: e.jsx(le, {}) }),
          e.jsx(_, {
            value: "historique",
            activeValue: s,
            children: e.jsx(ce, {}),
          }),
        ],
      }),
    ],
  });
}
export { Ne as default };
