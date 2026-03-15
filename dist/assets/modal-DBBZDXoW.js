import { j as e } from "./vendor-query-sBpsl8Kt.js";
import { r as a, c as b } from "./vendor-react-Cci7g3Cb.js";
import { c as m } from "./index-DY9GA2La.js";
import { X as p } from "./vendor-ui-DDdrexJZ.js";
const v = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl" };
function j({
  open: o,
  onClose: r,
  title: s,
  description: t,
  children: c,
  size: u = "md",
  className: x,
  hideCloseButton: i = !1,
}) {
  const n = a.useRef(null),
    d = a.useCallback(
      (l) => {
        l.key === "Escape" && r();
      },
      [r],
    );
  a.useEffect(
    () => (
      o &&
        (document.addEventListener("keydown", d),
        (document.body.style.overflow = "hidden")),
      () => {
        (document.removeEventListener("keydown", d),
          (document.body.style.overflow = ""));
      }
    ),
    [o, d],
  );
  const f = a.useCallback(
    (l) => {
      l.target === n.current && r();
    },
    [r],
  );
  return o
    ? b.createPortal(
        e.jsx("div", {
          ref: n,
          className:
            "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4",
          onClick: f,
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": s ? "modal-title" : void 0,
          "aria-describedby": t ? "modal-description" : void 0,
          children: e.jsxs("div", {
            className: m(
              "relative w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-border/40 bg-white shadow-2xl",
              "animate-in fade-in-0 zoom-in-95",
              v[u],
              x,
            ),
            children: [
              (s || !i) &&
                e.jsxs("div", {
                  className:
                    "flex items-start justify-between px-4 pt-4 pb-0 sm:px-6 sm:pt-6",
                  children: [
                    e.jsxs("div", {
                      className: "flex flex-col gap-1",
                      children: [
                        s &&
                          e.jsx("h2", {
                            id: "modal-title",
                            className: "text-lg font-semibold text-foreground",
                            children: s,
                          }),
                        t &&
                          e.jsx("p", {
                            id: "modal-description",
                            className: "text-sm text-muted-foreground",
                            children: t,
                          }),
                      ],
                    }),
                    !i &&
                      e.jsx("button", {
                        type: "button",
                        onClick: r,
                        className: m(
                          "rounded-md p-1 text-muted-foreground",
                          "transition-all duration-200",
                          "hover:bg-secondary hover:text-foreground",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          "cursor-pointer",
                        ),
                        children: e.jsx(p, { className: "h-4 w-4" }),
                      }),
                  ],
                }),
              e.jsx("div", {
                className: "px-4 py-3 sm:px-6 sm:py-4",
                children: c,
              }),
            ],
          }),
        }),
        document.body,
      )
    : null;
}
export { j as M };
