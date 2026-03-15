import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { r as u } from "./vendor-react-Cci7g3Cb.js";
import { a as Q, b as Y, c as X, u as Z } from "./useCallCalendar-B0TAFn5Z.js";
import { u as q } from "./useClients-oFN0czBK.js";
import { C as R, d as H } from "./card-Dkj99_H3.js";
import { S as w, c as j, f as V, h as ee } from "./index-DY9GA2La.js";
import {
  E as se,
  ai as te,
  as as ae,
  at as re,
  au as ne,
  ar as le,
  z as ie,
  av as oe,
  q as de,
} from "./vendor-ui-DDdrexJZ.js";
import { E as F } from "./empty-state-BFSeK4Tv.js";
import {
  C as J,
  f as z,
  g as W,
  h as $,
  b as ce,
  i as K,
} from "./constants-IBlSVYu1.js";
import {
  k as G,
  l as me,
  p as ue,
  m as L,
  f as v,
  n as xe,
  o as pe,
  q as fe,
} from "./vendor-utils-DoLlG-6J.js";
import { B as ge } from "./badge-CFrXqKTx.js";
import { u as he } from "./vendor-forms-Ct2mZ2NL.js";
import { a as ye } from "./zod-COY_rf8d.js";
import { c as be } from "./forms-zLivl21i.js";
import { a as je } from "./useLeads-TuKFlYpV.js";
import { u as ve } from "./useUsers-BngZVZxm.js";
import { M as Ce } from "./modal-DBBZDXoW.js";
import { I as B } from "./input-B9vrc6Q3.js";
import { S as b } from "./select-E7QvXrZc.js";
import { T as Ne } from "./textarea-D7qrlVHg.js";
import { B as k } from "./button-DlbP8VPc.js";
import { T as we, a as U } from "./tabs-oT6f7FFv.js";
import { e as ke } from "./csv-DLhVFTuh.js";
import { u as Se } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-supabase-BZ0N5lZN.js";
function _e({ clientId: c }) {
  const { data: i, isLoading: a } = Q(c ? { client_id: c } : {});
  if (a)
    return e.jsx("div", {
      className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
      children: Array.from({ length: 4 }).map((s, o) =>
        e.jsx(
          R,
          {
            children: e.jsxs(H, {
              className: "p-5",
              children: [
                e.jsx(w, { className: "h-10 w-10 rounded-lg" }),
                e.jsx(w, { className: "mt-3 h-4 w-24" }),
                e.jsx(w, { className: "mt-2 h-8 w-16" }),
              ],
            }),
          },
          o,
        ),
      ),
    });
  const p = [
    {
      title: "Calls aujourd'hui",
      value: String(i?.today ?? 0),
      icon: se,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Cette semaine",
      value: String(i?.total ?? 0),
      icon: te,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "A venir",
      value: String(i?.upcoming ?? 0),
      icon: ae,
      color: "bg-warning/10 text-warning",
    },
    {
      title: "Réalisés",
      value: String(i?.réalisé ?? 0),
      icon: re,
      color: "bg-success/10 text-success",
    },
  ];
  return e.jsx("div", {
    className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
    children: p.map((s) =>
      e.jsx(
        R,
        {
          children: e.jsxs(H, {
            className: "p-5",
            children: [
              e.jsx("div", {
                className: j(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  s.color,
                ),
                children: e.jsx(s.icon, { className: "h-5 w-5" }),
              }),
              e.jsxs("div", {
                className: "mt-3",
                children: [
                  e.jsx("p", {
                    className: "text-sm font-medium text-muted-foreground",
                    children: s.title,
                  }),
                  e.jsx("p", {
                    className: "mt-1 text-2xl font-bold text-foreground",
                    children: s.value,
                  }),
                ],
              }),
            ],
          }),
        },
        s.title,
      ),
    ),
  });
}
const Le = Array.from({ length: 13 }, (c, i) => i + 8),
  Te = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
function Ae({ calls: c, weekStart: i, isLoading: a, onCallClick: p }) {
  const s = u.useMemo(() => {
      const d = G(i, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (l, g) => me(d, g));
    }, [i]),
    o = u.useMemo(() => {
      const d = new Map();
      for (const l of c) {
        const g = ue(l.date);
        for (const f of s)
          if (L(g, f)) {
            const x = parseInt(l.time.split(":")[0], 10),
              r = `${v(f, "yyyy-MM-dd")}-${x}`,
              m = d.get(r) ?? [];
            (m.push(l), d.set(r, m));
          }
      }
      return d;
    }, [c, s]);
  if (a)
    return e.jsx("div", {
      className: "space-y-2",
      children: Array.from({ length: 6 }).map((d, l) =>
        e.jsx(w, { className: "h-16 w-full rounded-md" }, l),
      ),
    });
  if (c.length === 0)
    return e.jsx(F, {
      title: "Aucun call cette semaine",
      description: "Planifiez un nouveau call pour le voir apparaître ici.",
    });
  const h = new Date();
  return e.jsx("div", {
    className: "overflow-x-auto rounded-lg border border-border",
    children: e.jsxs("div", {
      className: "min-w-[640px]",
      children: [
        e.jsxs("div", {
          className:
            "grid grid-cols-[40px_repeat(7,1fr)] border-b border-border bg-secondary/50",
          children: [
            e.jsx("div", {
              className: "px-2 py-3 text-xs font-medium text-muted-foreground",
            }),
            s.map((d, l) =>
              e.jsxs(
                "div",
                {
                  className: j(
                    "px-2 py-3 text-center",
                    L(d, h) && "bg-primary/5",
                  ),
                  children: [
                    e.jsx("div", {
                      className:
                        "text-xs font-medium uppercase text-muted-foreground",
                      children: Te[l],
                    }),
                    e.jsx("div", {
                      className: j(
                        "mt-0.5 text-sm font-semibold",
                        L(d, h) ? "text-primary" : "text-foreground",
                      ),
                      children: v(d, "d", { locale: V }),
                    }),
                  ],
                },
                l,
              ),
            ),
          ],
        }),
        Le.map((d) =>
          e.jsxs(
            "div",
            {
              className:
                "grid grid-cols-[40px_repeat(7,1fr)] border-b border-border last:border-b-0",
              children: [
                e.jsxs("div", {
                  className:
                    "flex items-start px-2 py-2 text-xs text-muted-foreground",
                  children: [d, "h00"],
                }),
                s.map((l, g) => {
                  const f = `${v(l, "yyyy-MM-dd")}-${d}`,
                    x = o.get(f) ?? [];
                  return e.jsx(
                    "div",
                    {
                      className: j(
                        "min-h-[48px] border-l border-border px-1 py-1",
                        L(l, h) && "bg-primary/5",
                      ),
                      children: x.map((r) =>
                        e.jsxs(
                          "button",
                          {
                            type: "button",
                            onClick: () => p?.(r),
                            className: j(
                              "mb-1 w-full rounded px-2 py-1 text-left text-xs transition-opacity hover:opacity-80 cursor-pointer",
                              J[r.type],
                            ),
                            children: [
                              e.jsxs("div", {
                                className:
                                  "flex items-center justify-between gap-1",
                                children: [
                                  e.jsxs("span", {
                                    className: "truncate font-medium",
                                    children: [
                                      r.type === "iclosed" &&
                                        e.jsx("span", {
                                          className:
                                            "mr-1 inline-flex items-center justify-center rounded bg-blue-600 px-1 py-px text-[8px] font-bold text-white leading-none",
                                          children: "iC",
                                        }),
                                      r.time.slice(0, 5),
                                    ],
                                  }),
                                  e.jsx("span", {
                                    className: j(
                                      "inline-block h-1.5 w-1.5 rounded-full",
                                      r.status === "réalisé"
                                        ? "bg-green-500"
                                        : r.status === "no_show"
                                          ? "bg-red-500"
                                          : r.status === "annulé"
                                            ? "bg-gray-400"
                                            : r.status === "reporté"
                                              ? "bg-orange-500"
                                              : "bg-blue-500",
                                    ),
                                  }),
                                ],
                              }),
                              e.jsx("div", {
                                className: "truncate text-[10px] opacity-80",
                                children:
                                  r.client?.name ??
                                  r.lead?.name ??
                                  "Sans client",
                              }),
                            ],
                          },
                          r.id,
                        ),
                      ),
                    },
                    g,
                  );
                }),
              ],
            },
            d,
          ),
        ),
      ],
    }),
  });
}
function Me({ calls: c, isLoading: i, onCallClick: a }) {
  const p = Y();
  return i
    ? e.jsx("div", {
        className: "space-y-3",
        children: Array.from({ length: 5 }).map((s, o) =>
          e.jsx(w, { className: "h-12 w-full rounded-md" }, o),
        ),
      })
    : c.length === 0
      ? e.jsx(F, {
          title: "Aucun call",
          description: "Aucun call ne correspond à vos critères.",
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
                      children: "Heure",
                    }),
                    e.jsx("th", {
                      className:
                        "px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground",
                      children: "Client",
                    }),
                    e.jsx("th", {
                      className:
                        "px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground",
                      children: "Lead",
                    }),
                    e.jsx("th", {
                      className:
                        "px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground",
                      children: "Type",
                    }),
                    e.jsx("th", {
                      className:
                        "px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground",
                      children: "Statut",
                    }),
                    e.jsx("th", {
                      className:
                        "px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground",
                      children: "Lien",
                    }),
                  ],
                }),
              }),
              e.jsx("tbody", {
                children: c.map((s) =>
                  e.jsxs(
                    "tr",
                    {
                      className:
                        "border-b border-border transition-colors hover:bg-secondary/30 cursor-pointer",
                      onClick: () => a?.(s),
                      children: [
                        e.jsx("td", {
                          className: "px-4 py-3 text-sm text-muted-foreground",
                          children: ee(s.date),
                        }),
                        e.jsx("td", {
                          className:
                            "px-4 py-3 text-sm font-medium text-foreground",
                          children: s.time.slice(0, 5),
                        }),
                        e.jsx("td", {
                          className: "px-4 py-3 text-sm text-foreground",
                          children: s.client?.name ?? "-",
                        }),
                        e.jsx("td", {
                          className: "px-4 py-3 text-sm text-muted-foreground",
                          children: s.lead?.name ?? "-",
                        }),
                        e.jsx("td", {
                          className: "px-4 py-3",
                          children: e.jsx(ge, {
                            className: J[s.type],
                            children: z[s.type],
                          }),
                        }),
                        e.jsx("td", {
                          className: "px-4 py-3",
                          onClick: (o) => o.stopPropagation(),
                          children: e.jsx("select", {
                            value: s.status,
                            onChange: (o) => {
                              p.mutate({ id: s.id, status: o.target.value });
                            },
                            className: j(
                              "rounded-full px-2.5 py-0.5 text-xs font-medium border-0 cursor-pointer",
                              "focus:outline-none focus:ring-2 focus:ring-ring",
                              ce[s.status],
                            ),
                            children: W.map((o) =>
                              e.jsx("option", { value: o, children: $[o] }, o),
                            ),
                          }),
                        }),
                        e.jsx("td", {
                          className: "px-4 py-3",
                          onClick: (o) => o.stopPropagation(),
                          children: s.link
                            ? e.jsxs("a", {
                                href: s.link,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className:
                                  "inline-flex items-center gap-1 text-sm text-primary hover:underline",
                                children: [
                                  e.jsx(ne, { className: "h-3.5 w-3.5" }),
                                  "Lien",
                                ],
                              })
                            : e.jsx("span", {
                                className: "text-sm text-muted-foreground",
                                children: "-",
                              }),
                        }),
                      ],
                    },
                    s.id,
                  ),
                ),
              }),
            ],
          }),
        });
}
function Oe({ open: c, onClose: i, call: a }) {
  const p = !!a,
    s = X(),
    o = Y(),
    { data: h } = q(),
    { data: d } = ve(),
    {
      register: l,
      handleSubmit: g,
      reset: f,
      setValue: x,
      watch: r,
      formState: { errors: m, isSubmitting: C },
    } = he({
      resolver: ye(be),
      defaultValues: {
        client_id: "",
        lead_id: null,
        assigned_to: null,
        date: new Date().toISOString().split("T")[0],
        time: "09:00",
        type: "manuel",
        status: "planifié",
        link: "",
        notes: "",
      },
    }),
    N = r("client_id"),
    T = r("type"),
    y = r("status"),
    S = r("lead_id"),
    A = r("assigned_to"),
    { data: _ } = je(N || void 0);
  u.useEffect(() => {
    f(
      a
        ? {
            client_id: a.client_id ?? "",
            lead_id: a.lead_id,
            assigned_to: a.assigned_to,
            date: a.date,
            time: a.time,
            type: a.type,
            status: a.status,
            link: a.link ?? "",
            notes: a.notes ?? "",
          }
        : {
            client_id: "",
            lead_id: null,
            assigned_to: null,
            date: new Date().toISOString().split("T")[0],
            time: "09:00",
            type: "manuel",
            status: "planifié",
            link: "",
            notes: "",
          },
    );
  }, [a, f]);
  const M = async (t) => {
      const n = { ...t, link: t.link || void 0, notes: t.notes || void 0 };
      (p && a
        ? await o.mutateAsync({ id: a.id, ...n })
        : await s.mutateAsync(n),
        i());
    },
    O = (h?.data ?? []).map((t) => ({ value: t.id, label: t.name })),
    D = [
      { value: "", label: "Aucun lead" },
      ...(_ ?? []).map((t) => ({ value: t.id, label: t.name })),
    ],
    E = [
      { value: "", label: "Non assigne" },
      ...(d ?? []).map((t) => ({ value: t.id, label: t.full_name })),
    ],
    P = K.map((t) => ({ value: t, label: z[t] })),
    I = W.map((t) => ({ value: t, label: $[t] }));
  return e.jsx(Ce, {
    open: c,
    onClose: i,
    title: p ? "Modifier le call" : "Nouveau call",
    size: "lg",
    children: e.jsxs("form", {
      onSubmit: g(M),
      className: "space-y-4",
      children: [
        e.jsxs("div", {
          className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
          children: [
            e.jsx(B, {
              label: "Date",
              type: "date",
              ...l("date"),
              error: m.date?.message,
            }),
            e.jsx(B, {
              label: "Heure",
              type: "time",
              ...l("time"),
              error: m.time?.message,
            }),
          ],
        }),
        e.jsxs("div", {
          className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
          children: [
            e.jsx(b, {
              label: "Client",
              options: O,
              value: N,
              onChange: (t) => {
                (x("client_id", t), x("lead_id", null));
              },
              error: m.client_id?.message,
            }),
            e.jsx(b, {
              label: "Lead",
              options: D,
              value: S ?? "",
              onChange: (t) => x("lead_id", t || null),
              error: m.lead_id?.message,
            }),
          ],
        }),
        e.jsxs("div", {
          className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
          children: [
            e.jsx(b, {
              label: "Type",
              options: P,
              value: T,
              onChange: (t) => x("type", t),
              error: m.type?.message,
            }),
            e.jsx(b, {
              label: "Statut",
              options: I,
              value: y,
              onChange: (t) => x("status", t),
              error: m.status?.message,
            }),
          ],
        }),
        e.jsx(b, {
          label: "Assigné à",
          options: E,
          value: A ?? "",
          onChange: (t) => x("assigned_to", t || null),
          error: m.assigned_to?.message,
        }),
        e.jsx(B, {
          label: "Lien de la reunion",
          type: "url",
          placeholder: "https://...",
          ...l("link"),
          error: m.link?.message,
        }),
        e.jsx(Ne, { label: "Notes", ...l("notes"), error: m.notes?.message }),
        e.jsxs("div", {
          className: "flex justify-end gap-3 pt-2",
          children: [
            e.jsx(k, {
              type: "button",
              variant: "secondary",
              onClick: i,
              children: "Annuler",
            }),
            e.jsx(k, {
              type: "submit",
              loading: C,
              children: p ? "Mettre a jour" : "Planifier",
            }),
          ],
        }),
      ],
    }),
  });
}
function rs() {
  Se("Calendrier");
  const [c, i] = u.useState(new Date()),
    [a, p] = u.useState("week"),
    [s, o] = u.useState(""),
    [h, d] = u.useState(""),
    [l, g] = u.useState(""),
    [f, x] = u.useState(!1),
    [r, m] = u.useState(null),
    C = u.useMemo(() => G(c, { weekStartsOn: 1 }), [c]),
    N = u.useMemo(() => xe(c, { weekStartsOn: 1 }), [c]),
    T = {
      date_from: v(C, "yyyy-MM-dd"),
      date_to: v(N, "yyyy-MM-dd"),
      client_id: s || void 0,
      type: h || void 0,
      status: l || void 0,
    },
    { data: y, isLoading: S } = Z(T),
    { data: A } = q(),
    _ = u.useCallback((n) => {
      (m(n), x(!0));
    }, []),
    M = u.useCallback(() => {
      (x(!1), m(null));
    }, []),
    O = u.useCallback(() => {
      y &&
        ke(
          y.map((n) => ({
            ...n,
            client_name: n.client?.name ?? "",
            lead_name: n.lead?.name ?? "",
          })),
          [
            { key: "date", label: "Date" },
            { key: "time", label: "Heure" },
            { key: "client_name", label: "Client" },
            { key: "lead_name", label: "Lead" },
            { key: "type", label: "Type" },
            { key: "status", label: "Statut" },
            { key: "link", label: "Lien" },
            { key: "notes", label: "Notes" },
          ],
          "calls-export",
        );
    }, [y]),
    D = [
      { value: "", label: "Tous les clients" },
      ...(A?.data ?? []).map((n) => ({ value: n.id, label: n.name })),
    ],
    E = [
      { value: "", label: "Tous les types" },
      ...K.map((n) => ({ value: n, label: z[n] })),
    ],
    P = [
      { value: "", label: "Tous les statuts" },
      ...W.map((n) => ({ value: n, label: $[n] })),
    ],
    I = [
      { value: "week", label: "Semaine" },
      { value: "list", label: "Liste" },
    ],
    t = `${v(C, "d MMM", { locale: V })} - ${v(N, "d MMM yyyy", { locale: V })}`;
  return e.jsxs("div", {
    className: "space-y-8",
    children: [
      e.jsxs("div", {
        className:
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("h1", {
                className: "text-xl sm:text-2xl font-bold text-foreground",
                children: "Calendrier des Calls",
              }),
              e.jsx("p", {
                className: "mt-1 text-sm text-muted-foreground",
                children: "Planifiez et suivez vos appels",
              }),
            ],
          }),
          e.jsxs("div", {
            className: "flex flex-shrink-0 items-center gap-2",
            children: [
              e.jsxs("span", {
                className:
                  "inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700",
                children: [
                  e.jsx("span", {
                    className:
                      "h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse",
                  }),
                  "iClosed",
                ],
              }),
              e.jsx(k, {
                variant: "secondary",
                size: "sm",
                icon: e.jsx(le, { className: "h-4 w-4" }),
                onClick: O,
                disabled: !y?.length,
                children: "Exporter CSV",
              }),
              e.jsx(k, {
                size: "sm",
                icon: e.jsx(ie, { className: "h-4 w-4" }),
                onClick: () => x(!0),
                children: "Nouveau call",
              }),
            ],
          }),
        ],
      }),
      e.jsx(_e, {}),
      e.jsxs("div", {
        className:
          "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        children: [
          e.jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              e.jsx("button", {
                type: "button",
                onClick: () => i((n) => pe(n)),
                className:
                  "inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer",
                children: e.jsx(oe, { className: "h-4 w-4" }),
              }),
              e.jsx("span", {
                className:
                  "min-w-[140px] sm:min-w-[180px] text-center text-sm font-medium text-foreground",
                children: t,
              }),
              e.jsx("button", {
                type: "button",
                onClick: () => i((n) => fe(n, 1)),
                className:
                  "inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer",
                children: e.jsx(de, { className: "h-4 w-4" }),
              }),
              e.jsx(k, {
                variant: "ghost",
                size: "sm",
                onClick: () => i(new Date()),
                children: "Aujourd'hui",
              }),
            ],
          }),
          e.jsxs("div", {
            className:
              "flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3",
            children: [
              e.jsx(b, {
                options: D,
                value: s,
                onChange: o,
                placeholder: "Client",
                className: "w-full sm:w-44",
              }),
              e.jsx(b, {
                options: E,
                value: h,
                onChange: d,
                placeholder: "Type",
                className: "w-full sm:w-36",
              }),
              e.jsx(b, {
                options: P,
                value: l,
                onChange: g,
                placeholder: "Statut",
                className: "w-full sm:w-36",
              }),
            ],
          }),
        ],
      }),
      e.jsx(we, { tabs: I, value: a, onChange: p }),
      e.jsx(U, {
        value: "week",
        activeValue: a,
        children: e.jsx(Ae, {
          calls: y ?? [],
          weekStart: C,
          isLoading: S,
          onCallClick: _,
        }),
      }),
      e.jsx(U, {
        value: "list",
        activeValue: a,
        children: e.jsx(Me, { calls: y ?? [], isLoading: S, onCallClick: _ }),
      }),
      e.jsx(Oe, { open: f, onClose: M, call: r }),
    ],
  });
}
export { rs as default };
