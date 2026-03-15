import { u as Q, a as q, b as w, j as e } from "./vendor-query-sBpsl8Kt.js";
import { r as c } from "./vendor-react-Cci7g3Cb.js";
import { s as j, S as _, h as A, t as O, v as R } from "./index-DY9GA2La.js";
import {
  t as h,
  z as k,
  aw as I,
  al as L,
  a1 as U,
  aJ as $,
} from "./vendor-ui-DDdrexJZ.js";
import { I as v, u as B, v as z } from "./constants-IBlSVYu1.js";
import { u as K } from "./vendor-forms-Ct2mZ2NL.js";
import { a as Y } from "./zod-COY_rf8d.js";
import { M as V } from "./modal-DBBZDXoW.js";
import { I as G } from "./input-B9vrc6Q3.js";
import { S as F } from "./select-E7QvXrZc.js";
import { T as H } from "./textarea-D7qrlVHg.js";
import { B as N } from "./button-DlbP8VPc.js";
import { r as J } from "./forms-zLivl21i.js";
import { S as W } from "./search-input-dECf1iQ_.js";
import { B as X } from "./badge-CFrXqKTx.js";
import { P as Z } from "./pagination-DHo4QjB2.js";
import { E as ee } from "./empty-state-BFSeK4Tv.js";
import { C as se } from "./confirm-dialog-BnX-zJNl.js";
import { u as re } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
function te(a = {}) {
  const { search: s, frequency: r, page: o = 1 } = a,
    i = (o - 1) * v,
    n = i + v - 1;
  return Q({
    queryKey: ["rituals", a],
    queryFn: async () => {
      let l = j
        .from("rituals")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: !1 })
        .range(i, n);
      (s && (l = l.or(`title.ilike.%${s}%,description.ilike.%${s}%`)),
        r && (l = l.eq("frequency", r)));
      const { data: d, error: u, count: m } = await l;
      if (u) throw u;
      return { data: d, count: m ?? 0 };
    },
  });
}
function ae() {
  const a = q();
  return w({
    mutationFn: async (s) => {
      const { data: r, error: o } = await j
        .from("rituals")
        .insert(s)
        .select()
        .single();
      if (o) throw o;
      return r;
    },
    onSuccess: () => {
      (a.invalidateQueries({ queryKey: ["rituals"] }),
        h.success("Rituel créé avec succès"));
    },
    onError: (s) => {
      h.error(`Erreur: ${s.message}`);
    },
  });
}
function ie() {
  const a = q();
  return w({
    mutationFn: async ({ id: s, ...r }) => {
      const { data: o, error: i } = await j
        .from("rituals")
        .update(r)
        .eq("id", s)
        .select()
        .single();
      if (i) throw i;
      return o;
    },
    onSuccess: (s) => {
      (a.invalidateQueries({ queryKey: ["rituals"] }),
        a.setQueryData(["rituals", s.id], s),
        h.success("Rituel mis à jour"));
    },
    onError: (s) => {
      h.error(`Erreur: ${s.message}`);
    },
  });
}
function oe() {
  const a = q();
  return w({
    mutationFn: async (s) => {
      const { error: r } = await j.from("rituals").delete().eq("id", s);
      if (r) throw r;
    },
    onSuccess: () => {
      (a.invalidateQueries({ queryKey: ["rituals"] }),
        h.success("Rituel supprimé"));
    },
    onError: (s) => {
      h.error(`Erreur: ${s.message}`);
    },
  });
}
const ne = [
  { value: "quotidien", label: "Quotidien" },
  { value: "hebdomadaire", label: "Hebdomadaire" },
  { value: "mensuel", label: "Mensuel" },
];
function le({ open: a, onClose: s, editItem: r }) {
  const o = ae(),
    i = ie(),
    n = !!r,
    {
      register: l,
      handleSubmit: d,
      reset: u,
      setValue: m,
      watch: x,
      formState: { errors: p },
    } = K({
      resolver: Y(J),
      defaultValues: { title: "", description: "", frequency: void 0 },
    }),
    y = x("frequency");
  c.useEffect(() => {
    u(
      r
        ? {
            title: r.title,
            description: r.description ?? "",
            frequency: r.frequency,
          }
        : { title: "", description: "", frequency: void 0 },
    );
  }, [r, u]);
  const g = (f) => {
      n
        ? i.mutate(
            { id: r.id, ...f },
            {
              onSuccess: () => {
                (u(), s());
              },
            },
          )
        : o.mutate(f, {
            onSuccess: () => {
              (u(), s());
            },
          });
    },
    b = o.isPending || i.isPending;
  return e.jsx(V, {
    open: a,
    onClose: s,
    title: n ? "Modifier le rituel" : "Nouveau rituel",
    description: n
      ? "Mettre à jour les informations du rituel."
      : "Ajouter un nouveau rituel.",
    size: "md",
    children: e.jsxs("form", {
      onSubmit: d(g),
      className: "space-y-4",
      children: [
        e.jsx(G, {
          label: "Titre *",
          placeholder: "Nom du rituel",
          ...l("title"),
          error: p.title?.message,
        }),
        e.jsx(F, {
          label: "Fréquence",
          options: ne,
          value: y ?? "",
          onChange: (f) => m("frequency", f || void 0),
          placeholder: "Sélectionner une fréquence",
          error: p.frequency?.message,
        }),
        e.jsx(H, {
          label: "Description",
          placeholder: "Description du rituel...",
          rows: 3,
          ...l("description"),
          error: p.description?.message,
        }),
        e.jsxs("div", {
          className: "flex justify-end gap-3 pt-2",
          children: [
            e.jsx(N, {
              type: "button",
              variant: "secondary",
              onClick: s,
              children: "Annuler",
            }),
            e.jsx(N, {
              type: "submit",
              loading: b,
              children: n ? "Enregistrer" : "Créer",
            }),
          ],
        }),
      ],
    }),
  });
}
const ue = [
  { value: "", label: "Toutes les fréquences" },
  { value: "quotidien", label: "Quotidien" },
  { value: "hebdomadaire", label: "Hebdomadaire" },
  { value: "mensuel", label: "Mensuel" },
];
function Me() {
  re("Rituels");
  const [a, s] = c.useState(""),
    [r, o] = c.useState(""),
    [i, n] = c.useState(1),
    [l, d] = c.useState(!1),
    [u, m] = c.useState(null),
    [x, p] = c.useState(null),
    y = c.useMemo(
      () => ({ search: a || void 0, frequency: r || void 0, page: i }),
      [a, r, i],
    ),
    { data: g, isLoading: b } = te(y),
    f = oe(),
    S = c.useMemo(() => g?.data ?? [], [g?.data]),
    E = g?.count ?? 0,
    C = Math.ceil(E / v),
    P = (t) => {
      (m(t), d(!0));
    },
    M = (t) => {
      p(t);
    },
    T = () => {
      x && (f.mutate(x.id), p(null));
    };
  return e.jsxs("div", {
    className: "space-y-8",
    children: [
      e.jsx("div", {
        className:
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
        children: e.jsxs("div", {
          children: [
            e.jsx("h1", {
              className: "text-xl sm:text-2xl font-bold text-foreground",
              children: "Rituels",
            }),
            e.jsx("p", {
              className: "mt-1 text-sm text-muted-foreground",
              children: "Gestion des rituels et de leur fréquence.",
            }),
          ],
        }),
      }),
      e.jsxs("div", {
        className:
          "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        children: [
          e.jsxs("div", {
            className: "flex flex-wrap items-center gap-3",
            children: [
              e.jsx(W, {
                value: a,
                onChange: (t) => {
                  (s(t), n(1));
                },
                placeholder: "Rechercher un rituel...",
                wrapperClassName: "w-full sm:w-64",
              }),
              e.jsx(F, {
                options: ue,
                value: r,
                onChange: (t) => {
                  (o(t), n(1));
                },
                placeholder: "Toutes les fréquences",
                className: "w-full sm:w-52",
              }),
            ],
          }),
          e.jsx("div", {
            className: "flex items-center gap-2",
            children: e.jsx(N, {
              size: "sm",
              icon: e.jsx(k, { className: "h-4 w-4" }),
              onClick: () => {
                (m(null), d(!0));
              },
              children: "Nouveau rituel",
            }),
          }),
        ],
      }),
      b
        ? e.jsx("div", {
            className: "space-y-3",
            children: Array.from({ length: 5 }).map((t, D) =>
              e.jsx(_, { className: "h-16 w-full rounded-xl" }, D),
            ),
          })
        : S.length === 0
          ? e.jsx(ee, {
              icon: e.jsx(I, { className: "h-6 w-6" }),
              title: "Aucun rituel",
              description: a
                ? "Aucun rituel ne correspond."
                : "Créez votre premier rituel pour commencer.",
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
                              children: "Titre",
                            }),
                            e.jsx("th", {
                              className:
                                "px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell",
                              children: "Description",
                            }),
                            e.jsx("th", {
                              className:
                                "px-4 py-3 font-semibold text-muted-foreground",
                              children: "Fréquence",
                            }),
                            e.jsx("th", {
                              className:
                                "px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell",
                              children: "Créé le",
                            }),
                            e.jsx("th", { className: "px-4 py-3 w-10" }),
                          ],
                        }),
                      }),
                      e.jsx("tbody", {
                        className: "divide-y divide-border/30",
                        children: S.map((t) =>
                          e.jsxs(
                            "tr",
                            {
                              className: "hover:bg-muted/20 transition-colors",
                              children: [
                                e.jsx("td", {
                                  className:
                                    "px-4 py-3 font-medium text-foreground",
                                  children: t.title,
                                }),
                                e.jsx("td", {
                                  className:
                                    "px-4 py-3 text-muted-foreground hidden md:table-cell",
                                  children: t.description ?? "—",
                                }),
                                e.jsx("td", {
                                  className: "px-4 py-3",
                                  children: t.frequency
                                    ? e.jsx(X, {
                                        className: z[t.frequency],
                                        children: B[t.frequency],
                                      })
                                    : e.jsx("span", {
                                        className: "text-muted-foreground",
                                        children: "—",
                                      }),
                                }),
                                e.jsx("td", {
                                  className:
                                    "px-4 py-3 text-muted-foreground hidden lg:table-cell",
                                  children: A(t.created_at),
                                }),
                                e.jsx("td", {
                                  className: "px-4 py-3",
                                  children: e.jsxs(O, {
                                    align: "right",
                                    trigger: e.jsx("button", {
                                      className:
                                        "rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer",
                                      children: e.jsx($, {
                                        className: "h-4 w-4",
                                      }),
                                    }),
                                    children: [
                                      e.jsx(R, {
                                        onClick: () => P(t),
                                        icon: e.jsx(L, {
                                          className: "h-4 w-4",
                                        }),
                                        children: "Modifier",
                                      }),
                                      e.jsx(R, {
                                        onClick: () => M(t),
                                        destructive: !0,
                                        icon: e.jsx(U, {
                                          className: "h-4 w-4",
                                        }),
                                        children: "Supprimer",
                                      }),
                                    ],
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
                C > 1 &&
                  e.jsx(Z, {
                    currentPage: i,
                    totalPages: C,
                    onPageChange: n,
                    totalItems: E,
                  }),
              ],
            }),
      e.jsx(le, {
        open: l,
        onClose: () => {
          (d(!1), m(null));
        },
        editItem: u,
      }),
      e.jsx(se, {
        open: !!x,
        onClose: () => p(null),
        onConfirm: T,
        title: "Supprimer le rituel",
        description: `Êtes-vous sûr de vouloir supprimer "${x?.title}" ? Cette action est irréversible.`,
        confirmLabel: "Supprimer",
        variant: "destructive",
      }),
    ],
  });
}
export { Me as default };
