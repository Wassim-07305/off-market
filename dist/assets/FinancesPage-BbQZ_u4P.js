import { j as e, u as oe } from "./vendor-query-sBpsl8Kt.js";
import { r as o } from "./vendor-react-Cci7g3Cb.js";
import {
  a as ie,
  c as G,
  d as ce,
  e as Y,
  f as de,
  u as $,
  b as ue,
} from "./useFinances-lbLdW7J9.js";
import { u as R } from "./useClients-oFN0czBK.js";
import { C as V, d as me } from "./card-Dkj99_H3.js";
import {
  S as M,
  b as h,
  e as xe,
  c as pe,
  h as F,
  f as he,
  s as ge,
} from "./index-DY9GA2La.js";
import {
  ah as q,
  D as X,
  aw as fe,
  ax as je,
  U as be,
  ay as ye,
  C as ve,
  t as Ne,
  ar as Ce,
  z as U,
} from "./vendor-ui-DDdrexJZ.js";
import { D as H } from "./data-table-BDFYi4Le.js";
import { B as Q } from "./badge-CFrXqKTx.js";
import { C as T } from "./checkbox-yH1R51Jo.js";
import { E as W } from "./empty-state-BFSeK4Tv.js";
import {
  F as L,
  j as J,
  k as _e,
  l as we,
  I as Se,
} from "./constants-IBlSVYu1.js";
import { u as Z, C as N } from "./vendor-forms-Ct2mZ2NL.js";
import { a as I } from "./zod-COY_rf8d.js";
import { f as Pe, p as Ee } from "./forms-zLivl21i.js";
import { M as ee } from "./modal-DBBZDXoW.js";
import { I as S } from "./input-B9vrc6Q3.js";
import { S as v } from "./select-E7QvXrZc.js";
import { B as C } from "./button-DlbP8VPc.js";
import { r as Me, f as ke } from "./vendor-utils-DoLlG-6J.js";
import {
  R as Te,
  A as Ae,
  C as De,
  X as Fe,
  Y as Re,
  T as Le,
  d as Oe,
} from "./vendor-charts-KMfjFgec.js";
import { T as Ke, a as D } from "./tabs-oT6f7FFv.js";
import { P as ze } from "./pagination-DHo4QjB2.js";
import { e as Be } from "./csv-DLhVFTuh.js";
import { u as Ve } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-supabase-BZ0N5lZN.js";
import "./index-Ddu5uNF-.js";
function Ue({ clientId: r }) {
  const { data: t, isLoading: a } = ie(r);
  if (a)
    return e.jsx("div", {
      className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6",
      children: Array.from({ length: 6 }).map((n, c) =>
        e.jsx(
          V,
          {
            children: e.jsxs(me, {
              className: "p-6",
              children: [
                e.jsx(M, { className: "mb-3 h-12 w-12 rounded-2xl" }),
                e.jsx(M, { className: "h-4 w-24" }),
                e.jsx(M, { className: "mt-2 h-8 w-32" }),
              ],
            }),
          },
          c,
        ),
      ),
    });
  if (!t) return null;
  const s = [
    {
      label: "CA total",
      value: h(t.ca),
      icon: e.jsx(q, { className: "h-5 w-5" }),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "MRR",
      value: h(t.récurrent),
      icon: e.jsx(X, { className: "h-5 w-5" }),
      color: "text-red-600",
      bgColor: "bg-red-500/10",
    },
    {
      label: "Récurrent total",
      value: h(t.récurrent),
      icon: e.jsx(fe, { className: "h-5 w-5" }),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Charges totales",
      value: h(t.charges),
      icon: e.jsx(je, { className: "h-5 w-5" }),
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Prestataires total",
      value: h(t.prestataires),
      icon: e.jsx(be, { className: "h-5 w-5" }),
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Marge %",
      value: xe(t.marge),
      icon: e.jsx(ye, { className: "h-5 w-5" }),
      color:
        t.marge > 0
          ? "text-success"
          : t.marge < 0
            ? "text-destructive"
            : "text-muted-foreground",
      bgColor:
        t.marge > 0
          ? "bg-success/10"
          : t.marge < 0
            ? "bg-destructive/10"
            : "bg-muted",
    },
  ];
  return e.jsx("div", {
    className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6",
    children: s.map((n) =>
      e.jsx(
        V,
        {
          children: e.jsxs("div", {
            className: "p-6",
            children: [
              e.jsx("div", {
                className: pe(
                  "flex h-12 w-12 items-center justify-center rounded-2xl",
                  n.bgColor,
                  n.color,
                ),
                children: n.icon,
              }),
              e.jsxs("div", {
                className: "mt-4",
                children: [
                  e.jsx("p", {
                    className:
                      "text-xs font-medium uppercase tracking-wider text-muted-foreground",
                    children: n.label,
                  }),
                  e.jsx("p", {
                    className:
                      "mt-1 text-2xl font-bold tracking-tight text-foreground",
                    children: n.value,
                  }),
                ],
              }),
            ],
          }),
        },
        n.label,
      ),
    ),
  });
}
const Ge = {
  ca: "success",
  récurrent: "default",
  charge: "warning",
  prestataire: "destructive",
};
function Ye({ entry: r }) {
  const t = G(),
    a = o.useCallback(() => {
      t.mutate({ id: r.id, is_paid: !r.is_paid });
    }, [r.id, r.is_paid, t]);
  return e.jsx(T, { checked: r.is_paid, onChange: a });
}
function $e({ data: r, isLoading: t }) {
  const a = o.useMemo(
    () => [
      {
        accessorKey: "label",
        header: "Libellé",
        cell: ({ row: s }) =>
          e.jsx("span", {
            className: "font-medium text-foreground",
            children: s.original.label,
          }),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row: s }) => {
          const n = s.original.type;
          return e.jsx(Q, {
            variant: Ge[n] ?? "secondary",
            children: L[n] ?? n,
          });
        },
      },
      {
        accessorKey: "amount",
        header: "Montant",
        cell: ({ row: s }) =>
          e.jsx("span", {
            className: "font-mono font-medium text-foreground",
            children: h(Number(s.original.amount)),
          }),
      },
      {
        accessorKey: "client.name",
        header: "Client",
        cell: ({ row: s }) =>
          e.jsx("span", {
            className: "text-muted-foreground",
            children: s.original.client?.name ?? "-",
          }),
      },
      {
        accessorKey: "prestataire",
        header: "Prestataire",
        cell: ({ row: s }) =>
          e.jsx("span", {
            className: "text-muted-foreground",
            children: s.original.prestataire || "-",
          }),
      },
      {
        accessorKey: "is_paid",
        header: "Payé",
        enableSorting: !1,
        cell: ({ row: s }) => e.jsx(Ye, { entry: s.original }),
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row: s }) =>
          e.jsx("span", {
            className: "whitespace-nowrap text-xs text-muted-foreground",
            children: F(s.original.date),
          }),
      },
    ],
    [],
  );
  return t
    ? e.jsx("div", {
        className: "space-y-3",
        children: Array.from({ length: 5 }).map((s, n) =>
          e.jsx(M, { className: "h-12 w-full" }, n),
        ),
      })
    : r.length === 0
      ? e.jsx(W, {
          title: "Aucune entrée financière",
          description: "Ajoutez votre première entrée financière.",
        })
      : e.jsx(H, { columns: a, data: r, pagination: !1 });
}
function qe({ open: r, onClose: t, editItem: a }) {
  const s = ce(),
    n = G(),
    { data: c } = R(),
    m = c?.data ?? [],
    {
      register: p,
      handleSubmit: g,
      control: f,
      reset: j,
      watch: x,
      formState: { errors: d },
    } = Z({
      resolver: I(Pe),
      defaultValues: {
        client_id: "",
        type: "ca",
        label: "",
        amount: 0,
        prestataire: "",
        is_paid: !1,
        date: new Date().toISOString().split("T")[0],
        recurrence: null,
      },
    }),
    b = x("type");
  o.useEffect(() => {
    j(
      a
        ? {
            client_id: a.client_id ?? "",
            type: a.type,
            label: a.label,
            amount: Number(a.amount),
            prestataire: a.prestataire ?? "",
            is_paid: a.is_paid,
            date: a.date,
            recurrence: a.recurrence ?? null,
          }
        : {
            client_id: "",
            type: "ca",
            label: "",
            amount: 0,
            prestataire: "",
            is_paid: !1,
            date: new Date().toISOString().split("T")[0],
            recurrence: null,
          },
    );
  }, [a, j, r]);
  const P = [
      { value: "", label: "Aucune récurrence" },
      ..._e.map((l) => ({ value: l, label: we[l] })),
    ],
    _ = (l) => {
      const y = {
        ...l,
        prestataire: l.prestataire || void 0,
        recurrence: l.recurrence || null,
      };
      a
        ? n.mutate({ id: a.id, ...y }, { onSuccess: () => t() })
        : s.mutate(y, { onSuccess: () => t() });
    },
    E = s.isPending || n.isPending,
    w = m.map((l) => ({ value: l.id, label: l.name })),
    i = J.map((l) => ({ value: l, label: L[l] }));
  return e.jsx(ee, {
    open: r,
    onClose: t,
    title: a ? "Modifier l'entrée" : "Nouvelle entrée financière",
    size: "md",
    children: e.jsxs("form", {
      onSubmit: g(_),
      className: "flex flex-col gap-4",
      children: [
        e.jsx(N, {
          name: "client_id",
          control: f,
          render: ({ field: l }) =>
            e.jsx(v, {
              label: "Client",
              options: w,
              value: l.value,
              onChange: l.onChange,
              error: d.client_id?.message,
              placeholder: "Sélectionner un client...",
            }),
        }),
        e.jsx(N, {
          name: "type",
          control: f,
          render: ({ field: l }) =>
            e.jsx(v, {
              label: "Type",
              options: i,
              value: l.value,
              onChange: l.onChange,
              error: d.type?.message,
            }),
        }),
        e.jsx(S, { label: "Libellé", ...p("label"), error: d.label?.message }),
        e.jsx(S, {
          label: "Montant",
          type: "number",
          step: "0.01",
          min: "0",
          ...p("amount"),
          error: d.amount?.message,
        }),
        b === "prestataire" &&
          e.jsx(S, {
            label: "Prestataire",
            ...p("prestataire"),
            error: d.prestataire?.message,
            placeholder: "Nom du prestataire...",
          }),
        b === "récurrent" &&
          e.jsx(N, {
            name: "recurrence",
            control: f,
            render: ({ field: l }) =>
              e.jsx(v, {
                label: "Récurrence",
                options: P,
                value: l.value ?? "",
                onChange: (y) => l.onChange(y || null),
                error: d.recurrence?.message,
              }),
          }),
        e.jsx(S, {
          label: "Date",
          type: "date",
          ...p("date"),
          error: d.date?.message,
        }),
        e.jsx(N, {
          name: "is_paid",
          control: f,
          render: ({ field: l }) =>
            e.jsx(T, {
              label: "Payé",
              checked: l.value,
              onChange: (y) => l.onChange(y.target.checked),
            }),
        }),
        e.jsxs("div", {
          className: "flex justify-end gap-3 pt-2",
          children: [
            e.jsx(C, {
              type: "button",
              variant: "secondary",
              onClick: t,
              children: "Annuler",
            }),
            e.jsx(C, {
              type: "submit",
              loading: E,
              children: a ? "Mettre à jour" : "Créer",
            }),
          ],
        }),
      ],
    }),
  });
}
function Xe(r) {
  if (r.is_paid) return { label: "Payé", variant: "success" };
  const t = new Date(r.due_date),
    a = new Date();
  if ((a.setHours(0, 0, 0, 0), t < a))
    return { label: "En retard", variant: "destructive" };
  const s = new Date(a);
  return (
    s.setDate(s.getDate() + 7),
    t <= s
      ? { label: "Bientôt", variant: "warning" }
      : { label: "À venir", variant: "warning" }
  );
}
function He({ item: r }) {
  const t = Y(),
    a = o.useCallback(() => {
      const s = { id: r.id, is_paid: !r.is_paid };
      (r.is_paid ? (s.paid_at = null) : (s.paid_at = new Date().toISOString()),
        t.mutate(s));
    }, [r.id, r.is_paid, t]);
  return e.jsx(T, { checked: r.is_paid, onChange: a });
}
function Qe({ data: r, isLoading: t }) {
  const a = o.useMemo(
    () => [
      {
        accessorKey: "client.name",
        header: "Client",
        cell: ({ row: s }) =>
          e.jsx("span", {
            className: "text-foreground",
            children: s.original.client?.name ?? "-",
          }),
      },
      {
        accessorKey: "amount",
        header: "Montant",
        cell: ({ row: s }) =>
          e.jsx("span", {
            className: "font-mono font-medium text-foreground",
            children: h(Number(s.original.amount)),
          }),
      },
      {
        accessorKey: "due_date",
        header: "Date d'échéance",
        cell: ({ row: s }) =>
          e.jsx("span", {
            className: "whitespace-nowrap text-xs text-muted-foreground",
            children: F(s.original.due_date),
          }),
      },
      {
        id: "status",
        header: "Statut",
        cell: ({ row: s }) => {
          const n = Xe(s.original);
          return e.jsx(Q, { variant: n.variant, children: n.label });
        },
      },
      {
        accessorKey: "is_paid",
        header: "Payé",
        enableSorting: !1,
        cell: ({ row: s }) => e.jsx(He, { item: s.original }),
      },
      {
        accessorKey: "paid_at",
        header: "Date de paiement",
        cell: ({ row: s }) =>
          e.jsx("span", {
            className: "whitespace-nowrap text-xs text-muted-foreground",
            children: s.original.paid_at ? F(s.original.paid_at) : "-",
          }),
      },
    ],
    [],
  );
  return t
    ? e.jsx("div", {
        className: "space-y-3",
        children: Array.from({ length: 5 }).map((s, n) =>
          e.jsx(M, { className: "h-12 w-full" }, n),
        ),
      })
    : r.length === 0
      ? e.jsx(W, {
          title: "Aucun échéancier",
          description: "Ajoutez votre premier échéancier de paiement.",
        })
      : e.jsx(H, { columns: a, data: r, pagination: !1 });
}
function We({ open: r, onClose: t, editItem: a }) {
  const s = de(),
    n = Y(),
    { data: c } = R(),
    { data: m } = $(),
    p = c?.data ?? [],
    g = m?.data ?? [],
    {
      register: f,
      handleSubmit: j,
      control: x,
      reset: d,
      formState: { errors: b },
    } = Z({
      resolver: I(Ee),
      defaultValues: {
        client_id: "",
        financial_entry_id: null,
        amount: 0,
        due_date: "",
        is_paid: !1,
      },
    });
  o.useEffect(() => {
    d(
      a
        ? {
            client_id: a.client_id ?? "",
            financial_entry_id: a.financial_entry_id ?? null,
            amount: Number(a.amount),
            due_date: a.due_date,
            is_paid: a.is_paid,
          }
        : {
            client_id: "",
            financial_entry_id: null,
            amount: 0,
            due_date: "",
            is_paid: !1,
          },
    );
  }, [a, d, r]);
  const P = (i) => {
      a
        ? n.mutate({ id: a.id, ...i }, { onSuccess: () => t() })
        : s.mutate(i, { onSuccess: () => t() });
    },
    _ = s.isPending || n.isPending,
    E = p.map((i) => ({ value: i.id, label: i.name })),
    w = [
      { value: "", label: "Aucune" },
      ...g.map((i) => ({ value: i.id, label: `${i.label} (${i.type})` })),
    ];
  return e.jsx(ee, {
    open: r,
    onClose: t,
    title: a ? "Modifier l'échéancier" : "Nouvel échéancier",
    size: "md",
    children: e.jsxs("form", {
      onSubmit: j(P),
      className: "flex flex-col gap-4",
      children: [
        e.jsx(N, {
          name: "client_id",
          control: x,
          render: ({ field: i }) =>
            e.jsx(v, {
              label: "Client",
              options: E,
              value: i.value,
              onChange: i.onChange,
              error: b.client_id?.message,
              placeholder: "Sélectionner un client...",
            }),
        }),
        e.jsx(N, {
          name: "financial_entry_id",
          control: x,
          render: ({ field: i }) =>
            e.jsx(v, {
              label: "Entrée financière (optionnel)",
              options: w,
              value: i.value ?? "",
              onChange: (l) => i.onChange(l || null),
              placeholder: "Aucune",
            }),
        }),
        e.jsx(S, {
          label: "Montant",
          type: "number",
          step: "0.01",
          min: "0",
          ...f("amount"),
          error: b.amount?.message,
        }),
        e.jsx(S, {
          label: "Date d'échéance",
          type: "date",
          ...f("due_date"),
          error: b.due_date?.message,
        }),
        e.jsx(N, {
          name: "is_paid",
          control: x,
          render: ({ field: i }) =>
            e.jsx(T, {
              label: "Payé",
              checked: i.value,
              onChange: (l) => i.onChange(l.target.checked),
            }),
        }),
        e.jsxs("div", {
          className: "flex justify-end gap-3 pt-2",
          children: [
            e.jsx(C, {
              type: "button",
              variant: "secondary",
              onClick: t,
              children: "Annuler",
            }),
            e.jsx(C, {
              type: "submit",
              loading: _,
              children: a ? "Mettre à jour" : "Créer",
            }),
          ],
        }),
      ],
    }),
  });
}
function Je() {
  const { data: r = [] } = oe({
      queryKey: ["finance-recurring"],
      queryFn: async () => {
        const { data: n, error: c } = await ge
          .from("financial_entries")
          .select("*")
          .eq("type", "récurrent")
          .order("date", { ascending: !1 });
        if (c) throw c;
        return n;
      },
    }),
    t = o.useMemo(() => r.reduce((n, c) => n + Number(c.amount), 0), [r]),
    a = o.useMemo(() => {
      const n = new Date(),
        c = [];
      for (let m = 0; m < 12; m++) {
        const p = Me(n, m),
          g = ke(p, "MMM yy", { locale: he });
        c.push({ month: g, projected: t * (m + 1), monthly: t });
      }
      return c;
    }, [t]),
    s = t * 12;
  return e.jsxs("div", {
    className: "space-y-6",
    children: [
      e.jsxs("div", {
        className: "grid grid-cols-1 gap-4 sm:grid-cols-3",
        children: [
          e.jsx("div", {
            className: "rounded-2xl border border-border/40 bg-white p-5",
            children: e.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                e.jsx("div", {
                  className:
                    "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5",
                  children: e.jsx(X, { className: "h-5 w-5 text-red-600" }),
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("p", {
                      className: "text-sm text-muted-foreground",
                      children: "MRR",
                    }),
                    e.jsx("p", {
                      className: "text-xl font-bold text-foreground",
                      children: h(t),
                    }),
                  ],
                }),
              ],
            }),
          }),
          e.jsx("div", {
            className: "rounded-2xl border border-border/40 bg-white p-5",
            children: e.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                e.jsx("div", {
                  className:
                    "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5",
                  children: e.jsx(q, { className: "h-5 w-5 text-emerald-600" }),
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("p", {
                      className: "text-sm text-muted-foreground",
                      children: "ARR projeté",
                    }),
                    e.jsx("p", {
                      className: "text-xl font-bold text-foreground",
                      children: h(s),
                    }),
                  ],
                }),
              ],
            }),
          }),
          e.jsx("div", {
            className: "rounded-2xl border border-border/40 bg-white p-5",
            children: e.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                e.jsx("div", {
                  className:
                    "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5",
                  children: e.jsx(ve, { className: "h-5 w-5 text-blue-600" }),
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("p", {
                      className: "text-sm text-muted-foreground",
                      children: "Entrées récurrentes",
                    }),
                    e.jsx("p", {
                      className: "text-xl font-bold text-foreground",
                      children: r.length,
                    }),
                  ],
                }),
              ],
            }),
          }),
        ],
      }),
      e.jsxs("div", {
        className: "rounded-2xl border border-border/40 bg-white p-5",
        children: [
          e.jsx("h3", {
            className: "text-sm font-semibold text-foreground mb-1",
            children: "Projection de revenus récurrents",
          }),
          e.jsx("p", {
            className: "text-xs text-muted-foreground mb-4",
            children: "Revenus cumulés projetés sur 12 mois",
          }),
          t > 0
            ? e.jsx("div", {
                className: "h-72",
                children: e.jsx(Te, {
                  width: "100%",
                  height: "100%",
                  children: e.jsxs(Ae, {
                    data: a,
                    children: [
                      e.jsx("defs", {
                        children: e.jsxs("linearGradient", {
                          id: "projGrad",
                          x1: "0",
                          y1: "0",
                          x2: "0",
                          y2: "1",
                          children: [
                            e.jsx("stop", {
                              offset: "5%",
                              stopColor: "hsl(252 85% 60%)",
                              stopOpacity: 0.15,
                            }),
                            e.jsx("stop", {
                              offset: "95%",
                              stopColor: "hsl(252 85% 60%)",
                              stopOpacity: 0,
                            }),
                          ],
                        }),
                      }),
                      e.jsx(De, {
                        strokeDasharray: "3 3",
                        stroke: "hsl(220 13% 91%)",
                      }),
                      e.jsx(Fe, {
                        dataKey: "month",
                        tick: { fontSize: 11 },
                        stroke: "hsl(220 9% 46%)",
                      }),
                      e.jsx(Re, {
                        tick: { fontSize: 11 },
                        stroke: "hsl(220 9% 46%)",
                        tickFormatter: (n) => `${(n / 1e3).toFixed(0)}k`,
                      }),
                      e.jsx(Le, {
                        formatter: (n) => [h(n), "Cumulé"],
                        contentStyle: {
                          borderRadius: 12,
                          border: "1px solid hsl(220 13% 91%)",
                          fontSize: 12,
                        },
                      }),
                      e.jsx(Oe, {
                        type: "monotone",
                        dataKey: "projected",
                        stroke: "hsl(252 85% 60%)",
                        strokeWidth: 2,
                        fill: "url(#projGrad)",
                        strokeDasharray: "6 3",
                      }),
                    ],
                  }),
                }),
              })
            : e.jsx("div", {
                className:
                  "flex h-48 items-center justify-center text-sm text-muted-foreground",
                children:
                  "Ajoutez des entrées récurrentes pour voir les projections",
              }),
        ],
      }),
    ],
  });
}
const Ze = [
  { value: "entries", label: "Entrées" },
  { value: "schedules", label: "Échéanciers" },
  { value: "projections", label: "Projections" },
];
function Sa() {
  Ve("Finances");
  const [r, t] = o.useState("entries"),
    [a, s] = o.useState(""),
    [n, c] = o.useState(""),
    [m, p] = o.useState(""),
    [g, f] = o.useState(""),
    [j, x] = o.useState(1),
    [d, b] = o.useState(!1),
    [P, _] = o.useState(null),
    [E, w] = o.useState(!1),
    [i, l] = o.useState(null),
    { data: y } = R(),
    O = o.useMemo(() => y?.data ?? [], [y?.data]),
    ae = o.useMemo(
      () => ({
        client_id: a || void 0,
        type: n || void 0,
        date_from: m || void 0,
        date_to: g || void 0,
        page: j,
      }),
      [a, n, m, g, j],
    ),
    { data: A, isLoading: se } = $(ae),
    { data: te, isLoading: re } = ue(a || void 0),
    k = o.useMemo(() => A?.data ?? [], [A?.data]),
    K = A?.count ?? 0,
    z = Math.ceil(K / Se),
    B = o.useMemo(
      () => [
        { value: "", label: "Tous les clients" },
        ...O.map((u) => ({ value: u.id, label: u.name })),
      ],
      [O],
    ),
    ne = o.useMemo(
      () => [
        { value: "", label: "Tous les types" },
        ...J.map((u) => ({ value: u, label: L[u] })),
      ],
      [],
    ),
    le = o.useCallback(() => {
      if (k.length === 0) {
        Ne.error("Aucune donnée à exporter");
        return;
      }
      Be(
        k,
        [
          { key: "label", label: "Libellé" },
          { key: "type", label: "Type" },
          { key: "amount", label: "Montant" },
          { key: "prestataire", label: "Prestataire" },
          { key: "is_paid", label: "Payé" },
          { key: "date", label: "Date" },
        ],
        "finances",
      );
    }, [k]);
  return e.jsxs("div", {
    className: "space-y-8",
    children: [
      e.jsx("div", {
        className:
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
        children: e.jsxs("div", {
          children: [
            e.jsx("h1", {
              className: "text-xl sm:text-2xl font-bold text-foreground",
              children: "Finances",
            }),
            e.jsx("p", {
              className: "mt-1 text-sm text-muted-foreground",
              children: "Suivi financier, entrées et échéanciers de paiement.",
            }),
          ],
        }),
      }),
      e.jsx(Ue, { clientId: a || void 0 }),
      e.jsx(Ke, { tabs: Ze, value: r, onChange: t }),
      e.jsx(D, {
        value: "entries",
        activeValue: r,
        children: e.jsxs("div", {
          className: "space-y-4",
          children: [
            e.jsxs("div", {
              className:
                "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
              children: [
                e.jsxs("div", {
                  className: "flex flex-wrap items-center gap-3",
                  children: [
                    e.jsx(v, {
                      options: B,
                      value: a,
                      onChange: (u) => {
                        (s(u), x(1));
                      },
                      placeholder: "Tous les clients",
                      className: "w-full sm:w-48",
                    }),
                    e.jsx(v, {
                      options: ne,
                      value: n,
                      onChange: (u) => {
                        (c(u), x(1));
                      },
                      placeholder: "Tous les types",
                      className: "w-full sm:w-44",
                    }),
                    e.jsxs("div", {
                      className:
                        "flex flex-col sm:flex-row sm:items-center gap-2",
                      children: [
                        e.jsx("input", {
                          type: "date",
                          value: m,
                          onChange: (u) => {
                            (p(u.target.value), x(1));
                          },
                          className:
                            "w-full sm:w-auto h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                          placeholder: "Du",
                        }),
                        e.jsx("span", {
                          className: "text-sm text-muted-foreground",
                          children: "au",
                        }),
                        e.jsx("input", {
                          type: "date",
                          value: g,
                          onChange: (u) => {
                            (f(u.target.value), x(1));
                          },
                          className:
                            "w-full sm:w-auto h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                          placeholder: "Au",
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    e.jsx(C, {
                      variant: "secondary",
                      size: "sm",
                      icon: e.jsx(Ce, { className: "h-4 w-4" }),
                      onClick: le,
                      children: "Exporter",
                    }),
                    e.jsx(C, {
                      size: "sm",
                      icon: e.jsx(U, { className: "h-4 w-4" }),
                      onClick: () => {
                        (_(null), b(!0));
                      },
                      children: "Nouvelle entrée",
                    }),
                  ],
                }),
              ],
            }),
            e.jsx($e, { data: k, isLoading: se }),
            z > 1 &&
              e.jsx(ze, {
                currentPage: j,
                totalPages: z,
                onPageChange: x,
                totalItems: K,
              }),
          ],
        }),
      }),
      e.jsx(D, {
        value: "schedules",
        activeValue: r,
        children: e.jsxs("div", {
          className: "space-y-4",
          children: [
            e.jsxs("div", {
              className:
                "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
              children: [
                e.jsx(v, {
                  options: B,
                  value: a,
                  onChange: s,
                  placeholder: "Tous les clients",
                  className: "w-full sm:w-48",
                }),
                e.jsx(C, {
                  size: "sm",
                  icon: e.jsx(U, { className: "h-4 w-4" }),
                  onClick: () => {
                    (l(null), w(!0));
                  },
                  children: "Nouvel échéancier",
                }),
              ],
            }),
            e.jsx(Qe, { data: te ?? [], isLoading: re }),
          ],
        }),
      }),
      e.jsx(D, {
        value: "projections",
        activeValue: r,
        children: e.jsx(Je, {}),
      }),
      e.jsx(qe, {
        open: d,
        onClose: () => {
          (b(!1), _(null));
        },
        editItem: P,
      }),
      e.jsx(We, {
        open: E,
        onClose: () => {
          (w(!1), l(null));
        },
        editItem: i,
      }),
    ],
  });
}
export { Sa as default };
