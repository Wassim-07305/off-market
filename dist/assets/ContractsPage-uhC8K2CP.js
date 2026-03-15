import { u as B, a as q, b as A, j as e } from "./vendor-query-sBpsl8Kt.js";
import { r as x } from "./vendor-react-Cci7g3Cb.js";
import {
  s as S,
  b as I,
  S as R,
  c as V,
  h as $,
  t as Q,
  v as F,
} from "./index-DY9GA2La.js";
import {
  t as v,
  z as U,
  i as se,
  al as K,
  a1 as z,
  aJ as G,
  ax as re,
} from "./vendor-ui-DDdrexJZ.js";
import { I as w } from "./constants-IBlSVYu1.js";
import { u as D } from "./useClients-oFN0czBK.js";
import { u as H } from "./vendor-forms-Ct2mZ2NL.js";
import { M as J } from "./modal-DBBZDXoW.js";
import { I as M } from "./input-B9vrc6Q3.js";
import { S as T } from "./select-E7QvXrZc.js";
import { T as W } from "./textarea-D7qrlVHg.js";
import { B as E } from "./button-DlbP8VPc.js";
import { S as X } from "./search-input-dECf1iQ_.js";
import { B as Y } from "./badge-CFrXqKTx.js";
import { P as Z } from "./pagination-DHo4QjB2.js";
import { E as ee } from "./empty-state-BFSeK4Tv.js";
import { C as te } from "./confirm-dialog-BnX-zJNl.js";
import { T as ae, a as L } from "./tabs-oT6f7FFv.js";
import { u as ne } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
function oe(n = {}) {
  const { search: t, status: s, client_id: a, page: i = 1 } = n,
    d = (i - 1) * w,
    c = d + w - 1;
  return B({
    queryKey: ["contracts", n],
    queryFn: async () => {
      let o = S.from("contracts")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: !1 })
        .range(d, c);
      (t && (o = o.ilike("title", `%${t}%`)),
        s && (o = o.eq("status", s)),
        a && (o = o.eq("client_id", a)));
      const { data: m, error: b, count: l } = await o;
      if (b) throw b;
      return { data: m, count: l ?? 0 };
    },
  });
}
function le() {
  const n = q();
  return A({
    mutationFn: async (t) => {
      const { data: s, error: a } = await S.from("contracts")
        .insert(t)
        .select()
        .single();
      if (a) throw a;
      return s;
    },
    onSuccess: () => {
      (n.invalidateQueries({ queryKey: ["contracts"] }),
        v.success("Contrat créé avec succès"));
    },
    onError: (t) => {
      v.error(`Erreur: ${t.message}`);
    },
  });
}
function ie() {
  const n = q();
  return A({
    mutationFn: async ({ id: t, ...s }) => {
      const { data: a, error: i } = await S.from("contracts")
        .update(s)
        .eq("id", t)
        .select()
        .single();
      if (i) throw i;
      return a;
    },
    onSuccess: (t) => {
      (n.invalidateQueries({ queryKey: ["contracts"] }),
        n.setQueryData(["contracts", t.id], t),
        v.success("Contrat mis à jour"));
    },
    onError: (t) => {
      v.error(`Erreur: ${t.message}`);
    },
  });
}
function ce() {
  const n = q();
  return A({
    mutationFn: async (t) => {
      const { error: s } = await S.from("contracts").delete().eq("id", t);
      if (s) throw s;
    },
    onSuccess: () => {
      (n.invalidateQueries({ queryKey: ["contracts"] }),
        v.success("Contrat supprimé"));
    },
    onError: (t) => {
      v.error(`Erreur: ${t.message}`);
    },
  });
}
function ue(n = {}) {
  const { search: t, status: s, client_id: a, page: i = 1 } = n,
    d = (i - 1) * w,
    c = d + w - 1;
  return B({
    queryKey: ["invoices", n],
    queryFn: async () => {
      let o = S.from("invoices")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: !1 })
        .range(d, c);
      (t && (o = o.ilike("invoice_number", `%${t}%`)),
        s && (o = o.eq("status", s)),
        a && (o = o.eq("client_id", a)));
      const { data: m, error: b, count: l } = await o;
      if (b) throw b;
      return { data: m, count: l ?? 0 };
    },
  });
}
function de() {
  const n = q();
  return A({
    mutationFn: async (t) => {
      const { data: s, error: a } = await S.from("invoices")
        .insert(t)
        .select()
        .single();
      if (a) throw a;
      return s;
    },
    onSuccess: () => {
      (n.invalidateQueries({ queryKey: ["invoices"] }),
        v.success("Facture créée avec succès"));
    },
    onError: (t) => {
      v.error(`Erreur: ${t.message}`);
    },
  });
}
function me() {
  const n = q();
  return A({
    mutationFn: async ({ id: t, ...s }) => {
      const { data: a, error: i } = await S.from("invoices")
        .update(s)
        .eq("id", t)
        .select()
        .single();
      if (i) throw i;
      return a;
    },
    onSuccess: (t) => {
      (n.invalidateQueries({ queryKey: ["invoices"] }),
        n.setQueryData(["invoices", t.id], t),
        v.success("Facture mise à jour"));
    },
    onError: (t) => {
      v.error(`Erreur: ${t.message}`);
    },
  });
}
function xe() {
  const n = q();
  return A({
    mutationFn: async (t) => {
      const { error: s } = await S.from("invoices").delete().eq("id", t);
      if (s) throw s;
    },
    onSuccess: () => {
      (n.invalidateQueries({ queryKey: ["invoices"] }),
        v.success("Facture supprimée"));
    },
    onError: (t) => {
      v.error(`Erreur: ${t.message}`);
    },
  });
}
const pe = [
  { value: "brouillon", label: "Brouillon" },
  { value: "envoye", label: "Envoyé" },
  { value: "signe", label: "Signé" },
  { value: "expire", label: "Expiré" },
];
function fe({ open: n, onClose: t, editItem: s }) {
  const a = le(),
    i = ie(),
    { data: d } = D({ page: 1 }),
    c = !!s,
    o = (d?.data ?? []).map((p) => ({ value: p.id, label: p.name })),
    {
      register: m,
      handleSubmit: b,
      reset: l,
      setValue: f,
      watch: h,
      formState: { errors: g },
    } = H({
      defaultValues: {
        title: "",
        client_id: "",
        content: "",
        status: "brouillon",
      },
    }),
    j = h("status"),
    _ = h("client_id");
  x.useEffect(() => {
    l(
      s
        ? {
            title: s.title,
            client_id: s.client_id ?? "",
            content: s.content ?? "",
            status: s.status,
          }
        : { title: "", client_id: "", content: "", status: "brouillon" },
    );
  }, [s, l]);
  const C = (p) => {
      const y = {
        title: p.title,
        client_id: p.client_id || null,
        content: p.content || null,
        status: p.status,
      };
      c
        ? i.mutate(
            { id: s.id, ...y },
            {
              onSuccess: () => {
                (l(), t());
              },
            },
          )
        : a.mutate(y, {
            onSuccess: () => {
              (l(), t());
            },
          });
    },
    N = a.isPending || i.isPending;
  return e.jsx(J, {
    open: n,
    onClose: t,
    title: c ? "Modifier le contrat" : "Nouveau contrat",
    description: c
      ? "Mettre à jour les informations du contrat."
      : "Créer un nouveau contrat.",
    size: "md",
    children: e.jsxs("form", {
      onSubmit: b(C),
      className: "space-y-4",
      children: [
        e.jsx(M, {
          label: "Titre *",
          placeholder: "Titre du contrat",
          ...m("title", { required: "Le titre est requis" }),
          error: g.title?.message,
        }),
        e.jsx(T, {
          label: "Client",
          options: [{ value: "", label: "Sélectionner un client" }, ...o],
          value: _,
          onChange: (p) => f("client_id", p),
        }),
        e.jsx(T, {
          label: "Statut",
          options: pe,
          value: j,
          onChange: (p) => f("status", p),
          error: g.status?.message,
        }),
        e.jsx(W, {
          label: "Contenu",
          placeholder: "Contenu du contrat...",
          rows: 8,
          ...m("content"),
          error: g.content?.message,
        }),
        e.jsxs("div", {
          className: "flex justify-end gap-3 pt-2",
          children: [
            e.jsx(E, {
              type: "button",
              variant: "secondary",
              onClick: t,
              children: "Annuler",
            }),
            e.jsx(E, {
              type: "submit",
              loading: N,
              children: c ? "Enregistrer" : "Créer",
            }),
          ],
        }),
      ],
    }),
  });
}
const he = [
  { value: "brouillon", label: "Brouillon" },
  { value: "envoyee", label: "Envoyée" },
  { value: "payee", label: "Payée" },
  { value: "en_retard", label: "En retard" },
];
function ge({ open: n, onClose: t, editItem: s }) {
  const a = de(),
    i = me(),
    { data: d } = D({ page: 1 }),
    c = !!s,
    o = (d?.data ?? []).map((u) => ({ value: u.id, label: u.name })),
    {
      register: m,
      handleSubmit: b,
      reset: l,
      setValue: f,
      watch: h,
      formState: { errors: g },
    } = H({
      defaultValues: {
        invoice_number: "",
        client_id: "",
        amount: 0,
        tax: 20,
        due_date: "",
        status: "brouillon",
        notes: "",
      },
    }),
    j = h("status"),
    _ = h("client_id"),
    C = h("amount") || 0,
    N = h("tax") || 0,
    p = C + (C * N) / 100;
  x.useEffect(() => {
    l(
      s
        ? {
            invoice_number: s.invoice_number ?? "",
            client_id: s.client_id ?? "",
            amount: s.amount,
            tax: s.tax,
            due_date: s.due_date ?? "",
            status: s.status,
            notes: s.notes ?? "",
          }
        : {
            invoice_number: "",
            client_id: "",
            amount: 0,
            tax: 20,
            due_date: "",
            status: "brouillon",
            notes: "",
          },
    );
  }, [s, l]);
  const y = (u) => {
      const k = u.amount + (u.amount * u.tax) / 100,
        r = {
          invoice_number: u.invoice_number || null,
          client_id: u.client_id || null,
          amount: u.amount,
          tax: u.tax,
          total: k,
          due_date: u.due_date || null,
          status: u.status,
          notes: u.notes || null,
        };
      c
        ? i.mutate(
            { id: s.id, ...r },
            {
              onSuccess: () => {
                (l(), t());
              },
            },
          )
        : a.mutate(r, {
            onSuccess: () => {
              (l(), t());
            },
          });
    },
    P = a.isPending || i.isPending;
  return e.jsx(J, {
    open: n,
    onClose: t,
    title: c ? "Modifier la facture" : "Nouvelle facture",
    description: c
      ? "Mettre à jour les informations de la facture."
      : "Créer une nouvelle facture.",
    size: "md",
    children: e.jsxs("form", {
      onSubmit: b(y),
      className: "space-y-4",
      children: [
        e.jsx(M, {
          label: "N° Facture",
          placeholder: "FAC-001",
          ...m("invoice_number"),
          error: g.invoice_number?.message,
        }),
        e.jsx(T, {
          label: "Client",
          options: [{ value: "", label: "Sélectionner un client" }, ...o],
          value: _,
          onChange: (u) => f("client_id", u),
        }),
        e.jsxs("div", {
          className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
          children: [
            e.jsx(M, {
              label: "Montant HT *",
              type: "number",
              step: "0.01",
              placeholder: "0.00",
              ...m("amount", {
                required: "Le montant est requis",
                valueAsNumber: !0,
              }),
              error: g.amount?.message,
            }),
            e.jsx(M, {
              label: "TVA (%)",
              type: "number",
              step: "0.01",
              placeholder: "20",
              ...m("tax", { valueAsNumber: !0 }),
              error: g.tax?.message,
            }),
          ],
        }),
        e.jsxs("div", {
          className: "rounded-lg bg-muted/30 px-4 py-3 text-sm",
          children: [
            e.jsx("span", {
              className: "text-muted-foreground",
              children: "Total TTC :",
            }),
            " ",
            e.jsx("span", {
              className: "font-semibold text-foreground",
              children: I(p),
            }),
          ],
        }),
        e.jsxs("div", {
          className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
          children: [
            e.jsx(M, {
              label: "Date d'échéance",
              type: "date",
              ...m("due_date"),
              error: g.due_date?.message,
            }),
            e.jsx(T, {
              label: "Statut",
              options: he,
              value: j,
              onChange: (u) => f("status", u),
              error: g.status?.message,
            }),
          ],
        }),
        e.jsx(W, {
          label: "Notes",
          placeholder: "Notes sur la facture...",
          rows: 3,
          ...m("notes"),
          error: g.notes?.message,
        }),
        e.jsxs("div", {
          className: "flex justify-end gap-3 pt-2",
          children: [
            e.jsx(E, {
              type: "button",
              variant: "secondary",
              onClick: t,
              children: "Annuler",
            }),
            e.jsx(E, {
              type: "submit",
              loading: P,
              children: c ? "Enregistrer" : "Créer",
            }),
          ],
        }),
      ],
    }),
  });
}
const be = [
    { value: "", label: "Tous les statuts" },
    { value: "brouillon", label: "Brouillon" },
    { value: "envoye", label: "Envoyé" },
    { value: "signe", label: "Signé" },
    { value: "expire", label: "Expiré" },
  ],
  ve = [
    { value: "", label: "Tous les statuts" },
    { value: "brouillon", label: "Brouillon" },
    { value: "envoyee", label: "Envoyée" },
    { value: "payee", label: "Payée" },
    { value: "en_retard", label: "En retard" },
  ],
  je = {
    brouillon: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    envoye: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    signe: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    expire: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
  ye = {
    brouillon: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    envoyee: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    payee: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    en_retard: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
  Ne = {
    brouillon: "Brouillon",
    envoye: "Envoyé",
    signe: "Signé",
    expire: "Expiré",
  },
  Ce = {
    brouillon: "Brouillon",
    envoyee: "Envoyée",
    payee: "Payée",
    en_retard: "En retard",
  },
  Se = [
    { value: "contrats", label: "Contrats" },
    { value: "factures", label: "Factures" },
  ];
function He() {
  ne("Contrats");
  const [n, t] = x.useState("contrats"),
    { data: s } = D({ page: 1 }),
    a = x.useMemo(() => {
      const i = new Map();
      for (const d of s?.data ?? []) i.set(d.id, d.name);
      return i;
    }, [s?.data]);
  return e.jsxs("div", {
    className: "space-y-8",
    children: [
      e.jsxs("div", {
        children: [
          e.jsx("h1", {
            className: "text-xl sm:text-2xl font-bold text-foreground",
            children: "Contrats & Factures",
          }),
          e.jsx("p", {
            className: "mt-1 text-sm text-muted-foreground",
            children: "Gestion des contrats et de la facturation.",
          }),
        ],
      }),
      e.jsx(ae, { tabs: Se, value: n, onChange: t }),
      e.jsx(L, {
        value: "contrats",
        activeValue: n,
        children: e.jsx(_e, { clientsMap: a }),
      }),
      e.jsx(L, {
        value: "factures",
        activeValue: n,
        children: e.jsx(we, { clientsMap: a }),
      }),
    ],
  });
}
function _e({ clientsMap: n }) {
  const [t, s] = x.useState(""),
    [a, i] = x.useState(""),
    [d, c] = x.useState(1),
    [o, m] = x.useState(!1),
    [b, l] = x.useState(null),
    [f, h] = x.useState(null),
    g = x.useMemo(
      () => ({ search: t || void 0, status: a || void 0, page: d }),
      [t, a, d],
    ),
    { data: j, isLoading: _ } = oe(g),
    C = ce(),
    N = x.useMemo(() => j?.data ?? [], [j?.data]),
    p = j?.count ?? 0,
    y = Math.ceil(p / w),
    P = (r) => {
      (l(r), m(!0));
    },
    u = (r) => {
      h(r);
    },
    k = () => {
      f && (C.mutate(f.id), h(null));
    };
  return e.jsxs("div", {
    className: "space-y-6",
    children: [
      e.jsxs("div", {
        className:
          "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        children: [
          e.jsxs("div", {
            className: "flex flex-wrap items-center gap-3",
            children: [
              e.jsx(X, {
                value: t,
                onChange: (r) => {
                  (s(r), c(1));
                },
                placeholder: "Rechercher un contrat...",
                wrapperClassName: "w-full sm:w-64",
              }),
              e.jsx(T, {
                options: be,
                value: a,
                onChange: (r) => {
                  (i(r), c(1));
                },
                placeholder: "Tous les statuts",
                className: "w-full sm:w-44",
              }),
            ],
          }),
          e.jsx(E, {
            size: "sm",
            icon: e.jsx(U, { className: "h-4 w-4" }),
            onClick: () => {
              (l(null), m(!0));
            },
            children: "Nouveau contrat",
          }),
        ],
      }),
      _
        ? e.jsx("div", {
            className: "space-y-3",
            children: Array.from({ length: 5 }).map((r, O) =>
              e.jsx(R, { className: "h-16 w-full rounded-xl" }, O),
            ),
          })
        : N.length === 0
          ? e.jsx(ee, {
              icon: e.jsx(se, { className: "h-6 w-6" }),
              title: "Aucun contrat",
              description: t
                ? "Aucun contrat ne correspond."
                : "Créez votre premier contrat pour commencer.",
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
                                "px-4 py-3 font-semibold text-muted-foreground",
                              children: "Client",
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
                        children: N.map((r) =>
                          e.jsxs(
                            "tr",
                            {
                              className: "hover:bg-muted/20 transition-colors",
                              children: [
                                e.jsx("td", {
                                  className:
                                    "px-4 py-3 font-medium text-foreground",
                                  children: r.title,
                                }),
                                e.jsx("td", {
                                  className: "px-4 py-3 text-muted-foreground",
                                  children: r.client_id
                                    ? (n.get(r.client_id) ?? "—")
                                    : "—",
                                }),
                                e.jsx("td", {
                                  className: "px-4 py-3",
                                  children: e.jsx(Y, {
                                    className: V(je[r.status]),
                                    children: Ne[r.status] ?? r.status,
                                  }),
                                }),
                                e.jsx("td", {
                                  className:
                                    "px-4 py-3 text-muted-foreground hidden lg:table-cell",
                                  children: $(r.created_at),
                                }),
                                e.jsx("td", {
                                  className: "px-4 py-3",
                                  children: e.jsxs(Q, {
                                    align: "right",
                                    trigger: e.jsx("button", {
                                      className:
                                        "rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer",
                                      children: e.jsx(G, {
                                        className: "h-4 w-4",
                                      }),
                                    }),
                                    children: [
                                      e.jsx(F, {
                                        onClick: () => P(r),
                                        icon: e.jsx(K, {
                                          className: "h-4 w-4",
                                        }),
                                        children: "Modifier",
                                      }),
                                      e.jsx(F, {
                                        onClick: () => u(r),
                                        destructive: !0,
                                        icon: e.jsx(z, {
                                          className: "h-4 w-4",
                                        }),
                                        children: "Supprimer",
                                      }),
                                    ],
                                  }),
                                }),
                              ],
                            },
                            r.id,
                          ),
                        ),
                      }),
                    ],
                  }),
                }),
                y > 1 &&
                  e.jsx(Z, {
                    currentPage: d,
                    totalPages: y,
                    onPageChange: c,
                    totalItems: p,
                  }),
              ],
            }),
      e.jsx(fe, {
        open: o,
        onClose: () => {
          (m(!1), l(null));
        },
        editItem: b,
      }),
      e.jsx(te, {
        open: !!f,
        onClose: () => h(null),
        onConfirm: k,
        title: "Supprimer le contrat",
        description: `Êtes-vous sûr de vouloir supprimer "${f?.title}" ? Cette action est irréversible.`,
        confirmLabel: "Supprimer",
        variant: "destructive",
      }),
    ],
  });
}
function we({ clientsMap: n }) {
  const [t, s] = x.useState(""),
    [a, i] = x.useState(""),
    [d, c] = x.useState(1),
    [o, m] = x.useState(!1),
    [b, l] = x.useState(null),
    [f, h] = x.useState(null),
    g = x.useMemo(
      () => ({ search: t || void 0, status: a || void 0, page: d }),
      [t, a, d],
    ),
    { data: j, isLoading: _ } = ue(g),
    C = xe(),
    N = x.useMemo(() => j?.data ?? [], [j?.data]),
    p = j?.count ?? 0,
    y = Math.ceil(p / w),
    P = (r) => {
      (l(r), m(!0));
    },
    u = (r) => {
      h(r);
    },
    k = () => {
      f && (C.mutate(f.id), h(null));
    };
  return e.jsxs("div", {
    className: "space-y-6",
    children: [
      e.jsxs("div", {
        className:
          "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        children: [
          e.jsxs("div", {
            className: "flex flex-wrap items-center gap-3",
            children: [
              e.jsx(X, {
                value: t,
                onChange: (r) => {
                  (s(r), c(1));
                },
                placeholder: "Rechercher une facture...",
                wrapperClassName: "w-full sm:w-64",
              }),
              e.jsx(T, {
                options: ve,
                value: a,
                onChange: (r) => {
                  (i(r), c(1));
                },
                placeholder: "Tous les statuts",
                className: "w-full sm:w-44",
              }),
            ],
          }),
          e.jsx(E, {
            size: "sm",
            icon: e.jsx(U, { className: "h-4 w-4" }),
            onClick: () => {
              (l(null), m(!0));
            },
            children: "Nouvelle facture",
          }),
        ],
      }),
      _
        ? e.jsx("div", {
            className: "space-y-3",
            children: Array.from({ length: 5 }).map((r, O) =>
              e.jsx(R, { className: "h-16 w-full rounded-xl" }, O),
            ),
          })
        : N.length === 0
          ? e.jsx(ee, {
              icon: e.jsx(re, { className: "h-6 w-6" }),
              title: "Aucune facture",
              description: t
                ? "Aucune facture ne correspond."
                : "Créez votre première facture pour commencer.",
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
                              children: "N° Facture",
                            }),
                            e.jsx("th", {
                              className:
                                "px-4 py-3 font-semibold text-muted-foreground",
                              children: "Client",
                            }),
                            e.jsx("th", {
                              className:
                                "px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell",
                              children: "Montant HT",
                            }),
                            e.jsx("th", {
                              className:
                                "px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell",
                              children: "TVA",
                            }),
                            e.jsx("th", {
                              className:
                                "px-4 py-3 font-semibold text-muted-foreground",
                              children: "Total TTC",
                            }),
                            e.jsx("th", {
                              className:
                                "px-4 py-3 font-semibold text-muted-foreground",
                              children: "Statut",
                            }),
                            e.jsx("th", {
                              className:
                                "px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell",
                              children: "Échéance",
                            }),
                            e.jsx("th", { className: "px-4 py-3 w-10" }),
                          ],
                        }),
                      }),
                      e.jsx("tbody", {
                        className: "divide-y divide-border/30",
                        children: N.map((r) =>
                          e.jsxs(
                            "tr",
                            {
                              className: "hover:bg-muted/20 transition-colors",
                              children: [
                                e.jsx("td", {
                                  className:
                                    "px-4 py-3 font-medium text-foreground",
                                  children: r.invoice_number ?? "—",
                                }),
                                e.jsx("td", {
                                  className: "px-4 py-3 text-muted-foreground",
                                  children: r.client_id
                                    ? (n.get(r.client_id) ?? "—")
                                    : "—",
                                }),
                                e.jsx("td", {
                                  className:
                                    "px-4 py-3 text-muted-foreground hidden md:table-cell",
                                  children: I(r.amount),
                                }),
                                e.jsxs("td", {
                                  className:
                                    "px-4 py-3 text-muted-foreground hidden md:table-cell",
                                  children: [r.tax, "%"],
                                }),
                                e.jsx("td", {
                                  className:
                                    "px-4 py-3 font-medium text-foreground",
                                  children: I(r.total),
                                }),
                                e.jsx("td", {
                                  className: "px-4 py-3",
                                  children: e.jsx(Y, {
                                    className: V(ye[r.status]),
                                    children: Ce[r.status] ?? r.status,
                                  }),
                                }),
                                e.jsx("td", {
                                  className:
                                    "px-4 py-3 text-muted-foreground hidden lg:table-cell",
                                  children: r.due_date ? $(r.due_date) : "—",
                                }),
                                e.jsx("td", {
                                  className: "px-4 py-3",
                                  children: e.jsxs(Q, {
                                    align: "right",
                                    trigger: e.jsx("button", {
                                      className:
                                        "rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer",
                                      children: e.jsx(G, {
                                        className: "h-4 w-4",
                                      }),
                                    }),
                                    children: [
                                      e.jsx(F, {
                                        onClick: () => P(r),
                                        icon: e.jsx(K, {
                                          className: "h-4 w-4",
                                        }),
                                        children: "Modifier",
                                      }),
                                      e.jsx(F, {
                                        onClick: () => u(r),
                                        destructive: !0,
                                        icon: e.jsx(z, {
                                          className: "h-4 w-4",
                                        }),
                                        children: "Supprimer",
                                      }),
                                    ],
                                  }),
                                }),
                              ],
                            },
                            r.id,
                          ),
                        ),
                      }),
                    ],
                  }),
                }),
                y > 1 &&
                  e.jsx(Z, {
                    currentPage: d,
                    totalPages: y,
                    onPageChange: c,
                    totalItems: p,
                  }),
              ],
            }),
      e.jsx(ge, {
        open: o,
        onClose: () => {
          (m(!1), l(null));
        },
        editItem: b,
      }),
      e.jsx(te, {
        open: !!f,
        onClose: () => h(null),
        onConfirm: k,
        title: "Supprimer la facture",
        description: `Êtes-vous sûr de vouloir supprimer la facture "${f?.invoice_number ?? ""}" ? Cette action est irréversible.`,
        confirmLabel: "Supprimer",
        variant: "destructive",
      }),
    ],
  });
}
export { He as default };
