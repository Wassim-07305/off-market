import { j as e, u as L } from "./vendor-query-sBpsl8Kt.js";
import { r as h, k, f as I } from "./vendor-react-Cci7g3Cb.js";
import { a as M } from "./useEleves-Dg_0NJBt.js";
import { a as P } from "./useLeads-TuKFlYpV.js";
import { D as y } from "./data-table-BDFYi4Le.js";
import { B as j } from "./badge-CFrXqKTx.js";
import {
  c as _,
  b as x,
  S as c,
  h as b,
  s as C,
  g as T,
} from "./index-DY9GA2La.js";
import { E as p } from "./empty-state-BFSeK4Tv.js";
import {
  L as q,
  a as B,
  C as O,
  b as R,
  F as V,
  R as U,
} from "./constants-IBlSVYu1.js";
import {
  f as z,
  ai as K,
  aj as S,
  Q as D,
  P as E,
  U as F,
  ad as w,
  L as H,
  T as Q,
  F as Y,
  I as J,
} from "./vendor-ui-DDdrexJZ.js";
import { u as W } from "./useCallCalendar-B0TAFn5Z.js";
import { u as G, a as X, b as Z } from "./useFinances-lbLdW7J9.js";
import { C as o, d, a as $, b as ee } from "./card-Dkj99_H3.js";
import { a as se } from "./useSetterActivities-CkfYxyYw.js";
import { u as ae, C as te } from "./CloserCallsTable-B1oI979D.js";
import { u as le, S as ne } from "./SocialContentBoard-CgMPzRRP.js";
import {
  u as re,
  I as ie,
  a as ce,
} from "./InstagramPostStatsTable-CI2aEuiC.js";
import { B as A } from "./button-DlbP8VPc.js";
import { T as oe, a as u } from "./tabs-oT6f7FFv.js";
import { u as de } from "./usePageTitle-I7G4QvKX.js";
import "./index-Ddu5uNF-.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
import "./vendor-dnd-DrANF9GG.js";
function me({ clientId: r }) {
  const { data: l, isLoading: a } = P(r),
    n = h.useMemo(
      () => [
        {
          accessorKey: "name",
          header: "Nom",
          enableSorting: !0,
          cell: ({ row: s }) =>
            e.jsx("span", {
              className: "font-medium text-foreground",
              children: s.original.name,
            }),
        },
        {
          accessorKey: "status",
          header: "Statut",
          enableSorting: !0,
          cell: ({ row: s }) => {
            const t = s.original.status;
            return e.jsx(j, { className: _(B[t]), children: q[t] });
          },
        },
        {
          accessorKey: "ca_contracté",
          header: "CA Contracté",
          enableSorting: !0,
          cell: ({ row: s }) =>
            e.jsx("span", {
              className: "text-sm text-foreground",
              children: x(Number(s.original.ca_contracté)),
            }),
        },
        {
          accessorKey: "ca_collecté",
          header: "CA Collecté",
          enableSorting: !0,
          cell: ({ row: s }) =>
            e.jsx("span", {
              className: "text-sm text-foreground",
              children: x(Number(s.original.ca_collecté)),
            }),
        },
      ],
      [],
    );
  return a
    ? e.jsxs("div", {
        className: "space-y-3",
        children: [
          e.jsx(c, { className: "h-10 w-full" }),
          Array.from({ length: 3 }).map((s, t) =>
            e.jsx(c, { className: "h-12 w-full" }, t),
          ),
        ],
      })
    : !l || l.length === 0
      ? e.jsx(p, {
          icon: e.jsx(z, { className: "h-6 w-6" }),
          title: "Aucun lead",
          description: "Aucun lead n'est associe a ce client.",
        })
      : e.jsx(y, { columns: n, data: l, pagination: !0, pageSize: 10 });
}
function ue({ clientId: r }) {
  const { data: l, isLoading: a } = W({ client_id: r }),
    n = h.useMemo(
      () => [
        {
          accessorKey: "date",
          header: "Date",
          enableSorting: !0,
          cell: ({ row: s }) =>
            e.jsx("span", {
              className: "text-sm text-foreground",
              children: b(s.original.date),
            }),
        },
        {
          accessorKey: "time",
          header: "Heure",
          enableSorting: !0,
          cell: ({ row: s }) =>
            e.jsx("span", {
              className: "text-sm text-foreground",
              children: s.original.time,
            }),
        },
        {
          accessorKey: "type",
          header: "Type",
          enableSorting: !0,
          cell: ({ row: s }) => {
            const t = s.original.type;
            return e.jsx(j, {
              className: _(O[t]),
              children: t.charAt(0).toUpperCase() + t.slice(1),
            });
          },
        },
        {
          accessorKey: "status",
          header: "Statut",
          enableSorting: !0,
          cell: ({ row: s }) => {
            const t = s.original.status;
            return e.jsx(j, {
              className: _(R[t]),
              children: t.charAt(0).toUpperCase() + t.slice(1),
            });
          },
        },
        {
          accessorKey: "lead",
          header: "Lead",
          enableSorting: !1,
          cell: ({ row: s }) =>
            e.jsx("span", {
              className: "text-sm text-foreground",
              children: s.original.lead?.name ?? "-",
            }),
        },
      ],
      [],
    );
  return a
    ? e.jsxs("div", {
        className: "space-y-3",
        children: [
          e.jsx(c, { className: "h-10 w-full" }),
          Array.from({ length: 3 }).map((s, t) =>
            e.jsx(c, { className: "h-12 w-full" }, t),
          ),
        ],
      })
    : !l || l.length === 0
      ? e.jsx(p, {
          icon: e.jsx(K, { className: "h-6 w-6" }),
          title: "Aucun call planifie",
          description: "Aucun call n'est planifie pour ce client.",
        })
      : e.jsx(y, { columns: n, data: l, pagination: !0, pageSize: 10 });
}
function xe({ clientId: r }) {
  const { data: l, isLoading: a } = G({ client_id: r }),
    { data: n, isLoading: s } = X(r),
    { data: t, isLoading: N } = Z(r),
    v = l?.data ?? [],
    m = h.useMemo(
      () => [
        {
          accessorKey: "date",
          header: "Date",
          enableSorting: !0,
          cell: ({ row: i }) =>
            e.jsx("span", {
              className: "text-sm text-foreground",
              children: b(i.original.date),
            }),
        },
        {
          accessorKey: "label",
          header: "Libelle",
          enableSorting: !0,
          cell: ({ row: i }) =>
            e.jsx("span", {
              className: "font-medium text-foreground",
              children: i.original.label,
            }),
        },
        {
          accessorKey: "type",
          header: "Type",
          enableSorting: !0,
          cell: ({ row: i }) => {
            const f = i.original.type;
            return e.jsx(j, { variant: "secondary", children: V[f] });
          },
        },
        {
          accessorKey: "amount",
          header: "Montant",
          enableSorting: !0,
          cell: ({ row: i }) =>
            e.jsx("span", {
              className: "text-sm font-medium text-foreground",
              children: x(Number(i.original.amount)),
            }),
        },
        {
          accessorKey: "is_paid",
          header: "Paye",
          enableSorting: !0,
          cell: ({ row: i }) =>
            e.jsx(j, {
              className: _(
                i.original.is_paid
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700",
              ),
              children: i.original.is_paid ? "Oui" : "Non",
            }),
        },
      ],
      [],
    ),
    g = h.useMemo(
      () => [
        {
          accessorKey: "due_date",
          header: "Echeance",
          enableSorting: !0,
          cell: ({ row: i }) =>
            e.jsx("span", {
              className: "text-sm text-foreground",
              children: b(i.original.due_date),
            }),
        },
        {
          accessorKey: "amount",
          header: "Montant",
          enableSorting: !0,
          cell: ({ row: i }) =>
            e.jsx("span", {
              className: "text-sm font-medium text-foreground",
              children: x(Number(i.original.amount)),
            }),
        },
        {
          accessorKey: "is_paid",
          header: "Paye",
          enableSorting: !0,
          cell: ({ row: i }) =>
            e.jsx(j, {
              className: _(
                i.original.is_paid
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700",
              ),
              children: i.original.is_paid ? "Oui" : "Non",
            }),
        },
        {
          accessorKey: "paid_at",
          header: "Date paiement",
          enableSorting: !0,
          cell: ({ row: i }) =>
            e.jsx("span", {
              className: "text-sm text-muted-foreground",
              children: i.original.paid_at ? b(i.original.paid_at) : "-",
            }),
        },
      ],
      [],
    );
  return a && s
    ? e.jsxs("div", {
        className: "space-y-4",
        children: [
          e.jsx("div", {
            className: "grid grid-cols-1 gap-4 sm:grid-cols-4",
            children: Array.from({ length: 4 }).map((i, f) =>
              e.jsx(c, { className: "h-20 w-full" }, f),
            ),
          }),
          e.jsx(c, { className: "h-10 w-full" }),
          Array.from({ length: 3 }).map((i, f) =>
            e.jsx(c, { className: "h-12 w-full" }, f),
          ),
        ],
      })
    : e.jsxs("div", {
        className: "space-y-6",
        children: [
          e.jsxs("div", {
            className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
            children: [
              e.jsx(o, {
                children: e.jsx(d, {
                  className: "pt-6",
                  children: s
                    ? e.jsx(c, { className: "h-12 w-full" })
                    : e.jsxs(e.Fragment, {
                        children: [
                          e.jsx("p", {
                            className:
                              "text-sm font-medium text-muted-foreground",
                            children: "CA",
                          }),
                          e.jsx("p", {
                            className:
                              "mt-1 text-2xl font-bold text-foreground",
                            children: x(n?.ca ?? 0),
                          }),
                        ],
                      }),
                }),
              }),
              e.jsx(o, {
                children: e.jsx(d, {
                  className: "pt-6",
                  children: s
                    ? e.jsx(c, { className: "h-12 w-full" })
                    : e.jsxs(e.Fragment, {
                        children: [
                          e.jsx("p", {
                            className:
                              "text-sm font-medium text-muted-foreground",
                            children: "Recurrent",
                          }),
                          e.jsx("p", {
                            className:
                              "mt-1 text-2xl font-bold text-foreground",
                            children: x(n?.récurrent ?? 0),
                          }),
                        ],
                      }),
                }),
              }),
              e.jsx(o, {
                children: e.jsx(d, {
                  className: "pt-6",
                  children: s
                    ? e.jsx(c, { className: "h-12 w-full" })
                    : e.jsxs(e.Fragment, {
                        children: [
                          e.jsx("p", {
                            className:
                              "text-sm font-medium text-muted-foreground",
                            children: "Charges",
                          }),
                          e.jsx("p", {
                            className:
                              "mt-1 text-2xl font-bold text-foreground",
                            children: x(n?.charges ?? 0),
                          }),
                        ],
                      }),
                }),
              }),
              e.jsx(o, {
                children: e.jsx(d, {
                  className: "pt-6",
                  children: s
                    ? e.jsx(c, { className: "h-12 w-full" })
                    : e.jsxs(e.Fragment, {
                        children: [
                          e.jsx("p", {
                            className:
                              "text-sm font-medium text-muted-foreground",
                            children: "Marge",
                          }),
                          e.jsxs("p", {
                            className:
                              "mt-1 text-2xl font-bold text-foreground",
                            children: [(n?.marge ?? 0).toFixed(1), "%"],
                          }),
                        ],
                      }),
                }),
              }),
            ],
          }),
          e.jsxs("div", {
            children: [
              e.jsx("h3", {
                className: "mb-3 text-lg font-semibold text-foreground",
                children: "Entrees financieres",
              }),
              v.length === 0
                ? e.jsx(p, {
                    icon: e.jsx(S, { className: "h-6 w-6" }),
                    title: "Aucune entree financiere",
                    description: "Aucune entree financiere pour ce client.",
                  })
                : e.jsx(y, {
                    columns: m,
                    data: v,
                    pagination: !0,
                    pageSize: 10,
                  }),
            ],
          }),
          e.jsxs("div", {
            children: [
              e.jsx("h3", {
                className: "mb-3 text-lg font-semibold text-foreground",
                children: "Echeancier de paiement",
              }),
              N
                ? e.jsx("div", {
                    className: "space-y-3",
                    children: Array.from({ length: 3 }).map((i, f) =>
                      e.jsx(c, { className: "h-12 w-full" }, f),
                    ),
                  })
                : !t || t.length === 0
                  ? e.jsx(p, {
                      icon: e.jsx(S, { className: "h-6 w-6" }),
                      title: "Aucune echeance",
                      description:
                        "Aucune echeance de paiement pour ce client.",
                    })
                  : e.jsx(y, {
                      columns: g,
                      data: t,
                      pagination: !0,
                      pageSize: 10,
                    }),
            ],
          }),
        ],
      });
}
function he({ clientId: r }) {
  const { data: l, isLoading: a } = se({ client_id: r }),
    n = h.useMemo(
      () => [
        {
          accessorKey: "date",
          header: "Date",
          enableSorting: !0,
          cell: ({ row: s }) =>
            e.jsx("span", {
              className: "text-sm text-foreground",
              children: b(s.original.date),
            }),
        },
        {
          accessorKey: "profile",
          header: "Profil",
          enableSorting: !1,
          cell: ({ row: s }) =>
            e.jsx("span", {
              className: "text-sm text-foreground",
              children: s.original.profile?.full_name ?? "-",
            }),
        },
        {
          accessorKey: "messages_sent",
          header: "Messages envoyés",
          enableSorting: !0,
          cell: ({ row: s }) =>
            e.jsx("span", {
              className: "text-sm font-medium text-foreground",
              children: s.original.messages_sent,
            }),
        },
        {
          accessorKey: "notes",
          header: "Notes",
          enableSorting: !1,
          cell: ({ row: s }) =>
            e.jsx("span", {
              className: "text-sm text-muted-foreground",
              children: s.original.notes || "-",
            }),
        },
      ],
      [],
    );
  return a
    ? e.jsxs("div", {
        className: "space-y-3",
        children: [
          e.jsx(c, { className: "h-10 w-full" }),
          Array.from({ length: 3 }).map((s, t) =>
            e.jsx(c, { className: "h-12 w-full" }, t),
          ),
        ],
      })
    : !l || l.length === 0
      ? e.jsx(p, {
          icon: e.jsx(D, { className: "h-6 w-6" }),
          title: "Aucune activité setter",
          description: "Aucune activité de setter pour ce client.",
        })
      : e.jsx(y, { columns: n, data: l, pagination: !0, pageSize: 10 });
}
function ge({ clientId: r }) {
  const { data: l, isLoading: a } = ae({ client_id: r }),
    n = h.useMemo(() => l?.data ?? [], [l?.data]);
  return !a && n.length === 0
    ? e.jsx(p, {
        icon: e.jsx(E, { className: "h-10 w-10" }),
        title: "Aucun appel closer",
        description: "Aucun appel de closing enregistré pour ce client.",
      })
    : e.jsx(te, { data: n, isLoading: a });
}
function fe({ clientId: r }) {
  const { data: l, isLoading: a } = le({ client_id: r });
  return e.jsx(ne, { data: l ?? [], isLoading: a });
}
function je({ clientId: r }) {
  const [l, a] = h.useState(null),
    { data: n, isLoading: s } = re(r);
  return e.jsxs("div", {
    className: "space-y-6",
    children: [
      e.jsx(ie, {
        data: n ?? [],
        isLoading: s,
        onSelect: (t) => a(t === l ? null : t),
      }),
      l && e.jsx(ce, { accountId: l }),
    ],
  });
}
function pe(r) {
  return L({
    queryKey: ["client-assignments", r],
    queryFn: async () => {
      let l = C.from("client_assignments")
        .select("*, profile:profiles!user_id(id, full_name, email, avatar_url)")
        .order("assigned_at", { ascending: !1 });
      r && (l = l.eq("client_id", r));
      const { data: a, error: n } = await l;
      if (n) throw n;
      return a;
    },
    enabled: !!r,
  });
}
function Ne({ clientId: r }) {
  const { data: l, isLoading: a } = pe(r);
  return a
    ? e.jsx("div", {
        className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        children: Array.from({ length: 3 }).map((n, s) =>
          e.jsx(c, { className: "h-24 w-full" }, s),
        ),
      })
    : !l || l.length === 0
      ? e.jsx(p, {
          icon: e.jsx(F, { className: "h-10 w-10" }),
          title: "Aucun membre assigné",
          description: "Aucun membre d'équipe n'est assigné à ce client.",
        })
      : e.jsx("div", {
          className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
          children: l.map((n) =>
            e.jsx(
              o,
              {
                children: e.jsxs(d, {
                  className: "flex items-center gap-3 pt-6",
                  children: [
                    e.jsx("div", {
                      className:
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-red-400/10 text-xs font-semibold text-red-300 ring-2 ring-red-500/10",
                      children: n.profile?.avatar_url
                        ? e.jsx("img", {
                            src: n.profile.avatar_url,
                            alt: n.profile.full_name,
                            className: "h-10 w-10 rounded-full object-cover",
                          })
                        : T(n.profile?.full_name ?? "U"),
                    }),
                    e.jsxs("div", {
                      className: "min-w-0 flex-1",
                      children: [
                        e.jsx("p", {
                          className:
                            "truncate text-sm font-semibold text-foreground",
                          children: n.profile?.full_name ?? "Utilisateur",
                        }),
                        e.jsx("p", {
                          className: "truncate text-xs text-muted-foreground",
                          children: n.profile?.email,
                        }),
                      ],
                    }),
                    e.jsx(j, {
                      variant: "secondary",
                      children: U[n.role] ?? n.role,
                    }),
                  ],
                }),
              },
              n.id,
            ),
          ),
        });
}
const ve = [
  {
    value: "overview",
    label: e.jsxs("span", {
      className: "inline-flex items-center gap-1.5",
      children: [
        e.jsx(H, { className: "hidden h-4 w-4 sm:block" }),
        "Vue d'ensemble",
      ],
    }),
  },
  {
    value: "team",
    label: e.jsxs("span", {
      className: "inline-flex items-center gap-1.5",
      children: [e.jsx(F, { className: "hidden h-4 w-4 sm:block" }), "Équipe"],
    }),
  },
  {
    value: "pipeline",
    label: e.jsxs("span", {
      className: "inline-flex items-center gap-1.5",
      children: [
        e.jsx(Q, { className: "hidden h-4 w-4 sm:block" }),
        "Pipeline",
      ],
    }),
  },
  {
    value: "closer",
    label: e.jsxs("span", {
      className: "inline-flex items-center gap-1.5",
      children: [
        e.jsx(E, { className: "hidden h-4 w-4 sm:block" }),
        "Closer Calls",
      ],
    }),
  },
  {
    value: "calendar",
    label: e.jsxs("span", {
      className: "inline-flex items-center gap-1.5",
      children: [
        e.jsx(K, { className: "hidden h-4 w-4 sm:block" }),
        "Calendrier",
      ],
    }),
  },
  {
    value: "activite",
    label: e.jsxs("span", {
      className: "inline-flex items-center gap-1.5",
      children: [
        e.jsx(D, { className: "hidden h-4 w-4 sm:block" }),
        "Activité",
      ],
    }),
  },
  {
    value: "finances",
    label: e.jsxs("span", {
      className: "inline-flex items-center gap-1.5",
      children: [
        e.jsx(S, { className: "hidden h-4 w-4 sm:block" }),
        "Finances",
      ],
    }),
  },
  {
    value: "social",
    label: e.jsxs("span", {
      className: "inline-flex items-center gap-1.5",
      children: [e.jsx(Y, { className: "hidden h-4 w-4 sm:block" }), "Social"],
    }),
  },
  {
    value: "instagram",
    label: e.jsxs("span", {
      className: "inline-flex items-center gap-1.5",
      children: [
        e.jsx(J, { className: "hidden h-4 w-4 sm:block" }),
        "Instagram",
      ],
    }),
  },
];
function be(r) {
  return L({
    queryKey: ["eleve-stats", r],
    queryFn: async () => {
      if (!r) throw new Error("ID requis");
      const { data: l } = await C.from("leads")
          .select("*")
          .eq("assigned_to", r),
        a = l ?? [],
        { data: n } = await C.from("setter_activities")
          .select("messages_sent")
          .eq("user_id", r)
          .gte(
            "date",
            new Date(Date.now() - 30 * 864e5).toISOString().split("T")[0],
          ),
        s = a.length,
        t = a.reduce((m, g) => m + Number(g.ca_contracté), 0),
        N = a.reduce((m, g) => m + Number(g.ca_collecté), 0),
        v = n?.reduce((m, g) => m + g.messages_sent, 0) ?? 0;
      return { totalLeads: s, caContracte: t, caCollecte: N, totalMessages: v };
    },
    enabled: !!r,
  });
}
function Qe() {
  de("Détail client");
  const { id: r } = k(),
    l = I(),
    { data: a, isLoading: n } = M(r),
    { data: s } = be(r),
    [t, N] = h.useState("overview");
  return n
    ? e.jsxs("div", {
        className: "space-y-8",
        children: [
          e.jsxs("div", {
            className: "flex items-center gap-4",
            children: [
              e.jsx(c, { className: "h-8 w-8" }),
              e.jsx(c, { className: "h-8 w-48" }),
            ],
          }),
          e.jsx(c, { className: "h-10 w-full" }),
          e.jsx("div", {
            className: "space-y-3",
            children: Array.from({ length: 4 }).map((v, m) =>
              e.jsx(c, { className: "h-20 w-full" }, m),
            ),
          }),
        ],
      })
    : a
      ? e.jsxs("div", {
          className: "space-y-8",
          children: [
            e.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                e.jsx(A, {
                  variant: "ghost",
                  size: "sm",
                  onClick: () => l("/eleves"),
                  className: "shrink-0",
                  children: e.jsx(w, { className: "h-4 w-4" }),
                }),
                e.jsxs("div", {
                  className: "flex items-center gap-3",
                  children: [
                    e.jsx("div", {
                      className:
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-red-400/10 text-xs font-semibold text-red-300 ring-2 ring-red-500/10",
                      children: a.avatar_url
                        ? e.jsx("img", {
                            src: a.avatar_url,
                            alt: a.full_name,
                            className: "h-10 w-10 rounded-full object-cover",
                          })
                        : T(a.full_name),
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx("h1", {
                          className: "text-2xl font-bold text-foreground",
                          children: a.full_name,
                        }),
                        e.jsx("p", {
                          className: "text-sm text-muted-foreground",
                          children: a.email,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            e.jsx("div", {
              className: "overflow-x-auto",
              children: e.jsx(oe, {
                tabs: ve,
                value: t,
                onChange: N,
                className: "w-max min-w-full",
              }),
            }),
            e.jsx(u, {
              value: "overview",
              activeValue: t,
              children: e.jsxs("div", {
                className: "space-y-6",
                children: [
                  e.jsxs("div", {
                    className:
                      "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
                    children: [
                      e.jsx(o, {
                        children: e.jsxs(d, {
                          className: "pt-6",
                          children: [
                            e.jsx("p", {
                              className:
                                "text-sm font-medium text-muted-foreground",
                              children: "Leads",
                            }),
                            e.jsx("p", {
                              className:
                                "mt-1 text-2xl font-bold text-foreground",
                              children: s?.totalLeads ?? 0,
                            }),
                          ],
                        }),
                      }),
                      e.jsx(o, {
                        children: e.jsxs(d, {
                          className: "pt-6",
                          children: [
                            e.jsx("p", {
                              className:
                                "text-sm font-medium text-muted-foreground",
                              children: "CA Contracté",
                            }),
                            e.jsx("p", {
                              className:
                                "mt-1 text-2xl font-bold text-foreground",
                              children: x(s?.caContracte ?? 0),
                            }),
                          ],
                        }),
                      }),
                      e.jsx(o, {
                        children: e.jsxs(d, {
                          className: "pt-6",
                          children: [
                            e.jsx("p", {
                              className:
                                "text-sm font-medium text-muted-foreground",
                              children: "CA Collecté",
                            }),
                            e.jsx("p", {
                              className:
                                "mt-1 text-2xl font-bold text-foreground",
                              children: x(s?.caCollecte ?? 0),
                            }),
                          ],
                        }),
                      }),
                      e.jsx(o, {
                        children: e.jsxs(d, {
                          className: "pt-6",
                          children: [
                            e.jsx("p", {
                              className:
                                "text-sm font-medium text-muted-foreground",
                              children: "Messages (30j)",
                            }),
                            e.jsx("p", {
                              className:
                                "mt-1 text-2xl font-bold text-foreground",
                              children: s?.totalMessages ?? 0,
                            }),
                          ],
                        }),
                      }),
                    ],
                  }),
                  e.jsxs(o, {
                    children: [
                      e.jsx($, {
                        children: e.jsx(ee, { children: "Informations" }),
                      }),
                      e.jsx(d, {
                        children: e.jsxs("dl", {
                          className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
                          children: [
                            e.jsxs("div", {
                              children: [
                                e.jsx("dt", {
                                  className:
                                    "text-sm font-medium text-muted-foreground",
                                  children: "Email",
                                }),
                                e.jsx("dd", {
                                  className: "mt-1 text-sm text-foreground",
                                  children: a.email,
                                }),
                              ],
                            }),
                            a.phone &&
                              e.jsxs("div", {
                                children: [
                                  e.jsx("dt", {
                                    className:
                                      "text-sm font-medium text-muted-foreground",
                                    children: "Téléphone",
                                  }),
                                  e.jsx("dd", {
                                    className: "mt-1 text-sm text-foreground",
                                    children: a.phone,
                                  }),
                                ],
                              }),
                            e.jsxs("div", {
                              children: [
                                e.jsx("dt", {
                                  className:
                                    "text-sm font-medium text-muted-foreground",
                                  children: "Dernière connexion",
                                }),
                                e.jsx("dd", {
                                  className: "mt-1 text-sm text-foreground",
                                  children: a.last_seen_at
                                    ? new Date(
                                        a.last_seen_at,
                                      ).toLocaleDateString("fr-FR")
                                    : "Jamais",
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                    ],
                  }),
                ],
              }),
            }),
            e.jsx(u, {
              value: "team",
              activeValue: t,
              children: e.jsx(Ne, { clientId: a.id }),
            }),
            e.jsx(u, {
              value: "pipeline",
              activeValue: t,
              children: e.jsx(me, { clientId: a.id }),
            }),
            e.jsx(u, {
              value: "closer",
              activeValue: t,
              children: e.jsx(ge, { clientId: a.id }),
            }),
            e.jsx(u, {
              value: "calendar",
              activeValue: t,
              children: e.jsx(ue, { clientId: a.id }),
            }),
            e.jsx(u, {
              value: "activite",
              activeValue: t,
              children: e.jsx(he, { clientId: a.id }),
            }),
            e.jsx(u, {
              value: "finances",
              activeValue: t,
              children: e.jsx(xe, { clientId: a.id }),
            }),
            e.jsx(u, {
              value: "social",
              activeValue: t,
              children: e.jsx(fe, { clientId: a.id }),
            }),
            e.jsx(u, {
              value: "instagram",
              activeValue: t,
              children: e.jsx(je, { clientId: a.id }),
            }),
          ],
        })
      : e.jsxs("div", {
          className: "space-y-4",
          children: [
            e.jsx(A, {
              variant: "ghost",
              size: "sm",
              icon: e.jsx(w, { className: "h-4 w-4" }),
              onClick: () => l("/eleves"),
              children: "Retour",
            }),
            e.jsx("p", {
              className: "text-muted-foreground",
              children: "Élève introuvable.",
            }),
          ],
        });
}
export { Qe as default };
