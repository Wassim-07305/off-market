import { j as e } from "./vendor-query-sBpsl8Kt.js";
import {
  f as _,
  S as d,
  c as w,
  u as p,
  d as g,
  h as C,
} from "./index-DY9GA2La.js";
import { u as A, b as D, a as M } from "./useSetterActivities-CkfYxyYw.js";
import { r as T } from "./vendor-react-Cci7g3Cb.js";
import { C as c, d as m, a as f, b as h } from "./card-Dkj99_H3.js";
import {
  Q as k,
  C as E,
  ah as z,
  E as I,
  ae as R,
} from "./vendor-ui-DDdrexJZ.js";
import {
  R as B,
  B as P,
  C as q,
  X as L,
  Y as H,
  T as O,
  a as F,
} from "./vendor-charts-KMfjFgec.js";
import { f as K } from "./vendor-utils-DoLlG-6J.js";
import { u as U } from "./vendor-forms-Ct2mZ2NL.js";
import { a as V } from "./zod-COY_rf8d.js";
import { s as X } from "./forms-zLivl21i.js";
import { u as Y } from "./useClients-oFN0czBK.js";
import { I as x } from "./input-B9vrc6Q3.js";
import { S as G } from "./select-E7QvXrZc.js";
import { T as Q } from "./textarea-D7qrlVHg.js";
import { B as W } from "./button-DlbP8VPc.js";
import { E as J } from "./empty-state-BFSeK4Tv.js";
import { u as Z } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-supabase-BZ0N5lZN.js";
import "./constants-IBlSVYu1.js";
function $({ userId: a }) {
  const { data: s, isLoading: t } = A(a),
    l = T.useMemo(
      () =>
        s?.daily_data
          ? s.daily_data.map((r) => ({
              date: K(new Date(r.date), "dd/MM", { locale: _ }),
              messages: r.messages_sent,
            }))
          : [],
      [s],
    );
  if (t)
    return e.jsxs("div", {
      className: "space-y-4",
      children: [
        e.jsx("div", {
          className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
          children: Array.from({ length: 4 }).map((r, u) =>
            e.jsx(
              c,
              {
                children: e.jsxs(m, {
                  className: "p-5",
                  children: [
                    e.jsx(d, { className: "h-10 w-10 rounded-lg" }),
                    e.jsx(d, { className: "mt-3 h-4 w-24" }),
                    e.jsx(d, { className: "mt-2 h-8 w-16" }),
                  ],
                }),
              },
              u,
            ),
          ),
        }),
        e.jsx(c, {
          children: e.jsx(m, {
            className: "p-5",
            children: e.jsx(d, { className: "h-[200px] w-full" }),
          }),
        }),
      ],
    });
  const i = [
    {
      title: "Messages cette semaine",
      value: String(s?.messages_this_week ?? 0),
      suffix: "DMs",
      icon: k,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Messages ce mois",
      value: String(s?.messages_this_month ?? 0),
      suffix: "DMs",
      icon: E,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Moyenne / jour",
      value: String(s?.average_daily ?? 0),
      suffix: "DMs",
      icon: z,
      color: "bg-success/10 text-success",
    },
    {
      title: "Total 30j",
      value: String(s?.total_messages ?? 0),
      suffix: "DMs",
      icon: I,
      color: "bg-purple-100 text-purple-700",
    },
  ];
  return e.jsxs("div", {
    className: "space-y-4",
    children: [
      e.jsx("div", {
        className: "grid grid-cols-1 gap-4 sm:grid-cols-3",
        children: i.map((r) =>
          e.jsx(
            c,
            {
              children: e.jsxs(m, {
                className: "p-5",
                children: [
                  e.jsx("div", {
                    className: w(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      r.color,
                    ),
                    children: e.jsx(r.icon, { className: "h-5 w-5" }),
                  }),
                  e.jsxs("div", {
                    className: "mt-3",
                    children: [
                      e.jsx("p", {
                        className: "text-sm font-medium text-muted-foreground",
                        children: r.title,
                      }),
                      e.jsxs("p", {
                        className: "mt-1 text-2xl font-bold text-foreground",
                        children: [
                          r.value,
                          " ",
                          e.jsx("span", {
                            className:
                              "text-sm font-medium text-muted-foreground",
                            children: r.suffix,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            },
            r.title,
          ),
        ),
      }),
      l.length > 0 &&
        e.jsxs(c, {
          children: [
            e.jsx(f, {
              children: e.jsx(h, {
                className: "text-base",
                children: "Prospection (14 derniers jours)",
              }),
            }),
            e.jsx(m, {
              children: e.jsx(B, {
                width: "100%",
                height: 240,
                children: e.jsxs(P, {
                  data: l,
                  children: [
                    e.jsx(q, {
                      strokeDasharray: "3 3",
                      className: "stroke-border",
                    }),
                    e.jsx(L, {
                      dataKey: "date",
                      tick: { fontSize: 12 },
                      className: "text-muted-foreground",
                    }),
                    e.jsx(H, {
                      tick: { fontSize: 12 },
                      className: "text-muted-foreground",
                      allowDecimals: !1,
                    }),
                    e.jsx(O, {
                      contentStyle: {
                        backgroundColor: "var(--color-background, #fff)",
                        border: "1px solid var(--color-border, #e5e7eb)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      },
                      labelStyle: { fontWeight: 600 },
                    }),
                    e.jsx(F, {
                      dataKey: "messages",
                      name: "Messages",
                      fill: "var(--color-primary, #3b82f6)",
                      radius: [4, 4, 0, 0],
                    }),
                  ],
                }),
              }),
            }),
          ],
        }),
    ],
  });
}
function ee() {
  const { user: a } = p(),
    { isAdmin: s } = g(),
    t = D(),
    { data: l } = Y(),
    {
      register: i,
      handleSubmit: r,
      reset: u,
      setValue: j,
      watch: b,
      formState: { errors: n, isSubmitting: N },
    } = U({
      resolver: V(X),
      defaultValues: {
        client_id: null,
        date: new Date().toISOString().split("T")[0],
        messages_sent: 0,
        calls_made: 0,
        looms_sent: 0,
        notes: "",
      },
    }),
    y = b("client_id"),
    v = async (o) => {
      a?.id &&
        (await t.mutateAsync({
          ...o,
          user_id: a.id,
          client_id: o.client_id || null,
          notes: o.notes || null,
        }),
        u({
          client_id: null,
          date: new Date().toISOString().split("T")[0],
          messages_sent: 0,
          calls_made: 0,
          looms_sent: 0,
          notes: "",
        }));
    },
    S = [
      { value: "", label: "Aucun (global)" },
      ...(l?.data ?? []).map((o) => ({ value: o.id, label: o.name })),
    ];
  return e.jsxs(c, {
    children: [
      e.jsx(f, {
        children: e.jsx(h, {
          className: "text-base",
          children: "Enregistrer l'activite du jour",
        }),
      }),
      e.jsx(m, {
        children: e.jsxs("form", {
          onSubmit: r(v),
          className: "space-y-4",
          children: [
            e.jsxs("div", {
              className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
              children: [
                e.jsx(x, {
                  label: "Date",
                  type: "date",
                  ...i("date"),
                  error: n.date?.message,
                }),
                e.jsx(x, {
                  label: "Messages envoyes",
                  type: "number",
                  min: "0",
                  ...i("messages_sent"),
                  error: n.messages_sent?.message,
                }),
                e.jsx(x, {
                  label: "Calls effectues",
                  type: "number",
                  min: "0",
                  ...i("calls_made"),
                  error: n.calls_made?.message,
                }),
              ],
            }),
            e.jsxs("div", {
              className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
              children: [
                e.jsx(x, {
                  label: "Looms envoyes",
                  type: "number",
                  min: "0",
                  ...i("looms_sent"),
                  error: n.looms_sent?.message,
                }),
                s &&
                  e.jsx(G, {
                    label: "Client (optionnel)",
                    options: S,
                    value: y ?? "",
                    onChange: (o) => j("client_id", o || null),
                    error: n.client_id?.message,
                  }),
              ],
            }),
            e.jsx(Q, {
              label: "Notes (optionnel)",
              placeholder: "Remarques sur l'activite du jour...",
              ...i("notes"),
              error: n.notes?.message,
            }),
            e.jsx("div", {
              className: "flex justify-end",
              children: e.jsx(W, {
                type: "submit",
                loading: N,
                icon: e.jsx(R, { className: "h-4 w-4" }),
                children: "Enregistrer",
              }),
            }),
          ],
        }),
      }),
    ],
  });
}
function se({ data: a, isLoading: s }) {
  return s
    ? e.jsx("div", {
        className: "space-y-3",
        children: Array.from({ length: 5 }).map((t, l) =>
          e.jsx(d, { className: "h-12 w-full rounded-md" }, l),
        ),
      })
    : a.length === 0
      ? e.jsx(J, {
          title: "Aucune activite",
          description:
            "Enregistrez votre premiere activite pour la voir apparaitre ici.",
        })
      : e.jsx("div", {
          className: "overflow-x-auto rounded-lg border border-border",
          children: e.jsxs("table", {
            className: "w-full text-left",
            children: [
              e.jsx("thead", {
                children: e.jsxs("tr", {
                  className: "border-b border-border bg-secondary/50",
                  children: [
                    e.jsx("th", {
                      className:
                        "px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground",
                      children: "Date",
                    }),
                    e.jsx("th", {
                      className:
                        "px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground",
                      children: "Messages",
                    }),
                    e.jsx("th", {
                      className:
                        "px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground",
                      children: "Calls",
                    }),
                    e.jsx("th", {
                      className:
                        "px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground",
                      children: "Looms",
                    }),
                    e.jsx("th", {
                      className:
                        "px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground",
                      children: "Notes",
                    }),
                  ],
                }),
              }),
              e.jsx("tbody", {
                children: a.map((t) =>
                  e.jsxs(
                    "tr",
                    {
                      className:
                        "border-b border-border transition-colors hover:bg-secondary/30",
                      children: [
                        e.jsx("td", {
                          className: "px-4 py-3 text-sm text-muted-foreground",
                          children: C(t.date),
                        }),
                        e.jsx("td", {
                          className: "px-4 py-3",
                          children: e.jsx("span", {
                            className:
                              "inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-0.5 text-sm font-semibold text-primary",
                            children: t.messages_sent,
                          }),
                        }),
                        e.jsx("td", {
                          className: "px-4 py-3",
                          children: e.jsx("span", {
                            className:
                              "inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-semibold text-blue-700",
                            children: t.calls_made,
                          }),
                        }),
                        e.jsx("td", {
                          className: "px-4 py-3",
                          children: e.jsx("span", {
                            className:
                              "inline-flex items-center justify-center rounded-full bg-purple-100 px-3 py-0.5 text-sm font-semibold text-purple-700",
                            children: t.looms_sent,
                          }),
                        }),
                        e.jsx("td", {
                          className: "max-w-[300px] px-4 py-3",
                          children: e.jsx("span", {
                            className: "truncate text-sm text-muted-foreground",
                            children: t.notes || "-",
                          }),
                        }),
                      ],
                    },
                    t.id,
                  ),
                ),
              }),
            ],
          }),
        });
}
function ve() {
  Z("Activité");
  const { user: a } = p(),
    { isAdmin: s } = g(),
    t = a?.id,
    { data: l, isLoading: i } = M(!s && t ? { user_id: t } : {});
  return e.jsxs("div", {
    className: "space-y-8",
    children: [
      e.jsxs("div", {
        children: [
          e.jsx("h1", {
            className: "text-xl sm:text-2xl font-bold text-foreground",
            children: "Activité Prospection",
          }),
          e.jsx("p", {
            className: "mt-1 text-sm text-muted-foreground",
            children: s
              ? "Suivez l'activité de prospection de vos élèves"
              : "Enregistrez et suivez votre activité de prospection quotidienne",
          }),
        ],
      }),
      e.jsx($, { userId: s ? void 0 : t }),
      e.jsx(ee, {}),
      e.jsxs("div", {
        children: [
          e.jsx("h2", {
            className: "mb-4 text-lg font-semibold text-foreground",
            children: "Historique",
          }),
          e.jsx(se, { data: l ?? [], isLoading: i }),
        ],
      }),
    ],
  });
}
export { ve as default };
