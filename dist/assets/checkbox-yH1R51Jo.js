import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { r as m } from "./vendor-react-Cci7g3Cb.js";
import { c as s } from "./index-DY9GA2La.js";
import { V as p } from "./vendor-ui-DDdrexJZ.js";
const x = m.forwardRef(
  (
    {
      className: c,
      label: r,
      description: t,
      wrapperClassName: n,
      id: l,
      checked: o,
      ...i
    },
    d,
  ) => {
    const a = l || r?.toLowerCase().replace(/\s+/g, "-");
    return e.jsxs("label", {
      htmlFor: a,
      className: s(
        "inline-flex cursor-pointer items-start gap-2",
        i.disabled && "cursor-not-allowed opacity-50",
        n,
      ),
      children: [
        e.jsxs("div", {
          className:
            "relative flex shrink-0 items-center justify-center pt-0.5",
          children: [
            e.jsx("input", {
              ref: d,
              id: a,
              type: "checkbox",
              checked: o,
              className: s("peer sr-only", c),
              ...i,
            }),
            e.jsx("div", {
              className: s(
                "flex h-4 w-4 items-center justify-center rounded-sm border border-border",
                "transition-all duration-200",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                "peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground",
              ),
              children: e.jsx(p, {
                className: s(
                  "h-3 w-3 transition-opacity duration-200",
                  o ? "opacity-100" : "opacity-0",
                ),
              }),
            }),
          ],
        }),
        (r || t) &&
          e.jsxs("div", {
            className: "flex flex-col gap-0.5",
            children: [
              r &&
                e.jsx("span", {
                  className: "text-sm font-medium leading-none text-foreground",
                  children: r,
                }),
              t &&
                e.jsx("span", {
                  className: "text-xs text-muted-foreground",
                  children: t,
                }),
            ],
          }),
      ],
    });
  },
);
x.displayName = "Checkbox";
export { x as C };
