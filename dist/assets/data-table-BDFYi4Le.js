import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { r as l } from "./vendor-react-Cci7g3Cb.js";
import {
  u as y,
  f as m,
  b as P,
  d as R,
  g as F,
  a as M,
} from "./index-Ddu5uNF-.js";
import { c as a } from "./index-DY9GA2La.js";
import { a3 as D, af as A, am as V } from "./vendor-ui-DDdrexJZ.js";
function H({
  columns: i,
  data: d,
  searchable: x = !1,
  searchPlaceholder: p = "Rechercher...",
  searchColumn: s,
  pagination: c = !0,
  pageSize: b = 10,
  onRowClick: n,
  emptyState: f,
  className: h,
}) {
  const [j, w] = l.useState([]),
    [N, v] = l.useState([]),
    [g, u] = l.useState(""),
    o = y({
      data: d,
      columns: i,
      state: { sorting: j, columnFilters: N, globalFilter: s ? void 0 : g },
      onSortingChange: w,
      onColumnFiltersChange: v,
      onGlobalFilterChange: s ? void 0 : u,
      getCoreRowModel: M(),
      getSortedRowModel: F(),
      getPaginationRowModel: c ? R() : void 0,
      getFilteredRowModel: P(),
      initialState: { pagination: { pageSize: b } },
    }),
    S = (r) => {
      s ? o.getColumn(s)?.setFilterValue(r) : u(r);
    },
    C = s ? (o.getColumn(s)?.getFilterValue() ?? "") : g;
  return e.jsxs("div", {
    className: a("flex flex-col gap-4", h),
    children: [
      x &&
        e.jsx("div", {
          className: "flex items-center",
          children: e.jsx("input", {
            placeholder: p,
            value: C,
            onChange: (r) => S(r.target.value),
            className: a(
              "h-9 max-w-sm rounded-xl border border-border bg-white px-3 text-sm",
              "transition-all duration-200",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
            ),
          }),
        }),
      e.jsx("div", {
        className:
          "overflow-x-auto rounded-xl border border-border/60 bg-card shadow-sm",
        children: e.jsxs("table", {
          className: "w-full text-sm",
          children: [
            e.jsx("thead", {
              children: o.getHeaderGroups().map((r) =>
                e.jsx(
                  "tr",
                  {
                    className: "border-b border-border/40 bg-muted/50",
                    children: r.headers.map((t) =>
                      e.jsx(
                        "th",
                        {
                          className: a(
                            "whitespace-nowrap px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                            t.column.getCanSort() &&
                              "cursor-pointer select-none",
                          ),
                          onClick: t.column.getToggleSortingHandler(),
                          children: e.jsxs("div", {
                            className: "flex items-center gap-1.5",
                            children: [
                              t.isPlaceholder
                                ? null
                                : m(t.column.columnDef.header, t.getContext()),
                              t.column.getCanSort() &&
                                e.jsx("span", {
                                  className: "text-muted-foreground/50",
                                  children:
                                    t.column.getIsSorted() === "asc"
                                      ? e.jsx(D, { className: "h-3.5 w-3.5" })
                                      : t.column.getIsSorted() === "desc"
                                        ? e.jsx(A, {
                                            className: "h-3.5 w-3.5",
                                          })
                                        : e.jsx(V, {
                                            className: "h-3.5 w-3.5",
                                          }),
                                }),
                            ],
                          }),
                        },
                        t.id,
                      ),
                    ),
                  },
                  r.id,
                ),
              ),
            }),
            e.jsx("tbody", {
              children:
                o.getRowModel().rows.length > 0
                  ? o.getRowModel().rows.map((r) =>
                      e.jsx(
                        "tr",
                        {
                          className: a(
                            "group border-b border-border/30 last:border-0",
                            "transition-colors duration-150",
                            n && "cursor-pointer hover:bg-primary/[0.03]",
                            !n && "hover:bg-muted/30",
                          ),
                          onClick: () => n?.(r.original),
                          children: r.getVisibleCells().map((t) =>
                            e.jsx(
                              "td",
                              {
                                className: "px-5 py-3.5",
                                children: m(
                                  t.column.columnDef.cell,
                                  t.getContext(),
                                ),
                              },
                              t.id,
                            ),
                          ),
                        },
                        r.id,
                      ),
                    )
                  : e.jsx("tr", {
                      children: e.jsx("td", {
                        colSpan: i.length,
                        className:
                          "px-4 py-12 text-center text-muted-foreground",
                        children: f || "Aucun résultat.",
                      }),
                    }),
            }),
          ],
        }),
      }),
      c &&
        o.getPageCount() > 1 &&
        e.jsxs("div", {
          className:
            "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm",
          children: [
            e.jsxs("span", {
              className: "text-muted-foreground",
              children: [
                "Page ",
                o.getState().pagination.pageIndex + 1,
                " sur",
                " ",
                o.getPageCount(),
                " (",
                d.length,
                " éléments)",
              ],
            }),
            e.jsxs("div", {
              className: "flex items-center gap-2",
              children: [
                e.jsx("button", {
                  type: "button",
                  onClick: () => o.previousPage(),
                  disabled: !o.getCanPreviousPage(),
                  className: a(
                    "rounded-xl border border-border px-3 py-1.5 text-sm",
                    "transition-all duration-200",
                    "hover:bg-secondary",
                    "disabled:pointer-events-none disabled:opacity-50",
                    "cursor-pointer",
                  ),
                  children: "Précédent",
                }),
                e.jsx("button", {
                  type: "button",
                  onClick: () => o.nextPage(),
                  disabled: !o.getCanNextPage(),
                  className: a(
                    "rounded-xl border border-border px-3 py-1.5 text-sm",
                    "transition-all duration-200",
                    "hover:bg-secondary",
                    "disabled:pointer-events-none disabled:opacity-50",
                    "cursor-pointer",
                  ),
                  children: "Suivant",
                }),
              ],
            }),
          ],
        }),
    ],
  });
}
export { H as D };
