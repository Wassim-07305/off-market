import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { r as t, f as B } from "./vendor-react-Cci7g3Cb.js";
import { u as T, a as L, b as O } from "./useForms-BjBbdMcT.js";
import { u as $, o as z, s as w, l as R } from "./vendor-forms-Ct2mZ2NL.js";
import { a as U } from "./zod-COY_rf8d.js";
import { M as q } from "./modal-DBBZDXoW.js";
import { I as G } from "./input-B9vrc6Q3.js";
import { T as V } from "./textarea-D7qrlVHg.js";
import { B as p } from "./button-DlbP8VPc.js";
import { S as J } from "./search-input-dECf1iQ_.js";
import { S as Q } from "./select-E7QvXrZc.js";
import { B as H } from "./badge-CFrXqKTx.js";
import { C as K, d as W } from "./card-Dkj99_H3.js";
import { P as X } from "./pagination-DHo4QjB2.js";
import { S as Y, c as j, t as Z, v as m, h as ee } from "./index-DY9GA2La.js";
import { E as se } from "./empty-state-BFSeK4Tv.js";
import { C as re } from "./confirm-dialog-BnX-zJNl.js";
import { I as te } from "./constants-IBlSVYu1.js";
import { u as ae } from "./usePageTitle-I7G4QvKX.js";
import {
  aT as le,
  z as S,
  aU as ie,
  f as oe,
  al as ne,
  a9 as ce,
  Q as me,
  ak as de,
  a1 as ue,
  aJ as pe,
  C as xe,
} from "./vendor-ui-DDdrexJZ.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
const fe = z({
  title: w().min(1, "Le titre est requis").max(200, "Le titre est trop long"),
  description: w()
    .max(1e3, "La description est trop longue")
    .optional()
    .or(R("")),
});
function ge({ open: a, onClose: r }) {
  const d = T(),
    {
      register: i,
      handleSubmit: x,
      reset: l,
      formState: { errors: o },
    } = $({ resolver: U(fe), defaultValues: { title: "", description: "" } });
  t.useEffect(() => {
    a || l({ title: "", description: "" });
  }, [a, l]);
  const f = (n) => {
    d.mutate(
      { title: n.title, description: n.description || void 0 },
      {
        onSuccess: () => {
          (l(), r());
        },
      },
    );
  };
  return e.jsx(q, {
    open: a,
    onClose: r,
    title: "Nouveau formulaire",
    description: "Créer un nouveau formulaire pour collecter des réponses.",
    size: "md",
    children: e.jsxs("form", {
      onSubmit: x(f),
      className: "space-y-4",
      children: [
        e.jsx(G, {
          label: "Titre *",
          placeholder: "Titre du formulaire",
          ...i("title"),
          error: o.title?.message,
        }),
        e.jsx(V, {
          label: "Description",
          placeholder: "Description du formulaire...",
          rows: 3,
          ...i("description"),
          error: o.description?.message,
        }),
        e.jsxs("div", {
          className: "flex justify-end gap-3 pt-2",
          children: [
            e.jsx(p, {
              type: "button",
              variant: "secondary",
              onClick: r,
              children: "Annuler",
            }),
            e.jsx(p, {
              type: "submit",
              loading: d.isPending,
              children: "Créer",
            }),
          ],
        }),
      ],
    }),
  });
}
const he = [
    { value: "", label: "Tous les statuts" },
    { value: "brouillon", label: "Brouillon" },
    { value: "publié", label: "Publié" },
    { value: "fermé", label: "Fermé" },
  ],
  y = {
    brouillon: {
      label: "Brouillon",
      className: "bg-slate-50 text-slate-600 ring-1 ring-slate-200",
      dotColor: "bg-slate-400",
    },
    publié: {
      label: "Publié",
      className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      dotColor: "bg-emerald-500",
    },
    fermé: {
      label: "Fermé",
      className: "bg-red-50 text-red-600 ring-1 ring-red-200",
      dotColor: "bg-red-400",
    },
  },
  F = {
    brouillon: "from-slate-400 to-slate-500",
    publié: "from-emerald-400 to-emerald-600",
    fermé: "from-red-400 to-red-500",
  };
function ze() {
  ae("Formulaires");
  const a = B(),
    [r, d] = t.useState(""),
    [i, x] = t.useState(""),
    [l, o] = t.useState(1),
    [f, n] = t.useState(!1),
    [u, g] = t.useState(null),
    P = t.useMemo(
      () => ({ search: r || void 0, status: i || void 0, page: l }),
      [r, i, l],
    ),
    { data: h, isLoading: k } = L(P),
    D = O(),
    b = T(),
    v = t.useMemo(() => h?.data ?? [], [h?.data]),
    N = h?.count ?? 0,
    C = Math.ceil(N / te),
    M = t.useCallback(
      (s) => {
        b.mutate({
          title: `${s.title} (copie)`,
          description: s.description ?? void 0,
        });
      },
      [b],
    ),
    E = (s) => {
      g(s);
    },
    A = () => {
      u && (D.mutate(u.id), g(null));
    };
  return e.jsxs("div", {
    className: "space-y-8",
    children: [
      e.jsxs("div", {
        className:
          "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        children: [
          e.jsx("div", {
            children: e.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                e.jsx("div", {
                  className:
                    "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10",
                  children: e.jsx(le, { className: "h-5 w-5 text-primary" }),
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("h1", {
                      className:
                        "text-xl font-bold text-foreground sm:text-2xl",
                      children: "Formulaires",
                    }),
                    e.jsx("p", {
                      className: "text-sm text-muted-foreground",
                      children:
                        "Creez et gerez vos formulaires de collecte de donnees.",
                    }),
                  ],
                }),
              ],
            }),
          }),
          e.jsx(p, {
            icon: e.jsx(S, { className: "h-4 w-4" }),
            onClick: () => n(!0),
            children: "Nouveau formulaire",
          }),
        ],
      }),
      e.jsxs("div", {
        className: "flex flex-col gap-3 sm:flex-row sm:items-center",
        children: [
          e.jsx(J, {
            value: r,
            onChange: (s) => {
              (d(s), o(1));
            },
            placeholder: "Rechercher un formulaire...",
            wrapperClassName: "w-full sm:w-72",
          }),
          e.jsx(Q, {
            options: he,
            value: i,
            onChange: (s) => {
              (x(s), o(1));
            },
            placeholder: "Tous les statuts",
            className: "w-full sm:w-44",
          }),
        ],
      }),
      k
        ? e.jsx("div", {
            className: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
            children: Array.from({ length: 6 }).map((s, c) =>
              e.jsx(Y, { className: "h-52 w-full rounded-xl" }, c),
            ),
          })
        : v.length === 0
          ? e.jsx(se, {
              icon: e.jsx(ie, { className: "h-6 w-6" }),
              title: r ? "Aucun resultat" : "Aucun formulaire",
              description: r
                ? "Aucun formulaire ne correspond a votre recherche."
                : "Creez votre premier formulaire pour commencer a collecter des reponses.",
              action: r
                ? void 0
                : e.jsx(p, {
                    icon: e.jsx(S, { className: "h-4 w-4" }),
                    onClick: () => n(!0),
                    children: "Creer un formulaire",
                  }),
            })
          : e.jsxs(e.Fragment, {
              children: [
                e.jsx("div", {
                  className:
                    "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
                  children: v.map((s) => {
                    const c = y[s.status] ?? y.brouillon,
                      I = F[s.status] ?? F.brouillon;
                    return e.jsxs(
                      K,
                      {
                        className:
                          "group relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
                        onClick: () => a(`/formulaires/${s.id}`),
                        children: [
                          e.jsx("div", {
                            className: j("h-1 w-full bg-gradient-to-r", I),
                          }),
                          e.jsxs(W, {
                            className: "p-5 space-y-4",
                            children: [
                              e.jsxs("div", {
                                className:
                                  "flex items-start justify-between gap-3",
                                children: [
                                  e.jsxs("div", {
                                    className: "flex items-start gap-3 min-w-0",
                                    children: [
                                      e.jsx("div", {
                                        className:
                                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15",
                                        children: e.jsx(oe, {
                                          className: "h-5 w-5 text-primary",
                                        }),
                                      }),
                                      e.jsxs("div", {
                                        className: "min-w-0 space-y-1",
                                        children: [
                                          e.jsx("h3", {
                                            className:
                                              "font-semibold text-foreground truncate text-[15px] leading-tight",
                                            children: s.title,
                                          }),
                                          s.description &&
                                            e.jsx("p", {
                                              className:
                                                "text-sm text-muted-foreground line-clamp-2 leading-relaxed",
                                              children: s.description,
                                            }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  e.jsxs(Z, {
                                    align: "right",
                                    trigger: e.jsx("button", {
                                      onClick: (_) => _.stopPropagation(),
                                      className:
                                        "rounded-lg p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground transition-all cursor-pointer",
                                      children: e.jsx(pe, {
                                        className: "h-4 w-4",
                                      }),
                                    }),
                                    children: [
                                      e.jsx(m, {
                                        onClick: () =>
                                          a(`/formulaires/${s.id}`),
                                        icon: e.jsx(ne, {
                                          className: "h-4 w-4",
                                        }),
                                        children: "Modifier",
                                      }),
                                      e.jsx(m, {
                                        onClick: () =>
                                          a(`/formulaires/${s.id}`, {
                                            state: { tab: "apercu" },
                                          }),
                                        icon: e.jsx(ce, {
                                          className: "h-4 w-4",
                                        }),
                                        children: "Apercu",
                                      }),
                                      e.jsx(m, {
                                        onClick: () =>
                                          a(`/formulaires/${s.id}`, {
                                            state: { tab: "reponses" },
                                          }),
                                        icon: e.jsx(me, {
                                          className: "h-4 w-4",
                                        }),
                                        children: "Voir les reponses",
                                      }),
                                      e.jsx(m, {
                                        onClick: () => M(s),
                                        icon: e.jsx(de, {
                                          className: "h-4 w-4",
                                        }),
                                        children: "Dupliquer",
                                      }),
                                      e.jsx(m, {
                                        onClick: () => E(s),
                                        destructive: !0,
                                        icon: e.jsx(ue, {
                                          className: "h-4 w-4",
                                        }),
                                        children: "Supprimer",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              e.jsxs("div", {
                                className:
                                  "flex items-center justify-between pt-2 border-t border-border/30",
                                children: [
                                  e.jsxs(H, {
                                    className: j(
                                      "text-[11px] px-2 py-0.5",
                                      c.className,
                                    ),
                                    children: [
                                      e.jsx("span", {
                                        className: j(
                                          "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
                                          c.dotColor,
                                        ),
                                      }),
                                      c.label,
                                    ],
                                  }),
                                  e.jsxs("span", {
                                    className:
                                      "flex items-center gap-1.5 text-xs text-muted-foreground",
                                    children: [
                                      e.jsx(xe, { className: "h-3 w-3" }),
                                      ee(s.created_at),
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
                C > 1 &&
                  e.jsx(X, {
                    currentPage: l,
                    totalPages: C,
                    onPageChange: o,
                    totalItems: N,
                  }),
              ],
            }),
      e.jsx(ge, { open: f, onClose: () => n(!1) }),
      e.jsx(re, {
        open: !!u,
        onClose: () => g(null),
        onConfirm: A,
        title: "Supprimer le formulaire",
        description: `Etes-vous sur de vouloir supprimer "${u?.title}" ? Cette action est irreversible.`,
        confirmLabel: "Supprimer",
        variant: "destructive",
      }),
    ],
  });
}
export { ze as default };
