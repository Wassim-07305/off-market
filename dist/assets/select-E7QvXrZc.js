import { j as t } from "./vendor-query-sBpsl8Kt.js";
import { r as n } from "./vendor-react-Cci7g3Cb.js";
import { c as s } from "./index-DY9GA2La.js";
import { $ as N, V as k } from "./vendor-ui-DDdrexJZ.js";
const E = n.forwardRef(
  (
    {
      options: l,
      value: o,
      onChange: f,
      placeholder: b = "Sélectionner...",
      label: i,
      error: c,
      disabled: h = !1,
      className: v,
      wrapperClassName: g,
      id: w,
    },
    y,
  ) => {
    const [r, a] = n.useState(!1),
      d = n.useRef(null),
      x = w || i?.toLowerCase().replace(/\s+/g, "-"),
      u = l.find((e) => e.value === o),
      j = n.useCallback(
        (e) => {
          (f?.(e), a(!1));
        },
        [f],
      );
    return (
      n.useEffect(() => {
        const e = (m) => {
            d.current && !d.current.contains(m.target) && a(!1);
          },
          p = (m) => {
            m.key === "Escape" && a(!1);
          };
        return (
          r &&
            (document.addEventListener("mousedown", e),
            document.addEventListener("keydown", p)),
          () => {
            (document.removeEventListener("mousedown", e),
              document.removeEventListener("keydown", p));
          }
        );
      }, [r]),
      t.jsxs("div", {
        className: s("flex flex-col gap-1.5", g),
        ref: d,
        children: [
          i &&
            t.jsx("label", {
              htmlFor: x,
              className: "text-sm font-medium text-foreground",
              children: i,
            }),
          t.jsxs("div", {
            className: "relative",
            children: [
              t.jsxs("button", {
                ref: y,
                id: x,
                type: "button",
                role: "combobox",
                "aria-expanded": r,
                "aria-haspopup": "listbox",
                disabled: h,
                onClick: () => a((e) => !e),
                className: s(
                  "flex h-9 w-full items-center justify-between rounded-xl border border-border bg-white px-3 py-1.5 text-sm",
                  "transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "cursor-pointer",
                  !u && "text-muted-foreground",
                  c && "border-destructive focus:ring-destructive",
                  v,
                ),
                children: [
                  t.jsx("span", {
                    className: "truncate",
                    children: u ? u.label : b,
                  }),
                  t.jsx(N, {
                    className: s(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      r && "rotate-180",
                    ),
                  }),
                ],
              }),
              r &&
                t.jsxs("ul", {
                  role: "listbox",
                  className: s(
                    "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border bg-white py-1 shadow-lg",
                    "animate-in fade-in-0 zoom-in-95",
                  ),
                  children: [
                    l.map((e) =>
                      t.jsxs(
                        "li",
                        {
                          role: "option",
                          "aria-selected": o === e.value,
                          className: s(
                            "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors duration-150",
                            "hover:bg-secondary",
                            o === e.value && "bg-secondary font-medium",
                            e.disabled && "pointer-events-none opacity-50",
                          ),
                          onClick: () => {
                            e.disabled || j(e.value);
                          },
                          children: [
                            t.jsx(k, {
                              className: s(
                                "h-4 w-4 shrink-0",
                                o === e.value ? "opacity-100" : "opacity-0",
                              ),
                            }),
                            e.label,
                          ],
                        },
                        e.value,
                      ),
                    ),
                    l.length === 0 &&
                      t.jsx("li", {
                        className: "px-3 py-2 text-sm text-muted-foreground",
                        children: "Aucune option disponible",
                      }),
                  ],
                }),
            ],
          }),
          c &&
            t.jsx("p", { className: "text-xs text-destructive", children: c }),
        ],
      })
    );
  },
);
E.displayName = "Select";
export { E as S };
