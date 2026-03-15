import { j as s } from "./vendor-query-sBpsl8Kt.js";
import { r as h } from "./vendor-react-Cci7g3Cb.js";
import { c as t } from "./index-DY9GA2La.js";
import { av as b, q as j } from "./vendor-ui-DDdrexJZ.js";
function k({
  currentPage: i,
  totalPages: n,
  onPageChange: o,
  itemsPerPage: l,
  onItemsPerPageChange: d,
  itemsPerPageOptions: x = [10, 25, 50, 100],
  totalItems: a,
  className: p,
}) {
  const f = h.useMemo(() => {
    const e = [];
    if (n <= 7) {
      for (let r = 1; r <= n; r++) e.push(r);
      return e;
    }
    e.push(1);
    const m = Math.max(2, i - 1),
      u = Math.min(n - 1, i + 1);
    m > 2 && e.push("ellipsis");
    for (let r = m; r <= u; r++) e.push(r);
    return (u < n - 1 && e.push("ellipsis"), e.push(n), e);
  }, [i, n]);
  return n <= 1
    ? null
    : s.jsxs("div", {
        className: t(
          "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
          p,
        ),
        children: [
          s.jsxs("div", {
            className: "flex items-center gap-2 text-sm text-muted-foreground",
            children: [
              a !== void 0 && s.jsxs("span", { children: [a, " éléments"] }),
              d &&
                l &&
                s.jsxs("div", {
                  className: "flex items-center gap-1.5",
                  children: [
                    s.jsx("span", {
                      className: "hidden sm:inline",
                      children: "|",
                    }),
                    s.jsx("select", {
                      value: l,
                      onChange: (e) => d(Number(e.target.value)),
                      className: t(
                        "h-8 rounded-md border border-border bg-background px-2 text-sm",
                        "transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-ring",
                        "cursor-pointer",
                      ),
                      children: x.map((e) =>
                        s.jsxs(
                          "option",
                          { value: e, children: [e, " / page"] },
                          e,
                        ),
                      ),
                    }),
                  ],
                }),
            ],
          }),
          s.jsxs("div", {
            className: "flex items-center gap-1",
            children: [
              s.jsx("button", {
                type: "button",
                onClick: () => o(i - 1),
                disabled: i <= 1,
                className: t(
                  "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm",
                  "transition-all duration-200",
                  "hover:bg-secondary",
                  "disabled:pointer-events-none disabled:opacity-50",
                  "cursor-pointer",
                ),
                "aria-label": "Page précédente",
                children: s.jsx(b, { className: "h-4 w-4" }),
              }),
              f.map((e, c) =>
                e === "ellipsis"
                  ? s.jsx(
                      "span",
                      {
                        className:
                          "inline-flex h-8 w-8 items-center justify-center text-sm text-muted-foreground",
                        children: "...",
                      },
                      `ellipsis-${c}`,
                    )
                  : s.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => o(e),
                        className: t(
                          "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium",
                          "transition-all duration-200",
                          "cursor-pointer",
                          i === e
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-secondary",
                        ),
                        children: e,
                      },
                      e,
                    ),
              ),
              s.jsx("button", {
                type: "button",
                onClick: () => o(i + 1),
                disabled: i >= n,
                className: t(
                  "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm",
                  "transition-all duration-200",
                  "hover:bg-secondary",
                  "disabled:pointer-events-none disabled:opacity-50",
                  "cursor-pointer",
                ),
                "aria-label": "Page suivante",
                children: s.jsx(j, { className: "h-4 w-4" }),
              }),
            ],
          }),
        ],
      });
}
export { k as P };
