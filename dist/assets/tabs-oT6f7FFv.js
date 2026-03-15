import { j as i } from "./vendor-query-sBpsl8Kt.js";
import { c as a } from "./index-DY9GA2La.js";
function f({ tabs: r, value: t, onChange: o, className: n }) {
  return i.jsx("div", {
    role: "tablist",
    className: a(
      "flex items-center gap-1 overflow-x-auto border-b border-border",
      n,
    ),
    children: r.map((e) =>
      i.jsx(
        "button",
        {
          type: "button",
          role: "tab",
          "aria-selected": t === e.value,
          disabled: e.disabled,
          onClick: () => o(e.value),
          className: a(
            "relative inline-flex shrink-0 whitespace-nowrap items-center px-4 py-2.5 text-sm font-medium",
            "transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:pointer-events-none disabled:opacity-50",
            "cursor-pointer",
            t === e.value
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
            t === e.value &&
              'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-red-500 after:to-rose-500 after:content-[""] after:rounded-full',
          ),
          children: e.label,
        },
        e.value,
      ),
    ),
  });
}
function u({ value: r, activeValue: t, children: o, className: n }) {
  return r !== t
    ? null
    : i.jsx("div", {
        role: "tabpanel",
        className: a("mt-4 focus-visible:outline-none", n),
        children: o,
      });
}
export { f as T, u as a };
