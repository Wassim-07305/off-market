import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { r as m } from "./vendor-react-Cci7g3Cb.js";
import {
  b as C,
  c as A,
  d as I,
  u as y,
  I as _,
  a as M,
} from "./InstagramPostStatsTable-CI2aEuiC.js";
import { u as w } from "./useClients-oFN0czBK.js";
import { C as h, d as P } from "./card-Dkj99_H3.js";
import { S as j, e as E, c as F } from "./index-DY9GA2La.js";
import {
  I as T,
  U as O,
  aI as U,
  ah as z,
  z as B,
} from "./vendor-ui-DDdrexJZ.js";
import { u as D, C as L } from "./vendor-forms-Ct2mZ2NL.js";
import { a as R } from "./zod-COY_rf8d.js";
import { i as k } from "./forms-zLivl21i.js";
import { M as q } from "./modal-DBBZDXoW.js";
import { I as f } from "./input-B9vrc6Q3.js";
import { S as N } from "./select-E7QvXrZc.js";
import { B as v } from "./button-DlbP8VPc.js";
import { u as K } from "./usePageTitle-I7G4QvKX.js";
import "./data-table-BDFYi4Le.js";
import "./index-Ddu5uNF-.js";
import "./empty-state-BFSeK4Tv.js";
import "./constants-IBlSVYu1.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
function V({ clientId: l }) {
  const { data: a, isLoading: s } = C(l);
  if (s)
    return e.jsx("div", {
      className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
      children: Array.from({ length: 4 }).map((t, d) =>
        e.jsx(
          h,
          {
            children: e.jsxs(P, {
              className: "p-6",
              children: [
                e.jsx(j, { className: "mb-3 h-12 w-12 rounded-2xl" }),
                e.jsx(j, { className: "h-4 w-24" }),
                e.jsx(j, { className: "mt-2 h-8 w-32" }),
              ],
            }),
          },
          d,
        ),
      ),
    });
  if (!a) return null;
  const o = new Intl.NumberFormat("fr-FR"),
    u = [
      {
        label: "Comptes",
        value: o.format(a.nbComptes),
        icon: e.jsx(T, { className: "h-5 w-5" }),
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        label: "Abonnés total",
        value: o.format(a.totalFollowers),
        icon: e.jsx(O, { className: "h-5 w-5" }),
        color: "text-blue-600",
        bgColor: "bg-blue-500/10",
      },
      {
        label: "Publications",
        value: o.format(a.totalMedia),
        icon: e.jsx(U, { className: "h-5 w-5" }),
        color: "text-purple-600",
        bgColor: "bg-purple-500/10",
      },
      {
        label: "Engagement moyen",
        value: E(a.avgEngagement),
        icon: e.jsx(z, { className: "h-5 w-5" }),
        color:
          a.avgEngagement > 3
            ? "text-success"
            : a.avgEngagement > 1
              ? "text-warning"
              : "text-muted-foreground",
        bgColor:
          a.avgEngagement > 3
            ? "bg-success/10"
            : a.avgEngagement > 1
              ? "bg-warning/10"
              : "bg-muted",
      },
    ];
  return e.jsx("div", {
    className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
    children: u.map((t) =>
      e.jsx(
        h,
        {
          children: e.jsxs("div", {
            className: "p-6",
            children: [
              e.jsx("div", {
                className: F(
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
function G({ open: l, onClose: a, editItem: s }) {
  const o = A(),
    u = I(),
    { data: t } = w(),
    d = t?.data ?? [],
    {
      register: i,
      handleSubmit: g,
      control: p,
      reset: x,
      formState: { errors: r },
    } = D({
      resolver: R(k),
      defaultValues: {
        client_id: "",
        username: "",
        followers: 0,
        following: 0,
        media_count: 0,
      },
    });
  m.useEffect(() => {
    x(
      s
        ? {
            client_id: s.client_id ?? "",
            username: s.username,
            followers: s.followers,
            following: s.following,
            media_count: s.media_count,
          }
        : {
            client_id: "",
            username: "",
            followers: 0,
            following: 0,
            media_count: 0,
          },
    );
  }, [s, x, l]);
  const n = (c) => {
      s
        ? u.mutate({ id: s.id, ...c }, { onSuccess: () => a() })
        : o.mutate(c, { onSuccess: () => a() });
    },
    b = o.isPending || u.isPending,
    S = d.map((c) => ({ value: c.id, label: c.name }));
  return e.jsx(q, {
    open: l,
    onClose: a,
    title: s ? "Modifier le compte Instagram" : "Ajouter un compte Instagram",
    size: "md",
    children: e.jsxs("form", {
      onSubmit: g(n),
      className: "flex flex-col gap-4",
      children: [
        e.jsx(L, {
          name: "client_id",
          control: p,
          render: ({ field: c }) =>
            e.jsx(N, {
              label: "Client",
              options: S,
              value: c.value,
              onChange: c.onChange,
              error: r.client_id?.message,
              placeholder: "Sélectionner un client...",
            }),
        }),
        e.jsx(f, {
          label: "Nom d'utilisateur",
          ...i("username"),
          error: r.username?.message,
          placeholder: "@username",
        }),
        e.jsx(f, {
          label: "Abonnés",
          type: "number",
          min: "0",
          ...i("followers"),
          error: r.followers?.message,
        }),
        e.jsx(f, {
          label: "Abonnements",
          type: "number",
          min: "0",
          ...i("following"),
          error: r.following?.message,
        }),
        e.jsx(f, {
          label: "Publications",
          type: "number",
          min: "0",
          ...i("media_count"),
          error: r.media_count?.message,
        }),
        e.jsxs("div", {
          className: "flex justify-end gap-3 pt-2",
          children: [
            e.jsx(v, {
              type: "button",
              variant: "secondary",
              onClick: a,
              children: "Annuler",
            }),
            e.jsx(v, {
              type: "submit",
              loading: b,
              children: s ? "Mettre à jour" : "Ajouter",
            }),
          ],
        }),
      ],
    }),
  });
}
function ge() {
  K("Instagram");
  const [l, a] = m.useState(""),
    [s, o] = m.useState(null),
    [u, t] = m.useState(!1),
    { data: d } = w(),
    i = m.useMemo(() => d?.data ?? [], [d?.data]),
    { data: g, isLoading: p } = y(l || void 0),
    x = m.useMemo(
      () => [
        { value: "", label: "Tous les clients" },
        ...i.map((n) => ({ value: n.id, label: n.name })),
      ],
      [i],
    ),
    r = m.useMemo(() => g?.find((n) => n.id === s) ?? null, [g, s]);
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
              children: "Instagram",
            }),
            e.jsx("p", {
              className: "mt-1 text-sm text-muted-foreground",
              children:
                "Suivi des comptes Instagram et performances des publications.",
            }),
          ],
        }),
      }),
      e.jsx(V, { clientId: l || void 0 }),
      e.jsxs("div", {
        className: "space-y-4",
        children: [
          e.jsxs("div", {
            className:
              "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
            children: [
              e.jsx(N, {
                options: x,
                value: l,
                onChange: (n) => {
                  (a(n), o(null));
                },
                placeholder: "Tous les clients",
                className: "w-full sm:w-48",
              }),
              e.jsx(v, {
                size: "sm",
                icon: e.jsx(B, { className: "h-4 w-4" }),
                onClick: () => t(!0),
                children: "Ajouter un compte",
              }),
            ],
          }),
          e.jsx(_, {
            data: g ?? [],
            isLoading: p,
            onSelect: (n) => o((b) => (b === n ? null : n)),
          }),
        ],
      }),
      s &&
        e.jsxs(h, {
          className: "p-6",
          children: [
            e.jsx("div", {
              className: "mb-4",
              children: e.jsxs("h2", {
                className: "text-lg font-semibold text-foreground",
                children: [
                  "Statistiques des publications",
                  r &&
                    e.jsxs("span", {
                      className:
                        "ml-2 text-sm font-normal text-muted-foreground",
                      children: ["@", r.username],
                    }),
                ],
              }),
            }),
            e.jsx(M, { accountId: s }),
          ],
        }),
      e.jsx(G, { open: u, onClose: () => t(!1) }),
    ],
  });
}
export { ge as default };
