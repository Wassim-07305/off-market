import { u as K, a as C, b as k, j as e } from "./vendor-query-sBpsl8Kt.js";
import { r as h, k as le, f as de } from "./vendor-react-Cci7g3Cb.js";
import {
  P as B,
  b as ce,
  c as ue,
  F as me,
} from "./FormationFormModal-BKpgB3Tb.js";
import {
  s as f,
  j as R,
  c as M,
  S,
  g as fe,
  d as xe,
} from "./index-DY9GA2La.js";
import {
  t as b,
  V as pe,
  aC as he,
  f as ge,
  al as U,
  a1 as z,
  $ as je,
  z as Z,
  ad as ye,
  U as be,
} from "./vendor-ui-DDdrexJZ.js";
import { u as Y } from "./vendor-forms-Ct2mZ2NL.js";
import { a as G } from "./zod-COY_rf8d.js";
import { a as ve, m as we } from "./forms-zLivl21i.js";
import { M as H } from "./modal-DBBZDXoW.js";
import { I as E } from "./input-B9vrc6Q3.js";
import { T as Ne } from "./textarea-D7qrlVHg.js";
import { B as N } from "./button-DlbP8VPc.js";
import { S as _e } from "./select-E7QvXrZc.js";
import { u as Se } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
function Me(r) {
  return K({
    queryKey: ["modules", r],
    queryFn: async () => {
      if (!r) return [];
      const { data: t, error: s } = await f
        .from("formation_modules")
        .select("*")
        .eq("formation_id", r)
        .order("sort_order", { ascending: !0 });
      if (s) throw s;
      return t;
    },
    enabled: !!r,
  });
}
function Ce() {
  const r = C();
  return k({
    mutationFn: async (t) => {
      const { data: s, error: o } = await f
        .from("formation_modules")
        .insert(t)
        .select()
        .single();
      if (o) throw o;
      return s;
    },
    onSuccess: (t, s) => {
      (r.invalidateQueries({ queryKey: ["modules", s.formation_id] }),
        b.success("Module créé"));
    },
    onError: (t) => {
      b.error(`Erreur: ${t.message}`);
    },
  });
}
function ke() {
  const r = C();
  return k({
    mutationFn: async ({ id: t, ...s }) => {
      const { data: o, error: n } = await f
        .from("formation_modules")
        .update(s)
        .eq("id", t)
        .select()
        .single();
      if (n) throw n;
      return o;
    },
    onSuccess: (t) => {
      (r.invalidateQueries({ queryKey: ["modules", t.formation_id] }),
        b.success("Module mis à jour"));
    },
    onError: (t) => {
      b.error(`Erreur: ${t.message}`);
    },
  });
}
function Ie() {
  const r = C();
  return k({
    mutationFn: async ({ id: t, formationId: s }) => {
      const { error: o } = await f
        .from("formation_modules")
        .delete()
        .eq("id", t);
      if (o) throw o;
      return s;
    },
    onSuccess: (t) => {
      (r.invalidateQueries({ queryKey: ["modules", t] }),
        b.success("Module supprimé"));
    },
    onError: (t) => {
      b.error(`Erreur: ${t.message}`);
    },
  });
}
function qe(r) {
  return K({
    queryKey: ["module-items", "all", r],
    queryFn: async () => {
      if (r.length === 0) return [];
      const { data: t, error: s } = await f
        .from("module_items")
        .select("*")
        .in("module_id", r)
        .order("sort_order", { ascending: !0 });
      if (s) throw s;
      return t;
    },
    enabled: r.length > 0,
  });
}
function Fe() {
  const r = C();
  return k({
    mutationFn: async (t) => {
      const { data: s, error: o } = await f
        .from("module_items")
        .insert(t)
        .select()
        .single();
      if (o) throw o;
      return s;
    },
    onSuccess: () => {
      (r.invalidateQueries({ queryKey: ["module-items"] }),
        b.success("Item créé"));
    },
    onError: (t) => {
      b.error(`Erreur: ${t.message}`);
    },
  });
}
function Ee() {
  const r = C();
  return k({
    mutationFn: async ({ id: t, ...s }) => {
      const { data: o, error: n } = await f
        .from("module_items")
        .update(s)
        .eq("id", t)
        .select()
        .single();
      if (n) throw n;
      return o;
    },
    onSuccess: () => {
      (r.invalidateQueries({ queryKey: ["module-items"] }),
        b.success("Item mis à jour"));
    },
    onError: (t) => {
      b.error(`Erreur: ${t.message}`);
    },
  });
}
function Ae() {
  const r = C();
  return k({
    mutationFn: async (t) => {
      const { error: s } = await f.from("module_items").delete().eq("id", t);
      if (s) throw s;
    },
    onSuccess: () => {
      (r.invalidateQueries({ queryKey: ["module-items"] }),
        b.success("Item supprimé"));
    },
    onError: (t) => {
      b.error(`Erreur: ${t.message}`);
    },
  });
}
function Pe(r) {
  const s = R((o) => o.user?.id);
  return K({
    queryKey: ["item-completions", s],
    queryFn: async () => {
      if (!s) return [];
      const { data: o, error: n } = await f
        .from("item_completions")
        .select("*")
        .eq("user_id", s);
      if (n) throw n;
      return o;
    },
    enabled: !!s,
  });
}
function $e() {
  const r = C(),
    t = R((s) => s.user?.id);
  return k({
    mutationFn: async ({ itemId: s, completed: o }) => {
      if (!t) throw new Error("Non authentifié");
      if (o) {
        const { error: n } = await f
          .from("item_completions")
          .insert({ item_id: s, user_id: t });
        if (n) throw n;
      } else {
        const { error: n } = await f
          .from("item_completions")
          .delete()
          .eq("item_id", s)
          .eq("user_id", t);
        if (n) throw n;
      }
    },
    onSuccess: () => {
      (r.invalidateQueries({ queryKey: ["item-completions"] }),
        r.invalidateQueries({ queryKey: ["formation-progress"] }));
    },
  });
}
function De({
  item: r,
  isCompleted: t,
  isAdmin: s,
  onToggleComplete: o,
  onEdit: n,
  onDelete: u,
  onClick: i,
}) {
  return e.jsxs("div", {
    className: M(
      "group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
      i && "cursor-pointer hover:bg-muted/50",
    ),
    children: [
      o &&
        e.jsx("button", {
          type: "button",
          onClick: (c) => {
            (c.stopPropagation(), o(!t));
          },
          className: M(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all",
            t
              ? "border-green-500 bg-green-500 text-white"
              : "border-border hover:border-green-400",
          ),
          children: t && e.jsx(pe, { className: "h-3 w-3" }),
        }),
      e.jsx("div", {
        className: M(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          r.type === "video" ? "bg-red-50" : "bg-blue-50",
        ),
        children:
          r.type === "video"
            ? e.jsx(he, { className: "h-4 w-4 text-red-500" })
            : e.jsx(ge, { className: "h-4 w-4 text-blue-500" }),
      }),
      e.jsxs("div", {
        className: "min-w-0 flex-1",
        onClick: i,
        children: [
          e.jsx("p", {
            className: M(
              "text-sm font-medium text-foreground",
              t && "line-through opacity-60",
            ),
            children: r.title,
          }),
          r.duration &&
            e.jsxs("p", {
              className: "text-xs text-muted-foreground",
              children: [r.duration, " min"],
            }),
        ],
      }),
      s &&
        e.jsxs("div", {
          className:
            "flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100",
          children: [
            n &&
              e.jsx("button", {
                type: "button",
                onClick: (c) => {
                  (c.stopPropagation(), n());
                },
                className:
                  "rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground",
                children: e.jsx(U, { className: "h-3.5 w-3.5" }),
              }),
            u &&
              e.jsx("button", {
                type: "button",
                onClick: (c) => {
                  (c.stopPropagation(), u());
                },
                className:
                  "rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive",
                children: e.jsx(z, { className: "h-3.5 w-3.5" }),
              }),
          ],
        }),
    ],
  });
}
function Te({
  module: r,
  items: t,
  completions: s = [],
  isAdmin: o,
  isProspect: n,
  onToggleComplete: u,
  onItemClick: i,
  onEditModule: c,
  onDeleteModule: g,
  onAddItem: w,
  onEditItem: m,
  onDeleteItem: j,
  defaultOpen: v = !1,
}) {
  const [x, a] = h.useState(v),
    p = new Set(s.map((l) => l.item_id)),
    y = t.filter((l) => p.has(l.id)).length;
  return e.jsxs("div", {
    className: "rounded-xl border border-border bg-white overflow-hidden",
    children: [
      e.jsxs("button", {
        type: "button",
        onClick: () => a(!x),
        className:
          "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30",
        children: [
          e.jsx(je, {
            className: M(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              x && "rotate-180",
            ),
          }),
          e.jsxs("div", {
            className: "min-w-0 flex-1",
            children: [
              e.jsx("h3", {
                className: "text-sm font-semibold text-foreground",
                children: r.title,
              }),
              r.description &&
                e.jsx("p", {
                  className:
                    "mt-0.5 text-xs text-muted-foreground line-clamp-1",
                  children: r.description,
                }),
            ],
          }),
          e.jsx("span", {
            className: "shrink-0 text-xs text-muted-foreground",
            children: n ? `${y}/${t.length}` : `${t.length} items`,
          }),
          o &&
            e.jsxs("div", {
              className: "flex shrink-0 items-center gap-1",
              onClick: (l) => l.stopPropagation(),
              children: [
                w &&
                  e.jsx("button", {
                    type: "button",
                    onClick: w,
                    className:
                      "rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground",
                    children: e.jsx(Z, { className: "h-3.5 w-3.5" }),
                  }),
                c &&
                  e.jsx("button", {
                    type: "button",
                    onClick: c,
                    className:
                      "rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground",
                    children: e.jsx(U, { className: "h-3.5 w-3.5" }),
                  }),
                g &&
                  e.jsx("button", {
                    type: "button",
                    onClick: g,
                    className:
                      "rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive",
                    children: e.jsx(z, { className: "h-3.5 w-3.5" }),
                  }),
              ],
            }),
        ],
      }),
      x &&
        e.jsx("div", {
          className: "border-t border-border px-2 py-1",
          children:
            t.length === 0
              ? e.jsx("p", {
                  className:
                    "px-3 py-4 text-center text-xs text-muted-foreground",
                  children: "Aucun item dans ce module",
                })
              : t.map((l) =>
                  e.jsx(
                    De,
                    {
                      item: l,
                      isCompleted: p.has(l.id),
                      isAdmin: o,
                      onToggleComplete: n && u ? (_) => u(l.id, _) : void 0,
                      onEdit: o && m ? () => m(l) : void 0,
                      onDelete: o && j ? () => j(l) : void 0,
                      onClick: i ? () => i(l) : void 0,
                    },
                    l.id,
                  ),
                ),
        }),
    ],
  });
}
function Ke({
  open: r,
  onClose: t,
  formationId: s,
  module: o,
  nextSortOrder: n = 0,
}) {
  const u = !!o,
    i = Ce(),
    c = ke(),
    {
      register: g,
      handleSubmit: w,
      reset: m,
      formState: { errors: j, isSubmitting: v },
    } = Y({
      resolver: G(ve),
      defaultValues: { formation_id: s, title: "", description: "" },
    });
  h.useEffect(() => {
    m(
      o
        ? { formation_id: s, title: o.title, description: o.description ?? "" }
        : { formation_id: s, title: "", description: "" },
    );
  }, [o, s, m]);
  const x = async (a) => {
    (u && o
      ? await c.mutateAsync({
          id: o.id,
          title: a.title,
          description: a.description || void 0,
        })
      : await i.mutateAsync({
          formation_id: s,
          title: a.title,
          description: a.description || void 0,
          sort_order: n,
        }),
      t());
  };
  return e.jsx(H, {
    open: r,
    onClose: t,
    title: u ? "Modifier le module" : "Nouveau module",
    size: "md",
    children: e.jsxs("form", {
      onSubmit: w(x),
      className: "space-y-4",
      children: [
        e.jsx(E, {
          label: "Titre du module",
          ...g("title"),
          error: j.title?.message,
        }),
        e.jsx(Ne, {
          label: "Description",
          ...g("description"),
          error: j.description?.message,
        }),
        e.jsxs("div", {
          className: "flex justify-end gap-3 pt-2",
          children: [
            e.jsx(N, {
              type: "button",
              variant: "secondary",
              onClick: t,
              children: "Annuler",
            }),
            e.jsx(N, {
              type: "submit",
              loading: v,
              children: u ? "Mettre à jour" : "Créer",
            }),
          ],
        }),
      ],
    }),
  });
}
const Ue = [
  { value: "video", label: "Vidéo" },
  { value: "document", label: "Document" },
];
function ze({
  open: r,
  onClose: t,
  moduleId: s,
  item: o,
  nextSortOrder: n = 0,
}) {
  const u = !!o,
    i = Fe(),
    c = Ee(),
    {
      register: g,
      handleSubmit: w,
      reset: m,
      watch: j,
      setValue: v,
      formState: { errors: x, isSubmitting: a },
    } = Y({
      resolver: G(we),
      defaultValues: {
        module_id: s,
        title: "",
        type: "video",
        url: "",
        duration: void 0,
      },
    }),
    p = j("type");
  h.useEffect(() => {
    m(
      o
        ? {
            module_id: s,
            title: o.title,
            type: o.type,
            url: o.url ?? "",
            duration: o.duration ?? void 0,
          }
        : { module_id: s, title: "", type: "video", url: "", duration: void 0 },
    );
  }, [o, s, m]);
  const y = async (l) => {
    const _ = {
      title: l.title,
      type: l.type,
      url: l.url || void 0,
      duration: l.duration || void 0,
    };
    (u && o
      ? await c.mutateAsync({ id: o.id, ..._ })
      : await i.mutateAsync({ module_id: s, ..._, sort_order: n }),
      t());
  };
  return e.jsx(H, {
    open: r,
    onClose: t,
    title: u ? "Modifier l'item" : "Nouvel item",
    size: "md",
    children: e.jsxs("form", {
      onSubmit: w(y),
      className: "space-y-4",
      children: [
        e.jsx(E, { label: "Titre", ...g("title"), error: x.title?.message }),
        e.jsx(_e, {
          label: "Type",
          options: Ue,
          value: p,
          onChange: (l) => v("type", l),
          error: x.type?.message,
        }),
        e.jsx(E, {
          label: "URL",
          type: "url",
          placeholder:
            p === "video" ? "https://youtube.com/..." : "https://...",
          ...g("url"),
          error: x.url?.message,
        }),
        p === "video" &&
          e.jsx(E, {
            label: "Durée (minutes)",
            type: "number",
            min: "0",
            ...g("duration"),
            error: x.duration?.message,
          }),
        e.jsxs("div", {
          className: "flex justify-end gap-3 pt-2",
          children: [
            e.jsx(N, {
              type: "button",
              variant: "secondary",
              onClick: t,
              children: "Annuler",
            }),
            e.jsx(N, {
              type: "submit",
              loading: a,
              children: u ? "Mettre à jour" : "Créer",
            }),
          ],
        }),
      ],
    }),
  });
}
function Le(r) {
  const t = r.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (t) return `https://www.youtube.com/embed/${t[1]}`;
  const s = r.match(/vimeo\.com\/(\d+)/);
  if (s) return `https://player.vimeo.com/video/${s[1]}`;
  const o = r.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  return o ? `https://www.loom.com/embed/${o[1]}` : null;
}
function Qe({ url: r, className: t }) {
  const s = Le(r);
  return s
    ? e.jsx("div", {
        className: M("aspect-video overflow-hidden rounded-xl", t),
        children: e.jsx("iframe", {
          src: s,
          title: "Video",
          className: "h-full w-full",
          allow:
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          allowFullScreen: !0,
        }),
      })
    : e.jsx("div", {
        className: M(
          "flex items-center justify-center rounded-xl bg-muted p-6",
          t,
        ),
        children: e.jsx("a", {
          href: r,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "text-sm text-blue-600 underline",
          children: "Ouvrir la vidéo",
        }),
      });
}
function Oe({ formationId: r }) {
  const [t, s] = h.useState([]),
    [o, n] = h.useState(!0),
    u = h.useCallback(async () => {
      n(!0);
      const { data: i } = await f
        .from("user_roles")
        .select("user_id")
        .eq("role", "prospect");
      if (!i || i.length === 0) {
        (s([]), n(!1));
        return;
      }
      const c = i.map((a) => a.user_id),
        { data: g } = await f
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", c),
        { data: w } = await f
          .from("formation_modules")
          .select("id")
          .eq("formation_id", r),
        m = (w ?? []).map((a) => a.id);
      let j = 0;
      const v = {};
      if (m.length > 0) {
        const { data: a } = await f
          .from("module_items")
          .select("id")
          .in("module_id", m);
        j = a?.length ?? 0;
        const p = (a ?? []).map((y) => y.id);
        if (p.length > 0) {
          const { data: y } = await f
            .from("item_completions")
            .select("user_id, item_id")
            .in("item_id", p)
            .in("user_id", c);
          for (const l of y ?? []) v[l.user_id] = (v[l.user_id] || 0) + 1;
        }
      }
      const x = (g ?? []).map((a) => ({
        user_id: a.id,
        full_name: a.full_name,
        avatar_url: a.avatar_url,
        total_items: j,
        completed_items: v[a.id] ?? 0,
      }));
      (x.sort((a, p) => {
        const y = a.total_items > 0 ? a.completed_items / a.total_items : 0;
        return (p.total_items > 0 ? p.completed_items / p.total_items : 0) - y;
      }),
        s(x),
        n(!1));
    }, [r]);
  return (
    h.useEffect(() => {
      u();
    }, [u]),
    o
      ? e.jsx("div", {
          className: "space-y-3",
          children: Array.from({ length: 3 }).map((i, c) =>
            e.jsxs(
              "div",
              {
                className: "flex items-center gap-3",
                children: [
                  e.jsx(S, { className: "h-8 w-8 rounded-full" }),
                  e.jsxs("div", {
                    className: "flex-1 space-y-1",
                    children: [
                      e.jsx(S, { className: "h-4 w-32" }),
                      e.jsx(S, { className: "h-2 w-full rounded-full" }),
                    ],
                  }),
                ],
              },
              c,
            ),
          ),
        })
      : t.length === 0
        ? e.jsx("p", {
            className: "py-6 text-center text-sm text-muted-foreground",
            children: "Aucun prospect inscrit",
          })
        : e.jsx("div", {
            className: "space-y-3",
            children: t.map((i) =>
              e.jsxs(
                "div",
                {
                  className:
                    "flex items-center gap-3 rounded-lg border border-border p-3",
                  children: [
                    e.jsx("div", {
                      className:
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700",
                      children: i.avatar_url
                        ? e.jsx("img", {
                            src: i.avatar_url,
                            alt: "",
                            className: "h-8 w-8 rounded-full object-cover",
                          })
                        : fe(i.full_name),
                    }),
                    e.jsxs("div", {
                      className: "min-w-0 flex-1",
                      children: [
                        e.jsx("p", {
                          className:
                            "truncate text-sm font-medium text-foreground",
                          children: i.full_name,
                        }),
                        e.jsx(B, {
                          completed: i.completed_items,
                          total: i.total_items,
                          size: "sm",
                          className: "mt-1",
                        }),
                      ],
                    }),
                    e.jsx("span", {
                      className:
                        "shrink-0 text-xs font-medium text-muted-foreground",
                      children:
                        i.total_items > 0
                          ? `${Math.round((i.completed_items / i.total_items) * 100)}%`
                          : "—",
                    }),
                  ],
                },
                i.user_id,
              ),
            ),
          })
  );
}
function at() {
  Se("Formation");
  const { id: r } = le(),
    t = de(),
    { isAdmin: s, isProspect: o } = xe(),
    { data: n, isLoading: u } = ce(r),
    { data: i, isLoading: c } = Me(r),
    g = (i ?? []).map((d) => d.id),
    { data: w } = qe(g),
    { data: m } = Pe(),
    j = $e(),
    v = ue(),
    x = Ie(),
    a = Ae(),
    [p, y] = h.useState(!1),
    [l, _] = h.useState(!1),
    [J, A] = h.useState(null),
    [W, P] = h.useState(!1),
    [X, $] = h.useState(null),
    [D, L] = h.useState(""),
    [I, Q] = h.useState(null),
    [O, ee] = h.useState(!1);
  if (u || c)
    return e.jsxs("div", {
      className: "space-y-6",
      children: [
        e.jsx(S, { className: "h-8 w-64" }),
        e.jsx(S, { className: "h-4 w-96" }),
        e.jsx(S, { className: "h-48 w-full rounded-xl" }),
        e.jsx(S, { className: "h-12 w-full rounded-xl" }),
        e.jsx(S, { className: "h-12 w-full rounded-xl" }),
      ],
    });
  if (!n)
    return e.jsxs("div", {
      className: "py-12 text-center",
      children: [
        e.jsx("p", {
          className: "text-muted-foreground",
          children: "Formation introuvable.",
        }),
        e.jsx(N, {
          variant: "secondary",
          onClick: () => t("/formations"),
          className: "mt-4",
          children: "Retour aux formations",
        }),
      ],
    });
  const F = w ?? [],
    te = new Set((m ?? []).map((d) => d.item_id)),
    T = F.length,
    V = F.filter((d) => te.has(d.id)).length,
    se = async () => {
      window.confirm(
        "Supprimer cette formation ? Cette action est irréversible.",
      ) && (await v.mutateAsync(n.id), t("/formations"));
    },
    re = async (d) => {
      window.confirm(`Supprimer le module "${d.title}" ?`) &&
        (await x.mutateAsync({ id: d.id, formationId: n.id }));
    },
    oe = async (d) => {
      window.confirm(`Supprimer "${d.title}" ?`) && (await a.mutateAsync(d.id));
    },
    ne = (d) => {
      Q(d);
    };
  return e.jsxs("div", {
    className: "space-y-6",
    children: [
      e.jsxs("div", {
        children: [
          e.jsxs("button", {
            type: "button",
            onClick: () => t("/formations"),
            className:
              "mb-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors",
            children: [
              e.jsx(ye, { className: "h-4 w-4" }),
              "Retour aux formations",
            ],
          }),
          e.jsxs("div", {
            className: "flex items-start justify-between gap-4",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsxs("div", {
                    className: "flex items-center gap-3",
                    children: [
                      e.jsx("h1", {
                        className:
                          "text-xl sm:text-2xl font-bold text-foreground",
                        children: n.title,
                      }),
                      s &&
                        e.jsx("span", {
                          className: `rounded-full px-2.5 py-0.5 text-xs font-medium ${n.is_published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`,
                          children: n.is_published ? "Publié" : "Brouillon",
                        }),
                    ],
                  }),
                  n.description &&
                    e.jsx("p", {
                      className: "mt-1 text-sm text-muted-foreground",
                      children: n.description,
                    }),
                ],
              }),
              s &&
                e.jsxs("div", {
                  className: "flex shrink-0 gap-2",
                  children: [
                    e.jsx(N, {
                      variant: "secondary",
                      size: "sm",
                      onClick: () => ee(!O),
                      icon: e.jsx(be, { className: "h-4 w-4" }),
                      children: "Progression",
                    }),
                    e.jsx(N, {
                      variant: "secondary",
                      size: "sm",
                      onClick: () => y(!0),
                      icon: e.jsx(U, { className: "h-4 w-4" }),
                      children: "Modifier",
                    }),
                    e.jsx(N, {
                      variant: "destructive",
                      size: "sm",
                      onClick: se,
                      icon: e.jsx(z, { className: "h-4 w-4" }),
                      children: "Supprimer",
                    }),
                  ],
                }),
            ],
          }),
        ],
      }),
      o &&
        T > 0 &&
        e.jsxs("div", {
          className: "rounded-xl border border-border bg-white p-4",
          children: [
            e.jsxs("div", {
              className: "flex items-center justify-between mb-2",
              children: [
                e.jsx("span", {
                  className: "text-sm font-medium text-foreground",
                  children: "Votre progression",
                }),
                e.jsxs("span", {
                  className: "text-sm font-semibold text-foreground",
                  children: [Math.round((V / T) * 100), "%"],
                }),
              ],
            }),
            e.jsx(B, { completed: V, total: T, showLabel: !1 }),
          ],
        }),
      s &&
        O &&
        e.jsxs("div", {
          className: "rounded-xl border border-border bg-white p-4",
          children: [
            e.jsx("h2", {
              className: "mb-3 text-sm font-semibold text-foreground",
              children: "Progression des élèves",
            }),
            e.jsx(Oe, { formationId: n.id }),
          ],
        }),
      I &&
        I.type === "video" &&
        I.url &&
        e.jsxs("div", {
          className: "rounded-xl border border-border bg-white p-4",
          children: [
            e.jsxs("div", {
              className: "flex items-center justify-between mb-3",
              children: [
                e.jsx("h2", {
                  className: "text-sm font-semibold text-foreground",
                  children: I.title,
                }),
                e.jsx("button", {
                  type: "button",
                  onClick: () => Q(null),
                  className:
                    "text-xs text-muted-foreground hover:text-foreground",
                  children: "Fermer",
                }),
              ],
            }),
            e.jsx(Qe, { url: I.url }),
          ],
        }),
      e.jsxs("div", {
        className: "space-y-3",
        children: [
          e.jsxs("div", {
            className: "flex items-center justify-between",
            children: [
              e.jsxs("h2", {
                className: "text-base font-semibold text-foreground",
                children: ["Modules (", (i ?? []).length, ")"],
              }),
              s &&
                e.jsx(N, {
                  variant: "secondary",
                  size: "sm",
                  onClick: () => {
                    (A(null), _(!0));
                  },
                  icon: e.jsx(Z, { className: "h-4 w-4" }),
                  children: "Ajouter un module",
                }),
            ],
          }),
          (i ?? []).length === 0
            ? e.jsx("div", {
                className:
                  "rounded-xl border border-border bg-white p-8 text-center",
                children: e.jsx("p", {
                  className: "text-sm text-muted-foreground",
                  children: "Aucun module dans cette formation.",
                }),
              })
            : (i ?? []).map((d, ie) =>
                e.jsx(
                  Te,
                  {
                    module: d,
                    items: F.filter((q) => q.module_id === d.id),
                    completions: m ?? [],
                    isAdmin: s,
                    isProspect: o,
                    defaultOpen: ie === 0,
                    onToggleComplete: (q, ae) =>
                      j.mutate({ itemId: q, completed: ae }),
                    onItemClick: ne,
                    onEditModule: () => {
                      (A(d), _(!0));
                    },
                    onDeleteModule: () => re(d),
                    onAddItem: () => {
                      ($(null), L(d.id), P(!0));
                    },
                    onEditItem: (q) => {
                      ($(q), L(d.id), P(!0));
                    },
                    onDeleteItem: oe,
                  },
                  d.id,
                ),
              ),
        ],
      }),
      e.jsx(me, { open: p, onClose: () => y(!1), formation: n }),
      r &&
        e.jsx(Ke, {
          open: l,
          onClose: () => {
            (_(!1), A(null));
          },
          formationId: r,
          module: J,
          nextSortOrder: (i ?? []).length,
        }),
      D &&
        e.jsx(ze, {
          open: W,
          onClose: () => {
            (P(!1), $(null));
          },
          moduleId: D,
          item: X,
          nextSortOrder: F.filter((d) => d.module_id === D).length,
        }),
    ],
  });
}
export { at as default };
