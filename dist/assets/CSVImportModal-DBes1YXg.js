import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { r } from "./vendor-react-Cci7g3Cb.js";
import { M as B } from "./modal-DBBZDXoW.js";
import { B as g } from "./button-DlbP8VPc.js";
import { c as M } from "./index-DY9GA2La.js";
import { i as O } from "./csv-DLhVFTuh.js";
import {
  aq as S,
  aK as E,
  f as q,
  ar as A,
  X as G,
  Y as K,
} from "./vendor-ui-DDdrexJZ.js";
function Z({
  open: D,
  onClose: v,
  title: F,
  description: L,
  columns: l,
  onImport: b,
  templateFilename: N = "template-import",
}) {
  const [p, m] = r.useState("idle"),
    [I, y] = r.useState(null),
    [n, w] = r.useState([]),
    [h, i] = r.useState(null),
    [d, C] = r.useState(null),
    o = r.useRef(null),
    f = r.useCallback(() => {
      (m("idle"),
        y(null),
        w([]),
        i(null),
        C(null),
        o.current && (o.current.value = ""));
    }, []),
    k = r.useCallback(() => {
      (f(), v());
    }, [f, v]),
    T = r.useCallback(
      async (s) => {
        const a = s.target.files?.[0];
        if (a) {
          if ((i(null), !a.name.endsWith(".csv"))) {
            i("Le fichier doit être au format CSV");
            return;
          }
          try {
            const t = await O(a, l);
            if (t.length === 0) {
              i("Le fichier CSV est vide");
              return;
            }
            const j = l.filter((c) => c.required),
              x = t.filter((c) => j.some((u) => !c[u.key]?.trim()));
            (x.length > 0 &&
              i(
                `${x.length} ligne(s) ont des champs requis manquants (${j.map((c) => c.label).join(", ")})`,
              ),
              y(a),
              w(t),
              m("preview"));
          } catch (t) {
            i(
              t instanceof Error
                ? t.message
                : "Erreur lors de la lecture du fichier",
            );
          }
        }
      },
      [l],
    ),
    U = r.useCallback(async () => {
      m("importing");
      try {
        const s = await b(n);
        (C(s), m("done"));
      } catch {
        (i("Erreur lors de l'import"), m("preview"));
      }
    }, [n, b]),
    V = r.useCallback(() => {
      const s = l.map((u) => u.label).join(","),
        a = l.map((u) => (u.required ? "exemple" : "")).join(","),
        t = `${s}
${a}`,
        j = new Blob(["\uFEFF" + t], { type: "text/csv;charset=utf-8;" }),
        x = URL.createObjectURL(j),
        c = document.createElement("a");
      ((c.href = x),
        (c.download = `${N}.csv`),
        c.click(),
        URL.revokeObjectURL(x));
    }, [l, N]),
    $ = r.useCallback((s) => {
      s.preventDefault();
      const a = s.dataTransfer.files[0];
      if (a) {
        const t = new DataTransfer();
        (t.items.add(a),
          o.current &&
            ((o.current.files = t.files),
            o.current.dispatchEvent(new Event("change", { bubbles: !0 }))));
      }
    }, []),
    R = l.slice(0, 5),
    z = n.slice(0, 5);
  return e.jsxs(B, {
    open: D,
    onClose: k,
    title: F,
    description: L,
    size: "lg",
    children: [
      p === "idle" &&
        e.jsxs("div", {
          className: "space-y-4",
          children: [
            e.jsxs("div", {
              onDragOver: (s) => s.preventDefault(),
              onDrop: $,
              className: M(
                "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors",
                "border-border/60 hover:border-primary/40 hover:bg-primary/5",
              ),
              children: [
                e.jsx(S, { className: "h-8 w-8 text-muted-foreground/60" }),
                e.jsxs("div", {
                  className: "text-center",
                  children: [
                    e.jsx("p", {
                      className: "text-sm font-medium text-foreground",
                      children: "Glissez votre fichier CSV ici",
                    }),
                    e.jsx("p", {
                      className: "mt-1 text-xs text-muted-foreground",
                      children: "ou cliquez pour sélectionner",
                    }),
                  ],
                }),
                e.jsx("input", {
                  ref: o,
                  type: "file",
                  accept: ".csv",
                  onChange: T,
                  className: "absolute inset-0 cursor-pointer opacity-0",
                  style: { position: "relative" },
                }),
                e.jsx(g, {
                  variant: "secondary",
                  size: "sm",
                  onClick: () => o.current?.click(),
                  children: "Choisir un fichier",
                }),
              ],
            }),
            h &&
              e.jsxs("div", {
                className:
                  "flex items-start gap-2 rounded-lg bg-destructive/10 p-3",
                children: [
                  e.jsx(E, {
                    className: "mt-0.5 h-4 w-4 shrink-0 text-destructive",
                  }),
                  e.jsx("p", {
                    className: "text-sm text-destructive",
                    children: h,
                  }),
                ],
              }),
            e.jsxs("div", {
              className:
                "flex items-center justify-between rounded-lg bg-muted/50 p-3",
              children: [
                e.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    e.jsx(q, { className: "h-4 w-4 text-muted-foreground" }),
                    e.jsxs("span", {
                      className: "text-sm text-muted-foreground",
                      children: [
                        "Colonnes attendues : ",
                        l.map((s) => s.label).join(", "),
                      ],
                    }),
                  ],
                }),
                e.jsxs("button", {
                  onClick: V,
                  className:
                    "flex items-center gap-1 text-xs font-medium text-primary hover:underline",
                  children: [e.jsx(A, { className: "h-3 w-3" }), "Template"],
                }),
              ],
            }),
          ],
        }),
      p === "preview" &&
        e.jsxs("div", {
          className: "space-y-4",
          children: [
            e.jsxs("div", {
              className: "flex items-center justify-between",
              children: [
                e.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    e.jsx(q, { className: "h-4 w-4 text-primary" }),
                    e.jsx("span", {
                      className: "text-sm font-medium",
                      children: I?.name,
                    }),
                  ],
                }),
                e.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    e.jsxs("span", {
                      className: "text-sm text-muted-foreground",
                      children: [
                        n.length,
                        " ligne",
                        n.length > 1 ? "s" : "",
                        " détectée",
                        n.length > 1 ? "s" : "",
                      ],
                    }),
                    e.jsx("button", {
                      onClick: f,
                      className:
                        "rounded p-1 text-muted-foreground hover:text-foreground",
                      children: e.jsx(G, { className: "h-4 w-4" }),
                    }),
                  ],
                }),
              ],
            }),
            h &&
              e.jsxs("div", {
                className: "flex items-start gap-2 rounded-lg bg-amber-50 p-3",
                children: [
                  e.jsx(E, {
                    className: "mt-0.5 h-4 w-4 shrink-0 text-amber-600",
                  }),
                  e.jsx("p", {
                    className: "text-sm text-amber-700",
                    children: h,
                  }),
                ],
              }),
            e.jsxs("div", {
              className: "overflow-x-auto rounded-lg border border-border",
              children: [
                e.jsxs("table", {
                  className: "w-full text-sm",
                  children: [
                    e.jsx("thead", {
                      children: e.jsxs("tr", {
                        className: "border-b bg-muted/50",
                        children: [
                          R.map((s) =>
                            e.jsxs(
                              "th",
                              {
                                className:
                                  "px-3 py-2 text-left font-medium text-muted-foreground",
                                children: [
                                  s.label,
                                  s.required &&
                                    e.jsx("span", {
                                      className: "text-destructive",
                                      children: "*",
                                    }),
                                ],
                              },
                              s.key,
                            ),
                          ),
                          l.length > 5 &&
                            e.jsx("th", {
                              className:
                                "px-3 py-2 text-left font-medium text-muted-foreground",
                              children: "...",
                            }),
                        ],
                      }),
                    }),
                    e.jsx("tbody", {
                      children: z.map((s, a) =>
                        e.jsxs(
                          "tr",
                          {
                            className: "border-b last:border-0",
                            children: [
                              R.map((t) =>
                                e.jsx(
                                  "td",
                                  {
                                    className:
                                      "px-3 py-2 text-foreground truncate max-w-[150px]",
                                    children:
                                      s[t.key] ||
                                      e.jsx("span", {
                                        className: "text-muted-foreground/50",
                                        children: "—",
                                      }),
                                  },
                                  t.key,
                                ),
                              ),
                              l.length > 5 &&
                                e.jsx("td", {
                                  className: "px-3 py-2 text-muted-foreground",
                                  children: "...",
                                }),
                            ],
                          },
                          a,
                        ),
                      ),
                    }),
                  ],
                }),
                n.length > 5 &&
                  e.jsxs("div", {
                    className:
                      "border-t bg-muted/30 px-3 py-2 text-xs text-muted-foreground",
                    children: ["... et ", n.length - 5, " autres lignes"],
                  }),
              ],
            }),
            e.jsxs("div", {
              className: "flex justify-end gap-2",
              children: [
                e.jsx(g, {
                  variant: "secondary",
                  onClick: f,
                  children: "Annuler",
                }),
                e.jsxs(g, {
                  onClick: U,
                  icon: e.jsx(S, { className: "h-4 w-4" }),
                  children: [
                    "Importer ",
                    n.length,
                    " ligne",
                    n.length > 1 ? "s" : "",
                  ],
                }),
              ],
            }),
          ],
        }),
      p === "importing" &&
        e.jsxs("div", {
          className: "flex flex-col items-center gap-3 py-8",
          children: [
            e.jsx("div", {
              className:
                "h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent",
            }),
            e.jsx("p", {
              className: "text-sm text-muted-foreground",
              children: "Import en cours...",
            }),
          ],
        }),
      p === "done" &&
        d &&
        e.jsxs("div", {
          className: "space-y-4",
          children: [
            e.jsxs("div", {
              className: "flex flex-col items-center gap-3 py-4",
              children: [
                e.jsx(K, { className: "h-10 w-10 text-emerald-600" }),
                e.jsxs("div", {
                  className: "text-center",
                  children: [
                    e.jsx("p", {
                      className: "text-lg font-semibold text-foreground",
                      children: "Import terminé",
                    }),
                    e.jsxs("p", {
                      className: "mt-1 text-sm text-muted-foreground",
                      children: [
                        d.success,
                        " ligne",
                        d.success > 1 ? "s" : "",
                        " importée",
                        d.success > 1 ? "s" : "",
                        " avec succès",
                        d.errors > 0 &&
                          e.jsxs("span", {
                            className: "text-destructive",
                            children: [
                              ", ",
                              d.errors,
                              " erreur",
                              d.errors > 1 ? "s" : "",
                            ],
                          }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            e.jsx("div", {
              className: "flex justify-end",
              children: e.jsx(g, { onClick: k, children: "Fermer" }),
            }),
          ],
        }),
    ],
  });
}
export { Z as C };
