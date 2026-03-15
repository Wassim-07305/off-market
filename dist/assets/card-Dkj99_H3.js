import { j as o } from "./vendor-query-sBpsl8Kt.js";
import { r as d } from "./vendor-react-Cci7g3Cb.js";
import { c as s } from "./index-DY9GA2La.js";
const t = d.forwardRef(({ className: r, ...a }, e) =>
  o.jsx("div", {
    ref: e,
    className: s(
      "rounded-xl border border-border/50 bg-white text-card-foreground",
      "shadow-[0_1px_3px_0_rgb(0_0_0/0.04),0_1px_2px_-1px_rgb(0_0_0/0.04)]",
      "transition-all duration-200",
      "hover:shadow-[0_4px_12px_0_rgb(0_0_0/0.06),0_2px_4px_-2px_rgb(0_0_0/0.04)]",
      "hover:border-border/70",
      r,
    ),
    ...a,
  }),
);
t.displayName = "Card";
const p = d.forwardRef(({ className: r, ...a }, e) =>
  o.jsx("div", {
    ref: e,
    className: s("flex flex-col gap-1.5 px-6 py-5", r),
    ...a,
  }),
);
p.displayName = "CardHeader";
const x = d.forwardRef(({ className: r, ...a }, e) =>
  o.jsx("h3", {
    ref: e,
    className: s("text-lg font-semibold leading-none tracking-tight", r),
    ...a,
  }),
);
x.displayName = "CardTitle";
const i = d.forwardRef(({ className: r, ...a }, e) =>
  o.jsx("p", {
    ref: e,
    className: s("text-sm text-muted-foreground", r),
    ...a,
  }),
);
i.displayName = "CardDescription";
const n = d.forwardRef(({ className: r, ...a }, e) =>
  o.jsx("div", { ref: e, className: s("px-6 pb-5", r), ...a }),
);
n.displayName = "CardContent";
const l = d.forwardRef(({ className: r, ...a }, e) =>
  o.jsx("div", {
    ref: e,
    className: s("flex items-center px-6 py-4 border-t border-border", r),
    ...a,
  }),
);
l.displayName = "CardFooter";
export { t as C, p as a, x as b, i as c, n as d };
