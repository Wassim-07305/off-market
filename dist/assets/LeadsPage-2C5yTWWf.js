import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { r } from "./vendor-react-Cci7g3Cb.js";
import {
  u as be,
  b as z,
  c as je,
  d as ve,
  e as Ce,
  f as ye,
  g as Ne,
  h as Se,
  i as we,
} from "./useLeads-TuKFlYpV.js";
import { u as Z } from "./useClients-oFN0czBK.js";
import { C as q } from "./card-Dkj99_H3.js";
import { B as Q } from "./badge-CFrXqKTx.js";
import {
  S as V,
  b as W,
  e as _e,
  c as y,
  h as ke,
  g as Le,
  f as Ae,
} from "./index-DY9GA2La.js";
import {
  U as Ee,
  Z as De,
  ah as Te,
  T as Ie,
  t as H,
  V as Pe,
  ak as Re,
  al as X,
  am as M,
  a1 as Y,
  an as Me,
  ao as Oe,
  ap as Ve,
  aq as Ue,
  ar as Be,
  z as Ke,
  J as ze,
  N as Fe,
} from "./vendor-ui-DDdrexJZ.js";
import {
  u as qe,
  f as $,
  c as He,
  g as $e,
  a as Ge,
} from "./index-Ddu5uNF-.js";
import { C as G } from "./checkbox-yH1R51Jo.js";
import { E as Je } from "./empty-state-BFSeK4Tv.js";
import {
  c as U,
  d as E,
  L as T,
  a as Ze,
  e as ee,
  I as Qe,
} from "./constants-IBlSVYu1.js";
import {
  u as We,
  C as Xe,
  a as Ye,
  S as es,
  v as ss,
  b as ts,
  c as as,
  D as os,
  d as rs,
  e as ns,
  P as ls,
} from "./vendor-dnd-DrANF9GG.js";
import { g as is } from "./vendor-utils-DoLlG-6J.js";
import { u as cs } from "./vendor-forms-Ct2mZ2NL.js";
import { a as ds } from "./zod-COY_rf8d.js";
import { l as ms } from "./forms-zLivl21i.js";
import { u as us } from "./useUsers-BngZVZxm.js";
import { M as ps } from "./modal-DBBZDXoW.js";
import { I as _ } from "./input-B9vrc6Q3.js";
import { S as w } from "./select-E7QvXrZc.js";
import { T as xs } from "./textarea-D7qrlVHg.js";
import { B as A } from "./button-DlbP8VPc.js";
import { C as gs } from "./CSVImportModal-DBes1YXg.js";
import { S as fs } from "./search-input-dECf1iQ_.js";
import { P as hs } from "./pagination-DHo4QjB2.js";
import { e as bs } from "./csv-DLhVFTuh.js";
import { u as js } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-supabase-BZ0N5lZN.js";
function vs({ clientId: a }) {
  const { data: d, isLoading: o } = be(a);
  if (o)
    return e.jsx("div", {
      className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
      children: Array.from({ length: 4 }).map((c, m) =>
        e.jsx(
          q,
          {
            children: e.jsxs("div", {
              className: "p-5",
              children: [
                e.jsx(V, { className: "mb-3 h-10 w-10 rounded-xl" }),
                e.jsx(V, { className: "h-4 w-24" }),
                e.jsx(V, { className: "mt-2 h-7 w-16" }),
              ],
            }),
          },
          m,
        ),
      ),
    });
  const x = [
    {
      title: "Total leads",
      value: String(d?.total ?? 0),
      icon: Ee,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Leads a relancer",
      value: String(d?.à_relancer ?? 0),
      icon: De,
      color: "bg-destructive/10 text-destructive",
      badge: (d?.à_relancer ?? 0) > 0,
    },
    {
      title: "CA Contracte",
      value: W(d?.ca_contracté ?? 0),
      icon: Te,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Taux de closing",
      value: _e(d?.tauxClosing ?? 0),
      icon: Ie,
      color: "bg-blue-50 text-blue-600",
    },
  ];
  return e.jsx("div", {
    className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
    children: x.map((c) =>
      e.jsx(
        q,
        {
          children: e.jsxs("div", {
            className: "p-5",
            children: [
              e.jsxs("div", {
                className: "flex items-start justify-between",
                children: [
                  e.jsx("div", {
                    className: `flex h-10 w-10 items-center justify-center rounded-xl ${c.color}`,
                    children: e.jsx(c.icon, { className: "h-5 w-5" }),
                  }),
                  c.badge &&
                    e.jsx(Q, {
                      variant: "destructive",
                      className: "text-[10px]",
                      children: "Action requise",
                    }),
                ],
              }),
              e.jsxs("div", {
                className: "mt-3",
                children: [
                  e.jsx("p", {
                    className: "text-xs font-medium text-muted-foreground",
                    children: c.title,
                  }),
                  e.jsx("p", {
                    className:
                      "mt-0.5 text-xl font-bold tracking-tight text-foreground",
                    children: c.value,
                  }),
                ],
              }),
            ],
          }),
        },
        c.title,
      ),
    ),
  });
}
async function Cs(a, d) {
  const {
    successMessage: o = "Copié dans le presse-papiers",
    errorMessage: x = "Échec de la copie",
    silent: c = !1,
  } = d ?? {};
  try {
    if (navigator.clipboard && window.isSecureContext)
      await navigator.clipboard.writeText(a);
    else {
      const m = document.createElement("textarea");
      ((m.value = a),
        (m.style.position = "fixed"),
        (m.style.left = "-999999px"),
        (m.style.top = "-999999px"),
        document.body.appendChild(m),
        m.focus(),
        m.select(),
        document.execCommand("copy"),
        m.remove());
    }
    return (c || H.success(o), !0);
  } catch {
    return (c || H.error(x), !1);
  }
}
function ys({ value: a, className: d, iconClassName: o, successMessage: x }) {
  const [c, m] = r.useState(!1),
    u = r.useCallback(async () => {
      (await Cs(a, { successMessage: x })) &&
        (m(!0), setTimeout(() => m(!1), 2e3));
    }, [a, x]);
  return e.jsx("button", {
    type: "button",
    onClick: u,
    className: y(
      "inline-flex items-center justify-center rounded-md p-1.5 transition-colors",
      "text-muted-foreground hover:bg-muted hover:text-foreground",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      d,
    ),
    title: c ? "Copié !" : "Copier",
    children: c
      ? e.jsx(Pe, { className: y("h-4 w-4 text-emerald-500", o) })
      : e.jsx(Re, { className: y("h-4 w-4", o) }),
  });
}
function O({
  value: a,
  onSave: d,
  placeholder: o = "Cliquer pour modifier...",
  className: x,
  inputClassName: c,
  textClassName: m,
  disabled: u = !1,
  multiline: h = !1,
}) {
  const [g, i] = r.useState(!1),
    [v, j] = r.useState(a),
    s = r.useRef(null);
  (r.useEffect(() => {
    j(a);
  }, [a]),
    r.useEffect(() => {
      g && s.current && (s.current.focus(), s.current.select());
    }, [g]));
  const t = r.useCallback(() => {
      const b = v.trim();
      (b !== a && d(b), i(!1));
    }, [v, a, d]),
    f = r.useCallback(() => {
      (j(a), i(!1));
    }, [a]),
    p = r.useCallback(
      (b) => {
        (b.key === "Enter" && !h) ||
        (b.key === "Enter" && h && (b.metaKey || b.ctrlKey))
          ? (b.preventDefault(), t())
          : b.key === "Escape" && f();
      },
      [t, f, h],
    );
  if (g) {
    const b = {
      value: v,
      onChange: (k) => j(k.target.value),
      onBlur: t,
      onKeyDown: p,
      className: y(
        "w-full rounded-md border border-ring bg-background px-2 py-1 text-sm text-foreground",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
        c,
      ),
    };
    return h
      ? e.jsx("textarea", { ref: s, rows: 3, ...b })
      : e.jsx("input", { ref: s, type: "text", ...b });
  }
  return e.jsxs("div", {
    className: y(
      "group inline-flex items-center gap-1.5",
      !u && "cursor-pointer",
      x,
    ),
    onClick: () => {
      u || i(!0);
    },
    onKeyDown: (b) => {
      !u && (b.key === "Enter" || b.key === " ") && (b.preventDefault(), i(!0));
    },
    role: u ? void 0 : "button",
    tabIndex: u ? void 0 : 0,
    children: [
      e.jsx("span", {
        className: y(
          "text-sm",
          !a && "text-muted-foreground",
          !u && "group-hover:text-primary",
          "transition-colors duration-200",
          m,
        ),
        children: a || o,
      }),
      !u &&
        e.jsx(X, {
          className:
            "h-3 w-3 text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100",
        }),
    ],
  });
}
const S = He();
function Ns({ data: a, isLoading: d, onEdit: o, onSelectionChange: x }) {
  const [c, m] = r.useState([]),
    [u, h] = r.useState({}),
    g = z(),
    i = je();
  (r.useEffect(() => {
    if (x) {
      const s = Object.keys(u)
        .filter((t) => u[t])
        .map((t) => a[parseInt(t)]?.id)
        .filter(Boolean);
      x(s);
    }
  }, [u, a, x]),
    r.useEffect(() => {
      h({});
    }, [a]));
  const v = r.useMemo(
      () => [
        S.display({
          id: "select",
          header: ({ table: s }) =>
            e.jsx(G, {
              checked: s.getIsAllPageRowsSelected(),
              onChange: s.getToggleAllPageRowsSelectedHandler(),
            }),
          cell: ({ row: s }) =>
            e.jsx(G, {
              checked: s.getIsSelected(),
              onChange: s.getToggleSelectedHandler(),
            }),
        }),
        S.accessor("created_at", {
          header: ({ column: s }) =>
            e.jsxs("button", {
              type: "button",
              className: "inline-flex items-center gap-1 cursor-pointer",
              onClick: () => s.toggleSorting(s.getIsSorted() === "asc"),
              children: ["Date", e.jsx(M, { className: "h-3.5 w-3.5" })],
            }),
          cell: (s) =>
            e.jsx("span", {
              className: "text-sm text-muted-foreground",
              children: ke(s.getValue()),
            }),
        }),
        S.accessor("name", {
          header: ({ column: s }) =>
            e.jsxs("button", {
              type: "button",
              className: "inline-flex items-center gap-1 cursor-pointer",
              onClick: () => s.toggleSorting(s.getIsSorted() === "asc"),
              children: ["Nom", e.jsx(M, { className: "h-3.5 w-3.5" })],
            }),
          cell: (s) =>
            e.jsx("span", {
              className: "text-sm font-medium text-foreground",
              children: s.getValue(),
            }),
        }),
        S.accessor("email", {
          header: "Email",
          cell: (s) => {
            const t = s.getValue();
            return t
              ? e.jsxs("span", {
                  className:
                    "inline-flex items-center gap-1 text-sm text-muted-foreground",
                  children: [
                    e.jsx("a", {
                      href: `mailto:${t}`,
                      className: "hover:text-primary hover:underline",
                      onClick: (f) => f.stopPropagation(),
                      children: t,
                    }),
                    e.jsx(ys, {
                      value: t,
                      successMessage: `Email "${t}" copié`,
                      className: "opacity-0 group-hover/row:opacity-100",
                    }),
                  ],
                })
              : e.jsx("span", {
                  className: "text-sm text-muted-foreground",
                  children: "-",
                });
          },
        }),
        S.accessor("source", {
          header: "Source",
          cell: (s) => {
            const t = s.getValue();
            return t
              ? e.jsx(Q, { variant: "secondary", children: U[t] })
              : e.jsx("span", {
                  className: "text-sm text-muted-foreground",
                  children: "-",
                });
          },
        }),
        S.accessor("status", {
          header: "Statut",
          cell: (s) => {
            const t = s.row.original,
              f = s.getValue();
            return e.jsx("select", {
              value: f,
              onChange: (p) => {
                g.mutate({ id: t.id, status: p.target.value });
              },
              className: y(
                "rounded-full px-2.5 py-0.5 text-xs font-medium border-0 cursor-pointer",
                "focus:outline-none focus:ring-2 focus:ring-ring",
                Ze[f],
              ),
              children: E.map((p) =>
                e.jsx("option", { value: p, children: T[p] }, p),
              ),
            });
          },
        }),
        S.accessor("ca_contracté", {
          header: ({ column: s }) =>
            e.jsxs("button", {
              type: "button",
              className: "inline-flex items-center gap-1 cursor-pointer",
              onClick: () => s.toggleSorting(s.getIsSorted() === "asc"),
              children: [
                "CA Contracté",
                e.jsx(M, { className: "h-3.5 w-3.5" }),
              ],
            }),
          cell: (s) => {
            const t = s.row.original;
            return e.jsx(O, {
              value: String(s.getValue()),
              onSave: (f) => {
                const p = parseFloat(f);
                isNaN(p) || g.mutate({ id: t.id, ca_contracté: p });
              },
              textClassName: "font-mono",
            });
          },
        }),
        S.accessor("ca_collecté", {
          header: ({ column: s }) =>
            e.jsxs("button", {
              type: "button",
              className: "inline-flex items-center gap-1 cursor-pointer",
              onClick: () => s.toggleSorting(s.getIsSorted() === "asc"),
              children: ["CA Collecté", e.jsx(M, { className: "h-3.5 w-3.5" })],
            }),
          cell: (s) => {
            const t = s.row.original;
            return e.jsx(O, {
              value: String(s.getValue()),
              onSave: (f) => {
                const p = parseFloat(f);
                isNaN(p) || g.mutate({ id: t.id, ca_collecté: p });
              },
              textClassName: "font-mono",
            });
          },
        }),
        S.accessor("commission_setter", {
          header: "Com. Setter",
          cell: (s) => {
            const t = s.row.original;
            return e.jsx(O, {
              value: String(s.getValue()),
              onSave: (f) => {
                const p = parseFloat(f);
                isNaN(p) || g.mutate({ id: t.id, commission_setter: p });
              },
              textClassName: "font-mono",
            });
          },
        }),
        S.accessor("commission_closer", {
          header: "Com. Closer",
          cell: (s) => {
            const t = s.row.original;
            return e.jsx(O, {
              value: String(s.getValue()),
              onSave: (f) => {
                const p = parseFloat(f);
                isNaN(p) || g.mutate({ id: t.id, commission_closer: p });
              },
              textClassName: "font-mono",
            });
          },
        }),
        S.display({
          id: "actions",
          header: "",
          cell: (s) => {
            const t = s.row.original;
            return e.jsxs("div", {
              className: "flex items-center gap-1",
              children: [
                o &&
                  e.jsx("button", {
                    type: "button",
                    onClick: () => o(t),
                    className:
                      "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer",
                    children: e.jsx(X, { className: "h-3.5 w-3.5" }),
                  }),
                e.jsx("button", {
                  type: "button",
                  onClick: () => {
                    confirm("Supprimer ce lead ?") && i.mutate(t.id);
                  },
                  className:
                    "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer",
                  children: e.jsx(Y, { className: "h-3.5 w-3.5" }),
                }),
              ],
            });
          },
        }),
      ],
      [g, i, o],
    ),
    j = qe({
      data: a,
      columns: v,
      state: { sorting: c, rowSelection: u },
      onSortingChange: m,
      onRowSelectionChange: h,
      enableRowSelection: !0,
      getCoreRowModel: Ge(),
      getSortedRowModel: $e(),
    });
  return d
    ? e.jsx("div", {
        className: "space-y-3",
        children: Array.from({ length: 5 }).map((s, t) =>
          e.jsx(V, { className: "h-12 w-full rounded-md" }, t),
        ),
      })
    : a.length === 0
      ? e.jsx(Je, {
          title: "Aucun lead",
          description: "Aucun lead ne correspond à vos critères de recherche.",
        })
      : e.jsx("div", {
          className: "overflow-x-auto rounded-lg border border-border",
          children: e.jsxs("table", {
            className: "w-full text-left",
            children: [
              e.jsx("thead", {
                children: j.getHeaderGroups().map((s) =>
                  e.jsx(
                    "tr",
                    {
                      className: "border-b border-border bg-secondary/50",
                      children: s.headers.map((t) =>
                        e.jsx(
                          "th",
                          {
                            className:
                              "px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground",
                            children: t.isPlaceholder
                              ? null
                              : $(t.column.columnDef.header, t.getContext()),
                          },
                          t.id,
                        ),
                      ),
                    },
                    s.id,
                  ),
                ),
              }),
              e.jsx("tbody", {
                children: j.getRowModel().rows.map((s) =>
                  e.jsx(
                    "tr",
                    {
                      className:
                        "group/row border-b border-border transition-colors hover:bg-secondary/30",
                      children: s.getVisibleCells().map((t) =>
                        e.jsx(
                          "td",
                          {
                            className: "px-4 py-3",
                            children: $(
                              t.column.columnDef.cell,
                              t.getContext(),
                            ),
                          },
                          t.id,
                        ),
                      ),
                    },
                    s.id,
                  ),
                ),
              }),
            ],
          }),
        });
}
const J = {
  instagram: "bg-pink-50 text-pink-600",
  linkedin: "bg-blue-50 text-blue-600",
  tiktok: "bg-slate-50 text-slate-700",
  referral: "bg-green-50 text-green-600",
  ads: "bg-amber-50 text-amber-600",
  autre: "bg-gray-50 text-gray-600",
};
function se({ lead: a }) {
  const {
      attributes: d,
      listeners: o,
      setNodeRef: x,
      transform: c,
      transition: m,
      isDragging: u,
    } = We({ id: a.id }),
    h = { transform: Xe.Transform.toString(c), transition: m };
  return e.jsx("div", {
    ref: x,
    style: h,
    className: y(
      "group rounded-xl border border-border/40 bg-white p-3 shadow-sm transition-all",
      "hover:shadow-md hover:border-border/60",
      u && "opacity-50 shadow-lg",
    ),
    children: e.jsxs("div", {
      className: "flex items-start gap-2",
      children: [
        e.jsx("button", {
          ...d,
          ...o,
          className:
            "mt-0.5 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing",
          children: e.jsx(Me, { className: "h-4 w-4" }),
        }),
        e.jsxs("div", {
          className: "min-w-0 flex-1",
          children: [
            e.jsx("p", {
              className: "text-sm font-medium text-foreground truncate",
              children: a.name,
            }),
            e.jsxs("div", {
              className: "mt-1.5 flex items-center gap-1.5 flex-wrap",
              children: [
                a.source &&
                  e.jsx("span", {
                    className: y(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                      J[a.source] ?? J.autre,
                    ),
                    children: U[a.source] ?? a.source,
                  }),
                a.ca_contracté > 0 &&
                  e.jsx("span", {
                    className: "text-[10px] font-semibold text-emerald-600",
                    children: W(a.ca_contracté),
                  }),
              ],
            }),
            e.jsxs("div", {
              className: "mt-2 flex items-center justify-between",
              children: [
                a.assigned_profile
                  ? e.jsx("div", {
                      className:
                        "flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-[8px] font-semibold text-red-700",
                      children: Le(a.assigned_profile.full_name),
                    })
                  : e.jsx("div", {}),
                e.jsx("span", {
                  className: "text-[10px] text-muted-foreground",
                  children: is(new Date(a.created_at), {
                    addSuffix: !0,
                    locale: Ae,
                  }),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
function Ss({ id: a, label: d, count: o, color: x, leads: c }) {
  const { setNodeRef: m, isOver: u } = Ye({ id: a });
  return e.jsxs("div", {
    ref: m,
    className: y(
      "flex w-64 shrink-0 flex-col rounded-2xl border border-border/40 bg-muted/30 transition-colors",
      "border-t-[3px]",
      x,
      u && "bg-primary/[0.03] border-primary/20",
    ),
    children: [
      e.jsxs("div", {
        className: "flex items-center justify-between px-4 py-3",
        children: [
          e.jsx("h3", {
            className: "text-sm font-semibold text-foreground",
            children: d,
          }),
          e.jsx("span", {
            className:
              "flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground",
            children: o,
          }),
        ],
      }),
      e.jsxs("div", {
        className: "flex-1 space-y-2 px-3 pb-3 min-h-[120px]",
        children: [
          e.jsx(es, {
            items: c.map((h) => h.id),
            strategy: ss,
            children: c.map((h) => e.jsx(se, { lead: h }, h.id)),
          }),
          c.length === 0 &&
            e.jsx("div", {
              className:
                "flex h-20 items-center justify-center rounded-xl border border-dashed border-border/40 text-xs text-muted-foreground",
              children: "Aucun lead",
            }),
        ],
      }),
    ],
  });
}
const ws = {
  premier_message: "border-t-slate-400",
  en_discussion: "border-t-blue-500",
  qualifie: "border-t-indigo-500",
  loom_envoye: "border-t-purple-500",
  call_planifie: "border-t-amber-500",
  close: "border-t-emerald-500",
  perdu: "border-t-red-500",
};
function _s({ leads: a, onStatusChange: d }) {
  const [o, x] = r.useState(null),
    c = ts(as(ls, { activationConstraint: { distance: 8 } })),
    m = E.map((i) => ({
      id: i,
      label: T[i],
      leads: a.filter((v) => v.status === i),
      color: ws[i],
    })),
    u = o ? a.find((i) => i.id === o) : null,
    h = r.useCallback((i) => {
      x(i.active.id);
    }, []),
    g = r.useCallback(
      (i) => {
        const { active: v, over: j } = i;
        if ((x(null), !j)) return;
        const s = v.id,
          t = j.id;
        if (E.includes(t)) {
          const f = a.find((p) => p.id === s);
          f && f.status !== t && d(s, t);
        }
      },
      [a, d],
    );
  return e.jsxs(os, {
    sensors: c,
    collisionDetection: rs,
    onDragStart: h,
    onDragEnd: g,
    children: [
      e.jsx("div", {
        className: "flex gap-4 overflow-x-auto pb-4",
        children: m.map((i) =>
          e.jsx(
            Ss,
            {
              id: i.id,
              label: i.label,
              count: i.leads.length,
              color: i.color,
              leads: i.leads,
            },
            i.id,
          ),
        ),
      }),
      e.jsx(ns, {
        children: u
          ? e.jsx("div", {
              className: "rotate-2 opacity-90",
              children: e.jsx(se, { lead: u }),
            })
          : null,
      }),
    ],
  });
}
function ks({ open: a, onClose: d, lead: o }) {
  const x = !!o,
    c = ve(),
    m = z(),
    { data: u } = Z(),
    { data: h } = us(),
    {
      register: g,
      handleSubmit: i,
      reset: v,
      setValue: j,
      watch: s,
      formState: { errors: t, isSubmitting: f },
    } = cs({
      resolver: ds(ms),
      defaultValues: {
        name: "",
        email: "",
        phone: "",
        source: void 0,
        status: "premier_message",
        client_id: null,
        assigned_to: null,
        ca_contracté: 0,
        ca_collecté: 0,
        commission_setter: 0,
        commission_closer: 0,
        notes: "",
      },
    });
  r.useEffect(() => {
    v(
      o
        ? {
            name: o.name,
            email: o.email ?? "",
            phone: o.phone ?? "",
            source: o.source ?? void 0,
            status: o.status,
            client_id: o.client_id,
            assigned_to: o.assigned_to,
            ca_contracté: o.ca_contracté,
            ca_collecté: o.ca_collecté,
            commission_setter: o.commission_setter,
            commission_closer: o.commission_closer,
            notes: o.notes ?? "",
          }
        : {
            name: "",
            email: "",
            phone: "",
            source: void 0,
            status: "premier_message",
            client_id: null,
            assigned_to: null,
            ca_contracté: 0,
            ca_collecté: 0,
            commission_setter: 0,
            commission_closer: 0,
            notes: "",
          },
    );
  }, [o, v]);
  const p = async (l) => {
      const R = {
        ...l,
        email: l.email || void 0,
        phone: l.phone || void 0,
        source: l.source || void 0,
        notes: l.notes || void 0,
      };
      (x && o
        ? await m.mutateAsync({ id: o.id, ...R })
        : await c.mutateAsync(R),
        d());
    },
    b = [
      { value: "", label: "Aucune source" },
      ...ee.map((l) => ({ value: l, label: U[l] })),
    ],
    k = E.map((l) => ({ value: l, label: T[l] })),
    C = [
      { value: "", label: "Aucun client" },
      ...(u?.data ?? []).map((l) => ({ value: l.id, label: l.name })),
    ],
    L = [
      { value: "", label: "Non assigne" },
      ...(h ?? []).map((l) => ({ value: l.id, label: l.full_name })),
    ],
    I = s("source"),
    D = s("status"),
    P = s("client_id"),
    B = s("assigned_to");
  return e.jsx(ps, {
    open: a,
    onClose: d,
    title: x ? "Modifier le lead" : "Nouveau lead",
    size: "lg",
    children: e.jsxs("form", {
      onSubmit: i(p),
      className: "space-y-4",
      children: [
        e.jsxs("div", {
          className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
          children: [
            e.jsx(_, { label: "Nom", ...g("name"), error: t.name?.message }),
            e.jsx(_, {
              label: "Email",
              type: "email",
              ...g("email"),
              error: t.email?.message,
            }),
          ],
        }),
        e.jsxs("div", {
          className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
          children: [
            e.jsx(_, {
              label: "Téléphone",
              ...g("phone"),
              error: t.phone?.message,
            }),
            e.jsx(w, {
              label: "Source",
              options: b,
              value: I ?? "",
              onChange: (l) => j("source", l === "" ? void 0 : l),
              error: t.source?.message,
            }),
          ],
        }),
        e.jsxs("div", {
          className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
          children: [
            e.jsx(w, {
              label: "Statut",
              options: k,
              value: D,
              onChange: (l) => j("status", l),
              error: t.status?.message,
            }),
            e.jsx(w, {
              label: "Client",
              options: C,
              value: P ?? "",
              onChange: (l) => j("client_id", l || null),
              error: t.client_id?.message,
            }),
          ],
        }),
        e.jsx("div", {
          className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
          children: e.jsx(w, {
            label: "Assigné à",
            options: L,
            value: B ?? "",
            onChange: (l) => j("assigned_to", l || null),
            error: t.assigned_to?.message,
          }),
        }),
        e.jsxs("div", {
          className: "grid grid-cols-2 gap-4 sm:grid-cols-4",
          children: [
            e.jsx(_, {
              label: "CA Contracté",
              type: "number",
              step: "0.01",
              ...g("ca_contracté"),
              error: t.ca_contracté?.message,
            }),
            e.jsx(_, {
              label: "CA Collecté",
              type: "number",
              step: "0.01",
              ...g("ca_collecté"),
              error: t.ca_collecté?.message,
            }),
            e.jsx(_, {
              label: "Com. Setter",
              type: "number",
              step: "0.01",
              ...g("commission_setter"),
              error: t.commission_setter?.message,
            }),
            e.jsx(_, {
              label: "Com. Closer",
              type: "number",
              step: "0.01",
              ...g("commission_closer"),
              error: t.commission_closer?.message,
            }),
          ],
        }),
        e.jsx(xs, { label: "Notes", ...g("notes"), error: t.notes?.message }),
        e.jsxs("div", {
          className: "flex justify-end gap-3 pt-2",
          children: [
            e.jsx(A, {
              type: "button",
              variant: "secondary",
              onClick: d,
              children: "Annuler",
            }),
            e.jsx(A, {
              type: "submit",
              loading: f,
              children: x ? "Mettre a jour" : "Creer",
            }),
          ],
        }),
      ],
    }),
  });
}
const Ls = [
  { key: "name", label: "Nom", required: !0 },
  { key: "email", label: "Email" },
  { key: "phone", label: "Téléphone" },
  { key: "source", label: "Source" },
  { key: "status", label: "Statut" },
  { key: "ca_contracté", label: "CA Contracté" },
  { key: "notes", label: "Notes" },
];
function ot() {
  js("Pipeline");
  const [a, d] = r.useState(""),
    [o, x] = r.useState(""),
    [c, m] = r.useState(""),
    [u, h] = r.useState(""),
    [g, i] = r.useState(1),
    [v, j] = r.useState(!1),
    [s, t] = r.useState(null),
    [f, p] = r.useState("table"),
    [b, k] = r.useState(!1),
    [C, L] = r.useState([]),
    I = Ce(),
    D = ye(),
    P = Ne(),
    B = {
      search: a || void 0,
      status: o || void 0,
      source: c || void 0,
      client_id: u || void 0,
      page: g,
    },
    { data: l, isLoading: R } = Se(B),
    { data: te = [] } = we(),
    { data: ae } = Z(),
    F = z(),
    oe = Math.ceil((l?.count ?? 0) / Qe),
    re = r.useCallback((n) => {
      (t(n), j(!0));
    }, []),
    ne = r.useCallback(() => {
      (j(!1), t(null));
    }, []),
    le = r.useCallback(
      (n, K) => {
        F.mutate({ id: n, status: K });
      },
      [F],
    ),
    ie = r.useCallback(
      async (n) => {
        const K = [
            "instagram",
            "linkedin",
            "tiktok",
            "referral",
            "ads",
            "autre",
          ],
          fe = [
            "premier_message",
            "en_discussion",
            "qualifie",
            "loom_envoye",
            "call_planifie",
            "close",
            "perdu",
          ],
          he = n
            .filter((N) => N.name?.trim())
            .map((N) => ({
              name: N.name.trim(),
              email: N.email?.trim() || null,
              phone: N.phone?.trim() || null,
              source: K.includes(N.source?.toLowerCase())
                ? N.source.toLowerCase()
                : null,
              status: fe.includes(N.status?.toLowerCase())
                ? N.status.toLowerCase()
                : "premier_message",
              ca_contracté: Number(N.ca_contracté) || 0,
              ca_collecté: 0,
              commission_setter: 0,
              commission_closer: 0,
              notes: N.notes?.trim() || null,
            }));
        return I.mutateAsync(he);
      },
      [I],
    ),
    ce = r.useCallback((n) => {
      L(n);
    }, []),
    de = r.useCallback(async () => {
      C.length !== 0 &&
        confirm(`Supprimer ${C.length} lead${C.length > 1 ? "s" : ""} ?`) &&
        (await D.mutateAsync(C), L([]));
    }, [C, D]),
    me = r.useCallback(
      async (n) => {
        C.length !== 0 &&
          (await P.mutateAsync({ ids: C, data: { status: n } }), L([]));
      },
      [C, P],
    ),
    ue = r.useCallback(() => {
      l?.data &&
        bs(
          l.data.map((n) => ({
            ...n,
            client_name: n.client?.name ?? "",
            assigned_name: n.assigned_profile?.full_name ?? "",
          })),
          [
            { key: "name", label: "Nom" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Téléphone" },
            { key: "source", label: "Source" },
            { key: "status", label: "Statut" },
            { key: "client_name", label: "Client" },
            { key: "assigned_name", label: "Assigné à" },
            { key: "ca_contracté", label: "CA Contracté" },
            { key: "ca_collecté", label: "CA Collecté" },
            { key: "commission_setter", label: "Commission Setter" },
            { key: "commission_closer", label: "Commission Closer" },
          ],
          "leads-export",
        );
    }, [l]),
    pe = [
      { value: "", label: "Tous les statuts" },
      ...E.map((n) => ({ value: n, label: T[n] })),
    ],
    xe = [
      { value: "", label: "Toutes les sources" },
      ...ee.map((n) => ({ value: n, label: U[n] })),
    ],
    ge = [
      { value: "", label: "Tous les clients" },
      ...(ae?.data ?? []).map((n) => ({ value: n.id, label: n.name })),
    ];
  return e.jsxs("div", {
    className: "space-y-6",
    children: [
      e.jsxs("div", {
        className:
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("h1", {
                className: "text-xl sm:text-2xl font-bold text-foreground",
                children: "Pipeline de Prospection",
              }),
              e.jsx("p", {
                className: "mt-1 text-sm text-muted-foreground",
                children: "Gérez et suivez votre pipeline de prospection",
              }),
            ],
          }),
          e.jsxs("div", {
            className: "flex flex-shrink-0 items-center gap-2",
            children: [
              e.jsxs("div", {
                className:
                  "inline-flex items-center rounded-xl border border-border bg-white p-0.5",
                children: [
                  e.jsxs("button", {
                    onClick: () => p("table"),
                    className: y(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                      f === "table"
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    ),
                    children: [
                      e.jsx(Oe, { className: "h-3.5 w-3.5" }),
                      "Tableau",
                    ],
                  }),
                  e.jsxs("button", {
                    onClick: () => p("kanban"),
                    className: y(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                      f === "kanban"
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    ),
                    children: [
                      e.jsx(Ve, { className: "h-3.5 w-3.5" }),
                      "Pipeline",
                    ],
                  }),
                ],
              }),
              e.jsx(A, {
                variant: "secondary",
                size: "sm",
                icon: e.jsx(Ue, { className: "h-4 w-4" }),
                onClick: () => k(!0),
                children: "Importer",
              }),
              e.jsx(A, {
                variant: "secondary",
                size: "sm",
                icon: e.jsx(Be, { className: "h-4 w-4" }),
                onClick: ue,
                disabled: !l?.data?.length,
                children: "Exporter",
              }),
              e.jsx(A, {
                size: "sm",
                icon: e.jsx(Ke, { className: "h-4 w-4" }),
                onClick: () => j(!0),
                children: "Nouveau lead",
              }),
            ],
          }),
        ],
      }),
      e.jsx(vs, {}),
      f === "kanban"
        ? e.jsx(_s, { leads: te, onStatusChange: le })
        : e.jsxs(e.Fragment, {
            children: [
              e.jsxs("div", {
                className:
                  "flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3",
                children: [
                  e.jsx(fs, {
                    value: a,
                    onChange: (n) => {
                      (d(n), i(1));
                    },
                    placeholder: "Rechercher un lead...",
                    wrapperClassName: "w-full sm:w-64",
                  }),
                  e.jsx(w, {
                    options: pe,
                    value: o,
                    onChange: (n) => {
                      (x(n), i(1));
                    },
                    placeholder: "Statut",
                    className: "w-full sm:w-40",
                  }),
                  e.jsx(w, {
                    options: xe,
                    value: c,
                    onChange: (n) => {
                      (m(n), i(1));
                    },
                    placeholder: "Source",
                    className: "w-full sm:w-40",
                  }),
                  e.jsx(w, {
                    options: ge,
                    value: u,
                    onChange: (n) => {
                      (h(n), i(1));
                    },
                    placeholder: "Client",
                    className: "w-full sm:w-48",
                  }),
                ],
              }),
              e.jsx(ze, {
                children:
                  C.length > 0 &&
                  e.jsxs(Fe.div, {
                    initial: { opacity: 0, y: -10 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: -10 },
                    className:
                      "flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2",
                    children: [
                      e.jsxs("span", {
                        className: "text-sm font-medium text-primary",
                        children: [
                          C.length,
                          " sélectionné",
                          C.length > 1 ? "s" : "",
                        ],
                      }),
                      e.jsxs("div", {
                        className: "flex items-center gap-2",
                        children: [
                          e.jsx(w, {
                            options: [
                              { value: "", label: "Changer le statut..." },
                              ...E.map((n) => ({ value: n, label: T[n] })),
                            ],
                            value: "",
                            onChange: (n) => {
                              n && me(n);
                            },
                            className: "w-44",
                          }),
                          e.jsx(A, {
                            variant: "destructive",
                            size: "sm",
                            icon: e.jsx(Y, { className: "h-4 w-4" }),
                            onClick: de,
                            disabled: D.isPending,
                            children: "Supprimer",
                          }),
                        ],
                      }),
                      e.jsx("button", {
                        onClick: () => L([]),
                        className:
                          "ml-auto text-sm text-muted-foreground hover:text-foreground",
                        children: "Annuler",
                      }),
                    ],
                  }),
              }),
              e.jsx(Ns, {
                data: l?.data ?? [],
                isLoading: R,
                onEdit: re,
                onSelectionChange: ce,
              }),
              e.jsx(hs, {
                currentPage: g,
                totalPages: oe,
                onPageChange: i,
                totalItems: l?.count,
              }),
            ],
          }),
      e.jsx(ks, { open: v, onClose: ne, lead: s }),
      e.jsx(gs, {
        open: b,
        onClose: () => k(!1),
        title: "Importer des leads",
        description: "Importez vos leads depuis un fichier CSV",
        columns: Ls,
        onImport: ie,
        templateFilename: "template-leads",
      }),
    ],
  });
}
export { ot as default };
