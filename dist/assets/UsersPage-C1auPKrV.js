import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { r as n } from "./vendor-react-Cci7g3Cb.js";
import { a as b, b as P, c as S } from "./useUsers-BngZVZxm.js";
import { A as y, h as A, S as u } from "./index-DY9GA2La.js";
import { E as w } from "./empty-state-BFSeK4Tv.js";
import { A as U, R as _ } from "./constants-IBlSVYu1.js";
import { D as C } from "./data-table-BDFYi4Le.js";
import { S as p } from "./select-E7QvXrZc.js";
import { M as O } from "./modal-DBBZDXoW.js";
import { I as N } from "./input-B9vrc6Q3.js";
import { B as v } from "./button-DlbP8VPc.js";
import { u as I } from "./usePageTitle-I7G4QvKX.js";
import { U as L } from "./vendor-ui-DDdrexJZ.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
import "./index-Ddu5uNF-.js";
const M = U.map((l) => ({ value: l, label: _[l] }));
function k({ data: l, onRowClick: r }) {
  const a = b(),
    i = n.useMemo(
      () => [
        {
          id: "full_name",
          header: "Nom",
          accessorFn: (s) => s.full_name,
          cell: ({ row: s }) =>
            e.jsxs("div", {
              className: "flex items-center gap-2",
              children: [
                e.jsx(y, {
                  src: s.original.avatar_url,
                  name: s.original.full_name,
                  size: "sm",
                }),
                e.jsx("span", {
                  className: "text-sm font-medium text-foreground",
                  children: s.original.full_name,
                }),
              ],
            }),
        },
        {
          accessorKey: "email",
          header: "Email",
          cell: ({ row: s }) =>
            e.jsx("span", {
              className: "text-sm text-muted-foreground",
              children: s.original.email,
            }),
        },
        {
          id: "role",
          header: "Rôle",
          accessorFn: (s) => s.role,
          cell: ({ row: s }) =>
            e.jsx("div", {
              onClick: (o) => o.stopPropagation(),
              className: "w-40",
              children: e.jsx(p, {
                options: M,
                value: s.original.role,
                onChange: (o) => {
                  a.mutate({ userId: s.original.id, role: o });
                },
              }),
            }),
        },
        {
          accessorKey: "created_at",
          header: "Date inscription",
          cell: ({ row: s }) =>
            e.jsx("span", {
              className: "text-sm text-muted-foreground",
              children: A(s.original.created_at),
            }),
        },
      ],
      [a],
    );
  return e.jsx(C, {
    columns: i,
    data: l,
    onRowClick: r,
    searchable: !0,
    searchPlaceholder: "Rechercher un utilisateur...",
    pagination: !0,
    pageSize: 15,
  });
}
const D = U.map((l) => ({ value: l, label: _[l] }));
function T({ open: l, onClose: r, user: a }) {
  const i = P(),
    s = b(),
    { data: o } = S(),
    [m, d] = n.useState(""),
    [c, x] = n.useState("prospect"),
    [h, j] = n.useState(null),
    R = (o ?? [])
      .filter((t) => t.role === "coach" || t.role === "admin")
      .map((t) => ({ value: t.id, label: t.full_name }));
  n.useEffect(() => {
    l && a && (d(a.full_name), x(a.role), j(a.coach_id ?? null));
  }, [l, a]);
  const E = async (t) => {
      if ((t.preventDefault(), !a)) return;
      const f = [];
      (f.push(i.mutateAsync({ id: a.id, full_name: m, coach_id: h })),
        c !== a.role && f.push(s.mutateAsync({ userId: a.id, role: c })),
        await Promise.all(f),
        r());
    },
    g = i.isPending || s.isPending;
  return a
    ? e.jsx(O, {
        open: l,
        onClose: r,
        title: "Modifier l'utilisateur",
        size: "md",
        children: e.jsxs("form", {
          onSubmit: E,
          className: "flex flex-col gap-4",
          children: [
            e.jsx(N, {
              label: "Nom complet",
              value: m,
              onChange: (t) => d(t.target.value),
              required: !0,
            }),
            e.jsx(N, {
              label: "Email",
              value: a.email,
              disabled: !0,
              className: "cursor-not-allowed opacity-60",
            }),
            e.jsx(p, {
              label: "Rôle",
              options: D,
              value: c,
              onChange: (t) => x(t),
            }),
            e.jsx(p, {
              label: "Coach",
              options: [{ value: "", label: "Aucun" }, ...R],
              value: h ?? "",
              onChange: (t) => j(t || null),
            }),
            e.jsxs("div", {
              className: "flex items-center justify-end gap-3 pt-2",
              children: [
                e.jsx(v, {
                  type: "button",
                  variant: "secondary",
                  onClick: r,
                  disabled: g,
                  children: "Annuler",
                }),
                e.jsx(v, {
                  type: "submit",
                  loading: g,
                  children: "Enregistrer",
                }),
              ],
            }),
          ],
        }),
      })
    : null;
}
function se() {
  I("Utilisateurs");
  const { data: l, isLoading: r } = S(),
    [a, i] = n.useState(null),
    [s, o] = n.useState(!1),
    m = (c) => {
      (i(c), o(!0));
    },
    d = () => {
      (o(!1), i(null));
    };
  return e.jsxs("div", {
    className: "space-y-8",
    children: [
      e.jsxs("div", {
        children: [
          e.jsx("h1", {
            className: "text-xl sm:text-2xl font-bold text-foreground",
            children: "Gestion des Utilisateurs",
          }),
          e.jsx("p", {
            className: "text-sm text-muted-foreground",
            children: "Gérez les utilisateurs et leurs rôles.",
          }),
        ],
      }),
      r
        ? e.jsxs("div", {
            className: "flex flex-col gap-3",
            children: [
              e.jsx(u, { className: "h-10 w-full" }),
              e.jsx(u, { className: "h-12 w-full" }),
              e.jsx(u, { className: "h-12 w-full" }),
              e.jsx(u, { className: "h-12 w-full" }),
              e.jsx(u, { className: "h-12 w-full" }),
            ],
          })
        : !l || l.length === 0
          ? e.jsx(w, {
              icon: e.jsx(L, { className: "h-6 w-6" }),
              title: "Aucun utilisateur",
              description: "Aucun utilisateur n'a été trouvé.",
            })
          : e.jsx(k, { data: l, onRowClick: m }),
      e.jsx(T, { open: s, onClose: d, user: a }),
    ],
  });
}
export { se as default };
