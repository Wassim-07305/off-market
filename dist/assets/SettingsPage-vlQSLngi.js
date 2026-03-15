import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { r as f } from "./vendor-react-Cci7g3Cb.js";
import { u as k, o as F, s as p } from "./vendor-forms-Ct2mZ2NL.js";
import { a as U } from "./zod-COY_rf8d.js";
import {
  y as H,
  aa as q,
  x as J,
  aD as X,
  V as Z,
  t as u,
} from "./vendor-ui-DDdrexJZ.js";
import {
  c as P,
  u as K,
  g as Q,
  s as _,
  q as W,
  r as Y,
  D as ee,
  S as se,
} from "./index-DY9GA2La.js";
import { b as re } from "./useUsers-BngZVZxm.js";
import { C as x, a as h, b as j, c as g, d as w } from "./card-Dkj99_H3.js";
import { I as n } from "./input-B9vrc6Q3.js";
import { B as A } from "./button-DlbP8VPc.js";
import { T as ae, a as E } from "./tabs-oT6f7FFv.js";
import { u as te } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
const z = f.forwardRef(
  (
    {
      className: a,
      label: r,
      description: t,
      wrapperClassName: o,
      id: c,
      checked: s,
      disabled: i,
      onCheckedChange: b,
      ...v
    },
    N,
  ) => {
    const y = c || r?.toLowerCase().replace(/\s+/g, "-"),
      d = () => {
        !i && b && b(!s);
      };
    return e.jsxs("label", {
      htmlFor: y,
      className: P(
        "inline-flex cursor-pointer items-center justify-between gap-3",
        i && "cursor-not-allowed opacity-50",
        o,
      ),
      children: [
        (r || t) &&
          e.jsxs("div", {
            className: "flex flex-col gap-0.5",
            children: [
              r &&
                e.jsx("span", {
                  className: "text-sm font-medium leading-none text-foreground",
                  children: r,
                }),
              t &&
                e.jsx("span", {
                  className: "text-xs text-muted-foreground",
                  children: t,
                }),
            ],
          }),
        e.jsxs("div", {
          className: "relative flex shrink-0 items-center",
          children: [
            e.jsx("input", {
              ref: N,
              id: y,
              type: "checkbox",
              checked: s,
              disabled: i,
              onChange: d,
              className: P("peer sr-only", a),
              ...v,
            }),
            e.jsx("button", {
              type: "button",
              role: "switch",
              "aria-checked": s,
              disabled: i,
              onClick: d,
              className: P(
                "relative h-6 w-11 rounded-full transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50",
                s ? "bg-primary" : "bg-muted",
              ),
              children: e.jsx("span", {
                className: P(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                  s ? "translate-x-5" : "translate-x-0.5",
                ),
              }),
            }),
          ],
        }),
      ],
    });
  },
);
z.displayName = "Switch";
const oe = F({ full_name: p().min(2, "Nom requis"), phone: p().optional() }),
  ie = F({
    currentPassword: p().min(6, "Mot de passe actuel requis"),
    newPassword: p().min(6, "Minimum 6 caracteres"),
    confirmPassword: p().min(6, "Confirmation requise"),
  }).refine((a) => a.newPassword === a.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });
function ye() {
  te("Paramètres");
  const { user: a, profile: r } = K(),
    t = re(),
    [o, c] = f.useState("profile"),
    [s, i] = f.useState(!1),
    [b, v] = f.useState(!1),
    {
      register: N,
      handleSubmit: y,
      formState: { errors: d, isDirty: M },
    } = k({
      resolver: U(oe),
      defaultValues: { full_name: r?.full_name ?? "", phone: r?.phone ?? "" },
    }),
    {
      register: C,
      handleSubmit: L,
      reset: R,
      formState: { errors: S },
    } = k({ resolver: U(ie) }),
    D = async (m) => {
      a && (await t.mutateAsync({ id: a.id, ...m }));
    },
    V = async (m) => {
      v(!0);
      try {
        const { error: l } = await _.auth.updateUser({
          password: m.newPassword,
        });
        if (l) throw l;
        (u.success("Mot de passe mis à jour"), R());
      } catch {
        u.error("Erreur lors du changement de mot de passe");
      } finally {
        v(!1);
      }
    },
    O = async (m) => {
      const l = m.target.files?.[0];
      if (!l || !a) return;
      const B = 10 * 1024 * 1024;
      if (l.size > B) {
        u.error("La taille du fichier ne doit pas dépasser 10 Mo");
        return;
      }
      i(!0);
      try {
        const $ = l.name.split(".").pop(),
          T = `${a.id}/avatar.${$}`,
          { error: I } = await _.storage
            .from("avatars")
            .upload(T, l, { upsert: !0 });
        if (I) throw I;
        const {
          data: { publicUrl: G },
        } = _.storage.from("avatars").getPublicUrl(T);
        (await t.mutateAsync({ id: a.id, avatar_url: G }),
          u.success("Photo de profil mise à jour"));
      } catch {
        u.error("Erreur lors du téléchargement");
      } finally {
        i(!1);
      }
    };
  return e.jsxs("div", {
    className: "space-y-6",
    children: [
      e.jsxs("div", {
        children: [
          e.jsx("h1", {
            className: "text-xl sm:text-2xl font-bold text-foreground",
            children: "Paramètres",
          }),
          e.jsx("p", {
            className: "text-sm text-muted-foreground",
            children: "Gérez votre profil et vos préférences",
          }),
        ],
      }),
      e.jsx(ae, {
        tabs: [
          {
            value: "profile",
            label: e.jsxs(e.Fragment, {
              children: [e.jsx(H, { className: "mr-2 h-4 w-4" }), "Profil"],
            }),
          },
          {
            value: "security",
            label: e.jsxs(e.Fragment, {
              children: [e.jsx(q, { className: "mr-2 h-4 w-4" }), "Sécurité"],
            }),
          },
          {
            value: "notifications",
            label: e.jsxs(e.Fragment, {
              children: [
                e.jsx(J, { className: "mr-2 h-4 w-4" }),
                "Notifications",
              ],
            }),
          },
        ],
        value: o,
        onChange: c,
      }),
      e.jsx(E, {
        value: "profile",
        activeValue: o,
        className: "mt-6",
        children: e.jsxs("div", {
          className: "grid gap-6 lg:grid-cols-3",
          children: [
            e.jsxs(x, {
              children: [
                e.jsxs(h, {
                  children: [
                    e.jsx(j, { children: "Photo de profil" }),
                    e.jsx(g, { children: "Cliquez pour modifier" }),
                  ],
                }),
                e.jsxs(w, {
                  className: "flex flex-col items-center",
                  children: [
                    e.jsxs("label", {
                      className: "relative cursor-pointer group",
                      children: [
                        e.jsx("div", {
                          className:
                            "h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-2xl font-bold text-primary ring-4 ring-primary/10 overflow-hidden",
                          children: r?.avatar_url
                            ? e.jsx("img", {
                                src: r.avatar_url,
                                alt: r.full_name,
                                className: "h-full w-full object-cover",
                              })
                            : Q(r?.full_name ?? "U"),
                        }),
                        e.jsx("div", {
                          className:
                            "absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                          children: e.jsx(X, {
                            className: "h-6 w-6 text-white",
                          }),
                        }),
                        e.jsx("input", {
                          type: "file",
                          accept: "image/*",
                          className: "hidden",
                          onChange: O,
                          disabled: s,
                        }),
                      ],
                    }),
                    e.jsx("p", {
                      className: "mt-3 text-sm font-medium text-foreground",
                      children: r?.full_name,
                    }),
                    e.jsx("p", {
                      className: "text-xs text-muted-foreground",
                      children: r?.email,
                    }),
                    s &&
                      e.jsx("p", {
                        className: "mt-2 text-xs text-primary",
                        children: "Téléchargement...",
                      }),
                  ],
                }),
              ],
            }),
            e.jsxs(x, {
              className: "lg:col-span-2",
              children: [
                e.jsxs(h, {
                  children: [
                    e.jsx(j, { children: "Informations personnelles" }),
                    e.jsx(g, { children: "Mettez à jour vos informations" }),
                  ],
                }),
                e.jsx(w, {
                  children: e.jsxs("form", {
                    onSubmit: y(D),
                    className: "space-y-4",
                    children: [
                      e.jsx(n, {
                        label: "Nom complet",
                        ...N("full_name"),
                        error: d.full_name?.message,
                      }),
                      e.jsx(n, {
                        label: "Email",
                        value: r?.email ?? "",
                        disabled: !0,
                        className: "opacity-60",
                      }),
                      e.jsx(n, {
                        label: "Téléphone",
                        ...N("phone"),
                        placeholder: "+33 6 00 00 00 00",
                        error: d.phone?.message,
                      }),
                      e.jsx("div", {
                        className: "flex justify-end pt-2",
                        children: e.jsx(A, {
                          type: "submit",
                          loading: t.isPending,
                          disabled: !M,
                          icon: e.jsx(Z, { className: "h-4 w-4" }),
                          children: "Enregistrer",
                        }),
                      }),
                    ],
                  }),
                }),
              ],
            }),
          ],
        }),
      }),
      e.jsx(E, {
        value: "security",
        activeValue: o,
        className: "mt-6",
        children: e.jsxs(x, {
          className: "max-w-xl",
          children: [
            e.jsxs(h, {
              children: [
                e.jsx(j, { children: "Changer le mot de passe" }),
                e.jsx(g, {
                  children: "Utilisez un mot de passe fort et unique",
                }),
              ],
            }),
            e.jsx(w, {
              children: e.jsxs("form", {
                onSubmit: L(V),
                className: "space-y-4",
                children: [
                  e.jsx(n, {
                    label: "Mot de passe actuel",
                    type: "password",
                    ...C("currentPassword"),
                    error: S.currentPassword?.message,
                  }),
                  e.jsx(n, {
                    label: "Nouveau mot de passe",
                    type: "password",
                    ...C("newPassword"),
                    error: S.newPassword?.message,
                  }),
                  e.jsx(n, {
                    label: "Confirmer le mot de passe",
                    type: "password",
                    ...C("confirmPassword"),
                    error: S.confirmPassword?.message,
                  }),
                  e.jsx("div", {
                    className: "flex justify-end pt-2",
                    children: e.jsx(A, {
                      type: "submit",
                      loading: b,
                      icon: e.jsx(q, { className: "h-4 w-4" }),
                      children: "Mettre à jour",
                    }),
                  }),
                ],
              }),
            }),
          ],
        }),
      }),
      e.jsx(E, {
        value: "notifications",
        activeValue: o,
        className: "mt-6",
        children: e.jsx(ne, {}),
      }),
    ],
  });
}
const le = [
  {
    key: "sound_enabled",
    label: "Son de notification",
    description: "Jouer un son lors de la réception de notifications",
  },
  {
    key: "new_messages",
    label: "Nouveaux messages",
    description: "Recevoir une notification pour chaque nouveau message",
  },
  {
    key: "new_leads",
    label: "Nouveaux leads",
    description: "Être notifié quand un nouveau lead est ajouté",
  },
  {
    key: "call_reminders",
    label: "Rappels de calls",
    description: "Recevoir un rappel avant chaque call planifié",
  },
  {
    key: "formation_progress",
    label: "Progression formations",
    description: "Notifications sur la progression des formations",
  },
];
function ne() {
  const { data: a, isLoading: r } = W(),
    t = Y(),
    o = a ?? ee,
    c = f.useCallback(
      (s) => {
        t.mutate({ ...o, [s]: !o[s] });
      },
      [o, t],
    );
  return r
    ? e.jsxs(x, {
        className: "max-w-xl",
        children: [
          e.jsxs(h, {
            children: [
              e.jsx(j, { children: "Préférences de notifications" }),
              e.jsx(g, {
                children:
                  "Choisissez les notifications que vous souhaitez recevoir",
              }),
            ],
          }),
          e.jsx(w, {
            children: e.jsx("div", {
              className: "space-y-4",
              children: Array.from({ length: 4 }).map((s, i) =>
                e.jsx(se, { className: "h-16 w-full rounded-lg" }, i),
              ),
            }),
          }),
        ],
      })
    : e.jsxs(x, {
        className: "max-w-xl",
        children: [
          e.jsxs(h, {
            children: [
              e.jsx(j, { children: "Préférences de notifications" }),
              e.jsx(g, {
                children:
                  "Choisissez les notifications que vous souhaitez recevoir",
              }),
            ],
          }),
          e.jsx(w, {
            children: e.jsx("div", {
              className: "space-y-4",
              children: le.map((s) =>
                e.jsx(
                  "div",
                  {
                    className: "rounded-lg border border-border p-4",
                    children: e.jsx(z, {
                      label: s.label,
                      description: s.description,
                      checked: o[s.key],
                      onCheckedChange: () => c(s.key),
                      disabled: t.isPending,
                      wrapperClassName: "w-full",
                    }),
                  },
                  s.key,
                ),
              ),
            }),
          }),
        ],
      });
}
export { ye as default };
