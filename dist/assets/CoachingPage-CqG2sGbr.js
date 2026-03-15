import { u as ee, a as N, b as C, j as e } from "./vendor-query-sBpsl8Kt.js";
import { r as u } from "./vendor-react-Cci7g3Cb.js";
import {
  s as v,
  S as B,
  t as Q,
  v as P,
  c as be,
  h as V,
} from "./index-DY9GA2La.js";
import {
  t as g,
  T as z,
  z as ve,
  al as I,
  a1 as H,
  aJ as Y,
  C as ye,
  b as Se,
} from "./vendor-ui-DDdrexJZ.js";
import { I as _ } from "./constants-IBlSVYu1.js";
import { u as se } from "./vendor-forms-Ct2mZ2NL.js";
import { a as te } from "./zod-COY_rf8d.js";
import { M as ae } from "./modal-DBBZDXoW.js";
import { I as S } from "./input-B9vrc6Q3.js";
import { S as E } from "./select-E7QvXrZc.js";
import { T as re } from "./textarea-D7qrlVHg.js";
import { B as T } from "./button-DlbP8VPc.js";
import { h as _e, j as Te } from "./forms-zLivl21i.js";
import { B as k } from "./badge-CFrXqKTx.js";
import { C as Ne, a as Ce, b as we, d as Ee } from "./card-Dkj99_H3.js";
import { T as Ae, a as J } from "./tabs-oT6f7FFv.js";
import { P as W } from "./pagination-DHo4QjB2.js";
import { E as X } from "./empty-state-BFSeK4Tv.js";
import { C as Z } from "./confirm-dialog-BnX-zJNl.js";
import { u as Pe } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
function ke(r = {}) {
  const { client_id: a, status: t, page: i = 1 } = r,
    o = (i - 1) * _,
    l = o + _ - 1;
  return ee({
    queryKey: ["coaching_goals", r],
    queryFn: async () => {
      let n = v
        .from("coaching_goals")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: !1 })
        .range(o, l);
      (a && (n = n.eq("client_id", a)), t && (n = n.eq("status", t)));
      const { data: h, error: c, count: m } = await n;
      if (c) throw c;
      return { data: h, count: m ?? 0 };
    },
  });
}
function Oe() {
  const r = N();
  return C({
    mutationFn: async (a) => {
      const { data: t, error: i } = await v
        .from("coaching_goals")
        .insert(a)
        .select()
        .single();
      if (i) throw i;
      return t;
    },
    onSuccess: () => {
      (r.invalidateQueries({ queryKey: ["coaching_goals"] }),
        g.success("Objectif créé avec succès"));
    },
    onError: (a) => {
      g.error(`Erreur: ${a.message}`);
    },
  });
}
function Me() {
  const r = N();
  return C({
    mutationFn: async ({ id: a, ...t }) => {
      const { data: i, error: o } = await v
        .from("coaching_goals")
        .update(t)
        .eq("id", a)
        .select()
        .single();
      if (o) throw o;
      return i;
    },
    onSuccess: (a) => {
      (r.invalidateQueries({ queryKey: ["coaching_goals"] }),
        r.setQueryData(["coaching_goals", a.id], a),
        g.success("Objectif mis à jour"));
    },
    onError: (a) => {
      g.error(`Erreur: ${a.message}`);
    },
  });
}
function qe() {
  const r = N();
  return C({
    mutationFn: async (a) => {
      const { error: t } = await v.from("coaching_goals").delete().eq("id", a);
      if (t) throw t;
    },
    onSuccess: () => {
      (r.invalidateQueries({ queryKey: ["coaching_goals"] }),
        g.success("Objectif supprimé"));
    },
    onError: (a) => {
      g.error(`Erreur: ${a.message}`);
    },
  });
}
function Ge(r = {}) {
  const { student_id: a, status: t, page: i = 1 } = r,
    o = (i - 1) * _,
    l = o + _ - 1;
  return ee({
    queryKey: ["student_tasks", r],
    queryFn: async () => {
      let n = v
        .from("student_tasks")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: !1 })
        .range(o, l);
      (a && (n = n.eq("student_id", a)), t && (n = n.eq("status", t)));
      const { data: h, error: c, count: m } = await n;
      if (c) throw c;
      return { data: h, count: m ?? 0 };
    },
  });
}
function De() {
  const r = N();
  return C({
    mutationFn: async (a) => {
      const { data: t, error: i } = await v
        .from("student_tasks")
        .insert(a)
        .select()
        .single();
      if (i) throw i;
      return t;
    },
    onSuccess: () => {
      (r.invalidateQueries({ queryKey: ["student_tasks"] }),
        g.success("Tâche créée avec succès"));
    },
    onError: (a) => {
      g.error(`Erreur: ${a.message}`);
    },
  });
}
function Le() {
  const r = N();
  return C({
    mutationFn: async ({ id: a, ...t }) => {
      const i = { ...t };
      t.status === "termine" &&
        !t.completed_at &&
        (i.completed_at = new Date().toISOString());
      const { data: o, error: l } = await v
        .from("student_tasks")
        .update(i)
        .eq("id", a)
        .select()
        .single();
      if (l) throw l;
      return o;
    },
    onSuccess: (a) => {
      (r.invalidateQueries({ queryKey: ["student_tasks"] }),
        r.setQueryData(["student_tasks", a.id], a),
        g.success("Tâche mise à jour"));
    },
    onError: (a) => {
      g.error(`Erreur: ${a.message}`);
    },
  });
}
function Fe() {
  const r = N();
  return C({
    mutationFn: async (a) => {
      const { error: t } = await v.from("student_tasks").delete().eq("id", a);
      if (t) throw t;
    },
    onSuccess: () => {
      (r.invalidateQueries({ queryKey: ["student_tasks"] }),
        g.success("Tâche supprimée"));
    },
    onError: (a) => {
      g.error(`Erreur: ${a.message}`);
    },
  });
}
const Ke = [
  { value: "en_cours", label: "En cours" },
  { value: "atteint", label: "Atteint" },
  { value: "abandonné", label: "Abandonné" },
];
function Re({ open: r, onClose: a, editItem: t }) {
  const i = Oe(),
    o = Me(),
    l = !!t,
    {
      register: n,
      handleSubmit: h,
      reset: c,
      setValue: m,
      watch: p,
      formState: { errors: d },
    } = se({
      resolver: te(_e),
      defaultValues: {
        title: "",
        description: "",
        target_value: 0,
        unit: "",
        deadline: "",
        status: "en_cours",
      },
    }),
    f = p("status");
  u.useEffect(() => {
    c(
      t
        ? {
            title: t.title,
            description: t.description ?? "",
            target_value: t.target_value,
            unit: t.unit ?? "",
            deadline: t.deadline ?? "",
            status: t.status,
          }
        : {
            title: "",
            description: "",
            target_value: 0,
            unit: "",
            deadline: "",
            status: "en_cours",
          },
    );
  }, [t, c]);
  const w = (x) => {
      l
        ? o.mutate(
            { id: t.id, ...x },
            {
              onSuccess: () => {
                (c(), a());
              },
            },
          )
        : i.mutate(x, {
            onSuccess: () => {
              (c(), a());
            },
          });
    },
    y = i.isPending || o.isPending;
  return e.jsx(ae, {
    open: r,
    onClose: a,
    title: l ? "Modifier l'objectif" : "Nouvel objectif",
    description: l
      ? "Mettre à jour les informations de l'objectif."
      : "Définir un nouvel objectif de coaching.",
    size: "md",
    children: e.jsxs("form", {
      onSubmit: h(w),
      className: "space-y-4",
      children: [
        e.jsx(S, {
          label: "Titre *",
          placeholder: "Ex: Atteindre 10K€ de CA mensuel",
          ...n("title"),
          error: d.title?.message,
        }),
        e.jsx(re, {
          label: "Description",
          placeholder: "Détails sur l'objectif...",
          rows: 3,
          ...n("description"),
          error: d.description?.message,
        }),
        e.jsxs("div", {
          className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
          children: [
            e.jsx(S, {
              label: "Valeur cible *",
              type: "number",
              placeholder: "10000",
              ...n("target_value"),
              error: d.target_value?.message,
            }),
            e.jsx(S, {
              label: "Unité",
              placeholder: "Ex: €, appels, clients",
              ...n("unit"),
              error: d.unit?.message,
            }),
          ],
        }),
        e.jsxs("div", {
          className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
          children: [
            e.jsx(S, {
              label: "Échéance",
              type: "date",
              ...n("deadline"),
              error: d.deadline?.message,
            }),
            e.jsx(E, {
              label: "Statut",
              options: Ke,
              value: f,
              onChange: (x) => m("status", x),
              error: d.status?.message,
            }),
          ],
        }),
        e.jsxs("div", {
          className: "flex justify-end gap-3 pt-2",
          children: [
            e.jsx(T, {
              type: "button",
              variant: "secondary",
              onClick: a,
              children: "Annuler",
            }),
            e.jsx(T, {
              type: "submit",
              loading: y,
              children: l ? "Enregistrer" : "Créer",
            }),
          ],
        }),
      ],
    }),
  });
}
const Ue = [
    { value: "haute", label: "Haute" },
    { value: "moyenne", label: "Moyenne" },
    { value: "basse", label: "Basse" },
  ],
  $e = [
    { value: "a_faire", label: "À faire" },
    { value: "en_cours", label: "En cours" },
    { value: "termine", label: "Terminé" },
  ];
function Be({ open: r, onClose: a, editItem: t }) {
  const i = De(),
    o = Le(),
    l = !!t,
    {
      register: n,
      handleSubmit: h,
      reset: c,
      setValue: m,
      watch: p,
      formState: { errors: d },
    } = se({
      resolver: te(Te),
      defaultValues: {
        title: "",
        description: "",
        due_date: "",
        priority: "moyenne",
        status: "a_faire",
      },
    }),
    f = p("priority"),
    w = p("status");
  u.useEffect(() => {
    c(
      t
        ? {
            title: t.title,
            description: t.description ?? "",
            due_date: t.due_date ? t.due_date.split("T")[0] : "",
            priority: t.priority,
            status: t.status,
          }
        : {
            title: "",
            description: "",
            due_date: "",
            priority: "moyenne",
            status: "a_faire",
          },
    );
  }, [t, c]);
  const y = (j) => {
      l
        ? o.mutate(
            { id: t.id, ...j },
            {
              onSuccess: () => {
                (c(), a());
              },
            },
          )
        : i.mutate(j, {
            onSuccess: () => {
              (c(), a());
            },
          });
    },
    x = i.isPending || o.isPending;
  return e.jsx(ae, {
    open: r,
    onClose: a,
    title: l ? "Modifier la tâche" : "Nouvelle tâche",
    description: l
      ? "Mettre à jour les informations de la tâche."
      : "Assigner une nouvelle tâche.",
    size: "md",
    children: e.jsxs("form", {
      onSubmit: h(y),
      className: "space-y-4",
      children: [
        e.jsx(S, {
          label: "Titre *",
          placeholder: "Ex: Envoyer 50 DMs cette semaine",
          ...n("title"),
          error: d.title?.message,
        }),
        e.jsx(re, {
          label: "Description",
          placeholder: "Détails sur la tâche...",
          rows: 3,
          ...n("description"),
          error: d.description?.message,
        }),
        e.jsxs("div", {
          className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
          children: [
            e.jsx(E, {
              label: "Priorité",
              options: Ue,
              value: f,
              onChange: (j) => m("priority", j),
              error: d.priority?.message,
            }),
            e.jsx(E, {
              label: "Statut",
              options: $e,
              value: w,
              onChange: (j) => m("status", j),
              error: d.status?.message,
            }),
          ],
        }),
        e.jsx(S, {
          label: "Échéance",
          type: "date",
          ...n("due_date"),
          error: d.due_date?.message,
        }),
        e.jsxs("div", {
          className: "flex justify-end gap-3 pt-2",
          children: [
            e.jsx(T, {
              type: "button",
              variant: "secondary",
              onClick: a,
              children: "Annuler",
            }),
            e.jsx(T, {
              type: "submit",
              loading: x,
              children: l ? "Enregistrer" : "Créer",
            }),
          ],
        }),
      ],
    }),
  });
}
const Qe = [
    { value: "objectifs", label: "Objectifs" },
    { value: "taches", label: "Tâches" },
  ],
  Ve = [
    { value: "", label: "Tous les statuts" },
    { value: "en_cours", label: "En cours" },
    { value: "atteint", label: "Atteint" },
    { value: "abandonné", label: "Abandonné" },
  ],
  ze = [
    { value: "", label: "Tous les statuts" },
    { value: "a_faire", label: "À faire" },
    { value: "en_cours", label: "En cours" },
    { value: "termine", label: "Terminé" },
  ],
  Ie = {
    en_cours: "bg-blue-100 text-blue-700",
    atteint: "bg-green-100 text-green-700",
    abandonné: "bg-red-100 text-red-700",
  },
  He = { en_cours: "En cours", atteint: "Atteint", abandonné: "Abandonné" },
  Ye = {
    haute: "bg-red-100 text-red-700",
    moyenne: "bg-amber-100 text-amber-700",
    basse: "bg-green-100 text-green-700",
  },
  Je = { haute: "Haute", moyenne: "Moyenne", basse: "Basse" },
  We = {
    a_faire: "bg-gray-100 text-gray-600",
    en_cours: "bg-blue-100 text-blue-700",
    termine: "bg-green-100 text-green-700",
  },
  Xe = { a_faire: "À faire", en_cours: "En cours", termine: "Terminé" };
function ys() {
  Pe("Coaching");
  const [r, a] = u.useState("objectifs"),
    [t, i] = u.useState(""),
    [o, l] = u.useState(1),
    [n, h] = u.useState(!1),
    [c, m] = u.useState(null),
    [p, d] = u.useState(null),
    [f, w] = u.useState(""),
    [y, x] = u.useState(1),
    [j, O] = u.useState(!1),
    [ne, M] = u.useState(null),
    [A, q] = u.useState(null),
    ie = u.useMemo(() => ({ status: t || void 0, page: o }), [t, o]),
    { data: G, isLoading: oe } = ke(ie),
    le = qe(),
    L = u.useMemo(() => G?.data ?? [], [G?.data]),
    F = G?.count ?? 0,
    K = Math.ceil(F / _),
    ce = u.useMemo(() => ({ status: f || void 0, page: y }), [f, y]),
    { data: D, isLoading: ue } = Ge(ce),
    de = Fe(),
    R = u.useMemo(() => D?.data ?? [], [D?.data]),
    U = D?.count ?? 0,
    $ = Math.ceil(U / _),
    me = (s) => {
      (m(s), h(!0));
    },
    ge = (s) => {
      d(s);
    },
    he = () => {
      p && (le.mutate(p.id), d(null));
    },
    pe = (s) => {
      (M(s), O(!0));
    },
    xe = (s) => {
      q(s);
    },
    fe = () => {
      A && (de.mutate(A.id), q(null));
    },
    je = (s) =>
      s.target_value <= 0
        ? 0
        : Math.min(Math.round((s.current_value / s.target_value) * 100), 100);
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
                children: "Coaching",
              }),
              e.jsx("p", {
                className: "mt-1 text-sm text-muted-foreground",
                children: "Objectifs et tâches de coaching pour vos clients.",
              }),
            ],
          }),
          e.jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              e.jsx(T, {
                size: "sm",
                variant: "secondary",
                icon: e.jsx(z, { className: "h-4 w-4" }),
                onClick: () => {
                  (m(null), h(!0));
                },
                children: "Nouvel objectif",
              }),
              e.jsx(T, {
                size: "sm",
                icon: e.jsx(ve, { className: "h-4 w-4" }),
                onClick: () => {
                  (M(null), O(!0));
                },
                children: "Nouvelle tâche",
              }),
            ],
          }),
        ],
      }),
      e.jsx(Ae, { tabs: Qe, value: r, onChange: a }),
      e.jsx(J, {
        value: "objectifs",
        activeValue: r,
        children: e.jsxs("div", {
          className: "space-y-6",
          children: [
            e.jsx("div", {
              className: "flex items-center gap-3",
              children: e.jsx(E, {
                options: Ve,
                value: t,
                onChange: (s) => {
                  (i(s), l(1));
                },
                placeholder: "Tous les statuts",
                className: "w-full sm:w-44",
              }),
            }),
            oe
              ? e.jsx("div", {
                  className:
                    "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
                  children: Array.from({ length: 6 }).map((s, b) =>
                    e.jsx(B, { className: "h-48 w-full rounded-xl" }, b),
                  ),
                })
              : L.length === 0
                ? e.jsx(X, {
                    icon: e.jsx(z, { className: "h-6 w-6" }),
                    title: "Aucun objectif",
                    description: t
                      ? "Aucun objectif ne correspond au filtre."
                      : "Créez votre premier objectif de coaching.",
                  })
                : e.jsxs(e.Fragment, {
                    children: [
                      e.jsx("div", {
                        className:
                          "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
                        children: L.map((s) => {
                          const b = je(s);
                          return e.jsxs(
                            Ne,
                            {
                              children: [
                                e.jsx(Ce, {
                                  className: "pb-3",
                                  children: e.jsxs("div", {
                                    className:
                                      "flex items-start justify-between gap-2",
                                    children: [
                                      e.jsx(we, {
                                        className: "text-base line-clamp-2",
                                        children: s.title,
                                      }),
                                      e.jsxs(Q, {
                                        align: "right",
                                        trigger: e.jsx("button", {
                                          className:
                                            "rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer shrink-0",
                                          children: e.jsx(Y, {
                                            className: "h-4 w-4",
                                          }),
                                        }),
                                        children: [
                                          e.jsx(P, {
                                            onClick: () => me(s),
                                            icon: e.jsx(I, {
                                              className: "h-4 w-4",
                                            }),
                                            children: "Modifier",
                                          }),
                                          e.jsx(P, {
                                            onClick: () => ge(s),
                                            destructive: !0,
                                            icon: e.jsx(H, {
                                              className: "h-4 w-4",
                                            }),
                                            children: "Supprimer",
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                }),
                                e.jsxs(Ee, {
                                  className: "space-y-4",
                                  children: [
                                    s.description &&
                                      e.jsx("p", {
                                        className:
                                          "text-sm text-muted-foreground line-clamp-2",
                                        children: s.description,
                                      }),
                                    e.jsxs("div", {
                                      className: "space-y-2",
                                      children: [
                                        e.jsxs("div", {
                                          className:
                                            "flex items-center justify-between text-sm",
                                          children: [
                                            e.jsxs("span", {
                                              className:
                                                "text-muted-foreground",
                                              children: [
                                                s.current_value,
                                                " / ",
                                                s.target_value,
                                                s.unit ? ` ${s.unit}` : "",
                                              ],
                                            }),
                                            e.jsxs("span", {
                                              className:
                                                "font-medium text-foreground",
                                              children: [b, "%"],
                                            }),
                                          ],
                                        }),
                                        e.jsx("div", {
                                          className:
                                            "h-2 w-full overflow-hidden rounded-full bg-muted",
                                          children: e.jsx("div", {
                                            className: be(
                                              "h-full rounded-full transition-all duration-500",
                                              b >= 100
                                                ? "bg-green-500"
                                                : b >= 50
                                                  ? "bg-blue-500"
                                                  : "bg-amber-500",
                                            ),
                                            style: { width: `${b}%` },
                                          }),
                                        }),
                                      ],
                                    }),
                                    e.jsxs("div", {
                                      className:
                                        "flex flex-wrap items-center gap-2",
                                      children: [
                                        e.jsx(k, {
                                          className:
                                            Ie[s.status] ??
                                            "bg-gray-100 text-gray-600",
                                          children: He[s.status] ?? s.status,
                                        }),
                                        s.deadline &&
                                          e.jsxs(k, {
                                            className:
                                              "bg-slate-100 text-slate-700",
                                            children: [
                                              e.jsx(ye, {
                                                className: "mr-1 h-3 w-3",
                                              }),
                                              V(s.deadline),
                                            ],
                                          }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            },
                            s.id,
                          );
                        }),
                      }),
                      K > 1 &&
                        e.jsx(W, {
                          currentPage: o,
                          totalPages: K,
                          onPageChange: l,
                          totalItems: F,
                        }),
                    ],
                  }),
          ],
        }),
      }),
      e.jsx(J, {
        value: "taches",
        activeValue: r,
        children: e.jsxs("div", {
          className: "space-y-6",
          children: [
            e.jsx("div", {
              className: "flex items-center gap-3",
              children: e.jsx(E, {
                options: ze,
                value: f,
                onChange: (s) => {
                  (w(s), x(1));
                },
                placeholder: "Tous les statuts",
                className: "w-full sm:w-44",
              }),
            }),
            ue
              ? e.jsx("div", {
                  className: "space-y-3",
                  children: Array.from({ length: 5 }).map((s, b) =>
                    e.jsx(B, { className: "h-16 w-full rounded-xl" }, b),
                  ),
                })
              : R.length === 0
                ? e.jsx(X, {
                    icon: e.jsx(Se, { className: "h-6 w-6" }),
                    title: "Aucune tâche",
                    description: f
                      ? "Aucune tâche ne correspond au filtre."
                      : "Créez votre première tâche de coaching.",
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
                              className:
                                "border-b border-border/40 bg-muted/30",
                              children: e.jsxs("tr", {
                                children: [
                                  e.jsx("th", {
                                    className:
                                      "px-4 py-3 font-semibold text-muted-foreground",
                                    children: "Titre",
                                  }),
                                  e.jsx("th", {
                                    className:
                                      "px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell",
                                    children: "Priorité",
                                  }),
                                  e.jsx("th", {
                                    className:
                                      "px-4 py-3 font-semibold text-muted-foreground",
                                    children: "Statut",
                                  }),
                                  e.jsx("th", {
                                    className:
                                      "px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell",
                                    children: "Échéance",
                                  }),
                                  e.jsx("th", { className: "px-4 py-3 w-10" }),
                                ],
                              }),
                            }),
                            e.jsx("tbody", {
                              className: "divide-y divide-border/30",
                              children: R.map((s) =>
                                e.jsxs(
                                  "tr",
                                  {
                                    className:
                                      "hover:bg-muted/20 transition-colors",
                                    children: [
                                      e.jsx("td", {
                                        className: "px-4 py-3",
                                        children: e.jsxs("div", {
                                          children: [
                                            e.jsx("p", {
                                              className:
                                                "font-medium text-foreground",
                                              children: s.title,
                                            }),
                                            s.description &&
                                              e.jsx("p", {
                                                className:
                                                  "text-xs text-muted-foreground line-clamp-1 mt-0.5",
                                                children: s.description,
                                              }),
                                          ],
                                        }),
                                      }),
                                      e.jsx("td", {
                                        className:
                                          "px-4 py-3 hidden sm:table-cell",
                                        children: e.jsx(k, {
                                          className:
                                            Ye[s.priority] ??
                                            "bg-gray-100 text-gray-600",
                                          children:
                                            Je[s.priority] ?? s.priority,
                                        }),
                                      }),
                                      e.jsx("td", {
                                        className: "px-4 py-3",
                                        children: e.jsx(k, {
                                          className:
                                            We[s.status] ??
                                            "bg-gray-100 text-gray-600",
                                          children: Xe[s.status] ?? s.status,
                                        }),
                                      }),
                                      e.jsx("td", {
                                        className:
                                          "px-4 py-3 text-muted-foreground hidden md:table-cell",
                                        children: s.due_date
                                          ? V(s.due_date)
                                          : "—",
                                      }),
                                      e.jsx("td", {
                                        className: "px-4 py-3",
                                        children: e.jsxs(Q, {
                                          align: "right",
                                          trigger: e.jsx("button", {
                                            className:
                                              "rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer",
                                            children: e.jsx(Y, {
                                              className: "h-4 w-4",
                                            }),
                                          }),
                                          children: [
                                            e.jsx(P, {
                                              onClick: () => pe(s),
                                              icon: e.jsx(I, {
                                                className: "h-4 w-4",
                                              }),
                                              children: "Modifier",
                                            }),
                                            e.jsx(P, {
                                              onClick: () => xe(s),
                                              destructive: !0,
                                              icon: e.jsx(H, {
                                                className: "h-4 w-4",
                                              }),
                                              children: "Supprimer",
                                            }),
                                          ],
                                        }),
                                      }),
                                    ],
                                  },
                                  s.id,
                                ),
                              ),
                            }),
                          ],
                        }),
                      }),
                      $ > 1 &&
                        e.jsx(W, {
                          currentPage: y,
                          totalPages: $,
                          onPageChange: x,
                          totalItems: U,
                        }),
                    ],
                  }),
          ],
        }),
      }),
      e.jsx(Re, {
        open: n,
        onClose: () => {
          (h(!1), m(null));
        },
        editItem: c,
      }),
      e.jsx(Be, {
        open: j,
        onClose: () => {
          (O(!1), M(null));
        },
        editItem: ne,
      }),
      e.jsx(Z, {
        open: !!p,
        onClose: () => d(null),
        onConfirm: he,
        title: "Supprimer l'objectif",
        description: `Êtes-vous sûr de vouloir supprimer "${p?.title}" ? Cette action est irréversible.`,
        confirmLabel: "Supprimer",
        variant: "destructive",
      }),
      e.jsx(Z, {
        open: !!A,
        onClose: () => q(null),
        onConfirm: fe,
        title: "Supprimer la tâche",
        description: `Êtes-vous sûr de vouloir supprimer "${A?.title}" ? Cette action est irréversible.`,
        confirmLabel: "Supprimer",
        variant: "destructive",
      }),
    ],
  });
}
export { ys as default };
