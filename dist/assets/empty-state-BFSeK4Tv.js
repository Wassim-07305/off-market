import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { c as n } from "./index-DY9GA2La.js";
function l({ icon: t, title: m, description: r, action: s, className: d }) {
  return e.jsxs("div", {
    className: n(
      "flex flex-col items-center justify-center py-16 text-center",
      d,
    ),
    children: [
      t &&
        e.jsx("div", {
          className:
            "mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 text-muted-foreground ring-1 ring-border/50",
          children: t,
        }),
      e.jsx("h3", {
        className: "text-base font-semibold text-foreground",
        children: m,
      }),
      r &&
        e.jsx("p", {
          className:
            "mt-1.5 max-w-xs text-sm text-muted-foreground leading-relaxed",
          children: r,
        }),
      s && e.jsx("div", { className: "mt-5", children: s }),
    ],
  });
}
export { l as E };
