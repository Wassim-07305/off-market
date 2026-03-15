import { u as p, a as y, b as _, j as o } from "./vendor-query-sBpsl8Kt.js";
import { s as u, h, b as x, S as C } from "./index-DY9GA2La.js";
import { t as i } from "./vendor-ui-DDdrexJZ.js";
import { I as f, n as q } from "./constants-IBlSVYu1.js";
import { r as v } from "./vendor-react-Cci7g3Cb.js";
import { D as j } from "./data-table-BDFYi4Le.js";
import { B as K } from "./badge-CFrXqKTx.js";
import { E as S } from "./empty-state-BFSeK4Tv.js";
function R(s = {}) {
  const { page: a = 1, ...r } = s,
    e = (a - 1) * f,
    l = e + f - 1;
  return p({
    queryKey: ["closer-calls", s],
    queryFn: async () => {
      let t = u
        .from("closer_calls")
        .select(
          "*, client:clients(id, name), lead:leads(id, name), closer_profile:profiles!closer_calls_closer_id_fkey(id, full_name, avatar_url)",
          { count: "exact" },
        )
        .order("date", { ascending: !1 })
        .range(e, l);
      (r.client_id && (t = t.eq("client_id", r.client_id)),
        r.status && (t = t.eq("status", r.status)),
        r.date_from && (t = t.gte("date", r.date_from)),
        r.date_to && (t = t.lte("date", r.date_to)));
      const { data: n, error: c, count: d } = await t;
      if (c) throw c;
      return { data: n, count: d ?? 0 };
    },
  });
}
function B(s) {
  return p({
    queryKey: ["closer-call-stats", s],
    queryFn: async () => {
      let a = u.from("closer_calls").select("status, revenue");
      s && (a = a.eq("client_id", s));
      const { data: r, error: e } = await a;
      if (e) throw e;
      const l = r,
        t = l.length,
        n = l.filter((m) => m.status === "closé"),
        c = n.reduce((m, g) => m + Number(g.revenue), 0),
        d = t > 0 ? (n.length / t) * 100 : 0;
      return {
        total: t,
        closed: n.length,
        nonClosed: t - n.length,
        caGenere: c,
        tauxClosing: d,
      };
    },
  });
}
function F() {
  const s = y();
  return _({
    mutationFn: async (a) => {
      const { data: r, error: e } = await u
        .from("closer_calls")
        .insert(a)
        .select()
        .single();
      if (e) throw e;
      return r;
    },
    onSuccess: () => {
      (s.invalidateQueries({ queryKey: ["closer-calls"] }),
        s.invalidateQueries({ queryKey: ["closer-call-stats"] }),
        s.invalidateQueries({ queryKey: ["dashboard-stats"] }),
        i.success("Appel closer créé"));
    },
    onError: (a) => {
      i.error(`Erreur: ${a.message}`);
    },
  });
}
function G() {
  const s = y();
  return _({
    mutationFn: async ({ id: a, ...r }) => {
      const { data: e, error: l } = await u
        .from("closer_calls")
        .update(r)
        .eq("id", a)
        .select()
        .single();
      if (l) throw l;
      return e;
    },
    onSuccess: () => {
      (s.invalidateQueries({ queryKey: ["closer-calls"] }),
        s.invalidateQueries({ queryKey: ["closer-call-stats"] }),
        s.invalidateQueries({ queryKey: ["dashboard-stats"] }),
        i.success("Appel mis à jour"));
    },
    onError: (a) => {
      i.error(`Erreur: ${a.message}`);
    },
  });
}
const E = { closé: "success", non_closé: "destructive" };
function M({ data: s, isLoading: a }) {
  const r = v.useMemo(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row: e }) =>
          o.jsx("span", {
            className: "whitespace-nowrap text-xs text-muted-foreground",
            children: h(e.original.date),
          }),
      },
      {
        accessorKey: "client.name",
        header: "Client",
        cell: ({ row: e }) =>
          o.jsx("span", {
            className: "font-medium text-foreground",
            children: e.original.client?.name ?? "-",
          }),
      },
      {
        accessorKey: "lead.name",
        header: "Lead",
        cell: ({ row: e }) =>
          o.jsx("span", {
            className: "text-muted-foreground",
            children: e.original.lead?.name ?? "-",
          }),
      },
      {
        accessorKey: "closer_profile.full_name",
        header: "Closer",
        cell: ({ row: e }) =>
          o.jsx("span", {
            className: "text-muted-foreground",
            children: e.original.closer_profile?.full_name ?? "-",
          }),
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row: e }) => {
          const l = e.original.status;
          return o.jsx(K, {
            variant: E[l] ?? "secondary",
            children: q[l] ?? l,
          });
        },
      },
      {
        accessorKey: "revenue",
        header: "Revenu",
        cell: ({ row: e }) =>
          o.jsx("span", {
            className: "font-mono font-medium text-foreground",
            children: x(Number(e.original.revenue)),
          }),
      },
      {
        accessorKey: "nombre_paiements",
        header: "Paiements",
        cell: ({ row: e }) =>
          o.jsxs("span", {
            className: "text-muted-foreground",
            children: [e.original.nombre_paiements, "x"],
          }),
      },
    ],
    [],
  );
  return a
    ? o.jsx("div", {
        className: "space-y-3",
        children: Array.from({ length: 5 }).map((e, l) =>
          o.jsx(C, { className: "h-12 w-full" }, l),
        ),
      })
    : s.length === 0
      ? o.jsx(S, {
          title: "Aucun appel closer",
          description: "Ajoutez votre premier appel closer.",
        })
      : o.jsx(j, { columns: r, data: s, pagination: !1 });
}
export { M as C, B as a, F as b, G as c, R as u };
