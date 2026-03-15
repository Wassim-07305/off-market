import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { f as N, r as c } from "./vendor-react-Cci7g3Cb.js";
import { u as v, o as b, s as m } from "./vendor-forms-Ct2mZ2NL.js";
import { a as C } from "./zod-COY_rf8d.js";
import { V as S, ad as l, aa as a, t as d } from "./vendor-ui-DDdrexJZ.js";
import { O as y, s as P } from "./index-DY9GA2La.js";
import { B as u } from "./button-DlbP8VPc.js";
import { I as p } from "./input-B9vrc6Q3.js";
import { C as k, a as R, b as z, c as L, d as M } from "./card-Dkj99_H3.js";
import { u as V } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
const E = b({
  password: m().min(6, "Minimum 6 caractères"),
  confirmPassword: m().min(6, "Confirmation requise"),
}).refine((s) => s.password === s.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});
function K() {
  V("Nouveau mot de passe");
  const s = N(),
    [x, t] = c.useState(!1),
    [o, f] = c.useState(!1),
    {
      register: i,
      handleSubmit: h,
      formState: { errors: n },
    } = v({ resolver: C(E) });
  async function j(g) {
    t(!0);
    try {
      const { error: r } = await P.auth.updateUser({ password: g.password });
      if (r) throw r;
      (f(!0), d.success("Mot de passe mis à jour avec succès"));
    } catch (r) {
      const w = r instanceof Error ? r.message : "Une erreur est survenue";
      d.error(w);
    } finally {
      t(!1);
    }
  }
  return e.jsx("div", {
    className:
      "flex min-h-screen items-center justify-center bg-background px-4",
    children: e.jsxs("div", {
      className: "w-full max-w-md",
      children: [
        e.jsxs("div", {
          className: "mb-8 flex flex-col items-center text-center",
          children: [
            e.jsx(y, {
              size: 48,
              showText: !0,
              textClassName: "text-2xl text-foreground",
            }),
            e.jsx("p", {
              className: "mt-3 text-muted-foreground",
              children: "Nouveau mot de passe",
            }),
          ],
        }),
        e.jsxs(k, {
          children: [
            e.jsxs(R, {
              children: [
                e.jsx(z, { children: "Réinitialiser le mot de passe" }),
                e.jsx(L, {
                  children: o
                    ? "Votre mot de passe a été mis à jour"
                    : "Choisissez un nouveau mot de passe pour votre compte",
                }),
              ],
            }),
            e.jsx(M, {
              children: o
                ? e.jsxs("div", {
                    className: "flex flex-col gap-4",
                    children: [
                      e.jsxs("div", {
                        className: "rounded-md bg-emerald-50 p-4 text-center",
                        children: [
                          e.jsx(S, {
                            className:
                              "mx-auto mb-2 h-10 w-10 text-emerald-600",
                          }),
                          e.jsx("p", {
                            className: "text-sm text-foreground",
                            children:
                              "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.",
                          }),
                        ],
                      }),
                      e.jsx(u, {
                        className: "w-full",
                        onClick: () => s("/login"),
                        icon: e.jsx(l, { className: "h-4 w-4" }),
                        children: "Aller à la connexion",
                      }),
                    ],
                  })
                : e.jsxs("form", {
                    onSubmit: h(j),
                    className: "flex flex-col gap-4",
                    children: [
                      e.jsx(p, {
                        label: "Nouveau mot de passe",
                        type: "password",
                        placeholder: "Minimum 6 caractères",
                        icon: e.jsx(a, { className: "h-4 w-4" }),
                        error: n.password?.message,
                        ...i("password"),
                      }),
                      e.jsx(p, {
                        label: "Confirmer le mot de passe",
                        type: "password",
                        placeholder: "Répétez le mot de passe",
                        icon: e.jsx(a, { className: "h-4 w-4" }),
                        error: n.confirmPassword?.message,
                        ...i("confirmPassword"),
                      }),
                      e.jsx(u, {
                        type: "submit",
                        loading: x,
                        icon: e.jsx(a, { className: "h-4 w-4" }),
                        className: "w-full",
                        children: "Réinitialiser",
                      }),
                      e.jsxs("button", {
                        type: "button",
                        onClick: () => s("/login"),
                        className:
                          "flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground",
                        children: [
                          e.jsx(l, { className: "h-4 w-4" }),
                          "Retour à la connexion",
                        ],
                      }),
                    ],
                  }),
            }),
          ],
        }),
      ],
    }),
  });
}
export { K as default };
