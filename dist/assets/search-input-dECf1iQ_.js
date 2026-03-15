import { j as o } from "./vendor-query-sBpsl8Kt.js";
import { r as t } from "./vendor-react-Cci7g3Cb.js";
import { c as u } from "./index-DY9GA2La.js";
import { r as j, X as v } from "./vendor-ui-DDdrexJZ.js";
const N = t.forwardRef(
  (
    {
      value: n,
      onChange: s,
      debounceMs: c = 300,
      placeholder: d = "Rechercher...",
      className: f,
      wrapperClassName: m,
      ...p
    },
    h,
  ) => {
    const [i, a] = t.useState(n ?? ""),
      e = t.useRef(null),
      l = n !== void 0;
    t.useEffect(() => {
      l && a(n);
    }, [n, l]);
    const x = t.useCallback(
      (r) => {
        (e.current && clearTimeout(e.current),
          (e.current = setTimeout(() => {
            s?.(r);
          }, c)));
      },
      [s, c],
    );
    t.useEffect(
      () => () => {
        e.current && clearTimeout(e.current);
      },
      [],
    );
    const g = (r) => {
        (a(r), x(r));
      },
      b = () => {
        (a(""), e.current && clearTimeout(e.current), s?.(""));
      };
    return o.jsxs("div", {
      className: u("relative", m),
      children: [
        o.jsx(j, {
          className:
            "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
        }),
        o.jsx("input", {
          ref: h,
          type: "text",
          value: i,
          onChange: (r) => g(r.target.value),
          placeholder: d,
          className: u(
            "h-9 w-full rounded-md border border-border bg-background pl-9 pr-8 text-sm text-foreground",
            "transition-all duration-200",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
            f,
          ),
          ...p,
        }),
        i &&
          o.jsx("button", {
            type: "button",
            onClick: b,
            className: u(
              "absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground",
              "transition-all duration-200",
              "hover:text-foreground",
              "cursor-pointer",
            ),
            children: o.jsx(v, { className: "h-3.5 w-3.5" }),
          }),
      ],
    });
  },
);
N.displayName = "SearchInput";
export { N as S };
