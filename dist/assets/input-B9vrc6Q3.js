import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { r as m } from "./vendor-react-Cci7g3Cb.js";
import { c as a } from "./index-DY9GA2La.js";
const p = m.forwardRef(
  (
    {
      className: l,
      label: r,
      error: t,
      icon: s,
      iconRight: o,
      wrapperClassName: u,
      id: n,
      ...i
    },
    c,
  ) => {
    const d = n || r?.toLowerCase().replace(/\s+/g, "-");
    return e.jsxs("div", {
      className: a("flex flex-col gap-1.5", u),
      children: [
        r &&
          e.jsx("label", {
            htmlFor: d,
            className: "text-sm font-medium text-foreground",
            children: r,
          }),
        e.jsxs("div", {
          className: "relative",
          children: [
            s &&
              e.jsx("span", {
                className:
                  "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
                children: s,
              }),
            e.jsx("input", {
              ref: c,
              id: d,
              className: a(
                "flex h-10 w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-foreground",
                "shadow-sm",
                "transition-all duration-200",
                "placeholder:text-muted-foreground/60",
                "focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10",
                "hover:border-border/80",
                "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
                s && "pl-10",
                o && "pr-10",
                t &&
                  "border-destructive focus:ring-destructive/10 focus:border-destructive",
                l,
              ),
              ...i,
            }),
            o &&
              e.jsx("span", {
                className:
                  "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground",
                children: o,
              }),
          ],
        }),
        t && e.jsx("p", { className: "text-xs text-destructive", children: t }),
      ],
    });
  },
);
p.displayName = "Input";
export { p as I };
