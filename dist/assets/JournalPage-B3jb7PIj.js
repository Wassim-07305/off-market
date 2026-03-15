import { u as R, a as P, b as T, j as e } from "./vendor-query-sBpsl8Kt.js";
import { r as x } from "./vendor-react-Cci7g3Cb.js";
import {
  s as N,
  c as k,
  S as A,
  h as G,
  t as U,
  v as F,
  b as W,
  f as X,
} from "./index-DY9GA2La.js";
import {
  t as b,
  z as Y,
  l as Z,
  al as ee,
  a1 as te,
  aJ as se,
  aL as re,
} from "./vendor-ui-DDdrexJZ.js";
import { I as v } from "./constants-IBlSVYu1.js";
import {
  u as oe,
  o as ae,
  s as C,
  l as S,
  n as ne,
  b as le,
} from "./vendor-forms-Ct2mZ2NL.js";
import { a as ie } from "./zod-COY_rf8d.js";
import { M as ce } from "./modal-DBBZDXoW.js";
import { I as L } from "./input-B9vrc6Q3.js";
import { T as de } from "./textarea-D7qrlVHg.js";
import { B as M } from "./button-DlbP8VPc.js";
import { B as ue } from "./badge-CFrXqKTx.js";
import { P as z } from "./pagination-DHo4QjB2.js";
import { E as B } from "./empty-state-BFSeK4Tv.js";
import { C as me } from "./confirm-dialog-BnX-zJNl.js";
import { T as xe, a as $ } from "./tabs-oT6f7FFv.js";
import { u as pe } from "./usePageTitle-I7G4QvKX.js";
import { f as ge } from "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
function fe(o = {}) {
  const { search: s, dateFrom: r, dateTo: a, page: l = 1 } = o,
    i = (l - 1) * v,
    d = i + v - 1;
  return R({
    queryKey: ["journal-entries", o],
    queryFn: async () => {
      let n = N.from("journal_entries")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: !1 })
        .range(i, d);
      (s && (n = n.or(`title.ilike.%${s}%,content.ilike.%${s}%`)),
        r && (n = n.gte("created_at", r)),
        a && (n = n.lte("created_at", a)));
      const { data: m, error: p, count: g } = await n;
      if (p) throw p;
      return { data: m, count: g ?? 0 };
    },
  });
}
function he() {
  const o = P();
  return T({
    mutationFn: async (s) => {
      const { data: r, error: a } = await N.from("journal_entries")
        .insert(s)
        .select()
        .single();
      if (a) throw a;
      return r;
    },
    onSuccess: () => {
      (o.invalidateQueries({ queryKey: ["journal-entries"] }),
        b.success("Entrée créée avec succès"));
    },
    onError: (s) => {
      b.error(`Erreur: ${s.message}`);
    },
  });
}
function je() {
  const o = P();
  return T({
    mutationFn: async ({ id: s, ...r }) => {
      const { data: a, error: l } = await N.from("journal_entries")
        .update(r)
        .eq("id", s)
        .select()
        .single();
      if (l) throw l;
      return a;
    },
    onSuccess: (s) => {
      (o.invalidateQueries({ queryKey: ["journal-entries"] }),
        o.setQueryData(["journal-entries", s.id], s),
        b.success("Entrée mise à jour"));
    },
    onError: (s) => {
      b.error(`Erreur: ${s.message}`);
    },
  });
}
function be() {
  const o = P();
  return T({
    mutationFn: async (s) => {
      const { error: r } = await N.from("journal_entries").delete().eq("id", s);
      if (r) throw r;
    },
    onSuccess: () => {
      (o.invalidateQueries({ queryKey: ["journal-entries"] }),
        b.success("Entrée supprimée"));
    },
    onError: (s) => {
      b.error(`Erreur: ${s.message}`);
    },
  });
}
function ve(o = {}) {
  const { page: s = 1 } = o,
    r = (s - 1) * v,
    a = r + v - 1;
  return R({
    queryKey: ["weekly-checkins", o],
    queryFn: async () => {
      const {
        data: l,
        error: i,
        count: d,
      } = await N.from("weekly_checkins")
        .select("*", { count: "exact" })
        .order("week_start", { ascending: !1 })
        .range(r, a);
      if (i) throw i;
      return { data: l, count: d ?? 0 };
    },
  });
}
const ye = ["😢", "😕", "😐", "🙂", "😊"],
  Ne = ae({
    title: C().optional().or(S("")),
    content: C().optional().or(S("")),
    mood: ne().min(1).max(5).nullable(),
    tags: C().optional().or(S("")),
    is_private: le(),
  });
function we({ open: o, onClose: s, editItem: r }) {
  const a = he(),
    l = je(),
    i = !!r,
    {
      register: d,
      handleSubmit: n,
      reset: m,
      setValue: p,
      watch: g,
      formState: { errors: f },
    } = oe({
      resolver: ie(Ne),
      defaultValues: {
        title: "",
        content: "",
        mood: null,
        tags: "",
        is_private: !1,
      },
    }),
    h = g("mood");
  x.useEffect(() => {
    m(
      r
        ? {
            title: r.title ?? "",
            content: r.content ?? "",
            mood: r.mood ?? null,
            tags: r.tags?.join(", ") ?? "",
            is_private: r.is_private,
          }
        : { title: "", content: "", mood: null, tags: "", is_private: !1 },
    );
  }, [r, m]);
  const E = (c) => {
      const y = c.tags
          ? c.tags
              .split(",")
              .map((w) => w.trim())
              .filter(Boolean)
          : [],
        u = {
          title: c.title || void 0,
          content: c.content || void 0,
          mood: c.mood ?? void 0,
          tags: y,
          is_private: c.is_private,
        };
      i
        ? l.mutate(
            { id: r.id, ...u },
            {
              onSuccess: () => {
                (m(), s());
              },
            },
          )
        : a.mutate(u, {
            onSuccess: () => {
              (m(), s());
            },
          });
    },
    _ = a.isPending || l.isPending;
  return e.jsx(ce, {
    open: o,
    onClose: s,
    title: i ? "Modifier l'entrée" : "Nouvelle entrée",
    description: i
      ? "Mettre à jour votre entrée de journal."
      : "Notez vos pensées, progrès et réflexions.",
    size: "md",
    children: e.jsxs("form", {
      onSubmit: n(E),
      className: "space-y-4",
      children: [
        e.jsx(L, {
          label: "Titre",
          placeholder: "Titre de l'entrée (optionnel)",
          ...d("title"),
          error: f.title?.message,
        }),
        e.jsx(de, {
          label: "Contenu",
          placeholder: "Écrivez vos pensées, progrès, réflexions...",
          rows: 6,
          ...d("content"),
          error: f.content?.message,
        }),
        e.jsxs("div", {
          children: [
            e.jsx("label", {
              className: "mb-2 block text-sm font-medium text-foreground",
              children: "Humeur",
            }),
            e.jsx("div", {
              className: "flex items-center gap-2",
              children: ye.map((c, y) => {
                const u = y + 1;
                return e.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => p("mood", h === u ? null : u),
                    className: k(
                      "flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-all duration-200 cursor-pointer",
                      h === u
                        ? "bg-primary/10 ring-2 ring-primary scale-110"
                        : "bg-muted/30 hover:bg-muted/60",
                    ),
                    children: c,
                  },
                  u,
                );
              }),
            }),
          ],
        }),
        e.jsx(L, {
          label: "Tags",
          placeholder:
            "motivation, prospection, mindset (séparés par des virgules)",
          ...d("tags"),
          error: f.tags?.message,
        }),
        e.jsxs("label", {
          className:
            "flex items-center gap-2 text-sm text-muted-foreground cursor-pointer",
          children: [
            e.jsx("input", {
              type: "checkbox",
              ...d("is_private"),
              className: "rounded border-border",
            }),
            "Entrée privée (visible uniquement par moi)",
          ],
        }),
        e.jsxs("div", {
          className: "flex justify-end gap-3 pt-2",
          children: [
            e.jsx(M, {
              type: "button",
              variant: "secondary",
              onClick: s,
              children: "Annuler",
            }),
            e.jsx(M, {
              type: "submit",
              loading: _,
              children: i ? "Enregistrer" : "Créer",
            }),
          ],
        }),
      ],
    }),
  });
}
const Q = { 1: "😢", 2: "😕", 3: "😐", 4: "🙂", 5: "😊" },
  K = {
    1: "bg-red-100 text-red-700",
    2: "bg-orange-100 text-orange-700",
    3: "bg-yellow-100 text-yellow-700",
    4: "bg-lime-100 text-lime-700",
    5: "bg-green-100 text-green-700",
  },
  Ee = [
    { value: "journal", label: "Journal" },
    { value: "checkins", label: "Check-ins hebdo" },
  ];
function Re() {
  pe("Journal");
  const [o, s] = x.useState("journal"),
    [r, a] = x.useState(1),
    [l, i] = x.useState(1),
    [d, n] = x.useState(!1),
    [m, p] = x.useState(null),
    [g, f] = x.useState(null),
    { data: h, isLoading: E } = fe({ page: r }),
    _ = be(),
    { data: c, isLoading: y } = ve({ page: l }),
    u = x.useMemo(() => h?.data ?? [], [h?.data]),
    w = h?.count ?? 0,
    q = Math.ceil(w / v),
    O = x.useMemo(() => c?.data ?? [], [c?.data]),
    D = c?.count ?? 0,
    J = Math.ceil(D / v),
    V = (t) => {
      (p(t), n(!0));
    },
    I = (t) => {
      f(t);
    },
    H = () => {
      g && (_.mutate(g.id), f(null));
    };
  return e.jsxs("div", {
    className: "space-y-8",
    children: [
      e.jsxs("div", {
        className:
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("h1", {
                className: "text-xl sm:text-2xl font-bold text-foreground",
                children: "Journal",
              }),
              e.jsx("p", {
                className: "mt-1 text-sm text-muted-foreground",
                children:
                  "Suivez vos progrès, réflexions et check-ins hebdomadaires.",
              }),
            ],
          }),
          o === "journal" &&
            e.jsx(M, {
              size: "sm",
              icon: e.jsx(Y, { className: "h-4 w-4" }),
              onClick: () => {
                (p(null), n(!0));
              },
              children: "Nouvelle entrée",
            }),
        ],
      }),
      e.jsx(xe, { tabs: Ee, value: o, onChange: s }),
      e.jsx($, {
        value: "journal",
        activeValue: o,
        children: E
          ? e.jsx("div", {
              className: "grid gap-4 sm:grid-cols-2",
              children: Array.from({ length: 4 }).map((t, j) =>
                e.jsx(A, { className: "h-40 w-full rounded-xl" }, j),
              ),
            })
          : u.length === 0
            ? e.jsx(B, {
                icon: e.jsx(Z, { className: "h-6 w-6" }),
                title: "Aucune entrée",
                description:
                  "Commencez à écrire vos réflexions et suivre vos progrès.",
              })
            : e.jsxs(e.Fragment, {
                children: [
                  e.jsx("div", {
                    className: "grid gap-4 sm:grid-cols-2",
                    children: u.map((t) =>
                      e.jsxs(
                        "div",
                        {
                          className:
                            "group relative rounded-xl border border-border/40 bg-white p-5 transition-all hover:shadow-md",
                          children: [
                            e.jsxs("div", {
                              className:
                                "flex items-start justify-between mb-3",
                              children: [
                                e.jsxs("div", {
                                  className: "flex items-center gap-2",
                                  children: [
                                    t.mood &&
                                      e.jsx("span", {
                                        className: k(
                                          "inline-flex h-8 w-8 items-center justify-center rounded-lg text-lg",
                                          K[t.mood],
                                        ),
                                        children: Q[t.mood],
                                      }),
                                    e.jsx("span", {
                                      className:
                                        "text-xs text-muted-foreground",
                                      children: G(t.created_at),
                                    }),
                                  ],
                                }),
                                e.jsxs(U, {
                                  align: "right",
                                  trigger: e.jsx("button", {
                                    className:
                                      "rounded-md p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground transition-all cursor-pointer",
                                    children: e.jsx(se, {
                                      className: "h-4 w-4",
                                    }),
                                  }),
                                  children: [
                                    e.jsx(F, {
                                      onClick: () => V(t),
                                      icon: e.jsx(ee, { className: "h-4 w-4" }),
                                      children: "Modifier",
                                    }),
                                    e.jsx(F, {
                                      onClick: () => I(t),
                                      destructive: !0,
                                      icon: e.jsx(te, { className: "h-4 w-4" }),
                                      children: "Supprimer",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            t.title &&
                              e.jsx("h3", {
                                className:
                                  "font-semibold text-foreground mb-1 line-clamp-1",
                                children: t.title,
                              }),
                            t.content &&
                              e.jsx("p", {
                                className:
                                  "text-sm text-muted-foreground line-clamp-3 mb-3",
                                children: t.content,
                              }),
                            t.tags &&
                              t.tags.length > 0 &&
                              e.jsx("div", {
                                className: "flex flex-wrap gap-1.5",
                                children: t.tags.map((j) =>
                                  e.jsx(
                                    ue,
                                    {
                                      className:
                                        "bg-muted/50 text-muted-foreground text-xs",
                                      children: j,
                                    },
                                    j,
                                  ),
                                ),
                              }),
                            t.is_private &&
                              e.jsx("span", {
                                className:
                                  "absolute top-3 right-12 text-xs text-muted-foreground/60",
                                children: "🔒",
                              }),
                          ],
                        },
                        t.id,
                      ),
                    ),
                  }),
                  q > 1 &&
                    e.jsx(z, {
                      currentPage: r,
                      totalPages: q,
                      onPageChange: a,
                      totalItems: w,
                    }),
                ],
              }),
      }),
      e.jsx($, {
        value: "checkins",
        activeValue: o,
        children: y
          ? e.jsx("div", {
              className: "space-y-3",
              children: Array.from({ length: 5 }).map((t, j) =>
                e.jsx(A, { className: "h-16 w-full rounded-xl" }, j),
              ),
            })
          : O.length === 0
            ? e.jsx(B, {
                icon: e.jsx(re, { className: "h-6 w-6" }),
                title: "Aucun check-in",
                description: "Les check-ins hebdomadaires apparaîtront ici.",
              })
            : e.jsxs(e.Fragment, {
                children: [
                  e.jsx("div", {
                    className:
                      "overflow-x-auto rounded-xl border border-border/40",
                    children: e.jsxs("table", {
                      className: "w-full text-left text-sm",
                      children: [
                        e.jsx("thead", {
                          className: "border-b border-border/40 bg-muted/30",
                          children: e.jsxs("tr", {
                            children: [
                              e.jsx("th", {
                                className:
                                  "px-4 py-3 font-semibold text-muted-foreground",
                                children: "Semaine",
                              }),
                              e.jsx("th", {
                                className:
                                  "px-4 py-3 font-semibold text-muted-foreground",
                                children: "CA",
                              }),
                              e.jsx("th", {
                                className:
                                  "px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell",
                                children: "Prospection",
                              }),
                              e.jsx("th", {
                                className:
                                  "px-4 py-3 font-semibold text-muted-foreground",
                                children: "Humeur",
                              }),
                              e.jsx("th", {
                                className:
                                  "px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell",
                                children: "Objectif",
                              }),
                              e.jsx("th", {
                                className:
                                  "px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell",
                                children: "Feedback coach",
                              }),
                            ],
                          }),
                        }),
                        e.jsx("tbody", {
                          className: "divide-y divide-border/30",
                          children: O.map((t) =>
                            e.jsxs(
                              "tr",
                              {
                                className:
                                  "hover:bg-muted/20 transition-colors",
                                children: [
                                  e.jsx("td", {
                                    className:
                                      "px-4 py-3 font-medium text-foreground",
                                    children: ge(
                                      new Date(t.week_start),
                                      "'Sem.' w — dd MMM",
                                      { locale: X },
                                    ),
                                  }),
                                  e.jsx("td", {
                                    className:
                                      "px-4 py-3 text-foreground font-medium",
                                    children: W(t.revenue),
                                  }),
                                  e.jsxs("td", {
                                    className:
                                      "px-4 py-3 text-muted-foreground hidden sm:table-cell",
                                    children: [
                                      t.prospection_count,
                                      " contacts",
                                    ],
                                  }),
                                  e.jsx("td", {
                                    className: "px-4 py-3",
                                    children: t.mood
                                      ? e.jsx("span", {
                                          className: k(
                                            "inline-flex h-7 w-7 items-center justify-center rounded-md text-sm",
                                            K[t.mood],
                                          ),
                                          children: Q[t.mood],
                                        })
                                      : e.jsx("span", {
                                          className: "text-muted-foreground",
                                          children: "—",
                                        }),
                                  }),
                                  e.jsx("td", {
                                    className:
                                      "px-4 py-3 text-muted-foreground hidden md:table-cell max-w-48 truncate",
                                    children: t.goal_next_week ?? "—",
                                  }),
                                  e.jsx("td", {
                                    className:
                                      "px-4 py-3 text-muted-foreground hidden lg:table-cell max-w-48 truncate",
                                    children: t.coach_feedback
                                      ? e.jsx("span", {
                                          className: "text-foreground",
                                          children: t.coach_feedback,
                                        })
                                      : e.jsx("span", {
                                          className:
                                            "italic text-muted-foreground/60",
                                          children: "En attente",
                                        }),
                                  }),
                                ],
                              },
                              t.id,
                            ),
                          ),
                        }),
                      ],
                    }),
                  }),
                  J > 1 &&
                    e.jsx(z, {
                      currentPage: l,
                      totalPages: J,
                      onPageChange: i,
                      totalItems: D,
                    }),
                ],
              }),
      }),
      e.jsx(we, {
        open: d,
        onClose: () => {
          (n(!1), p(null));
        },
        editItem: m,
      }),
      e.jsx(me, {
        open: !!g,
        onClose: () => f(null),
        onConfirm: H,
        title: "Supprimer l'entrée",
        description: `Êtes-vous sûr de vouloir supprimer "${g?.title || "cette entrée"}" ? Cette action est irréversible.`,
        confirmLabel: "Supprimer",
        variant: "destructive",
      }),
    ],
  });
}
export { Re as default };
