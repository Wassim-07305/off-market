import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { C as i, a as r, b as a, c as n, d as t } from "./card-Dkj99_H3.js";
import { u as l } from "./usePageTitle-I7G4QvKX.js";
import { l as o, aX as c, aY as m, aZ as p } from "./vendor-ui-DDdrexJZ.js";
import "./vendor-react-Cci7g3Cb.js";
import "./index-DY9GA2La.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
const x = [
    "Connectez-vous avec vos identifiants",
    "Consultez le Dashboard pour voir vos KPIs",
    "Gérez vos clients depuis l'onglet Prospects",
    "Suivez votre pipeline de leads",
    "Planifiez vos appels dans le calendrier",
  ],
  u = [
    { name: "Dashboard", description: "Vue d'ensemble des performances" },
    { name: "Pipeline", description: "Suivi des leads et prospection" },
    { name: "Calendrier", description: "Planification des appels" },
    { name: "CA & Calls", description: "Suivi des appels de closing" },
    { name: "Contenus Social", description: "Pipeline de création de contenu" },
    { name: "Finances", description: "Gestion financière" },
    { name: "Instagram", description: "Analytics des réseaux sociaux" },
    { name: "Messagerie", description: "Communication d'équipe" },
    { name: "Formations", description: "Cours et progressions" },
  ],
  h = [
    { name: "Admin", description: "Accès complet à tous les modules" },
    {
      name: "Coach",
      description: "Gestion des prospects, calendrier, contenus",
    },
    {
      name: "Prospect",
      description: "Dashboard, pipeline, formations, messagerie",
    },
  ];
function P() {
  return (
    l("Documentation"),
    e.jsxs("div", {
      className: "space-y-8",
      children: [
        e.jsxs("div", {
          children: [
            e.jsxs("div", {
              className: "flex items-center gap-3 mb-2",
              children: [
                e.jsx(o, { className: "h-7 w-7 text-primary" }),
                e.jsx("h1", {
                  className: "text-2xl font-bold tracking-tight",
                  children: "Documentation",
                }),
              ],
            }),
            e.jsx("p", {
              className: "text-muted-foreground",
              children: "Guide d'utilisation de la plateforme Off-Market.",
            }),
          ],
        }),
        e.jsxs(i, {
          children: [
            e.jsxs(r, {
              children: [
                e.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    e.jsx(c, { className: "h-5 w-5 text-primary" }),
                    e.jsx(a, { children: "Prise en main rapide" }),
                  ],
                }),
                e.jsx(n, {
                  children:
                    "Suivez ces étapes pour démarrer sur la plateforme.",
                }),
              ],
            }),
            e.jsx(t, {
              children: e.jsx("ol", {
                className: "space-y-3",
                children: x.map((s, d) =>
                  e.jsxs(
                    "li",
                    {
                      className: "flex items-start gap-3",
                      children: [
                        e.jsx("span", {
                          className:
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary",
                          children: d + 1,
                        }),
                        e.jsx("span", {
                          className: "text-sm text-foreground",
                          children: s,
                        }),
                      ],
                    },
                    d,
                  ),
                ),
              }),
            }),
          ],
        }),
        e.jsxs(i, {
          children: [
            e.jsxs(r, {
              children: [
                e.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    e.jsx(m, { className: "h-5 w-5 text-primary" }),
                    e.jsx(a, { children: "Modules disponibles" }),
                  ],
                }),
                e.jsx(n, {
                  children:
                    "Tous les modules accessibles depuis la plateforme.",
                }),
              ],
            }),
            e.jsx(t, {
              children: e.jsx("div", {
                className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
                children: u.map((s) =>
                  e.jsxs(
                    "div",
                    {
                      className:
                        "rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/50",
                      children: [
                        e.jsx("p", {
                          className: "text-sm font-medium",
                          children: s.name,
                        }),
                        e.jsx("p", {
                          className: "text-xs text-muted-foreground mt-1",
                          children: s.description,
                        }),
                      ],
                    },
                    s.name,
                  ),
                ),
              }),
            }),
          ],
        }),
        e.jsxs(i, {
          children: [
            e.jsxs(r, {
              children: [
                e.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    e.jsx(p, { className: "h-5 w-5 text-primary" }),
                    e.jsx(a, { children: "Rôles et permissions" }),
                  ],
                }),
                e.jsx(n, { children: "Niveaux d'accès selon votre rôle." }),
              ],
            }),
            e.jsx(t, {
              children: e.jsx("div", {
                className: "space-y-3",
                children: h.map((s) =>
                  e.jsxs(
                    "div",
                    {
                      className:
                        "flex items-start gap-3 rounded-lg border border-border/50 p-4",
                      children: [
                        e.jsx("span", {
                          className:
                            "inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary",
                          children: s.name,
                        }),
                        e.jsx("span", {
                          className: "text-sm text-muted-foreground",
                          children: s.description,
                        }),
                      ],
                    },
                    s.name,
                  ),
                ),
              }),
            }),
          ],
        }),
      ],
    })
  );
}
export { P as default };
