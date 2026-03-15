import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { f as C, r as u } from "./vendor-react-Cci7g3Cb.js";
import { P, u as F, a as S, F as z } from "./FormationFormModal-BKpgB3Tb.js";
import { c as p, d as _, S as n } from "./index-DY9GA2La.js";
import { B as x } from "./button-DlbP8VPc.js";
import {
  l as B,
  aB as E,
  aa as L,
  a8 as A,
  a9 as M,
  z as b,
  r as j,
  G as T,
  J as G,
  N as R,
} from "./vendor-ui-DDdrexJZ.js";
import { I } from "./input-B9vrc6Q3.js";
import { E as O } from "./empty-state-BFSeK4Tv.js";
import { u as q } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-forms-Ct2mZ2NL.js";
import "./zod-COY_rf8d.js";
import "./forms-zLivl21i.js";
import "./modal-DBBZDXoW.js";
import "./textarea-D7qrlVHg.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
function J({
  formation: r,
  progress: l,
  isAdmin: d,
  onClick: o,
  onTogglePublish: a,
}) {
  return e.jsxs("div", {
    className: p(
      "group relative flex flex-col rounded-xl border border-border bg-white overflow-hidden transition-all",
      "hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50",
    ),
    children: [
      e.jsxs("button", {
        type: "button",
        onClick: o,
        className: "relative cursor-pointer text-left",
        children: [
          r.thumbnail_url
            ? e.jsx("div", {
                className: "aspect-video w-full overflow-hidden",
                children: e.jsx("img", {
                  src: r.thumbnail_url,
                  alt: r.title,
                  className:
                    "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
                }),
              })
            : e.jsx("div", {
                className:
                  "flex aspect-video w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100",
                children: e.jsx(B, { className: "h-10 w-10 text-blue-400" }),
              }),
          d &&
            e.jsx("div", {
              className: "absolute top-2.5 right-2.5",
              children: e.jsx("span", {
                className: p(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm",
                  r.is_published
                    ? "bg-green-500/90 text-white"
                    : "bg-amber-500/90 text-white",
                ),
                children: r.is_published
                  ? e.jsxs(e.Fragment, {
                      children: [e.jsx(E, { className: "h-3 w-3" }), "Publié"],
                    })
                  : e.jsxs(e.Fragment, {
                      children: [
                        e.jsx(L, { className: "h-3 w-3" }),
                        "Brouillon",
                      ],
                    }),
              }),
            }),
        ],
      }),
      e.jsxs("div", {
        className: "flex flex-1 flex-col p-4",
        children: [
          e.jsxs("button", {
            type: "button",
            onClick: o,
            className: "cursor-pointer text-left",
            children: [
              e.jsx("h3", {
                className:
                  "text-sm font-semibold text-foreground group-hover:text-blue-700 transition-colors line-clamp-1",
                children: r.title,
              }),
              r.description &&
                e.jsx("p", {
                  className:
                    "mt-1.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed",
                  children: r.description,
                }),
            ],
          }),
          l &&
            e.jsx("div", {
              className: "mt-auto pt-3",
              children: e.jsx(P, {
                completed: l.completed,
                total: l.total,
                size: "sm",
              }),
            }),
          d &&
            a &&
            e.jsx("div", {
              className: "mt-3 pt-3 border-t border-border",
              children: r.is_published
                ? e.jsx(x, {
                    variant: "secondary",
                    size: "sm",
                    className: "w-full text-muted-foreground",
                    icon: e.jsx(A, { className: "h-3.5 w-3.5" }),
                    onClick: (i) => {
                      (i.stopPropagation(), a(!1));
                    },
                    children: "Mettre en privé",
                  })
                : e.jsx(x, {
                    size: "sm",
                    className:
                      "w-full bg-green-600 hover:bg-green-700 text-white shadow-none",
                    icon: e.jsx(M, { className: "h-3.5 w-3.5" }),
                    onClick: (i) => {
                      (i.stopPropagation(), a(!0));
                    },
                    children: "Publier",
                  }),
            }),
        ],
      }),
    ],
  });
}
function oe() {
  q("Formations");
  const r = C(),
    { isAdmin: l, isProspect: d } = _(),
    { data: o, isLoading: a } = F(d),
    i = S(),
    [v, h] = u.useState(!1),
    [c, N] = u.useState(""),
    [m, w] = u.useState("all"),
    f = u.useMemo(() => {
      if (!o) return [];
      let s = o;
      if (
        (m === "published"
          ? (s = s.filter((t) => t.is_published))
          : m === "draft" && (s = s.filter((t) => !t.is_published)),
        c.trim())
      ) {
        const t = c.toLowerCase();
        s = s.filter(
          (g) =>
            g.title.toLowerCase().includes(t) ||
            g.description?.toLowerCase().includes(t),
        );
      }
      return s;
    }, [o, c, m]),
    y = (s, t) => {
      (!t &&
        !window.confirm(
          "Êtes-vous sûr de vouloir mettre cette formation en privé ?",
        )) ||
        i.mutate({ id: s, is_published: t });
    },
    k = [
      { key: "all", label: "Toutes" },
      { key: "published", label: "Publiées" },
      { key: "draft", label: "Brouillons" },
    ];
  return e.jsxs("div", {
    className: "space-y-6",
    children: [
      e.jsxs("div", {
        className: "flex items-center justify-between",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("h1", {
                className: "text-xl sm:text-2xl font-bold text-foreground",
                children: "Formations",
              }),
              e.jsx("p", {
                className: "text-sm text-muted-foreground mt-1",
                children: l
                  ? "Créez et gérez vos formations."
                  : "Suivez vos formations et votre progression.",
              }),
            ],
          }),
          l &&
            e.jsx(x, {
              onClick: () => h(!0),
              icon: e.jsx(b, { className: "h-4 w-4" }),
              children: "Nouvelle formation",
            }),
        ],
      }),
      !a &&
        o &&
        o.length > 0 &&
        e.jsxs("div", {
          className: "flex flex-col sm:flex-row gap-3",
          children: [
            e.jsxs("div", {
              className: "relative flex-1",
              children: [
                e.jsx(j, {
                  className:
                    "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                }),
                e.jsx(I, {
                  placeholder: "Rechercher une formation...",
                  value: c,
                  onChange: (s) => N(s.target.value),
                  className: "pl-9",
                }),
              ],
            }),
            l &&
              e.jsx("div", {
                className:
                  "flex items-center gap-1 rounded-xl border border-border bg-white p-1",
                children: k.map((s) =>
                  e.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => w(s.key),
                      className: p(
                        "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                        m === s.key
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      ),
                      children: s.label,
                    },
                    s.key,
                  ),
                ),
              }),
          ],
        }),
      a
        ? e.jsx("div", {
            className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
            children: Array.from({ length: 6 }).map((s, t) =>
              e.jsxs(
                "div",
                {
                  className:
                    "rounded-xl border border-border overflow-hidden bg-white",
                  children: [
                    e.jsx(n, { className: "aspect-video w-full" }),
                    e.jsxs("div", {
                      className: "p-4 space-y-2",
                      children: [
                        e.jsx(n, { className: "h-4 w-3/4" }),
                        e.jsx(n, { className: "h-3 w-full" }),
                        e.jsx(n, { className: "h-3 w-2/3" }),
                        e.jsx(n, { className: "h-2 w-full rounded-full mt-4" }),
                      ],
                    }),
                  ],
                },
                t,
              ),
            ),
          })
        : !o || o.length === 0
          ? e.jsx(O, {
              icon: e.jsx(T, { className: "h-6 w-6" }),
              title: "Aucune formation",
              description: l
                ? "Créez votre première formation pour commencer."
                : "Aucune formation disponible pour le moment.",
              action: l
                ? e.jsx(x, {
                    onClick: () => h(!0),
                    icon: e.jsx(b, { className: "h-4 w-4" }),
                    children: "Créer une formation",
                  })
                : void 0,
            })
          : f.length === 0
            ? e.jsxs("div", {
                className:
                  "flex flex-col items-center justify-center py-16 text-center",
                children: [
                  e.jsx(j, {
                    className: "h-10 w-10 text-muted-foreground/40 mb-3",
                  }),
                  e.jsx("p", {
                    className: "text-sm font-medium text-foreground",
                    children: "Aucun résultat",
                  }),
                  e.jsx("p", {
                    className: "text-xs text-muted-foreground mt-1",
                    children: "Essayez de modifier vos critères de recherche.",
                  }),
                ],
              })
            : e.jsx(G, {
                mode: "popLayout",
                children: e.jsx("div", {
                  className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
                  children: f.map((s) =>
                    e.jsx(
                      R.div,
                      {
                        layout: !0,
                        initial: { opacity: 0, scale: 0.95 },
                        animate: { opacity: 1, scale: 1 },
                        exit: { opacity: 0, scale: 0.95 },
                        transition: { duration: 0.2 },
                        children: e.jsx(J, {
                          formation: s,
                          isAdmin: l,
                          onClick: () => r(`/formations/${s.id}`),
                          onTogglePublish: l ? (t) => y(s.id, t) : void 0,
                        }),
                      },
                      s.id,
                    ),
                  ),
                }),
              }),
      e.jsx(z, { open: v, onClose: () => h(!1) }),
    ],
  });
}
export { oe as default };
