import { u as g, a as h, b as x, j as a } from "./vendor-query-sBpsl8Kt.js";
import { r as y } from "./vendor-react-Cci7g3Cb.js";
import { D as _ } from "./data-table-BDFYi4Le.js";
import { s as m, h as j, S as w, e as v } from "./index-DY9GA2La.js";
import { E as N } from "./empty-state-BFSeK4Tv.js";
import { t as u, I as E, au as I, aI as F } from "./vendor-ui-DDdrexJZ.js";
function L(r) {
  return g({
    queryKey: ["instagram-accounts", r],
    queryFn: async () => {
      let s = m
        .from("instagram_accounts")
        .select("*, client:clients(id, name)")
        .order("created_at", { ascending: !1 });
      r && (s = s.eq("client_id", r));
      const { data: t, error: n } = await s;
      if (n) throw n;
      return t;
    },
  });
}
function A(r) {
  return g({
    queryKey: ["instagram-post-stats", r],
    enabled: !!r,
    queryFn: async () => {
      const { data: s, error: t } = await m
        .from("instagram_post_stats")
        .select("*")
        .eq("account_id", r)
        .order("posted_at", { ascending: !1 });
      if (t) throw t;
      return s;
    },
  });
}
function R(r) {
  return g({
    queryKey: ["instagram-stats", r],
    queryFn: async () => {
      let s = m
        .from("instagram_accounts")
        .select("id, followers, following, media_count");
      r && (s = s.eq("client_id", r));
      const { data: t, error: n } = await s;
      if (n) throw n;
      const e = (t ?? []).reduce((o, i) => o + Number(i.followers), 0),
        c = (t ?? []).reduce((o, i) => o + Number(i.media_count), 0),
        K = (t ?? []).length,
        f = (t ?? []).map((o) => o.id);
      let p = 0;
      if (f.length > 0) {
        const { data: o, error: i } = await m
          .from("instagram_post_stats")
          .select("engagement_rate")
          .in("account_id", f);
        if (i) throw i;
        o &&
          o.length > 0 &&
          (p = o.reduce((b, q) => b + Number(q.engagement_rate), 0) / o.length);
      }
      return {
        totalFollowers: e,
        totalMedia: c,
        nbComptes: K,
        avgEngagement: p,
      };
    },
  });
}
function M() {
  const r = h();
  return x({
    mutationFn: async (s) => {
      const { data: t, error: n } = await m
        .from("instagram_accounts")
        .insert(s)
        .select()
        .single();
      if (n) throw n;
      return t;
    },
    onSuccess: () => {
      (r.invalidateQueries({ queryKey: ["instagram-accounts"] }),
        r.invalidateQueries({ queryKey: ["instagram-stats"] }),
        u.success("Compte Instagram ajouté"));
    },
    onError: (s) => {
      u.error(`Erreur: ${s.message}`);
    },
  });
}
function T() {
  const r = h();
  return x({
    mutationFn: async ({ id: s, ...t }) => {
      const { data: n, error: e } = await m
        .from("instagram_accounts")
        .update(t)
        .eq("id", s)
        .select()
        .single();
      if (e) throw e;
      return n;
    },
    onSuccess: () => {
      (r.invalidateQueries({ queryKey: ["instagram-accounts"] }),
        r.invalidateQueries({ queryKey: ["instagram-stats"] }),
        u.success("Compte mis à jour"));
    },
    onError: (s) => {
      u.error(`Erreur: ${s.message}`);
    },
  });
}
const d = new Intl.NumberFormat("fr-FR");
function U({ data: r, isLoading: s, onSelect: t }) {
  const n = y.useMemo(
    () => [
      {
        accessorKey: "username",
        header: "Username",
        cell: ({ row: e }) =>
          a.jsxs("span", {
            className: "font-medium text-foreground",
            children: ["@", e.original.username],
          }),
      },
      {
        accessorKey: "client.name",
        header: "Client",
        cell: ({ row: e }) =>
          a.jsx("span", {
            className: "text-muted-foreground",
            children: e.original.client?.name ?? "-",
          }),
      },
      {
        accessorKey: "followers",
        header: "Abonnés",
        cell: ({ row: e }) =>
          a.jsx("span", {
            className: "font-mono text-foreground",
            children: d.format(e.original.followers),
          }),
      },
      {
        accessorKey: "following",
        header: "Abonnements",
        cell: ({ row: e }) =>
          a.jsx("span", {
            className: "font-mono text-muted-foreground",
            children: d.format(e.original.following),
          }),
      },
      {
        accessorKey: "media_count",
        header: "Publications",
        cell: ({ row: e }) =>
          a.jsx("span", {
            className: "font-mono text-muted-foreground",
            children: d.format(e.original.media_count),
          }),
      },
      {
        accessorKey: "last_synced_at",
        header: "Dernière sync",
        cell: ({ row: e }) =>
          a.jsx("span", {
            className: "whitespace-nowrap text-xs text-muted-foreground",
            children: e.original.last_synced_at
              ? j(e.original.last_synced_at)
              : "-",
          }),
      },
    ],
    [],
  );
  return s
    ? a.jsx("div", {
        className: "space-y-3",
        children: Array.from({ length: 5 }).map((e, c) =>
          a.jsx(w, { className: "h-12 w-full" }, c),
        ),
      })
    : r.length === 0
      ? a.jsx(N, {
          icon: a.jsx(E, { className: "h-6 w-6" }),
          title: "Aucun compte Instagram",
          description:
            "Ajoutez votre premier compte Instagram pour suivre les performances.",
        })
      : a.jsx(_, {
          columns: n,
          data: r,
          pagination: !1,
          onRowClick: (e) => t(e.id),
        });
}
const l = new Intl.NumberFormat("fr-FR");
function $({ accountId: r }) {
  const { data: s, isLoading: t } = A(r),
    n = y.useMemo(
      () => [
        {
          accessorKey: "post_url",
          header: "URL",
          cell: ({ row: e }) =>
            e.original.post_url
              ? a.jsxs("a", {
                  href: e.original.post_url,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className:
                    "inline-flex items-center gap-1 text-primary hover:underline",
                  onClick: (c) => c.stopPropagation(),
                  children: [
                    a.jsx("span", {
                      className: "max-w-[120px] truncate text-sm",
                      children: "Voir",
                    }),
                    a.jsx(I, { className: "h-3.5 w-3.5 shrink-0" }),
                  ],
                })
              : a.jsx("span", {
                  className: "text-muted-foreground",
                  children: "-",
                }),
        },
        {
          accessorKey: "likes",
          header: "Likes",
          cell: ({ row: e }) =>
            a.jsx("span", {
              className: "font-mono text-foreground",
              children: l.format(e.original.likes),
            }),
        },
        {
          accessorKey: "comments",
          header: "Commentaires",
          cell: ({ row: e }) =>
            a.jsx("span", {
              className: "font-mono text-muted-foreground",
              children: l.format(e.original.comments),
            }),
        },
        {
          accessorKey: "shares",
          header: "Partages",
          cell: ({ row: e }) =>
            a.jsx("span", {
              className: "font-mono text-muted-foreground",
              children: l.format(e.original.shares),
            }),
        },
        {
          accessorKey: "saves",
          header: "Saves",
          cell: ({ row: e }) =>
            a.jsx("span", {
              className: "font-mono text-muted-foreground",
              children: l.format(e.original.saves),
            }),
        },
        {
          accessorKey: "reach",
          header: "Portée",
          cell: ({ row: e }) =>
            a.jsx("span", {
              className: "font-mono text-muted-foreground",
              children: l.format(e.original.reach),
            }),
        },
        {
          accessorKey: "impressions",
          header: "Impressions",
          cell: ({ row: e }) =>
            a.jsx("span", {
              className: "font-mono text-muted-foreground",
              children: l.format(e.original.impressions),
            }),
        },
        {
          accessorKey: "engagement_rate",
          header: "Engagement",
          cell: ({ row: e }) =>
            a.jsx("span", {
              className: "font-mono font-medium text-foreground",
              children: v(Number(e.original.engagement_rate)),
            }),
        },
        {
          accessorKey: "posted_at",
          header: "Date",
          cell: ({ row: e }) =>
            a.jsx("span", {
              className: "whitespace-nowrap text-xs text-muted-foreground",
              children: e.original.posted_at ? j(e.original.posted_at) : "-",
            }),
        },
      ],
      [],
    );
  return t
    ? a.jsx("div", {
        className: "space-y-3",
        children: Array.from({ length: 5 }).map((e, c) =>
          a.jsx(w, { className: "h-12 w-full" }, c),
        ),
      })
    : !s || s.length === 0
      ? a.jsx(N, {
          icon: a.jsx(F, { className: "h-6 w-6" }),
          title: "Aucune statistique de publication",
          description:
            "Les statistiques apparaîtront ici une fois les données synchronisées.",
        })
      : a.jsx(_, { columns: n, data: s, pagination: !1 });
}
export { U as I, $ as a, R as b, M as c, T as d, L as u };
