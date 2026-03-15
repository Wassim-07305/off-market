import { j as e, u as U } from "./vendor-query-sBpsl8Kt.js";
import { L as Q, r as X, f as q } from "./vendor-react-Cci7g3Cb.js";
import {
  T as Y,
  u as J,
  a as V,
  b as Z,
  c as ee,
} from "./TimeFilter-DReAdz3P.js";
import {
  c as x,
  u as K,
  f as $,
  s as g,
  a as se,
  g as te,
  S as m,
  b as I,
  d as re,
  e as F,
} from "./index-DY9GA2La.js";
import { u as ae } from "./useLeads-TuKFlYpV.js";
import { u as ne } from "./useSetterActivities-CkfYxyYw.js";
import { C as u, a as C, b as k, d as h } from "./card-Dkj99_H3.js";
import {
  N as oe,
  a3 as ie,
  af as le,
  Z as p,
  q as ce,
  U as b,
  E as N,
  A as de,
  ae as me,
  D as G,
  T as W,
  e as y,
  j as xe,
  Q as v,
  d as ue,
  ag as w,
  ah as he,
  z as ge,
  G as fe,
} from "./vendor-ui-DDdrexJZ.js";
import { f as _, g as je, s as pe } from "./vendor-utils-DoLlG-6J.js";
import { E as S } from "./empty-state-BFSeK4Tv.js";
import {
  R as L,
  B as be,
  C as A,
  X as T,
  Y as D,
  T as M,
  a as Ne,
  L as ve,
  b as ye,
  c as B,
  A as we,
  d as Ce,
} from "./vendor-charts-KMfjFgec.js";
import { u as ke } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-supabase-BZ0N5lZN.js";
import "./constants-IBlSVYu1.js";
const _e = {
  red: {
    gradient: "from-red-500 to-rose-600",
    iconBg: "bg-gradient-to-br from-red-100 to-red-50",
    iconText: "text-red-600",
    ringColor: "ring-red-100",
  },
  blue: {
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-gradient-to-br from-blue-100 to-blue-50",
    iconText: "text-blue-600",
    ringColor: "ring-blue-100",
  },
  emerald: {
    gradient: "from-emerald-500 to-green-600",
    iconBg: "bg-gradient-to-br from-emerald-100 to-emerald-50",
    iconText: "text-emerald-600",
    ringColor: "ring-emerald-100",
  },
  amber: {
    gradient: "from-amber-500 to-orange-600",
    iconBg: "bg-gradient-to-br from-amber-100 to-amber-50",
    iconText: "text-amber-600",
    ringColor: "ring-amber-100",
  },
};
function f({
  title: s,
  value: r,
  icon: t,
  trend: a,
  trendLabel: o,
  accent: l = "red",
  index: c = 0,
  subtext: d,
}) {
  const n = a >= 0,
    i = _e[l];
  return e.jsx(oe.div, {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, delay: c * 0.08 },
    children: e.jsxs(u, {
      className: "relative overflow-hidden",
      children: [
        e.jsx("div", {
          className: x(
            "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
            i.gradient,
          ),
        }),
        e.jsx("div", {
          className: x(
            "absolute top-0 right-0 w-20 h-20 bg-gradient-to-br opacity-[0.07] rounded-bl-[40px]",
            i.gradient,
          ),
        }),
        e.jsxs("div", {
          className: "relative p-6",
          children: [
            e.jsxs("div", {
              className: "flex items-start justify-between",
              children: [
                e.jsx("div", {
                  className: x(
                    "flex h-12 w-12 items-center justify-center rounded-xl ring-1",
                    i.iconBg,
                    i.ringColor,
                  ),
                  children: e.jsx(t, {
                    className: x("h-5 w-5", i.iconText),
                    strokeWidth: 2,
                  }),
                }),
                e.jsxs("div", {
                  className: x(
                    "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                    n
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700",
                  ),
                  children: [
                    n
                      ? e.jsx(ie, { className: "h-3 w-3" })
                      : e.jsx(le, { className: "h-3 w-3" }),
                    e.jsxs("span", { children: [Math.abs(a).toFixed(1), "%"] }),
                  ],
                }),
              ],
            }),
            e.jsxs("div", {
              className: "mt-4",
              children: [
                e.jsx("p", {
                  className: "text-sm font-medium text-muted-foreground",
                  children: s,
                }),
                e.jsx("p", {
                  className:
                    "mt-1 text-2xl font-bold tracking-tight text-foreground",
                  children: r,
                }),
                d &&
                  e.jsx("p", {
                    className: "mt-0.5 text-xs text-muted-foreground",
                    children: d,
                  }),
              ],
            }),
            e.jsx("p", {
              className: "mt-2 text-xs text-muted-foreground",
              children: o,
            }),
          ],
        }),
      ],
    }),
  });
}
function Se({ period: s, onPeriodChange: r }) {
  const { profile: t } = K(),
    a = new Date(),
    o = a.getHours(),
    l = o < 12 ? "Bonjour" : o < 18 ? "Bon après-midi" : "Bonsoir",
    c = t?.full_name?.split(" ")[0] ?? "Utilisateur",
    d = _(a, "EEEE d MMMM yyyy", { locale: $ });
  return e.jsxs("div", {
    className:
      "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
    children: [
      e.jsxs("div", {
        children: [
          e.jsxs("h1", {
            className: "text-2xl font-bold text-foreground",
            children: [l, ", ", c],
          }),
          e.jsx("p", {
            className: "mt-1 text-sm text-muted-foreground capitalize",
            children: d,
          }),
        ],
      }),
      e.jsx(Y, { value: s, onChange: r }),
    ],
  });
}
function Le() {
  const s = _(new Date(), "yyyy-MM-dd"),
    { data: r = [] } = U({
      queryKey: ["dashboard-urgent", s],
      queryFn: async () => {
        const t = [],
          { data: a } = await g
            .from("leads")
            .select("id", { count: "exact", head: !0 })
            .eq("status", "premier_message"),
          o = a?.length ?? 0;
        o > 0 &&
          t.push({
            icon: b,
            text: `${o} lead${o > 1 ? "s" : ""} en attente de contact`,
            link: "/pipeline?status=premier_message",
          });
        const { data: l } = await g
            .from("call_calendar")
            .select("id", { count: "exact", head: !0 })
            .eq("date", s)
            .eq("status", "planifié"),
          c = l?.length ?? 0;
        c > 0 &&
          t.push({
            icon: N,
            text: `${c} call${c > 1 ? "s" : ""} prévu${c > 1 ? "s" : ""} aujourd'hui`,
            link: "/calendrier",
          });
        const { data: d } = await g
            .from("payment_schedules")
            .select("id", { count: "exact", head: !0 })
            .lt("due_date", s)
            .eq("is_paid", !1),
          n = d?.length ?? 0;
        return (
          n > 0 &&
            t.push({
              icon: p,
              text: `${n} paiement${n > 1 ? "s" : ""} en retard`,
              link: "/finances",
              warning: !0,
            }),
          t
        );
      },
      refetchInterval: 12e4,
    });
  return r.length === 0
    ? e.jsxs("div", {
        className: "rounded-2xl border border-border/40 bg-white p-5",
        children: [
          e.jsxs("div", {
            className: "flex items-center gap-2 mb-4",
            children: [
              e.jsx("div", {
                className:
                  "flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50",
                children: e.jsx(p, { className: "h-4 w-4 text-emerald-600" }),
              }),
              e.jsx("h3", {
                className: "font-semibold text-foreground",
                children: "Actions urgentes",
              }),
            ],
          }),
          e.jsx("p", {
            className: "text-sm text-muted-foreground",
            children: "Aucune action urgente",
          }),
        ],
      })
    : e.jsxs("div", {
        className: "rounded-2xl border border-border/40 bg-white p-5",
        children: [
          e.jsxs("div", {
            className: "flex items-center gap-2 mb-4",
            children: [
              e.jsx("div", {
                className:
                  "flex h-8 w-8 items-center justify-center rounded-lg bg-red-50",
                children: e.jsx(p, { className: "h-4 w-4 text-red-600" }),
              }),
              e.jsx("h3", {
                className: "font-semibold text-foreground",
                children: "Actions urgentes",
              }),
              e.jsx("span", {
                className:
                  "ml-auto text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full",
                children: r.length,
              }),
            ],
          }),
          e.jsx("div", {
            className: "space-y-2",
            children: r.map((t, a) => {
              const o = t.icon;
              return e.jsxs(
                Q,
                {
                  to: t.link,
                  className:
                    "flex items-center gap-3 rounded-xl p-2.5 text-sm transition-colors hover:bg-muted/50",
                  children: [
                    e.jsx(o, {
                      className: `h-4 w-4 shrink-0 ${t.warning ? "text-amber-500" : "text-muted-foreground"}`,
                    }),
                    e.jsx("span", {
                      className: "flex-1 text-foreground",
                      children: t.text,
                    }),
                    e.jsx(ce, { className: "h-4 w-4 text-muted-foreground" }),
                  ],
                },
                a,
              );
            }),
          }),
        ],
      });
}
const R = {
  lead_status: { icon: W, color: "bg-red-50 text-red-600" },
  new_call: { icon: N, color: "bg-blue-50 text-blue-600" },
  call_closed: { icon: G, color: "bg-emerald-50 text-emerald-600" },
  general: { icon: me, color: "bg-amber-50 text-amber-600" },
};
function Ae() {
  const { notifications: s } = se(),
    r = s.slice(0, 8);
  return e.jsxs("div", {
    className: "rounded-2xl border border-border/40 bg-white p-5",
    children: [
      e.jsxs("h3", {
        className: "font-semibold text-foreground flex items-center gap-2 mb-4",
        children: [
          e.jsx(de, { className: "h-4 w-4 text-muted-foreground" }),
          "Activité récente",
        ],
      }),
      r.length === 0
        ? e.jsx("p", {
            className: "text-sm text-muted-foreground py-4",
            children: "Aucune activité récente",
          })
        : e.jsx("div", {
            className: "space-y-1",
            children: r.map((t) => {
              const a = R[t.type] ?? R.general,
                o = a.icon;
              return e.jsxs(
                "div",
                {
                  className:
                    "flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted/30",
                  children: [
                    e.jsx("div", {
                      className: x(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                        a.color,
                      ),
                      children: e.jsx(o, { className: "h-3.5 w-3.5" }),
                    }),
                    e.jsxs("div", {
                      className: "min-w-0 flex-1",
                      children: [
                        e.jsx("p", {
                          className: "text-sm text-foreground truncate",
                          children: t.title,
                        }),
                        e.jsx("p", {
                          className: "text-[11px] text-muted-foreground",
                          children: je(new Date(t.created_at), {
                            addSuffix: !0,
                            locale: $,
                          }),
                        }),
                      ],
                    }),
                  ],
                },
                t.id,
              );
            }),
          }),
    ],
  });
}
const Te = ["text-yellow-500", "text-slate-400", "text-amber-600"],
  De = ["bg-yellow-50", "bg-slate-50", "bg-amber-50"];
function Me() {
  const s = _(pe(new Date()), "yyyy-MM-dd"),
    { data: r = [] } = U({
      queryKey: ["leaderboard", s],
      queryFn: async () => {
        const { data: t, error: a } = await g
          .from("setter_activities")
          .select("user_id, messages_sent")
          .gte("date", s);
        if (a) throw a;
        const o = {};
        for (const n of t) o[n.user_id] = (o[n.user_id] ?? 0) + n.messages_sent;
        const l = Object.entries(o)
          .sort(([, n], [, i]) => i - n)
          .slice(0, 3);
        if (l.length === 0) return [];
        const { data: c } = await g
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in(
              "id",
              l.map(([n]) => n),
            ),
          d = new Map(c?.map((n) => [n.id, n]) ?? []);
        return l.map(([n, i]) => ({
          userId: n,
          name: d.get(n)?.full_name ?? "Utilisateur",
          avatarUrl: d.get(n)?.avatar_url,
          total: i,
        }));
      },
    });
  return e.jsxs("div", {
    className: "rounded-2xl border border-border/40 bg-white p-5",
    children: [
      e.jsxs("h3", {
        className: "font-semibold text-foreground flex items-center gap-2 mb-4",
        children: [
          e.jsx(y, { className: "h-4 w-4 text-yellow-500" }),
          "Top Messages",
        ],
      }),
      r.length === 0
        ? e.jsxs("div", {
            className:
              "flex flex-col items-center justify-center py-8 text-center",
            children: [
              e.jsx("div", {
                className:
                  "flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-3",
                children: e.jsx(y, {
                  className: "h-5 w-5 text-muted-foreground/50",
                }),
              }),
              e.jsx("p", {
                className: "text-sm font-medium text-muted-foreground",
                children: "Aucune activité pour le moment",
              }),
              e.jsx("p", {
                className: "mt-1 text-xs text-muted-foreground/70",
                children:
                  "Le classement apparaîtra dès les premières activités",
              }),
            ],
          })
        : e.jsx("div", {
            className: "space-y-3",
            children: r.map((t, a) =>
              e.jsxs(
                "div",
                {
                  className: "flex items-center gap-3",
                  children: [
                    e.jsx("div", {
                      className: x(
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                        De[a],
                        Te[a],
                      ),
                      children: a + 1,
                    }),
                    e.jsx("div", {
                      className:
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500/10 to-red-400/5 text-[10px] font-semibold text-red-600",
                      children: t.avatarUrl
                        ? e.jsx("img", {
                            src: t.avatarUrl,
                            alt: t.name,
                            className: "h-8 w-8 rounded-full object-cover",
                          })
                        : te(t.name),
                    }),
                    e.jsx("div", {
                      className: "min-w-0 flex-1",
                      children: e.jsx("p", {
                        className:
                          "text-sm font-medium text-foreground truncate",
                        children: t.name,
                      }),
                    }),
                    e.jsx("span", {
                      className:
                        "text-sm font-semibold text-foreground tabular-nums",
                      children: t.total.toLocaleString("fr-FR"),
                    }),
                  ],
                },
                t.userId,
              ),
            ),
          }),
    ],
  });
}
function z(s) {
  const [r, t] = s.split("-");
  return new Date(Number(r), Number(t) - 1).toLocaleDateString("fr-FR", {
    month: "short",
    year: "2-digit",
  });
}
function Fe() {
  const { data: s, isLoading: r } = J();
  return e.jsxs(u, {
    children: [
      e.jsx(C, {
        children: e.jsx(k, { children: "Chiffre d'affaires mensuel" }),
      }),
      e.jsx(h, {
        children: r
          ? e.jsx("div", {
              className: "space-y-3",
              children: e.jsx(m, { className: "h-[300px] w-full" }),
            })
          : !s || s.length === 0
            ? e.jsx(S, {
                icon: e.jsx(xe, { className: "h-6 w-6" }),
                title: "Aucune donnée",
                description: "Pas encore de chiffre d'affaires enregistre.",
              })
            : e.jsx(L, {
                width: "100%",
                height: 300,
                children: e.jsxs(be, {
                  data: s,
                  margin: { top: 5, right: 20, left: 10, bottom: 5 },
                  children: [
                    e.jsx(A, {
                      strokeDasharray: "3 3",
                      stroke: "hsl(220 13% 91%)",
                    }),
                    e.jsx(T, {
                      dataKey: "month",
                      tickFormatter: z,
                      tick: { fill: "hsl(220 9% 46%)", fontSize: 12 },
                      axisLine: { stroke: "hsl(220 13% 91%)" },
                      tickLine: !1,
                    }),
                    e.jsx(D, {
                      tickFormatter: (t) => `${(t / 1e3).toFixed(0)}k`,
                      tick: { fill: "hsl(220 9% 46%)", fontSize: 12 },
                      axisLine: !1,
                      tickLine: !1,
                    }),
                    e.jsx(M, {
                      formatter: (t) => [I(t), "CA"],
                      labelFormatter: (t) => z(t),
                      contentStyle: {
                        backgroundColor: "hsl(0 0% 100%)",
                        border: "1px solid hsl(220 13% 91%)",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                      },
                    }),
                    e.jsx(Ne, {
                      dataKey: "revenue",
                      fill: "hsl(252 85% 60%)",
                      radius: [6, 6, 0, 0],
                      maxBarSize: 48,
                    }),
                  ],
                }),
              }),
      }),
    ],
  });
}
function P(s) {
  return new Date(s).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}
function Be() {
  const { data: s, isLoading: r } = V();
  return e.jsxs(u, {
    children: [
      e.jsx(C, { children: e.jsx(k, { children: "Leads par semaine" }) }),
      e.jsx(h, {
        children: r
          ? e.jsx("div", {
              className: "space-y-3",
              children: e.jsx(m, { className: "h-[300px] w-full" }),
            })
          : !s || s.length === 0
            ? e.jsx(S, {
                icon: e.jsx(b, { className: "h-6 w-6" }),
                title: "Aucune donnée",
                description: "Pas encore de leads enregistres.",
              })
            : e.jsx(L, {
                width: "100%",
                height: 300,
                children: e.jsxs(ve, {
                  data: s,
                  margin: { top: 5, right: 20, left: 10, bottom: 5 },
                  children: [
                    e.jsx(A, {
                      strokeDasharray: "3 3",
                      stroke: "hsl(220 13% 91%)",
                    }),
                    e.jsx(T, {
                      dataKey: "week",
                      tickFormatter: P,
                      tick: { fill: "hsl(220 9% 46%)", fontSize: 12 },
                      axisLine: { stroke: "hsl(220 13% 91%)" },
                      tickLine: !1,
                    }),
                    e.jsx(D, {
                      allowDecimals: !1,
                      tick: { fill: "hsl(220 9% 46%)", fontSize: 12 },
                      axisLine: !1,
                      tickLine: !1,
                    }),
                    e.jsx(M, {
                      labelFormatter: (t) => P(t),
                      contentStyle: {
                        backgroundColor: "hsl(0 0% 100%)",
                        border: "1px solid hsl(220 13% 91%)",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                      },
                    }),
                    e.jsx(ye, {
                      verticalAlign: "top",
                      height: 36,
                      iconType: "circle",
                      formatter: (t) =>
                        e.jsx("span", {
                          style: {
                            color: "hsl(222 47% 11%)",
                            fontSize: "0.875rem",
                          },
                          children: t,
                        }),
                    }),
                    e.jsx(B, {
                      type: "monotone",
                      dataKey: "total",
                      name: "Total",
                      stroke: "hsl(252 85% 60%)",
                      strokeWidth: 2,
                      dot: { r: 4, fill: "hsl(252 85% 60%)" },
                      activeDot: { r: 6 },
                    }),
                    e.jsx(B, {
                      type: "monotone",
                      dataKey: "close",
                      name: "Closés",
                      stroke: "hsl(142 76% 36%)",
                      strokeWidth: 2,
                      dot: { r: 4, fill: "hsl(142 76% 36%)" },
                      activeDot: { r: 6 },
                    }),
                  ],
                }),
              }),
      }),
    ],
  });
}
function E(s) {
  return new Date(s).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}
function O() {
  const { data: s, isLoading: r } = Z();
  return e.jsxs(u, {
    children: [
      e.jsx(C, {
        children: e.jsx(k, { children: "Activité setter (14 derniers jours)" }),
      }),
      e.jsx(h, {
        children: r
          ? e.jsx("div", {
              className: "space-y-3",
              children: e.jsx(m, { className: "h-[300px] w-full" }),
            })
          : !s || s.length === 0
            ? e.jsx(S, {
                icon: e.jsx(v, { className: "h-6 w-6" }),
                title: "Aucune donnée",
                description: "Pas encore d'activité setter enregistrée.",
              })
            : e.jsx(L, {
                width: "100%",
                height: 300,
                children: e.jsxs(we, {
                  data: s,
                  margin: { top: 5, right: 20, left: 10, bottom: 5 },
                  children: [
                    e.jsx("defs", {
                      children: e.jsxs("linearGradient", {
                        id: "colorMessages",
                        x1: "0",
                        y1: "0",
                        x2: "0",
                        y2: "1",
                        children: [
                          e.jsx("stop", {
                            offset: "5%",
                            stopColor: "hsl(252 85% 60%)",
                            stopOpacity: 0.2,
                          }),
                          e.jsx("stop", {
                            offset: "95%",
                            stopColor: "hsl(252 85% 60%)",
                            stopOpacity: 0,
                          }),
                        ],
                      }),
                    }),
                    e.jsx(A, {
                      strokeDasharray: "3 3",
                      stroke: "hsl(220 13% 91%)",
                    }),
                    e.jsx(T, {
                      dataKey: "date",
                      tickFormatter: E,
                      tick: { fill: "hsl(220 9% 46%)", fontSize: 12 },
                      axisLine: { stroke: "hsl(220 13% 91%)" },
                      tickLine: !1,
                    }),
                    e.jsx(D, {
                      allowDecimals: !1,
                      tick: { fill: "hsl(220 9% 46%)", fontSize: 12 },
                      axisLine: !1,
                      tickLine: !1,
                    }),
                    e.jsx(M, {
                      labelFormatter: (t) => E(t),
                      formatter: (t) => [t, "Messages"],
                      contentStyle: {
                        backgroundColor: "hsl(0 0% 100%)",
                        border: "1px solid hsl(220 13% 91%)",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                      },
                    }),
                    e.jsx(Ce, {
                      type: "monotone",
                      dataKey: "messages",
                      stroke: "hsl(252 85% 60%)",
                      strokeWidth: 2,
                      fill: "url(#colorMessages)",
                    }),
                  ],
                }),
              }),
      }),
    ],
  });
}
function j(s, r) {
  return r === 0 ? (s > 0 ? 100 : 0) : ((s - r) / r) * 100;
}
function Re() {
  return e.jsx("div", {
    className: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4",
    children: Array.from({ length: 4 }).map((s, r) =>
      e.jsxs(
        "div",
        {
          className: "rounded-2xl border border-border/40 bg-white p-6",
          children: [
            e.jsxs("div", {
              className: "flex items-center justify-between",
              children: [
                e.jsx(m, { className: "h-11 w-11 rounded-xl" }),
                e.jsx(m, { className: "h-5 w-16 rounded-full" }),
              ],
            }),
            e.jsxs("div", {
              className: "mt-4 space-y-2",
              children: [
                e.jsx(m, { className: "h-4 w-24" }),
                e.jsx(m, { className: "h-7 w-32" }),
              ],
            }),
            e.jsx(m, { className: "mt-2 h-3 w-28" }),
          ],
        },
        r,
      ),
    ),
  });
}
function ze() {
  const s = q(),
    r = [
      {
        label: "Nouveau lead",
        description: "Ajouter un prospect au pipeline",
        icon: ge,
        color: "from-red-500 to-orange-500",
        iconBg: "bg-red-500/10 text-red-600",
        onClick: () => s("/pipeline?action=new"),
      },
      {
        label: "Messagerie",
        description: "Discuter avec votre coach",
        icon: v,
        color: "from-blue-500 to-indigo-500",
        iconBg: "bg-blue-500/10 text-blue-600",
        onClick: () => s("/messaging"),
      },
      {
        label: "Formations",
        description: "Continuer votre apprentissage",
        icon: fe,
        color: "from-purple-500 to-pink-500",
        iconBg: "bg-purple-500/10 text-purple-600",
        onClick: () => s("/formations"),
      },
      {
        label: "Ma progression",
        description: "XP, badges et défis",
        icon: y,
        color: "from-amber-500 to-yellow-500",
        iconBg: "bg-amber-500/10 text-amber-600",
        onClick: () => s("/progression"),
      },
    ];
  return e.jsx("div", {
    className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
    children: r.map((t) =>
      e.jsxs(
        "button",
        {
          onClick: t.onClick,
          className:
            "group flex flex-col items-start gap-3 rounded-2xl border border-border/40 bg-white p-4 text-left transition-all duration-200 hover:shadow-lg hover:border-border/60 cursor-pointer",
          children: [
            e.jsx("div", {
              className: x(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                t.iconBg,
              ),
              children: e.jsx(t.icon, { className: "h-5 w-5" }),
            }),
            e.jsxs("div", {
              children: [
                e.jsx("p", {
                  className: "text-sm font-semibold text-foreground",
                  children: t.label,
                }),
                e.jsx("p", {
                  className: "mt-0.5 text-xs text-muted-foreground",
                  children: t.description,
                }),
              ],
            }),
            e.jsx(w, {
              className:
                "h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-foreground",
            }),
          ],
        },
        t.label,
      ),
    ),
  });
}
function Pe() {
  const { user: s } = K(),
    r = q(),
    t = s?.id,
    { data: a, isLoading: o } = ae(),
    { data: l, isLoading: c } = ne(t),
    d = o || c,
    n = [
      {
        title: "Mes Leads",
        value: String(a?.total ?? 0),
        icon: b,
        color: "bg-primary/10 text-primary",
      },
      {
        title: "En Discussion",
        value: String(a?.en_discussion ?? 0),
        icon: v,
        color: "bg-blue-100 text-blue-700",
      },
      {
        title: "Calls Planifiés",
        value: String(a?.call_planifie ?? 0),
        icon: N,
        color: "bg-amber-100 text-amber-700",
      },
      {
        title: "Messages / semaine",
        value: String(l?.messages_this_week ?? 0),
        icon: W,
        color: "bg-emerald-100 text-emerald-700",
      },
    ];
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(ze, {}),
      d
        ? e.jsx("div", {
            className: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4",
            children: Array.from({ length: 4 }).map((i, H) =>
              e.jsx(
                u,
                {
                  children: e.jsxs(h, {
                    className: "p-5",
                    children: [
                      e.jsx(m, { className: "h-10 w-10 rounded-lg" }),
                      e.jsx(m, { className: "mt-3 h-4 w-24" }),
                      e.jsx(m, { className: "mt-2 h-8 w-16" }),
                    ],
                  }),
                },
                H,
              ),
            ),
          })
        : e.jsx("div", {
            className: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4",
            children: n.map((i) =>
              e.jsx(
                u,
                {
                  children: e.jsxs(h, {
                    className: "p-5",
                    children: [
                      e.jsx("div", {
                        className: x(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          i.color,
                        ),
                        children: e.jsx(i.icon, { className: "h-5 w-5" }),
                      }),
                      e.jsxs("div", {
                        className: "mt-3",
                        children: [
                          e.jsx("p", {
                            className:
                              "text-sm font-medium text-muted-foreground",
                            children: i.title,
                          }),
                          e.jsx("p", {
                            className:
                              "mt-1 text-2xl font-bold text-foreground",
                            children: i.value,
                          }),
                        ],
                      }),
                    ],
                  }),
                },
                i.title,
              ),
            ),
          }),
      e.jsxs("div", {
        className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
        children: [
          e.jsx(u, {
            className: "cursor-pointer transition-all hover:shadow-md",
            onClick: () => r("/journal"),
            children: e.jsxs(h, {
              className: "flex items-center gap-4 p-5",
              children: [
                e.jsx("div", {
                  className:
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50",
                  children: e.jsx(ue, { className: "h-6 w-6 text-rose-500" }),
                }),
                e.jsxs("div", {
                  className: "flex-1",
                  children: [
                    e.jsx("p", {
                      className: "font-semibold text-foreground",
                      children: "Journal",
                    }),
                    e.jsx("p", {
                      className: "text-sm text-muted-foreground",
                      children: "Notez vos réflexions du jour",
                    }),
                  ],
                }),
                e.jsx(w, { className: "h-5 w-5 text-muted-foreground/40" }),
              ],
            }),
          }),
          e.jsx(u, {
            className: "cursor-pointer transition-all hover:shadow-md",
            onClick: () => r("/communaute"),
            children: e.jsxs(h, {
              className: "flex items-center gap-4 p-5",
              children: [
                e.jsx("div", {
                  className:
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50",
                  children: e.jsx(b, { className: "h-6 w-6 text-indigo-500" }),
                }),
                e.jsxs("div", {
                  className: "flex-1",
                  children: [
                    e.jsx("p", {
                      className: "font-semibold text-foreground",
                      children: "Communauté",
                    }),
                    e.jsx("p", {
                      className: "text-sm text-muted-foreground",
                      children: "Échangez avec les autres membres",
                    }),
                  ],
                }),
                e.jsx(w, { className: "h-5 w-5 text-muted-foreground/40" }),
              ],
            }),
          }),
        ],
      }),
    ],
  });
}
function Ee() {
  const { data: s, isLoading: r } = ee(),
    t = s ? j(s.ca_total_this_month, s.ca_total_prev_month) : 0,
    a = s ? j(s.nb_calls_this_month, s.nb_calls_prev_month) : 0,
    o = s ? j(s.taux_closing, s.taux_closing_prev_month) : 0,
    l = s ? j(s.messages_sent_this_month, s.messages_sent_prev_month) : 0,
    d = s && (s.nb_calls > 0 || s.ca_total > 0) && s.taux_closing < 30;
  return e.jsxs(e.Fragment, {
    children: [
      r
        ? e.jsx(Re, {})
        : s
          ? e.jsxs("div", {
              className: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4",
              children: [
                e.jsx(f, {
                  title: "CA Total Close",
                  value: I(s.ca_total),
                  icon: G,
                  trend: t,
                  trendLabel: "vs mois précédent",
                  accent: "emerald",
                  index: 0,
                }),
                e.jsx(f, {
                  title: "Nombre de Calls",
                  value: String(s.nb_calls),
                  icon: N,
                  trend: a,
                  trendLabel: "vs mois précédent",
                  accent: "blue",
                  index: 1,
                }),
                e.jsx(f, {
                  title: "Taux de Closing",
                  value: F(s.taux_closing),
                  icon: he,
                  trend: o,
                  trendLabel: "vs mois précédent",
                  accent: "red",
                  index: 2,
                }),
                e.jsx(f, {
                  title: "Messages Envoyes",
                  value: String(s.messages_sent),
                  icon: v,
                  trend: l,
                  trendLabel: "vs mois précédent",
                  accent: "amber",
                  index: 3,
                }),
              ],
            })
          : null,
      d &&
        e.jsxs("div", {
          className:
            "flex items-center gap-3 rounded-xl bg-destructive/10 px-4 py-3",
          children: [
            e.jsx(p, { className: "h-5 w-5 shrink-0 text-destructive" }),
            e.jsxs("div", {
              children: [
                e.jsx("p", {
                  className: "text-sm font-medium text-destructive",
                  children: "Taux de closing bas",
                }),
                e.jsxs("p", {
                  className: "text-xs text-destructive/80",
                  children: [
                    "Votre taux de closing est actuellement de",
                    " ",
                    F(s.taux_closing),
                    ". Un taux inférieur à 30% nécessite une attention particulière.",
                  ],
                }),
              ],
            }),
          ],
        }),
      e.jsxs("div", {
        className: "grid grid-cols-1 gap-5 lg:grid-cols-3",
        children: [
          e.jsx("div", { className: "lg:col-span-2", children: e.jsx(Le, {}) }),
          e.jsx(Me, {}),
        ],
      }),
      e.jsxs("div", {
        className: "grid grid-cols-1 gap-5 lg:grid-cols-2",
        children: [e.jsx(Fe, {}), e.jsx(Be, {})],
      }),
      e.jsx(O, {}),
      e.jsx(Ae, {}),
    ],
  });
}
function Ze() {
  ke("Tableau de bord");
  const [s, r] = X.useState("month"),
    { isProspect: t } = re();
  return e.jsxs("div", {
    className: "space-y-6",
    children: [
      e.jsx(Se, { period: s, onPeriodChange: r }),
      t
        ? e.jsxs(e.Fragment, { children: [e.jsx(Pe, {}), e.jsx(O, {})] })
        : e.jsx(Ee, {}),
    ],
  });
}
export { Ze as default };
