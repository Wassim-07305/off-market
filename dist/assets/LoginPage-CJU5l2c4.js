import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { f as g, r as l, L as n } from "./vendor-react-Cci7g3Cb.js";
import { u as b, o as j, s as w, e as N } from "./vendor-forms-Ct2mZ2NL.js";
import { a as v } from "./zod-COY_rf8d.js";
import {
  a7 as y,
  a8 as C,
  a9 as S,
  aa as k,
  ab as E,
  t as L,
} from "./vendor-ui-DDdrexJZ.js";
import { u as I, O as P } from "./index-DY9GA2La.js";
import { B as M } from "./button-DlbP8VPc.js";
import { I as m } from "./input-B9vrc6Q3.js";
import { C as O, a as T, b as z, c as A, d as B } from "./card-Dkj99_H3.js";
import { u as R } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
const D = j({
  email: N("Adresse email invalide"),
  password: w().min(6, "Le mot de passe doit contenir au moins 6 caracteres"),
});
function Z() {
  R("Connexion");
  const { signIn: c } = I(),
    d = g(),
    [x, r] = l.useState(!1),
    [s, u] = l.useState(!1),
    {
      register: a,
      handleSubmit: f,
      formState: { errors: t },
    } = b({ resolver: v(D) });
  async function p(o) {
    r(!0);
    try {
      (await c(o.email, o.password), d("/", { replace: !0 }));
    } catch (i) {
      const h = i instanceof Error ? i.message : "Une erreur est survenue";
      L.error(h);
    } finally {
      r(!1);
    }
  }
  return e.jsxs("div", {
    className:
      "relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-background to-red-50/30 px-4",
    children: [
      e.jsxs("div", {
        className: "absolute inset-0 overflow-hidden",
        children: [
          e.jsx("div", {
            className:
              "absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 blur-3xl",
          }),
          e.jsx("div", {
            className:
              "absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-primary/10 to-primary/5 blur-3xl",
          }),
        ],
      }),
      e.jsxs("div", {
        className: "relative w-full max-w-md",
        children: [
          e.jsxs("div", {
            className: "mb-8 flex flex-col items-center text-center",
            children: [
              e.jsx("div", {
                className:
                  "mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-red-600 shadow-lg shadow-primary/25",
                children: e.jsx(P, {
                  size: 32,
                  showText: !1,
                  className: "text-white",
                }),
              }),
              e.jsx("h1", {
                className:
                  "mt-4 text-2xl font-bold tracking-tight text-foreground",
                children: "Off-Market",
              }),
              e.jsx("p", {
                className: "mt-2 text-muted-foreground",
                children: "Plateforme de coaching prospection",
              }),
            ],
          }),
          e.jsxs(O, {
            className: "border-0 shadow-xl shadow-black/5",
            children: [
              e.jsxs(T, {
                className: "text-center pb-2",
                children: [
                  e.jsx(z, { className: "text-xl", children: "Connexion" }),
                  e.jsx(A, {
                    children: "Entrez vos identifiants pour continuer",
                  }),
                ],
              }),
              e.jsx(B, {
                children: e.jsxs("form", {
                  onSubmit: f(p),
                  className: "flex flex-col gap-4",
                  children: [
                    e.jsx(m, {
                      label: "Email",
                      type: "email",
                      placeholder: "vous@exemple.com",
                      icon: e.jsx(y, { className: "h-4 w-4" }),
                      error: t.email?.message,
                      ...a("email"),
                    }),
                    e.jsx(m, {
                      label: "Mot de passe",
                      type: s ? "text" : "password",
                      placeholder: "Votre mot de passe",
                      icon: e.jsx(k, { className: "h-4 w-4" }),
                      iconRight: e.jsx("button", {
                        type: "button",
                        tabIndex: -1,
                        onClick: () => u(!s),
                        className: "cursor-pointer",
                        children: s
                          ? e.jsx(C, { className: "h-4 w-4" })
                          : e.jsx(S, { className: "h-4 w-4" }),
                      }),
                      error: t.password?.message,
                      ...a("password"),
                    }),
                    e.jsx("div", {
                      className: "flex justify-end",
                      children: e.jsx(n, {
                        to: "/forgot-password",
                        className: "text-sm text-primary hover:underline",
                        children: "Mot de passe oublie ?",
                      }),
                    }),
                    e.jsx(M, {
                      type: "submit",
                      loading: x,
                      icon: e.jsx(E, { className: "h-4 w-4" }),
                      className: "w-full",
                      children: "Se connecter",
                    }),
                    e.jsxs("p", {
                      className: "text-center text-sm text-muted-foreground",
                      children: [
                        "Pas encore de compte ?",
                        " ",
                        e.jsx(n, {
                          to: "/register",
                          className: "text-primary hover:underline",
                          children: "Creer un compte",
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
    ],
  });
}
export { Z as default };
