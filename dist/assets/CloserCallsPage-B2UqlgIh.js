import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { r as o } from "./vendor-react-Cci7g3Cb.js";
import {
  a as R,
  b as z,
  c as B,
  u as U,
  C as G,
} from "./CloserCallsTable-B1oI979D.js";
import { u as D } from "./useClients-oFN0czBK.js";
import { C as A } from "./card-Dkj99_H3.js";
import { S as k, e as V, b as K, c as q } from "./index-DY9GA2La.js";
import {
  E as H,
  at as J,
  ah as Q,
  D as W,
  t as X,
  ar as Y,
  z as Z,
} from "./vendor-ui-DDdrexJZ.js";
import { u as $, C as T } from "./vendor-forms-Ct2mZ2NL.js";
import { a as I } from "./zod-COY_rf8d.js";
import { d as ee } from "./forms-zLivl21i.js";
import { h as se } from "./useLeads-TuKFlYpV.js";
import { M as ae } from "./modal-DBBZDXoW.js";
import { I as p } from "./input-B9vrc6Q3.js";
import { S as v } from "./select-E7QvXrZc.js";
import { B as S } from "./button-DlbP8VPc.js";
import { m as M, n as E, I as le } from "./constants-IBlSVYu1.js";
import { P as te } from "./pagination-DHo4QjB2.js";
import { e as oe } from "./csv-DLhVFTuh.js";
import { u as re } from "./usePageTitle-I7G4QvKX.js";
import "./data-table-BDFYi4Le.js";
import "./index-Ddu5uNF-.js";
import "./badge-CFrXqKTx.js";
import "./empty-state-BFSeK4Tv.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
function ne({ clientId: c }) {
  const { data: l, isLoading: a } = R(c);
  if (a)
    return e.jsx("div", {
      className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
      children: Array.from({ length: 4 }).map((t, x) =>
        e.jsx(
          A,
          {
            children: e.jsxs("div", {
              className: "p-6",
              children: [
                e.jsx(k, { className: "mb-3 h-12 w-12 rounded-2xl" }),
                e.jsx(k, { className: "h-4 w-24" }),
                e.jsx(k, { className: "mt-2 h-8 w-32" }),
              ],
            }),
          },
          x,
        ),
      ),
    });
  if (!l) return null;
  const u = [
    {
      label: "Total appels",
      value: String(l.total),
      icon: e.jsx(H, { className: "h-5 w-5" }),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Closés",
      value: String(l.closed),
      icon: e.jsx(J, { className: "h-5 w-5" }),
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Taux de closing",
      value: V(l.tauxClosing),
      icon: e.jsx(Q, { className: "h-5 w-5" }),
      color:
        l.tauxClosing >= 50
          ? "text-success"
          : l.tauxClosing >= 25
            ? "text-warning"
            : "text-destructive",
      bgColor:
        l.tauxClosing >= 50
          ? "bg-success/10"
          : l.tauxClosing >= 25
            ? "bg-warning/10"
            : "bg-destructive/10",
    },
    {
      label: "CA Généré",
      value: K(l.caGenere),
      icon: e.jsx(W, { className: "h-5 w-5" }),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];
  return e.jsx("div", {
    className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
    children: u.map((t) =>
      e.jsx(
        A,
        {
          children: e.jsxs("div", {
            className: "p-6",
            children: [
              e.jsx("div", {
                className: q(
                  "flex h-12 w-12 items-center justify-center rounded-2xl",
                  t.bgColor,
                  t.color,
                ),
                children: t.icon,
              }),
              e.jsxs("div", {
                className: "mt-4",
                children: [
                  e.jsx("p", {
                    className:
                      "text-xs font-medium uppercase tracking-wider text-muted-foreground",
                    children: t.label,
                  }),
                  e.jsx("p", {
                    className:
                      "mt-1 text-2xl font-bold tracking-tight text-foreground",
                    children: t.value,
                  }),
                ],
              }),
            ],
          }),
        },
        t.label,
      ),
    ),
  });
}
function ie({ open: c, onClose: l, editItem: a }) {
  const u = z(),
    t = B(),
    { data: x } = D(),
    g = x?.data ?? [],
    { data: N } = se(),
    f = N?.data ?? [],
    {
      register: n,
      handleSubmit: _,
      control: m,
      reset: b,
      formState: { errors: i },
    } = $({
      resolver: I(ee),
      defaultValues: {
        client_id: "",
        lead_id: null,
        closer_id: null,
        date: new Date().toISOString().split("T")[0],
        status: "non_closé",
        revenue: 0,
        nombre_paiements: 1,
        link: "",
        debrief: "",
        notes: "",
      },
    });
  o.useEffect(() => {
    b(
      a
        ? {
            client_id: a.client_id ?? "",
            lead_id: a.lead_id ?? null,
            closer_id: a.closer_id ?? null,
            date: a.date,
            status: a.status,
            revenue: Number(a.revenue),
            nombre_paiements: a.nombre_paiements,
            link: a.link ?? "",
            debrief: a.debrief ?? "",
            notes: a.notes ?? "",
          }
        : {
            client_id: "",
            lead_id: null,
            closer_id: null,
            date: new Date().toISOString().split("T")[0],
            status: "non_closé",
            revenue: 0,
            nombre_paiements: 1,
            link: "",
            debrief: "",
            notes: "",
          },
    );
  }, [a, b, c]);
  const j = (s) => {
      const d = {
        ...s,
        lead_id: s.lead_id || null,
        closer_id: s.closer_id || null,
        link: s.link || void 0,
        debrief: s.debrief || void 0,
        notes: s.notes || void 0,
      };
      a
        ? t.mutate({ id: a.id, ...d }, { onSuccess: () => l() })
        : u.mutate(d, { onSuccess: () => l() });
    },
    C = u.isPending || t.isPending,
    w = g.map((s) => ({ value: s.id, label: s.name })),
    h = [
      { value: "", label: "Aucun lead" },
      ...f.map((s) => ({ value: s.id, label: s.name })),
    ],
    y = M.map((s) => ({ value: s, label: E[s] }));
  return e.jsx(ae, {
    open: c,
    onClose: l,
    title: a ? "Modifier l'appel closer" : "Nouvel appel closer",
    size: "md",
    children: e.jsxs("form", {
      onSubmit: _(j),
      className: "flex flex-col gap-4",
      children: [
        e.jsx(T, {
          name: "client_id",
          control: m,
          render: ({ field: s }) =>
            e.jsx(v, {
              label: "Client",
              options: w,
              value: s.value,
              onChange: s.onChange,
              error: i.client_id?.message,
              placeholder: "Sélectionner un client...",
            }),
        }),
        e.jsx(T, {
          name: "lead_id",
          control: m,
          render: ({ field: s }) =>
            e.jsx(v, {
              label: "Lead",
              options: h,
              value: s.value ?? "",
              onChange: (d) => s.onChange(d || null),
              error: i.lead_id?.message,
              placeholder: "Sélectionner un lead...",
            }),
        }),
        e.jsx(p, {
          label: "Date",
          type: "date",
          ...n("date"),
          error: i.date?.message,
        }),
        e.jsx(T, {
          name: "status",
          control: m,
          render: ({ field: s }) =>
            e.jsx(v, {
              label: "Statut",
              options: y,
              value: s.value,
              onChange: s.onChange,
              error: i.status?.message,
            }),
        }),
        e.jsx(p, {
          label: "Revenu",
          type: "number",
          step: "0.01",
          min: "0",
          ...n("revenue"),
          error: i.revenue?.message,
        }),
        e.jsx(p, {
          label: "Nombre de paiements",
          type: "number",
          step: "1",
          min: "0",
          ...n("nombre_paiements"),
          error: i.nombre_paiements?.message,
        }),
        e.jsx(p, {
          label: "Lien (replay, etc.)",
          type: "url",
          ...n("link"),
          error: i.link?.message,
          placeholder: "https://...",
        }),
        e.jsx(p, {
          label: "Debrief",
          ...n("debrief"),
          error: i.debrief?.message,
          placeholder: "Points clés du debrief...",
        }),
        e.jsx(p, {
          label: "Notes",
          ...n("notes"),
          error: i.notes?.message,
          placeholder: "Notes additionnelles...",
        }),
        e.jsxs("div", {
          className: "flex justify-end gap-3 pt-2",
          children: [
            e.jsx(S, {
              type: "button",
              variant: "secondary",
              onClick: l,
              children: "Annuler",
            }),
            e.jsx(S, {
              type: "submit",
              loading: C,
              children: a ? "Mettre à jour" : "Créer",
            }),
          ],
        }),
      ],
    }),
  });
}
function Le() {
  re("CA & Appels");
  const [c, l] = o.useState(""),
    [a, u] = o.useState(""),
    [t, x] = o.useState(""),
    [g, N] = o.useState(""),
    [f, n] = o.useState(1),
    [_, m] = o.useState(!1),
    [b, i] = o.useState(null),
    { data: j } = D(),
    C = o.useMemo(() => j?.data ?? [], [j?.data]),
    w = o.useMemo(
      () => ({
        client_id: c || void 0,
        status: a || void 0,
        date_from: t || void 0,
        date_to: g || void 0,
        page: f,
      }),
      [c, a, t, g, f],
    ),
    { data: h, isLoading: y } = U(w),
    s = o.useMemo(() => h?.data ?? [], [h?.data]),
    d = h?.count ?? 0,
    P = Math.ceil(d / le),
    L = o.useMemo(
      () => [
        { value: "", label: "Tous les clients" },
        ...C.map((r) => ({ value: r.id, label: r.name })),
      ],
      [C],
    ),
    O = o.useMemo(
      () => [
        { value: "", label: "Tous les statuts" },
        ...M.map((r) => ({ value: r, label: E[r] })),
      ],
      [],
    ),
    F = o.useCallback(() => {
      if (s.length === 0) {
        X.error("Aucune donnée à exporter");
        return;
      }
      oe(
        s,
        [
          { key: "date", label: "Date" },
          { key: "status", label: "Statut" },
          { key: "revenue", label: "Revenu" },
          { key: "nombre_paiements", label: "Paiements" },
          { key: "debrief", label: "Debrief" },
          { key: "notes", label: "Notes" },
        ],
        "appels-closer",
      );
    }, [s]);
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
              children: "CA & Appels Closer",
            }),
            e.jsx("p", {
              className: "mt-1 text-sm text-muted-foreground",
              children:
                "Suivi des appels de closing et du chiffre d'affaires généré.",
            }),
          ],
        }),
      }),
      e.jsx(ne, { clientId: c || void 0 }),
      e.jsxs("div", {
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
                    options: L,
                    value: c,
                    onChange: (r) => {
                      (l(r), n(1));
                    },
                    placeholder: "Tous les clients",
                    className: "w-full sm:w-48",
                  }),
                  e.jsx(v, {
                    options: O,
                    value: a,
                    onChange: (r) => {
                      (u(r), n(1));
                    },
                    placeholder: "Tous les statuts",
                    className: "w-full sm:w-44",
                  }),
                  e.jsxs("div", {
                    className:
                      "flex flex-col sm:flex-row sm:items-center gap-2",
                    children: [
                      e.jsx("input", {
                        type: "date",
                        value: t,
                        onChange: (r) => {
                          (x(r.target.value), n(1));
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
                        onChange: (r) => {
                          (N(r.target.value), n(1));
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
                  e.jsx(S, {
                    variant: "secondary",
                    size: "sm",
                    icon: e.jsx(Y, { className: "h-4 w-4" }),
                    onClick: F,
                    children: "Exporter",
                  }),
                  e.jsx(S, {
                    size: "sm",
                    icon: e.jsx(Z, { className: "h-4 w-4" }),
                    onClick: () => {
                      (i(null), m(!0));
                    },
                    children: "Nouvel appel",
                  }),
                ],
              }),
            ],
          }),
          e.jsx(G, { data: s, isLoading: y }),
          P > 1 &&
            e.jsx(te, {
              currentPage: f,
              totalPages: P,
              onPageChange: n,
              totalItems: d,
            }),
        ],
      }),
      e.jsx(ie, {
        open: _,
        onClose: () => {
          (m(!1), i(null));
        },
        editItem: b,
      }),
    ],
  });
}
export { Le as default };
