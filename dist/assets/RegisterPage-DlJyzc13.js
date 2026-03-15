import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { f as C, r as m, L as y } from "./vendor-react-Cci7g3Cb.js";
import { u as S, o as P, s as c, e as k } from "./vendor-forms-Ct2mZ2NL.js";
import { a as I } from "./zod-COY_rf8d.js";
import {
  y as L,
  a7 as E,
  a8 as p,
  a9 as d,
  aa as x,
  ac as R,
  t as f,
} from "./vendor-ui-DDdrexJZ.js";
import { u as z, O as M } from "./index-DY9GA2La.js";
import { B as U } from "./button-DlbP8VPc.js";
import { I as o } from "./input-B9vrc6Q3.js";
import { C as _, a as D, b as O, c as T, d as A } from "./card-Dkj99_H3.js";
import { u as B } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
const F = P({
  full_name: c().min(2, "Le nom doit contenir au moins 2 caracteres"),
  email: k("Adresse email invalide"),
  password: c().min(6, "Le mot de passe doit contenir au moins 6 caracteres"),
  confirmPassword: c(),
}).check((s) => {
  s.value.password !== s.value.confirmPassword &&
    s.issues.push({
      input: s.value.confirmPassword,
      code: "custom",
      message: "Les mots de passe ne correspondent pas",
      path: ["confirmPassword"],
    });
});
function ee() {
  B("Inscription");
  const { signUp: s } = z(),
    h = C(),
    [j, l] = m.useState(!1),
    [t, w] = m.useState(!1),
    [n, g] = m.useState(!1),
    {
      register: r,
      handleSubmit: N,
      formState: { errors: a },
    } = S({ resolver: I(F) });
  async function b(i) {
    l(!0);
    try {
      (await s(i.email, i.password, i.full_name),
        f.success("Compte créé avec succès !"),
        h("/", { replace: !0 }));
    } catch (u) {
      const v = u instanceof Error ? u.message : "Une erreur est survenue";
      f.error(v);
    } finally {
      l(!1);
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
            e.jsx(M, {
              size: 48,
              showText: !0,
              textClassName: "text-2xl text-foreground",
            }),
            e.jsx("p", {
              className: "mt-3 text-muted-foreground",
              children: "Créez votre compte pour commencer",
            }),
          ],
        }),
        e.jsxs(_, {
          children: [
            e.jsxs(D, {
              children: [
                e.jsx(O, { children: "Inscription" }),
                e.jsx(T, {
                  children: "Remplissez le formulaire pour créer votre compte",
                }),
              ],
            }),
            e.jsx(A, {
              children: e.jsxs("form", {
                onSubmit: N(b),
                className: "flex flex-col gap-4",
                children: [
                  e.jsx(o, {
                    label: "Nom complet",
                    type: "text",
                    placeholder: "Jean Dupont",
                    icon: e.jsx(L, { className: "h-4 w-4" }),
                    error: a.full_name?.message,
                    ...r("full_name"),
                  }),
                  e.jsx(o, {
                    label: "Email",
                    type: "email",
                    placeholder: "vous@exemple.com",
                    icon: e.jsx(E, { className: "h-4 w-4" }),
                    error: a.email?.message,
                    ...r("email"),
                  }),
                  e.jsx(o, {
                    label: "Mot de passe",
                    type: t ? "text" : "password",
                    placeholder: "Minimum 6 caracteres",
                    icon: e.jsx(x, { className: "h-4 w-4" }),
                    iconRight: e.jsx("button", {
                      type: "button",
                      tabIndex: -1,
                      onClick: () => w(!t),
                      className: "cursor-pointer",
                      children: t
                        ? e.jsx(p, { className: "h-4 w-4" })
                        : e.jsx(d, { className: "h-4 w-4" }),
                    }),
                    error: a.password?.message,
                    ...r("password"),
                  }),
                  e.jsx(o, {
                    label: "Confirmer le mot de passe",
                    type: n ? "text" : "password",
                    placeholder: "Retapez votre mot de passe",
                    icon: e.jsx(x, { className: "h-4 w-4" }),
                    iconRight: e.jsx("button", {
                      type: "button",
                      tabIndex: -1,
                      onClick: () => g(!n),
                      className: "cursor-pointer",
                      children: n
                        ? e.jsx(p, { className: "h-4 w-4" })
                        : e.jsx(d, { className: "h-4 w-4" }),
                    }),
                    error: a.confirmPassword?.message,
                    ...r("confirmPassword"),
                  }),
                  e.jsx(U, {
                    type: "submit",
                    loading: j,
                    icon: e.jsx(R, { className: "h-4 w-4" }),
                    className: "w-full",
                    children: "Créer mon compte",
                  }),
                  e.jsxs("p", {
                    className: "text-center text-sm text-muted-foreground",
                    children: [
                      "Deja un compte ?",
                      " ",
                      e.jsx(y, {
                        to: "/login",
                        className: "text-primary hover:underline",
                        children: "Se connecter",
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
  });
}
export { ee as default };
