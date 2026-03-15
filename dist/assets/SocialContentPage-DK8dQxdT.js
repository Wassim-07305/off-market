import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { r as o } from "./vendor-react-Cci7g3Cb.js";
import {
  a as z,
  b as R,
  c as F,
  u as q,
  S as Y,
} from "./SocialContentBoard-CgMPzRRP.js";
import { u as M } from "./useClients-oFN0czBK.js";
import { C as E, d as k } from "./card-Dkj99_H3.js";
import { S as w, c as H } from "./index-DY9GA2La.js";
import {
  f as I,
  at as K,
  as as G,
  aH as J,
  z as Q,
} from "./vendor-ui-DDdrexJZ.js";
import { u as W } from "./vendor-forms-Ct2mZ2NL.js";
import { a as X } from "./zod-COY_rf8d.js";
import { e as Z } from "./forms-zLivl21i.js";
import { M as $ } from "./modal-DBBZDXoW.js";
import { I as y } from "./input-B9vrc6Q3.js";
import { S as p } from "./select-E7QvXrZc.js";
import { T as ee } from "./textarea-D7qrlVHg.js";
import { C as te } from "./checkbox-yH1R51Jo.js";
import { B as O } from "./button-DlbP8VPc.js";
import {
  S as L,
  o as V,
  p as P,
  q as B,
  V as se,
  r as ae,
} from "./constants-IBlSVYu1.js";
import { u as le } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-dnd-DrANF9GG.js";
import "./badge-CFrXqKTx.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
function oe({ clientId: r }) {
  const { data: n, isLoading: s } = z(r);
  if (s)
    return e.jsx("div", {
      className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
      children: Array.from({ length: 4 }).map((a, f) =>
        e.jsx(
          E,
          {
            children: e.jsxs(k, {
              className: "p-5",
              children: [
                e.jsx(w, { className: "h-10 w-10 rounded-lg" }),
                e.jsx(w, { className: "mt-3 h-4 w-24" }),
                e.jsx(w, { className: "mt-2 h-8 w-16" }),
              ],
            }),
          },
          f,
        ),
      ),
    });
  const u = [
    {
      title: "Total contenus",
      value: String(n?.total ?? 0),
      icon: I,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Publiés",
      value: String(n?.publie ?? 0),
      icon: K,
      color: "bg-success/10 text-success",
    },
    {
      title: "En cours",
      value: String(n?.enCours ?? 0),
      icon: G,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Validés",
      value: String(n?.valide ?? 0),
      icon: J,
      color: "bg-warning/10 text-warning",
    },
  ];
  return e.jsx("div", {
    className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
    children: u.map((a) =>
      e.jsx(
        E,
        {
          children: e.jsxs(k, {
            className: "p-5",
            children: [
              e.jsx("div", {
                className: H(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  a.color,
                ),
                children: e.jsx(a.icon, { className: "h-5 w-5" }),
              }),
              e.jsxs("div", {
                className: "mt-3",
                children: [
                  e.jsx("p", {
                    className: "text-sm font-medium text-muted-foreground",
                    children: a.title,
                  }),
                  e.jsx("p", {
                    className: "mt-1 text-2xl font-bold text-foreground",
                    children: a.value,
                  }),
                ],
              }),
            ],
          }),
        },
        a.title,
      ),
    ),
  });
}
function ne({ open: r, onClose: n, editItem: s }) {
  const u = !!s,
    a = R(),
    f = F(),
    { data: v } = M(),
    {
      register: m,
      handleSubmit: h,
      reset: x,
      setValue: c,
      watch: d,
      formState: { errors: i, isSubmitting: S },
    } = W({
      resolver: X(Z),
      defaultValues: {
        client_id: "",
        title: "",
        status: "idée",
        format: null,
        video_type: null,
        planned_date: "",
        text_content: "",
        link: "",
        is_validated: !1,
      },
    }),
    j = d("client_id"),
    g = d("status"),
    C = d("format"),
    _ = d("video_type"),
    b = d("is_validated");
  o.useEffect(() => {
    x(
      s
        ? {
            client_id: s.client_id ?? "",
            title: s.title,
            status: s.status,
            format: s.format,
            video_type: s.video_type,
            planned_date: s.planned_date ?? "",
            text_content: s.text_content ?? "",
            link: s.link ?? "",
            is_validated: s.is_validated,
          }
        : {
            client_id: "",
            title: "",
            status: "idée",
            format: null,
            video_type: null,
            planned_date: "",
            text_content: "",
            link: "",
            is_validated: !1,
          },
    );
  }, [s, x]);
  const N = async (t) => {
      const A = {
        ...t,
        link: t.link || void 0,
        text_content: t.text_content || void 0,
        planned_date: t.planned_date || void 0,
      };
      (u && s
        ? await f.mutateAsync({ id: s.id, ...A })
        : await a.mutateAsync(A),
        n());
    },
    l = (v?.data ?? []).map((t) => ({ value: t.id, label: t.name })),
    T = L.map((t) => ({ value: t, label: V[t] })),
    D = [
      { value: "", label: "Aucun" },
      ...P.map((t) => ({ value: t, label: B[t] })),
    ],
    U = [
      { value: "", label: "Aucun" },
      ...se.map((t) => ({ value: t, label: ae[t] })),
    ];
  return e.jsx($, {
    open: r,
    onClose: n,
    title: u ? "Modifier le contenu" : "Nouveau contenu",
    size: "lg",
    children: e.jsxs("form", {
      onSubmit: h(N),
      className: "space-y-4",
      children: [
        e.jsx(p, {
          label: "Client",
          options: l,
          value: j,
          onChange: (t) => c("client_id", t),
          error: i.client_id?.message,
        }),
        e.jsx(y, { label: "Titre", ...m("title"), error: i.title?.message }),
        e.jsxs("div", {
          className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
          children: [
            e.jsx(p, {
              label: "Statut",
              options: T,
              value: g,
              onChange: (t) => c("status", t),
              error: i.status?.message,
            }),
            e.jsx(p, {
              label: "Format",
              options: D,
              value: C ?? "",
              onChange: (t) => c("format", t || null),
              error: i.format?.message,
            }),
          ],
        }),
        e.jsxs("div", {
          className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
          children: [
            e.jsx(p, {
              label: "Type de vidéo",
              options: U,
              value: _ ?? "",
              onChange: (t) => c("video_type", t || null),
              error: i.video_type?.message,
            }),
            e.jsx(y, {
              label: "Date prévue",
              type: "date",
              ...m("planned_date"),
              error: i.planned_date?.message,
            }),
          ],
        }),
        e.jsx(ee, {
          label: "Contenu texte",
          ...m("text_content"),
          error: i.text_content?.message,
        }),
        e.jsx(y, {
          label: "Lien",
          type: "url",
          placeholder: "https://...",
          ...m("link"),
          error: i.link?.message,
        }),
        e.jsx(te, {
          label: "Validé",
          description: "Marquer ce contenu comme validé",
          checked: b,
          onChange: (t) => c("is_validated", t.target.checked),
        }),
        e.jsxs("div", {
          className: "flex justify-end gap-3 pt-2",
          children: [
            e.jsx(O, {
              type: "button",
              variant: "secondary",
              onClick: n,
              children: "Annuler",
            }),
            e.jsx(O, {
              type: "submit",
              loading: S,
              children: u ? "Mettre à jour" : "Créer",
            }),
          ],
        }),
      ],
    }),
  });
}
function Ae() {
  le("Contenus Social");
  const [r, n] = o.useState(""),
    [s, u] = o.useState(""),
    [a, f] = o.useState(""),
    [v, m] = o.useState(!1),
    [h, x] = o.useState(null),
    { data: c } = M(),
    d = o.useMemo(() => c?.data ?? [], [c?.data]),
    i = o.useMemo(
      () => ({
        client_id: r || void 0,
        status: s || void 0,
        format: a || void 0,
      }),
      [r, s, a],
    ),
    { data: S, isLoading: j } = q(i),
    g = F(),
    C = o.useCallback(
      (l, T) => {
        g.mutate({ id: l, status: T });
      },
      [g],
    ),
    _ = o.useMemo(
      () => [
        { value: "", label: "Tous les clients" },
        ...d.map((l) => ({ value: l.id, label: l.name })),
      ],
      [d],
    ),
    b = o.useMemo(
      () => [
        { value: "", label: "Tous les statuts" },
        ...L.map((l) => ({ value: l, label: V[l] })),
      ],
      [],
    ),
    N = o.useMemo(
      () => [
        { value: "", label: "Tous les formats" },
        ...P.map((l) => ({ value: l, label: B[l] })),
      ],
      [],
    );
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
                children: "Contenus Social",
              }),
              e.jsx("p", {
                className: "mt-1 text-sm text-muted-foreground",
                children: "Pipeline de création de contenu social.",
              }),
            ],
          }),
          e.jsx(O, {
            size: "sm",
            icon: e.jsx(Q, { className: "h-4 w-4" }),
            onClick: () => {
              (x(null), m(!0));
            },
            children: "Nouveau contenu",
          }),
        ],
      }),
      e.jsx(oe, { clientId: r || void 0 }),
      e.jsxs("div", {
        className:
          "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
        children: [
          e.jsx(p, {
            options: _,
            value: r,
            onChange: n,
            placeholder: "Tous les clients",
            className: "w-full sm:w-48",
          }),
          e.jsx(p, {
            options: b,
            value: s,
            onChange: u,
            placeholder: "Tous les statuts",
            className: "w-full sm:w-44",
          }),
          e.jsx(p, {
            options: N,
            value: a,
            onChange: f,
            placeholder: "Tous les formats",
            className: "w-full sm:w-44",
          }),
        ],
      }),
      e.jsx(Y, { data: S ?? [], isLoading: j, onStatusChange: C }),
      e.jsx(ne, {
        open: v,
        onClose: () => {
          (m(!1), x(null));
        },
        editItem: h,
      }),
    ],
  });
}
export { Ae as default };
