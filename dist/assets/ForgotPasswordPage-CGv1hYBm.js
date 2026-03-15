import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { r, L as o } from "./vendor-react-Cci7g3Cb.js";
import { u as g, o as v, e as N } from "./vendor-forms-Ct2mZ2NL.js";
import { a as b } from "./zod-COY_rf8d.js";
import { a7 as i, ad as n, ae as w, t as S } from "./vendor-ui-DDdrexJZ.js";
import { u as y, O as C } from "./index-DY9GA2La.js";
import { B as l } from "./button-DlbP8VPc.js";
import { I as E } from "./input-B9vrc6Q3.js";
import { C as P, a as L, b as M, c as R, d as k } from "./card-Dkj99_H3.js";
import { u as z } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
const A = v({ email: N("Adresse email invalide") });
function Q() {
  z("Mot de passe oublié");
  const { resetPassword: m } = y(),
    [c, s] = r.useState(!1),
    [t, d] = r.useState(!1),
    {
      register: u,
      handleSubmit: x,
      formState: { errors: f },
    } = g({ resolver: b(A) });
  async function p(h) {
    s(!0);
    try {
      (await m(h.email), d(!0));
    } catch (a) {
      const j = a instanceof Error ? a.message : "Une erreur est survenue";
      S.error(j);
    } finally {
      s(!1);
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
            e.jsx(C, {
              size: 48,
              showText: !0,
              textClassName: "text-2xl text-foreground",
            }),
            e.jsx("p", {
              className: "mt-3 text-muted-foreground",
              children: "Réinitialisation du mot de passe",
            }),
          ],
        }),
        e.jsxs(P, {
          children: [
            e.jsxs(L, {
              children: [
                e.jsx(M, { children: "Mot de passe oublié" }),
                e.jsx(R, {
                  children: t
                    ? "Un email de réinitialisation a été envoyé"
                    : "Entrez votre email pour recevoir un lien de réinitialisation",
                }),
              ],
            }),
            e.jsx(k, {
              children: t
                ? e.jsxs("div", {
                    className: "flex flex-col gap-4",
                    children: [
                      e.jsxs("div", {
                        className: "rounded-md bg-muted p-4 text-center",
                        children: [
                          e.jsx(i, {
                            className: "mx-auto mb-2 h-10 w-10 text-primary",
                          }),
                          e.jsx("p", {
                            className: "text-sm text-foreground",
                            children:
                              "Si un compte est associé à cette adresse, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.",
                          }),
                        ],
                      }),
                      e.jsx(o, {
                        to: "/login",
                        children: e.jsx(l, {
                          variant: "secondary",
                          className: "w-full",
                          icon: e.jsx(n, { className: "h-4 w-4" }),
                          children: "Retour à la connexion",
                        }),
                      }),
                    ],
                  })
                : e.jsxs("form", {
                    onSubmit: x(p),
                    className: "flex flex-col gap-4",
                    children: [
                      e.jsx(E, {
                        label: "Email",
                        type: "email",
                        placeholder: "vous@exemple.com",
                        icon: e.jsx(i, { className: "h-4 w-4" }),
                        error: f.email?.message,
                        ...u("email"),
                      }),
                      e.jsx(l, {
                        type: "submit",
                        loading: c,
                        icon: e.jsx(w, { className: "h-4 w-4" }),
                        className: "w-full",
                        children: "Envoyer le lien",
                      }),
                      e.jsxs(o, {
                        to: "/login",
                        className:
                          "flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground",
                        children: [
                          e.jsx(n, { className: "h-4 w-4" }),
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
export { Q as default };
