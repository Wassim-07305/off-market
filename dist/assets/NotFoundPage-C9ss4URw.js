import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { B as r } from "./button-DlbP8VPc.js";
import { O as a } from "./index-DY9GA2La.js";
import { u as s } from "./usePageTitle-I7G4QvKX.js";
import { f as o } from "./vendor-react-Cci7g3Cb.js";
import { ad as i, p as l } from "./vendor-ui-DDdrexJZ.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
function b() {
  s("Page introuvable");
  const t = o();
  return e.jsxs("div", {
    className:
      "flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-background to-red-50/30 px-4",
    children: [
      e.jsxs("div", {
        className: "absolute inset-0 overflow-hidden",
        children: [
          e.jsx("div", {
            className:
              "absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl",
          }),
          e.jsx("div", {
            className:
              "absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl",
          }),
        ],
      }),
      e.jsxs("div", {
        className: "relative text-center",
        children: [
          e.jsx(a, {
            size: 48,
            showText: !1,
            className: "mx-auto mb-6 opacity-20",
          }),
          e.jsx("div", {
            className:
              "mb-2 text-8xl font-bold tracking-tighter text-primary/20",
            children: "404",
          }),
          e.jsx("h1", {
            className: "mb-2 text-2xl font-bold text-foreground",
            children: "Page introuvable",
          }),
          e.jsx("p", {
            className: "mb-8 max-w-md text-muted-foreground",
            children:
              "La page que vous recherchez n'existe pas ou a été déplacée.",
          }),
          e.jsxs("div", {
            className: "flex flex-col gap-3 sm:flex-row sm:justify-center",
            children: [
              e.jsx(r, {
                variant: "secondary",
                onClick: () => t(-1),
                icon: e.jsx(i, { className: "h-4 w-4" }),
                children: "Retour",
              }),
              e.jsx(r, {
                onClick: () => t("/"),
                icon: e.jsx(l, { className: "h-4 w-4" }),
                children: "Accueil",
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
export { b as default };
