import { j as r } from "./vendor-query-sBpsl8Kt.js";
import { r as s } from "./vendor-react-Cci7g3Cb.js";
import { c as u } from "./index-DY9GA2La.js";
const h = s.forwardRef(
  (
    {
      className: f,
      label: o,
      error: a,
      autoGrow: n = !1,
      wrapperClassName: x,
      id: m,
      onChange: g,
      ...i
    },
    t,
  ) => {
    const l = s.useRef(null),
      d = m || o?.toLowerCase().replace(/\s+/g, "-"),
      c = s.useCallback(() => {
        const e = l.current;
        e &&
          n &&
          ((e.style.height = "auto"), (e.style.height = `${e.scrollHeight}px`));
      }, [n]);
    s.useEffect(() => {
      c();
    }, [c, i.value]);
    const p = s.useCallback(
      (e) => {
        ((l.current = e), typeof t == "function" ? t(e) : t && (t.current = e));
      },
      [t],
    );
    return r.jsxs("div", {
      className: u("flex flex-col gap-1.5", x),
      children: [
        o &&
          r.jsx("label", {
            htmlFor: d,
            className: "text-sm font-medium text-foreground",
            children: o,
          }),
        r.jsx("textarea", {
          ref: p,
          id: d,
          className: u(
            "flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground",
            "transition-all duration-200",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            n && "resize-none overflow-hidden",
            a && "border-destructive focus:ring-destructive",
            f,
          ),
          onChange: (e) => {
            (g?.(e), c());
          },
          ...i,
        }),
        a && r.jsx("p", { className: "text-xs text-destructive", children: a }),
      ],
    });
  },
);
h.displayName = "Textarea";
export { h as T };
