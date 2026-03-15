import { j as r } from "./vendor-query-sBpsl8Kt.js";
import { r as u } from "./vendor-react-Cci7g3Cb.js";
import { c as l } from "./index-DY9GA2La.js";
import { a0 as c } from "./vendor-ui-DDdrexJZ.js";
const x = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_1px_3px_0_rgb(220_38_38/0.3),inset_0_1px_0_0_rgb(255_255_255/0.1)]",
    secondary:
      "border border-border bg-white text-foreground hover:bg-muted/50 hover:border-border/80 shadow-sm",
    ghost: "text-foreground hover:bg-muted/60",
    destructive:
      "bg-destructive text-white hover:bg-destructive/90 shadow-[0_1px_3px_0_rgb(220_38_38/0.3)]",
    outline:
      "border-2 border-primary/80 text-primary hover:bg-primary/5 hover:border-primary",
  },
  f = {
    sm: "h-8 px-3 text-xs gap-1.5 font-medium",
    md: "h-9 px-4 text-sm gap-2 font-medium",
    lg: "h-11 px-5 text-sm gap-2.5 font-semibold",
  },
  h = u.forwardRef(
    (
      {
        className: o,
        variant: i = "primary",
        size: a = "md",
        loading: e = !1,
        disabled: n,
        icon: t,
        iconRight: s,
        children: d,
        ...m
      },
      p,
    ) => {
      const b = n || e;
      return r.jsxs("button", {
        ref: p,
        className: l(
          "inline-flex items-center justify-center rounded-xl font-medium",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "active:scale-[0.98]",
          "cursor-pointer",
          x[i],
          f[a],
          o,
        ),
        disabled: b,
        ...m,
        children: [
          e
            ? r.jsx(c, { className: "h-4 w-4 animate-spin" })
            : t
              ? r.jsx("span", { className: "shrink-0", children: t })
              : null,
          d,
          s && !e && r.jsx("span", { className: "shrink-0", children: s }),
        ],
      });
    },
  );
h.displayName = "Button";
export { h as B };
