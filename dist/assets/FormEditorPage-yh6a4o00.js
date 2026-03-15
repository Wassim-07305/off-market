import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { k as W, f as Y, r as m } from "./vendor-react-Cci7g3Cb.js";
import {
  c as J,
  d as K,
  e as Q,
  f as X,
  g as Z,
  h as ee,
} from "./useForms-BjBbdMcT.js";
import { B as C } from "./button-DlbP8VPc.js";
import { B as q } from "./badge-CFrXqKTx.js";
import { C as v, d as N } from "./card-Dkj99_H3.js";
import { T as se, a as F } from "./tabs-oT6f7FFv.js";
import { S as D, c as f, h as O } from "./index-DY9GA2La.js";
import { E as T } from "./empty-state-BFSeK4Tv.js";
import { C as re } from "./confirm-dialog-BnX-zJNl.js";
import { e as te } from "./csv-DLhVFTuh.js";
import { u as ae } from "./usePageTitle-I7G4QvKX.js";
import {
  a_ as z,
  ad as le,
  a$ as oe,
  b as I,
  z as ie,
  b0 as B,
  b1 as ne,
  O as de,
  a7 as ce,
  b2 as ue,
  b3 as me,
  C as xe,
  aq as V,
  aS as M,
  aU as pe,
  ar as he,
  an as be,
  _ as ge,
  $ as fe,
  a1 as je,
} from "./vendor-ui-DDdrexJZ.js";
import "./constants-IBlSVYu1.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
import "./modal-DBBZDXoW.js";
const A = [
  { value: "text", label: "Texte court", icon: B },
  { value: "textarea", label: "Texte long", icon: ne },
  { value: "number", label: "Nombre", icon: de },
  { value: "email", label: "Email", icon: ce },
  { value: "select", label: "Liste déroulante", icon: I },
  { value: "radio", label: "Choix unique", icon: ue },
  { value: "checkbox", label: "Cases à cocher", icon: me },
  { value: "date", label: "Date", icon: xe },
  { value: "file", label: "Fichier", icon: V },
  { value: "rating", label: "Évaluation", icon: M },
];
function ve(s) {
  return A.find((o) => o.value === s)?.icon ?? B;
}
function Ne(s) {
  return A.find((o) => o.value === s)?.label ?? s;
}
function ye({
  field: s,
  index: o,
  total: r,
  onUpdate: d,
  onDelete: t,
  onMoveUp: h,
  onMoveDown: x,
}) {
  const [i, c] = m.useState(!1),
    n = ve(s.field_type),
    b = ["select", "radio", "checkbox"].includes(s.field_type),
    g = s.options?.choices ?? [];
  return e.jsx(v, {
    className: f("group transition-all", i && "ring-2 ring-primary/20"),
    children: e.jsxs(N, {
      className: "p-0",
      children: [
        e.jsxs("div", {
          className: "flex items-center gap-3 px-4 py-3 cursor-pointer",
          onClick: () => c(!i),
          children: [
            e.jsx(be, {
              className: "h-4 w-4 text-muted-foreground/50 shrink-0",
            }),
            e.jsx("div", {
              className:
                "flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0",
              children: e.jsx(n, { className: "h-4 w-4 text-primary" }),
            }),
            e.jsxs("div", {
              className: "flex-1 min-w-0",
              children: [
                e.jsx("p", {
                  className: "text-sm font-medium text-foreground truncate",
                  children: s.label || "Sans titre",
                }),
                e.jsxs("p", {
                  className: "text-xs text-muted-foreground",
                  children: [
                    Ne(s.field_type),
                    s.is_required && " • Obligatoire",
                  ],
                }),
              ],
            }),
            e.jsxs("div", {
              className: "flex items-center gap-1 shrink-0",
              children: [
                e.jsx("button", {
                  onClick: (l) => {
                    (l.stopPropagation(), h());
                  },
                  disabled: o === 0,
                  className:
                    "rounded-md p-1 text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors",
                  children: e.jsx(ge, { className: "h-4 w-4" }),
                }),
                e.jsx("button", {
                  onClick: (l) => {
                    (l.stopPropagation(), x());
                  },
                  disabled: o === r - 1,
                  className:
                    "rounded-md p-1 text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors",
                  children: e.jsx(fe, { className: "h-4 w-4" }),
                }),
                e.jsx("button", {
                  onClick: (l) => {
                    (l.stopPropagation(), t(s.id));
                  },
                  className:
                    "rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors",
                  children: e.jsx(je, { className: "h-4 w-4" }),
                }),
              ],
            }),
          ],
        }),
        i &&
          e.jsxs("div", {
            className: "border-t border-border/50 px-4 py-4 space-y-4",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("label", {
                    className:
                      "mb-1.5 block text-xs font-medium text-muted-foreground",
                    children: "Libellé du champ",
                  }),
                  e.jsx("input", {
                    type: "text",
                    value: s.label,
                    onChange: (l) => d(s.id, { label: l.target.value }),
                    placeholder: "Ex: Votre nom complet",
                    className:
                      "h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                  }),
                ],
              }),
              e.jsxs("div", {
                children: [
                  e.jsxs("label", {
                    className:
                      "mb-1.5 block text-xs font-medium text-muted-foreground",
                    children: [
                      "Description",
                      " ",
                      e.jsx("span", {
                        className: "text-muted-foreground/60",
                        children: "(optionnel)",
                      }),
                    ],
                  }),
                  e.jsx("input", {
                    type: "text",
                    value: s.description ?? "",
                    onChange: (l) =>
                      d(s.id, { description: l.target.value || null }),
                    placeholder: "Texte d'aide sous le champ",
                    className:
                      "h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                  }),
                ],
              }),
              !["checkbox", "radio", "file", "rating"].includes(s.field_type) &&
                e.jsxs("div", {
                  children: [
                    e.jsx("label", {
                      className:
                        "mb-1.5 block text-xs font-medium text-muted-foreground",
                      children: "Placeholder",
                    }),
                    e.jsx("input", {
                      type: "text",
                      value: s.placeholder ?? "",
                      onChange: (l) =>
                        d(s.id, { placeholder: l.target.value || null }),
                      placeholder: "Texte indicatif",
                      className:
                        "h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                    }),
                  ],
                }),
              b &&
                e.jsxs("div", {
                  children: [
                    e.jsxs("label", {
                      className:
                        "mb-1.5 block text-xs font-medium text-muted-foreground",
                      children: [
                        "Options",
                        " ",
                        e.jsx("span", {
                          className: "text-muted-foreground/60",
                          children: "(une par ligne)",
                        }),
                      ],
                    }),
                    e.jsx("textarea", {
                      value: g.join(`
`),
                      onChange: (l) => {
                        const k = l.target.value.split(`
`);
                        d(s.id, { options: { choices: k } });
                      },
                      placeholder: `Option 1
Option 2
Option 3`,
                      rows: 4,
                      className:
                        "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none",
                    }),
                  ],
                }),
              e.jsxs("div", {
                className:
                  "flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-4 py-3",
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("p", {
                        className: "text-sm font-medium text-foreground",
                        children: "Champ obligatoire",
                      }),
                      e.jsx("p", {
                        className: "text-xs text-muted-foreground",
                        children: "Le répondant devra remplir ce champ",
                      }),
                    ],
                  }),
                  e.jsx("button", {
                    onClick: () => d(s.id, { is_required: !s.is_required }),
                    className: f(
                      "relative h-6 w-11 rounded-full transition-colors cursor-pointer",
                      s.is_required ? "bg-primary" : "bg-border",
                    ),
                    children: e.jsx("div", {
                      className: f(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                        s.is_required ? "translate-x-5" : "translate-x-0.5",
                      ),
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
function we({ fields: s, title: o }) {
  return e.jsxs("div", {
    className: "space-y-5",
    children: [
      e.jsx("h3", {
        className: "text-lg font-bold text-foreground",
        children: o || "Sans titre",
      }),
      s.length === 0
        ? e.jsx("p", {
            className: "text-sm text-muted-foreground italic",
            children: "Aucun champ ajouté",
          })
        : s.map((r) => {
            const d = r.options?.choices ?? [];
            return e.jsxs(
              "div",
              {
                className: "space-y-1.5",
                children: [
                  e.jsxs("label", {
                    className: "block text-sm font-medium text-foreground",
                    children: [
                      r.label || "Sans titre",
                      r.is_required &&
                        e.jsx("span", {
                          className: "ml-1 text-destructive",
                          children: "*",
                        }),
                    ],
                  }),
                  r.description &&
                    e.jsx("p", {
                      className: "text-xs text-muted-foreground",
                      children: r.description,
                    }),
                  r.field_type === "textarea"
                    ? e.jsx("textarea", {
                        disabled: !0,
                        placeholder: r.placeholder ?? "",
                        rows: 3,
                        className:
                          "w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm resize-none",
                      })
                    : r.field_type === "select"
                      ? e.jsxs("select", {
                          disabled: !0,
                          className:
                            "h-10 w-full rounded-lg border border-border bg-muted/20 px-3 text-sm",
                          children: [
                            e.jsx("option", {
                              children: r.placeholder || "Sélectionner...",
                            }),
                            d.map((t) => e.jsx("option", { children: t }, t)),
                          ],
                        })
                      : r.field_type === "radio"
                        ? e.jsx("div", {
                            className: "space-y-2",
                            children: d.map((t) =>
                              e.jsxs(
                                "label",
                                {
                                  className:
                                    "flex items-center gap-2 text-sm text-foreground",
                                  children: [
                                    e.jsx("input", {
                                      type: "radio",
                                      disabled: !0,
                                      className: "h-4 w-4",
                                    }),
                                    t,
                                  ],
                                },
                                t,
                              ),
                            ),
                          })
                        : r.field_type === "checkbox"
                          ? e.jsx("div", {
                              className: "space-y-2",
                              children: d.map((t) =>
                                e.jsxs(
                                  "label",
                                  {
                                    className:
                                      "flex items-center gap-2 text-sm text-foreground",
                                    children: [
                                      e.jsx("input", {
                                        type: "checkbox",
                                        disabled: !0,
                                        className: "h-4 w-4 rounded",
                                      }),
                                      t,
                                    ],
                                  },
                                  t,
                                ),
                              ),
                            })
                          : r.field_type === "rating"
                            ? e.jsx("div", {
                                className: "flex gap-1",
                                children: [1, 2, 3, 4, 5].map((t) =>
                                  e.jsx(
                                    M,
                                    {
                                      className:
                                        "h-6 w-6 text-muted-foreground/30",
                                    },
                                    t,
                                  ),
                                ),
                              })
                            : r.field_type === "file"
                              ? e.jsxs("div", {
                                  className:
                                    "flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 text-sm text-muted-foreground",
                                  children: [
                                    e.jsx(V, { className: "mr-2 h-4 w-4" }),
                                    "Glisser un fichier ici",
                                  ],
                                })
                              : e.jsx("input", {
                                  type:
                                    r.field_type === "email"
                                      ? "email"
                                      : r.field_type === "number"
                                        ? "number"
                                        : r.field_type === "date"
                                          ? "date"
                                          : "text",
                                  disabled: !0,
                                  placeholder: r.placeholder ?? "",
                                  className:
                                    "h-10 w-full rounded-lg border border-border bg-muted/20 px-3 text-sm",
                                }),
                ],
              },
              r.id,
            );
          }),
    ],
  });
}
function Ce({ formId: s, fields: o }) {
  const { data: r, isLoading: d } = ee(s),
    t = r?.data ?? [],
    h = r?.count ?? 0,
    x = m.useCallback(() => {
      if (t.length === 0) return;
      const i = [
          { key: "_date", label: "Date" },
          ...o.map((n) => ({ key: n.id, label: n.label || n.field_type })),
        ],
        c = t.map((n) => {
          const b = { _date: O(n.submitted_at) };
          for (const g of o) {
            const l = n.answers?.[g.id];
            b[g.id] = l != null ? String(l) : "";
          }
          return b;
        });
      te(c, i, "formulaire-reponses");
    }, [t, o]);
  return d
    ? e.jsx("div", {
        className: "space-y-3",
        children: Array.from({ length: 5 }).map((i, c) =>
          e.jsx(D, { className: "h-14 w-full rounded-xl" }, c),
        ),
      })
    : t.length === 0
      ? e.jsx(T, {
          icon: e.jsx(pe, { className: "h-6 w-6" }),
          title: "Aucune réponse",
          description: "Les réponses à ce formulaire apparaîtront ici.",
        })
      : e.jsxs("div", {
          className: "space-y-4",
          children: [
            e.jsxs("div", {
              className: "flex items-center justify-between",
              children: [
                e.jsxs("p", {
                  className: "text-sm text-muted-foreground",
                  children: [h, " réponse", h > 1 ? "s" : ""],
                }),
                e.jsx(C, {
                  variant: "secondary",
                  size: "sm",
                  icon: e.jsx(he, { className: "h-4 w-4" }),
                  onClick: x,
                  children: "Exporter CSV",
                }),
              ],
            }),
            e.jsx("div", {
              className: "overflow-x-auto rounded-xl border border-border/40",
              children: e.jsxs("table", {
                className: "w-full text-left text-sm",
                children: [
                  e.jsx("thead", {
                    className: "border-b border-border/40 bg-muted/30",
                    children: e.jsxs("tr", {
                      children: [
                        e.jsx("th", {
                          className:
                            "px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap",
                          children: "Date",
                        }),
                        o.map((i) =>
                          e.jsx(
                            "th",
                            {
                              className:
                                "px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap max-w-48",
                              children: i.label || i.field_type,
                            },
                            i.id,
                          ),
                        ),
                      ],
                    }),
                  }),
                  e.jsx("tbody", {
                    className: "divide-y divide-border/30",
                    children: t.map((i) =>
                      e.jsxs(
                        "tr",
                        {
                          className: "hover:bg-muted/20 transition-colors",
                          children: [
                            e.jsx("td", {
                              className:
                                "px-4 py-3 text-muted-foreground whitespace-nowrap",
                              children: O(i.submitted_at),
                            }),
                            o.map((c) => {
                              const n = i.answers?.[c.id],
                                b =
                                  n == null
                                    ? "—"
                                    : Array.isArray(n)
                                      ? n.join(", ")
                                      : String(n);
                              return e.jsx(
                                "td",
                                {
                                  className:
                                    "px-4 py-3 text-foreground max-w-48 truncate",
                                  children: b,
                                },
                                c.id,
                              );
                            }),
                          ],
                        },
                        i.id,
                      ),
                    ),
                  }),
                ],
              }),
            }),
          ],
        });
}
function Re() {
  ae("Éditeur de formulaire");
  const { id: s } = W(),
    o = Y(),
    { data: r, isLoading: d } = J(s),
    t = K(),
    h = Q(),
    x = X(),
    i = Z(),
    [c, n] = m.useState("editeur"),
    [b, g] = m.useState(null),
    [l, k] = m.useState(null),
    [y, _] = m.useState(null),
    w = b ?? r?.title ?? "",
    S = l ?? r?.description ?? "",
    u = m.useMemo(() => r?.fields ?? [], [r?.fields]),
    R = m.useCallback(async () => {
      if (s)
        try {
          await t.mutateAsync({ id: s, title: w, description: S || null });
        } catch {}
    }, [s, w, S, t]),
    U = m.useCallback(async () => {
      if (!s) return;
      const a = r?.status === "publié" ? "brouillon" : "publié";
      try {
        await t.mutateAsync({ id: s, status: a });
      } catch {}
    }, [s, r?.status, t]),
    G = m.useCallback(
      async (a) => {
        if (s)
          try {
            await h.mutateAsync({
              form_id: s,
              field_type: a,
              label: "",
              description: null,
              placeholder: null,
              is_required: !1,
              options: ["select", "radio", "checkbox"].includes(a)
                ? { choices: ["Option 1", "Option 2"] }
                : null,
              validation: null,
              conditional_logic: null,
              sort_order: u.length,
            });
          } catch {}
      },
      [s, u.length, h],
    ),
    $ = m.useCallback(
      (a, p) => {
        x.mutate({ id: a, ...p });
      },
      [x],
    ),
    H = m.useCallback(() => {
      !y || !s || (i.mutate({ id: y, formId: s }), _(null));
    }, [y, s, i]),
    P = m.useCallback(
      (a, p) => {
        const j = p === "up" ? a - 1 : a + 1;
        if (j < 0 || j >= u.length) return;
        const E = u[a],
          L = u[j];
        (x.mutate({ id: E.id, sort_order: L.sort_order }),
          x.mutate({ id: L.id, sort_order: E.sort_order }));
      },
      [u, x],
    );
  return d
    ? e.jsxs("div", {
        className: "space-y-6",
        children: [
          e.jsx(D, { className: "h-10 w-64" }),
          e.jsx(D, { className: "h-64 w-full rounded-xl" }),
        ],
      })
    : r
      ? e.jsxs("div", {
          className: "space-y-6",
          children: [
            e.jsxs("div", {
              className:
                "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
              children: [
                e.jsxs("div", {
                  className: "flex items-center gap-3",
                  children: [
                    e.jsx("button", {
                      onClick: () => o("/formulaires"),
                      className:
                        "rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer",
                      children: e.jsx(le, { className: "h-5 w-5" }),
                    }),
                    e.jsx("div", {
                      children: e.jsxs("div", {
                        className: "flex items-center gap-2",
                        children: [
                          e.jsx("h1", {
                            className: "text-xl font-bold text-foreground",
                            children: "Éditeur de formulaire",
                          }),
                          e.jsx(q, {
                            className: f(
                              r.status === "publié"
                                ? "bg-green-100 text-green-700"
                                : r.status === "fermé"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700",
                            ),
                            children:
                              r.status === "publié"
                                ? "Publié"
                                : r.status === "fermé"
                                  ? "Fermé"
                                  : "Brouillon",
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
                e.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    e.jsx(C, {
                      variant: "secondary",
                      size: "sm",
                      onClick: U,
                      loading: t.isPending,
                      children: r.status === "publié" ? "Dépublier" : "Publier",
                    }),
                    e.jsx(C, {
                      size: "sm",
                      icon: e.jsx(oe, { className: "h-4 w-4" }),
                      onClick: R,
                      loading: t.isPending,
                      children: "Enregistrer",
                    }),
                  ],
                }),
              ],
            }),
            e.jsx(se, {
              tabs: [
                { value: "editeur", label: "Éditeur" },
                { value: "apercu", label: "Aperçu" },
                { value: "reponses", label: "Réponses" },
              ],
              value: c,
              onChange: n,
            }),
            e.jsx(F, {
              value: "apercu",
              activeValue: c,
              children: e.jsx(v, {
                children: e.jsx(N, {
                  className: "p-6 sm:p-8",
                  children: e.jsx(we, { fields: u, title: w }),
                }),
              }),
            }),
            e.jsx(F, {
              value: "reponses",
              activeValue: c,
              children: e.jsx(Ce, { formId: s, fields: u }),
            }),
            e.jsx(F, {
              value: "editeur",
              activeValue: c,
              children: e.jsxs("div", {
                className: "grid gap-6 lg:grid-cols-3",
                children: [
                  e.jsxs("div", {
                    className: "lg:col-span-2 space-y-6",
                    children: [
                      e.jsx(v, {
                        children: e.jsxs(N, {
                          className: "p-5 space-y-4",
                          children: [
                            e.jsxs("div", {
                              children: [
                                e.jsx("label", {
                                  className:
                                    "mb-1.5 block text-xs font-medium text-muted-foreground",
                                  children: "Titre du formulaire",
                                }),
                                e.jsx("input", {
                                  type: "text",
                                  value: w,
                                  onChange: (a) => g(a.target.value),
                                  placeholder: "Ex: Formulaire de satisfaction",
                                  className:
                                    "h-11 w-full rounded-xl border border-border bg-white px-4 text-base font-semibold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20",
                                }),
                              ],
                            }),
                            e.jsxs("div", {
                              children: [
                                e.jsxs("label", {
                                  className:
                                    "mb-1.5 block text-xs font-medium text-muted-foreground",
                                  children: [
                                    "Description",
                                    " ",
                                    e.jsx("span", {
                                      className: "text-muted-foreground/60",
                                      children: "(optionnel)",
                                    }),
                                  ],
                                }),
                                e.jsx("textarea", {
                                  value: S,
                                  onChange: (a) => k(a.target.value),
                                  placeholder:
                                    "Décrivez l'objectif de ce formulaire...",
                                  rows: 2,
                                  className:
                                    "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none",
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                      u.length === 0
                        ? e.jsx(T, {
                            icon: e.jsx(I, { className: "h-6 w-6" }),
                            title: "Aucun champ",
                            description:
                              "Ajoutez des champs depuis le panneau à droite pour construire votre formulaire.",
                          })
                        : e.jsx("div", {
                            className: "space-y-3",
                            children: u.map((a, p) =>
                              e.jsx(
                                ye,
                                {
                                  field: a,
                                  index: p,
                                  total: u.length,
                                  onUpdate: $,
                                  onDelete: (j) => _(j),
                                  onMoveUp: () => P(p, "up"),
                                  onMoveDown: () => P(p, "down"),
                                },
                                a.id,
                              ),
                            ),
                          }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "space-y-4",
                    children: [
                      e.jsx(v, {
                        className: "sticky top-6",
                        children: e.jsxs(N, {
                          className: "p-5",
                          children: [
                            e.jsxs("h3", {
                              className:
                                "mb-4 text-sm font-semibold text-foreground flex items-center gap-2",
                              children: [
                                e.jsx(ie, { className: "h-4 w-4" }),
                                "Ajouter un champ",
                              ],
                            }),
                            e.jsx("div", {
                              className: "grid grid-cols-2 gap-2",
                              children: A.map((a) => {
                                const p = a.icon;
                                return e.jsxs(
                                  "button",
                                  {
                                    onClick: () => G(a.value),
                                    disabled: h.isPending,
                                    className: f(
                                      "flex flex-col items-center gap-1.5 rounded-xl border border-border/50 bg-white p-3",
                                      "text-xs font-medium text-muted-foreground",
                                      "transition-all duration-150 cursor-pointer",
                                      "hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
                                      "disabled:opacity-50 disabled:cursor-not-allowed",
                                    ),
                                    children: [
                                      e.jsx(p, { className: "h-5 w-5" }),
                                      a.label,
                                    ],
                                  },
                                  a.value,
                                );
                              }),
                            }),
                          ],
                        }),
                      }),
                      e.jsx(v, {
                        children: e.jsxs(N, {
                          className: "p-5 space-y-3",
                          children: [
                            e.jsxs("h3", {
                              className:
                                "text-sm font-semibold text-foreground flex items-center gap-2",
                              children: [
                                e.jsx(z, { className: "h-4 w-4" }),
                                "Résumé",
                              ],
                            }),
                            e.jsxs("div", {
                              className: "space-y-2 text-sm",
                              children: [
                                e.jsxs("div", {
                                  className: "flex justify-between",
                                  children: [
                                    e.jsx("span", {
                                      className: "text-muted-foreground",
                                      children: "Champs",
                                    }),
                                    e.jsx("span", {
                                      className: "font-medium text-foreground",
                                      children: u.length,
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className: "flex justify-between",
                                  children: [
                                    e.jsx("span", {
                                      className: "text-muted-foreground",
                                      children: "Obligatoires",
                                    }),
                                    e.jsx("span", {
                                      className: "font-medium text-foreground",
                                      children: u.filter((a) => a.is_required)
                                        .length,
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className: "flex justify-between",
                                  children: [
                                    e.jsx("span", {
                                      className: "text-muted-foreground",
                                      children: "Statut",
                                    }),
                                    e.jsx(q, {
                                      className: f(
                                        "text-[10px]",
                                        r.status === "publié"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-gray-100 text-gray-700",
                                      ),
                                      children:
                                        r.status === "publié"
                                          ? "Publié"
                                          : "Brouillon",
                                    }),
                                  ],
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
            e.jsx(re, {
              open: !!y,
              onClose: () => _(null),
              onConfirm: H,
              title: "Supprimer le champ",
              description:
                "Êtes-vous sûr de vouloir supprimer ce champ ? Cette action est irréversible.",
              confirmLabel: "Supprimer",
              variant: "destructive",
            }),
          ],
        })
      : e.jsx(T, {
          icon: e.jsx(z, { className: "h-6 w-6" }),
          title: "Formulaire introuvable",
          description: "Ce formulaire n'existe pas ou a été supprimé.",
          action: e.jsx(C, {
            variant: "secondary",
            onClick: () => o("/formulaires"),
            children: "Retour aux formulaires",
          }),
        });
}
export { Re as default };
