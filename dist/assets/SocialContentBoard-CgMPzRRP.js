import { u as N, a as v, b as C, j as t } from "./vendor-query-sBpsl8Kt.js";
import { s as f, S as b, c as m, f as _ } from "./index-DY9GA2La.js";
import { t as x, an as A } from "./vendor-ui-DDdrexJZ.js";
import { r as D } from "./vendor-react-Cci7g3Cb.js";
import {
  b as L,
  c as M,
  D as R,
  d as B,
  e as I,
  P as K,
  a as Q,
  S as F,
  v as U,
  u as P,
  C as V,
} from "./vendor-dnd-DrANF9GG.js";
import { C as $, d as k } from "./card-Dkj99_H3.js";
import { B as w } from "./badge-CFrXqKTx.js";
import { S, o as G, q, s as E, r as Y } from "./constants-IBlSVYu1.js";
import { f as O } from "./vendor-utils-DoLlG-6J.js";
function ie(e = {}) {
  return N({
    queryKey: ["social-content", e],
    queryFn: async () => {
      let s = f
        .from("social_content")
        .select("*, client:clients(id, name)")
        .order("sort_order", { ascending: !0 })
        .order("created_at", { ascending: !1 });
      (e.client_id && (s = s.eq("client_id", e.client_id)),
        e.status && (s = s.eq("status", e.status)),
        e.format && (s = s.eq("format", e.format)));
      const { data: o, error: a } = await s;
      if (a) throw a;
      return o;
    },
  });
}
function le(e) {
  return N({
    queryKey: ["social-content-stats", e],
    queryFn: async () => {
      let s = f.from("social_content").select("status, format, is_validated");
      e && (s = s.eq("client_id", e));
      const { data: o, error: a } = await s;
      if (a) throw a;
      const n = o,
        l = n.length,
        c = n.filter((d) => d.status === "publié").length,
        i = n.filter((d) => d.status === "en_cours").length,
        p = n.filter((d) => d.is_validated).length;
      return { total: l, publie: c, enCours: i, valide: p };
    },
  });
}
function ce() {
  const e = v();
  return C({
    mutationFn: async (s) => {
      const { data: o, error: a } = await f
        .from("social_content")
        .insert(s)
        .select()
        .single();
      if (a) throw a;
      return o;
    },
    onSuccess: () => {
      (e.invalidateQueries({ queryKey: ["social-content"] }),
        e.invalidateQueries({ queryKey: ["social-content-stats"] }),
        x.success("Contenu créé"));
    },
    onError: (s) => {
      x.error(`Erreur: ${s.message}`);
    },
  });
}
function de() {
  const e = v();
  return C({
    mutationFn: async ({ id: s, ...o }) => {
      const { data: a, error: n } = await f
        .from("social_content")
        .update(o)
        .eq("id", s)
        .select()
        .single();
      if (n) throw n;
      return a;
    },
    onSuccess: () => {
      (e.invalidateQueries({ queryKey: ["social-content"] }),
        e.invalidateQueries({ queryKey: ["social-content-stats"] }),
        x.success("Contenu mis à jour"));
    },
    onError: (s) => {
      x.error(`Erreur: ${s.message}`);
    },
  });
}
const z = {
  idée: "border-t-slate-400",
  a_tourner: "border-t-amber-500",
  en_cours: "border-t-blue-500",
  publié: "border-t-emerald-500",
  reporté: "border-t-orange-500",
};
function ue({ data: e, isLoading: s, onStatusChange: o }) {
  const [a, n] = D.useState(null),
    l = L(M(K, { activationConstraint: { distance: 8 } }));
  if (s)
    return t.jsx("div", {
      className: "flex gap-4 overflow-x-auto pb-4",
      children: Array.from({ length: 5 }).map((r, u) =>
        t.jsxs(
          "div",
          {
            className: "min-w-[280px] flex-1 space-y-3",
            children: [
              t.jsx(b, { className: "h-8 w-full rounded-lg" }),
              t.jsx(b, { className: "h-32 w-full rounded-lg" }),
              t.jsx(b, { className: "h-32 w-full rounded-lg" }),
            ],
          },
          u,
        ),
      ),
    });
  const c = S.map((r) => ({
      id: r,
      label: G[r],
      items: e.filter((u) => u.status === r),
      borderColor: z[r],
    })),
    i = a ? e.find((r) => r.id === a) : null,
    p = (r) => {
      n(r.active.id);
    },
    d = (r) => {
      const { active: u, over: g } = r;
      if ((n(null), !g || !o)) return;
      const j = u.id,
        h = g.id;
      if (S.includes(h)) {
        const y = e.find((T) => T.id === j);
        y && y.status !== h && o(j, h);
      }
    };
  return t.jsxs(R, {
    sensors: l,
    collisionDetection: B,
    onDragStart: p,
    onDragEnd: d,
    children: [
      t.jsx("div", {
        className: "flex gap-4 overflow-x-auto pb-4",
        children: c.map((r) =>
          t.jsx(
            H,
            {
              id: r.id,
              label: r.label,
              count: r.items.length,
              borderColor: r.borderColor,
              items: r.items,
            },
            r.id,
          ),
        ),
      }),
      t.jsx(I, {
        children: i
          ? t.jsx("div", {
              className: "rotate-2 opacity-90",
              children: t.jsx(W, { item: i }),
            })
          : null,
      }),
    ],
  });
}
function H({ id: e, label: s, count: o, borderColor: a, items: n }) {
  const { setNodeRef: l, isOver: c } = Q({ id: e });
  return t.jsxs("div", {
    ref: l,
    className: m(
      "flex min-w-[280px] flex-1 flex-col rounded-2xl border border-border/40 bg-muted/30 transition-colors",
      "border-t-[3px]",
      a,
      c && "bg-primary/[0.03] border-primary/20",
    ),
    children: [
      t.jsxs("div", {
        className: "flex items-center justify-between px-4 py-3",
        children: [
          t.jsx("span", {
            className: "text-sm font-semibold text-foreground",
            children: s,
          }),
          t.jsx("span", {
            className:
              "flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground",
            children: o,
          }),
        ],
      }),
      t.jsxs("div", {
        className: "flex-1 space-y-2 px-3 pb-3 min-h-[120px]",
        children: [
          t.jsx(F, {
            items: n.map((i) => i.id),
            strategy: U,
            children: n.map((i) => t.jsx(J, { item: i }, i.id)),
          }),
          n.length === 0 &&
            t.jsx("div", {
              className:
                "flex h-20 items-center justify-center rounded-xl border border-dashed border-border/40 text-xs text-muted-foreground",
              children: "Aucun contenu",
            }),
        ],
      }),
    ],
  });
}
function J({ item: e }) {
  const {
      attributes: s,
      listeners: o,
      setNodeRef: a,
      transform: n,
      transition: l,
      isDragging: c,
    } = P({ id: e.id }),
    i = { transform: V.Transform.toString(n), transition: l };
  return t.jsx("div", {
    ref: a,
    style: i,
    className: m(
      "group rounded-xl border border-border/40 bg-white p-3 shadow-sm transition-all",
      "hover:shadow-md hover:border-border/60",
      c && "opacity-50 shadow-lg",
    ),
    children: t.jsxs("div", {
      className: "flex items-start gap-2",
      children: [
        t.jsx("button", {
          ...s,
          ...o,
          className:
            "mt-0.5 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing",
          children: t.jsx(A, { className: "h-4 w-4" }),
        }),
        t.jsxs("div", {
          className: "min-w-0 flex-1",
          children: [
            t.jsx("p", {
              className: "text-sm font-medium text-foreground line-clamp-2",
              children: e.title,
            }),
            t.jsxs("div", {
              className: "mt-2 flex flex-wrap items-center gap-1.5",
              children: [
                e.format &&
                  t.jsx(w, {
                    className: m(E[e.status]),
                    children: q[e.format],
                  }),
                e.video_type &&
                  t.jsx("span", {
                    className: "text-xs text-muted-foreground",
                    children: Y[e.video_type],
                  }),
              ],
            }),
            t.jsxs("div", {
              className: "mt-2 flex items-center justify-between",
              children: [
                e.client &&
                  t.jsx("span", {
                    className:
                      "text-xs text-muted-foreground truncate max-w-[140px]",
                    children: e.client.name,
                  }),
                e.planned_date &&
                  t.jsx("span", {
                    className: "text-xs text-muted-foreground",
                    children: O(new Date(e.planned_date), "dd MMM", {
                      locale: _,
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
function W({ item: e }) {
  return t.jsx($, {
    className: "w-[260px]",
    children: t.jsxs(k, {
      className: "p-3",
      children: [
        t.jsx("p", {
          className: "text-sm font-medium text-foreground line-clamp-2",
          children: e.title,
        }),
        t.jsx("div", {
          className: "mt-2 flex flex-wrap items-center gap-1.5",
          children:
            e.format &&
            t.jsx(w, { className: m(E[e.status]), children: q[e.format] }),
        }),
        t.jsxs("div", {
          className: "mt-2 flex items-center justify-between",
          children: [
            e.client &&
              t.jsx("span", {
                className:
                  "text-xs text-muted-foreground truncate max-w-[140px]",
                children: e.client.name,
              }),
            e.planned_date &&
              t.jsx("span", {
                className: "text-xs text-muted-foreground",
                children: O(new Date(e.planned_date), "dd MMM", { locale: _ }),
              }),
          ],
        }),
      ],
    }),
  });
}
export { ue as S, le as a, ce as b, de as c, ie as u };
