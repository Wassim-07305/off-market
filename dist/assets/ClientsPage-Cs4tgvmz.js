import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { f as g, r as d } from "./vendor-react-Cci7g3Cb.js";
import { u as h } from "./useEleves-Dg_0NJBt.js";
import { S as p } from "./search-input-dECf1iQ_.js";
import { P as j } from "./pagination-DHo4QjB2.js";
import { S as N, g as v, b as w } from "./index-DY9GA2La.js";
import { E as C } from "./empty-state-BFSeK4Tv.js";
import { C as _, d as b } from "./card-Dkj99_H3.js";
import { I as P } from "./constants-IBlSVYu1.js";
import { u as y } from "./usePageTitle-I7G4QvKX.js";
import { U as E } from "./vendor-ui-DDdrexJZ.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
function S(o) {
  if (!o) return "Jamais";
  const r = Date.now() - new Date(o).getTime(),
    t = Math.floor(r / 36e5);
  if (t < 1) return "En ligne";
  if (t < 24) return `Il y a ${t}h`;
  const a = Math.floor(t / 24);
  return a === 1 ? "Hier" : `Il y a ${a}j`;
}
function J() {
  y("Prospects");
  const o = g(),
    [r, t] = d.useState(""),
    [a, n] = d.useState(1),
    { data: l, isLoading: m } = h({ search: r || void 0, page: a }),
    i = l?.data ?? [],
    c = l?.count ?? 0,
    x = Math.ceil(c / P),
    u = (s) => {
      (t(s), n(1));
    };
  return e.jsxs("div", {
    className: "space-y-8",
    children: [
      e.jsx("div", {
        className:
          "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        children: e.jsx("h1", {
          className: "text-xl font-bold text-foreground sm:text-2xl",
          children: "Élèves",
        }),
      }),
      e.jsx("div", {
        className: "flex flex-col gap-3 sm:flex-row sm:items-center",
        children: e.jsx(p, {
          value: r,
          onChange: u,
          placeholder: "Rechercher un élève...",
          wrapperClassName: "w-full sm:max-w-xs",
        }),
      }),
      m
        ? e.jsx("div", {
            className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
            children: Array.from({ length: 6 }).map((s, f) =>
              e.jsx(N, { className: "h-32 w-full rounded-xl" }, f),
            ),
          })
        : i.length === 0
          ? e.jsx(C, {
              icon: e.jsx(E, { className: "h-6 w-6" }),
              title: "Aucun élève",
              description: r
                ? "Aucun élève ne correspond à votre recherche."
                : "Aucun élève n'est inscrit pour le moment.",
            })
          : e.jsxs(e.Fragment, {
              children: [
                e.jsx("div", {
                  className:
                    "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
                  children: i.map((s) =>
                    e.jsx(
                      _,
                      {
                        className:
                          "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/20",
                        onClick: () => o(`/eleves/${s.id}`),
                        children: e.jsxs(b, {
                          className: "p-5",
                          children: [
                            e.jsxs("div", {
                              className: "flex items-center gap-3",
                              children: [
                                e.jsx("div", {
                                  className:
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-red-400/10 text-xs font-semibold text-red-300 ring-2 ring-red-500/10",
                                  children: s.avatar_url
                                    ? e.jsx("img", {
                                        src: s.avatar_url,
                                        alt: s.full_name,
                                        className:
                                          "h-10 w-10 rounded-full object-cover",
                                      })
                                    : v(s.full_name),
                                }),
                                e.jsxs("div", {
                                  className: "min-w-0 flex-1",
                                  children: [
                                    e.jsx("p", {
                                      className:
                                        "truncate text-sm font-semibold text-foreground",
                                      children: s.full_name,
                                    }),
                                    e.jsx("p", {
                                      className:
                                        "truncate text-xs text-muted-foreground",
                                      children: s.email,
                                    }),
                                  ],
                                }),
                                e.jsx("span", {
                                  className:
                                    "shrink-0 text-xs text-muted-foreground",
                                  children: S(s.last_seen_at),
                                }),
                              ],
                            }),
                            e.jsxs("div", {
                              className: "mt-4 grid grid-cols-2 gap-3",
                              children: [
                                e.jsxs("div", {
                                  children: [
                                    e.jsx("p", {
                                      className:
                                        "text-[10px] font-medium uppercase tracking-wider text-muted-foreground",
                                      children: "Leads",
                                    }),
                                    e.jsx("p", {
                                      className:
                                        "text-lg font-bold text-foreground",
                                      children: s.leads_count,
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  children: [
                                    e.jsx("p", {
                                      className:
                                        "text-[10px] font-medium uppercase tracking-wider text-muted-foreground",
                                      children: "CA Total",
                                    }),
                                    e.jsx("p", {
                                      className:
                                        "text-lg font-bold text-foreground",
                                      children: w(s.ca_total),
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      },
                      s.id,
                    ),
                  ),
                }),
                e.jsx(j, {
                  currentPage: a,
                  totalPages: x,
                  onPageChange: n,
                  totalItems: c,
                }),
              ],
            }),
    ],
  });
}
export { J as default };
