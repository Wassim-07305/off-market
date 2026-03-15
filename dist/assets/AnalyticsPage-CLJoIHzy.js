import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { r as o } from "./vendor-react-Cci7g3Cb.js";
import { h as Q } from "./useLeads-TuKFlYpV.js";
import { u as X } from "./useCallCalendar-B0TAFn5Z.js";
import { c as H, T as J } from "./TimeFilter-DReAdz3P.js";
import { d as V, S as _, b as k, e as W } from "./index-DY9GA2La.js";
import { C as c, d, a as m, b as u, c as h } from "./card-Dkj99_H3.js";
import { B as Z } from "./button-DlbP8VPc.js";
import { u as ee } from "./usePageTitle-I7G4QvKX.js";
import {
  j as P,
  ar as se,
  D as F,
  U as te,
  T as U,
  E as ae,
  ah as re,
  C as le,
} from "./vendor-ui-DDdrexJZ.js";
import {
  R as f,
  A as ie,
  C as w,
  X as L,
  Y as R,
  T as p,
  d as ne,
  P as B,
  e as $,
  f as A,
  b as oe,
  B as K,
  a as M,
} from "./vendor-charts-KMfjFgec.js";
import "./constants-IBlSVYu1.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
const z = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"],
  ce = {
    premier_message: "#94a3b8",
    en_discussion: "#3b82f6",
    qualifie: "#6366f1",
    loom_envoye: "#8b5cf6",
    call_planifie: "#f59e0b",
    close: "#10b981",
    perdu: "#ef4444",
  },
  de = {
    premier_message: "Premier message",
    en_discussion: "En discussion",
    qualifie: "Qualifié",
    loom_envoye: "Loom envoyé",
    call_planifie: "Call planifié",
    close: "Close",
    perdu: "Perdu",
  };
function _e() {
  ee("Analytics");
  const [v, y] = o.useState("month"),
    { isAdmin: C } = V(),
    { data: l, isLoading: N } = H(),
    { data: j, isLoading: q } = Q(),
    { data: g, isLoading: I } = X(),
    Y = N || q || I,
    r = o.useMemo(() => j?.data ?? [], [j?.data]),
    S = o.useMemo(() => {
      if (r.length === 0) return [];
      const s = {};
      return (
        r.forEach((t) => {
          s[t.status] = (s[t.status] || 0) + 1;
        }),
        Object.entries(s).map(([t, a]) => ({
          name: de[t] || t,
          value: a,
          color: ce[t] || "#94a3b8",
        }))
      );
    }, [r]),
    D = o.useMemo(() => {
      if (r.length === 0) return [];
      const s = {};
      return (
        r.forEach((t) => {
          const a = t.source || "autre";
          s[a] = (s[a] || 0) + Number(t.ca_contracté || 0);
        }),
        Object.entries(s)
          .map(([t, a]) => ({
            name: t.charAt(0).toUpperCase() + t.slice(1),
            value: a,
          }))
          .filter((t) => t.value > 0)
          .sort((t, a) => a.value - t.value)
      );
    }, [r]),
    T = o.useMemo(() => {
      if (!g) return [];
      const s = {};
      return (
        g.forEach((t) => {
          s[t.type] = (s[t.type] || 0) + 1;
        }),
        Object.entries(s).map(([t, a], i) => ({
          name: t.charAt(0).toUpperCase() + t.slice(1),
          value: a,
          color: z[i % z.length],
        }))
      );
    }, [g]),
    O = o.useMemo(() => {
      if (r.length === 0) return [];
      const s = {},
        t = new Date();
      for (let a = 5; a >= 0; a--) {
        const x = new Date(
          t.getFullYear(),
          t.getMonth() - a,
          1,
        ).toLocaleDateString("fr-FR", { month: "short" });
        s[x] = 0;
      }
      return (
        r.forEach((a) => {
          if (a.status === "close" && a.ca_contracté > 0) {
            const x = new Date(a.created_at).toLocaleDateString("fr-FR", {
              month: "short",
            });
            s[x] !== void 0 && (s[x] += Number(a.ca_contracté));
          }
        }),
        Object.entries(s).map(([a, i]) => ({ month: a, revenue: i }))
      );
    }, [r]),
    E = o.useMemo(() => {
      if (r.length === 0) return [];
      const s = r.length,
        t = r.filter((n) =>
          [
            "en_discussion",
            "qualifie",
            "loom_envoye",
            "call_planifie",
            "close",
          ].includes(n.status),
        ).length,
        a = r.filter((n) =>
          ["qualifie", "loom_envoye", "call_planifie", "close"].includes(
            n.status,
          ),
        ).length,
        i = r.filter((n) =>
          ["call_planifie", "close"].includes(n.status),
        ).length,
        x = r.filter((n) => n.status === "close").length;
      return [
        { name: "Total Leads", value: s, fill: "#94a3b8" },
        { name: "En discussion", value: t, fill: "#3b82f6" },
        { name: "Qualifiés", value: a, fill: "#6366f1" },
        { name: "Call planifié", value: i, fill: "#f59e0b" },
        { name: "Closes", value: x, fill: "#10b981" },
      ];
    }, [r]),
    G = () => {
      const s = {
          stats: l,
          leadsByStatus: S,
          caBySource: D,
          monthlyRevenue: O,
          exportedAt: new Date().toISOString(),
        },
        t = new Blob([JSON.stringify(s, null, 2)], {
          type: "application/json",
        }),
        a = URL.createObjectURL(t),
        i = document.createElement("a");
      ((i.href = a),
        (i.download = `analytics-${new Date().toISOString().split("T")[0]}.json`),
        i.click(),
        URL.revokeObjectURL(a));
    };
  return C
    ? e.jsxs("div", {
        className: "space-y-6",
        children: [
          e.jsxs("div", {
            className:
              "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("h1", {
                    className: "text-xl sm:text-2xl font-bold text-foreground",
                    children: "Analytics",
                  }),
                  e.jsx("p", {
                    className: "text-sm text-muted-foreground",
                    children: "Vue d'ensemble de vos performances",
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "flex items-center gap-3",
                children: [
                  e.jsx(J, { value: v, onChange: y }),
                  e.jsx(Z, {
                    variant: "secondary",
                    onClick: G,
                    icon: e.jsx(se, { className: "h-4 w-4" }),
                    children: "Exporter",
                  }),
                ],
              }),
            ],
          }),
          Y
            ? e.jsx("div", {
                className: "grid grid-cols-2 gap-4 lg:grid-cols-4",
                children: Array.from({ length: 4 }).map((s, t) =>
                  e.jsx(
                    c,
                    {
                      children: e.jsxs(d, {
                        className: "p-5",
                        children: [
                          e.jsx(_, { className: "h-10 w-10 rounded-lg" }),
                          e.jsx(_, { className: "mt-3 h-4 w-20" }),
                          e.jsx(_, { className: "mt-2 h-6 w-16" }),
                        ],
                      }),
                    },
                    t,
                  ),
                ),
              })
            : e.jsxs("div", {
                className: "grid grid-cols-2 gap-4 lg:grid-cols-4",
                children: [
                  e.jsx(b, {
                    title: "CA Total",
                    value: k(l?.ca_total ?? 0),
                    icon: F,
                    trend: l
                      ? ((l.ca_total_this_month - l.ca_total_prev_month) /
                          Math.max(l.ca_total_prev_month, 1)) *
                        100
                      : 0,
                    color: "emerald",
                  }),
                  e.jsx(b, {
                    title: "Leads",
                    value: String(r.length),
                    icon: te,
                    color: "blue",
                  }),
                  e.jsx(b, {
                    title: "Taux Closing",
                    value: W(l?.taux_closing ?? 0),
                    icon: U,
                    trend: l ? l.taux_closing - l.taux_closing_prev_month : 0,
                    color: "amber",
                  }),
                  e.jsx(b, {
                    title: "Calls",
                    value: String(g?.length ?? 0),
                    icon: ae,
                    color: "purple",
                  }),
                ],
              }),
          e.jsxs("div", {
            className: "grid gap-6 lg:grid-cols-2",
            children: [
              e.jsxs(c, {
                children: [
                  e.jsxs(m, {
                    children: [
                      e.jsxs(u, {
                        className: "flex items-center gap-2",
                        children: [
                          e.jsx(re, { className: "h-5 w-5 text-emerald-600" }),
                          "Evolution du CA",
                        ],
                      }),
                      e.jsx(h, {
                        children: "Chiffre d'affaires des 6 derniers mois",
                      }),
                    ],
                  }),
                  e.jsx(d, {
                    children: e.jsx("div", {
                      className: "h-[280px]",
                      children: e.jsx(f, {
                        width: "100%",
                        height: "100%",
                        children: e.jsxs(ie, {
                          data: O,
                          children: [
                            e.jsx("defs", {
                              children: e.jsxs("linearGradient", {
                                id: "colorRevenue",
                                x1: "0",
                                y1: "0",
                                x2: "0",
                                y2: "1",
                                children: [
                                  e.jsx("stop", {
                                    offset: "5%",
                                    stopColor: "#10b981",
                                    stopOpacity: 0.3,
                                  }),
                                  e.jsx("stop", {
                                    offset: "95%",
                                    stopColor: "#10b981",
                                    stopOpacity: 0,
                                  }),
                                ],
                              }),
                            }),
                            e.jsx(w, {
                              strokeDasharray: "3 3",
                              stroke: "#e5e7eb",
                            }),
                            e.jsx(L, {
                              dataKey: "month",
                              tick: { fontSize: 12 },
                              stroke: "#9ca3af",
                            }),
                            e.jsx(R, {
                              tick: { fontSize: 12 },
                              stroke: "#9ca3af",
                              tickFormatter: (s) => `${(s / 1e3).toFixed(0)}k`,
                            }),
                            e.jsx(p, {
                              formatter: (s) => [k(Number(s)), "CA"],
                              contentStyle: {
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                              },
                            }),
                            e.jsx(ne, {
                              type: "monotone",
                              dataKey: "revenue",
                              stroke: "#10b981",
                              strokeWidth: 2,
                              fill: "url(#colorRevenue)",
                            }),
                          ],
                        }),
                      }),
                    }),
                  }),
                ],
              }),
              e.jsxs(c, {
                children: [
                  e.jsxs(m, {
                    children: [
                      e.jsxs(u, {
                        className: "flex items-center gap-2",
                        children: [
                          e.jsx(U, { className: "h-5 w-5 text-blue-600" }),
                          "Leads par statut",
                        ],
                      }),
                      e.jsx(h, {
                        children: "Répartition actuelle du pipeline",
                      }),
                    ],
                  }),
                  e.jsx(d, {
                    children: e.jsx("div", {
                      className: "h-[280px]",
                      children: e.jsx(f, {
                        width: "100%",
                        height: "100%",
                        children: e.jsxs(B, {
                          children: [
                            e.jsx($, {
                              data: S,
                              cx: "50%",
                              cy: "50%",
                              innerRadius: 60,
                              outerRadius: 100,
                              paddingAngle: 2,
                              dataKey: "value",
                              children: S.map((s, t) =>
                                e.jsx(A, { fill: s.color }, `cell-${t}`),
                              ),
                            }),
                            e.jsx(p, {
                              formatter: (s) => [s, "Leads"],
                              contentStyle: {
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                              },
                            }),
                            e.jsx(oe, {
                              layout: "vertical",
                              verticalAlign: "middle",
                              align: "right",
                              wrapperStyle: { fontSize: "12px" },
                            }),
                          ],
                        }),
                      }),
                    }),
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("div", {
            className: "grid gap-6 lg:grid-cols-2",
            children: [
              e.jsxs(c, {
                children: [
                  e.jsxs(m, {
                    children: [
                      e.jsxs(u, {
                        className: "flex items-center gap-2",
                        children: [
                          e.jsx(P, { className: "h-5 w-5 text-purple-600" }),
                          "Funnel de conversion",
                        ],
                      }),
                      e.jsx(h, { children: "De lead a client" }),
                    ],
                  }),
                  e.jsx(d, {
                    children: e.jsx("div", {
                      className: "h-[280px]",
                      children: e.jsx(f, {
                        width: "100%",
                        height: "100%",
                        children: e.jsxs(K, {
                          data: E,
                          layout: "vertical",
                          children: [
                            e.jsx(w, {
                              strokeDasharray: "3 3",
                              stroke: "#e5e7eb",
                            }),
                            e.jsx(L, {
                              type: "number",
                              tick: { fontSize: 12 },
                              stroke: "#9ca3af",
                            }),
                            e.jsx(R, {
                              type: "category",
                              dataKey: "name",
                              tick: { fontSize: 12 },
                              stroke: "#9ca3af",
                              width: 100,
                            }),
                            e.jsx(p, {
                              contentStyle: {
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                              },
                            }),
                            e.jsx(M, {
                              dataKey: "value",
                              radius: [0, 4, 4, 0],
                              children: E.map((s, t) =>
                                e.jsx(A, { fill: s.fill }, `cell-${t}`),
                              ),
                            }),
                          ],
                        }),
                      }),
                    }),
                  }),
                ],
              }),
              e.jsxs(c, {
                children: [
                  e.jsxs(m, {
                    children: [
                      e.jsxs(u, {
                        className: "flex items-center gap-2",
                        children: [
                          e.jsx(F, { className: "h-5 w-5 text-amber-600" }),
                          "CA par source",
                        ],
                      }),
                      e.jsx(h, { children: "Origine des revenus" }),
                    ],
                  }),
                  e.jsx(d, {
                    children: e.jsx("div", {
                      className: "h-[280px]",
                      children: e.jsx(f, {
                        width: "100%",
                        height: "100%",
                        children: e.jsxs(K, {
                          data: D,
                          children: [
                            e.jsx(w, {
                              strokeDasharray: "3 3",
                              stroke: "#e5e7eb",
                            }),
                            e.jsx(L, {
                              dataKey: "name",
                              tick: { fontSize: 12 },
                              stroke: "#9ca3af",
                            }),
                            e.jsx(R, {
                              tick: { fontSize: 12 },
                              stroke: "#9ca3af",
                              tickFormatter: (s) => `${(s / 1e3).toFixed(0)}k`,
                            }),
                            e.jsx(p, {
                              formatter: (s) => [k(Number(s)), "CA"],
                              contentStyle: {
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                              },
                            }),
                            e.jsx(M, {
                              dataKey: "value",
                              fill: "#f59e0b",
                              radius: [4, 4, 0, 0],
                            }),
                          ],
                        }),
                      }),
                    }),
                  }),
                ],
              }),
            ],
          }),
          e.jsxs(c, {
            children: [
              e.jsxs(m, {
                children: [
                  e.jsxs(u, {
                    className: "flex items-center gap-2",
                    children: [
                      e.jsx(le, { className: "h-5 w-5 text-red-600" }),
                      "Calls par type",
                    ],
                  }),
                  e.jsx(h, {
                    children: "Répartition des differents types de calls",
                  }),
                ],
              }),
              e.jsx(d, {
                children: e.jsx("div", {
                  className: "h-[200px]",
                  children: e.jsx(f, {
                    width: "100%",
                    height: "100%",
                    children: e.jsxs(B, {
                      children: [
                        e.jsx($, {
                          data: T,
                          cx: "50%",
                          cy: "50%",
                          outerRadius: 80,
                          dataKey: "value",
                          label: ({ name: s, value: t }) => `${s}: ${t}`,
                          labelLine: !1,
                          children: T.map((s, t) =>
                            e.jsx(A, { fill: s.color }, `cell-${t}`),
                          ),
                        }),
                        e.jsx(p, {
                          contentStyle: {
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          },
                        }),
                      ],
                    }),
                  }),
                }),
              }),
            ],
          }),
        ],
      })
    : e.jsx("div", {
        className: "flex h-[60vh] items-center justify-center",
        children: e.jsxs("div", {
          className: "text-center",
          children: [
            e.jsx(P, {
              className: "mx-auto h-12 w-12 text-muted-foreground/50",
            }),
            e.jsx("h2", {
              className: "mt-4 text-lg font-semibold text-foreground",
              children: "Accès restreint",
            }),
            e.jsx("p", {
              className: "text-sm text-muted-foreground",
              children: "Les analytics sont réservées aux administrateurs.",
            }),
          ],
        }),
      });
}
function b({ title: v, value: y, icon: C, trend: l, color: N }) {
  const j = {
    emerald: "bg-emerald-100 text-emerald-700 ring-emerald-100",
    blue: "bg-blue-100 text-blue-700 ring-blue-100",
    amber: "bg-amber-100 text-amber-700 ring-amber-100",
    purple: "bg-purple-100 text-purple-700 ring-purple-100",
  };
  return e.jsx(c, {
    children: e.jsxs(d, {
      className: "p-5",
      children: [
        e.jsx("div", {
          className: `inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1 ${j[N]}`,
          children: e.jsx(C, { className: "h-5 w-5" }),
        }),
        e.jsx("p", {
          className: "mt-3 text-sm font-medium text-muted-foreground",
          children: v,
        }),
        e.jsxs("div", {
          className: "mt-1 flex items-baseline gap-2",
          children: [
            e.jsx("p", {
              className: "text-2xl font-bold text-foreground",
              children: y,
            }),
            l !== void 0 &&
              e.jsxs("span", {
                className: `text-xs font-medium ${l >= 0 ? "text-emerald-600" : "text-red-600"}`,
                children: [l >= 0 ? "+" : "", l.toFixed(1), "%"],
              }),
          ],
        }),
      ],
    }),
  });
}
export { _e as default };
