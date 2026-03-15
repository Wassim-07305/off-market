import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { r as a } from "./vendor-react-Cci7g3Cb.js";
import {
  a as V,
  b as z,
  c as B,
  u as F,
  d as R,
} from "./useClients-oFN0czBK.js";
import { u as U } from "./vendor-forms-Ct2mZ2NL.js";
import { a as q } from "./zod-COY_rf8d.js";
import { M as G } from "./modal-DBBZDXoW.js";
import { I as y } from "./input-B9vrc6Q3.js";
import { S as E } from "./select-E7QvXrZc.js";
import { T as $ } from "./textarea-D7qrlVHg.js";
import { B as j } from "./button-DlbP8VPc.js";
import { g as J } from "./forms-zLivl21i.js";
import { C as H } from "./CSVImportModal-DBes1YXg.js";
import { S as K } from "./search-input-dECf1iQ_.js";
import { B as Q } from "./badge-CFrXqKTx.js";
import { P as W } from "./pagination-DHo4QjB2.js";
import { S as X, h as Y, t as Z, v as k } from "./index-DY9GA2La.js";
import { E as ee } from "./empty-state-BFSeK4Tv.js";
import { C as se } from "./confirm-dialog-BnX-zJNl.js";
import { e as te } from "./csv-DLhVFTuh.js";
import { t as ae, I as le } from "./constants-IBlSVYu1.js";
import {
  t as re,
  aq as oe,
  ar as ne,
  z as ie,
  B as ce,
  al as me,
  a1 as de,
  aJ as ue,
} from "./vendor-ui-DDdrexJZ.js";
import { u as pe } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
const xe = [
  { value: "actif", label: "Actif" },
  { value: "inactif", label: "Inactif" },
  { value: "archivé", label: "Archivé" },
];
function he({ open: i, onClose: c, editItem: t }) {
  const g = V(),
    m = z(),
    r = !!t,
    {
      register: d,
      handleSubmit: x,
      reset: n,
      setValue: h,
      watch: u,
      formState: { errors: l },
    } = U({
      resolver: q(J),
      defaultValues: {
        name: "",
        email: "",
        phone: "",
        notes: "",
        status: "actif",
      },
    }),
    C = u("status");
  a.useEffect(() => {
    n(
      t
        ? {
            name: t.name,
            email: t.email ?? "",
            phone: t.phone ?? "",
            notes: t.notes ?? "",
            status: t.status,
          }
        : { name: "", email: "", phone: "", notes: "", status: "actif" },
    );
  }, [t, n]);
  const b = (p) => {
      r
        ? m.mutate(
            { id: t.id, ...p },
            {
              onSuccess: () => {
                (n(), c());
              },
            },
          )
        : g.mutate(p, {
            onSuccess: () => {
              (n(), c());
            },
          });
    },
    N = g.isPending || m.isPending;
  return e.jsx(G, {
    open: i,
    onClose: c,
    title: r ? "Modifier le client" : "Nouveau client",
    description: r
      ? "Mettre à jour les informations du client."
      : "Ajouter un nouveau client au CRM.",
    size: "md",
    children: e.jsxs("form", {
      onSubmit: x(b),
      className: "space-y-4",
      children: [
        e.jsx(y, {
          label: "Nom *",
          placeholder: "Nom du client",
          ...d("name"),
          error: l.name?.message,
        }),
        e.jsxs("div", {
          className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
          children: [
            e.jsx(y, {
              label: "Email",
              type: "email",
              placeholder: "email@exemple.fr",
              ...d("email"),
              error: l.email?.message,
            }),
            e.jsx(y, {
              label: "Téléphone",
              placeholder: "06 12 34 56 78",
              ...d("phone"),
              error: l.phone?.message,
            }),
          ],
        }),
        e.jsx(E, {
          label: "Statut",
          options: xe,
          value: C,
          onChange: (p) => h("status", p),
          error: l.status?.message,
        }),
        e.jsx($, {
          label: "Notes",
          placeholder: "Notes sur le client...",
          rows: 3,
          ...d("notes"),
          error: l.notes?.message,
        }),
        e.jsxs("div", {
          className: "flex justify-end gap-3 pt-2",
          children: [
            e.jsx(j, {
              type: "button",
              variant: "secondary",
              onClick: c,
              children: "Annuler",
            }),
            e.jsx(j, {
              type: "submit",
              loading: N,
              children: r ? "Enregistrer" : "Créer",
            }),
          ],
        }),
      ],
    }),
  });
}
const fe = [
    { key: "name", label: "Nom", required: !0 },
    { key: "email", label: "Email" },
    { key: "phone", label: "Téléphone" },
    { key: "status", label: "Statut" },
    { key: "notes", label: "Notes" },
  ],
  je = [
    { value: "", label: "Tous les statuts" },
    { value: "actif", label: "Actif" },
    { value: "inactif", label: "Inactif" },
    { value: "archivé", label: "Archivé" },
  ];
function Ue() {
  pe("Clients");
  const [i, c] = a.useState(""),
    [t, g] = a.useState(""),
    [m, r] = a.useState(1),
    [d, x] = a.useState(!1),
    [n, h] = a.useState(null),
    [u, l] = a.useState(null),
    [C, b] = a.useState(!1),
    N = B(),
    p = a.useMemo(
      () => ({ search: i || void 0, status: t || void 0, page: m }),
      [i, t, m],
    ),
    { data: v, isLoading: M } = F(p),
    P = R(),
    f = a.useMemo(() => v?.data ?? [], [v?.data]),
    w = v?.count ?? 0,
    T = Math.ceil(w / le),
    A = a.useCallback(() => {
      if (f.length === 0) {
        re.error("Aucune donnée à exporter");
        return;
      }
      te(
        f,
        [
          { key: "name", label: "Nom" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Téléphone" },
          { key: "status", label: "Statut" },
          { key: "notes", label: "Notes" },
          { key: "created_at", label: "Créé le" },
        ],
        "clients",
      );
    }, [f]),
    I = a.useCallback(
      async (s) => {
        const S = ["actif", "inactif", "archivé"],
          L = s
            .filter((o) => o.name?.trim())
            .map((o) => ({
              name: o.name.trim(),
              email: o.email?.trim() || null,
              phone: o.phone?.trim() || null,
              status: S.includes(o.status?.toLowerCase())
                ? o.status.toLowerCase()
                : "actif",
              notes: o.notes?.trim() || null,
            }));
        return N.mutateAsync(L);
      },
      [N],
    ),
    O = (s) => {
      (h(s), x(!0));
    },
    _ = (s) => {
      l(s);
    },
    D = () => {
      u && (P.mutate(u.id), l(null));
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
              children: "Clients",
            }),
            e.jsx("p", {
              className: "mt-1 text-sm text-muted-foreground",
              children: "Gestion des clients et de leurs informations.",
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
              e.jsx(K, {
                value: i,
                onChange: (s) => {
                  (c(s), r(1));
                },
                placeholder: "Rechercher un client...",
                wrapperClassName: "w-full sm:w-64",
              }),
              e.jsx(E, {
                options: je,
                value: t,
                onChange: (s) => {
                  (g(s), r(1));
                },
                placeholder: "Tous les statuts",
                className: "w-full sm:w-44",
              }),
            ],
          }),
          e.jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              e.jsx(j, {
                variant: "secondary",
                size: "sm",
                icon: e.jsx(oe, { className: "h-4 w-4" }),
                onClick: () => b(!0),
                children: "Importer",
              }),
              e.jsx(j, {
                variant: "secondary",
                size: "sm",
                icon: e.jsx(ne, { className: "h-4 w-4" }),
                onClick: A,
                children: "Exporter",
              }),
              e.jsx(j, {
                size: "sm",
                icon: e.jsx(ie, { className: "h-4 w-4" }),
                onClick: () => {
                  (h(null), x(!0));
                },
                children: "Nouveau client",
              }),
            ],
          }),
        ],
      }),
      M
        ? e.jsx("div", {
            className: "space-y-3",
            children: Array.from({ length: 5 }).map((s, S) =>
              e.jsx(X, { className: "h-16 w-full rounded-xl" }, S),
            ),
          })
        : f.length === 0
          ? e.jsx(ee, {
              icon: e.jsx(ce, { className: "h-6 w-6" }),
              title: "Aucun client",
              description: i
                ? "Aucun client ne correspond."
                : "Créez votre premier client pour commencer.",
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
                              children: "Nom",
                            }),
                            e.jsx("th", {
                              className:
                                "px-4 py-3 font-semibold text-muted-foreground",
                              children: "Email",
                            }),
                            e.jsx("th", {
                              className:
                                "px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell",
                              children: "Téléphone",
                            }),
                            e.jsx("th", {
                              className:
                                "px-4 py-3 font-semibold text-muted-foreground",
                              children: "Statut",
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
                        children: f.map((s) =>
                          e.jsxs(
                            "tr",
                            {
                              className: "hover:bg-muted/20 transition-colors",
                              children: [
                                e.jsx("td", {
                                  className:
                                    "px-4 py-3 font-medium text-foreground",
                                  children: s.name,
                                }),
                                e.jsx("td", {
                                  className: "px-4 py-3 text-muted-foreground",
                                  children: s.email ?? "—",
                                }),
                                e.jsx("td", {
                                  className:
                                    "px-4 py-3 text-muted-foreground hidden md:table-cell",
                                  children: s.phone ?? "—",
                                }),
                                e.jsx("td", {
                                  className: "px-4 py-3",
                                  children: e.jsx(Q, {
                                    className: ae[s.status],
                                    children: s.status,
                                  }),
                                }),
                                e.jsx("td", {
                                  className:
                                    "px-4 py-3 text-muted-foreground hidden lg:table-cell",
                                  children: Y(s.created_at),
                                }),
                                e.jsx("td", {
                                  className: "px-4 py-3",
                                  children: e.jsxs(Z, {
                                    align: "right",
                                    trigger: e.jsx("button", {
                                      className:
                                        "rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer",
                                      children: e.jsx(ue, {
                                        className: "h-4 w-4",
                                      }),
                                    }),
                                    children: [
                                      e.jsx(k, {
                                        onClick: () => O(s),
                                        icon: e.jsx(me, {
                                          className: "h-4 w-4",
                                        }),
                                        children: "Modifier",
                                      }),
                                      e.jsx(k, {
                                        onClick: () => _(s),
                                        destructive: !0,
                                        icon: e.jsx(de, {
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
                T > 1 &&
                  e.jsx(W, {
                    currentPage: m,
                    totalPages: T,
                    onPageChange: r,
                    totalItems: w,
                  }),
              ],
            }),
      e.jsx(he, {
        open: d,
        onClose: () => {
          (x(!1), h(null));
        },
        editItem: n,
      }),
      e.jsx(se, {
        open: !!u,
        onClose: () => l(null),
        onConfirm: D,
        title: "Supprimer le client",
        description: `Êtes-vous sûr de vouloir supprimer "${u?.name}" ? Cette action est irréversible.`,
        confirmLabel: "Supprimer",
        variant: "destructive",
      }),
      e.jsx(H, {
        open: C,
        onClose: () => b(!1),
        title: "Importer des clients",
        description: "Importez vos clients depuis un fichier CSV",
        columns: fe,
        onImport: I,
        templateFilename: "template-clients",
      }),
    ],
  });
}
export { Ue as default };
