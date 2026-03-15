import { R as w, a as ka, r as T } from "./vendor-react-Cci7g3Cb.js";
import { j as Dt } from "./vendor-query-sBpsl8Kt.js";
function Ta(t) {
  if (typeof document > "u") return;
  let e = document.head || document.getElementsByTagName("head")[0],
    n = document.createElement("style");
  ((n.type = "text/css"),
    e.appendChild(n),
    n.styleSheet
      ? (n.styleSheet.cssText = t)
      : n.appendChild(document.createTextNode(t)));
}
const Ma = (t) => {
    switch (t) {
      case "success":
        return Aa;
      case "info":
        return Ea;
      case "warning":
        return Ca;
      case "error":
        return Va;
      default:
        return null;
    }
  },
  Sa = Array(12).fill(0),
  Pa = ({ visible: t, className: e }) =>
    w.createElement(
      "div",
      {
        className: ["sonner-loading-wrapper", e].filter(Boolean).join(" "),
        "data-visible": t,
      },
      w.createElement(
        "div",
        { className: "sonner-spinner" },
        Sa.map((n, s) =>
          w.createElement("div", {
            className: "sonner-loading-bar",
            key: `spinner-bar-${s}`,
          }),
        ),
      ),
    ),
  Aa = w.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 20 20",
      fill: "currentColor",
      height: "20",
      width: "20",
    },
    w.createElement("path", {
      fillRule: "evenodd",
      d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z",
      clipRule: "evenodd",
    }),
  ),
  Ca = w.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      height: "20",
      width: "20",
    },
    w.createElement("path", {
      fillRule: "evenodd",
      d: "M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z",
      clipRule: "evenodd",
    }),
  ),
  Ea = w.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 20 20",
      fill: "currentColor",
      height: "20",
      width: "20",
    },
    w.createElement("path", {
      fillRule: "evenodd",
      d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z",
      clipRule: "evenodd",
    }),
  ),
  Va = w.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 20 20",
      fill: "currentColor",
      height: "20",
      width: "20",
    },
    w.createElement("path", {
      fillRule: "evenodd",
      d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z",
      clipRule: "evenodd",
    }),
  ),
  Da = w.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },
    w.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
    w.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" }),
  ),
  Ra = () => {
    const [t, e] = w.useState(document.hidden);
    return (
      w.useEffect(() => {
        const n = () => {
          e(document.hidden);
        };
        return (
          document.addEventListener("visibilitychange", n),
          () => window.removeEventListener("visibilitychange", n)
        );
      }, []),
      t
    );
  };
let Cn = 1;
class _a {
  constructor() {
    ((this.subscribe = (e) => (
      this.subscribers.push(e),
      () => {
        const n = this.subscribers.indexOf(e);
        this.subscribers.splice(n, 1);
      }
    )),
      (this.publish = (e) => {
        this.subscribers.forEach((n) => n(e));
      }),
      (this.addToast = (e) => {
        (this.publish(e), (this.toasts = [...this.toasts, e]));
      }),
      (this.create = (e) => {
        var n;
        const { message: s, ...o } = e,
          r =
            typeof e?.id == "number" ||
            ((n = e.id) == null ? void 0 : n.length) > 0
              ? e.id
              : Cn++,
          i = this.toasts.find((c) => c.id === r),
          a = e.dismissible === void 0 ? !0 : e.dismissible;
        return (
          this.dismissedToasts.has(r) && this.dismissedToasts.delete(r),
          i
            ? (this.toasts = this.toasts.map((c) =>
                c.id === r
                  ? (this.publish({ ...c, ...e, id: r, title: s }),
                    { ...c, ...e, id: r, dismissible: a, title: s })
                  : c,
              ))
            : this.addToast({ title: s, ...o, dismissible: a, id: r }),
          r
        );
      }),
      (this.dismiss = (e) => (
        e
          ? (this.dismissedToasts.add(e),
            requestAnimationFrame(() =>
              this.subscribers.forEach((n) => n({ id: e, dismiss: !0 })),
            ))
          : this.toasts.forEach((n) => {
              this.subscribers.forEach((s) => s({ id: n.id, dismiss: !0 }));
            }),
        e
      )),
      (this.message = (e, n) => this.create({ ...n, message: e })),
      (this.error = (e, n) => this.create({ ...n, message: e, type: "error" })),
      (this.success = (e, n) =>
        this.create({ ...n, type: "success", message: e })),
      (this.info = (e, n) => this.create({ ...n, type: "info", message: e })),
      (this.warning = (e, n) =>
        this.create({ ...n, type: "warning", message: e })),
      (this.loading = (e, n) =>
        this.create({ ...n, type: "loading", message: e })),
      (this.promise = (e, n) => {
        if (!n) return;
        let s;
        n.loading !== void 0 &&
          (s = this.create({
            ...n,
            promise: e,
            type: "loading",
            message: n.loading,
            description:
              typeof n.description != "function" ? n.description : void 0,
          }));
        const o = Promise.resolve(e instanceof Function ? e() : e);
        let r = s !== void 0,
          i;
        const a = o
            .then(async (u) => {
              if (((i = ["resolve", u]), w.isValidElement(u)))
                ((r = !1), this.create({ id: s, type: "default", message: u }));
              else if (Na(u) && !u.ok) {
                r = !1;
                const l =
                    typeof n.error == "function"
                      ? await n.error(`HTTP error! status: ${u.status}`)
                      : n.error,
                  h =
                    typeof n.description == "function"
                      ? await n.description(`HTTP error! status: ${u.status}`)
                      : n.description,
                  p =
                    typeof l == "object" && !w.isValidElement(l)
                      ? l
                      : { message: l };
                this.create({ id: s, type: "error", description: h, ...p });
              } else if (u instanceof Error) {
                r = !1;
                const l =
                    typeof n.error == "function" ? await n.error(u) : n.error,
                  h =
                    typeof n.description == "function"
                      ? await n.description(u)
                      : n.description,
                  p =
                    typeof l == "object" && !w.isValidElement(l)
                      ? l
                      : { message: l };
                this.create({ id: s, type: "error", description: h, ...p });
              } else if (n.success !== void 0) {
                r = !1;
                const l =
                    typeof n.success == "function"
                      ? await n.success(u)
                      : n.success,
                  h =
                    typeof n.description == "function"
                      ? await n.description(u)
                      : n.description,
                  p =
                    typeof l == "object" && !w.isValidElement(l)
                      ? l
                      : { message: l };
                this.create({ id: s, type: "success", description: h, ...p });
              }
            })
            .catch(async (u) => {
              if (((i = ["reject", u]), n.error !== void 0)) {
                r = !1;
                const d =
                    typeof n.error == "function" ? await n.error(u) : n.error,
                  l =
                    typeof n.description == "function"
                      ? await n.description(u)
                      : n.description,
                  f =
                    typeof d == "object" && !w.isValidElement(d)
                      ? d
                      : { message: d };
                this.create({ id: s, type: "error", description: l, ...f });
              }
            })
            .finally(() => {
              (r && (this.dismiss(s), (s = void 0)),
                n.finally == null || n.finally.call(n));
            }),
          c = () =>
            new Promise((u, d) =>
              a.then(() => (i[0] === "reject" ? d(i[1]) : u(i[1]))).catch(d),
            );
        return typeof s != "string" && typeof s != "number"
          ? { unwrap: c }
          : Object.assign(s, { unwrap: c });
      }),
      (this.custom = (e, n) => {
        const s = n?.id || Cn++;
        return (this.create({ jsx: e(s), id: s, ...n }), s);
      }),
      (this.getActiveToasts = () =>
        this.toasts.filter((e) => !this.dismissedToasts.has(e.id))),
      (this.subscribers = []),
      (this.toasts = []),
      (this.dismissedToasts = new Set()));
  }
}
const ct = new _a(),
  La = (t, e) => {
    const n = e?.id || Cn++;
    return (ct.addToast({ title: t, ...e, id: n }), n);
  },
  Na = (t) =>
    t &&
    typeof t == "object" &&
    "ok" in t &&
    typeof t.ok == "boolean" &&
    "status" in t &&
    typeof t.status == "number",
  Ia = La,
  ja = () => ct.toasts,
  Ba = () => ct.getActiveToasts(),
  Gm = Object.assign(
    Ia,
    {
      success: ct.success,
      info: ct.info,
      warning: ct.warning,
      error: ct.error,
      custom: ct.custom,
      message: ct.message,
      promise: ct.promise,
      dismiss: ct.dismiss,
      loading: ct.loading,
    },
    { getHistory: ja, getToasts: Ba },
  );
Ta(
  "[data-sonner-toaster][dir=ltr],html[dir=ltr]{--toast-icon-margin-start:-3px;--toast-icon-margin-end:4px;--toast-svg-margin-start:-1px;--toast-svg-margin-end:0px;--toast-button-margin-start:auto;--toast-button-margin-end:0;--toast-close-button-start:0;--toast-close-button-end:unset;--toast-close-button-transform:translate(-35%, -35%)}[data-sonner-toaster][dir=rtl],html[dir=rtl]{--toast-icon-margin-start:4px;--toast-icon-margin-end:-3px;--toast-svg-margin-start:0px;--toast-svg-margin-end:-1px;--toast-button-margin-start:0;--toast-button-margin-end:auto;--toast-close-button-start:unset;--toast-close-button-end:0;--toast-close-button-transform:translate(35%, -35%)}[data-sonner-toaster]{position:fixed;width:var(--width);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--gray1:hsl(0, 0%, 99%);--gray2:hsl(0, 0%, 97.3%);--gray3:hsl(0, 0%, 95.1%);--gray4:hsl(0, 0%, 93%);--gray5:hsl(0, 0%, 90.9%);--gray6:hsl(0, 0%, 88.7%);--gray7:hsl(0, 0%, 85.8%);--gray8:hsl(0, 0%, 78%);--gray9:hsl(0, 0%, 56.1%);--gray10:hsl(0, 0%, 52.3%);--gray11:hsl(0, 0%, 43.5%);--gray12:hsl(0, 0%, 9%);--border-radius:8px;box-sizing:border-box;padding:0;margin:0;list-style:none;outline:0;z-index:999999999;transition:transform .4s ease}@media (hover:none) and (pointer:coarse){[data-sonner-toaster][data-lifted=true]{transform:none}}[data-sonner-toaster][data-x-position=right]{right:var(--offset-right)}[data-sonner-toaster][data-x-position=left]{left:var(--offset-left)}[data-sonner-toaster][data-x-position=center]{left:50%;transform:translateX(-50%)}[data-sonner-toaster][data-y-position=top]{top:var(--offset-top)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--offset-bottom)}[data-sonner-toast]{--y:translateY(100%);--lift-amount:calc(var(--lift) * var(--gap));z-index:var(--z-index);position:absolute;opacity:0;transform:var(--y);touch-action:none;transition:transform .4s,opacity .4s,height .4s,box-shadow .2s;box-sizing:border-box;outline:0;overflow-wrap:anywhere}[data-sonner-toast][data-styled=true]{padding:16px;background:var(--normal-bg);border:1px solid var(--normal-border);color:var(--normal-text);border-radius:var(--border-radius);box-shadow:0 4px 12px rgba(0,0,0,.1);width:var(--width);font-size:13px;display:flex;align-items:center;gap:6px}[data-sonner-toast]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-y-position=top]{top:0;--y:translateY(-100%);--lift:1;--lift-amount:calc(1 * var(--gap))}[data-sonner-toast][data-y-position=bottom]{bottom:0;--y:translateY(100%);--lift:-1;--lift-amount:calc(var(--lift) * var(--gap))}[data-sonner-toast][data-styled=true] [data-description]{font-weight:400;line-height:1.4;color:#3f3f3f}[data-rich-colors=true][data-sonner-toast][data-styled=true] [data-description]{color:inherit}[data-sonner-toaster][data-sonner-theme=dark] [data-description]{color:#e8e8e8}[data-sonner-toast][data-styled=true] [data-title]{font-weight:500;line-height:1.5;color:inherit}[data-sonner-toast][data-styled=true] [data-icon]{display:flex;height:16px;width:16px;position:relative;justify-content:flex-start;align-items:center;flex-shrink:0;margin-left:var(--toast-icon-margin-start);margin-right:var(--toast-icon-margin-end)}[data-sonner-toast][data-promise=true] [data-icon]>svg{opacity:0;transform:scale(.8);transform-origin:center;animation:sonner-fade-in .3s ease forwards}[data-sonner-toast][data-styled=true] [data-icon]>*{flex-shrink:0}[data-sonner-toast][data-styled=true] [data-icon] svg{margin-left:var(--toast-svg-margin-start);margin-right:var(--toast-svg-margin-end)}[data-sonner-toast][data-styled=true] [data-content]{display:flex;flex-direction:column;gap:2px}[data-sonner-toast][data-styled=true] [data-button]{border-radius:4px;padding-left:8px;padding-right:8px;height:24px;font-size:12px;color:var(--normal-bg);background:var(--normal-text);margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end);border:none;font-weight:500;cursor:pointer;outline:0;display:flex;align-items:center;flex-shrink:0;transition:opacity .4s,box-shadow .2s}[data-sonner-toast][data-styled=true] [data-button]:focus-visible{box-shadow:0 0 0 2px rgba(0,0,0,.4)}[data-sonner-toast][data-styled=true] [data-button]:first-of-type{margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end)}[data-sonner-toast][data-styled=true] [data-cancel]{color:var(--normal-text);background:rgba(0,0,0,.08)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-styled=true] [data-cancel]{background:rgba(255,255,255,.3)}[data-sonner-toast][data-styled=true] [data-close-button]{position:absolute;left:var(--toast-close-button-start);right:var(--toast-close-button-end);top:0;height:20px;width:20px;display:flex;justify-content:center;align-items:center;padding:0;color:var(--gray12);background:var(--normal-bg);border:1px solid var(--gray4);transform:var(--toast-close-button-transform);border-radius:50%;cursor:pointer;z-index:1;transition:opacity .1s,background .2s,border-color .2s}[data-sonner-toast][data-styled=true] [data-close-button]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-styled=true] [data-disabled=true]{cursor:not-allowed}[data-sonner-toast][data-styled=true]:hover [data-close-button]:hover{background:var(--gray2);border-color:var(--gray5)}[data-sonner-toast][data-swiping=true]::before{content:'';position:absolute;left:-100%;right:-100%;height:100%;z-index:-1}[data-sonner-toast][data-y-position=top][data-swiping=true]::before{bottom:50%;transform:scaleY(3) translateY(50%)}[data-sonner-toast][data-y-position=bottom][data-swiping=true]::before{top:50%;transform:scaleY(3) translateY(-50%)}[data-sonner-toast][data-swiping=false][data-removed=true]::before{content:'';position:absolute;inset:0;transform:scaleY(2)}[data-sonner-toast][data-expanded=true]::after{content:'';position:absolute;left:0;height:calc(var(--gap) + 1px);bottom:100%;width:100%}[data-sonner-toast][data-mounted=true]{--y:translateY(0);opacity:1}[data-sonner-toast][data-expanded=false][data-front=false]{--scale:var(--toasts-before) * 0.05 + 1;--y:translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));height:var(--front-toast-height)}[data-sonner-toast]>*{transition:opacity .4s}[data-sonner-toast][data-x-position=right]{right:0}[data-sonner-toast][data-x-position=left]{left:0}[data-sonner-toast][data-expanded=false][data-front=false][data-styled=true]>*{opacity:0}[data-sonner-toast][data-visible=false]{opacity:0;pointer-events:none}[data-sonner-toast][data-mounted=true][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset)));height:var(--initial-height)}[data-sonner-toast][data-removed=true][data-front=true][data-swipe-out=false]{--y:translateY(calc(var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=false]{--y:translateY(40%);opacity:0;transition:transform .5s,opacity .2s}[data-sonner-toast][data-removed=true][data-front=false]::before{height:calc(var(--initial-height) + 20%)}[data-sonner-toast][data-swiping=true]{transform:var(--y) translateY(var(--swipe-amount-y,0)) translateX(var(--swipe-amount-x,0));transition:none}[data-sonner-toast][data-swiped=true]{user-select:none}[data-sonner-toast][data-swipe-out=true][data-y-position=bottom],[data-sonner-toast][data-swipe-out=true][data-y-position=top]{animation-duration:.2s;animation-timing-function:ease-out;animation-fill-mode:forwards}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=left]{animation-name:swipe-out-left}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=right]{animation-name:swipe-out-right}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=up]{animation-name:swipe-out-up}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=down]{animation-name:swipe-out-down}@keyframes swipe-out-left{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) - 100%));opacity:0}}@keyframes swipe-out-right{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) + 100%));opacity:0}}@keyframes swipe-out-up{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) - 100%));opacity:0}}@keyframes swipe-out-down{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) + 100%));opacity:0}}@media (max-width:600px){[data-sonner-toaster]{position:fixed;right:var(--mobile-offset-right);left:var(--mobile-offset-left);width:100%}[data-sonner-toaster][dir=rtl]{left:calc(var(--mobile-offset-left) * -1)}[data-sonner-toaster] [data-sonner-toast]{left:0;right:0;width:calc(100% - var(--mobile-offset-left) * 2)}[data-sonner-toaster][data-x-position=left]{left:var(--mobile-offset-left)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--mobile-offset-bottom)}[data-sonner-toaster][data-y-position=top]{top:var(--mobile-offset-top)}[data-sonner-toaster][data-x-position=center]{left:var(--mobile-offset-left);right:var(--mobile-offset-right);transform:none}}[data-sonner-toaster][data-sonner-theme=light]{--normal-bg:#fff;--normal-border:var(--gray4);--normal-text:var(--gray12);--success-bg:hsl(143, 85%, 96%);--success-border:hsl(145, 92%, 87%);--success-text:hsl(140, 100%, 27%);--info-bg:hsl(208, 100%, 97%);--info-border:hsl(221, 91%, 93%);--info-text:hsl(210, 92%, 45%);--warning-bg:hsl(49, 100%, 97%);--warning-border:hsl(49, 91%, 84%);--warning-text:hsl(31, 92%, 45%);--error-bg:hsl(359, 100%, 97%);--error-border:hsl(359, 100%, 94%);--error-text:hsl(360, 100%, 45%)}[data-sonner-toaster][data-sonner-theme=light] [data-sonner-toast][data-invert=true]{--normal-bg:#000;--normal-border:hsl(0, 0%, 20%);--normal-text:var(--gray1)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-invert=true]{--normal-bg:#fff;--normal-border:var(--gray3);--normal-text:var(--gray12)}[data-sonner-toaster][data-sonner-theme=dark]{--normal-bg:#000;--normal-bg-hover:hsl(0, 0%, 12%);--normal-border:hsl(0, 0%, 20%);--normal-border-hover:hsl(0, 0%, 25%);--normal-text:var(--gray1);--success-bg:hsl(150, 100%, 6%);--success-border:hsl(147, 100%, 12%);--success-text:hsl(150, 86%, 65%);--info-bg:hsl(215, 100%, 6%);--info-border:hsl(223, 43%, 17%);--info-text:hsl(216, 87%, 65%);--warning-bg:hsl(64, 100%, 6%);--warning-border:hsl(60, 100%, 9%);--warning-text:hsl(46, 87%, 65%);--error-bg:hsl(358, 76%, 10%);--error-border:hsl(357, 89%, 16%);--error-text:hsl(358, 100%, 81%)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]{background:var(--normal-bg);border-color:var(--normal-border);color:var(--normal-text)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]:hover{background:var(--normal-bg-hover);border-color:var(--normal-border-hover)}[data-rich-colors=true][data-sonner-toast][data-type=success]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=success] [data-close-button]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=info]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=info] [data-close-button]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning] [data-close-button]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=error]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}[data-rich-colors=true][data-sonner-toast][data-type=error] [data-close-button]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}.sonner-loading-wrapper{--size:16px;height:var(--size);width:var(--size);position:absolute;inset:0;z-index:10}.sonner-loading-wrapper[data-visible=false]{transform-origin:center;animation:sonner-fade-out .2s ease forwards}.sonner-spinner{position:relative;top:50%;left:50%;height:var(--size);width:var(--size)}.sonner-loading-bar{animation:sonner-spin 1.2s linear infinite;background:var(--gray11);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}.sonner-loading-bar:first-child{animation-delay:-1.2s;transform:rotate(.0001deg) translate(146%)}.sonner-loading-bar:nth-child(2){animation-delay:-1.1s;transform:rotate(30deg) translate(146%)}.sonner-loading-bar:nth-child(3){animation-delay:-1s;transform:rotate(60deg) translate(146%)}.sonner-loading-bar:nth-child(4){animation-delay:-.9s;transform:rotate(90deg) translate(146%)}.sonner-loading-bar:nth-child(5){animation-delay:-.8s;transform:rotate(120deg) translate(146%)}.sonner-loading-bar:nth-child(6){animation-delay:-.7s;transform:rotate(150deg) translate(146%)}.sonner-loading-bar:nth-child(7){animation-delay:-.6s;transform:rotate(180deg) translate(146%)}.sonner-loading-bar:nth-child(8){animation-delay:-.5s;transform:rotate(210deg) translate(146%)}.sonner-loading-bar:nth-child(9){animation-delay:-.4s;transform:rotate(240deg) translate(146%)}.sonner-loading-bar:nth-child(10){animation-delay:-.3s;transform:rotate(270deg) translate(146%)}.sonner-loading-bar:nth-child(11){animation-delay:-.2s;transform:rotate(300deg) translate(146%)}.sonner-loading-bar:nth-child(12){animation-delay:-.1s;transform:rotate(330deg) translate(146%)}@keyframes sonner-fade-in{0%{opacity:0;transform:scale(.8)}100%{opacity:1;transform:scale(1)}}@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.8)}}@keyframes sonner-spin{0%{opacity:1}100%{opacity:.15}}@media (prefers-reduced-motion){.sonner-loading-bar,[data-sonner-toast],[data-sonner-toast]>*{transition:none!important;animation:none!important}}.sonner-loader{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transform-origin:center;transition:opacity .2s,transform .2s}.sonner-loader[data-visible=false]{opacity:0;transform:scale(.8) translate(-50%,-50%)}",
);
function Re(t) {
  return t.label !== void 0;
}
const Fa = 3,
  za = "24px",
  $a = "16px",
  $s = 4e3,
  Oa = 356,
  Ha = 14,
  Ua = 45,
  Wa = 200;
function Mt(...t) {
  return t.filter(Boolean).join(" ");
}
function Ga(t) {
  const [e, n] = t.split("-"),
    s = [];
  return (e && s.push(e), n && s.push(n), s);
}
const Ka = (t) => {
  var e, n, s, o, r, i, a, c, u;
  const {
      invert: d,
      toast: l,
      unstyled: h,
      interacting: f,
      setHeights: p,
      visibleToasts: b,
      heights: g,
      index: y,
      toasts: k,
      expanded: x,
      removeToast: E,
      defaultRichColors: S,
      closeButton: D,
      style: B,
      cancelButtonStyle: v,
      actionButtonStyle: R,
      className: F = "",
      descriptionClassName: J = "",
      duration: nt,
      position: Q,
      gap: yt,
      expandByDefault: it,
      classNames: I,
      icons: _,
      closeButtonAriaLabel: M = "Close toast",
    } = t,
    [X, G] = w.useState(null),
    [ht, _t] = w.useState(null),
    [V, j] = w.useState(!1),
    [z, rt] = w.useState(!1),
    [H, $] = w.useState(!1),
    [gt, Ct] = w.useState(!1),
    [Lt, vt] = w.useState(!1),
    [ua, rn] = w.useState(0),
    [da, Rs] = w.useState(0),
    he = w.useRef(l.duration || nt || $s),
    _s = w.useRef(null),
    Et = w.useRef(null),
    ha = y === 0,
    fa = y + 1 <= b,
    ut = l.type,
    Yt = l.dismissible !== !1,
    pa = l.className || "",
    ma = l.descriptionClassName || "",
    Ee = w.useMemo(
      () => g.findIndex((L) => L.toastId === l.id) || 0,
      [g, l.id],
    ),
    ya = w.useMemo(() => {
      var L;
      return (L = l.closeButton) != null ? L : D;
    }, [l.closeButton, D]),
    Ls = w.useMemo(() => l.duration || nt || $s, [l.duration, nt]),
    an = w.useRef(0),
    Xt = w.useRef(0),
    Ns = w.useRef(0),
    Zt = w.useRef(null),
    [ga, va] = Q.split("-"),
    Is = w.useMemo(
      () => g.reduce((L, Z, st) => (st >= Ee ? L : L + Z.height), 0),
      [g, Ee],
    ),
    js = Ra(),
    ba = l.invert || d,
    ln = ut === "loading";
  ((Xt.current = w.useMemo(() => Ee * yt + Is, [Ee, Is])),
    w.useEffect(() => {
      he.current = Ls;
    }, [Ls]),
    w.useEffect(() => {
      j(!0);
    }, []),
    w.useEffect(() => {
      const L = Et.current;
      if (L) {
        const Z = L.getBoundingClientRect().height;
        return (
          Rs(Z),
          p((st) => [
            { toastId: l.id, height: Z, position: l.position },
            ...st,
          ]),
          () => p((st) => st.filter((dt) => dt.toastId !== l.id))
        );
      }
    }, [p, l.id]),
    w.useLayoutEffect(() => {
      if (!V) return;
      const L = Et.current,
        Z = L.style.height;
      L.style.height = "auto";
      const st = L.getBoundingClientRect().height;
      ((L.style.height = Z),
        Rs(st),
        p((dt) =>
          dt.find((tt) => tt.toastId === l.id)
            ? dt.map((tt) => (tt.toastId === l.id ? { ...tt, height: st } : tt))
            : [{ toastId: l.id, height: st, position: l.position }, ...dt],
        ));
    }, [V, l.title, l.description, p, l.id, l.jsx, l.action, l.cancel]));
  const Nt = w.useCallback(() => {
    (rt(!0),
      rn(Xt.current),
      p((L) => L.filter((Z) => Z.toastId !== l.id)),
      setTimeout(() => {
        E(l);
      }, Wa));
  }, [l, E, p, Xt]);
  (w.useEffect(() => {
    if (
      (l.promise && ut === "loading") ||
      l.duration === 1 / 0 ||
      l.type === "loading"
    )
      return;
    let L;
    return (
      x || f || js
        ? (() => {
            if (Ns.current < an.current) {
              const dt = new Date().getTime() - an.current;
              he.current = he.current - dt;
            }
            Ns.current = new Date().getTime();
          })()
        : he.current !== 1 / 0 &&
          ((an.current = new Date().getTime()),
          (L = setTimeout(() => {
            (l.onAutoClose == null || l.onAutoClose.call(l, l), Nt());
          }, he.current))),
      () => clearTimeout(L)
    );
  }, [x, f, l, ut, js, Nt]),
    w.useEffect(() => {
      l.delete && (Nt(), l.onDismiss == null || l.onDismiss.call(l, l));
    }, [Nt, l.delete]));
  function xa() {
    var L;
    if (_?.loading) {
      var Z;
      return w.createElement(
        "div",
        {
          className: Mt(
            I?.loader,
            l == null || (Z = l.classNames) == null ? void 0 : Z.loader,
            "sonner-loader",
          ),
          "data-visible": ut === "loading",
        },
        _.loading,
      );
    }
    return w.createElement(Pa, {
      className: Mt(
        I?.loader,
        l == null || (L = l.classNames) == null ? void 0 : L.loader,
      ),
      visible: ut === "loading",
    });
  }
  const wa = l.icon || _?.[ut] || Ma(ut);
  var Bs, Fs;
  return w.createElement(
    "li",
    {
      tabIndex: 0,
      ref: Et,
      className: Mt(
        F,
        pa,
        I?.toast,
        l == null || (e = l.classNames) == null ? void 0 : e.toast,
        I?.default,
        I?.[ut],
        l == null || (n = l.classNames) == null ? void 0 : n[ut],
      ),
      "data-sonner-toast": "",
      "data-rich-colors": (Bs = l.richColors) != null ? Bs : S,
      "data-styled": !(l.jsx || l.unstyled || h),
      "data-mounted": V,
      "data-promise": !!l.promise,
      "data-swiped": Lt,
      "data-removed": z,
      "data-visible": fa,
      "data-y-position": ga,
      "data-x-position": va,
      "data-index": y,
      "data-front": ha,
      "data-swiping": H,
      "data-dismissible": Yt,
      "data-type": ut,
      "data-invert": ba,
      "data-swipe-out": gt,
      "data-swipe-direction": ht,
      "data-expanded": !!(x || (it && V)),
      "data-testid": l.testId,
      style: {
        "--index": y,
        "--toasts-before": y,
        "--z-index": k.length - y,
        "--offset": `${z ? ua : Xt.current}px`,
        "--initial-height": it ? "auto" : `${da}px`,
        ...B,
        ...l.style,
      },
      onDragEnd: () => {
        ($(!1), G(null), (Zt.current = null));
      },
      onPointerDown: (L) => {
        L.button !== 2 &&
          (ln ||
            !Yt ||
            ((_s.current = new Date()),
            rn(Xt.current),
            L.target.setPointerCapture(L.pointerId),
            L.target.tagName !== "BUTTON" &&
              ($(!0), (Zt.current = { x: L.clientX, y: L.clientY }))));
      },
      onPointerUp: () => {
        var L, Z, st;
        if (gt || !Yt) return;
        Zt.current = null;
        const dt = Number(
            ((L = Et.current) == null
              ? void 0
              : L.style
                  .getPropertyValue("--swipe-amount-x")
                  .replace("px", "")) || 0,
          ),
          Ve = Number(
            ((Z = Et.current) == null
              ? void 0
              : Z.style
                  .getPropertyValue("--swipe-amount-y")
                  .replace("px", "")) || 0,
          ),
          tt =
            new Date().getTime() -
            ((st = _s.current) == null ? void 0 : st.getTime()),
          ft = X === "x" ? dt : Ve,
          De = Math.abs(ft) / tt;
        if (Math.abs(ft) >= Ua || De > 0.11) {
          (rn(Xt.current),
            l.onDismiss == null || l.onDismiss.call(l, l),
            _t(
              X === "x" ? (dt > 0 ? "right" : "left") : Ve > 0 ? "down" : "up",
            ),
            Nt(),
            Ct(!0));
          return;
        } else {
          var bt, xt;
          ((bt = Et.current) == null ||
            bt.style.setProperty("--swipe-amount-x", "0px"),
            (xt = Et.current) == null ||
              xt.style.setProperty("--swipe-amount-y", "0px"));
        }
        (vt(!1), $(!1), G(null));
      },
      onPointerMove: (L) => {
        var Z, st, dt;
        if (
          !Zt.current ||
          !Yt ||
          ((Z = window.getSelection()) == null ? void 0 : Z.toString().length) >
            0
        )
          return;
        const tt = L.clientY - Zt.current.y,
          ft = L.clientX - Zt.current.x;
        var De;
        const bt = (De = t.swipeDirections) != null ? De : Ga(Q);
        !X &&
          (Math.abs(ft) > 1 || Math.abs(tt) > 1) &&
          G(Math.abs(ft) > Math.abs(tt) ? "x" : "y");
        let xt = { x: 0, y: 0 };
        const zs = (Ot) => 1 / (1.5 + Math.abs(Ot) / 20);
        if (X === "y") {
          if (bt.includes("top") || bt.includes("bottom"))
            if (
              (bt.includes("top") && tt < 0) ||
              (bt.includes("bottom") && tt > 0)
            )
              xt.y = tt;
            else {
              const Ot = tt * zs(tt);
              xt.y = Math.abs(Ot) < Math.abs(tt) ? Ot : tt;
            }
        } else if (X === "x" && (bt.includes("left") || bt.includes("right")))
          if (
            (bt.includes("left") && ft < 0) ||
            (bt.includes("right") && ft > 0)
          )
            xt.x = ft;
          else {
            const Ot = ft * zs(ft);
            xt.x = Math.abs(Ot) < Math.abs(ft) ? Ot : ft;
          }
        ((Math.abs(xt.x) > 0 || Math.abs(xt.y) > 0) && vt(!0),
          (st = Et.current) == null ||
            st.style.setProperty("--swipe-amount-x", `${xt.x}px`),
          (dt = Et.current) == null ||
            dt.style.setProperty("--swipe-amount-y", `${xt.y}px`));
      },
    },
    ya && !l.jsx && ut !== "loading"
      ? w.createElement(
          "button",
          {
            "aria-label": M,
            "data-disabled": ln,
            "data-close-button": !0,
            onClick:
              ln || !Yt
                ? () => {}
                : () => {
                    (Nt(), l.onDismiss == null || l.onDismiss.call(l, l));
                  },
            className: Mt(
              I?.closeButton,
              l == null || (s = l.classNames) == null ? void 0 : s.closeButton,
            ),
          },
          (Fs = _?.close) != null ? Fs : Da,
        )
      : null,
    (ut || l.icon || l.promise) &&
      l.icon !== null &&
      (_?.[ut] !== null || l.icon)
      ? w.createElement(
          "div",
          {
            "data-icon": "",
            className: Mt(
              I?.icon,
              l == null || (o = l.classNames) == null ? void 0 : o.icon,
            ),
          },
          l.promise || (l.type === "loading" && !l.icon)
            ? l.icon || xa()
            : null,
          l.type !== "loading" ? wa : null,
        )
      : null,
    w.createElement(
      "div",
      {
        "data-content": "",
        className: Mt(
          I?.content,
          l == null || (r = l.classNames) == null ? void 0 : r.content,
        ),
      },
      w.createElement(
        "div",
        {
          "data-title": "",
          className: Mt(
            I?.title,
            l == null || (i = l.classNames) == null ? void 0 : i.title,
          ),
        },
        l.jsx ? l.jsx : typeof l.title == "function" ? l.title() : l.title,
      ),
      l.description
        ? w.createElement(
            "div",
            {
              "data-description": "",
              className: Mt(
                J,
                ma,
                I?.description,
                l == null || (a = l.classNames) == null
                  ? void 0
                  : a.description,
              ),
            },
            typeof l.description == "function"
              ? l.description()
              : l.description,
          )
        : null,
    ),
    w.isValidElement(l.cancel)
      ? l.cancel
      : l.cancel && Re(l.cancel)
        ? w.createElement(
            "button",
            {
              "data-button": !0,
              "data-cancel": !0,
              style: l.cancelButtonStyle || v,
              onClick: (L) => {
                Re(l.cancel) &&
                  Yt &&
                  (l.cancel.onClick == null ||
                    l.cancel.onClick.call(l.cancel, L),
                  Nt());
              },
              className: Mt(
                I?.cancelButton,
                l == null || (c = l.classNames) == null
                  ? void 0
                  : c.cancelButton,
              ),
            },
            l.cancel.label,
          )
        : null,
    w.isValidElement(l.action)
      ? l.action
      : l.action && Re(l.action)
        ? w.createElement(
            "button",
            {
              "data-button": !0,
              "data-action": !0,
              style: l.actionButtonStyle || R,
              onClick: (L) => {
                Re(l.action) &&
                  (l.action.onClick == null ||
                    l.action.onClick.call(l.action, L),
                  !L.defaultPrevented && Nt());
              },
              className: Mt(
                I?.actionButton,
                l == null || (u = l.classNames) == null
                  ? void 0
                  : u.actionButton,
              ),
            },
            l.action.label,
          )
        : null,
  );
};
function Os() {
  if (typeof window > "u" || typeof document > "u") return "ltr";
  const t = document.documentElement.getAttribute("dir");
  return t === "auto" || !t
    ? window.getComputedStyle(document.documentElement).direction
    : t;
}
function qa(t, e) {
  const n = {};
  return (
    [t, e].forEach((s, o) => {
      const r = o === 1,
        i = r ? "--mobile-offset" : "--offset",
        a = r ? $a : za;
      function c(u) {
        ["top", "right", "bottom", "left"].forEach((d) => {
          n[`${i}-${d}`] = typeof u == "number" ? `${u}px` : u;
        });
      }
      typeof s == "number" || typeof s == "string"
        ? c(s)
        : typeof s == "object"
          ? ["top", "right", "bottom", "left"].forEach((u) => {
              s[u] === void 0
                ? (n[`${i}-${u}`] = a)
                : (n[`${i}-${u}`] =
                    typeof s[u] == "number" ? `${s[u]}px` : s[u]);
            })
          : c(a);
    }),
    n
  );
}
const Km = w.forwardRef(function (e, n) {
    const {
        id: s,
        invert: o,
        position: r = "bottom-right",
        hotkey: i = ["altKey", "KeyT"],
        expand: a,
        closeButton: c,
        className: u,
        offset: d,
        mobileOffset: l,
        theme: h = "light",
        richColors: f,
        duration: p,
        style: b,
        visibleToasts: g = Fa,
        toastOptions: y,
        dir: k = Os(),
        gap: x = Ha,
        icons: E,
        containerAriaLabel: S = "Notifications",
      } = e,
      [D, B] = w.useState([]),
      v = w.useMemo(
        () =>
          s
            ? D.filter((V) => V.toasterId === s)
            : D.filter((V) => !V.toasterId),
        [D, s],
      ),
      R = w.useMemo(
        () =>
          Array.from(
            new Set(
              [r].concat(v.filter((V) => V.position).map((V) => V.position)),
            ),
          ),
        [v, r],
      ),
      [F, J] = w.useState([]),
      [nt, Q] = w.useState(!1),
      [yt, it] = w.useState(!1),
      [I, _] = w.useState(
        h !== "system"
          ? h
          : typeof window < "u" &&
              window.matchMedia &&
              window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light",
      ),
      M = w.useRef(null),
      X = i.join("+").replace(/Key/g, "").replace(/Digit/g, ""),
      G = w.useRef(null),
      ht = w.useRef(!1),
      _t = w.useCallback((V) => {
        B((j) => {
          var z;
          return (
            ((z = j.find((rt) => rt.id === V.id)) != null && z.delete) ||
              ct.dismiss(V.id),
            j.filter(({ id: rt }) => rt !== V.id)
          );
        });
      }, []);
    return (
      w.useEffect(
        () =>
          ct.subscribe((V) => {
            if (V.dismiss) {
              requestAnimationFrame(() => {
                B((j) =>
                  j.map((z) => (z.id === V.id ? { ...z, delete: !0 } : z)),
                );
              });
              return;
            }
            setTimeout(() => {
              ka.flushSync(() => {
                B((j) => {
                  const z = j.findIndex((rt) => rt.id === V.id);
                  return z !== -1
                    ? [...j.slice(0, z), { ...j[z], ...V }, ...j.slice(z + 1)]
                    : [V, ...j];
                });
              });
            });
          }),
        [D],
      ),
      w.useEffect(() => {
        if (h !== "system") {
          _(h);
          return;
        }
        if (
          (h === "system" &&
            (window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
              ? _("dark")
              : _("light")),
          typeof window > "u")
        )
          return;
        const V = window.matchMedia("(prefers-color-scheme: dark)");
        try {
          V.addEventListener("change", ({ matches: j }) => {
            _(j ? "dark" : "light");
          });
        } catch {
          V.addListener(({ matches: z }) => {
            try {
              _(z ? "dark" : "light");
            } catch (rt) {
              console.error(rt);
            }
          });
        }
      }, [h]),
      w.useEffect(() => {
        D.length <= 1 && Q(!1);
      }, [D]),
      w.useEffect(() => {
        const V = (j) => {
          var z;
          if (i.every(($) => j[$] || j.code === $)) {
            var H;
            (Q(!0), (H = M.current) == null || H.focus());
          }
          j.code === "Escape" &&
            (document.activeElement === M.current ||
              ((z = M.current) != null &&
                z.contains(document.activeElement))) &&
            Q(!1);
        };
        return (
          document.addEventListener("keydown", V),
          () => document.removeEventListener("keydown", V)
        );
      }, [i]),
      w.useEffect(() => {
        if (M.current)
          return () => {
            G.current &&
              (G.current.focus({ preventScroll: !0 }),
              (G.current = null),
              (ht.current = !1));
          };
      }, [M.current]),
      w.createElement(
        "section",
        {
          ref: n,
          "aria-label": `${S} ${X}`,
          tabIndex: -1,
          "aria-live": "polite",
          "aria-relevant": "additions text",
          "aria-atomic": "false",
          suppressHydrationWarning: !0,
        },
        R.map((V, j) => {
          var z;
          const [rt, H] = V.split("-");
          return v.length
            ? w.createElement(
                "ol",
                {
                  key: V,
                  dir: k === "auto" ? Os() : k,
                  tabIndex: -1,
                  ref: M,
                  className: u,
                  "data-sonner-toaster": !0,
                  "data-sonner-theme": I,
                  "data-y-position": rt,
                  "data-x-position": H,
                  style: {
                    "--front-toast-height": `${((z = F[0]) == null ? void 0 : z.height) || 0}px`,
                    "--width": `${Oa}px`,
                    "--gap": `${x}px`,
                    ...b,
                    ...qa(d, l),
                  },
                  onBlur: ($) => {
                    ht.current &&
                      !$.currentTarget.contains($.relatedTarget) &&
                      ((ht.current = !1),
                      G.current &&
                        (G.current.focus({ preventScroll: !0 }),
                        (G.current = null)));
                  },
                  onFocus: ($) => {
                    ($.target instanceof HTMLElement &&
                      $.target.dataset.dismissible === "false") ||
                      ht.current ||
                      ((ht.current = !0), (G.current = $.relatedTarget));
                  },
                  onMouseEnter: () => Q(!0),
                  onMouseMove: () => Q(!0),
                  onMouseLeave: () => {
                    yt || Q(!1);
                  },
                  onDragEnd: () => Q(!1),
                  onPointerDown: ($) => {
                    ($.target instanceof HTMLElement &&
                      $.target.dataset.dismissible === "false") ||
                      it(!0);
                  },
                  onPointerUp: () => it(!1),
                },
                v
                  .filter(($) => (!$.position && j === 0) || $.position === V)
                  .map(($, gt) => {
                    var Ct, Lt;
                    return w.createElement(Ka, {
                      key: $.id,
                      icons: E,
                      index: gt,
                      toast: $,
                      defaultRichColors: f,
                      duration: (Ct = y?.duration) != null ? Ct : p,
                      className: y?.className,
                      descriptionClassName: y?.descriptionClassName,
                      invert: o,
                      visibleToasts: g,
                      closeButton: (Lt = y?.closeButton) != null ? Lt : c,
                      interacting: yt,
                      position: V,
                      style: y?.style,
                      unstyled: y?.unstyled,
                      classNames: y?.classNames,
                      cancelButtonStyle: y?.cancelButtonStyle,
                      actionButtonStyle: y?.actionButtonStyle,
                      closeButtonAriaLabel: y?.closeButtonAriaLabel,
                      removeToast: _t,
                      toasts: v.filter((vt) => vt.position == $.position),
                      heights: F.filter((vt) => vt.position == $.position),
                      setHeights: J,
                      expandByDefault: a,
                      gap: x,
                      expanded: nt,
                      swipeDirections: e.swipeDirections,
                    });
                  }),
              )
            : null;
        }),
      )
    );
  }),
  Qn = T.createContext({});
function ts(t) {
  const e = T.useRef(null);
  return (e.current === null && (e.current = t()), e.current);
}
const hi = typeof window < "u",
  fi = hi ? T.useLayoutEffect : T.useEffect,
  en = T.createContext(null);
function es(t, e) {
  t.indexOf(e) === -1 && t.push(e);
}
function Ge(t, e) {
  const n = t.indexOf(e);
  n > -1 && t.splice(n, 1);
}
const At = (t, e, n) => (n > e ? e : n < t ? t : n);
let ns = () => {};
const Rt = {},
  pi = (t) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(t);
function mi(t) {
  return typeof t == "object" && t !== null;
}
const yi = (t) => /^0[^.\s]+$/u.test(t);
function ss(t) {
  let e;
  return () => (e === void 0 && (e = t()), e);
}
const mt = (t) => t,
  Ya = (t, e) => (n) => e(t(n)),
  Se = (...t) => t.reduce(Ya),
  xe = (t, e, n) => {
    const s = e - t;
    return s === 0 ? 1 : (n - t) / s;
  };
class os {
  constructor() {
    this.subscriptions = [];
  }
  add(e) {
    return (es(this.subscriptions, e), () => Ge(this.subscriptions, e));
  }
  notify(e, n, s) {
    const o = this.subscriptions.length;
    if (o)
      if (o === 1) this.subscriptions[0](e, n, s);
      else
        for (let r = 0; r < o; r++) {
          const i = this.subscriptions[r];
          i && i(e, n, s);
        }
  }
  getSize() {
    return this.subscriptions.length;
  }
  clear() {
    this.subscriptions.length = 0;
  }
}
const Tt = (t) => t * 1e3,
  pt = (t) => t / 1e3;
function gi(t, e) {
  return e ? t * (1e3 / e) : 0;
}
const vi = (t, e, n) =>
    (((1 - 3 * n + 3 * e) * t + (3 * n - 6 * e)) * t + 3 * e) * t,
  Xa = 1e-7,
  Za = 12;
function Ja(t, e, n, s, o) {
  let r,
    i,
    a = 0;
  do ((i = e + (n - e) / 2), (r = vi(i, s, o) - t), r > 0 ? (n = i) : (e = i));
  while (Math.abs(r) > Xa && ++a < Za);
  return i;
}
function Pe(t, e, n, s) {
  if (t === e && n === s) return mt;
  const o = (r) => Ja(r, 0, 1, t, n);
  return (r) => (r === 0 || r === 1 ? r : vi(o(r), e, s));
}
const bi = (t) => (e) => (e <= 0.5 ? t(2 * e) / 2 : (2 - t(2 * (1 - e))) / 2),
  xi = (t) => (e) => 1 - t(1 - e),
  wi = Pe(0.33, 1.53, 0.69, 0.99),
  is = xi(wi),
  ki = bi(is),
  Ti = (t) =>
    (t *= 2) < 1 ? 0.5 * is(t) : 0.5 * (2 - Math.pow(2, -10 * (t - 1))),
  rs = (t) => 1 - Math.sin(Math.acos(t)),
  Mi = xi(rs),
  Si = bi(rs),
  Qa = Pe(0.42, 0, 1, 1),
  tl = Pe(0, 0, 0.58, 1),
  Pi = Pe(0.42, 0, 0.58, 1),
  el = (t) => Array.isArray(t) && typeof t[0] != "number",
  Ai = (t) => Array.isArray(t) && typeof t[0] == "number",
  nl = {
    linear: mt,
    easeIn: Qa,
    easeInOut: Pi,
    easeOut: tl,
    circIn: rs,
    circInOut: Si,
    circOut: Mi,
    backIn: is,
    backInOut: ki,
    backOut: wi,
    anticipate: Ti,
  },
  sl = (t) => typeof t == "string",
  Hs = (t) => {
    if (Ai(t)) {
      ns(t.length === 4);
      const [e, n, s, o] = t;
      return Pe(e, n, s, o);
    } else if (sl(t)) return nl[t];
    return t;
  },
  _e = [
    "setup",
    "read",
    "resolveKeyframes",
    "preUpdate",
    "update",
    "preRender",
    "render",
    "postRender",
  ];
function ol(t, e) {
  let n = new Set(),
    s = new Set(),
    o = !1,
    r = !1;
  const i = new WeakSet();
  let a = { delta: 0, timestamp: 0, isProcessing: !1 };
  function c(d) {
    (i.has(d) && (u.schedule(d), t()), d(a));
  }
  const u = {
    schedule: (d, l = !1, h = !1) => {
      const p = h && o ? n : s;
      return (l && i.add(d), p.has(d) || p.add(d), d);
    },
    cancel: (d) => {
      (s.delete(d), i.delete(d));
    },
    process: (d) => {
      if (((a = d), o)) {
        r = !0;
        return;
      }
      ((o = !0),
        ([n, s] = [s, n]),
        n.forEach(c),
        n.clear(),
        (o = !1),
        r && ((r = !1), u.process(d)));
    },
  };
  return u;
}
const il = 40;
function Ci(t, e) {
  let n = !1,
    s = !0;
  const o = { delta: 0, timestamp: 0, isProcessing: !1 },
    r = () => (n = !0),
    i = _e.reduce((x, E) => ((x[E] = ol(r)), x), {}),
    {
      setup: a,
      read: c,
      resolveKeyframes: u,
      preUpdate: d,
      update: l,
      preRender: h,
      render: f,
      postRender: p,
    } = i,
    b = () => {
      const x = Rt.useManualTiming ? o.timestamp : performance.now();
      ((n = !1),
        Rt.useManualTiming ||
          (o.delta = s ? 1e3 / 60 : Math.max(Math.min(x - o.timestamp, il), 1)),
        (o.timestamp = x),
        (o.isProcessing = !0),
        a.process(o),
        c.process(o),
        u.process(o),
        d.process(o),
        l.process(o),
        h.process(o),
        f.process(o),
        p.process(o),
        (o.isProcessing = !1),
        n && e && ((s = !1), t(b)));
    },
    g = () => {
      ((n = !0), (s = !0), o.isProcessing || t(b));
    };
  return {
    schedule: _e.reduce((x, E) => {
      const S = i[E];
      return (
        (x[E] = (D, B = !1, v = !1) => (n || g(), S.schedule(D, B, v))),
        x
      );
    }, {}),
    cancel: (x) => {
      for (let E = 0; E < _e.length; E++) i[_e[E]].cancel(x);
    },
    state: o,
    steps: i,
  };
}
const {
  schedule: O,
  cancel: Ft,
  state: et,
  steps: cn,
} = Ci(typeof requestAnimationFrame < "u" ? requestAnimationFrame : mt, !0);
let Fe;
function rl() {
  Fe = void 0;
}
const at = {
    now: () => (
      Fe === void 0 &&
        at.set(
          et.isProcessing || Rt.useManualTiming
            ? et.timestamp
            : performance.now(),
        ),
      Fe
    ),
    set: (t) => {
      ((Fe = t), queueMicrotask(rl));
    },
  },
  Ei = (t) => (e) => typeof e == "string" && e.startsWith(t),
  Vi = Ei("--"),
  al = Ei("var(--"),
  as = (t) => (al(t) ? ll.test(t.split("/*")[0].trim()) : !1),
  ll =
    /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;
function Us(t) {
  return typeof t != "string" ? !1 : t.split("/*")[0].includes("var(--");
}
const ae = {
    test: (t) => typeof t == "number",
    parse: parseFloat,
    transform: (t) => t,
  },
  we = { ...ae, transform: (t) => At(0, 1, t) },
  Le = { ...ae, default: 1 },
  ye = (t) => Math.round(t * 1e5) / 1e5,
  ls = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function cl(t) {
  return t == null;
}
const ul =
    /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu,
  cs = (t, e) => (n) =>
    !!(
      (typeof n == "string" && ul.test(n) && n.startsWith(t)) ||
      (e && !cl(n) && Object.prototype.hasOwnProperty.call(n, e))
    ),
  Di = (t, e, n) => (s) => {
    if (typeof s != "string") return s;
    const [o, r, i, a] = s.match(ls);
    return {
      [t]: parseFloat(o),
      [e]: parseFloat(r),
      [n]: parseFloat(i),
      alpha: a !== void 0 ? parseFloat(a) : 1,
    };
  },
  dl = (t) => At(0, 255, t),
  un = { ...ae, transform: (t) => Math.round(dl(t)) },
  Gt = {
    test: cs("rgb", "red"),
    parse: Di("red", "green", "blue"),
    transform: ({ red: t, green: e, blue: n, alpha: s = 1 }) =>
      "rgba(" +
      un.transform(t) +
      ", " +
      un.transform(e) +
      ", " +
      un.transform(n) +
      ", " +
      ye(we.transform(s)) +
      ")",
  };
function hl(t) {
  let e = "",
    n = "",
    s = "",
    o = "";
  return (
    t.length > 5
      ? ((e = t.substring(1, 3)),
        (n = t.substring(3, 5)),
        (s = t.substring(5, 7)),
        (o = t.substring(7, 9)))
      : ((e = t.substring(1, 2)),
        (n = t.substring(2, 3)),
        (s = t.substring(3, 4)),
        (o = t.substring(4, 5)),
        (e += e),
        (n += n),
        (s += s),
        (o += o)),
    {
      red: parseInt(e, 16),
      green: parseInt(n, 16),
      blue: parseInt(s, 16),
      alpha: o ? parseInt(o, 16) / 255 : 1,
    }
  );
}
const En = { test: cs("#"), parse: hl, transform: Gt.transform },
  Ae = (t) => ({
    test: (e) =>
      typeof e == "string" && e.endsWith(t) && e.split(" ").length === 1,
    parse: parseFloat,
    transform: (e) => `${e}${t}`,
  }),
  jt = Ae("deg"),
  Pt = Ae("%"),
  C = Ae("px"),
  fl = Ae("vh"),
  pl = Ae("vw"),
  Ws = {
    ...Pt,
    parse: (t) => Pt.parse(t) / 100,
    transform: (t) => Pt.transform(t * 100),
  },
  te = {
    test: cs("hsl", "hue"),
    parse: Di("hue", "saturation", "lightness"),
    transform: ({ hue: t, saturation: e, lightness: n, alpha: s = 1 }) =>
      "hsla(" +
      Math.round(t) +
      ", " +
      Pt.transform(ye(e)) +
      ", " +
      Pt.transform(ye(n)) +
      ", " +
      ye(we.transform(s)) +
      ")",
  },
  K = {
    test: (t) => Gt.test(t) || En.test(t) || te.test(t),
    parse: (t) =>
      Gt.test(t) ? Gt.parse(t) : te.test(t) ? te.parse(t) : En.parse(t),
    transform: (t) =>
      typeof t == "string"
        ? t
        : t.hasOwnProperty("red")
          ? Gt.transform(t)
          : te.transform(t),
    getAnimatableNone: (t) => {
      const e = K.parse(t);
      return ((e.alpha = 0), K.transform(e));
    },
  },
  ml =
    /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
function yl(t) {
  return (
    isNaN(t) &&
    typeof t == "string" &&
    (t.match(ls)?.length || 0) + (t.match(ml)?.length || 0) > 0
  );
}
const Ri = "number",
  _i = "color",
  gl = "var",
  vl = "var(",
  Gs = "${}",
  bl =
    /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function ke(t) {
  const e = t.toString(),
    n = [],
    s = { color: [], number: [], var: [] },
    o = [];
  let r = 0;
  const a = e
    .replace(
      bl,
      (c) => (
        K.test(c)
          ? (s.color.push(r), o.push(_i), n.push(K.parse(c)))
          : c.startsWith(vl)
            ? (s.var.push(r), o.push(gl), n.push(c))
            : (s.number.push(r), o.push(Ri), n.push(parseFloat(c))),
        ++r,
        Gs
      ),
    )
    .split(Gs);
  return { values: n, split: a, indexes: s, types: o };
}
function Li(t) {
  return ke(t).values;
}
function Ni(t) {
  const { split: e, types: n } = ke(t),
    s = e.length;
  return (o) => {
    let r = "";
    for (let i = 0; i < s; i++)
      if (((r += e[i]), o[i] !== void 0)) {
        const a = n[i];
        a === Ri
          ? (r += ye(o[i]))
          : a === _i
            ? (r += K.transform(o[i]))
            : (r += o[i]);
      }
    return r;
  };
}
const xl = (t) =>
  typeof t == "number" ? 0 : K.test(t) ? K.getAnimatableNone(t) : t;
function wl(t) {
  const e = Li(t);
  return Ni(t)(e.map(xl));
}
const zt = {
  test: yl,
  parse: Li,
  createTransformer: Ni,
  getAnimatableNone: wl,
};
function dn(t, e, n) {
  return (
    n < 0 && (n += 1),
    n > 1 && (n -= 1),
    n < 1 / 6
      ? t + (e - t) * 6 * n
      : n < 1 / 2
        ? e
        : n < 2 / 3
          ? t + (e - t) * (2 / 3 - n) * 6
          : t
  );
}
function kl({ hue: t, saturation: e, lightness: n, alpha: s }) {
  ((t /= 360), (e /= 100), (n /= 100));
  let o = 0,
    r = 0,
    i = 0;
  if (!e) o = r = i = n;
  else {
    const a = n < 0.5 ? n * (1 + e) : n + e - n * e,
      c = 2 * n - a;
    ((o = dn(c, a, t + 1 / 3)), (r = dn(c, a, t)), (i = dn(c, a, t - 1 / 3)));
  }
  return {
    red: Math.round(o * 255),
    green: Math.round(r * 255),
    blue: Math.round(i * 255),
    alpha: s,
  };
}
function Ke(t, e) {
  return (n) => (n > 0 ? e : t);
}
const U = (t, e, n) => t + (e - t) * n,
  hn = (t, e, n) => {
    const s = t * t,
      o = n * (e * e - s) + s;
    return o < 0 ? 0 : Math.sqrt(o);
  },
  Tl = [En, Gt, te],
  Ml = (t) => Tl.find((e) => e.test(t));
function Ks(t) {
  const e = Ml(t);
  if (!e) return !1;
  let n = e.parse(t);
  return (e === te && (n = kl(n)), n);
}
const qs = (t, e) => {
    const n = Ks(t),
      s = Ks(e);
    if (!n || !s) return Ke(t, e);
    const o = { ...n };
    return (r) => (
      (o.red = hn(n.red, s.red, r)),
      (o.green = hn(n.green, s.green, r)),
      (o.blue = hn(n.blue, s.blue, r)),
      (o.alpha = U(n.alpha, s.alpha, r)),
      Gt.transform(o)
    );
  },
  Vn = new Set(["none", "hidden"]);
function Sl(t, e) {
  return Vn.has(t) ? (n) => (n <= 0 ? t : e) : (n) => (n >= 1 ? e : t);
}
function Pl(t, e) {
  return (n) => U(t, e, n);
}
function us(t) {
  return typeof t == "number"
    ? Pl
    : typeof t == "string"
      ? as(t)
        ? Ke
        : K.test(t)
          ? qs
          : El
      : Array.isArray(t)
        ? Ii
        : typeof t == "object"
          ? K.test(t)
            ? qs
            : Al
          : Ke;
}
function Ii(t, e) {
  const n = [...t],
    s = n.length,
    o = t.map((r, i) => us(r)(r, e[i]));
  return (r) => {
    for (let i = 0; i < s; i++) n[i] = o[i](r);
    return n;
  };
}
function Al(t, e) {
  const n = { ...t, ...e },
    s = {};
  for (const o in n)
    t[o] !== void 0 && e[o] !== void 0 && (s[o] = us(t[o])(t[o], e[o]));
  return (o) => {
    for (const r in s) n[r] = s[r](o);
    return n;
  };
}
function Cl(t, e) {
  const n = [],
    s = { color: 0, var: 0, number: 0 };
  for (let o = 0; o < e.values.length; o++) {
    const r = e.types[o],
      i = t.indexes[r][s[r]],
      a = t.values[i] ?? 0;
    ((n[o] = a), s[r]++);
  }
  return n;
}
const El = (t, e) => {
  const n = zt.createTransformer(e),
    s = ke(t),
    o = ke(e);
  return s.indexes.var.length === o.indexes.var.length &&
    s.indexes.color.length === o.indexes.color.length &&
    s.indexes.number.length >= o.indexes.number.length
    ? (Vn.has(t) && !o.values.length) || (Vn.has(e) && !s.values.length)
      ? Sl(t, e)
      : Se(Ii(Cl(s, o), o.values), n)
    : Ke(t, e);
};
function ji(t, e, n) {
  return typeof t == "number" && typeof e == "number" && typeof n == "number"
    ? U(t, e, n)
    : us(t)(t, e);
}
const Vl = (t) => {
    const e = ({ timestamp: n }) => t(n);
    return {
      start: (n = !0) => O.update(e, n),
      stop: () => Ft(e),
      now: () => (et.isProcessing ? et.timestamp : at.now()),
    };
  },
  Bi = (t, e, n = 10) => {
    let s = "";
    const o = Math.max(Math.round(e / n), 2);
    for (let r = 0; r < o; r++)
      s += Math.round(t(r / (o - 1)) * 1e4) / 1e4 + ", ";
    return `linear(${s.substring(0, s.length - 2)})`;
  },
  qe = 2e4;
function ds(t) {
  let e = 0;
  const n = 50;
  let s = t.next(e);
  for (; !s.done && e < qe; ) ((e += n), (s = t.next(e)));
  return e >= qe ? 1 / 0 : e;
}
function Dl(t, e = 100, n) {
  const s = n({ ...t, keyframes: [0, e] }),
    o = Math.min(ds(s), qe);
  return {
    type: "keyframes",
    ease: (r) => s.next(o * r).value / e,
    duration: pt(o),
  };
}
const Rl = 5;
function Fi(t, e, n) {
  const s = Math.max(e - Rl, 0);
  return gi(n - t(s), e - s);
}
const W = {
    stiffness: 100,
    damping: 10,
    mass: 1,
    velocity: 0,
    duration: 800,
    bounce: 0.3,
    visualDuration: 0.3,
    restSpeed: { granular: 0.01, default: 2 },
    restDelta: { granular: 0.005, default: 0.5 },
    minDuration: 0.01,
    maxDuration: 10,
    minDamping: 0.05,
    maxDamping: 1,
  },
  fn = 0.001;
function _l({
  duration: t = W.duration,
  bounce: e = W.bounce,
  velocity: n = W.velocity,
  mass: s = W.mass,
}) {
  let o,
    r,
    i = 1 - e;
  ((i = At(W.minDamping, W.maxDamping, i)),
    (t = At(W.minDuration, W.maxDuration, pt(t))),
    i < 1
      ? ((o = (u) => {
          const d = u * i,
            l = d * t,
            h = d - n,
            f = Dn(u, i),
            p = Math.exp(-l);
          return fn - (h / f) * p;
        }),
        (r = (u) => {
          const l = u * i * t,
            h = l * n + n,
            f = Math.pow(i, 2) * Math.pow(u, 2) * t,
            p = Math.exp(-l),
            b = Dn(Math.pow(u, 2), i);
          return ((-o(u) + fn > 0 ? -1 : 1) * ((h - f) * p)) / b;
        }))
      : ((o = (u) => {
          const d = Math.exp(-u * t),
            l = (u - n) * t + 1;
          return -fn + d * l;
        }),
        (r = (u) => {
          const d = Math.exp(-u * t),
            l = (n - u) * (t * t);
          return d * l;
        })));
  const a = 5 / t,
    c = Nl(o, r, a);
  if (((t = Tt(t)), isNaN(c)))
    return { stiffness: W.stiffness, damping: W.damping, duration: t };
  {
    const u = Math.pow(c, 2) * s;
    return { stiffness: u, damping: i * 2 * Math.sqrt(s * u), duration: t };
  }
}
const Ll = 12;
function Nl(t, e, n) {
  let s = n;
  for (let o = 1; o < Ll; o++) s = s - t(s) / e(s);
  return s;
}
function Dn(t, e) {
  return t * Math.sqrt(1 - e * e);
}
const Il = ["duration", "bounce"],
  jl = ["stiffness", "damping", "mass"];
function Ys(t, e) {
  return e.some((n) => t[n] !== void 0);
}
function Bl(t) {
  let e = {
    velocity: W.velocity,
    stiffness: W.stiffness,
    damping: W.damping,
    mass: W.mass,
    isResolvedFromDuration: !1,
    ...t,
  };
  if (!Ys(t, jl) && Ys(t, Il))
    if (t.visualDuration) {
      const n = t.visualDuration,
        s = (2 * Math.PI) / (n * 1.2),
        o = s * s,
        r = 2 * At(0.05, 1, 1 - (t.bounce || 0)) * Math.sqrt(o);
      e = { ...e, mass: W.mass, stiffness: o, damping: r };
    } else {
      const n = _l(t);
      ((e = { ...e, ...n, mass: W.mass }), (e.isResolvedFromDuration = !0));
    }
  return e;
}
function Ye(t = W.visualDuration, e = W.bounce) {
  const n =
    typeof t != "object"
      ? { visualDuration: t, keyframes: [0, 1], bounce: e }
      : t;
  let { restSpeed: s, restDelta: o } = n;
  const r = n.keyframes[0],
    i = n.keyframes[n.keyframes.length - 1],
    a = { done: !1, value: r },
    {
      stiffness: c,
      damping: u,
      mass: d,
      duration: l,
      velocity: h,
      isResolvedFromDuration: f,
    } = Bl({ ...n, velocity: -pt(n.velocity || 0) }),
    p = h || 0,
    b = u / (2 * Math.sqrt(c * d)),
    g = i - r,
    y = pt(Math.sqrt(c / d)),
    k = Math.abs(g) < 5;
  (s || (s = k ? W.restSpeed.granular : W.restSpeed.default),
    o || (o = k ? W.restDelta.granular : W.restDelta.default));
  let x;
  if (b < 1) {
    const S = Dn(y, b);
    x = (D) => {
      const B = Math.exp(-b * y * D);
      return (
        i - B * (((p + b * y * g) / S) * Math.sin(S * D) + g * Math.cos(S * D))
      );
    };
  } else if (b === 1) x = (S) => i - Math.exp(-y * S) * (g + (p + y * g) * S);
  else {
    const S = y * Math.sqrt(b * b - 1);
    x = (D) => {
      const B = Math.exp(-b * y * D),
        v = Math.min(S * D, 300);
      return (
        i - (B * ((p + b * y * g) * Math.sinh(v) + S * g * Math.cosh(v))) / S
      );
    };
  }
  const E = {
    calculatedDuration: (f && l) || null,
    next: (S) => {
      const D = x(S);
      if (f) a.done = S >= l;
      else {
        let B = S === 0 ? p : 0;
        b < 1 && (B = S === 0 ? Tt(p) : Fi(x, S, D));
        const v = Math.abs(B) <= s,
          R = Math.abs(i - D) <= o;
        a.done = v && R;
      }
      return ((a.value = a.done ? i : D), a);
    },
    toString: () => {
      const S = Math.min(ds(E), qe),
        D = Bi((B) => E.next(S * B).value, S, 30);
      return S + "ms " + D;
    },
    toTransition: () => {},
  };
  return E;
}
Ye.applyToOptions = (t) => {
  const e = Dl(t, 100, Ye);
  return (
    (t.ease = e.ease),
    (t.duration = Tt(e.duration)),
    (t.type = "keyframes"),
    t
  );
};
function Rn({
  keyframes: t,
  velocity: e = 0,
  power: n = 0.8,
  timeConstant: s = 325,
  bounceDamping: o = 10,
  bounceStiffness: r = 500,
  modifyTarget: i,
  min: a,
  max: c,
  restDelta: u = 0.5,
  restSpeed: d,
}) {
  const l = t[0],
    h = { done: !1, value: l },
    f = (v) => (a !== void 0 && v < a) || (c !== void 0 && v > c),
    p = (v) =>
      a === void 0
        ? c
        : c === void 0 || Math.abs(a - v) < Math.abs(c - v)
          ? a
          : c;
  let b = n * e;
  const g = l + b,
    y = i === void 0 ? g : i(g);
  y !== g && (b = y - l);
  const k = (v) => -b * Math.exp(-v / s),
    x = (v) => y + k(v),
    E = (v) => {
      const R = k(v),
        F = x(v);
      ((h.done = Math.abs(R) <= u), (h.value = h.done ? y : F));
    };
  let S, D;
  const B = (v) => {
    f(h.value) &&
      ((S = v),
      (D = Ye({
        keyframes: [h.value, p(h.value)],
        velocity: Fi(x, v, h.value),
        damping: o,
        stiffness: r,
        restDelta: u,
        restSpeed: d,
      })));
  };
  return (
    B(0),
    {
      calculatedDuration: null,
      next: (v) => {
        let R = !1;
        return (
          !D && S === void 0 && ((R = !0), E(v), B(v)),
          S !== void 0 && v >= S ? D.next(v - S) : (!R && E(v), h)
        );
      },
    }
  );
}
function Fl(t, e, n) {
  const s = [],
    o = n || Rt.mix || ji,
    r = t.length - 1;
  for (let i = 0; i < r; i++) {
    let a = o(t[i], t[i + 1]);
    if (e) {
      const c = Array.isArray(e) ? e[i] || mt : e;
      a = Se(c, a);
    }
    s.push(a);
  }
  return s;
}
function zl(t, e, { clamp: n = !0, ease: s, mixer: o } = {}) {
  const r = t.length;
  if ((ns(r === e.length), r === 1)) return () => e[0];
  if (r === 2 && e[0] === e[1]) return () => e[1];
  const i = t[0] === t[1];
  t[0] > t[r - 1] && ((t = [...t].reverse()), (e = [...e].reverse()));
  const a = Fl(e, s, o),
    c = a.length,
    u = (d) => {
      if (i && d < t[0]) return e[0];
      let l = 0;
      if (c > 1) for (; l < t.length - 2 && !(d < t[l + 1]); l++);
      const h = xe(t[l], t[l + 1], d);
      return a[l](h);
    };
  return n ? (d) => u(At(t[0], t[r - 1], d)) : u;
}
function $l(t, e) {
  const n = t[t.length - 1];
  for (let s = 1; s <= e; s++) {
    const o = xe(0, e, s);
    t.push(U(n, 1, o));
  }
}
function Ol(t) {
  const e = [0];
  return ($l(e, t.length - 1), e);
}
function Hl(t, e) {
  return t.map((n) => n * e);
}
function Ul(t, e) {
  return t.map(() => e || Pi).splice(0, t.length - 1);
}
function ge({
  duration: t = 300,
  keyframes: e,
  times: n,
  ease: s = "easeInOut",
}) {
  const o = el(s) ? s.map(Hs) : Hs(s),
    r = { done: !1, value: e[0] },
    i = Hl(n && n.length === e.length ? n : Ol(e), t),
    a = zl(i, e, { ease: Array.isArray(o) ? o : Ul(e, o) });
  return {
    calculatedDuration: t,
    next: (c) => ((r.value = a(c)), (r.done = c >= t), r),
  };
}
const Wl = (t) => t !== null;
function hs(t, { repeat: e, repeatType: n = "loop" }, s, o = 1) {
  const r = t.filter(Wl),
    a = o < 0 || (e && n !== "loop" && e % 2 === 1) ? 0 : r.length - 1;
  return !a || s === void 0 ? r[a] : s;
}
const Gl = { decay: Rn, inertia: Rn, tween: ge, keyframes: ge, spring: Ye };
function zi(t) {
  typeof t.type == "string" && (t.type = Gl[t.type]);
}
class fs {
  constructor() {
    this.updateFinished();
  }
  get finished() {
    return this._finished;
  }
  updateFinished() {
    this._finished = new Promise((e) => {
      this.resolve = e;
    });
  }
  notifyFinished() {
    this.resolve();
  }
  then(e, n) {
    return this.finished.then(e, n);
  }
}
const Kl = (t) => t / 100;
class ps extends fs {
  constructor(e) {
    (super(),
      (this.state = "idle"),
      (this.startTime = null),
      (this.isStopped = !1),
      (this.currentTime = 0),
      (this.holdTime = null),
      (this.playbackSpeed = 1),
      (this.stop = () => {
        const { motionValue: n } = this.options;
        (n && n.updatedAt !== at.now() && this.tick(at.now()),
          (this.isStopped = !0),
          this.state !== "idle" && (this.teardown(), this.options.onStop?.()));
      }),
      (this.options = e),
      this.initAnimation(),
      this.play(),
      e.autoplay === !1 && this.pause());
  }
  initAnimation() {
    const { options: e } = this;
    zi(e);
    const {
      type: n = ge,
      repeat: s = 0,
      repeatDelay: o = 0,
      repeatType: r,
      velocity: i = 0,
    } = e;
    let { keyframes: a } = e;
    const c = n || ge;
    c !== ge &&
      typeof a[0] != "number" &&
      ((this.mixKeyframes = Se(Kl, ji(a[0], a[1]))), (a = [0, 100]));
    const u = c({ ...e, keyframes: a });
    (r === "mirror" &&
      (this.mirroredGenerator = c({
        ...e,
        keyframes: [...a].reverse(),
        velocity: -i,
      })),
      u.calculatedDuration === null && (u.calculatedDuration = ds(u)));
    const { calculatedDuration: d } = u;
    ((this.calculatedDuration = d),
      (this.resolvedDuration = d + o),
      (this.totalDuration = this.resolvedDuration * (s + 1) - o),
      (this.generator = u));
  }
  updateTime(e) {
    const n = Math.round(e - this.startTime) * this.playbackSpeed;
    this.holdTime !== null
      ? (this.currentTime = this.holdTime)
      : (this.currentTime = n);
  }
  tick(e, n = !1) {
    const {
      generator: s,
      totalDuration: o,
      mixKeyframes: r,
      mirroredGenerator: i,
      resolvedDuration: a,
      calculatedDuration: c,
    } = this;
    if (this.startTime === null) return s.next(0);
    const {
      delay: u = 0,
      keyframes: d,
      repeat: l,
      repeatType: h,
      repeatDelay: f,
      type: p,
      onUpdate: b,
      finalKeyframe: g,
    } = this.options;
    (this.speed > 0
      ? (this.startTime = Math.min(this.startTime, e))
      : this.speed < 0 &&
        (this.startTime = Math.min(e - o / this.speed, this.startTime)),
      n ? (this.currentTime = e) : this.updateTime(e));
    const y = this.currentTime - u * (this.playbackSpeed >= 0 ? 1 : -1),
      k = this.playbackSpeed >= 0 ? y < 0 : y > o;
    ((this.currentTime = Math.max(y, 0)),
      this.state === "finished" &&
        this.holdTime === null &&
        (this.currentTime = o));
    let x = this.currentTime,
      E = s;
    if (l) {
      const v = Math.min(this.currentTime, o) / a;
      let R = Math.floor(v),
        F = v % 1;
      (!F && v >= 1 && (F = 1),
        F === 1 && R--,
        (R = Math.min(R, l + 1)),
        R % 2 &&
          (h === "reverse"
            ? ((F = 1 - F), f && (F -= f / a))
            : h === "mirror" && (E = i)),
        (x = At(0, 1, F) * a));
    }
    const S = k ? { done: !1, value: d[0] } : E.next(x);
    r && (S.value = r(S.value));
    let { done: D } = S;
    !k &&
      c !== null &&
      (D =
        this.playbackSpeed >= 0
          ? this.currentTime >= o
          : this.currentTime <= 0);
    const B =
      this.holdTime === null &&
      (this.state === "finished" || (this.state === "running" && D));
    return (
      B && p !== Rn && (S.value = hs(d, this.options, g, this.speed)),
      b && b(S.value),
      B && this.finish(),
      S
    );
  }
  then(e, n) {
    return this.finished.then(e, n);
  }
  get duration() {
    return pt(this.calculatedDuration);
  }
  get iterationDuration() {
    const { delay: e = 0 } = this.options || {};
    return this.duration + pt(e);
  }
  get time() {
    return pt(this.currentTime);
  }
  set time(e) {
    ((e = Tt(e)),
      (this.currentTime = e),
      this.startTime === null ||
      this.holdTime !== null ||
      this.playbackSpeed === 0
        ? (this.holdTime = e)
        : this.driver &&
          (this.startTime = this.driver.now() - e / this.playbackSpeed),
      this.driver?.start(!1));
  }
  get speed() {
    return this.playbackSpeed;
  }
  set speed(e) {
    this.updateTime(at.now());
    const n = this.playbackSpeed !== e;
    ((this.playbackSpeed = e), n && (this.time = pt(this.currentTime)));
  }
  play() {
    if (this.isStopped) return;
    const { driver: e = Vl, startTime: n } = this.options;
    (this.driver || (this.driver = e((o) => this.tick(o))),
      this.options.onPlay?.());
    const s = this.driver.now();
    (this.state === "finished"
      ? (this.updateFinished(), (this.startTime = s))
      : this.holdTime !== null
        ? (this.startTime = s - this.holdTime)
        : this.startTime || (this.startTime = n ?? s),
      this.state === "finished" &&
        this.speed < 0 &&
        (this.startTime += this.calculatedDuration),
      (this.holdTime = null),
      (this.state = "running"),
      this.driver.start());
  }
  pause() {
    ((this.state = "paused"),
      this.updateTime(at.now()),
      (this.holdTime = this.currentTime));
  }
  complete() {
    (this.state !== "running" && this.play(),
      (this.state = "finished"),
      (this.holdTime = null));
  }
  finish() {
    (this.notifyFinished(),
      this.teardown(),
      (this.state = "finished"),
      this.options.onComplete?.());
  }
  cancel() {
    ((this.holdTime = null),
      (this.startTime = 0),
      this.tick(0),
      this.teardown(),
      this.options.onCancel?.());
  }
  teardown() {
    ((this.state = "idle"),
      this.stopDriver(),
      (this.startTime = this.holdTime = null));
  }
  stopDriver() {
    this.driver && (this.driver.stop(), (this.driver = void 0));
  }
  sample(e) {
    return ((this.startTime = 0), this.tick(e, !0));
  }
  attachTimeline(e) {
    return (
      this.options.allowFlatten &&
        ((this.options.type = "keyframes"),
        (this.options.ease = "linear"),
        this.initAnimation()),
      this.driver?.stop(),
      e.observe(this)
    );
  }
}
function ql(t) {
  for (let e = 1; e < t.length; e++) t[e] ?? (t[e] = t[e - 1]);
}
const Kt = (t) => (t * 180) / Math.PI,
  _n = (t) => {
    const e = Kt(Math.atan2(t[1], t[0]));
    return Ln(e);
  },
  Yl = {
    x: 4,
    y: 5,
    translateX: 4,
    translateY: 5,
    scaleX: 0,
    scaleY: 3,
    scale: (t) => (Math.abs(t[0]) + Math.abs(t[3])) / 2,
    rotate: _n,
    rotateZ: _n,
    skewX: (t) => Kt(Math.atan(t[1])),
    skewY: (t) => Kt(Math.atan(t[2])),
    skew: (t) => (Math.abs(t[1]) + Math.abs(t[2])) / 2,
  },
  Ln = (t) => ((t = t % 360), t < 0 && (t += 360), t),
  Xs = _n,
  Zs = (t) => Math.sqrt(t[0] * t[0] + t[1] * t[1]),
  Js = (t) => Math.sqrt(t[4] * t[4] + t[5] * t[5]),
  Xl = {
    x: 12,
    y: 13,
    z: 14,
    translateX: 12,
    translateY: 13,
    translateZ: 14,
    scaleX: Zs,
    scaleY: Js,
    scale: (t) => (Zs(t) + Js(t)) / 2,
    rotateX: (t) => Ln(Kt(Math.atan2(t[6], t[5]))),
    rotateY: (t) => Ln(Kt(Math.atan2(-t[2], t[0]))),
    rotateZ: Xs,
    rotate: Xs,
    skewX: (t) => Kt(Math.atan(t[4])),
    skewY: (t) => Kt(Math.atan(t[1])),
    skew: (t) => (Math.abs(t[1]) + Math.abs(t[4])) / 2,
  };
function Nn(t) {
  return t.includes("scale") ? 1 : 0;
}
function In(t, e) {
  if (!t || t === "none") return Nn(e);
  const n = t.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);
  let s, o;
  if (n) ((s = Xl), (o = n));
  else {
    const a = t.match(/^matrix\(([-\d.e\s,]+)\)$/u);
    ((s = Yl), (o = a));
  }
  if (!o) return Nn(e);
  const r = s[e],
    i = o[1].split(",").map(Jl);
  return typeof r == "function" ? r(i) : i[r];
}
const Zl = (t, e) => {
  const { transform: n = "none" } = getComputedStyle(t);
  return In(n, e);
};
function Jl(t) {
  return parseFloat(t.trim());
}
const le = [
    "transformPerspective",
    "x",
    "y",
    "z",
    "translateX",
    "translateY",
    "translateZ",
    "scale",
    "scaleX",
    "scaleY",
    "rotate",
    "rotateX",
    "rotateY",
    "rotateZ",
    "skew",
    "skewX",
    "skewY",
  ],
  ce = new Set(le),
  Qs = (t) => t === ae || t === C,
  Ql = new Set(["x", "y", "z"]),
  tc = le.filter((t) => !Ql.has(t));
function ec(t) {
  const e = [];
  return (
    tc.forEach((n) => {
      const s = t.getValue(n);
      s !== void 0 &&
        (e.push([n, s.get()]), s.set(n.startsWith("scale") ? 1 : 0));
    }),
    e
  );
}
const Bt = {
  width: ({ x: t }, { paddingLeft: e = "0", paddingRight: n = "0" }) =>
    t.max - t.min - parseFloat(e) - parseFloat(n),
  height: ({ y: t }, { paddingTop: e = "0", paddingBottom: n = "0" }) =>
    t.max - t.min - parseFloat(e) - parseFloat(n),
  top: (t, { top: e }) => parseFloat(e),
  left: (t, { left: e }) => parseFloat(e),
  bottom: ({ y: t }, { top: e }) => parseFloat(e) + (t.max - t.min),
  right: ({ x: t }, { left: e }) => parseFloat(e) + (t.max - t.min),
  x: (t, { transform: e }) => In(e, "x"),
  y: (t, { transform: e }) => In(e, "y"),
};
Bt.translateX = Bt.x;
Bt.translateY = Bt.y;
const qt = new Set();
let jn = !1,
  Bn = !1,
  Fn = !1;
function $i() {
  if (Bn) {
    const t = Array.from(qt).filter((s) => s.needsMeasurement),
      e = new Set(t.map((s) => s.element)),
      n = new Map();
    (e.forEach((s) => {
      const o = ec(s);
      o.length && (n.set(s, o), s.render());
    }),
      t.forEach((s) => s.measureInitialState()),
      e.forEach((s) => {
        s.render();
        const o = n.get(s);
        o &&
          o.forEach(([r, i]) => {
            s.getValue(r)?.set(i);
          });
      }),
      t.forEach((s) => s.measureEndState()),
      t.forEach((s) => {
        s.suspendedScrollY !== void 0 && window.scrollTo(0, s.suspendedScrollY);
      }));
  }
  ((Bn = !1), (jn = !1), qt.forEach((t) => t.complete(Fn)), qt.clear());
}
function Oi() {
  qt.forEach((t) => {
    (t.readKeyframes(), t.needsMeasurement && (Bn = !0));
  });
}
function nc() {
  ((Fn = !0), Oi(), $i(), (Fn = !1));
}
class ms {
  constructor(e, n, s, o, r, i = !1) {
    ((this.state = "pending"),
      (this.isAsync = !1),
      (this.needsMeasurement = !1),
      (this.unresolvedKeyframes = [...e]),
      (this.onComplete = n),
      (this.name = s),
      (this.motionValue = o),
      (this.element = r),
      (this.isAsync = i));
  }
  scheduleResolve() {
    ((this.state = "scheduled"),
      this.isAsync
        ? (qt.add(this), jn || ((jn = !0), O.read(Oi), O.resolveKeyframes($i)))
        : (this.readKeyframes(), this.complete()));
  }
  readKeyframes() {
    const {
      unresolvedKeyframes: e,
      name: n,
      element: s,
      motionValue: o,
    } = this;
    if (e[0] === null) {
      const r = o?.get(),
        i = e[e.length - 1];
      if (r !== void 0) e[0] = r;
      else if (s && n) {
        const a = s.readValue(n, i);
        a != null && (e[0] = a);
      }
      (e[0] === void 0 && (e[0] = i), o && r === void 0 && o.set(e[0]));
    }
    ql(e);
  }
  setFinalKeyframe() {}
  measureInitialState() {}
  renderEndStyles() {}
  measureEndState() {}
  complete(e = !1) {
    ((this.state = "complete"),
      this.onComplete(this.unresolvedKeyframes, this.finalKeyframe, e),
      qt.delete(this));
  }
  cancel() {
    this.state === "scheduled" && (qt.delete(this), (this.state = "pending"));
  }
  resume() {
    this.state === "pending" && this.scheduleResolve();
  }
}
const sc = (t) => t.startsWith("--");
function oc(t, e, n) {
  sc(e) ? t.style.setProperty(e, n) : (t.style[e] = n);
}
const ic = ss(() => window.ScrollTimeline !== void 0),
  rc = {};
function ac(t, e) {
  const n = ss(t);
  return () => rc[e] ?? n();
}
const Hi = ac(() => {
    try {
      document
        .createElement("div")
        .animate({ opacity: 0 }, { easing: "linear(0, 1)" });
    } catch {
      return !1;
    }
    return !0;
  }, "linearEasing"),
  me = ([t, e, n, s]) => `cubic-bezier(${t}, ${e}, ${n}, ${s})`,
  to = {
    linear: "linear",
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    circIn: me([0, 0.65, 0.55, 1]),
    circOut: me([0.55, 0, 1, 0.45]),
    backIn: me([0.31, 0.01, 0.66, -0.59]),
    backOut: me([0.33, 1.53, 0.69, 0.99]),
  };
function Ui(t, e) {
  if (t)
    return typeof t == "function"
      ? Hi()
        ? Bi(t, e)
        : "ease-out"
      : Ai(t)
        ? me(t)
        : Array.isArray(t)
          ? t.map((n) => Ui(n, e) || to.easeOut)
          : to[t];
}
function lc(
  t,
  e,
  n,
  {
    delay: s = 0,
    duration: o = 300,
    repeat: r = 0,
    repeatType: i = "loop",
    ease: a = "easeOut",
    times: c,
  } = {},
  u = void 0,
) {
  const d = { [e]: n };
  c && (d.offset = c);
  const l = Ui(a, o);
  Array.isArray(l) && (d.easing = l);
  const h = {
    delay: s,
    duration: o,
    easing: Array.isArray(l) ? "linear" : l,
    fill: "both",
    iterations: r + 1,
    direction: i === "reverse" ? "alternate" : "normal",
  };
  return (u && (h.pseudoElement = u), t.animate(d, h));
}
function Wi(t) {
  return typeof t == "function" && "applyToOptions" in t;
}
function cc({ type: t, ...e }) {
  return Wi(t) && Hi()
    ? t.applyToOptions(e)
    : (e.duration ?? (e.duration = 300), e.ease ?? (e.ease = "easeOut"), e);
}
class Gi extends fs {
  constructor(e) {
    if (
      (super(),
      (this.finishedTime = null),
      (this.isStopped = !1),
      (this.manualStartTime = null),
      !e)
    )
      return;
    const {
      element: n,
      name: s,
      keyframes: o,
      pseudoElement: r,
      allowFlatten: i = !1,
      finalKeyframe: a,
      onComplete: c,
    } = e;
    ((this.isPseudoElement = !!r),
      (this.allowFlatten = i),
      (this.options = e),
      ns(typeof e.type != "string"));
    const u = cc(e);
    ((this.animation = lc(n, s, o, u, r)),
      u.autoplay === !1 && this.animation.pause(),
      (this.animation.onfinish = () => {
        if (((this.finishedTime = this.time), !r)) {
          const d = hs(o, this.options, a, this.speed);
          (this.updateMotionValue ? this.updateMotionValue(d) : oc(n, s, d),
            this.animation.cancel());
        }
        (c?.(), this.notifyFinished());
      }));
  }
  play() {
    this.isStopped ||
      ((this.manualStartTime = null),
      this.animation.play(),
      this.state === "finished" && this.updateFinished());
  }
  pause() {
    this.animation.pause();
  }
  complete() {
    this.animation.finish?.();
  }
  cancel() {
    try {
      this.animation.cancel();
    } catch {}
  }
  stop() {
    if (this.isStopped) return;
    this.isStopped = !0;
    const { state: e } = this;
    e === "idle" ||
      e === "finished" ||
      (this.updateMotionValue ? this.updateMotionValue() : this.commitStyles(),
      this.isPseudoElement || this.cancel());
  }
  commitStyles() {
    const e = this.options?.element;
    !this.isPseudoElement && e?.isConnected && this.animation.commitStyles?.();
  }
  get duration() {
    const e = this.animation.effect?.getComputedTiming?.().duration || 0;
    return pt(Number(e));
  }
  get iterationDuration() {
    const { delay: e = 0 } = this.options || {};
    return this.duration + pt(e);
  }
  get time() {
    return pt(Number(this.animation.currentTime) || 0);
  }
  set time(e) {
    ((this.manualStartTime = null),
      (this.finishedTime = null),
      (this.animation.currentTime = Tt(e)));
  }
  get speed() {
    return this.animation.playbackRate;
  }
  set speed(e) {
    (e < 0 && (this.finishedTime = null), (this.animation.playbackRate = e));
  }
  get state() {
    return this.finishedTime !== null ? "finished" : this.animation.playState;
  }
  get startTime() {
    return this.manualStartTime ?? Number(this.animation.startTime);
  }
  set startTime(e) {
    this.manualStartTime = this.animation.startTime = e;
  }
  attachTimeline({ timeline: e, observe: n }) {
    return (
      this.allowFlatten &&
        this.animation.effect?.updateTiming({ easing: "linear" }),
      (this.animation.onfinish = null),
      e && ic() ? ((this.animation.timeline = e), mt) : n(this)
    );
  }
}
const Ki = { anticipate: Ti, backInOut: ki, circInOut: Si };
function uc(t) {
  return t in Ki;
}
function dc(t) {
  typeof t.ease == "string" && uc(t.ease) && (t.ease = Ki[t.ease]);
}
const pn = 10;
class hc extends Gi {
  constructor(e) {
    (dc(e),
      zi(e),
      super(e),
      e.startTime !== void 0 && (this.startTime = e.startTime),
      (this.options = e));
  }
  updateMotionValue(e) {
    const {
      motionValue: n,
      onUpdate: s,
      onComplete: o,
      element: r,
      ...i
    } = this.options;
    if (!n) return;
    if (e !== void 0) {
      n.set(e);
      return;
    }
    const a = new ps({ ...i, autoplay: !1 }),
      c = Math.max(pn, at.now() - this.startTime),
      u = At(0, pn, c - pn);
    (n.setWithVelocity(
      a.sample(Math.max(0, c - u)).value,
      a.sample(c).value,
      u,
    ),
      a.stop());
  }
}
const eo = (t, e) =>
  e === "zIndex"
    ? !1
    : !!(
        typeof t == "number" ||
        Array.isArray(t) ||
        (typeof t == "string" &&
          (zt.test(t) || t === "0") &&
          !t.startsWith("url("))
      );
function fc(t) {
  const e = t[0];
  if (t.length === 1) return !0;
  for (let n = 0; n < t.length; n++) if (t[n] !== e) return !0;
}
function pc(t, e, n, s) {
  const o = t[0];
  if (o === null) return !1;
  if (e === "display" || e === "visibility") return !0;
  const r = t[t.length - 1],
    i = eo(o, e),
    a = eo(r, e);
  return !i || !a ? !1 : fc(t) || ((n === "spring" || Wi(n)) && s);
}
function zn(t) {
  ((t.duration = 0), (t.type = "keyframes"));
}
const mc = new Set(["opacity", "clipPath", "filter", "transform"]),
  yc = ss(() => Object.hasOwnProperty.call(Element.prototype, "animate"));
function gc(t) {
  const {
    motionValue: e,
    name: n,
    repeatDelay: s,
    repeatType: o,
    damping: r,
    type: i,
  } = t;
  if (!(e?.owner?.current instanceof HTMLElement)) return !1;
  const { onUpdate: c, transformTemplate: u } = e.owner.getProps();
  return (
    yc() &&
    n &&
    mc.has(n) &&
    (n !== "transform" || !u) &&
    !c &&
    !s &&
    o !== "mirror" &&
    r !== 0 &&
    i !== "inertia"
  );
}
const vc = 40;
class bc extends fs {
  constructor({
    autoplay: e = !0,
    delay: n = 0,
    type: s = "keyframes",
    repeat: o = 0,
    repeatDelay: r = 0,
    repeatType: i = "loop",
    keyframes: a,
    name: c,
    motionValue: u,
    element: d,
    ...l
  }) {
    (super(),
      (this.stop = () => {
        (this._animation && (this._animation.stop(), this.stopTimeline?.()),
          this.keyframeResolver?.cancel());
      }),
      (this.createdAt = at.now()));
    const h = {
        autoplay: e,
        delay: n,
        type: s,
        repeat: o,
        repeatDelay: r,
        repeatType: i,
        name: c,
        motionValue: u,
        element: d,
        ...l,
      },
      f = d?.KeyframeResolver || ms;
    ((this.keyframeResolver = new f(
      a,
      (p, b, g) => this.onKeyframesResolved(p, b, h, !g),
      c,
      u,
      d,
    )),
      this.keyframeResolver?.scheduleResolve());
  }
  onKeyframesResolved(e, n, s, o) {
    this.keyframeResolver = void 0;
    const {
      name: r,
      type: i,
      velocity: a,
      delay: c,
      isHandoff: u,
      onUpdate: d,
    } = s;
    ((this.resolvedAt = at.now()),
      pc(e, r, i, a) ||
        ((Rt.instantAnimations || !c) && d?.(hs(e, s, n)),
        (e[0] = e[e.length - 1]),
        zn(s),
        (s.repeat = 0)));
    const h = {
        startTime: o
          ? this.resolvedAt
            ? this.resolvedAt - this.createdAt > vc
              ? this.resolvedAt
              : this.createdAt
            : this.createdAt
          : void 0,
        finalKeyframe: n,
        ...s,
        keyframes: e,
      },
      f = !u && gc(h),
      p = h.motionValue?.owner?.current,
      b = f ? new hc({ ...h, element: p }) : new ps(h);
    (b.finished
      .then(() => {
        this.notifyFinished();
      })
      .catch(mt),
      this.pendingTimeline &&
        ((this.stopTimeline = b.attachTimeline(this.pendingTimeline)),
        (this.pendingTimeline = void 0)),
      (this._animation = b));
  }
  get finished() {
    return this._animation ? this.animation.finished : this._finished;
  }
  then(e, n) {
    return this.finished.finally(e).then(() => {});
  }
  get animation() {
    return (
      this._animation || (this.keyframeResolver?.resume(), nc()),
      this._animation
    );
  }
  get duration() {
    return this.animation.duration;
  }
  get iterationDuration() {
    return this.animation.iterationDuration;
  }
  get time() {
    return this.animation.time;
  }
  set time(e) {
    this.animation.time = e;
  }
  get speed() {
    return this.animation.speed;
  }
  get state() {
    return this.animation.state;
  }
  set speed(e) {
    this.animation.speed = e;
  }
  get startTime() {
    return this.animation.startTime;
  }
  attachTimeline(e) {
    return (
      this._animation
        ? (this.stopTimeline = this.animation.attachTimeline(e))
        : (this.pendingTimeline = e),
      () => this.stop()
    );
  }
  play() {
    this.animation.play();
  }
  pause() {
    this.animation.pause();
  }
  complete() {
    this.animation.complete();
  }
  cancel() {
    (this._animation && this.animation.cancel(),
      this.keyframeResolver?.cancel());
  }
}
function qi(t, e, n, s = 0, o = 1) {
  const r = Array.from(t)
      .sort((u, d) => u.sortNodePosition(d))
      .indexOf(e),
    i = t.size,
    a = (i - 1) * s;
  return typeof n == "function" ? n(r, i) : o === 1 ? r * s : a - r * s;
}
const xc = /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u;
function wc(t) {
  const e = xc.exec(t);
  if (!e) return [,];
  const [, n, s, o] = e;
  return [`--${n ?? s}`, o];
}
function Yi(t, e, n = 1) {
  const [s, o] = wc(t);
  if (!s) return;
  const r = window.getComputedStyle(e).getPropertyValue(s);
  if (r) {
    const i = r.trim();
    return pi(i) ? parseFloat(i) : i;
  }
  return as(o) ? Yi(o, e, n + 1) : o;
}
const kc = { type: "spring", stiffness: 500, damping: 25, restSpeed: 10 },
  Tc = (t) => ({
    type: "spring",
    stiffness: 550,
    damping: t === 0 ? 2 * Math.sqrt(550) : 30,
    restSpeed: 10,
  }),
  Mc = { type: "keyframes", duration: 0.8 },
  Sc = { type: "keyframes", ease: [0.25, 0.1, 0.35, 1], duration: 0.3 },
  Pc = (t, { keyframes: e }) =>
    e.length > 2
      ? Mc
      : ce.has(t)
        ? t.startsWith("scale")
          ? Tc(e[1])
          : kc
        : Sc,
  Ac = (t) => t !== null;
function Cc(t, { repeat: e, repeatType: n = "loop" }, s) {
  const o = t.filter(Ac),
    r = e && n !== "loop" && e % 2 === 1 ? 0 : o.length - 1;
  return o[r];
}
function Xi(t, e) {
  if (t?.inherit && e) {
    const { inherit: n, ...s } = t;
    return { ...e, ...s };
  }
  return t;
}
function ys(t, e) {
  const n = t?.[e] ?? t?.default ?? t;
  return n !== t ? Xi(n, t) : n;
}
function Ec({
  when: t,
  delay: e,
  delayChildren: n,
  staggerChildren: s,
  staggerDirection: o,
  repeat: r,
  repeatType: i,
  repeatDelay: a,
  from: c,
  elapsed: u,
  ...d
}) {
  return !!Object.keys(d).length;
}
const gs =
  (t, e, n, s = {}, o, r) =>
  (i) => {
    const a = ys(s, t) || {},
      c = a.delay || s.delay || 0;
    let { elapsed: u = 0 } = s;
    u = u - Tt(c);
    const d = {
      keyframes: Array.isArray(n) ? n : [null, n],
      ease: "easeOut",
      velocity: e.getVelocity(),
      ...a,
      delay: -u,
      onUpdate: (h) => {
        (e.set(h), a.onUpdate && a.onUpdate(h));
      },
      onComplete: () => {
        (i(), a.onComplete && a.onComplete());
      },
      name: t,
      motionValue: e,
      element: r ? void 0 : o,
    };
    (Ec(a) || Object.assign(d, Pc(t, d)),
      d.duration && (d.duration = Tt(d.duration)),
      d.repeatDelay && (d.repeatDelay = Tt(d.repeatDelay)),
      d.from !== void 0 && (d.keyframes[0] = d.from));
    let l = !1;
    if (
      ((d.type === !1 || (d.duration === 0 && !d.repeatDelay)) &&
        (zn(d), d.delay === 0 && (l = !0)),
      (Rt.instantAnimations || Rt.skipAnimations || o?.shouldSkipAnimations) &&
        ((l = !0), zn(d), (d.delay = 0)),
      (d.allowFlatten = !a.type && !a.ease),
      l && !r && e.get() !== void 0)
    ) {
      const h = Cc(d.keyframes, a);
      if (h !== void 0) {
        O.update(() => {
          (d.onUpdate(h), d.onComplete());
        });
        return;
      }
    }
    return a.isSync ? new ps(d) : new bc(d);
  };
function no(t) {
  const e = [{}, {}];
  return (
    t?.values.forEach((n, s) => {
      ((e[0][s] = n.get()), (e[1][s] = n.getVelocity()));
    }),
    e
  );
}
function vs(t, e, n, s) {
  if (typeof e == "function") {
    const [o, r] = no(s);
    e = e(n !== void 0 ? n : t.custom, o, r);
  }
  if (
    (typeof e == "string" && (e = t.variants && t.variants[e]),
    typeof e == "function")
  ) {
    const [o, r] = no(s);
    e = e(n !== void 0 ? n : t.custom, o, r);
  }
  return e;
}
function ie(t, e, n) {
  const s = t.getProps();
  return vs(s, e, n !== void 0 ? n : s.custom, t);
}
const Zi = new Set([
    "width",
    "height",
    "top",
    "left",
    "right",
    "bottom",
    ...le,
  ]),
  so = 30,
  Vc = (t) => !isNaN(parseFloat(t));
class Dc {
  constructor(e, n = {}) {
    ((this.canTrackVelocity = null),
      (this.events = {}),
      (this.updateAndNotify = (s) => {
        const o = at.now();
        if (
          (this.updatedAt !== o && this.setPrevFrameValue(),
          (this.prev = this.current),
          this.setCurrent(s),
          this.current !== this.prev &&
            (this.events.change?.notify(this.current), this.dependents))
        )
          for (const r of this.dependents) r.dirty();
      }),
      (this.hasAnimated = !1),
      this.setCurrent(e),
      (this.owner = n.owner));
  }
  setCurrent(e) {
    ((this.current = e),
      (this.updatedAt = at.now()),
      this.canTrackVelocity === null &&
        e !== void 0 &&
        (this.canTrackVelocity = Vc(this.current)));
  }
  setPrevFrameValue(e = this.current) {
    ((this.prevFrameValue = e), (this.prevUpdatedAt = this.updatedAt));
  }
  onChange(e) {
    return this.on("change", e);
  }
  on(e, n) {
    this.events[e] || (this.events[e] = new os());
    const s = this.events[e].add(n);
    return e === "change"
      ? () => {
          (s(),
            O.read(() => {
              this.events.change.getSize() || this.stop();
            }));
        }
      : s;
  }
  clearListeners() {
    for (const e in this.events) this.events[e].clear();
  }
  attach(e, n) {
    ((this.passiveEffect = e), (this.stopPassiveEffect = n));
  }
  set(e) {
    this.passiveEffect
      ? this.passiveEffect(e, this.updateAndNotify)
      : this.updateAndNotify(e);
  }
  setWithVelocity(e, n, s) {
    (this.set(n),
      (this.prev = void 0),
      (this.prevFrameValue = e),
      (this.prevUpdatedAt = this.updatedAt - s));
  }
  jump(e, n = !0) {
    (this.updateAndNotify(e),
      (this.prev = e),
      (this.prevUpdatedAt = this.prevFrameValue = void 0),
      n && this.stop(),
      this.stopPassiveEffect && this.stopPassiveEffect());
  }
  dirty() {
    this.events.change?.notify(this.current);
  }
  addDependent(e) {
    (this.dependents || (this.dependents = new Set()), this.dependents.add(e));
  }
  removeDependent(e) {
    this.dependents && this.dependents.delete(e);
  }
  get() {
    return this.current;
  }
  getPrevious() {
    return this.prev;
  }
  getVelocity() {
    const e = at.now();
    if (
      !this.canTrackVelocity ||
      this.prevFrameValue === void 0 ||
      e - this.updatedAt > so
    )
      return 0;
    const n = Math.min(this.updatedAt - this.prevUpdatedAt, so);
    return gi(parseFloat(this.current) - parseFloat(this.prevFrameValue), n);
  }
  start(e) {
    return (
      this.stop(),
      new Promise((n) => {
        ((this.hasAnimated = !0),
          (this.animation = e(n)),
          this.events.animationStart && this.events.animationStart.notify());
      }).then(() => {
        (this.events.animationComplete &&
          this.events.animationComplete.notify(),
          this.clearAnimation());
      })
    );
  }
  stop() {
    (this.animation &&
      (this.animation.stop(),
      this.events.animationCancel && this.events.animationCancel.notify()),
      this.clearAnimation());
  }
  isAnimating() {
    return !!this.animation;
  }
  clearAnimation() {
    delete this.animation;
  }
  destroy() {
    (this.dependents?.clear(),
      this.events.destroy?.notify(),
      this.clearListeners(),
      this.stop(),
      this.stopPassiveEffect && this.stopPassiveEffect());
  }
}
function re(t, e) {
  return new Dc(t, e);
}
const $n = (t) => Array.isArray(t);
function Rc(t, e, n) {
  t.hasValue(e) ? t.getValue(e).set(n) : t.addValue(e, re(n));
}
function _c(t) {
  return $n(t) ? t[t.length - 1] || 0 : t;
}
function Lc(t, e) {
  const n = ie(t, e);
  let { transitionEnd: s = {}, transition: o = {}, ...r } = n || {};
  r = { ...r, ...s };
  for (const i in r) {
    const a = _c(r[i]);
    Rc(t, i, a);
  }
}
const ot = (t) => !!(t && t.getVelocity);
function Nc(t) {
  return !!(ot(t) && t.add);
}
function On(t, e) {
  const n = t.getValue("willChange");
  if (Nc(n)) return n.add(e);
  if (!n && Rt.WillChange) {
    const s = new Rt.WillChange("auto");
    (t.addValue("willChange", s), s.add(e));
  }
}
function bs(t) {
  return t.replace(/([A-Z])/g, (e) => `-${e.toLowerCase()}`);
}
const Ic = "framerAppearId",
  Ji = "data-" + bs(Ic);
function Qi(t) {
  return t.props[Ji];
}
function jc({ protectedKeys: t, needsAnimating: e }, n) {
  const s = t.hasOwnProperty(n) && e[n] !== !0;
  return ((e[n] = !1), s);
}
function tr(t, e, { delay: n = 0, transitionOverride: s, type: o } = {}) {
  let { transition: r, transitionEnd: i, ...a } = e;
  const c = t.getDefaultTransition();
  r = r ? Xi(r, c) : c;
  const u = r?.reduceMotion;
  s && (r = s);
  const d = [],
    l = o && t.animationState && t.animationState.getState()[o];
  for (const h in a) {
    const f = t.getValue(h, t.latestValues[h] ?? null),
      p = a[h];
    if (p === void 0 || (l && jc(l, h))) continue;
    const b = { delay: n, ...ys(r || {}, h) },
      g = f.get();
    if (
      g !== void 0 &&
      !f.isAnimating &&
      !Array.isArray(p) &&
      p === g &&
      !b.velocity
    )
      continue;
    let y = !1;
    if (window.MotionHandoffAnimation) {
      const E = Qi(t);
      if (E) {
        const S = window.MotionHandoffAnimation(E, h, O);
        S !== null && ((b.startTime = S), (y = !0));
      }
    }
    On(t, h);
    const k = u ?? t.shouldReduceMotion;
    f.start(gs(h, f, p, k && Zi.has(h) ? { type: !1 } : b, t, y));
    const x = f.animation;
    x && d.push(x);
  }
  if (i) {
    const h = () =>
      O.update(() => {
        i && Lc(t, i);
      });
    d.length ? Promise.all(d).then(h) : h();
  }
  return d;
}
function Hn(t, e, n = {}) {
  const s = ie(t, e, n.type === "exit" ? t.presenceContext?.custom : void 0);
  let { transition: o = t.getDefaultTransition() || {} } = s || {};
  n.transitionOverride && (o = n.transitionOverride);
  const r = s ? () => Promise.all(tr(t, s, n)) : () => Promise.resolve(),
    i =
      t.variantChildren && t.variantChildren.size
        ? (c = 0) => {
            const {
              delayChildren: u = 0,
              staggerChildren: d,
              staggerDirection: l,
            } = o;
            return Bc(t, e, c, u, d, l, n);
          }
        : () => Promise.resolve(),
    { when: a } = o;
  if (a) {
    const [c, u] = a === "beforeChildren" ? [r, i] : [i, r];
    return c().then(() => u());
  } else return Promise.all([r(), i(n.delay)]);
}
function Bc(t, e, n = 0, s = 0, o = 0, r = 1, i) {
  const a = [];
  for (const c of t.variantChildren)
    (c.notify("AnimationStart", e),
      a.push(
        Hn(c, e, {
          ...i,
          delay:
            n +
            (typeof s == "function" ? 0 : s) +
            qi(t.variantChildren, c, s, o, r),
        }).then(() => c.notify("AnimationComplete", e)),
      ));
  return Promise.all(a);
}
function Fc(t, e, n = {}) {
  t.notify("AnimationStart", e);
  let s;
  if (Array.isArray(e)) {
    const o = e.map((r) => Hn(t, r, n));
    s = Promise.all(o);
  } else if (typeof e == "string") s = Hn(t, e, n);
  else {
    const o = typeof e == "function" ? ie(t, e, n.custom) : e;
    s = Promise.all(tr(t, o, n));
  }
  return s.then(() => {
    t.notify("AnimationComplete", e);
  });
}
const zc = { test: (t) => t === "auto", parse: (t) => t },
  er = (t) => (e) => e.test(t),
  nr = [ae, C, Pt, jt, pl, fl, zc],
  oo = (t) => nr.find(er(t));
function $c(t) {
  return typeof t == "number"
    ? t === 0
    : t !== null
      ? t === "none" || t === "0" || yi(t)
      : !0;
}
const Oc = new Set(["brightness", "contrast", "saturate", "opacity"]);
function Hc(t) {
  const [e, n] = t.slice(0, -1).split("(");
  if (e === "drop-shadow") return t;
  const [s] = n.match(ls) || [];
  if (!s) return t;
  const o = n.replace(s, "");
  let r = Oc.has(e) ? 1 : 0;
  return (s !== n && (r *= 100), e + "(" + r + o + ")");
}
const Uc = /\b([a-z-]*)\(.*?\)/gu,
  Un = {
    ...zt,
    getAnimatableNone: (t) => {
      const e = t.match(Uc);
      return e ? e.map(Hc).join(" ") : t;
    },
  },
  io = { ...ae, transform: Math.round },
  Wc = {
    rotate: jt,
    rotateX: jt,
    rotateY: jt,
    rotateZ: jt,
    scale: Le,
    scaleX: Le,
    scaleY: Le,
    scaleZ: Le,
    skew: jt,
    skewX: jt,
    skewY: jt,
    distance: C,
    translateX: C,
    translateY: C,
    translateZ: C,
    x: C,
    y: C,
    z: C,
    perspective: C,
    transformPerspective: C,
    opacity: we,
    originX: Ws,
    originY: Ws,
    originZ: C,
  },
  xs = {
    borderWidth: C,
    borderTopWidth: C,
    borderRightWidth: C,
    borderBottomWidth: C,
    borderLeftWidth: C,
    borderRadius: C,
    borderTopLeftRadius: C,
    borderTopRightRadius: C,
    borderBottomRightRadius: C,
    borderBottomLeftRadius: C,
    width: C,
    maxWidth: C,
    height: C,
    maxHeight: C,
    top: C,
    right: C,
    bottom: C,
    left: C,
    inset: C,
    insetBlock: C,
    insetBlockStart: C,
    insetBlockEnd: C,
    insetInline: C,
    insetInlineStart: C,
    insetInlineEnd: C,
    padding: C,
    paddingTop: C,
    paddingRight: C,
    paddingBottom: C,
    paddingLeft: C,
    paddingBlock: C,
    paddingBlockStart: C,
    paddingBlockEnd: C,
    paddingInline: C,
    paddingInlineStart: C,
    paddingInlineEnd: C,
    margin: C,
    marginTop: C,
    marginRight: C,
    marginBottom: C,
    marginLeft: C,
    marginBlock: C,
    marginBlockStart: C,
    marginBlockEnd: C,
    marginInline: C,
    marginInlineStart: C,
    marginInlineEnd: C,
    fontSize: C,
    backgroundPositionX: C,
    backgroundPositionY: C,
    ...Wc,
    zIndex: io,
    fillOpacity: we,
    strokeOpacity: we,
    numOctaves: io,
  },
  Gc = {
    ...xs,
    color: K,
    backgroundColor: K,
    outlineColor: K,
    fill: K,
    stroke: K,
    borderColor: K,
    borderTopColor: K,
    borderRightColor: K,
    borderBottomColor: K,
    borderLeftColor: K,
    filter: Un,
    WebkitFilter: Un,
  },
  sr = (t) => Gc[t];
function or(t, e) {
  let n = sr(t);
  return (
    n !== Un && (n = zt),
    n.getAnimatableNone ? n.getAnimatableNone(e) : void 0
  );
}
const Kc = new Set(["auto", "none", "0"]);
function qc(t, e, n) {
  let s = 0,
    o;
  for (; s < t.length && !o; ) {
    const r = t[s];
    (typeof r == "string" && !Kc.has(r) && ke(r).values.length && (o = t[s]),
      s++);
  }
  if (o && n) for (const r of e) t[r] = or(n, o);
}
class Yc extends ms {
  constructor(e, n, s, o, r) {
    super(e, n, s, o, r, !0);
  }
  readKeyframes() {
    const { unresolvedKeyframes: e, element: n, name: s } = this;
    if (!n || !n.current) return;
    super.readKeyframes();
    for (let d = 0; d < e.length; d++) {
      let l = e[d];
      if (typeof l == "string" && ((l = l.trim()), as(l))) {
        const h = Yi(l, n.current);
        (h !== void 0 && (e[d] = h),
          d === e.length - 1 && (this.finalKeyframe = l));
      }
    }
    if ((this.resolveNoneKeyframes(), !Zi.has(s) || e.length !== 2)) return;
    const [o, r] = e,
      i = oo(o),
      a = oo(r),
      c = Us(o),
      u = Us(r);
    if (c !== u && Bt[s]) {
      this.needsMeasurement = !0;
      return;
    }
    if (i !== a)
      if (Qs(i) && Qs(a))
        for (let d = 0; d < e.length; d++) {
          const l = e[d];
          typeof l == "string" && (e[d] = parseFloat(l));
        }
      else Bt[s] && (this.needsMeasurement = !0);
  }
  resolveNoneKeyframes() {
    const { unresolvedKeyframes: e, name: n } = this,
      s = [];
    for (let o = 0; o < e.length; o++) (e[o] === null || $c(e[o])) && s.push(o);
    s.length && qc(e, s, n);
  }
  measureInitialState() {
    const { element: e, unresolvedKeyframes: n, name: s } = this;
    if (!e || !e.current) return;
    (s === "height" && (this.suspendedScrollY = window.pageYOffset),
      (this.measuredOrigin = Bt[s](
        e.measureViewportBox(),
        window.getComputedStyle(e.current),
      )),
      (n[0] = this.measuredOrigin));
    const o = n[n.length - 1];
    o !== void 0 && e.getValue(s, o).jump(o, !1);
  }
  measureEndState() {
    const { element: e, name: n, unresolvedKeyframes: s } = this;
    if (!e || !e.current) return;
    const o = e.getValue(n);
    o && o.jump(this.measuredOrigin, !1);
    const r = s.length - 1,
      i = s[r];
    ((s[r] = Bt[n](e.measureViewportBox(), window.getComputedStyle(e.current))),
      i !== null && this.finalKeyframe === void 0 && (this.finalKeyframe = i),
      this.removedTransforms?.length &&
        this.removedTransforms.forEach(([a, c]) => {
          e.getValue(a).set(c);
        }),
      this.resolveNoneKeyframes());
  }
}
const Xc = new Set(["opacity", "clipPath", "filter", "transform"]);
function ir(t, e, n) {
  if (t == null) return [];
  if (t instanceof EventTarget) return [t];
  if (typeof t == "string") {
    let s = document;
    const o = n?.[t] ?? s.querySelectorAll(t);
    return o ? Array.from(o) : [];
  }
  return Array.from(t).filter((s) => s != null);
}
const rr = (t, e) => (e && typeof t == "number" ? e.transform(t) : t);
function Wn(t) {
  return mi(t) && "offsetHeight" in t;
}
const { schedule: ws } = Ci(queueMicrotask, !1),
  kt = { x: !1, y: !1 };
function ar() {
  return kt.x || kt.y;
}
function Zc(t) {
  return t === "x" || t === "y"
    ? kt[t]
      ? null
      : ((kt[t] = !0),
        () => {
          kt[t] = !1;
        })
    : kt.x || kt.y
      ? null
      : ((kt.x = kt.y = !0),
        () => {
          kt.x = kt.y = !1;
        });
}
function lr(t, e) {
  const n = ir(t),
    s = new AbortController(),
    o = { passive: !0, ...e, signal: s.signal };
  return [n, o, () => s.abort()];
}
function Jc(t) {
  return !(t.pointerType === "touch" || ar());
}
function Qc(t, e, n = {}) {
  const [s, o, r] = lr(t, n);
  return (
    s.forEach((i) => {
      let a = !1,
        c = !1,
        u;
      const d = () => {
          i.removeEventListener("pointerleave", p);
        },
        l = (g) => {
          (u && (u(g), (u = void 0)), d());
        },
        h = (g) => {
          ((a = !1),
            window.removeEventListener("pointerup", h),
            window.removeEventListener("pointercancel", h),
            c && ((c = !1), l(g)));
        },
        f = () => {
          ((a = !0),
            window.addEventListener("pointerup", h, o),
            window.addEventListener("pointercancel", h, o));
        },
        p = (g) => {
          if (g.pointerType !== "touch") {
            if (a) {
              c = !0;
              return;
            }
            l(g);
          }
        },
        b = (g) => {
          if (!Jc(g)) return;
          c = !1;
          const y = e(i, g);
          typeof y == "function" &&
            ((u = y), i.addEventListener("pointerleave", p, o));
        };
      (i.addEventListener("pointerenter", b, o),
        i.addEventListener("pointerdown", f, o));
    }),
    r
  );
}
const cr = (t, e) => (e ? (t === e ? !0 : cr(t, e.parentElement)) : !1),
  ks = (t) =>
    t.pointerType === "mouse"
      ? typeof t.button != "number" || t.button <= 0
      : t.isPrimary !== !1,
  tu = new Set(["BUTTON", "INPUT", "SELECT", "TEXTAREA", "A"]);
function eu(t) {
  return tu.has(t.tagName) || t.isContentEditable === !0;
}
const nu = new Set(["INPUT", "SELECT", "TEXTAREA"]);
function su(t) {
  return nu.has(t.tagName) || t.isContentEditable === !0;
}
const ze = new WeakSet();
function ro(t) {
  return (e) => {
    e.key === "Enter" && t(e);
  };
}
function mn(t, e) {
  t.dispatchEvent(
    new PointerEvent("pointer" + e, { isPrimary: !0, bubbles: !0 }),
  );
}
const ou = (t, e) => {
  const n = t.currentTarget;
  if (!n) return;
  const s = ro(() => {
    if (ze.has(n)) return;
    mn(n, "down");
    const o = ro(() => {
        mn(n, "up");
      }),
      r = () => mn(n, "cancel");
    (n.addEventListener("keyup", o, e), n.addEventListener("blur", r, e));
  });
  (n.addEventListener("keydown", s, e),
    n.addEventListener("blur", () => n.removeEventListener("keydown", s), e));
};
function ao(t) {
  return ks(t) && !ar();
}
const lo = new WeakSet();
function iu(t, e, n = {}) {
  const [s, o, r] = lr(t, n),
    i = (a) => {
      const c = a.currentTarget;
      if (!ao(a) || lo.has(a)) return;
      (ze.add(c), n.stopPropagation && lo.add(a));
      const u = e(c, a),
        d = (f, p) => {
          (window.removeEventListener("pointerup", l),
            window.removeEventListener("pointercancel", h),
            ze.has(c) && ze.delete(c),
            ao(f) && typeof u == "function" && u(f, { success: p }));
        },
        l = (f) => {
          d(
            f,
            c === window ||
              c === document ||
              n.useGlobalTarget ||
              cr(c, f.target),
          );
        },
        h = (f) => {
          d(f, !1);
        };
      (window.addEventListener("pointerup", l, o),
        window.addEventListener("pointercancel", h, o));
    };
  return (
    s.forEach((a) => {
      ((n.useGlobalTarget ? window : a).addEventListener("pointerdown", i, o),
        Wn(a) &&
          (a.addEventListener("focus", (u) => ou(u, o)),
          !eu(a) && !a.hasAttribute("tabindex") && (a.tabIndex = 0)));
    }),
    r
  );
}
function Ts(t) {
  return mi(t) && "ownerSVGElement" in t;
}
const $e = new WeakMap();
let Oe;
const ur = (t, e, n) => (s, o) =>
    o && o[0]
      ? o[0][t + "Size"]
      : Ts(s) && "getBBox" in s
        ? s.getBBox()[e]
        : s[n],
  ru = ur("inline", "width", "offsetWidth"),
  au = ur("block", "height", "offsetHeight");
function lu({ target: t, borderBoxSize: e }) {
  $e.get(t)?.forEach((n) => {
    n(t, {
      get width() {
        return ru(t, e);
      },
      get height() {
        return au(t, e);
      },
    });
  });
}
function cu(t) {
  t.forEach(lu);
}
function uu() {
  typeof ResizeObserver > "u" || (Oe = new ResizeObserver(cu));
}
function du(t, e) {
  Oe || uu();
  const n = ir(t);
  return (
    n.forEach((s) => {
      let o = $e.get(s);
      (o || ((o = new Set()), $e.set(s, o)), o.add(e), Oe?.observe(s));
    }),
    () => {
      n.forEach((s) => {
        const o = $e.get(s);
        (o?.delete(e), o?.size || Oe?.unobserve(s));
      });
    }
  );
}
const He = new Set();
let ee;
function hu() {
  ((ee = () => {
    const t = {
      get width() {
        return window.innerWidth;
      },
      get height() {
        return window.innerHeight;
      },
    };
    He.forEach((e) => e(t));
  }),
    window.addEventListener("resize", ee));
}
function fu(t) {
  return (
    He.add(t),
    ee || hu(),
    () => {
      (He.delete(t),
        !He.size &&
          typeof ee == "function" &&
          (window.removeEventListener("resize", ee), (ee = void 0)));
    }
  );
}
function co(t, e) {
  return typeof t == "function" ? fu(t) : du(t, e);
}
function pu(t) {
  return Ts(t) && t.tagName === "svg";
}
const mu = [...nr, K, zt],
  yu = (t) => mu.find(er(t)),
  uo = () => ({ translate: 0, scale: 1, origin: 0, originPoint: 0 }),
  ne = () => ({ x: uo(), y: uo() }),
  ho = () => ({ min: 0, max: 0 }),
  Y = () => ({ x: ho(), y: ho() }),
  gu = new WeakMap();
function nn(t) {
  return t !== null && typeof t == "object" && typeof t.start == "function";
}
function Te(t) {
  return typeof t == "string" || Array.isArray(t);
}
const Ms = [
    "animate",
    "whileInView",
    "whileFocus",
    "whileHover",
    "whileTap",
    "whileDrag",
    "exit",
  ],
  Ss = ["initial", ...Ms];
function sn(t) {
  return nn(t.animate) || Ss.some((e) => Te(t[e]));
}
function dr(t) {
  return !!(sn(t) || t.variants);
}
function vu(t, e, n) {
  for (const s in e) {
    const o = e[s],
      r = n[s];
    if (ot(o)) t.addValue(s, o);
    else if (ot(r)) t.addValue(s, re(o, { owner: t }));
    else if (r !== o)
      if (t.hasValue(s)) {
        const i = t.getValue(s);
        i.liveStyle === !0 ? i.jump(o) : i.hasAnimated || i.set(o);
      } else {
        const i = t.getStaticValue(s);
        t.addValue(s, re(i !== void 0 ? i : o, { owner: t }));
      }
  }
  for (const s in n) e[s] === void 0 && t.removeValue(s);
  return e;
}
const Gn = { current: null },
  hr = { current: !1 },
  bu = typeof window < "u";
function xu() {
  if (((hr.current = !0), !!bu))
    if (window.matchMedia) {
      const t = window.matchMedia("(prefers-reduced-motion)"),
        e = () => (Gn.current = t.matches);
      (t.addEventListener("change", e), e());
    } else Gn.current = !1;
}
const fo = [
  "AnimationStart",
  "AnimationComplete",
  "Update",
  "BeforeLayoutMeasure",
  "LayoutMeasure",
  "LayoutAnimationStart",
  "LayoutAnimationComplete",
];
let Xe = {};
function fr(t) {
  Xe = t;
}
function wu() {
  return Xe;
}
class ku {
  scrapeMotionValuesFromProps(e, n, s) {
    return {};
  }
  constructor(
    {
      parent: e,
      props: n,
      presenceContext: s,
      reducedMotionConfig: o,
      skipAnimations: r,
      blockInitialAnimation: i,
      visualState: a,
    },
    c = {},
  ) {
    ((this.current = null),
      (this.children = new Set()),
      (this.isVariantNode = !1),
      (this.isControllingVariants = !1),
      (this.shouldReduceMotion = null),
      (this.shouldSkipAnimations = !1),
      (this.values = new Map()),
      (this.KeyframeResolver = ms),
      (this.features = {}),
      (this.valueSubscriptions = new Map()),
      (this.prevMotionValues = {}),
      (this.hasBeenMounted = !1),
      (this.events = {}),
      (this.propEventSubscriptions = {}),
      (this.notifyUpdate = () => this.notify("Update", this.latestValues)),
      (this.render = () => {
        this.current &&
          (this.triggerBuild(),
          this.renderInstance(
            this.current,
            this.renderState,
            this.props.style,
            this.projection,
          ));
      }),
      (this.renderScheduledAt = 0),
      (this.scheduleRender = () => {
        const f = at.now();
        this.renderScheduledAt < f &&
          ((this.renderScheduledAt = f), O.render(this.render, !1, !0));
      }));
    const { latestValues: u, renderState: d } = a;
    ((this.latestValues = u),
      (this.baseTarget = { ...u }),
      (this.initialValues = n.initial ? { ...u } : {}),
      (this.renderState = d),
      (this.parent = e),
      (this.props = n),
      (this.presenceContext = s),
      (this.depth = e ? e.depth + 1 : 0),
      (this.reducedMotionConfig = o),
      (this.skipAnimationsConfig = r),
      (this.options = c),
      (this.blockInitialAnimation = !!i),
      (this.isControllingVariants = sn(n)),
      (this.isVariantNode = dr(n)),
      this.isVariantNode && (this.variantChildren = new Set()),
      (this.manuallyAnimateOnMount = !!(e && e.current)));
    const { willChange: l, ...h } = this.scrapeMotionValuesFromProps(
      n,
      {},
      this,
    );
    for (const f in h) {
      const p = h[f];
      u[f] !== void 0 && ot(p) && p.set(u[f]);
    }
  }
  mount(e) {
    if (this.hasBeenMounted)
      for (const n in this.initialValues)
        (this.values.get(n)?.jump(this.initialValues[n]),
          (this.latestValues[n] = this.initialValues[n]));
    ((this.current = e),
      gu.set(e, this),
      this.projection && !this.projection.instance && this.projection.mount(e),
      this.parent &&
        this.isVariantNode &&
        !this.isControllingVariants &&
        (this.removeFromVariantTree = this.parent.addVariantChild(this)),
      this.values.forEach((n, s) => this.bindToMotionValue(s, n)),
      this.reducedMotionConfig === "never"
        ? (this.shouldReduceMotion = !1)
        : this.reducedMotionConfig === "always"
          ? (this.shouldReduceMotion = !0)
          : (hr.current || xu(), (this.shouldReduceMotion = Gn.current)),
      (this.shouldSkipAnimations = this.skipAnimationsConfig ?? !1),
      this.parent?.addChild(this),
      this.update(this.props, this.presenceContext),
      (this.hasBeenMounted = !0));
  }
  unmount() {
    (this.projection && this.projection.unmount(),
      Ft(this.notifyUpdate),
      Ft(this.render),
      this.valueSubscriptions.forEach((e) => e()),
      this.valueSubscriptions.clear(),
      this.removeFromVariantTree && this.removeFromVariantTree(),
      this.parent?.removeChild(this));
    for (const e in this.events) this.events[e].clear();
    for (const e in this.features) {
      const n = this.features[e];
      n && (n.unmount(), (n.isMounted = !1));
    }
    this.current = null;
  }
  addChild(e) {
    (this.children.add(e),
      this.enteringChildren ?? (this.enteringChildren = new Set()),
      this.enteringChildren.add(e));
  }
  removeChild(e) {
    (this.children.delete(e),
      this.enteringChildren && this.enteringChildren.delete(e));
  }
  bindToMotionValue(e, n) {
    if (
      (this.valueSubscriptions.has(e) && this.valueSubscriptions.get(e)(),
      n.accelerate && Xc.has(e) && this.current instanceof HTMLElement)
    ) {
      const {
          factory: i,
          keyframes: a,
          times: c,
          ease: u,
          duration: d,
        } = n.accelerate,
        l = new Gi({
          element: this.current,
          name: e,
          keyframes: a,
          times: c,
          ease: u,
          duration: Tt(d),
        }),
        h = i(l);
      this.valueSubscriptions.set(e, () => {
        (h(), l.cancel());
      });
      return;
    }
    const s = ce.has(e);
    s && this.onBindTransform && this.onBindTransform();
    const o = n.on("change", (i) => {
      ((this.latestValues[e] = i),
        this.props.onUpdate && O.preRender(this.notifyUpdate),
        s && this.projection && (this.projection.isTransformDirty = !0),
        this.scheduleRender());
    });
    let r;
    (typeof window < "u" &&
      window.MotionCheckAppearSync &&
      (r = window.MotionCheckAppearSync(this, e, n)),
      this.valueSubscriptions.set(e, () => {
        (o(), r && r(), n.owner && n.stop());
      }));
  }
  sortNodePosition(e) {
    return !this.current ||
      !this.sortInstanceNodePosition ||
      this.type !== e.type
      ? 0
      : this.sortInstanceNodePosition(this.current, e.current);
  }
  updateFeatures() {
    let e = "animation";
    for (e in Xe) {
      const n = Xe[e];
      if (!n) continue;
      const { isEnabled: s, Feature: o } = n;
      if (
        (!this.features[e] &&
          o &&
          s(this.props) &&
          (this.features[e] = new o(this)),
        this.features[e])
      ) {
        const r = this.features[e];
        r.isMounted ? r.update() : (r.mount(), (r.isMounted = !0));
      }
    }
  }
  triggerBuild() {
    this.build(this.renderState, this.latestValues, this.props);
  }
  measureViewportBox() {
    return this.current
      ? this.measureInstanceViewportBox(this.current, this.props)
      : Y();
  }
  getStaticValue(e) {
    return this.latestValues[e];
  }
  setStaticValue(e, n) {
    this.latestValues[e] = n;
  }
  update(e, n) {
    ((e.transformTemplate || this.props.transformTemplate) &&
      this.scheduleRender(),
      (this.prevProps = this.props),
      (this.props = e),
      (this.prevPresenceContext = this.presenceContext),
      (this.presenceContext = n));
    for (let s = 0; s < fo.length; s++) {
      const o = fo[s];
      this.propEventSubscriptions[o] &&
        (this.propEventSubscriptions[o](),
        delete this.propEventSubscriptions[o]);
      const r = "on" + o,
        i = e[r];
      i && (this.propEventSubscriptions[o] = this.on(o, i));
    }
    ((this.prevMotionValues = vu(
      this,
      this.scrapeMotionValuesFromProps(e, this.prevProps || {}, this),
      this.prevMotionValues,
    )),
      this.handleChildMotionValue && this.handleChildMotionValue());
  }
  getProps() {
    return this.props;
  }
  getVariant(e) {
    return this.props.variants ? this.props.variants[e] : void 0;
  }
  getDefaultTransition() {
    return this.props.transition;
  }
  getTransformPagePoint() {
    return this.props.transformPagePoint;
  }
  getClosestVariantNode() {
    return this.isVariantNode
      ? this
      : this.parent
        ? this.parent.getClosestVariantNode()
        : void 0;
  }
  addVariantChild(e) {
    const n = this.getClosestVariantNode();
    if (n)
      return (
        n.variantChildren && n.variantChildren.add(e),
        () => n.variantChildren.delete(e)
      );
  }
  addValue(e, n) {
    const s = this.values.get(e);
    n !== s &&
      (s && this.removeValue(e),
      this.bindToMotionValue(e, n),
      this.values.set(e, n),
      (this.latestValues[e] = n.get()));
  }
  removeValue(e) {
    this.values.delete(e);
    const n = this.valueSubscriptions.get(e);
    (n && (n(), this.valueSubscriptions.delete(e)),
      delete this.latestValues[e],
      this.removeValueFromRenderState(e, this.renderState));
  }
  hasValue(e) {
    return this.values.has(e);
  }
  getValue(e, n) {
    if (this.props.values && this.props.values[e]) return this.props.values[e];
    let s = this.values.get(e);
    return (
      s === void 0 &&
        n !== void 0 &&
        ((s = re(n === null ? void 0 : n, { owner: this })),
        this.addValue(e, s)),
      s
    );
  }
  readValue(e, n) {
    let s =
      this.latestValues[e] !== void 0 || !this.current
        ? this.latestValues[e]
        : (this.getBaseTargetFromProps(this.props, e) ??
          this.readValueFromInstance(this.current, e, this.options));
    return (
      s != null &&
        (typeof s == "string" && (pi(s) || yi(s))
          ? (s = parseFloat(s))
          : !yu(s) && zt.test(n) && (s = or(e, n)),
        this.setBaseTarget(e, ot(s) ? s.get() : s)),
      ot(s) ? s.get() : s
    );
  }
  setBaseTarget(e, n) {
    this.baseTarget[e] = n;
  }
  getBaseTarget(e) {
    const { initial: n } = this.props;
    let s;
    if (typeof n == "string" || typeof n == "object") {
      const r = vs(this.props, n, this.presenceContext?.custom);
      r && (s = r[e]);
    }
    if (n && s !== void 0) return s;
    const o = this.getBaseTargetFromProps(this.props, e);
    return o !== void 0 && !ot(o)
      ? o
      : this.initialValues[e] !== void 0 && s === void 0
        ? void 0
        : this.baseTarget[e];
  }
  on(e, n) {
    return (
      this.events[e] || (this.events[e] = new os()),
      this.events[e].add(n)
    );
  }
  notify(e, ...n) {
    this.events[e] && this.events[e].notify(...n);
  }
  scheduleRenderMicrotask() {
    ws.render(this.render);
  }
}
class pr extends ku {
  constructor() {
    (super(...arguments), (this.KeyframeResolver = Yc));
  }
  sortInstanceNodePosition(e, n) {
    return e.compareDocumentPosition(n) & 2 ? 1 : -1;
  }
  getBaseTargetFromProps(e, n) {
    const s = e.style;
    return s ? s[n] : void 0;
  }
  removeValueFromRenderState(e, { vars: n, style: s }) {
    (delete n[e], delete s[e]);
  }
  handleChildMotionValue() {
    this.childSubscription &&
      (this.childSubscription(), delete this.childSubscription);
    const { children: e } = this.props;
    ot(e) &&
      (this.childSubscription = e.on("change", (n) => {
        this.current && (this.current.textContent = `${n}`);
      }));
  }
}
class $t {
  constructor(e) {
    ((this.isMounted = !1), (this.node = e));
  }
  update() {}
}
function mr({ top: t, left: e, right: n, bottom: s }) {
  return { x: { min: e, max: n }, y: { min: t, max: s } };
}
function Tu({ x: t, y: e }) {
  return { top: e.min, right: t.max, bottom: e.max, left: t.min };
}
function Mu(t, e) {
  if (!e) return t;
  const n = e({ x: t.left, y: t.top }),
    s = e({ x: t.right, y: t.bottom });
  return { top: n.y, left: n.x, bottom: s.y, right: s.x };
}
function yn(t) {
  return t === void 0 || t === 1;
}
function Kn({ scale: t, scaleX: e, scaleY: n }) {
  return !yn(t) || !yn(e) || !yn(n);
}
function Wt(t) {
  return (
    Kn(t) ||
    yr(t) ||
    t.z ||
    t.rotate ||
    t.rotateX ||
    t.rotateY ||
    t.skewX ||
    t.skewY
  );
}
function yr(t) {
  return po(t.x) || po(t.y);
}
function po(t) {
  return t && t !== "0%";
}
function Ze(t, e, n) {
  const s = t - n,
    o = e * s;
  return n + o;
}
function mo(t, e, n, s, o) {
  return (o !== void 0 && (t = Ze(t, o, s)), Ze(t, n, s) + e);
}
function qn(t, e = 0, n = 1, s, o) {
  ((t.min = mo(t.min, e, n, s, o)), (t.max = mo(t.max, e, n, s, o)));
}
function gr(t, { x: e, y: n }) {
  (qn(t.x, e.translate, e.scale, e.originPoint),
    qn(t.y, n.translate, n.scale, n.originPoint));
}
const yo = 0.999999999999,
  go = 1.0000000000001;
function Su(t, e, n, s = !1) {
  const o = n.length;
  if (!o) return;
  e.x = e.y = 1;
  let r, i;
  for (let a = 0; a < o; a++) {
    ((r = n[a]), (i = r.projectionDelta));
    const { visualElement: c } = r.options;
    (c && c.props.style && c.props.style.display === "contents") ||
      (s &&
        r.options.layoutScroll &&
        r.scroll &&
        r !== r.root &&
        oe(t, { x: -r.scroll.offset.x, y: -r.scroll.offset.y }),
      i && ((e.x *= i.x.scale), (e.y *= i.y.scale), gr(t, i)),
      s && Wt(r.latestValues) && oe(t, r.latestValues));
  }
  (e.x < go && e.x > yo && (e.x = 1), e.y < go && e.y > yo && (e.y = 1));
}
function se(t, e) {
  ((t.min = t.min + e), (t.max = t.max + e));
}
function vo(t, e, n, s, o = 0.5) {
  const r = U(t.min, t.max, o);
  qn(t, e, n, r, s);
}
function oe(t, e) {
  (vo(t.x, e.x, e.scaleX, e.scale, e.originX),
    vo(t.y, e.y, e.scaleY, e.scale, e.originY));
}
function vr(t, e) {
  return mr(Mu(t.getBoundingClientRect(), e));
}
function Pu(t, e, n) {
  const s = vr(t, n),
    { scroll: o } = e;
  return (o && (se(s.x, o.offset.x), se(s.y, o.offset.y)), s);
}
const Au = {
    x: "translateX",
    y: "translateY",
    z: "translateZ",
    transformPerspective: "perspective",
  },
  Cu = le.length;
function Eu(t, e, n) {
  let s = "",
    o = !0;
  for (let r = 0; r < Cu; r++) {
    const i = le[r],
      a = t[i];
    if (a === void 0) continue;
    let c = !0;
    if (typeof a == "number") c = a === (i.startsWith("scale") ? 1 : 0);
    else {
      const u = parseFloat(a);
      c = i.startsWith("scale") ? u === 1 : u === 0;
    }
    if (!c || n) {
      const u = rr(a, xs[i]);
      if (!c) {
        o = !1;
        const d = Au[i] || i;
        s += `${d}(${u}) `;
      }
      n && (e[i] = u);
    }
  }
  return ((s = s.trim()), n ? (s = n(e, o ? "" : s)) : o && (s = "none"), s);
}
function Ps(t, e, n) {
  const { style: s, vars: o, transformOrigin: r } = t;
  let i = !1,
    a = !1;
  for (const c in e) {
    const u = e[c];
    if (ce.has(c)) {
      i = !0;
      continue;
    } else if (Vi(c)) {
      o[c] = u;
      continue;
    } else {
      const d = rr(u, xs[c]);
      c.startsWith("origin") ? ((a = !0), (r[c] = d)) : (s[c] = d);
    }
  }
  if (
    (e.transform ||
      (i || n
        ? (s.transform = Eu(e, t.transform, n))
        : s.transform && (s.transform = "none")),
    a)
  ) {
    const { originX: c = "50%", originY: u = "50%", originZ: d = 0 } = r;
    s.transformOrigin = `${c} ${u} ${d}`;
  }
}
function br(t, { style: e, vars: n }, s, o) {
  const r = t.style;
  let i;
  for (i in e) r[i] = e[i];
  o?.applyProjectionStyles(r, s);
  for (i in n) r.setProperty(i, n[i]);
}
function bo(t, e) {
  return e.max === e.min ? 0 : (t / (e.max - e.min)) * 100;
}
const fe = {
    correct: (t, e) => {
      if (!e.target) return t;
      if (typeof t == "string")
        if (C.test(t)) t = parseFloat(t);
        else return t;
      const n = bo(t, e.target.x),
        s = bo(t, e.target.y);
      return `${n}% ${s}%`;
    },
  },
  Vu = {
    correct: (t, { treeScale: e, projectionDelta: n }) => {
      const s = t,
        o = zt.parse(t);
      if (o.length > 5) return s;
      const r = zt.createTransformer(t),
        i = typeof o[0] != "number" ? 1 : 0,
        a = n.x.scale * e.x,
        c = n.y.scale * e.y;
      ((o[0 + i] /= a), (o[1 + i] /= c));
      const u = U(a, c, 0.5);
      return (
        typeof o[2 + i] == "number" && (o[2 + i] /= u),
        typeof o[3 + i] == "number" && (o[3 + i] /= u),
        r(o)
      );
    },
  },
  Yn = {
    borderRadius: {
      ...fe,
      applyTo: [
        "borderTopLeftRadius",
        "borderTopRightRadius",
        "borderBottomLeftRadius",
        "borderBottomRightRadius",
      ],
    },
    borderTopLeftRadius: fe,
    borderTopRightRadius: fe,
    borderBottomLeftRadius: fe,
    borderBottomRightRadius: fe,
    boxShadow: Vu,
  };
function xr(t, { layout: e, layoutId: n }) {
  return (
    ce.has(t) ||
    t.startsWith("origin") ||
    ((e || n !== void 0) && (!!Yn[t] || t === "opacity"))
  );
}
function As(t, e, n) {
  const s = t.style,
    o = e?.style,
    r = {};
  if (!s) return r;
  for (const i in s)
    (ot(s[i]) ||
      (o && ot(o[i])) ||
      xr(i, t) ||
      n?.getValue(i)?.liveStyle !== void 0) &&
      (r[i] = s[i]);
  return r;
}
function Du(t) {
  return window.getComputedStyle(t);
}
class Ru extends pr {
  constructor() {
    (super(...arguments), (this.type = "html"), (this.renderInstance = br));
  }
  readValueFromInstance(e, n) {
    if (ce.has(n)) return this.projection?.isProjecting ? Nn(n) : Zl(e, n);
    {
      const s = Du(e),
        o = (Vi(n) ? s.getPropertyValue(n) : s[n]) || 0;
      return typeof o == "string" ? o.trim() : o;
    }
  }
  measureInstanceViewportBox(e, { transformPagePoint: n }) {
    return vr(e, n);
  }
  build(e, n, s) {
    Ps(e, n, s.transformTemplate);
  }
  scrapeMotionValuesFromProps(e, n, s) {
    return As(e, n, s);
  }
}
const _u = { offset: "stroke-dashoffset", array: "stroke-dasharray" },
  Lu = { offset: "strokeDashoffset", array: "strokeDasharray" };
function Nu(t, e, n = 1, s = 0, o = !0) {
  t.pathLength = 1;
  const r = o ? _u : Lu;
  ((t[r.offset] = `${-s}`), (t[r.array] = `${e} ${n}`));
}
const Iu = ["offsetDistance", "offsetPath", "offsetRotate", "offsetAnchor"];
function wr(
  t,
  {
    attrX: e,
    attrY: n,
    attrScale: s,
    pathLength: o,
    pathSpacing: r = 1,
    pathOffset: i = 0,
    ...a
  },
  c,
  u,
  d,
) {
  if ((Ps(t, a, u), c)) {
    t.style.viewBox && (t.attrs.viewBox = t.style.viewBox);
    return;
  }
  ((t.attrs = t.style), (t.style = {}));
  const { attrs: l, style: h } = t;
  (l.transform && ((h.transform = l.transform), delete l.transform),
    (h.transform || l.transformOrigin) &&
      ((h.transformOrigin = l.transformOrigin ?? "50% 50%"),
      delete l.transformOrigin),
    h.transform &&
      ((h.transformBox = d?.transformBox ?? "fill-box"),
      delete l.transformBox));
  for (const f of Iu) l[f] !== void 0 && ((h[f] = l[f]), delete l[f]);
  (e !== void 0 && (l.x = e),
    n !== void 0 && (l.y = n),
    s !== void 0 && (l.scale = s),
    o !== void 0 && Nu(l, o, r, i, !1));
}
const kr = new Set([
    "baseFrequency",
    "diffuseConstant",
    "kernelMatrix",
    "kernelUnitLength",
    "keySplines",
    "keyTimes",
    "limitingConeAngle",
    "markerHeight",
    "markerWidth",
    "numOctaves",
    "targetX",
    "targetY",
    "surfaceScale",
    "specularConstant",
    "specularExponent",
    "stdDeviation",
    "tableValues",
    "viewBox",
    "gradientTransform",
    "pathLength",
    "startOffset",
    "textLength",
    "lengthAdjust",
  ]),
  Tr = (t) => typeof t == "string" && t.toLowerCase() === "svg";
function ju(t, e, n, s) {
  br(t, e, void 0, s);
  for (const o in e.attrs) t.setAttribute(kr.has(o) ? o : bs(o), e.attrs[o]);
}
function Mr(t, e, n) {
  const s = As(t, e, n);
  for (const o in t)
    if (ot(t[o]) || ot(e[o])) {
      const r =
        le.indexOf(o) !== -1
          ? "attr" + o.charAt(0).toUpperCase() + o.substring(1)
          : o;
      s[r] = t[o];
    }
  return s;
}
class Bu extends pr {
  constructor() {
    (super(...arguments),
      (this.type = "svg"),
      (this.isSVGTag = !1),
      (this.measureInstanceViewportBox = Y));
  }
  getBaseTargetFromProps(e, n) {
    return e[n];
  }
  readValueFromInstance(e, n) {
    if (ce.has(n)) {
      const s = sr(n);
      return (s && s.default) || 0;
    }
    return ((n = kr.has(n) ? n : bs(n)), e.getAttribute(n));
  }
  scrapeMotionValuesFromProps(e, n, s) {
    return Mr(e, n, s);
  }
  build(e, n, s) {
    wr(e, n, this.isSVGTag, s.transformTemplate, s.style);
  }
  renderInstance(e, n, s, o) {
    ju(e, n, s, o);
  }
  mount(e) {
    ((this.isSVGTag = Tr(e.tagName)), super.mount(e));
  }
}
const Fu = Ss.length;
function Sr(t) {
  if (!t) return;
  if (!t.isControllingVariants) {
    const n = t.parent ? Sr(t.parent) || {} : {};
    return (t.props.initial !== void 0 && (n.initial = t.props.initial), n);
  }
  const e = {};
  for (let n = 0; n < Fu; n++) {
    const s = Ss[n],
      o = t.props[s];
    (Te(o) || o === !1) && (e[s] = o);
  }
  return e;
}
function Pr(t, e) {
  if (!Array.isArray(e)) return !1;
  const n = e.length;
  if (n !== t.length) return !1;
  for (let s = 0; s < n; s++) if (e[s] !== t[s]) return !1;
  return !0;
}
const zu = [...Ms].reverse(),
  $u = Ms.length;
function Ou(t) {
  return (e) =>
    Promise.all(e.map(({ animation: n, options: s }) => Fc(t, n, s)));
}
function Hu(t) {
  let e = Ou(t),
    n = xo(),
    s = !0;
  const o = (c) => (u, d) => {
    const l = ie(t, d, c === "exit" ? t.presenceContext?.custom : void 0);
    if (l) {
      const { transition: h, transitionEnd: f, ...p } = l;
      u = { ...u, ...p, ...f };
    }
    return u;
  };
  function r(c) {
    e = c(t);
  }
  function i(c) {
    const { props: u } = t,
      d = Sr(t.parent) || {},
      l = [],
      h = new Set();
    let f = {},
      p = 1 / 0;
    for (let g = 0; g < $u; g++) {
      const y = zu[g],
        k = n[y],
        x = u[y] !== void 0 ? u[y] : d[y],
        E = Te(x),
        S = y === c ? k.isActive : null;
      S === !1 && (p = g);
      let D = x === d[y] && x !== u[y] && E;
      if (
        (D && s && t.manuallyAnimateOnMount && (D = !1),
        (k.protectedKeys = { ...f }),
        (!k.isActive && S === null) ||
          (!x && !k.prevProp) ||
          nn(x) ||
          typeof x == "boolean")
      )
        continue;
      if (y === "exit" && k.isActive && S !== !0) {
        k.prevResolvedValues && (f = { ...f, ...k.prevResolvedValues });
        continue;
      }
      const B = Uu(k.prevProp, x);
      let v = B || (y === c && k.isActive && !D && E) || (g > p && E),
        R = !1;
      const F = Array.isArray(x) ? x : [x];
      let J = F.reduce(o(y), {});
      S === !1 && (J = {});
      const { prevResolvedValues: nt = {} } = k,
        Q = { ...nt, ...J },
        yt = (_) => {
          ((v = !0),
            h.has(_) && ((R = !0), h.delete(_)),
            (k.needsAnimating[_] = !0));
          const M = t.getValue(_);
          M && (M.liveStyle = !1);
        };
      for (const _ in Q) {
        const M = J[_],
          X = nt[_];
        if (f.hasOwnProperty(_)) continue;
        let G = !1;
        ($n(M) && $n(X) ? (G = !Pr(M, X)) : (G = M !== X),
          G
            ? M != null
              ? yt(_)
              : h.add(_)
            : M !== void 0 && h.has(_)
              ? yt(_)
              : (k.protectedKeys[_] = !0));
      }
      ((k.prevProp = x),
        (k.prevResolvedValues = J),
        k.isActive && (f = { ...f, ...J }),
        s && t.blockInitialAnimation && (v = !1));
      const it = D && B;
      v &&
        (!it || R) &&
        l.push(
          ...F.map((_) => {
            const M = { type: y };
            if (
              typeof _ == "string" &&
              s &&
              !it &&
              t.manuallyAnimateOnMount &&
              t.parent
            ) {
              const { parent: X } = t,
                G = ie(X, _);
              if (X.enteringChildren && G) {
                const { delayChildren: ht } = G.transition || {};
                M.delay = qi(X.enteringChildren, t, ht);
              }
            }
            return { animation: _, options: M };
          }),
        );
    }
    if (h.size) {
      const g = {};
      if (typeof u.initial != "boolean") {
        const y = ie(t, Array.isArray(u.initial) ? u.initial[0] : u.initial);
        y && y.transition && (g.transition = y.transition);
      }
      (h.forEach((y) => {
        const k = t.getBaseTarget(y),
          x = t.getValue(y);
        (x && (x.liveStyle = !0), (g[y] = k ?? null));
      }),
        l.push({ animation: g }));
    }
    let b = !!l.length;
    return (
      s &&
        (u.initial === !1 || u.initial === u.animate) &&
        !t.manuallyAnimateOnMount &&
        (b = !1),
      (s = !1),
      b ? e(l) : Promise.resolve()
    );
  }
  function a(c, u) {
    if (n[c].isActive === u) return Promise.resolve();
    (t.variantChildren?.forEach((l) => l.animationState?.setActive(c, u)),
      (n[c].isActive = u));
    const d = i(c);
    for (const l in n) n[l].protectedKeys = {};
    return d;
  }
  return {
    animateChanges: i,
    setActive: a,
    setAnimateFunction: r,
    getState: () => n,
    reset: () => {
      n = xo();
    },
  };
}
function Uu(t, e) {
  return typeof e == "string" ? e !== t : Array.isArray(e) ? !Pr(e, t) : !1;
}
function Ht(t = !1) {
  return {
    isActive: t,
    protectedKeys: {},
    needsAnimating: {},
    prevResolvedValues: {},
  };
}
function xo() {
  return {
    animate: Ht(!0),
    whileInView: Ht(),
    whileHover: Ht(),
    whileTap: Ht(),
    whileDrag: Ht(),
    whileFocus: Ht(),
    exit: Ht(),
  };
}
function wo(t, e) {
  ((t.min = e.min), (t.max = e.max));
}
function wt(t, e) {
  (wo(t.x, e.x), wo(t.y, e.y));
}
function ko(t, e) {
  ((t.translate = e.translate),
    (t.scale = e.scale),
    (t.originPoint = e.originPoint),
    (t.origin = e.origin));
}
const Ar = 1e-4,
  Wu = 1 - Ar,
  Gu = 1 + Ar,
  Cr = 0.01,
  Ku = 0 - Cr,
  qu = 0 + Cr;
function lt(t) {
  return t.max - t.min;
}
function Yu(t, e, n) {
  return Math.abs(t - e) <= n;
}
function To(t, e, n, s = 0.5) {
  ((t.origin = s),
    (t.originPoint = U(e.min, e.max, t.origin)),
    (t.scale = lt(n) / lt(e)),
    (t.translate = U(n.min, n.max, t.origin) - t.originPoint),
    ((t.scale >= Wu && t.scale <= Gu) || isNaN(t.scale)) && (t.scale = 1),
    ((t.translate >= Ku && t.translate <= qu) || isNaN(t.translate)) &&
      (t.translate = 0));
}
function ve(t, e, n, s) {
  (To(t.x, e.x, n.x, s ? s.originX : void 0),
    To(t.y, e.y, n.y, s ? s.originY : void 0));
}
function Mo(t, e, n) {
  ((t.min = n.min + e.min), (t.max = t.min + lt(e)));
}
function Xu(t, e, n) {
  (Mo(t.x, e.x, n.x), Mo(t.y, e.y, n.y));
}
function So(t, e, n) {
  ((t.min = e.min - n.min), (t.max = t.min + lt(e)));
}
function Je(t, e, n) {
  (So(t.x, e.x, n.x), So(t.y, e.y, n.y));
}
function Po(t, e, n, s, o) {
  return (
    (t -= e),
    (t = Ze(t, 1 / n, s)),
    o !== void 0 && (t = Ze(t, 1 / o, s)),
    t
  );
}
function Zu(t, e = 0, n = 1, s = 0.5, o, r = t, i = t) {
  if (
    (Pt.test(e) &&
      ((e = parseFloat(e)), (e = U(i.min, i.max, e / 100) - i.min)),
    typeof e != "number")
  )
    return;
  let a = U(r.min, r.max, s);
  (t === r && (a -= e),
    (t.min = Po(t.min, e, n, a, o)),
    (t.max = Po(t.max, e, n, a, o)));
}
function Ao(t, e, [n, s, o], r, i) {
  Zu(t, e[n], e[s], e[o], e.scale, r, i);
}
const Ju = ["x", "scaleX", "originX"],
  Qu = ["y", "scaleY", "originY"];
function Co(t, e, n, s) {
  (Ao(t.x, e, Ju, n ? n.x : void 0, s ? s.x : void 0),
    Ao(t.y, e, Qu, n ? n.y : void 0, s ? s.y : void 0));
}
function Eo(t) {
  return t.translate === 0 && t.scale === 1;
}
function Er(t) {
  return Eo(t.x) && Eo(t.y);
}
function Vo(t, e) {
  return t.min === e.min && t.max === e.max;
}
function td(t, e) {
  return Vo(t.x, e.x) && Vo(t.y, e.y);
}
function Do(t, e) {
  return (
    Math.round(t.min) === Math.round(e.min) &&
    Math.round(t.max) === Math.round(e.max)
  );
}
function Vr(t, e) {
  return Do(t.x, e.x) && Do(t.y, e.y);
}
function Ro(t) {
  return lt(t.x) / lt(t.y);
}
function _o(t, e) {
  return (
    t.translate === e.translate &&
    t.scale === e.scale &&
    t.originPoint === e.originPoint
  );
}
function St(t) {
  return [t("x"), t("y")];
}
function ed(t, e, n) {
  let s = "";
  const o = t.x.translate / e.x,
    r = t.y.translate / e.y,
    i = n?.z || 0;
  if (
    ((o || r || i) && (s = `translate3d(${o}px, ${r}px, ${i}px) `),
    (e.x !== 1 || e.y !== 1) && (s += `scale(${1 / e.x}, ${1 / e.y}) `),
    n)
  ) {
    const {
      transformPerspective: u,
      rotate: d,
      rotateX: l,
      rotateY: h,
      skewX: f,
      skewY: p,
    } = n;
    (u && (s = `perspective(${u}px) ${s}`),
      d && (s += `rotate(${d}deg) `),
      l && (s += `rotateX(${l}deg) `),
      h && (s += `rotateY(${h}deg) `),
      f && (s += `skewX(${f}deg) `),
      p && (s += `skewY(${p}deg) `));
  }
  const a = t.x.scale * e.x,
    c = t.y.scale * e.y;
  return ((a !== 1 || c !== 1) && (s += `scale(${a}, ${c})`), s || "none");
}
const Dr = ["TopLeft", "TopRight", "BottomLeft", "BottomRight"],
  nd = Dr.length,
  Lo = (t) => (typeof t == "string" ? parseFloat(t) : t),
  No = (t) => typeof t == "number" || C.test(t);
function sd(t, e, n, s, o, r) {
  o
    ? ((t.opacity = U(0, n.opacity ?? 1, od(s))),
      (t.opacityExit = U(e.opacity ?? 1, 0, id(s))))
    : r && (t.opacity = U(e.opacity ?? 1, n.opacity ?? 1, s));
  for (let i = 0; i < nd; i++) {
    const a = `border${Dr[i]}Radius`;
    let c = Io(e, a),
      u = Io(n, a);
    if (c === void 0 && u === void 0) continue;
    (c || (c = 0),
      u || (u = 0),
      c === 0 || u === 0 || No(c) === No(u)
        ? ((t[a] = Math.max(U(Lo(c), Lo(u), s), 0)),
          (Pt.test(u) || Pt.test(c)) && (t[a] += "%"))
        : (t[a] = u));
  }
  (e.rotate || n.rotate) && (t.rotate = U(e.rotate || 0, n.rotate || 0, s));
}
function Io(t, e) {
  return t[e] !== void 0 ? t[e] : t.borderRadius;
}
const od = Rr(0, 0.5, Mi),
  id = Rr(0.5, 0.95, mt);
function Rr(t, e, n) {
  return (s) => (s < t ? 0 : s > e ? 1 : n(xe(t, e, s)));
}
function rd(t, e, n) {
  const s = ot(t) ? t : re(t);
  return (s.start(gs("", s, e, n)), s.animation);
}
function Me(t, e, n, s = { passive: !0 }) {
  return (t.addEventListener(e, n, s), () => t.removeEventListener(e, n));
}
const ad = (t, e) => t.depth - e.depth;
class ld {
  constructor() {
    ((this.children = []), (this.isDirty = !1));
  }
  add(e) {
    (es(this.children, e), (this.isDirty = !0));
  }
  remove(e) {
    (Ge(this.children, e), (this.isDirty = !0));
  }
  forEach(e) {
    (this.isDirty && this.children.sort(ad),
      (this.isDirty = !1),
      this.children.forEach(e));
  }
}
function cd(t, e) {
  const n = at.now(),
    s = ({ timestamp: o }) => {
      const r = o - n;
      r >= e && (Ft(s), t(r - e));
    };
  return (O.setup(s, !0), () => Ft(s));
}
function Ue(t) {
  return ot(t) ? t.get() : t;
}
class ud {
  constructor() {
    this.members = [];
  }
  add(e) {
    es(this.members, e);
    for (let n = this.members.length - 1; n >= 0; n--) {
      const s = this.members[n];
      if (s === e || s === this.lead || s === this.prevLead) continue;
      const o = s.instance;
      o &&
        o.isConnected === !1 &&
        s.isPresent !== !1 &&
        !s.snapshot &&
        Ge(this.members, s);
    }
    e.scheduleRender();
  }
  remove(e) {
    if (
      (Ge(this.members, e),
      e === this.prevLead && (this.prevLead = void 0),
      e === this.lead)
    ) {
      const n = this.members[this.members.length - 1];
      n && this.promote(n);
    }
  }
  relegate(e) {
    const n = this.members.findIndex((o) => e === o);
    if (n === 0) return !1;
    let s;
    for (let o = n; o >= 0; o--) {
      const r = this.members[o],
        i = r.instance;
      if (r.isPresent !== !1 && (!i || i.isConnected !== !1)) {
        s = r;
        break;
      }
    }
    return s ? (this.promote(s), !0) : !1;
  }
  promote(e, n) {
    const s = this.lead;
    if (e !== s && ((this.prevLead = s), (this.lead = e), e.show(), s)) {
      (s.instance && s.scheduleRender(), e.scheduleRender());
      const o = s.options.layoutDependency,
        r = e.options.layoutDependency;
      if (!(o !== void 0 && r !== void 0 && o === r)) {
        const c = s.instance;
        (c && c.isConnected === !1 && !s.snapshot) ||
          ((e.resumeFrom = s),
          n && (e.resumeFrom.preserveOpacity = !0),
          s.snapshot &&
            ((e.snapshot = s.snapshot),
            (e.snapshot.latestValues = s.animationValues || s.latestValues)),
          e.root && e.root.isUpdating && (e.isLayoutDirty = !0));
      }
      const { crossfade: a } = e.options;
      a === !1 && s.hide();
    }
  }
  exitAnimationComplete() {
    this.members.forEach((e) => {
      const { options: n, resumingFrom: s } = e;
      (n.onExitComplete && n.onExitComplete(),
        s && s.options.onExitComplete && s.options.onExitComplete());
    });
  }
  scheduleRender() {
    this.members.forEach((e) => {
      e.instance && e.scheduleRender(!1);
    });
  }
  removeLeadSnapshot() {
    this.lead && this.lead.snapshot && (this.lead.snapshot = void 0);
  }
}
const We = { hasAnimatedSinceResize: !0, hasEverUpdated: !1 },
  gn = ["", "X", "Y", "Z"],
  dd = 1e3;
let hd = 0;
function vn(t, e, n, s) {
  const { latestValues: o } = e;
  o[t] && ((n[t] = o[t]), e.setStaticValue(t, 0), s && (s[t] = 0));
}
function _r(t) {
  if (((t.hasCheckedOptimisedAppear = !0), t.root === t)) return;
  const { visualElement: e } = t.options;
  if (!e) return;
  const n = Qi(e);
  if (window.MotionHasOptimisedAnimation(n, "transform")) {
    const { layout: o, layoutId: r } = t.options;
    window.MotionCancelOptimisedAnimation(n, "transform", O, !(o || r));
  }
  const { parent: s } = t;
  s && !s.hasCheckedOptimisedAppear && _r(s);
}
function Lr({
  attachResizeListener: t,
  defaultParent: e,
  measureScroll: n,
  checkIsScrollRoot: s,
  resetTransform: o,
}) {
  return class {
    constructor(i = {}, a = e?.()) {
      ((this.id = hd++),
        (this.animationId = 0),
        (this.animationCommitId = 0),
        (this.children = new Set()),
        (this.options = {}),
        (this.isTreeAnimating = !1),
        (this.isAnimationBlocked = !1),
        (this.isLayoutDirty = !1),
        (this.isProjectionDirty = !1),
        (this.isSharedProjectionDirty = !1),
        (this.isTransformDirty = !1),
        (this.updateManuallyBlocked = !1),
        (this.updateBlockedByResize = !1),
        (this.isUpdating = !1),
        (this.isSVG = !1),
        (this.needsReset = !1),
        (this.shouldResetTransform = !1),
        (this.hasCheckedOptimisedAppear = !1),
        (this.treeScale = { x: 1, y: 1 }),
        (this.eventHandlers = new Map()),
        (this.hasTreeAnimated = !1),
        (this.layoutVersion = 0),
        (this.updateScheduled = !1),
        (this.scheduleUpdate = () => this.update()),
        (this.projectionUpdateScheduled = !1),
        (this.checkUpdateFailed = () => {
          this.isUpdating && ((this.isUpdating = !1), this.clearAllSnapshots());
        }),
        (this.updateProjection = () => {
          ((this.projectionUpdateScheduled = !1),
            this.nodes.forEach(md),
            this.nodes.forEach(bd),
            this.nodes.forEach(xd),
            this.nodes.forEach(yd));
        }),
        (this.resolvedRelativeTargetAt = 0),
        (this.linkedParentVersion = 0),
        (this.hasProjected = !1),
        (this.isVisible = !0),
        (this.animationProgress = 0),
        (this.sharedNodes = new Map()),
        (this.latestValues = i),
        (this.root = a ? a.root || a : this),
        (this.path = a ? [...a.path, a] : []),
        (this.parent = a),
        (this.depth = a ? a.depth + 1 : 0));
      for (let c = 0; c < this.path.length; c++)
        this.path[c].shouldResetTransform = !0;
      this.root === this && (this.nodes = new ld());
    }
    addEventListener(i, a) {
      return (
        this.eventHandlers.has(i) || this.eventHandlers.set(i, new os()),
        this.eventHandlers.get(i).add(a)
      );
    }
    notifyListeners(i, ...a) {
      const c = this.eventHandlers.get(i);
      c && c.notify(...a);
    }
    hasListeners(i) {
      return this.eventHandlers.has(i);
    }
    mount(i) {
      if (this.instance) return;
      ((this.isSVG = Ts(i) && !pu(i)), (this.instance = i));
      const { layoutId: a, layout: c, visualElement: u } = this.options;
      if (
        (u && !u.current && u.mount(i),
        this.root.nodes.add(this),
        this.parent && this.parent.children.add(this),
        this.root.hasTreeAnimated && (c || a) && (this.isLayoutDirty = !0),
        t)
      ) {
        let d,
          l = 0;
        const h = () => (this.root.updateBlockedByResize = !1);
        (O.read(() => {
          l = window.innerWidth;
        }),
          t(i, () => {
            const f = window.innerWidth;
            f !== l &&
              ((l = f),
              (this.root.updateBlockedByResize = !0),
              d && d(),
              (d = cd(h, 250)),
              We.hasAnimatedSinceResize &&
                ((We.hasAnimatedSinceResize = !1), this.nodes.forEach(Fo)));
          }));
      }
      (a && this.root.registerSharedNode(a, this),
        this.options.animate !== !1 &&
          u &&
          (a || c) &&
          this.addEventListener(
            "didUpdate",
            ({
              delta: d,
              hasLayoutChanged: l,
              hasRelativeLayoutChanged: h,
              layout: f,
            }) => {
              if (this.isTreeAnimationBlocked()) {
                ((this.target = void 0), (this.relativeTarget = void 0));
                return;
              }
              const p =
                  this.options.transition || u.getDefaultTransition() || Sd,
                { onLayoutAnimationStart: b, onLayoutAnimationComplete: g } =
                  u.getProps(),
                y = !this.targetLayout || !Vr(this.targetLayout, f),
                k = !l && h;
              if (
                this.options.layoutRoot ||
                this.resumeFrom ||
                k ||
                (l && (y || !this.currentAnimation))
              ) {
                this.resumeFrom &&
                  ((this.resumingFrom = this.resumeFrom),
                  (this.resumingFrom.resumingFrom = void 0));
                const x = { ...ys(p, "layout"), onPlay: b, onComplete: g };
                ((u.shouldReduceMotion || this.options.layoutRoot) &&
                  ((x.delay = 0), (x.type = !1)),
                  this.startAnimation(x),
                  this.setAnimationOrigin(d, k));
              } else
                (l || Fo(this),
                  this.isLead() &&
                    this.options.onExitComplete &&
                    this.options.onExitComplete());
              this.targetLayout = f;
            },
          ));
    }
    unmount() {
      (this.options.layoutId && this.willUpdate(),
        this.root.nodes.remove(this));
      const i = this.getStack();
      (i && i.remove(this),
        this.parent && this.parent.children.delete(this),
        (this.instance = void 0),
        this.eventHandlers.clear(),
        Ft(this.updateProjection));
    }
    blockUpdate() {
      this.updateManuallyBlocked = !0;
    }
    unblockUpdate() {
      this.updateManuallyBlocked = !1;
    }
    isUpdateBlocked() {
      return this.updateManuallyBlocked || this.updateBlockedByResize;
    }
    isTreeAnimationBlocked() {
      return (
        this.isAnimationBlocked ||
        (this.parent && this.parent.isTreeAnimationBlocked()) ||
        !1
      );
    }
    startUpdate() {
      this.isUpdateBlocked() ||
        ((this.isUpdating = !0),
        this.nodes && this.nodes.forEach(wd),
        this.animationId++);
    }
    getTransformTemplate() {
      const { visualElement: i } = this.options;
      return i && i.getProps().transformTemplate;
    }
    willUpdate(i = !0) {
      if (((this.root.hasTreeAnimated = !0), this.root.isUpdateBlocked())) {
        this.options.onExitComplete && this.options.onExitComplete();
        return;
      }
      if (
        (window.MotionCancelOptimisedAnimation &&
          !this.hasCheckedOptimisedAppear &&
          _r(this),
        !this.root.isUpdating && this.root.startUpdate(),
        this.isLayoutDirty)
      )
        return;
      this.isLayoutDirty = !0;
      for (let d = 0; d < this.path.length; d++) {
        const l = this.path[d];
        ((l.shouldResetTransform = !0),
          l.updateScroll("snapshot"),
          l.options.layoutRoot && l.willUpdate(!1));
      }
      const { layoutId: a, layout: c } = this.options;
      if (a === void 0 && !c) return;
      const u = this.getTransformTemplate();
      ((this.prevTransformTemplateValue = u
        ? u(this.latestValues, "")
        : void 0),
        this.updateSnapshot(),
        i && this.notifyListeners("willUpdate"));
    }
    update() {
      if (((this.updateScheduled = !1), this.isUpdateBlocked())) {
        (this.unblockUpdate(),
          this.clearAllSnapshots(),
          this.nodes.forEach(jo));
        return;
      }
      if (this.animationId <= this.animationCommitId) {
        this.nodes.forEach(Bo);
        return;
      }
      ((this.animationCommitId = this.animationId),
        this.isUpdating
          ? ((this.isUpdating = !1),
            this.nodes.forEach(vd),
            this.nodes.forEach(fd),
            this.nodes.forEach(pd))
          : this.nodes.forEach(Bo),
        this.clearAllSnapshots());
      const a = at.now();
      ((et.delta = At(0, 1e3 / 60, a - et.timestamp)),
        (et.timestamp = a),
        (et.isProcessing = !0),
        cn.update.process(et),
        cn.preRender.process(et),
        cn.render.process(et),
        (et.isProcessing = !1));
    }
    didUpdate() {
      this.updateScheduled ||
        ((this.updateScheduled = !0), ws.read(this.scheduleUpdate));
    }
    clearAllSnapshots() {
      (this.nodes.forEach(gd), this.sharedNodes.forEach(kd));
    }
    scheduleUpdateProjection() {
      this.projectionUpdateScheduled ||
        ((this.projectionUpdateScheduled = !0),
        O.preRender(this.updateProjection, !1, !0));
    }
    scheduleCheckAfterUnmount() {
      O.postRender(() => {
        this.isLayoutDirty
          ? this.root.didUpdate()
          : this.root.checkUpdateFailed();
      });
    }
    updateSnapshot() {
      this.snapshot ||
        !this.instance ||
        ((this.snapshot = this.measure()),
        this.snapshot &&
          !lt(this.snapshot.measuredBox.x) &&
          !lt(this.snapshot.measuredBox.y) &&
          (this.snapshot = void 0));
    }
    updateLayout() {
      if (
        !this.instance ||
        (this.updateScroll(),
        !(this.options.alwaysMeasureLayout && this.isLead()) &&
          !this.isLayoutDirty)
      )
        return;
      if (this.resumeFrom && !this.resumeFrom.instance)
        for (let c = 0; c < this.path.length; c++) this.path[c].updateScroll();
      const i = this.layout;
      ((this.layout = this.measure(!1)),
        this.layoutVersion++,
        (this.layoutCorrected = Y()),
        (this.isLayoutDirty = !1),
        (this.projectionDelta = void 0),
        this.notifyListeners("measure", this.layout.layoutBox));
      const { visualElement: a } = this.options;
      a &&
        a.notify(
          "LayoutMeasure",
          this.layout.layoutBox,
          i ? i.layoutBox : void 0,
        );
    }
    updateScroll(i = "measure") {
      let a = !!(this.options.layoutScroll && this.instance);
      if (
        (this.scroll &&
          this.scroll.animationId === this.root.animationId &&
          this.scroll.phase === i &&
          (a = !1),
        a && this.instance)
      ) {
        const c = s(this.instance);
        this.scroll = {
          animationId: this.root.animationId,
          phase: i,
          isRoot: c,
          offset: n(this.instance),
          wasRoot: this.scroll ? this.scroll.isRoot : c,
        };
      }
    }
    resetTransform() {
      if (!o) return;
      const i =
          this.isLayoutDirty ||
          this.shouldResetTransform ||
          this.options.alwaysMeasureLayout,
        a = this.projectionDelta && !Er(this.projectionDelta),
        c = this.getTransformTemplate(),
        u = c ? c(this.latestValues, "") : void 0,
        d = u !== this.prevTransformTemplateValue;
      i &&
        this.instance &&
        (a || Wt(this.latestValues) || d) &&
        (o(this.instance, u),
        (this.shouldResetTransform = !1),
        this.scheduleRender());
    }
    measure(i = !0) {
      const a = this.measurePageBox();
      let c = this.removeElementScroll(a);
      return (
        i && (c = this.removeTransform(c)),
        Pd(c),
        {
          animationId: this.root.animationId,
          measuredBox: a,
          layoutBox: c,
          latestValues: {},
          source: this.id,
        }
      );
    }
    measurePageBox() {
      const { visualElement: i } = this.options;
      if (!i) return Y();
      const a = i.measureViewportBox();
      if (!(this.scroll?.wasRoot || this.path.some(Ad))) {
        const { scroll: u } = this.root;
        u && (se(a.x, u.offset.x), se(a.y, u.offset.y));
      }
      return a;
    }
    removeElementScroll(i) {
      const a = Y();
      if ((wt(a, i), this.scroll?.wasRoot)) return a;
      for (let c = 0; c < this.path.length; c++) {
        const u = this.path[c],
          { scroll: d, options: l } = u;
        u !== this.root &&
          d &&
          l.layoutScroll &&
          (d.wasRoot && wt(a, i), se(a.x, d.offset.x), se(a.y, d.offset.y));
      }
      return a;
    }
    applyTransform(i, a = !1) {
      const c = Y();
      wt(c, i);
      for (let u = 0; u < this.path.length; u++) {
        const d = this.path[u];
        (!a &&
          d.options.layoutScroll &&
          d.scroll &&
          d !== d.root &&
          oe(c, { x: -d.scroll.offset.x, y: -d.scroll.offset.y }),
          Wt(d.latestValues) && oe(c, d.latestValues));
      }
      return (Wt(this.latestValues) && oe(c, this.latestValues), c);
    }
    removeTransform(i) {
      const a = Y();
      wt(a, i);
      for (let c = 0; c < this.path.length; c++) {
        const u = this.path[c];
        if (!u.instance || !Wt(u.latestValues)) continue;
        Kn(u.latestValues) && u.updateSnapshot();
        const d = Y(),
          l = u.measurePageBox();
        (wt(d, l),
          Co(a, u.latestValues, u.snapshot ? u.snapshot.layoutBox : void 0, d));
      }
      return (Wt(this.latestValues) && Co(a, this.latestValues), a);
    }
    setTargetDelta(i) {
      ((this.targetDelta = i),
        this.root.scheduleUpdateProjection(),
        (this.isProjectionDirty = !0));
    }
    setOptions(i) {
      this.options = {
        ...this.options,
        ...i,
        crossfade: i.crossfade !== void 0 ? i.crossfade : !0,
      };
    }
    clearMeasurements() {
      ((this.scroll = void 0),
        (this.layout = void 0),
        (this.snapshot = void 0),
        (this.prevTransformTemplateValue = void 0),
        (this.targetDelta = void 0),
        (this.target = void 0),
        (this.isLayoutDirty = !1));
    }
    forceRelativeParentToResolveTarget() {
      this.relativeParent &&
        this.relativeParent.resolvedRelativeTargetAt !== et.timestamp &&
        this.relativeParent.resolveTargetDelta(!0);
    }
    resolveTargetDelta(i = !1) {
      const a = this.getLead();
      (this.isProjectionDirty || (this.isProjectionDirty = a.isProjectionDirty),
        this.isTransformDirty || (this.isTransformDirty = a.isTransformDirty),
        this.isSharedProjectionDirty ||
          (this.isSharedProjectionDirty = a.isSharedProjectionDirty));
      const c = !!this.resumingFrom || this !== a;
      if (
        !(
          i ||
          (c && this.isSharedProjectionDirty) ||
          this.isProjectionDirty ||
          this.parent?.isProjectionDirty ||
          this.attemptToResolveRelativeTarget ||
          this.root.updateBlockedByResize
        )
      )
        return;
      const { layout: d, layoutId: l } = this.options;
      if (!this.layout || !(d || l)) return;
      this.resolvedRelativeTargetAt = et.timestamp;
      const h = this.getClosestProjectingParent();
      (h &&
        this.linkedParentVersion !== h.layoutVersion &&
        !h.options.layoutRoot &&
        this.removeRelativeTarget(),
        !this.targetDelta &&
          !this.relativeTarget &&
          (h && h.layout
            ? this.createRelativeTarget(
                h,
                this.layout.layoutBox,
                h.layout.layoutBox,
              )
            : this.removeRelativeTarget()),
        !(!this.relativeTarget && !this.targetDelta) &&
          (this.target ||
            ((this.target = Y()), (this.targetWithTransforms = Y())),
          this.relativeTarget &&
          this.relativeTargetOrigin &&
          this.relativeParent &&
          this.relativeParent.target
            ? (this.forceRelativeParentToResolveTarget(),
              Xu(this.target, this.relativeTarget, this.relativeParent.target))
            : this.targetDelta
              ? (this.resumingFrom
                  ? (this.target = this.applyTransform(this.layout.layoutBox))
                  : wt(this.target, this.layout.layoutBox),
                gr(this.target, this.targetDelta))
              : wt(this.target, this.layout.layoutBox),
          this.attemptToResolveRelativeTarget &&
            ((this.attemptToResolveRelativeTarget = !1),
            h &&
            !!h.resumingFrom == !!this.resumingFrom &&
            !h.options.layoutScroll &&
            h.target &&
            this.animationProgress !== 1
              ? this.createRelativeTarget(h, this.target, h.target)
              : (this.relativeParent = this.relativeTarget = void 0))));
    }
    getClosestProjectingParent() {
      if (
        !(
          !this.parent ||
          Kn(this.parent.latestValues) ||
          yr(this.parent.latestValues)
        )
      )
        return this.parent.isProjecting()
          ? this.parent
          : this.parent.getClosestProjectingParent();
    }
    isProjecting() {
      return !!(
        (this.relativeTarget || this.targetDelta || this.options.layoutRoot) &&
        this.layout
      );
    }
    createRelativeTarget(i, a, c) {
      ((this.relativeParent = i),
        (this.linkedParentVersion = i.layoutVersion),
        this.forceRelativeParentToResolveTarget(),
        (this.relativeTarget = Y()),
        (this.relativeTargetOrigin = Y()),
        Je(this.relativeTargetOrigin, a, c),
        wt(this.relativeTarget, this.relativeTargetOrigin));
    }
    removeRelativeTarget() {
      this.relativeParent = this.relativeTarget = void 0;
    }
    calcProjection() {
      const i = this.getLead(),
        a = !!this.resumingFrom || this !== i;
      let c = !0;
      if (
        ((this.isProjectionDirty || this.parent?.isProjectionDirty) && (c = !1),
        a &&
          (this.isSharedProjectionDirty || this.isTransformDirty) &&
          (c = !1),
        this.resolvedRelativeTargetAt === et.timestamp && (c = !1),
        c)
      )
        return;
      const { layout: u, layoutId: d } = this.options;
      if (
        ((this.isTreeAnimating = !!(
          (this.parent && this.parent.isTreeAnimating) ||
          this.currentAnimation ||
          this.pendingAnimation
        )),
        this.isTreeAnimating ||
          (this.targetDelta = this.relativeTarget = void 0),
        !this.layout || !(u || d))
      )
        return;
      wt(this.layoutCorrected, this.layout.layoutBox);
      const l = this.treeScale.x,
        h = this.treeScale.y;
      (Su(this.layoutCorrected, this.treeScale, this.path, a),
        i.layout &&
          !i.target &&
          (this.treeScale.x !== 1 || this.treeScale.y !== 1) &&
          ((i.target = i.layout.layoutBox), (i.targetWithTransforms = Y())));
      const { target: f } = i;
      if (!f) {
        this.prevProjectionDelta &&
          (this.createProjectionDeltas(), this.scheduleRender());
        return;
      }
      (!this.projectionDelta || !this.prevProjectionDelta
        ? this.createProjectionDeltas()
        : (ko(this.prevProjectionDelta.x, this.projectionDelta.x),
          ko(this.prevProjectionDelta.y, this.projectionDelta.y)),
        ve(this.projectionDelta, this.layoutCorrected, f, this.latestValues),
        (this.treeScale.x !== l ||
          this.treeScale.y !== h ||
          !_o(this.projectionDelta.x, this.prevProjectionDelta.x) ||
          !_o(this.projectionDelta.y, this.prevProjectionDelta.y)) &&
          ((this.hasProjected = !0),
          this.scheduleRender(),
          this.notifyListeners("projectionUpdate", f)));
    }
    hide() {
      this.isVisible = !1;
    }
    show() {
      this.isVisible = !0;
    }
    scheduleRender(i = !0) {
      if ((this.options.visualElement?.scheduleRender(), i)) {
        const a = this.getStack();
        a && a.scheduleRender();
      }
      this.resumingFrom &&
        !this.resumingFrom.instance &&
        (this.resumingFrom = void 0);
    }
    createProjectionDeltas() {
      ((this.prevProjectionDelta = ne()),
        (this.projectionDelta = ne()),
        (this.projectionDeltaWithTransform = ne()));
    }
    setAnimationOrigin(i, a = !1) {
      const c = this.snapshot,
        u = c ? c.latestValues : {},
        d = { ...this.latestValues },
        l = ne();
      ((!this.relativeParent || !this.relativeParent.options.layoutRoot) &&
        (this.relativeTarget = this.relativeTargetOrigin = void 0),
        (this.attemptToResolveRelativeTarget = !a));
      const h = Y(),
        f = c ? c.source : void 0,
        p = this.layout ? this.layout.source : void 0,
        b = f !== p,
        g = this.getStack(),
        y = !g || g.members.length <= 1,
        k = !!(b && !y && this.options.crossfade === !0 && !this.path.some(Md));
      this.animationProgress = 0;
      let x;
      ((this.mixTargetDelta = (E) => {
        const S = E / 1e3;
        (zo(l.x, i.x, S),
          zo(l.y, i.y, S),
          this.setTargetDelta(l),
          this.relativeTarget &&
            this.relativeTargetOrigin &&
            this.layout &&
            this.relativeParent &&
            this.relativeParent.layout &&
            (Je(h, this.layout.layoutBox, this.relativeParent.layout.layoutBox),
            Td(this.relativeTarget, this.relativeTargetOrigin, h, S),
            x && td(this.relativeTarget, x) && (this.isProjectionDirty = !1),
            x || (x = Y()),
            wt(x, this.relativeTarget)),
          b &&
            ((this.animationValues = d), sd(d, u, this.latestValues, S, k, y)),
          this.root.scheduleUpdateProjection(),
          this.scheduleRender(),
          (this.animationProgress = S));
      }),
        this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0));
    }
    startAnimation(i) {
      (this.notifyListeners("animationStart"),
        this.currentAnimation?.stop(),
        this.resumingFrom?.currentAnimation?.stop(),
        this.pendingAnimation &&
          (Ft(this.pendingAnimation), (this.pendingAnimation = void 0)),
        (this.pendingAnimation = O.update(() => {
          ((We.hasAnimatedSinceResize = !0),
            this.motionValue || (this.motionValue = re(0)),
            (this.currentAnimation = rd(this.motionValue, [0, 1e3], {
              ...i,
              velocity: 0,
              isSync: !0,
              onUpdate: (a) => {
                (this.mixTargetDelta(a), i.onUpdate && i.onUpdate(a));
              },
              onStop: () => {},
              onComplete: () => {
                (i.onComplete && i.onComplete(), this.completeAnimation());
              },
            })),
            this.resumingFrom &&
              (this.resumingFrom.currentAnimation = this.currentAnimation),
            (this.pendingAnimation = void 0));
        })));
    }
    completeAnimation() {
      this.resumingFrom &&
        ((this.resumingFrom.currentAnimation = void 0),
        (this.resumingFrom.preserveOpacity = void 0));
      const i = this.getStack();
      (i && i.exitAnimationComplete(),
        (this.resumingFrom =
          this.currentAnimation =
          this.animationValues =
            void 0),
        this.notifyListeners("animationComplete"));
    }
    finishAnimation() {
      (this.currentAnimation &&
        (this.mixTargetDelta && this.mixTargetDelta(dd),
        this.currentAnimation.stop()),
        this.completeAnimation());
    }
    applyTransformsToTarget() {
      const i = this.getLead();
      let {
        targetWithTransforms: a,
        target: c,
        layout: u,
        latestValues: d,
      } = i;
      if (!(!a || !c || !u)) {
        if (
          this !== i &&
          this.layout &&
          u &&
          Nr(this.options.animationType, this.layout.layoutBox, u.layoutBox)
        ) {
          c = this.target || Y();
          const l = lt(this.layout.layoutBox.x);
          ((c.x.min = i.target.x.min), (c.x.max = c.x.min + l));
          const h = lt(this.layout.layoutBox.y);
          ((c.y.min = i.target.y.min), (c.y.max = c.y.min + h));
        }
        (wt(a, c),
          oe(a, d),
          ve(this.projectionDeltaWithTransform, this.layoutCorrected, a, d));
      }
    }
    registerSharedNode(i, a) {
      (this.sharedNodes.has(i) || this.sharedNodes.set(i, new ud()),
        this.sharedNodes.get(i).add(a));
      const u = a.options.initialPromotionConfig;
      a.promote({
        transition: u ? u.transition : void 0,
        preserveFollowOpacity:
          u && u.shouldPreserveFollowOpacity
            ? u.shouldPreserveFollowOpacity(a)
            : void 0,
      });
    }
    isLead() {
      const i = this.getStack();
      return i ? i.lead === this : !0;
    }
    getLead() {
      const { layoutId: i } = this.options;
      return i ? this.getStack()?.lead || this : this;
    }
    getPrevLead() {
      const { layoutId: i } = this.options;
      return i ? this.getStack()?.prevLead : void 0;
    }
    getStack() {
      const { layoutId: i } = this.options;
      if (i) return this.root.sharedNodes.get(i);
    }
    promote({ needsReset: i, transition: a, preserveFollowOpacity: c } = {}) {
      const u = this.getStack();
      (u && u.promote(this, c),
        i && ((this.projectionDelta = void 0), (this.needsReset = !0)),
        a && this.setOptions({ transition: a }));
    }
    relegate() {
      const i = this.getStack();
      return i ? i.relegate(this) : !1;
    }
    resetSkewAndRotation() {
      const { visualElement: i } = this.options;
      if (!i) return;
      let a = !1;
      const { latestValues: c } = i;
      if (
        ((c.z ||
          c.rotate ||
          c.rotateX ||
          c.rotateY ||
          c.rotateZ ||
          c.skewX ||
          c.skewY) &&
          (a = !0),
        !a)
      )
        return;
      const u = {};
      c.z && vn("z", i, u, this.animationValues);
      for (let d = 0; d < gn.length; d++)
        (vn(`rotate${gn[d]}`, i, u, this.animationValues),
          vn(`skew${gn[d]}`, i, u, this.animationValues));
      i.render();
      for (const d in u)
        (i.setStaticValue(d, u[d]),
          this.animationValues && (this.animationValues[d] = u[d]));
      i.scheduleRender();
    }
    applyProjectionStyles(i, a) {
      if (!this.instance || this.isSVG) return;
      if (!this.isVisible) {
        i.visibility = "hidden";
        return;
      }
      const c = this.getTransformTemplate();
      if (this.needsReset) {
        ((this.needsReset = !1),
          (i.visibility = ""),
          (i.opacity = ""),
          (i.pointerEvents = Ue(a?.pointerEvents) || ""),
          (i.transform = c ? c(this.latestValues, "") : "none"));
        return;
      }
      const u = this.getLead();
      if (!this.projectionDelta || !this.layout || !u.target) {
        (this.options.layoutId &&
          ((i.opacity =
            this.latestValues.opacity !== void 0
              ? this.latestValues.opacity
              : 1),
          (i.pointerEvents = Ue(a?.pointerEvents) || "")),
          this.hasProjected &&
            !Wt(this.latestValues) &&
            ((i.transform = c ? c({}, "") : "none"), (this.hasProjected = !1)));
        return;
      }
      i.visibility = "";
      const d = u.animationValues || u.latestValues;
      this.applyTransformsToTarget();
      let l = ed(this.projectionDeltaWithTransform, this.treeScale, d);
      (c && (l = c(d, l)), (i.transform = l));
      const { x: h, y: f } = this.projectionDelta;
      ((i.transformOrigin = `${h.origin * 100}% ${f.origin * 100}% 0`),
        u.animationValues
          ? (i.opacity =
              u === this
                ? (d.opacity ?? this.latestValues.opacity ?? 1)
                : this.preserveOpacity
                  ? this.latestValues.opacity
                  : d.opacityExit)
          : (i.opacity =
              u === this
                ? d.opacity !== void 0
                  ? d.opacity
                  : ""
                : d.opacityExit !== void 0
                  ? d.opacityExit
                  : 0));
      for (const p in Yn) {
        if (d[p] === void 0) continue;
        const { correct: b, applyTo: g, isCSSVariable: y } = Yn[p],
          k = l === "none" ? d[p] : b(d[p], u);
        if (g) {
          const x = g.length;
          for (let E = 0; E < x; E++) i[g[E]] = k;
        } else
          y ? (this.options.visualElement.renderState.vars[p] = k) : (i[p] = k);
      }
      this.options.layoutId &&
        (i.pointerEvents = u === this ? Ue(a?.pointerEvents) || "" : "none");
    }
    clearSnapshot() {
      this.resumeFrom = this.snapshot = void 0;
    }
    resetTree() {
      (this.root.nodes.forEach((i) => i.currentAnimation?.stop()),
        this.root.nodes.forEach(jo),
        this.root.sharedNodes.clear());
    }
  };
}
function fd(t) {
  t.updateLayout();
}
function pd(t) {
  const e = t.resumeFrom?.snapshot || t.snapshot;
  if (t.isLead() && t.layout && e && t.hasListeners("didUpdate")) {
    const { layoutBox: n, measuredBox: s } = t.layout,
      { animationType: o } = t.options,
      r = e.source !== t.layout.source;
    o === "size"
      ? St((d) => {
          const l = r ? e.measuredBox[d] : e.layoutBox[d],
            h = lt(l);
          ((l.min = n[d].min), (l.max = l.min + h));
        })
      : Nr(o, e.layoutBox, n) &&
        St((d) => {
          const l = r ? e.measuredBox[d] : e.layoutBox[d],
            h = lt(n[d]);
          ((l.max = l.min + h),
            t.relativeTarget &&
              !t.currentAnimation &&
              ((t.isProjectionDirty = !0),
              (t.relativeTarget[d].max = t.relativeTarget[d].min + h)));
        });
    const i = ne();
    ve(i, n, e.layoutBox);
    const a = ne();
    r ? ve(a, t.applyTransform(s, !0), e.measuredBox) : ve(a, n, e.layoutBox);
    const c = !Er(i);
    let u = !1;
    if (!t.resumeFrom) {
      const d = t.getClosestProjectingParent();
      if (d && !d.resumeFrom) {
        const { snapshot: l, layout: h } = d;
        if (l && h) {
          const f = Y();
          Je(f, e.layoutBox, l.layoutBox);
          const p = Y();
          (Je(p, n, h.layoutBox),
            Vr(f, p) || (u = !0),
            d.options.layoutRoot &&
              ((t.relativeTarget = p),
              (t.relativeTargetOrigin = f),
              (t.relativeParent = d)));
        }
      }
    }
    t.notifyListeners("didUpdate", {
      layout: n,
      snapshot: e,
      delta: a,
      layoutDelta: i,
      hasLayoutChanged: c,
      hasRelativeLayoutChanged: u,
    });
  } else if (t.isLead()) {
    const { onExitComplete: n } = t.options;
    n && n();
  }
  t.options.transition = void 0;
}
function md(t) {
  t.parent &&
    (t.isProjecting() || (t.isProjectionDirty = t.parent.isProjectionDirty),
    t.isSharedProjectionDirty ||
      (t.isSharedProjectionDirty = !!(
        t.isProjectionDirty ||
        t.parent.isProjectionDirty ||
        t.parent.isSharedProjectionDirty
      )),
    t.isTransformDirty || (t.isTransformDirty = t.parent.isTransformDirty));
}
function yd(t) {
  t.isProjectionDirty = t.isSharedProjectionDirty = t.isTransformDirty = !1;
}
function gd(t) {
  t.clearSnapshot();
}
function jo(t) {
  t.clearMeasurements();
}
function Bo(t) {
  t.isLayoutDirty = !1;
}
function vd(t) {
  const { visualElement: e } = t.options;
  (e && e.getProps().onBeforeLayoutMeasure && e.notify("BeforeLayoutMeasure"),
    t.resetTransform());
}
function Fo(t) {
  (t.finishAnimation(),
    (t.targetDelta = t.relativeTarget = t.target = void 0),
    (t.isProjectionDirty = !0));
}
function bd(t) {
  t.resolveTargetDelta();
}
function xd(t) {
  t.calcProjection();
}
function wd(t) {
  t.resetSkewAndRotation();
}
function kd(t) {
  t.removeLeadSnapshot();
}
function zo(t, e, n) {
  ((t.translate = U(e.translate, 0, n)),
    (t.scale = U(e.scale, 1, n)),
    (t.origin = e.origin),
    (t.originPoint = e.originPoint));
}
function $o(t, e, n, s) {
  ((t.min = U(e.min, n.min, s)), (t.max = U(e.max, n.max, s)));
}
function Td(t, e, n, s) {
  ($o(t.x, e.x, n.x, s), $o(t.y, e.y, n.y, s));
}
function Md(t) {
  return t.animationValues && t.animationValues.opacityExit !== void 0;
}
const Sd = { duration: 0.45, ease: [0.4, 0, 0.1, 1] },
  Oo = (t) =>
    typeof navigator < "u" &&
    navigator.userAgent &&
    navigator.userAgent.toLowerCase().includes(t),
  Ho = Oo("applewebkit/") && !Oo("chrome/") ? Math.round : mt;
function Uo(t) {
  ((t.min = Ho(t.min)), (t.max = Ho(t.max)));
}
function Pd(t) {
  (Uo(t.x), Uo(t.y));
}
function Nr(t, e, n) {
  return (
    t === "position" || (t === "preserve-aspect" && !Yu(Ro(e), Ro(n), 0.2))
  );
}
function Ad(t) {
  return t !== t.root && t.scroll?.wasRoot;
}
const Cd = Lr({
    attachResizeListener: (t, e) => Me(t, "resize", e),
    measureScroll: () => ({
      x: document.documentElement.scrollLeft || document.body?.scrollLeft || 0,
      y: document.documentElement.scrollTop || document.body?.scrollTop || 0,
    }),
    checkIsScrollRoot: () => !0,
  }),
  bn = { current: void 0 },
  Ir = Lr({
    measureScroll: (t) => ({ x: t.scrollLeft, y: t.scrollTop }),
    defaultParent: () => {
      if (!bn.current) {
        const t = new Cd({});
        (t.mount(window), t.setOptions({ layoutScroll: !0 }), (bn.current = t));
      }
      return bn.current;
    },
    resetTransform: (t, e) => {
      t.style.transform = e !== void 0 ? e : "none";
    },
    checkIsScrollRoot: (t) => window.getComputedStyle(t).position === "fixed",
  }),
  Cs = T.createContext({
    transformPagePoint: (t) => t,
    isStatic: !1,
    reducedMotion: "never",
  });
function Wo(t, e) {
  if (typeof t == "function") return t(e);
  t != null && (t.current = e);
}
function Ed(...t) {
  return (e) => {
    let n = !1;
    const s = t.map((o) => {
      const r = Wo(o, e);
      return (!n && typeof r == "function" && (n = !0), r);
    });
    if (n)
      return () => {
        for (let o = 0; o < s.length; o++) {
          const r = s[o];
          typeof r == "function" ? r() : Wo(t[o], null);
        }
      };
  };
}
function Vd(...t) {
  return T.useCallback(Ed(...t), t);
}
class Dd extends T.Component {
  getSnapshotBeforeUpdate(e) {
    const n = this.props.childRef.current;
    if (n && e.isPresent && !this.props.isPresent && this.props.pop !== !1) {
      const s = n.offsetParent,
        o = (Wn(s) && s.offsetWidth) || 0,
        r = (Wn(s) && s.offsetHeight) || 0,
        i = this.props.sizeRef.current;
      ((i.height = n.offsetHeight || 0),
        (i.width = n.offsetWidth || 0),
        (i.top = n.offsetTop),
        (i.left = n.offsetLeft),
        (i.right = o - i.width - i.left),
        (i.bottom = r - i.height - i.top));
    }
    return null;
  }
  componentDidUpdate() {}
  render() {
    return this.props.children;
  }
}
function Rd({
  children: t,
  isPresent: e,
  anchorX: n,
  anchorY: s,
  root: o,
  pop: r,
}) {
  const i = T.useId(),
    a = T.useRef(null),
    c = T.useRef({ width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }),
    { nonce: u } = T.useContext(Cs),
    d = t.props?.ref ?? t?.ref,
    l = Vd(a, d);
  return (
    T.useInsertionEffect(() => {
      const {
        width: h,
        height: f,
        top: p,
        left: b,
        right: g,
        bottom: y,
      } = c.current;
      if (e || r === !1 || !a.current || !h || !f) return;
      const k = n === "left" ? `left: ${b}` : `right: ${g}`,
        x = s === "bottom" ? `bottom: ${y}` : `top: ${p}`;
      a.current.dataset.motionPopId = i;
      const E = document.createElement("style");
      u && (E.nonce = u);
      const S = o ?? document.head;
      return (
        S.appendChild(E),
        E.sheet &&
          E.sheet.insertRule(`
          [data-motion-pop-id="${i}"] {
            position: absolute !important;
            width: ${h}px !important;
            height: ${f}px !important;
            ${k}px !important;
            ${x}px !important;
          }
        `),
        () => {
          S.contains(E) && S.removeChild(E);
        }
      );
    }, [e]),
    Dt.jsx(Dd, {
      isPresent: e,
      childRef: a,
      sizeRef: c,
      pop: r,
      children: r === !1 ? t : T.cloneElement(t, { ref: l }),
    })
  );
}
const _d = ({
  children: t,
  initial: e,
  isPresent: n,
  onExitComplete: s,
  custom: o,
  presenceAffectsLayout: r,
  mode: i,
  anchorX: a,
  anchorY: c,
  root: u,
}) => {
  const d = ts(Ld),
    l = T.useId();
  let h = !0,
    f = T.useMemo(
      () => (
        (h = !1),
        {
          id: l,
          initial: e,
          isPresent: n,
          custom: o,
          onExitComplete: (p) => {
            d.set(p, !0);
            for (const b of d.values()) if (!b) return;
            s && s();
          },
          register: (p) => (d.set(p, !1), () => d.delete(p)),
        }
      ),
      [n, d, s],
    );
  return (
    r && h && (f = { ...f }),
    T.useMemo(() => {
      d.forEach((p, b) => d.set(b, !1));
    }, [n]),
    T.useEffect(() => {
      !n && !d.size && s && s();
    }, [n]),
    (t = Dt.jsx(Rd, {
      pop: i === "popLayout",
      isPresent: n,
      anchorX: a,
      anchorY: c,
      root: u,
      children: t,
    })),
    Dt.jsx(en.Provider, { value: f, children: t })
  );
};
function Ld() {
  return new Map();
}
function jr(t = !0) {
  const e = T.useContext(en);
  if (e === null) return [!0, null];
  const { isPresent: n, onExitComplete: s, register: o } = e,
    r = T.useId();
  T.useEffect(() => {
    if (t) return o(r);
  }, [t]);
  const i = T.useCallback(() => t && s && s(r), [r, s, t]);
  return !n && s ? [!1, i] : [!0];
}
const Ne = (t) => t.key || "";
function Go(t) {
  const e = [];
  return (
    T.Children.forEach(t, (n) => {
      T.isValidElement(n) && e.push(n);
    }),
    e
  );
}
const Ym = ({
    children: t,
    custom: e,
    initial: n = !0,
    onExitComplete: s,
    presenceAffectsLayout: o = !0,
    mode: r = "sync",
    propagate: i = !1,
    anchorX: a = "left",
    anchorY: c = "top",
    root: u,
  }) => {
    const [d, l] = jr(i),
      h = T.useMemo(() => Go(t), [t]),
      f = i && !d ? [] : h.map(Ne),
      p = T.useRef(!0),
      b = T.useRef(h),
      g = ts(() => new Map()),
      y = T.useRef(new Set()),
      [k, x] = T.useState(h),
      [E, S] = T.useState(h);
    fi(() => {
      ((p.current = !1), (b.current = h));
      for (let v = 0; v < E.length; v++) {
        const R = Ne(E[v]);
        f.includes(R)
          ? (g.delete(R), y.current.delete(R))
          : g.get(R) !== !0 && g.set(R, !1);
      }
    }, [E, f.length, f.join("-")]);
    const D = [];
    if (h !== k) {
      let v = [...h];
      for (let R = 0; R < E.length; R++) {
        const F = E[R],
          J = Ne(F);
        f.includes(J) || (v.splice(R, 0, F), D.push(F));
      }
      return (r === "wait" && D.length && (v = D), S(Go(v)), x(h), null);
    }
    const { forceRender: B } = T.useContext(Qn);
    return Dt.jsx(Dt.Fragment, {
      children: E.map((v) => {
        const R = Ne(v),
          F = i && !d ? !1 : h === E || f.includes(R),
          J = () => {
            if (y.current.has(R)) return;
            if ((y.current.add(R), g.has(R))) g.set(R, !0);
            else return;
            let nt = !0;
            (g.forEach((Q) => {
              Q || (nt = !1);
            }),
              nt && (B?.(), S(b.current), i && l?.(), s && s()));
          };
        return Dt.jsx(
          _d,
          {
            isPresent: F,
            initial: !p.current || n ? void 0 : !1,
            custom: e,
            presenceAffectsLayout: o,
            mode: r,
            root: u,
            onExitComplete: F ? void 0 : J,
            anchorX: a,
            anchorY: c,
            children: v,
          },
          R,
        );
      }),
    });
  },
  Br = T.createContext({ strict: !1 }),
  Ko = {
    animation: [
      "animate",
      "variants",
      "whileHover",
      "whileTap",
      "exit",
      "whileInView",
      "whileFocus",
      "whileDrag",
    ],
    exit: ["exit"],
    drag: ["drag", "dragControls"],
    focus: ["whileFocus"],
    hover: ["whileHover", "onHoverStart", "onHoverEnd"],
    tap: ["whileTap", "onTap", "onTapStart", "onTapCancel"],
    pan: ["onPan", "onPanStart", "onPanSessionStart", "onPanEnd"],
    inView: ["whileInView", "onViewportEnter", "onViewportLeave"],
    layout: ["layout", "layoutId"],
  };
let qo = !1;
function Nd() {
  if (qo) return;
  const t = {};
  for (const e in Ko) t[e] = { isEnabled: (n) => Ko[e].some((s) => !!n[s]) };
  (fr(t), (qo = !0));
}
function Fr() {
  return (Nd(), wu());
}
function Id(t) {
  const e = Fr();
  for (const n in t) e[n] = { ...e[n], ...t[n] };
  fr(e);
}
const jd = new Set([
  "animate",
  "exit",
  "variants",
  "initial",
  "style",
  "values",
  "variants",
  "transition",
  "transformTemplate",
  "custom",
  "inherit",
  "onBeforeLayoutMeasure",
  "onAnimationStart",
  "onAnimationComplete",
  "onUpdate",
  "onDragStart",
  "onDrag",
  "onDragEnd",
  "onMeasureDragConstraints",
  "onDirectionLock",
  "onDragTransitionEnd",
  "_dragX",
  "_dragY",
  "onHoverStart",
  "onHoverEnd",
  "onViewportEnter",
  "onViewportLeave",
  "globalTapTarget",
  "propagate",
  "ignoreStrict",
  "viewport",
]);
function Qe(t) {
  return (
    t.startsWith("while") ||
    (t.startsWith("drag") && t !== "draggable") ||
    t.startsWith("layout") ||
    t.startsWith("onTap") ||
    t.startsWith("onPan") ||
    t.startsWith("onLayout") ||
    jd.has(t)
  );
}
let zr = (t) => !Qe(t);
function Bd(t) {
  typeof t == "function" && (zr = (e) => (e.startsWith("on") ? !Qe(e) : t(e)));
}
try {
  Bd(require("@emotion/is-prop-valid").default);
} catch {}
function Fd(t, e, n) {
  const s = {};
  for (const o in t)
    (o === "values" && typeof t.values == "object") ||
      ((zr(o) ||
        (n === !0 && Qe(o)) ||
        (!e && !Qe(o)) ||
        (t.draggable && o.startsWith("onDrag"))) &&
        (s[o] = t[o]));
  return s;
}
const on = T.createContext({});
function zd(t, e) {
  if (sn(t)) {
    const { initial: n, animate: s } = t;
    return {
      initial: n === !1 || Te(n) ? n : void 0,
      animate: Te(s) ? s : void 0,
    };
  }
  return t.inherit !== !1 ? e : {};
}
function $d(t) {
  const { initial: e, animate: n } = zd(t, T.useContext(on));
  return T.useMemo(() => ({ initial: e, animate: n }), [Yo(e), Yo(n)]);
}
function Yo(t) {
  return Array.isArray(t) ? t.join(" ") : t;
}
const Es = () => ({ style: {}, transform: {}, transformOrigin: {}, vars: {} });
function $r(t, e, n) {
  for (const s in e) !ot(e[s]) && !xr(s, n) && (t[s] = e[s]);
}
function Od({ transformTemplate: t }, e) {
  return T.useMemo(() => {
    const n = Es();
    return (Ps(n, e, t), Object.assign({}, n.vars, n.style));
  }, [e]);
}
function Hd(t, e) {
  const n = t.style || {},
    s = {};
  return ($r(s, n, t), Object.assign(s, Od(t, e)), s);
}
function Ud(t, e) {
  const n = {},
    s = Hd(t, e);
  return (
    t.drag &&
      t.dragListener !== !1 &&
      ((n.draggable = !1),
      (s.userSelect = s.WebkitUserSelect = s.WebkitTouchCallout = "none"),
      (s.touchAction =
        t.drag === !0 ? "none" : `pan-${t.drag === "x" ? "y" : "x"}`)),
    t.tabIndex === void 0 &&
      (t.onTap || t.onTapStart || t.whileTap) &&
      (n.tabIndex = 0),
    (n.style = s),
    n
  );
}
const Or = () => ({ ...Es(), attrs: {} });
function Wd(t, e, n, s) {
  const o = T.useMemo(() => {
    const r = Or();
    return (
      wr(r, e, Tr(s), t.transformTemplate, t.style),
      { ...r.attrs, style: { ...r.style } }
    );
  }, [e]);
  if (t.style) {
    const r = {};
    ($r(r, t.style, t), (o.style = { ...r, ...o.style }));
  }
  return o;
}
const Gd = [
  "animate",
  "circle",
  "defs",
  "desc",
  "ellipse",
  "g",
  "image",
  "line",
  "filter",
  "marker",
  "mask",
  "metadata",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "rect",
  "stop",
  "switch",
  "symbol",
  "svg",
  "text",
  "tspan",
  "use",
  "view",
];
function Vs(t) {
  return typeof t != "string" || t.includes("-")
    ? !1
    : !!(Gd.indexOf(t) > -1 || /[A-Z]/u.test(t));
}
function Kd(t, e, n, { latestValues: s }, o, r = !1, i) {
  const c = ((i ?? Vs(t)) ? Wd : Ud)(e, s, o, t),
    u = Fd(e, typeof t == "string", r),
    d = t !== T.Fragment ? { ...u, ...c, ref: n } : {},
    { children: l } = e,
    h = T.useMemo(() => (ot(l) ? l.get() : l), [l]);
  return T.createElement(t, { ...d, children: h });
}
function qd({ scrapeMotionValuesFromProps: t, createRenderState: e }, n, s, o) {
  return { latestValues: Yd(n, s, o, t), renderState: e() };
}
function Yd(t, e, n, s) {
  const o = {},
    r = s(t, {});
  for (const h in r) o[h] = Ue(r[h]);
  let { initial: i, animate: a } = t;
  const c = sn(t),
    u = dr(t);
  e &&
    u &&
    !c &&
    t.inherit !== !1 &&
    (i === void 0 && (i = e.initial), a === void 0 && (a = e.animate));
  let d = n ? n.initial === !1 : !1;
  d = d || i === !1;
  const l = d ? a : i;
  if (l && typeof l != "boolean" && !nn(l)) {
    const h = Array.isArray(l) ? l : [l];
    for (let f = 0; f < h.length; f++) {
      const p = vs(t, h[f]);
      if (p) {
        const { transitionEnd: b, transition: g, ...y } = p;
        for (const k in y) {
          let x = y[k];
          if (Array.isArray(x)) {
            const E = d ? x.length - 1 : 0;
            x = x[E];
          }
          x !== null && (o[k] = x);
        }
        for (const k in b) o[k] = b[k];
      }
    }
  }
  return o;
}
const Hr = (t) => (e, n) => {
    const s = T.useContext(on),
      o = T.useContext(en),
      r = () => qd(t, e, s, o);
    return n ? r() : ts(r);
  },
  Xd = Hr({ scrapeMotionValuesFromProps: As, createRenderState: Es }),
  Zd = Hr({ scrapeMotionValuesFromProps: Mr, createRenderState: Or }),
  Jd = Symbol.for("motionComponentSymbol");
function Qd(t, e, n) {
  const s = T.useRef(n);
  T.useInsertionEffect(() => {
    s.current = n;
  });
  const o = T.useRef(null);
  return T.useCallback(
    (r) => {
      (r && t.onMount?.(r), e && (r ? e.mount(r) : e.unmount()));
      const i = s.current;
      if (typeof i == "function")
        if (r) {
          const a = i(r);
          typeof a == "function" && (o.current = a);
        } else o.current ? (o.current(), (o.current = null)) : i(r);
      else i && (i.current = r);
    },
    [e],
  );
}
const Ur = T.createContext({});
function Qt(t) {
  return (
    t &&
    typeof t == "object" &&
    Object.prototype.hasOwnProperty.call(t, "current")
  );
}
function th(t, e, n, s, o, r) {
  const { visualElement: i } = T.useContext(on),
    a = T.useContext(Br),
    c = T.useContext(en),
    u = T.useContext(Cs),
    d = u.reducedMotion,
    l = u.skipAnimations,
    h = T.useRef(null),
    f = T.useRef(!1);
  ((s = s || a.renderer),
    !h.current &&
      s &&
      ((h.current = s(t, {
        visualState: e,
        parent: i,
        props: n,
        presenceContext: c,
        blockInitialAnimation: c ? c.initial === !1 : !1,
        reducedMotionConfig: d,
        skipAnimations: l,
        isSVG: r,
      })),
      f.current && h.current && (h.current.manuallyAnimateOnMount = !0)));
  const p = h.current,
    b = T.useContext(Ur);
  p &&
    !p.projection &&
    o &&
    (p.type === "html" || p.type === "svg") &&
    eh(h.current, n, o, b);
  const g = T.useRef(!1);
  T.useInsertionEffect(() => {
    p && g.current && p.update(n, c);
  });
  const y = n[Ji],
    k = T.useRef(
      !!y &&
        !window.MotionHandoffIsComplete?.(y) &&
        window.MotionHasOptimisedAnimation?.(y),
    );
  return (
    fi(() => {
      ((f.current = !0),
        p &&
          ((g.current = !0),
          (window.MotionIsMounted = !0),
          p.updateFeatures(),
          p.scheduleRenderMicrotask(),
          k.current && p.animationState && p.animationState.animateChanges()));
    }),
    T.useEffect(() => {
      p &&
        (!k.current && p.animationState && p.animationState.animateChanges(),
        k.current &&
          (queueMicrotask(() => {
            window.MotionHandoffMarkAsComplete?.(y);
          }),
          (k.current = !1)),
        (p.enteringChildren = void 0));
    }),
    p
  );
}
function eh(t, e, n, s) {
  const {
    layoutId: o,
    layout: r,
    drag: i,
    dragConstraints: a,
    layoutScroll: c,
    layoutRoot: u,
    layoutCrossfade: d,
  } = e;
  ((t.projection = new n(
    t.latestValues,
    e["data-framer-portal-id"] ? void 0 : Wr(t.parent),
  )),
    t.projection.setOptions({
      layoutId: o,
      layout: r,
      alwaysMeasureLayout: !!i || (a && Qt(a)),
      visualElement: t,
      animationType: typeof r == "string" ? r : "both",
      initialPromotionConfig: s,
      crossfade: d,
      layoutScroll: c,
      layoutRoot: u,
    }));
}
function Wr(t) {
  if (t) return t.options.allowProjection !== !1 ? t.projection : Wr(t.parent);
}
function xn(t, { forwardMotionProps: e = !1, type: n } = {}, s, o) {
  s && Id(s);
  const r = n ? n === "svg" : Vs(t),
    i = r ? Zd : Xd;
  function a(u, d) {
    let l;
    const h = { ...T.useContext(Cs), ...u, layoutId: nh(u) },
      { isStatic: f } = h,
      p = $d(u),
      b = i(u, f);
    if (!f && hi) {
      sh();
      const g = oh(h);
      ((l = g.MeasureLayout),
        (p.visualElement = th(t, b, h, o, g.ProjectionNode, r)));
    }
    return Dt.jsxs(on.Provider, {
      value: p,
      children: [
        l && p.visualElement
          ? Dt.jsx(l, { visualElement: p.visualElement, ...h })
          : null,
        Kd(t, u, Qd(b, p.visualElement, d), b, f, e, r),
      ],
    });
  }
  a.displayName = `motion.${typeof t == "string" ? t : `create(${t.displayName ?? t.name ?? ""})`}`;
  const c = T.forwardRef(a);
  return ((c[Jd] = t), c);
}
function nh({ layoutId: t }) {
  const e = T.useContext(Qn).id;
  return e && t !== void 0 ? e + "-" + t : t;
}
function sh(t, e) {
  T.useContext(Br).strict;
}
function oh(t) {
  const e = Fr(),
    { drag: n, layout: s } = e;
  if (!n && !s) return {};
  const o = { ...n, ...s };
  return {
    MeasureLayout:
      n?.isEnabled(t) || s?.isEnabled(t) ? o.MeasureLayout : void 0,
    ProjectionNode: o.ProjectionNode,
  };
}
function ih(t, e) {
  if (typeof Proxy > "u") return xn;
  const n = new Map(),
    s = (r, i) => xn(r, i, t, e),
    o = (r, i) => s(r, i);
  return new Proxy(o, {
    get: (r, i) =>
      i === "create"
        ? s
        : (n.has(i) || n.set(i, xn(i, void 0, t, e)), n.get(i)),
  });
}
const rh = (t, e) =>
  (e.isSVG ?? Vs(t))
    ? new Bu(e)
    : new Ru(e, { allowProjection: t !== T.Fragment });
class ah extends $t {
  constructor(e) {
    (super(e), e.animationState || (e.animationState = Hu(e)));
  }
  updateAnimationControlsSubscription() {
    const { animate: e } = this.node.getProps();
    nn(e) && (this.unmountControls = e.subscribe(this.node));
  }
  mount() {
    this.updateAnimationControlsSubscription();
  }
  update() {
    const { animate: e } = this.node.getProps(),
      { animate: n } = this.node.prevProps || {};
    e !== n && this.updateAnimationControlsSubscription();
  }
  unmount() {
    (this.node.animationState.reset(), this.unmountControls?.());
  }
}
let lh = 0;
class ch extends $t {
  constructor() {
    (super(...arguments), (this.id = lh++));
  }
  update() {
    if (!this.node.presenceContext) return;
    const { isPresent: e, onExitComplete: n } = this.node.presenceContext,
      { isPresent: s } = this.node.prevPresenceContext || {};
    if (!this.node.animationState || e === s) return;
    const o = this.node.animationState.setActive("exit", !e);
    n &&
      !e &&
      o.then(() => {
        n(this.id);
      });
  }
  mount() {
    const { register: e, onExitComplete: n } = this.node.presenceContext || {};
    (n && n(this.id), e && (this.unmount = e(this.id)));
  }
  unmount() {}
}
const uh = { animation: { Feature: ah }, exit: { Feature: ch } };
function Ce(t) {
  return { point: { x: t.pageX, y: t.pageY } };
}
const dh = (t) => (e) => ks(e) && t(e, Ce(e));
function be(t, e, n, s) {
  return Me(t, e, dh(n), s);
}
const Gr = ({ current: t }) => (t ? t.ownerDocument.defaultView : null),
  Xo = (t, e) => Math.abs(t - e);
function hh(t, e) {
  const n = Xo(t.x, e.x),
    s = Xo(t.y, e.y);
  return Math.sqrt(n ** 2 + s ** 2);
}
const Zo = new Set(["auto", "scroll"]);
class Kr {
  constructor(
    e,
    n,
    {
      transformPagePoint: s,
      contextWindow: o = window,
      dragSnapToOrigin: r = !1,
      distanceThreshold: i = 3,
      element: a,
    } = {},
  ) {
    if (
      ((this.startEvent = null),
      (this.lastMoveEvent = null),
      (this.lastMoveEventInfo = null),
      (this.handlers = {}),
      (this.contextWindow = window),
      (this.scrollPositions = new Map()),
      (this.removeScrollListeners = null),
      (this.onElementScroll = (f) => {
        this.handleScroll(f.target);
      }),
      (this.onWindowScroll = () => {
        this.handleScroll(window);
      }),
      (this.updatePoint = () => {
        if (!(this.lastMoveEvent && this.lastMoveEventInfo)) return;
        const f = kn(this.lastMoveEventInfo, this.history),
          p = this.startEvent !== null,
          b = hh(f.offset, { x: 0, y: 0 }) >= this.distanceThreshold;
        if (!p && !b) return;
        const { point: g } = f,
          { timestamp: y } = et;
        this.history.push({ ...g, timestamp: y });
        const { onStart: k, onMove: x } = this.handlers;
        (p ||
          (k && k(this.lastMoveEvent, f),
          (this.startEvent = this.lastMoveEvent)),
          x && x(this.lastMoveEvent, f));
      }),
      (this.handlePointerMove = (f, p) => {
        ((this.lastMoveEvent = f),
          (this.lastMoveEventInfo = wn(p, this.transformPagePoint)),
          O.update(this.updatePoint, !0));
      }),
      (this.handlePointerUp = (f, p) => {
        this.end();
        const { onEnd: b, onSessionEnd: g, resumeAnimation: y } = this.handlers;
        if (
          ((this.dragSnapToOrigin || !this.startEvent) && y && y(),
          !(this.lastMoveEvent && this.lastMoveEventInfo))
        )
          return;
        const k = kn(
          f.type === "pointercancel"
            ? this.lastMoveEventInfo
            : wn(p, this.transformPagePoint),
          this.history,
        );
        (this.startEvent && b && b(f, k), g && g(f, k));
      }),
      !ks(e))
    )
      return;
    ((this.dragSnapToOrigin = r),
      (this.handlers = n),
      (this.transformPagePoint = s),
      (this.distanceThreshold = i),
      (this.contextWindow = o || window));
    const c = Ce(e),
      u = wn(c, this.transformPagePoint),
      { point: d } = u,
      { timestamp: l } = et;
    this.history = [{ ...d, timestamp: l }];
    const { onSessionStart: h } = n;
    (h && h(e, kn(u, this.history)),
      (this.removeListeners = Se(
        be(this.contextWindow, "pointermove", this.handlePointerMove),
        be(this.contextWindow, "pointerup", this.handlePointerUp),
        be(this.contextWindow, "pointercancel", this.handlePointerUp),
      )),
      a && this.startScrollTracking(a));
  }
  startScrollTracking(e) {
    let n = e.parentElement;
    for (; n; ) {
      const s = getComputedStyle(n);
      ((Zo.has(s.overflowX) || Zo.has(s.overflowY)) &&
        this.scrollPositions.set(n, { x: n.scrollLeft, y: n.scrollTop }),
        (n = n.parentElement));
    }
    (this.scrollPositions.set(window, { x: window.scrollX, y: window.scrollY }),
      window.addEventListener("scroll", this.onElementScroll, {
        capture: !0,
        passive: !0,
      }),
      window.addEventListener("scroll", this.onWindowScroll, { passive: !0 }),
      (this.removeScrollListeners = () => {
        (window.removeEventListener("scroll", this.onElementScroll, {
          capture: !0,
        }),
          window.removeEventListener("scroll", this.onWindowScroll));
      }));
  }
  handleScroll(e) {
    const n = this.scrollPositions.get(e);
    if (!n) return;
    const s = e === window,
      o = s
        ? { x: window.scrollX, y: window.scrollY }
        : { x: e.scrollLeft, y: e.scrollTop },
      r = { x: o.x - n.x, y: o.y - n.y };
    (r.x === 0 && r.y === 0) ||
      (s
        ? this.lastMoveEventInfo &&
          ((this.lastMoveEventInfo.point.x += r.x),
          (this.lastMoveEventInfo.point.y += r.y))
        : this.history.length > 0 &&
          ((this.history[0].x -= r.x), (this.history[0].y -= r.y)),
      this.scrollPositions.set(e, o),
      O.update(this.updatePoint, !0));
  }
  updateHandlers(e) {
    this.handlers = e;
  }
  end() {
    (this.removeListeners && this.removeListeners(),
      this.removeScrollListeners && this.removeScrollListeners(),
      this.scrollPositions.clear(),
      Ft(this.updatePoint));
  }
}
function wn(t, e) {
  return e ? { point: e(t.point) } : t;
}
function Jo(t, e) {
  return { x: t.x - e.x, y: t.y - e.y };
}
function kn({ point: t }, e) {
  return {
    point: t,
    delta: Jo(t, qr(e)),
    offset: Jo(t, fh(e)),
    velocity: ph(e, 0.1),
  };
}
function fh(t) {
  return t[0];
}
function qr(t) {
  return t[t.length - 1];
}
function ph(t, e) {
  if (t.length < 2) return { x: 0, y: 0 };
  let n = t.length - 1,
    s = null;
  const o = qr(t);
  for (; n >= 0 && ((s = t[n]), !(o.timestamp - s.timestamp > Tt(e))); ) n--;
  if (!s) return { x: 0, y: 0 };
  s === t[0] &&
    t.length > 2 &&
    o.timestamp - s.timestamp > Tt(e) * 2 &&
    (s = t[1]);
  const r = pt(o.timestamp - s.timestamp);
  if (r === 0) return { x: 0, y: 0 };
  const i = { x: (o.x - s.x) / r, y: (o.y - s.y) / r };
  return (i.x === 1 / 0 && (i.x = 0), i.y === 1 / 0 && (i.y = 0), i);
}
function mh(t, { min: e, max: n }, s) {
  return (
    e !== void 0 && t < e
      ? (t = s ? U(e, t, s.min) : Math.max(t, e))
      : n !== void 0 && t > n && (t = s ? U(n, t, s.max) : Math.min(t, n)),
    t
  );
}
function Qo(t, e, n) {
  return {
    min: e !== void 0 ? t.min + e : void 0,
    max: n !== void 0 ? t.max + n - (t.max - t.min) : void 0,
  };
}
function yh(t, { top: e, left: n, bottom: s, right: o }) {
  return { x: Qo(t.x, n, o), y: Qo(t.y, e, s) };
}
function ti(t, e) {
  let n = e.min - t.min,
    s = e.max - t.max;
  return (
    e.max - e.min < t.max - t.min && ([n, s] = [s, n]),
    { min: n, max: s }
  );
}
function gh(t, e) {
  return { x: ti(t.x, e.x), y: ti(t.y, e.y) };
}
function vh(t, e) {
  let n = 0.5;
  const s = lt(t),
    o = lt(e);
  return (
    o > s
      ? (n = xe(e.min, e.max - s, t.min))
      : s > o && (n = xe(t.min, t.max - o, e.min)),
    At(0, 1, n)
  );
}
function bh(t, e) {
  const n = {};
  return (
    e.min !== void 0 && (n.min = e.min - t.min),
    e.max !== void 0 && (n.max = e.max - t.min),
    n
  );
}
const Xn = 0.35;
function xh(t = Xn) {
  return (
    t === !1 ? (t = 0) : t === !0 && (t = Xn),
    { x: ei(t, "left", "right"), y: ei(t, "top", "bottom") }
  );
}
function ei(t, e, n) {
  return { min: ni(t, e), max: ni(t, n) };
}
function ni(t, e) {
  return typeof t == "number" ? t : t[e] || 0;
}
const wh = new WeakMap();
class kh {
  constructor(e) {
    ((this.openDragLock = null),
      (this.isDragging = !1),
      (this.currentDirection = null),
      (this.originPoint = { x: 0, y: 0 }),
      (this.constraints = !1),
      (this.hasMutatedConstraints = !1),
      (this.elastic = Y()),
      (this.latestPointerEvent = null),
      (this.latestPanInfo = null),
      (this.visualElement = e));
  }
  start(e, { snapToCursor: n = !1, distanceThreshold: s } = {}) {
    const { presenceContext: o } = this.visualElement;
    if (o && o.isPresent === !1) return;
    const r = (l) => {
        (n && this.snapToCursor(Ce(l).point), this.stopAnimation());
      },
      i = (l, h) => {
        const { drag: f, dragPropagation: p, onDragStart: b } = this.getProps();
        if (
          f &&
          !p &&
          (this.openDragLock && this.openDragLock(),
          (this.openDragLock = Zc(f)),
          !this.openDragLock)
        )
          return;
        ((this.latestPointerEvent = l),
          (this.latestPanInfo = h),
          (this.isDragging = !0),
          (this.currentDirection = null),
          this.resolveConstraints(),
          this.visualElement.projection &&
            ((this.visualElement.projection.isAnimationBlocked = !0),
            (this.visualElement.projection.target = void 0)),
          St((y) => {
            let k = this.getAxisMotionValue(y).get() || 0;
            if (Pt.test(k)) {
              const { projection: x } = this.visualElement;
              if (x && x.layout) {
                const E = x.layout.layoutBox[y];
                E && (k = lt(E) * (parseFloat(k) / 100));
              }
            }
            this.originPoint[y] = k;
          }),
          b && O.update(() => b(l, h), !1, !0),
          On(this.visualElement, "transform"));
        const { animationState: g } = this.visualElement;
        g && g.setActive("whileDrag", !0);
      },
      a = (l, h) => {
        ((this.latestPointerEvent = l), (this.latestPanInfo = h));
        const {
          dragPropagation: f,
          dragDirectionLock: p,
          onDirectionLock: b,
          onDrag: g,
        } = this.getProps();
        if (!f && !this.openDragLock) return;
        const { offset: y } = h;
        if (p && this.currentDirection === null) {
          ((this.currentDirection = Mh(y)),
            this.currentDirection !== null && b && b(this.currentDirection));
          return;
        }
        (this.updateAxis("x", h.point, y),
          this.updateAxis("y", h.point, y),
          this.visualElement.render(),
          g && O.update(() => g(l, h), !1, !0));
      },
      c = (l, h) => {
        ((this.latestPointerEvent = l),
          (this.latestPanInfo = h),
          this.stop(l, h),
          (this.latestPointerEvent = null),
          (this.latestPanInfo = null));
      },
      u = () => {
        const { dragSnapToOrigin: l } = this.getProps();
        (l || this.constraints) && this.startAnimation({ x: 0, y: 0 });
      },
      { dragSnapToOrigin: d } = this.getProps();
    this.panSession = new Kr(
      e,
      {
        onSessionStart: r,
        onStart: i,
        onMove: a,
        onSessionEnd: c,
        resumeAnimation: u,
      },
      {
        transformPagePoint: this.visualElement.getTransformPagePoint(),
        dragSnapToOrigin: d,
        distanceThreshold: s,
        contextWindow: Gr(this.visualElement),
        element: this.visualElement.current,
      },
    );
  }
  stop(e, n) {
    const s = e || this.latestPointerEvent,
      o = n || this.latestPanInfo,
      r = this.isDragging;
    if ((this.cancel(), !r || !o || !s)) return;
    const { velocity: i } = o;
    this.startAnimation(i);
    const { onDragEnd: a } = this.getProps();
    a && O.postRender(() => a(s, o));
  }
  cancel() {
    this.isDragging = !1;
    const { projection: e, animationState: n } = this.visualElement;
    (e && (e.isAnimationBlocked = !1), this.endPanSession());
    const { dragPropagation: s } = this.getProps();
    (!s &&
      this.openDragLock &&
      (this.openDragLock(), (this.openDragLock = null)),
      n && n.setActive("whileDrag", !1));
  }
  endPanSession() {
    (this.panSession && this.panSession.end(), (this.panSession = void 0));
  }
  updateAxis(e, n, s) {
    const { drag: o } = this.getProps();
    if (!s || !Ie(e, o, this.currentDirection)) return;
    const r = this.getAxisMotionValue(e);
    let i = this.originPoint[e] + s[e];
    (this.constraints &&
      this.constraints[e] &&
      (i = mh(i, this.constraints[e], this.elastic[e])),
      r.set(i));
  }
  resolveConstraints() {
    const { dragConstraints: e, dragElastic: n } = this.getProps(),
      s =
        this.visualElement.projection && !this.visualElement.projection.layout
          ? this.visualElement.projection.measure(!1)
          : this.visualElement.projection?.layout,
      o = this.constraints;
    (e && Qt(e)
      ? this.constraints || (this.constraints = this.resolveRefConstraints())
      : e && s
        ? (this.constraints = yh(s.layoutBox, e))
        : (this.constraints = !1),
      (this.elastic = xh(n)),
      o !== this.constraints &&
        !Qt(e) &&
        s &&
        this.constraints &&
        !this.hasMutatedConstraints &&
        St((r) => {
          this.constraints !== !1 &&
            this.getAxisMotionValue(r) &&
            (this.constraints[r] = bh(s.layoutBox[r], this.constraints[r]));
        }));
  }
  resolveRefConstraints() {
    const { dragConstraints: e, onMeasureDragConstraints: n } = this.getProps();
    if (!e || !Qt(e)) return !1;
    const s = e.current,
      { projection: o } = this.visualElement;
    if (!o || !o.layout) return !1;
    const r = Pu(s, o.root, this.visualElement.getTransformPagePoint());
    let i = gh(o.layout.layoutBox, r);
    if (n) {
      const a = n(Tu(i));
      ((this.hasMutatedConstraints = !!a), a && (i = mr(a)));
    }
    return i;
  }
  startAnimation(e) {
    const {
        drag: n,
        dragMomentum: s,
        dragElastic: o,
        dragTransition: r,
        dragSnapToOrigin: i,
        onDragTransitionEnd: a,
      } = this.getProps(),
      c = this.constraints || {},
      u = St((d) => {
        if (!Ie(d, n, this.currentDirection)) return;
        let l = (c && c[d]) || {};
        i && (l = { min: 0, max: 0 });
        const h = o ? 200 : 1e6,
          f = o ? 40 : 1e7,
          p = {
            type: "inertia",
            velocity: s ? e[d] : 0,
            bounceStiffness: h,
            bounceDamping: f,
            timeConstant: 750,
            restDelta: 1,
            restSpeed: 10,
            ...r,
            ...l,
          };
        return this.startAxisValueAnimation(d, p);
      });
    return Promise.all(u).then(a);
  }
  startAxisValueAnimation(e, n) {
    const s = this.getAxisMotionValue(e);
    return (
      On(this.visualElement, e),
      s.start(gs(e, s, 0, n, this.visualElement, !1))
    );
  }
  stopAnimation() {
    St((e) => this.getAxisMotionValue(e).stop());
  }
  getAxisMotionValue(e) {
    const n = `_drag${e.toUpperCase()}`,
      s = this.visualElement.getProps(),
      o = s[n];
    return (
      o ||
      this.visualElement.getValue(e, (s.initial ? s.initial[e] : void 0) || 0)
    );
  }
  snapToCursor(e) {
    St((n) => {
      const { drag: s } = this.getProps();
      if (!Ie(n, s, this.currentDirection)) return;
      const { projection: o } = this.visualElement,
        r = this.getAxisMotionValue(n);
      if (o && o.layout) {
        const { min: i, max: a } = o.layout.layoutBox[n],
          c = r.get() || 0;
        r.set(e[n] - U(i, a, 0.5) + c);
      }
    });
  }
  scalePositionWithinConstraints() {
    if (!this.visualElement.current) return;
    const { drag: e, dragConstraints: n } = this.getProps(),
      { projection: s } = this.visualElement;
    if (!Qt(n) || !s || !this.constraints) return;
    this.stopAnimation();
    const o = { x: 0, y: 0 };
    St((i) => {
      const a = this.getAxisMotionValue(i);
      if (a && this.constraints !== !1) {
        const c = a.get();
        o[i] = vh({ min: c, max: c }, this.constraints[i]);
      }
    });
    const { transformTemplate: r } = this.visualElement.getProps();
    ((this.visualElement.current.style.transform = r ? r({}, "") : "none"),
      s.root && s.root.updateScroll(),
      s.updateLayout(),
      (this.constraints = !1),
      this.resolveConstraints(),
      St((i) => {
        if (!Ie(i, e, null)) return;
        const a = this.getAxisMotionValue(i),
          { min: c, max: u } = this.constraints[i];
        a.set(U(c, u, o[i]));
      }),
      this.visualElement.render());
  }
  addListeners() {
    if (!this.visualElement.current) return;
    wh.set(this.visualElement, this);
    const e = this.visualElement.current,
      n = be(e, "pointerdown", (u) => {
        const { drag: d, dragListener: l = !0 } = this.getProps(),
          h = u.target,
          f = h !== e && su(h);
        d && l && !f && this.start(u);
      });
    let s;
    const o = () => {
        const { dragConstraints: u } = this.getProps();
        Qt(u) &&
          u.current &&
          ((this.constraints = this.resolveRefConstraints()),
          s ||
            (s = Th(e, u.current, () =>
              this.scalePositionWithinConstraints(),
            )));
      },
      { projection: r } = this.visualElement,
      i = r.addEventListener("measure", o);
    (r && !r.layout && (r.root && r.root.updateScroll(), r.updateLayout()),
      O.read(o));
    const a = Me(window, "resize", () => this.scalePositionWithinConstraints()),
      c = r.addEventListener(
        "didUpdate",
        ({ delta: u, hasLayoutChanged: d }) => {
          this.isDragging &&
            d &&
            (St((l) => {
              const h = this.getAxisMotionValue(l);
              h &&
                ((this.originPoint[l] += u[l].translate),
                h.set(h.get() + u[l].translate));
            }),
            this.visualElement.render());
        },
      );
    return () => {
      (a(), n(), i(), c && c(), s && s());
    };
  }
  getProps() {
    const e = this.visualElement.getProps(),
      {
        drag: n = !1,
        dragDirectionLock: s = !1,
        dragPropagation: o = !1,
        dragConstraints: r = !1,
        dragElastic: i = Xn,
        dragMomentum: a = !0,
      } = e;
    return {
      ...e,
      drag: n,
      dragDirectionLock: s,
      dragPropagation: o,
      dragConstraints: r,
      dragElastic: i,
      dragMomentum: a,
    };
  }
}
function si(t) {
  let e = !0;
  return () => {
    if (e) {
      e = !1;
      return;
    }
    t();
  };
}
function Th(t, e, n) {
  const s = co(t, si(n)),
    o = co(e, si(n));
  return () => {
    (s(), o());
  };
}
function Ie(t, e, n) {
  return (e === !0 || e === t) && (n === null || n === t);
}
function Mh(t, e = 10) {
  let n = null;
  return (Math.abs(t.y) > e ? (n = "y") : Math.abs(t.x) > e && (n = "x"), n);
}
class Sh extends $t {
  constructor(e) {
    (super(e),
      (this.removeGroupControls = mt),
      (this.removeListeners = mt),
      (this.controls = new kh(e)));
  }
  mount() {
    const { dragControls: e } = this.node.getProps();
    (e && (this.removeGroupControls = e.subscribe(this.controls)),
      (this.removeListeners = this.controls.addListeners() || mt));
  }
  update() {
    const { dragControls: e } = this.node.getProps(),
      { dragControls: n } = this.node.prevProps || {};
    e !== n &&
      (this.removeGroupControls(),
      e && (this.removeGroupControls = e.subscribe(this.controls)));
  }
  unmount() {
    (this.removeGroupControls(),
      this.removeListeners(),
      this.controls.isDragging || this.controls.endPanSession());
  }
}
const Tn = (t) => (e, n) => {
  t && O.update(() => t(e, n), !1, !0);
};
class Ph extends $t {
  constructor() {
    (super(...arguments), (this.removePointerDownListener = mt));
  }
  onPointerDown(e) {
    this.session = new Kr(e, this.createPanHandlers(), {
      transformPagePoint: this.node.getTransformPagePoint(),
      contextWindow: Gr(this.node),
    });
  }
  createPanHandlers() {
    const {
      onPanSessionStart: e,
      onPanStart: n,
      onPan: s,
      onPanEnd: o,
    } = this.node.getProps();
    return {
      onSessionStart: Tn(e),
      onStart: Tn(n),
      onMove: Tn(s),
      onEnd: (r, i) => {
        (delete this.session, o && O.postRender(() => o(r, i)));
      },
    };
  }
  mount() {
    this.removePointerDownListener = be(this.node.current, "pointerdown", (e) =>
      this.onPointerDown(e),
    );
  }
  update() {
    this.session && this.session.updateHandlers(this.createPanHandlers());
  }
  unmount() {
    (this.removePointerDownListener(), this.session && this.session.end());
  }
}
let Mn = !1;
class Ah extends T.Component {
  componentDidMount() {
    const {
        visualElement: e,
        layoutGroup: n,
        switchLayoutGroup: s,
        layoutId: o,
      } = this.props,
      { projection: r } = e;
    (r &&
      (n.group && n.group.add(r),
      s && s.register && o && s.register(r),
      Mn && r.root.didUpdate(),
      r.addEventListener("animationComplete", () => {
        this.safeToRemove();
      }),
      r.setOptions({
        ...r.options,
        layoutDependency: this.props.layoutDependency,
        onExitComplete: () => this.safeToRemove(),
      })),
      (We.hasEverUpdated = !0));
  }
  getSnapshotBeforeUpdate(e) {
    const {
        layoutDependency: n,
        visualElement: s,
        drag: o,
        isPresent: r,
      } = this.props,
      { projection: i } = s;
    return (
      i &&
        ((i.isPresent = r),
        e.layoutDependency !== n &&
          i.setOptions({ ...i.options, layoutDependency: n }),
        (Mn = !0),
        o || e.layoutDependency !== n || n === void 0 || e.isPresent !== r
          ? i.willUpdate()
          : this.safeToRemove(),
        e.isPresent !== r &&
          (r
            ? i.promote()
            : i.relegate() ||
              O.postRender(() => {
                const a = i.getStack();
                (!a || !a.members.length) && this.safeToRemove();
              }))),
      null
    );
  }
  componentDidUpdate() {
    const { projection: e } = this.props.visualElement;
    e &&
      (e.root.didUpdate(),
      ws.postRender(() => {
        !e.currentAnimation && e.isLead() && this.safeToRemove();
      }));
  }
  componentWillUnmount() {
    const {
        visualElement: e,
        layoutGroup: n,
        switchLayoutGroup: s,
      } = this.props,
      { projection: o } = e;
    ((Mn = !0),
      o &&
        (o.scheduleCheckAfterUnmount(),
        n && n.group && n.group.remove(o),
        s && s.deregister && s.deregister(o)));
  }
  safeToRemove() {
    const { safeToRemove: e } = this.props;
    e && e();
  }
  render() {
    return null;
  }
}
function Yr(t) {
  const [e, n] = jr(),
    s = T.useContext(Qn);
  return Dt.jsx(Ah, {
    ...t,
    layoutGroup: s,
    switchLayoutGroup: T.useContext(Ur),
    isPresent: e,
    safeToRemove: n,
  });
}
const Ch = {
  pan: { Feature: Ph },
  drag: { Feature: Sh, ProjectionNode: Ir, MeasureLayout: Yr },
};
function oi(t, e, n) {
  const { props: s } = t;
  t.animationState &&
    s.whileHover &&
    t.animationState.setActive("whileHover", n === "Start");
  const o = "onHover" + n,
    r = s[o];
  r && O.postRender(() => r(e, Ce(e)));
}
class Eh extends $t {
  mount() {
    const { current: e } = this.node;
    e &&
      (this.unmount = Qc(
        e,
        (n, s) => (oi(this.node, s, "Start"), (o) => oi(this.node, o, "End")),
      ));
  }
  unmount() {}
}
class Vh extends $t {
  constructor() {
    (super(...arguments), (this.isActive = !1));
  }
  onFocus() {
    let e = !1;
    try {
      e = this.node.current.matches(":focus-visible");
    } catch {
      e = !0;
    }
    !e ||
      !this.node.animationState ||
      (this.node.animationState.setActive("whileFocus", !0),
      (this.isActive = !0));
  }
  onBlur() {
    !this.isActive ||
      !this.node.animationState ||
      (this.node.animationState.setActive("whileFocus", !1),
      (this.isActive = !1));
  }
  mount() {
    this.unmount = Se(
      Me(this.node.current, "focus", () => this.onFocus()),
      Me(this.node.current, "blur", () => this.onBlur()),
    );
  }
  unmount() {}
}
function ii(t, e, n) {
  const { props: s } = t;
  if (t.current instanceof HTMLButtonElement && t.current.disabled) return;
  t.animationState &&
    s.whileTap &&
    t.animationState.setActive("whileTap", n === "Start");
  const o = "onTap" + (n === "End" ? "" : n),
    r = s[o];
  r && O.postRender(() => r(e, Ce(e)));
}
class Dh extends $t {
  mount() {
    const { current: e } = this.node;
    if (!e) return;
    const { globalTapTarget: n, propagate: s } = this.node.props;
    this.unmount = iu(
      e,
      (o, r) => (
        ii(this.node, r, "Start"),
        (i, { success: a }) => ii(this.node, i, a ? "End" : "Cancel")
      ),
      { useGlobalTarget: n, stopPropagation: s?.tap === !1 },
    );
  }
  unmount() {}
}
const Zn = new WeakMap(),
  Sn = new WeakMap(),
  Rh = (t) => {
    const e = Zn.get(t.target);
    e && e(t);
  },
  _h = (t) => {
    t.forEach(Rh);
  };
function Lh({ root: t, ...e }) {
  const n = t || document;
  Sn.has(n) || Sn.set(n, {});
  const s = Sn.get(n),
    o = JSON.stringify(e);
  return (
    s[o] || (s[o] = new IntersectionObserver(_h, { root: t, ...e })),
    s[o]
  );
}
function Nh(t, e, n) {
  const s = Lh(e);
  return (
    Zn.set(t, n),
    s.observe(t),
    () => {
      (Zn.delete(t), s.unobserve(t));
    }
  );
}
const Ih = { some: 0, all: 1 };
class jh extends $t {
  constructor() {
    (super(...arguments), (this.hasEnteredView = !1), (this.isInView = !1));
  }
  startObserver() {
    this.unmount();
    const { viewport: e = {} } = this.node.getProps(),
      { root: n, margin: s, amount: o = "some", once: r } = e,
      i = {
        root: n ? n.current : void 0,
        rootMargin: s,
        threshold: typeof o == "number" ? o : Ih[o],
      },
      a = (c) => {
        const { isIntersecting: u } = c;
        if (
          this.isInView === u ||
          ((this.isInView = u), r && !u && this.hasEnteredView)
        )
          return;
        (u && (this.hasEnteredView = !0),
          this.node.animationState &&
            this.node.animationState.setActive("whileInView", u));
        const { onViewportEnter: d, onViewportLeave: l } = this.node.getProps(),
          h = u ? d : l;
        h && h(c);
      };
    return Nh(this.node.current, i, a);
  }
  mount() {
    this.startObserver();
  }
  update() {
    if (typeof IntersectionObserver > "u") return;
    const { props: e, prevProps: n } = this.node;
    ["amount", "margin", "root"].some(Bh(e, n)) && this.startObserver();
  }
  unmount() {}
}
function Bh({ viewport: t = {} }, { viewport: e = {} } = {}) {
  return (n) => t[n] !== e[n];
}
const Fh = {
    inView: { Feature: jh },
    tap: { Feature: Dh },
    focus: { Feature: Vh },
    hover: { Feature: Eh },
  },
  zh = { layout: { ProjectionNode: Ir, MeasureLayout: Yr } },
  $h = { ...uh, ...Fh, ...Ch, ...zh },
  Xm = ih($h, rh);
const Xr = (...t) =>
  t
    .filter((e, n, s) => !!e && e.trim() !== "" && s.indexOf(e) === n)
    .join(" ")
    .trim();
const Oh = (t) => t.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const Hh = (t) =>
  t.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, n, s) =>
    s ? s.toUpperCase() : n.toLowerCase(),
  );
const ri = (t) => {
  const e = Hh(t);
  return e.charAt(0).toUpperCase() + e.slice(1);
};
var Uh = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};
const Wh = (t) => {
  for (const e in t)
    if (e.startsWith("aria-") || e === "role" || e === "title") return !0;
  return !1;
};
const Gh = T.forwardRef(
  (
    {
      color: t = "currentColor",
      size: e = 24,
      strokeWidth: n = 2,
      absoluteStrokeWidth: s,
      className: o = "",
      children: r,
      iconNode: i,
      ...a
    },
    c,
  ) =>
    T.createElement(
      "svg",
      {
        ref: c,
        ...Uh,
        width: e,
        height: e,
        stroke: t,
        strokeWidth: s ? (Number(n) * 24) / Number(e) : n,
        className: Xr("lucide", o),
        ...(!r && !Wh(a) && { "aria-hidden": "true" }),
        ...a,
      },
      [
        ...i.map(([u, d]) => T.createElement(u, d)),
        ...(Array.isArray(r) ? r : [r]),
      ],
    ),
);
const m = (t, e) => {
  const n = T.forwardRef(({ className: s, ...o }, r) =>
    T.createElement(Gh, {
      ref: r,
      iconNode: e,
      className: Xr(`lucide-${Oh(ri(t))}`, `lucide-${t}`, s),
      ...o,
    }),
  );
  return ((n.displayName = ri(t)), n);
};
const Kh = [
    [
      "path",
      {
        d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
        key: "169zse",
      },
    ],
  ],
  Zm = m("activity", Kh);
const qh = [
    ["path", { d: "M12 5v14", key: "s699le" }],
    ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }],
  ],
  Jm = m("arrow-down", qh);
const Yh = [
    ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
    ["path", { d: "M19 12H5", key: "x3x0zl" }],
  ],
  Qm = m("arrow-left", Yh);
const Xh = [
    ["path", { d: "M5 12h14", key: "1ays0h" }],
    ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }],
  ],
  t1 = m("arrow-right", Xh);
const Zh = [
    ["path", { d: "m21 16-4 4-4-4", key: "f6ql7i" }],
    ["path", { d: "M17 20V4", key: "1ejh1v" }],
    ["path", { d: "m3 8 4-4 4 4", key: "11wl7u" }],
    ["path", { d: "M7 4v16", key: "1glfcx" }],
  ],
  e1 = m("arrow-up-down", Zh);
const Jh = [
    ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
    ["path", { d: "M12 19V5", key: "x0mq9r" }],
  ],
  n1 = m("arrow-up", Jh);
const Qh = [
    [
      "path",
      {
        d: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",
        key: "1yiouv",
      },
    ],
    ["circle", { cx: "12", cy: "8", r: "6", key: "1vp47v" }],
  ],
  s1 = m("award", Qh);
const tf = [
    ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }],
    [
      "path",
      {
        d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
        key: "11g9vi",
      },
    ],
  ],
  o1 = m("bell", tf);
const ef = [
    ["path", { d: "M10 2v8l3-3 3 3V2", key: "sqw3rj" }],
    [
      "path",
      {
        d: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20",
        key: "k3hazp",
      },
    ],
  ],
  i1 = m("book-marked", ef);
const nf = [
    ["path", { d: "M12 7v14", key: "1akyts" }],
    [
      "path",
      {
        d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
        key: "ruj8y",
      },
    ],
  ],
  r1 = m("book-open", nf);
const sf = [
    ["path", { d: "M12 8V4H8", key: "hb8ula" }],
    [
      "rect",
      { width: "16", height: "12", x: "4", y: "8", rx: "2", key: "enze0r" },
    ],
    ["path", { d: "M2 14h2", key: "vft8re" }],
    ["path", { d: "M20 14h2", key: "4cs60a" }],
    ["path", { d: "M15 13v2", key: "1xurst" }],
    ["path", { d: "M9 13v2", key: "rq6x2g" }],
  ],
  a1 = m("bot", sf);
const of = [
    ["path", { d: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16", key: "jecpp" }],
    [
      "rect",
      { width: "20", height: "14", x: "2", y: "6", rx: "2", key: "i6l2r4" },
    ],
  ],
  l1 = m("briefcase", of);
const rf = [
    ["path", { d: "M10 12h4", key: "a56b0p" }],
    ["path", { d: "M10 8h4", key: "1sr2af" }],
    ["path", { d: "M14 21v-3a2 2 0 0 0-4 0v3", key: "1rgiei" }],
    [
      "path",
      {
        d: "M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2",
        key: "secmi2",
      },
    ],
    ["path", { d: "M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16", key: "16ra0t" }],
  ],
  c1 = m("building-2", rf);
const af = [
    ["path", { d: "M8 2v4", key: "1cmpym" }],
    ["path", { d: "M16 2v4", key: "4m81vk" }],
    [
      "rect",
      { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" },
    ],
    ["path", { d: "M3 10h18", key: "8toen8" }],
    ["path", { d: "m9 16 2 2 4-4", key: "19s6y9" }],
  ],
  u1 = m("calendar-check", af);
const lf = [
    ["path", { d: "M8 2v4", key: "1cmpym" }],
    ["path", { d: "M16 2v4", key: "4m81vk" }],
    [
      "rect",
      { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" },
    ],
    ["path", { d: "M3 10h18", key: "8toen8" }],
    ["path", { d: "M8 14h.01", key: "6423bh" }],
    ["path", { d: "M12 14h.01", key: "1etili" }],
    ["path", { d: "M16 14h.01", key: "1gbofw" }],
    ["path", { d: "M8 18h.01", key: "lrp35t" }],
    ["path", { d: "M12 18h.01", key: "mhygvu" }],
    ["path", { d: "M16 18h.01", key: "kzsmim" }],
  ],
  d1 = m("calendar-days", lf);
const cf = [
    ["path", { d: "M8 2v4", key: "1cmpym" }],
    ["path", { d: "M16 2v4", key: "4m81vk" }],
    [
      "rect",
      { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" },
    ],
    ["path", { d: "M3 10h18", key: "8toen8" }],
  ],
  h1 = m("calendar", cf);
const uf = [
    [
      "path",
      {
        d: "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",
        key: "18u6gg",
      },
    ],
    ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }],
  ],
  f1 = m("camera", uf);
const df = [
    ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
    ["path", { d: "M18 17V9", key: "2bz60n" }],
    ["path", { d: "M13 17V5", key: "1frdt8" }],
    ["path", { d: "M8 17v-3", key: "17ska0" }],
  ],
  p1 = m("chart-column", df);
const hf = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]],
  m1 = m("check", hf);
const ff = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]],
  y1 = m("chevron-down", ff);
const pf = [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]],
  g1 = m("chevron-left", pf);
const mf = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]],
  v1 = m("chevron-right", mf);
const yf = [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]],
  b1 = m("chevron-up", yf);
const gf = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
    ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }],
  ],
  x1 = m("circle-alert", gf);
const vf = [
    ["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }],
    ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }],
  ],
  w1 = m("circle-check-big", vf);
const bf = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }],
  ],
  k1 = m("circle-check", bf);
const xf = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
  ],
  T1 = m("circle-dot", xf);
const wf = [
    [
      "rect",
      {
        width: "8",
        height: "4",
        x: "8",
        y: "2",
        rx: "1",
        ry: "1",
        key: "tgr4d6",
      },
    ],
    [
      "path",
      {
        d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
        key: "116196",
      },
    ],
    ["path", { d: "M12 11h4", key: "1jrz19" }],
    ["path", { d: "M12 16h4", key: "n85exb" }],
    ["path", { d: "M8 11h.01", key: "1dfujw" }],
    ["path", { d: "M8 16h.01", key: "18s6g9" }],
  ],
  M1 = m("clipboard-list", wf);
const kf = [
    ["path", { d: "M12 6v6l4 2", key: "mmk7yg" }],
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ],
  S1 = m("clock", kf);
const Tf = [
    [
      "rect",
      { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" },
    ],
    ["path", { d: "M12 3v18", key: "108xh3" }],
  ],
  P1 = m("columns-2", Tf);
const Mf = [
    [
      "rect",
      {
        width: "14",
        height: "14",
        x: "8",
        y: "8",
        rx: "2",
        ry: "2",
        key: "17jyea",
      },
    ],
    [
      "path",
      {
        d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
        key: "zix9uf",
      },
    ],
  ],
  A1 = m("copy", Mf);
const Sf = [
    [
      "path",
      {
        d: "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",
        key: "1vdc57",
      },
    ],
    ["path", { d: "M5 21h14", key: "11awu3" }],
  ],
  C1 = m("crown", Sf);
const Pf = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    ["line", { x1: "22", x2: "18", y1: "12", y2: "12", key: "l9bcsi" }],
    ["line", { x1: "6", x2: "2", y1: "12", y2: "12", key: "13hhkx" }],
    ["line", { x1: "12", x2: "12", y1: "6", y2: "2", key: "10w3f3" }],
    ["line", { x1: "12", x2: "12", y1: "22", y2: "18", key: "15g9kq" }],
  ],
  E1 = m("crosshair", Pf);
const Af = [
    ["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }],
    ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }],
    ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }],
  ],
  V1 = m("database", Af);
const Cf = [
    ["line", { x1: "12", x2: "12", y1: "2", y2: "22", key: "7eqyqh" }],
    [
      "path",
      { d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", key: "1b0p4s" },
    ],
  ],
  D1 = m("dollar-sign", Cf);
const Ef = [
    ["path", { d: "M12 15V3", key: "m9g1x1" }],
    ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
    ["path", { d: "m7 10 5 5 5-5", key: "brsn70" }],
  ],
  R1 = m("download", Ef);
const Vf = [
    ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
    ["circle", { cx: "12", cy: "5", r: "1", key: "gxeob9" }],
    ["circle", { cx: "12", cy: "19", r: "1", key: "lyex9k" }],
  ],
  _1 = m("ellipsis-vertical", Vf);
const Df = [
    ["path", { d: "M4 10h12", key: "1y6xl8" }],
    ["path", { d: "M4 14h9", key: "1loblj" }],
    [
      "path",
      {
        d: "M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2",
        key: "1j6lzo",
      },
    ],
  ],
  L1 = m("euro", Df);
const Rf = [
    ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
    ["path", { d: "M10 14 21 3", key: "gplh6r" }],
    [
      "path",
      {
        d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
        key: "a6xqqp",
      },
    ],
  ],
  N1 = m("external-link", Rf);
const _f = [
    [
      "path",
      {
        d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
        key: "ct8e1f",
      },
    ],
    ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242", key: "151rxh" }],
    [
      "path",
      {
        d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
        key: "13bj9a",
      },
    ],
    ["path", { d: "m2 2 20 20", key: "1ooewy" }],
  ],
  I1 = m("eye-off", _f);
const Lf = [
    [
      "path",
      {
        d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
        key: "1nclc0",
      },
    ],
    ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }],
  ],
  j1 = m("eye", Lf);
const Nf = [
    [
      "path",
      {
        d: "m18.226 5.226-2.52-2.52A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-.351",
        key: "1k2beg",
      },
    ],
    [
      "path",
      {
        d: "M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z",
        key: "2t3380",
      },
    ],
    ["path", { d: "M8 18h1", key: "13wk12" }],
  ],
  B1 = m("file-pen-line", Nf);
const If = [
    [
      "path",
      {
        d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
        key: "1oefj6",
      },
    ],
    ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
    ["path", { d: "M10 9H8", key: "b1mrlr" }],
    ["path", { d: "M16 13H8", key: "t4e002" }],
    ["path", { d: "M16 17H8", key: "z1uh3a" }],
  ],
  F1 = m("file-text", If);
const jf = [
    [
      "rect",
      { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" },
    ],
    ["path", { d: "M7 3v18", key: "bbkbws" }],
    ["path", { d: "M3 7.5h4", key: "zfgn84" }],
    ["path", { d: "M3 12h18", key: "1i2n21" }],
    ["path", { d: "M3 16.5h4", key: "1230mu" }],
    ["path", { d: "M17 3v18", key: "in4fa5" }],
    ["path", { d: "M17 7.5h4", key: "myr1c1" }],
    ["path", { d: "M17 16.5h4", key: "go4c1d" }],
  ],
  z1 = m("film", jf);
const Bf = [
    [
      "path",
      {
        d: "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4",
        key: "1slcih",
      },
    ],
  ],
  $1 = m("flame", Bf);
const Ff = [
    [
      "rect",
      { x: "3", y: "8", width: "18", height: "4", rx: "1", key: "bkv52" },
    ],
    ["path", { d: "M12 8v13", key: "1c76mn" }],
    ["path", { d: "M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7", key: "6wjy6b" }],
    [
      "path",
      {
        d: "M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5",
        key: "1ihvrl",
      },
    ],
  ],
  O1 = m("gift", Ff);
const zf = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    [
      "path",
      { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" },
    ],
    ["path", { d: "M2 12h20", key: "9i4pu4" }],
  ],
  H1 = m("globe", zf);
const $f = [
    [
      "path",
      {
        d: "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",
        key: "j76jl0",
      },
    ],
    ["path", { d: "M22 10v6", key: "1lu8f3" }],
    ["path", { d: "M6 12.5V16a6 3 0 0 0 12 0v-3.5", key: "1r8lef" }],
  ],
  U1 = m("graduation-cap", $f);
const Of = [
    [
      "rect",
      { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" },
    ],
    ["path", { d: "M3 9h18", key: "1pudct" }],
    ["path", { d: "M3 15h18", key: "5xshup" }],
    ["path", { d: "M9 3v18", key: "fh3hqa" }],
    ["path", { d: "M15 3v18", key: "14nvp0" }],
  ],
  W1 = m("grid-3x3", Of);
const Hf = [
    ["circle", { cx: "9", cy: "12", r: "1", key: "1vctgf" }],
    ["circle", { cx: "9", cy: "5", r: "1", key: "hp0tcf" }],
    ["circle", { cx: "9", cy: "19", r: "1", key: "fkjjf6" }],
    ["circle", { cx: "15", cy: "12", r: "1", key: "1tmaij" }],
    ["circle", { cx: "15", cy: "5", r: "1", key: "19l28e" }],
    ["circle", { cx: "15", cy: "19", r: "1", key: "f4zoj3" }],
  ],
  G1 = m("grip-vertical", Hf);
const Uf = [
    ["line", { x1: "4", x2: "20", y1: "9", y2: "9", key: "4lhtct" }],
    ["line", { x1: "4", x2: "20", y1: "15", y2: "15", key: "vyu0kd" }],
    ["line", { x1: "10", x2: "8", y1: "3", y2: "21", key: "1ggp8o" }],
    ["line", { x1: "16", x2: "14", y1: "3", y2: "21", key: "weycgp" }],
  ],
  K1 = m("hash", Uf);
const Wf = [
    [
      "path",
      {
        d: "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",
        key: "mvr1a0",
      },
    ],
  ],
  q1 = m("heart", Wf);
const Gf = [
    [
      "path",
      { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", key: "5wwlr5" },
    ],
    [
      "path",
      {
        d: "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
        key: "r6nss1",
      },
    ],
  ],
  Y1 = m("house", Gf);
const Kf = [
    [
      "rect",
      {
        width: "18",
        height: "18",
        x: "3",
        y: "3",
        rx: "2",
        ry: "2",
        key: "1m3agn",
      },
    ],
    ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }],
    ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }],
  ],
  X1 = m("image", Kf);
const qf = [
    [
      "polyline",
      { points: "22 12 16 12 14 15 10 15 8 12 2 12", key: "o97t9d" },
    ],
    [
      "path",
      {
        d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
        key: "oot6mr",
      },
    ],
  ],
  Z1 = m("inbox", qf);
const Yf = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    ["path", { d: "M12 16v-4", key: "1dtifu" }],
    ["path", { d: "M12 8h.01", key: "e9boi3" }],
  ],
  J1 = m("info", Yf);
const Xf = [
    [
      "rect",
      {
        width: "20",
        height: "20",
        x: "2",
        y: "2",
        rx: "5",
        ry: "5",
        key: "2e1cvw",
      },
    ],
    [
      "path",
      { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z", key: "9exkf1" },
    ],
    ["line", { x1: "17.5", x2: "17.51", y1: "6.5", y2: "6.5", key: "r4j83e" }],
  ],
  Q1 = m("instagram", Xf);
const Zf = [
    ["path", { d: "M10 8h.01", key: "1r9ogq" }],
    ["path", { d: "M12 12h.01", key: "1mp3jc" }],
    ["path", { d: "M14 8h.01", key: "1primd" }],
    ["path", { d: "M16 12h.01", key: "1l6xoz" }],
    ["path", { d: "M18 8h.01", key: "emo2bl" }],
    ["path", { d: "M6 8h.01", key: "x9i8wu" }],
    ["path", { d: "M7 16h10", key: "wp8him" }],
    ["path", { d: "M8 12h.01", key: "czm47f" }],
    [
      "rect",
      { width: "20", height: "16", x: "2", y: "4", rx: "2", key: "18n3k1" },
    ],
  ],
  t0 = m("keyboard", Zf);
const Jf = [
    [
      "rect",
      { width: "7", height: "9", x: "3", y: "3", rx: "1", key: "10lvy0" },
    ],
    [
      "rect",
      { width: "7", height: "5", x: "14", y: "3", rx: "1", key: "16une8" },
    ],
    [
      "rect",
      { width: "7", height: "9", x: "14", y: "12", rx: "1", key: "1hutg5" },
    ],
    [
      "rect",
      { width: "7", height: "5", x: "3", y: "16", rx: "1", key: "ldoo1y" },
    ],
  ],
  e0 = m("layout-dashboard", Jf);
const Qf = [
    [
      "rect",
      { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" },
    ],
    [
      "rect",
      { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" },
    ],
    ["path", { d: "M14 4h7", key: "3xa0d5" }],
    ["path", { d: "M14 9h7", key: "1icrd9" }],
    ["path", { d: "M14 15h7", key: "1mj8o2" }],
    ["path", { d: "M14 20h7", key: "11slyb" }],
  ],
  n0 = m("layout-list", Qf);
const tp = [
    ["path", { d: "M13 5h8", key: "a7qcls" }],
    ["path", { d: "M13 12h8", key: "h98zly" }],
    ["path", { d: "M13 19h8", key: "c3s6r1" }],
    ["path", { d: "m3 17 2 2 4-4", key: "1jhpwq" }],
    ["path", { d: "m3 7 2 2 4-4", key: "1obspn" }],
  ],
  s0 = m("list-checks", tp);
const ep = [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]],
  o0 = m("loader-circle", ep);
const np = [
    [
      "rect",
      {
        width: "18",
        height: "11",
        x: "3",
        y: "11",
        rx: "2",
        ry: "2",
        key: "1w4ew1",
      },
    ],
    ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }],
  ],
  i0 = m("lock", np);
const sp = [
    ["path", { d: "m10 17 5-5-5-5", key: "1bsop3" }],
    ["path", { d: "M15 12H3", key: "6jk70r" }],
    ["path", { d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4", key: "u53s6r" }],
  ],
  r0 = m("log-in", sp);
const op = [
    ["path", { d: "m16 17 5-5-5-5", key: "1bji2h" }],
    ["path", { d: "M21 12H9", key: "dn1m92" }],
    ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }],
  ],
  a0 = m("log-out", op);
const ip = [
    ["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7", key: "132q7q" }],
    [
      "rect",
      { x: "2", y: "4", width: "20", height: "16", rx: "2", key: "izxlao" },
    ],
  ],
  l0 = m("mail", ip);
const rp = [
    [
      "path",
      {
        d: "M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15",
        key: "143lza",
      },
    ],
    ["path", { d: "M11 12 5.12 2.2", key: "qhuxz6" }],
    ["path", { d: "m13 12 5.88-9.8", key: "hbye0f" }],
    ["path", { d: "M8 7h8", key: "i86dvs" }],
    ["circle", { cx: "12", cy: "17", r: "5", key: "qbz8iq" }],
    ["path", { d: "M12 18v-2h-.5", key: "fawc4q" }],
  ],
  c0 = m("medal", rp);
const ap = [
    ["path", { d: "M4 5h16", key: "1tepv9" }],
    ["path", { d: "M4 12h16", key: "1lakjw" }],
    ["path", { d: "M4 19h16", key: "1djgab" }],
  ],
  u0 = m("menu", ap);
const lp = [
    [
      "path",
      {
        d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
        key: "1sd12s",
      },
    ],
  ],
  d0 = m("message-circle", lp);
const cp = [
    [
      "path",
      {
        d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
        key: "18887p",
      },
    ],
  ],
  h0 = m("message-square", cp);
const up = [
    [
      "rect",
      { width: "20", height: "14", x: "2", y: "3", rx: "2", key: "48i651" },
    ],
    ["line", { x1: "8", x2: "16", y1: "21", y2: "21", key: "1svkeh" }],
    ["line", { x1: "12", x2: "12", y1: "17", y2: "21", key: "vw1qmm" }],
  ],
  f0 = m("monitor", up);
const dp = [
    [
      "path",
      {
        d: "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",
        key: "kfwtm",
      },
    ],
  ],
  p0 = m("moon", dp);
const hp = [
    [
      "rect",
      { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" },
    ],
    ["path", { d: "M9 3v18", key: "fh3hqa" }],
    ["path", { d: "m16 15-3-3 3-3", key: "14y99z" }],
  ],
  m0 = m("panel-left-close", hp);
const fp = [
    [
      "rect",
      { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" },
    ],
    ["path", { d: "M9 3v18", key: "fh3hqa" }],
  ],
  y0 = m("panel-left", fp);
const pp = [
    [
      "path",
      {
        d: "m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",
        key: "1miecu",
      },
    ],
  ],
  g0 = m("paperclip", pp);
const mp = [
    [
      "path",
      {
        d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
        key: "1a8usu",
      },
    ],
    ["path", { d: "m15 5 4 4", key: "1mk7zo" }],
  ],
  v0 = m("pencil", mp);
const yp = [
    ["line", { x1: "19", x2: "5", y1: "5", y2: "19", key: "1x9vlm" }],
    ["circle", { cx: "6.5", cy: "6.5", r: "2.5", key: "4mh3h7" }],
    ["circle", { cx: "17.5", cy: "17.5", r: "2.5", key: "1mdrzq" }],
  ],
  b0 = m("percent", yp);
const gp = [
    ["path", { d: "M13 2a9 9 0 0 1 9 9", key: "1itnx2" }],
    ["path", { d: "M13 6a5 5 0 0 1 5 5", key: "11nki7" }],
    [
      "path",
      {
        d: "M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",
        key: "9njp5v",
      },
    ],
  ],
  x0 = m("phone-call", gp);
const vp = [
    [
      "path",
      {
        d: "M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",
        key: "9njp5v",
      },
    ],
  ],
  w0 = m("phone", vp);
const bp = [
    ["path", { d: "M12 17v5", key: "bb1du9" }],
    [
      "path",
      {
        d: "M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z",
        key: "1nkz8b",
      },
    ],
  ],
  k0 = m("pin", bp);
const xp = [
    [
      "path",
      {
        d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
        key: "10ikf1",
      },
    ],
  ],
  T0 = m("play", xp);
const wp = [
    ["path", { d: "M5 12h14", key: "1ays0h" }],
    ["path", { d: "M12 5v14", key: "s699le" }],
  ],
  M0 = m("plus", wp);
const kp = [
    [
      "path",
      {
        d: "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z",
        key: "q3az6g",
      },
    ],
    ["path", { d: "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8", key: "1h4pet" }],
    ["path", { d: "M12 17.5v-11", key: "1jc1ny" }],
  ],
  S0 = m("receipt", kp);
const Tp = [
    [
      "path",
      {
        d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",
        key: "v9h5vc",
      },
    ],
    ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
    [
      "path",
      {
        d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",
        key: "3uifl3",
      },
    ],
    ["path", { d: "M8 16H3v5", key: "1cv678" }],
  ],
  P0 = m("refresh-cw", Tp);
const Mp = [
    ["path", { d: "m17 2 4 4-4 4", key: "nntrym" }],
    ["path", { d: "M3 11v-1a4 4 0 0 1 4-4h14", key: "84bu3i" }],
    ["path", { d: "m7 22-4-4 4-4", key: "1wqhfi" }],
    ["path", { d: "M21 13v1a4 4 0 0 1-4 4H3", key: "1rx37r" }],
  ],
  A0 = m("repeat", Mp);
const Sp = [
    [
      "path",
      {
        d: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z",
        key: "m3kijz",
      },
    ],
    [
      "path",
      {
        d: "m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z",
        key: "1fmvmk",
      },
    ],
    ["path", { d: "M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0", key: "1f8sc4" }],
    ["path", { d: "M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5", key: "qeys4" }],
  ],
  C0 = m("rocket", Sp);
const Pp = [
    [
      "path",
      {
        d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
        key: "1c8476",
      },
    ],
    ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
    ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }],
  ],
  E0 = m("save", Pp);
const Ap = [
    ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
    ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ],
  V0 = m("search", Ap);
const Cp = [
    [
      "path",
      {
        d: "M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z",
        key: "117uat",
      },
    ],
    ["path", { d: "M6 12h16", key: "s4cdu5" }],
  ],
  D0 = m("send-horizontal", Cp);
const Ep = [
    [
      "path",
      {
        d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
        key: "1ffxy3",
      },
    ],
    ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }],
  ],
  R0 = m("send", Ep);
const Vp = [
    ["path", { d: "M14 17H5", key: "gfn3mx" }],
    ["path", { d: "M19 7h-9", key: "6i9tg" }],
    ["circle", { cx: "17", cy: "17", r: "3", key: "18b49y" }],
    ["circle", { cx: "7", cy: "7", r: "3", key: "dfmy0x" }],
  ],
  _0 = m("settings-2", Vp);
const Dp = [
    [
      "path",
      {
        d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
        key: "1i5ecw",
      },
    ],
    ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }],
  ],
  L0 = m("settings", Dp);
const Rp = [
    [
      "path",
      {
        d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
        key: "oel41y",
      },
    ],
    ["path", { d: "M12 8v4", key: "1got3b" }],
    ["path", { d: "M12 16h.01", key: "1drbdi" }],
  ],
  N0 = m("shield-alert", Rp);
const _p = [
    [
      "path",
      {
        d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
        key: "oel41y",
      },
    ],
    ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }],
  ],
  I0 = m("shield-check", _p);
const Lp = [
    [
      "path",
      {
        d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
        key: "oel41y",
      },
    ],
  ],
  j0 = m("shield", Lp);
const Np = [
    ["path", { d: "M22 11v1a10 10 0 1 1-9-10", key: "ew0xw9" }],
    ["path", { d: "M8 14s1.5 2 4 2 4-2 4-2", key: "1y1vjs" }],
    ["line", { x1: "9", x2: "9.01", y1: "9", y2: "9", key: "yxxnd0" }],
    ["line", { x1: "15", x2: "15.01", y1: "9", y2: "9", key: "1p4y9e" }],
    ["path", { d: "M16 5h6", key: "1vod17" }],
    ["path", { d: "M19 2v6", key: "4bpg5p" }],
  ],
  B0 = m("smile-plus", Np);
const Ip = [
    [
      "path",
      {
        d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
        key: "1s2grr",
      },
    ],
    ["path", { d: "M20 2v4", key: "1rf3ol" }],
    ["path", { d: "M22 4h-4", key: "gwowj6" }],
    ["circle", { cx: "4", cy: "20", r: "2", key: "6kqj1y" }],
  ],
  F0 = m("sparkles", Ip);
const jp = [
    [
      "path",
      {
        d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
        key: "r04s7s",
      },
    ],
  ],
  z0 = m("star", jp);
const Bp = [
    ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
    ["path", { d: "M12 2v2", key: "tus03m" }],
    ["path", { d: "M12 20v2", key: "1lh1kg" }],
    ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }],
    ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }],
    ["path", { d: "M2 12h2", key: "1t8f8n" }],
    ["path", { d: "M20 12h2", key: "1q8mjw" }],
    ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }],
    ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }],
  ],
  $0 = m("sun", Bp);
const Fp = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    ["circle", { cx: "12", cy: "12", r: "6", key: "1vlfrh" }],
    ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }],
  ],
  O0 = m("target", Fp);
const zp = [
    ["path", { d: "M21 5H3", key: "1fi0y6" }],
    ["path", { d: "M15 12H3", key: "6jk70r" }],
    ["path", { d: "M17 19H3", key: "z6ezky" }],
  ],
  H0 = m("text-align-start", zp);
const $p = [
    [
      "path",
      {
        d: "M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z",
        key: "emmmcr",
      },
    ],
    ["path", { d: "M7 10v12", key: "1qc93n" }],
  ],
  U0 = m("thumbs-up", $p);
const Op = [
    ["circle", { cx: "9", cy: "12", r: "3", key: "u3jwor" }],
    [
      "rect",
      { width: "20", height: "14", x: "2", y: "5", rx: "7", key: "g7kal2" },
    ],
  ],
  W0 = m("toggle-left", Op);
const Hp = [
    ["path", { d: "M10 11v6", key: "nco0om" }],
    ["path", { d: "M14 11v6", key: "outv1u" }],
    ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
    ["path", { d: "M3 6h18", key: "d0wm0j" }],
    ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }],
  ],
  G0 = m("trash-2", Hp);
const Up = [
    ["path", { d: "M16 7h6v6", key: "box55l" }],
    ["path", { d: "m22 7-8.5 8.5-5-5L2 17", key: "1t1m79" }],
  ],
  K0 = m("trending-up", Up);
const Wp = [
    [
      "path",
      {
        d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
        key: "wmoenq",
      },
    ],
    ["path", { d: "M12 9v4", key: "juzpu7" }],
    ["path", { d: "M12 17h.01", key: "p32p05" }],
  ],
  q0 = m("triangle-alert", Wp);
const Gp = [
    [
      "path",
      {
        d: "M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978",
        key: "1n3hpd",
      },
    ],
    [
      "path",
      {
        d: "M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978",
        key: "rfe1zi",
      },
    ],
    ["path", { d: "M18 9h1.5a1 1 0 0 0 0-5H18", key: "7xy6bh" }],
    ["path", { d: "M4 22h16", key: "57wxv0" }],
    [
      "path",
      {
        d: "M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z",
        key: "1mhfuq",
      },
    ],
    ["path", { d: "M6 9H4.5a1 1 0 0 1 0-5H6", key: "tex48p" }],
  ],
  Y0 = m("trophy", Gp);
const Kp = [
    ["path", { d: "M12 4v16", key: "1654pz" }],
    ["path", { d: "M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2", key: "e0r10z" }],
    ["path", { d: "M9 20h6", key: "s66wpe" }],
  ],
  X0 = m("type", Kp);
const qp = [
    ["path", { d: "M12 3v12", key: "1x0j5s" }],
    ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
    ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ],
  Z0 = m("upload", qp);
const Yp = [
    ["path", { d: "M10 15H6a4 4 0 0 0-4 4v2", key: "1nfge6" }],
    ["path", { d: "m14.305 16.53.923-.382", key: "1itpsq" }],
    ["path", { d: "m15.228 13.852-.923-.383", key: "eplpkm" }],
    ["path", { d: "m16.852 12.228-.383-.923", key: "13v3q0" }],
    ["path", { d: "m16.852 17.772-.383.924", key: "1i8mnm" }],
    ["path", { d: "m19.148 12.228.383-.923", key: "1q8j1v" }],
    ["path", { d: "m19.53 18.696-.382-.924", key: "vk1qj3" }],
    ["path", { d: "m20.772 13.852.924-.383", key: "n880s0" }],
    ["path", { d: "m20.772 16.148.924.383", key: "1g6xey" }],
    ["circle", { cx: "18", cy: "15", r: "3", key: "gjjjvw" }],
    ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ],
  J0 = m("user-cog", Yp);
const Xp = [
    ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
    ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
    ["line", { x1: "19", x2: "19", y1: "8", y2: "14", key: "1bvyxn" }],
    ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }],
  ],
  Q0 = m("user-plus", Xp);
const Zp = [
    ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
    ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }],
  ],
  ty = m("user", Zp);
const Jp = [
    ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
    ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
    ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
    ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ],
  ey = m("users", Jp);
const Qp = [
    [
      "path",
      {
        d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",
        key: "18etb6",
      },
    ],
    ["path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4", key: "xoc0q4" }],
  ],
  ny = m("wallet", Qp);
const tm = [
    ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
    ["path", { d: "m6 6 12 12", key: "d8bk6v" }],
  ],
  sy = m("x", tm);
const em = [
    [
      "path",
      {
        d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
        key: "1xq2db",
      },
    ],
  ],
  oy = m("zap", em);
function Zr(t) {
  var e,
    n,
    s = "";
  if (typeof t == "string" || typeof t == "number") s += t;
  else if (typeof t == "object")
    if (Array.isArray(t)) {
      var o = t.length;
      for (e = 0; e < o; e++)
        t[e] && (n = Zr(t[e])) && (s && (s += " "), (s += n));
    } else for (n in t) t[n] && (s && (s += " "), (s += n));
  return s;
}
function iy() {
  for (var t, e, n = 0, s = "", o = arguments.length; n < o; n++)
    (t = arguments[n]) && (e = Zr(t)) && (s && (s += " "), (s += e));
  return s;
}
const nm = (t, e) => {
    const n = new Array(t.length + e.length);
    for (let s = 0; s < t.length; s++) n[s] = t[s];
    for (let s = 0; s < e.length; s++) n[t.length + s] = e[s];
    return n;
  },
  sm = (t, e) => ({ classGroupId: t, validator: e }),
  Jr = (t = new Map(), e = null, n) => ({
    nextPart: t,
    validators: e,
    classGroupId: n,
  }),
  tn = "-",
  ai = [],
  om = "arbitrary..",
  im = (t) => {
    const e = am(t),
      { conflictingClassGroups: n, conflictingClassGroupModifiers: s } = t;
    return {
      getClassGroupId: (i) => {
        if (i.startsWith("[") && i.endsWith("]")) return rm(i);
        const a = i.split(tn),
          c = a[0] === "" && a.length > 1 ? 1 : 0;
        return Qr(a, c, e);
      },
      getConflictingClassGroupIds: (i, a) => {
        if (a) {
          const c = s[i],
            u = n[i];
          return c ? (u ? nm(u, c) : c) : u || ai;
        }
        return n[i] || ai;
      },
    };
  },
  Qr = (t, e, n) => {
    if (t.length - e === 0) return n.classGroupId;
    const o = t[e],
      r = n.nextPart.get(o);
    if (r) {
      const u = Qr(t, e + 1, r);
      if (u) return u;
    }
    const i = n.validators;
    if (i === null) return;
    const a = e === 0 ? t.join(tn) : t.slice(e).join(tn),
      c = i.length;
    for (let u = 0; u < c; u++) {
      const d = i[u];
      if (d.validator(a)) return d.classGroupId;
    }
  },
  rm = (t) =>
    t.slice(1, -1).indexOf(":") === -1
      ? void 0
      : (() => {
          const e = t.slice(1, -1),
            n = e.indexOf(":"),
            s = e.slice(0, n);
          return s ? om + s : void 0;
        })(),
  am = (t) => {
    const { theme: e, classGroups: n } = t;
    return lm(n, e);
  },
  lm = (t, e) => {
    const n = Jr();
    for (const s in t) {
      const o = t[s];
      Ds(o, n, s, e);
    }
    return n;
  },
  Ds = (t, e, n, s) => {
    const o = t.length;
    for (let r = 0; r < o; r++) {
      const i = t[r];
      cm(i, e, n, s);
    }
  },
  cm = (t, e, n, s) => {
    if (typeof t == "string") {
      um(t, e, n);
      return;
    }
    if (typeof t == "function") {
      dm(t, e, n, s);
      return;
    }
    hm(t, e, n, s);
  },
  um = (t, e, n) => {
    const s = t === "" ? e : ta(e, t);
    s.classGroupId = n;
  },
  dm = (t, e, n, s) => {
    if (fm(t)) {
      Ds(t(s), e, n, s);
      return;
    }
    (e.validators === null && (e.validators = []), e.validators.push(sm(n, t)));
  },
  hm = (t, e, n, s) => {
    const o = Object.entries(t),
      r = o.length;
    for (let i = 0; i < r; i++) {
      const [a, c] = o[i];
      Ds(c, ta(e, a), n, s);
    }
  },
  ta = (t, e) => {
    let n = t;
    const s = e.split(tn),
      o = s.length;
    for (let r = 0; r < o; r++) {
      const i = s[r];
      let a = n.nextPart.get(i);
      (a || ((a = Jr()), n.nextPart.set(i, a)), (n = a));
    }
    return n;
  },
  fm = (t) => "isThemeGetter" in t && t.isThemeGetter === !0,
  pm = (t) => {
    if (t < 1) return { get: () => {}, set: () => {} };
    let e = 0,
      n = Object.create(null),
      s = Object.create(null);
    const o = (r, i) => {
      ((n[r] = i), e++, e > t && ((e = 0), (s = n), (n = Object.create(null))));
    };
    return {
      get(r) {
        let i = n[r];
        if (i !== void 0) return i;
        if ((i = s[r]) !== void 0) return (o(r, i), i);
      },
      set(r, i) {
        r in n ? (n[r] = i) : o(r, i);
      },
    };
  },
  Jn = "!",
  li = ":",
  mm = [],
  ci = (t, e, n, s, o) => ({
    modifiers: t,
    hasImportantModifier: e,
    baseClassName: n,
    maybePostfixModifierPosition: s,
    isExternal: o,
  }),
  ym = (t) => {
    const { prefix: e, experimentalParseClassName: n } = t;
    let s = (o) => {
      const r = [];
      let i = 0,
        a = 0,
        c = 0,
        u;
      const d = o.length;
      for (let b = 0; b < d; b++) {
        const g = o[b];
        if (i === 0 && a === 0) {
          if (g === li) {
            (r.push(o.slice(c, b)), (c = b + 1));
            continue;
          }
          if (g === "/") {
            u = b;
            continue;
          }
        }
        g === "[" ? i++ : g === "]" ? i-- : g === "(" ? a++ : g === ")" && a--;
      }
      const l = r.length === 0 ? o : o.slice(c);
      let h = l,
        f = !1;
      l.endsWith(Jn)
        ? ((h = l.slice(0, -1)), (f = !0))
        : l.startsWith(Jn) && ((h = l.slice(1)), (f = !0));
      const p = u && u > c ? u - c : void 0;
      return ci(r, f, h, p);
    };
    if (e) {
      const o = e + li,
        r = s;
      s = (i) =>
        i.startsWith(o) ? r(i.slice(o.length)) : ci(mm, !1, i, void 0, !0);
    }
    if (n) {
      const o = s;
      s = (r) => n({ className: r, parseClassName: o });
    }
    return s;
  },
  gm = (t) => {
    const e = new Map();
    return (
      t.orderSensitiveModifiers.forEach((n, s) => {
        e.set(n, 1e6 + s);
      }),
      (n) => {
        const s = [];
        let o = [];
        for (let r = 0; r < n.length; r++) {
          const i = n[r],
            a = i[0] === "[",
            c = e.has(i);
          a || c
            ? (o.length > 0 && (o.sort(), s.push(...o), (o = [])), s.push(i))
            : o.push(i);
        }
        return (o.length > 0 && (o.sort(), s.push(...o)), s);
      }
    );
  },
  vm = (t) => ({
    cache: pm(t.cacheSize),
    parseClassName: ym(t),
    sortModifiers: gm(t),
    ...im(t),
  }),
  bm = /\s+/,
  xm = (t, e) => {
    const {
        parseClassName: n,
        getClassGroupId: s,
        getConflictingClassGroupIds: o,
        sortModifiers: r,
      } = e,
      i = [],
      a = t.trim().split(bm);
    let c = "";
    for (let u = a.length - 1; u >= 0; u -= 1) {
      const d = a[u],
        {
          isExternal: l,
          modifiers: h,
          hasImportantModifier: f,
          baseClassName: p,
          maybePostfixModifierPosition: b,
        } = n(d);
      if (l) {
        c = d + (c.length > 0 ? " " + c : c);
        continue;
      }
      let g = !!b,
        y = s(g ? p.substring(0, b) : p);
      if (!y) {
        if (!g) {
          c = d + (c.length > 0 ? " " + c : c);
          continue;
        }
        if (((y = s(p)), !y)) {
          c = d + (c.length > 0 ? " " + c : c);
          continue;
        }
        g = !1;
      }
      const k = h.length === 0 ? "" : h.length === 1 ? h[0] : r(h).join(":"),
        x = f ? k + Jn : k,
        E = x + y;
      if (i.indexOf(E) > -1) continue;
      i.push(E);
      const S = o(y, g);
      for (let D = 0; D < S.length; ++D) {
        const B = S[D];
        i.push(x + B);
      }
      c = d + (c.length > 0 ? " " + c : c);
    }
    return c;
  },
  wm = (...t) => {
    let e = 0,
      n,
      s,
      o = "";
    for (; e < t.length; )
      (n = t[e++]) && (s = ea(n)) && (o && (o += " "), (o += s));
    return o;
  },
  ea = (t) => {
    if (typeof t == "string") return t;
    let e,
      n = "";
    for (let s = 0; s < t.length; s++)
      t[s] && (e = ea(t[s])) && (n && (n += " "), (n += e));
    return n;
  },
  km = (t, ...e) => {
    let n, s, o, r;
    const i = (c) => {
        const u = e.reduce((d, l) => l(d), t());
        return (
          (n = vm(u)),
          (s = n.cache.get),
          (o = n.cache.set),
          (r = a),
          a(c)
        );
      },
      a = (c) => {
        const u = s(c);
        if (u) return u;
        const d = xm(c, n);
        return (o(c, d), d);
      };
    return ((r = i), (...c) => r(wm(...c)));
  },
  Tm = [],
  q = (t) => {
    const e = (n) => n[t] || Tm;
    return ((e.isThemeGetter = !0), e);
  },
  na = /^\[(?:(\w[\w-]*):)?(.+)\]$/i,
  sa = /^\((?:(\w[\w-]*):)?(.+)\)$/i,
  Mm = /^\d+\/\d+$/,
  Sm = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,
  Pm =
    /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,
  Am = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/,
  Cm = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,
  Em =
    /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,
  Jt = (t) => Mm.test(t),
  N = (t) => !!t && !Number.isNaN(Number(t)),
  It = (t) => !!t && Number.isInteger(Number(t)),
  Pn = (t) => t.endsWith("%") && N(t.slice(0, -1)),
  Vt = (t) => Sm.test(t),
  Vm = () => !0,
  Dm = (t) => Pm.test(t) && !Am.test(t),
  oa = () => !1,
  Rm = (t) => Cm.test(t),
  _m = (t) => Em.test(t),
  Lm = (t) => !P(t) && !A(t),
  Nm = (t) => ue(t, aa, oa),
  P = (t) => na.test(t),
  Ut = (t) => ue(t, la, Dm),
  An = (t) => ue(t, zm, N),
  ui = (t) => ue(t, ia, oa),
  Im = (t) => ue(t, ra, _m),
  je = (t) => ue(t, ca, Rm),
  A = (t) => sa.test(t),
  pe = (t) => de(t, la),
  jm = (t) => de(t, $m),
  di = (t) => de(t, ia),
  Bm = (t) => de(t, aa),
  Fm = (t) => de(t, ra),
  Be = (t) => de(t, ca, !0),
  ue = (t, e, n) => {
    const s = na.exec(t);
    return s ? (s[1] ? e(s[1]) : n(s[2])) : !1;
  },
  de = (t, e, n = !1) => {
    const s = sa.exec(t);
    return s ? (s[1] ? e(s[1]) : n) : !1;
  },
  ia = (t) => t === "position" || t === "percentage",
  ra = (t) => t === "image" || t === "url",
  aa = (t) => t === "length" || t === "size" || t === "bg-size",
  la = (t) => t === "length",
  zm = (t) => t === "number",
  $m = (t) => t === "family-name",
  ca = (t) => t === "shadow",
  Om = () => {
    const t = q("color"),
      e = q("font"),
      n = q("text"),
      s = q("font-weight"),
      o = q("tracking"),
      r = q("leading"),
      i = q("breakpoint"),
      a = q("container"),
      c = q("spacing"),
      u = q("radius"),
      d = q("shadow"),
      l = q("inset-shadow"),
      h = q("text-shadow"),
      f = q("drop-shadow"),
      p = q("blur"),
      b = q("perspective"),
      g = q("aspect"),
      y = q("ease"),
      k = q("animate"),
      x = () => [
        "auto",
        "avoid",
        "all",
        "avoid-page",
        "page",
        "left",
        "right",
        "column",
      ],
      E = () => [
        "center",
        "top",
        "bottom",
        "left",
        "right",
        "top-left",
        "left-top",
        "top-right",
        "right-top",
        "bottom-right",
        "right-bottom",
        "bottom-left",
        "left-bottom",
      ],
      S = () => [...E(), A, P],
      D = () => ["auto", "hidden", "clip", "visible", "scroll"],
      B = () => ["auto", "contain", "none"],
      v = () => [A, P, c],
      R = () => [Jt, "full", "auto", ...v()],
      F = () => [It, "none", "subgrid", A, P],
      J = () => ["auto", { span: ["full", It, A, P] }, It, A, P],
      nt = () => [It, "auto", A, P],
      Q = () => ["auto", "min", "max", "fr", A, P],
      yt = () => [
        "start",
        "end",
        "center",
        "between",
        "around",
        "evenly",
        "stretch",
        "baseline",
        "center-safe",
        "end-safe",
      ],
      it = () => [
        "start",
        "end",
        "center",
        "stretch",
        "center-safe",
        "end-safe",
      ],
      I = () => ["auto", ...v()],
      _ = () => [
        Jt,
        "auto",
        "full",
        "dvw",
        "dvh",
        "lvw",
        "lvh",
        "svw",
        "svh",
        "min",
        "max",
        "fit",
        ...v(),
      ],
      M = () => [t, A, P],
      X = () => [...E(), di, ui, { position: [A, P] }],
      G = () => ["no-repeat", { repeat: ["", "x", "y", "space", "round"] }],
      ht = () => ["auto", "cover", "contain", Bm, Nm, { size: [A, P] }],
      _t = () => [Pn, pe, Ut],
      V = () => ["", "none", "full", u, A, P],
      j = () => ["", N, pe, Ut],
      z = () => ["solid", "dashed", "dotted", "double"],
      rt = () => [
        "normal",
        "multiply",
        "screen",
        "overlay",
        "darken",
        "lighten",
        "color-dodge",
        "color-burn",
        "hard-light",
        "soft-light",
        "difference",
        "exclusion",
        "hue",
        "saturation",
        "color",
        "luminosity",
      ],
      H = () => [N, Pn, di, ui],
      $ = () => ["", "none", p, A, P],
      gt = () => ["none", N, A, P],
      Ct = () => ["none", N, A, P],
      Lt = () => [N, A, P],
      vt = () => [Jt, "full", ...v()];
    return {
      cacheSize: 500,
      theme: {
        animate: ["spin", "ping", "pulse", "bounce"],
        aspect: ["video"],
        blur: [Vt],
        breakpoint: [Vt],
        color: [Vm],
        container: [Vt],
        "drop-shadow": [Vt],
        ease: ["in", "out", "in-out"],
        font: [Lm],
        "font-weight": [
          "thin",
          "extralight",
          "light",
          "normal",
          "medium",
          "semibold",
          "bold",
          "extrabold",
          "black",
        ],
        "inset-shadow": [Vt],
        leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
        perspective: [
          "dramatic",
          "near",
          "normal",
          "midrange",
          "distant",
          "none",
        ],
        radius: [Vt],
        shadow: [Vt],
        spacing: ["px", N],
        text: [Vt],
        "text-shadow": [Vt],
        tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"],
      },
      classGroups: {
        aspect: [{ aspect: ["auto", "square", Jt, P, A, g] }],
        container: ["container"],
        columns: [{ columns: [N, P, A, a] }],
        "break-after": [{ "break-after": x() }],
        "break-before": [{ "break-before": x() }],
        "break-inside": [
          { "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"] },
        ],
        "box-decoration": [{ "box-decoration": ["slice", "clone"] }],
        box: [{ box: ["border", "content"] }],
        display: [
          "block",
          "inline-block",
          "inline",
          "flex",
          "inline-flex",
          "table",
          "inline-table",
          "table-caption",
          "table-cell",
          "table-column",
          "table-column-group",
          "table-footer-group",
          "table-header-group",
          "table-row-group",
          "table-row",
          "flow-root",
          "grid",
          "inline-grid",
          "contents",
          "list-item",
          "hidden",
        ],
        sr: ["sr-only", "not-sr-only"],
        float: [{ float: ["right", "left", "none", "start", "end"] }],
        clear: [{ clear: ["left", "right", "both", "none", "start", "end"] }],
        isolation: ["isolate", "isolation-auto"],
        "object-fit": [
          { object: ["contain", "cover", "fill", "none", "scale-down"] },
        ],
        "object-position": [{ object: S() }],
        overflow: [{ overflow: D() }],
        "overflow-x": [{ "overflow-x": D() }],
        "overflow-y": [{ "overflow-y": D() }],
        overscroll: [{ overscroll: B() }],
        "overscroll-x": [{ "overscroll-x": B() }],
        "overscroll-y": [{ "overscroll-y": B() }],
        position: ["static", "fixed", "absolute", "relative", "sticky"],
        inset: [{ inset: R() }],
        "inset-x": [{ "inset-x": R() }],
        "inset-y": [{ "inset-y": R() }],
        start: [{ start: R() }],
        end: [{ end: R() }],
        top: [{ top: R() }],
        right: [{ right: R() }],
        bottom: [{ bottom: R() }],
        left: [{ left: R() }],
        visibility: ["visible", "invisible", "collapse"],
        z: [{ z: [It, "auto", A, P] }],
        basis: [{ basis: [Jt, "full", "auto", a, ...v()] }],
        "flex-direction": [
          { flex: ["row", "row-reverse", "col", "col-reverse"] },
        ],
        "flex-wrap": [{ flex: ["nowrap", "wrap", "wrap-reverse"] }],
        flex: [{ flex: [N, Jt, "auto", "initial", "none", P] }],
        grow: [{ grow: ["", N, A, P] }],
        shrink: [{ shrink: ["", N, A, P] }],
        order: [{ order: [It, "first", "last", "none", A, P] }],
        "grid-cols": [{ "grid-cols": F() }],
        "col-start-end": [{ col: J() }],
        "col-start": [{ "col-start": nt() }],
        "col-end": [{ "col-end": nt() }],
        "grid-rows": [{ "grid-rows": F() }],
        "row-start-end": [{ row: J() }],
        "row-start": [{ "row-start": nt() }],
        "row-end": [{ "row-end": nt() }],
        "grid-flow": [
          { "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"] },
        ],
        "auto-cols": [{ "auto-cols": Q() }],
        "auto-rows": [{ "auto-rows": Q() }],
        gap: [{ gap: v() }],
        "gap-x": [{ "gap-x": v() }],
        "gap-y": [{ "gap-y": v() }],
        "justify-content": [{ justify: [...yt(), "normal"] }],
        "justify-items": [{ "justify-items": [...it(), "normal"] }],
        "justify-self": [{ "justify-self": ["auto", ...it()] }],
        "align-content": [{ content: ["normal", ...yt()] }],
        "align-items": [{ items: [...it(), { baseline: ["", "last"] }] }],
        "align-self": [{ self: ["auto", ...it(), { baseline: ["", "last"] }] }],
        "place-content": [{ "place-content": yt() }],
        "place-items": [{ "place-items": [...it(), "baseline"] }],
        "place-self": [{ "place-self": ["auto", ...it()] }],
        p: [{ p: v() }],
        px: [{ px: v() }],
        py: [{ py: v() }],
        ps: [{ ps: v() }],
        pe: [{ pe: v() }],
        pt: [{ pt: v() }],
        pr: [{ pr: v() }],
        pb: [{ pb: v() }],
        pl: [{ pl: v() }],
        m: [{ m: I() }],
        mx: [{ mx: I() }],
        my: [{ my: I() }],
        ms: [{ ms: I() }],
        me: [{ me: I() }],
        mt: [{ mt: I() }],
        mr: [{ mr: I() }],
        mb: [{ mb: I() }],
        ml: [{ ml: I() }],
        "space-x": [{ "space-x": v() }],
        "space-x-reverse": ["space-x-reverse"],
        "space-y": [{ "space-y": v() }],
        "space-y-reverse": ["space-y-reverse"],
        size: [{ size: _() }],
        w: [{ w: [a, "screen", ..._()] }],
        "min-w": [{ "min-w": [a, "screen", "none", ..._()] }],
        "max-w": [
          { "max-w": [a, "screen", "none", "prose", { screen: [i] }, ..._()] },
        ],
        h: [{ h: ["screen", "lh", ..._()] }],
        "min-h": [{ "min-h": ["screen", "lh", "none", ..._()] }],
        "max-h": [{ "max-h": ["screen", "lh", ..._()] }],
        "font-size": [{ text: ["base", n, pe, Ut] }],
        "font-smoothing": ["antialiased", "subpixel-antialiased"],
        "font-style": ["italic", "not-italic"],
        "font-weight": [{ font: [s, A, An] }],
        "font-stretch": [
          {
            "font-stretch": [
              "ultra-condensed",
              "extra-condensed",
              "condensed",
              "semi-condensed",
              "normal",
              "semi-expanded",
              "expanded",
              "extra-expanded",
              "ultra-expanded",
              Pn,
              P,
            ],
          },
        ],
        "font-family": [{ font: [jm, P, e] }],
        "fvn-normal": ["normal-nums"],
        "fvn-ordinal": ["ordinal"],
        "fvn-slashed-zero": ["slashed-zero"],
        "fvn-figure": ["lining-nums", "oldstyle-nums"],
        "fvn-spacing": ["proportional-nums", "tabular-nums"],
        "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
        tracking: [{ tracking: [o, A, P] }],
        "line-clamp": [{ "line-clamp": [N, "none", A, An] }],
        leading: [{ leading: [r, ...v()] }],
        "list-image": [{ "list-image": ["none", A, P] }],
        "list-style-position": [{ list: ["inside", "outside"] }],
        "list-style-type": [{ list: ["disc", "decimal", "none", A, P] }],
        "text-alignment": [
          { text: ["left", "center", "right", "justify", "start", "end"] },
        ],
        "placeholder-color": [{ placeholder: M() }],
        "text-color": [{ text: M() }],
        "text-decoration": [
          "underline",
          "overline",
          "line-through",
          "no-underline",
        ],
        "text-decoration-style": [{ decoration: [...z(), "wavy"] }],
        "text-decoration-thickness": [
          { decoration: [N, "from-font", "auto", A, Ut] },
        ],
        "text-decoration-color": [{ decoration: M() }],
        "underline-offset": [{ "underline-offset": [N, "auto", A, P] }],
        "text-transform": [
          "uppercase",
          "lowercase",
          "capitalize",
          "normal-case",
        ],
        "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
        "text-wrap": [{ text: ["wrap", "nowrap", "balance", "pretty"] }],
        indent: [{ indent: v() }],
        "vertical-align": [
          {
            align: [
              "baseline",
              "top",
              "middle",
              "bottom",
              "text-top",
              "text-bottom",
              "sub",
              "super",
              A,
              P,
            ],
          },
        ],
        whitespace: [
          {
            whitespace: [
              "normal",
              "nowrap",
              "pre",
              "pre-line",
              "pre-wrap",
              "break-spaces",
            ],
          },
        ],
        break: [{ break: ["normal", "words", "all", "keep"] }],
        wrap: [{ wrap: ["break-word", "anywhere", "normal"] }],
        hyphens: [{ hyphens: ["none", "manual", "auto"] }],
        content: [{ content: ["none", A, P] }],
        "bg-attachment": [{ bg: ["fixed", "local", "scroll"] }],
        "bg-clip": [{ "bg-clip": ["border", "padding", "content", "text"] }],
        "bg-origin": [{ "bg-origin": ["border", "padding", "content"] }],
        "bg-position": [{ bg: X() }],
        "bg-repeat": [{ bg: G() }],
        "bg-size": [{ bg: ht() }],
        "bg-image": [
          {
            bg: [
              "none",
              {
                linear: [
                  { to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"] },
                  It,
                  A,
                  P,
                ],
                radial: ["", A, P],
                conic: [It, A, P],
              },
              Fm,
              Im,
            ],
          },
        ],
        "bg-color": [{ bg: M() }],
        "gradient-from-pos": [{ from: _t() }],
        "gradient-via-pos": [{ via: _t() }],
        "gradient-to-pos": [{ to: _t() }],
        "gradient-from": [{ from: M() }],
        "gradient-via": [{ via: M() }],
        "gradient-to": [{ to: M() }],
        rounded: [{ rounded: V() }],
        "rounded-s": [{ "rounded-s": V() }],
        "rounded-e": [{ "rounded-e": V() }],
        "rounded-t": [{ "rounded-t": V() }],
        "rounded-r": [{ "rounded-r": V() }],
        "rounded-b": [{ "rounded-b": V() }],
        "rounded-l": [{ "rounded-l": V() }],
        "rounded-ss": [{ "rounded-ss": V() }],
        "rounded-se": [{ "rounded-se": V() }],
        "rounded-ee": [{ "rounded-ee": V() }],
        "rounded-es": [{ "rounded-es": V() }],
        "rounded-tl": [{ "rounded-tl": V() }],
        "rounded-tr": [{ "rounded-tr": V() }],
        "rounded-br": [{ "rounded-br": V() }],
        "rounded-bl": [{ "rounded-bl": V() }],
        "border-w": [{ border: j() }],
        "border-w-x": [{ "border-x": j() }],
        "border-w-y": [{ "border-y": j() }],
        "border-w-s": [{ "border-s": j() }],
        "border-w-e": [{ "border-e": j() }],
        "border-w-t": [{ "border-t": j() }],
        "border-w-r": [{ "border-r": j() }],
        "border-w-b": [{ "border-b": j() }],
        "border-w-l": [{ "border-l": j() }],
        "divide-x": [{ "divide-x": j() }],
        "divide-x-reverse": ["divide-x-reverse"],
        "divide-y": [{ "divide-y": j() }],
        "divide-y-reverse": ["divide-y-reverse"],
        "border-style": [{ border: [...z(), "hidden", "none"] }],
        "divide-style": [{ divide: [...z(), "hidden", "none"] }],
        "border-color": [{ border: M() }],
        "border-color-x": [{ "border-x": M() }],
        "border-color-y": [{ "border-y": M() }],
        "border-color-s": [{ "border-s": M() }],
        "border-color-e": [{ "border-e": M() }],
        "border-color-t": [{ "border-t": M() }],
        "border-color-r": [{ "border-r": M() }],
        "border-color-b": [{ "border-b": M() }],
        "border-color-l": [{ "border-l": M() }],
        "divide-color": [{ divide: M() }],
        "outline-style": [{ outline: [...z(), "none", "hidden"] }],
        "outline-offset": [{ "outline-offset": [N, A, P] }],
        "outline-w": [{ outline: ["", N, pe, Ut] }],
        "outline-color": [{ outline: M() }],
        shadow: [{ shadow: ["", "none", d, Be, je] }],
        "shadow-color": [{ shadow: M() }],
        "inset-shadow": [{ "inset-shadow": ["none", l, Be, je] }],
        "inset-shadow-color": [{ "inset-shadow": M() }],
        "ring-w": [{ ring: j() }],
        "ring-w-inset": ["ring-inset"],
        "ring-color": [{ ring: M() }],
        "ring-offset-w": [{ "ring-offset": [N, Ut] }],
        "ring-offset-color": [{ "ring-offset": M() }],
        "inset-ring-w": [{ "inset-ring": j() }],
        "inset-ring-color": [{ "inset-ring": M() }],
        "text-shadow": [{ "text-shadow": ["none", h, Be, je] }],
        "text-shadow-color": [{ "text-shadow": M() }],
        opacity: [{ opacity: [N, A, P] }],
        "mix-blend": [
          { "mix-blend": [...rt(), "plus-darker", "plus-lighter"] },
        ],
        "bg-blend": [{ "bg-blend": rt() }],
        "mask-clip": [
          {
            "mask-clip": [
              "border",
              "padding",
              "content",
              "fill",
              "stroke",
              "view",
            ],
          },
          "mask-no-clip",
        ],
        "mask-composite": [
          { mask: ["add", "subtract", "intersect", "exclude"] },
        ],
        "mask-image-linear-pos": [{ "mask-linear": [N] }],
        "mask-image-linear-from-pos": [{ "mask-linear-from": H() }],
        "mask-image-linear-to-pos": [{ "mask-linear-to": H() }],
        "mask-image-linear-from-color": [{ "mask-linear-from": M() }],
        "mask-image-linear-to-color": [{ "mask-linear-to": M() }],
        "mask-image-t-from-pos": [{ "mask-t-from": H() }],
        "mask-image-t-to-pos": [{ "mask-t-to": H() }],
        "mask-image-t-from-color": [{ "mask-t-from": M() }],
        "mask-image-t-to-color": [{ "mask-t-to": M() }],
        "mask-image-r-from-pos": [{ "mask-r-from": H() }],
        "mask-image-r-to-pos": [{ "mask-r-to": H() }],
        "mask-image-r-from-color": [{ "mask-r-from": M() }],
        "mask-image-r-to-color": [{ "mask-r-to": M() }],
        "mask-image-b-from-pos": [{ "mask-b-from": H() }],
        "mask-image-b-to-pos": [{ "mask-b-to": H() }],
        "mask-image-b-from-color": [{ "mask-b-from": M() }],
        "mask-image-b-to-color": [{ "mask-b-to": M() }],
        "mask-image-l-from-pos": [{ "mask-l-from": H() }],
        "mask-image-l-to-pos": [{ "mask-l-to": H() }],
        "mask-image-l-from-color": [{ "mask-l-from": M() }],
        "mask-image-l-to-color": [{ "mask-l-to": M() }],
        "mask-image-x-from-pos": [{ "mask-x-from": H() }],
        "mask-image-x-to-pos": [{ "mask-x-to": H() }],
        "mask-image-x-from-color": [{ "mask-x-from": M() }],
        "mask-image-x-to-color": [{ "mask-x-to": M() }],
        "mask-image-y-from-pos": [{ "mask-y-from": H() }],
        "mask-image-y-to-pos": [{ "mask-y-to": H() }],
        "mask-image-y-from-color": [{ "mask-y-from": M() }],
        "mask-image-y-to-color": [{ "mask-y-to": M() }],
        "mask-image-radial": [{ "mask-radial": [A, P] }],
        "mask-image-radial-from-pos": [{ "mask-radial-from": H() }],
        "mask-image-radial-to-pos": [{ "mask-radial-to": H() }],
        "mask-image-radial-from-color": [{ "mask-radial-from": M() }],
        "mask-image-radial-to-color": [{ "mask-radial-to": M() }],
        "mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
        "mask-image-radial-size": [
          {
            "mask-radial": [
              { closest: ["side", "corner"], farthest: ["side", "corner"] },
            ],
          },
        ],
        "mask-image-radial-pos": [{ "mask-radial-at": E() }],
        "mask-image-conic-pos": [{ "mask-conic": [N] }],
        "mask-image-conic-from-pos": [{ "mask-conic-from": H() }],
        "mask-image-conic-to-pos": [{ "mask-conic-to": H() }],
        "mask-image-conic-from-color": [{ "mask-conic-from": M() }],
        "mask-image-conic-to-color": [{ "mask-conic-to": M() }],
        "mask-mode": [{ mask: ["alpha", "luminance", "match"] }],
        "mask-origin": [
          {
            "mask-origin": [
              "border",
              "padding",
              "content",
              "fill",
              "stroke",
              "view",
            ],
          },
        ],
        "mask-position": [{ mask: X() }],
        "mask-repeat": [{ mask: G() }],
        "mask-size": [{ mask: ht() }],
        "mask-type": [{ "mask-type": ["alpha", "luminance"] }],
        "mask-image": [{ mask: ["none", A, P] }],
        filter: [{ filter: ["", "none", A, P] }],
        blur: [{ blur: $() }],
        brightness: [{ brightness: [N, A, P] }],
        contrast: [{ contrast: [N, A, P] }],
        "drop-shadow": [{ "drop-shadow": ["", "none", f, Be, je] }],
        "drop-shadow-color": [{ "drop-shadow": M() }],
        grayscale: [{ grayscale: ["", N, A, P] }],
        "hue-rotate": [{ "hue-rotate": [N, A, P] }],
        invert: [{ invert: ["", N, A, P] }],
        saturate: [{ saturate: [N, A, P] }],
        sepia: [{ sepia: ["", N, A, P] }],
        "backdrop-filter": [{ "backdrop-filter": ["", "none", A, P] }],
        "backdrop-blur": [{ "backdrop-blur": $() }],
        "backdrop-brightness": [{ "backdrop-brightness": [N, A, P] }],
        "backdrop-contrast": [{ "backdrop-contrast": [N, A, P] }],
        "backdrop-grayscale": [{ "backdrop-grayscale": ["", N, A, P] }],
        "backdrop-hue-rotate": [{ "backdrop-hue-rotate": [N, A, P] }],
        "backdrop-invert": [{ "backdrop-invert": ["", N, A, P] }],
        "backdrop-opacity": [{ "backdrop-opacity": [N, A, P] }],
        "backdrop-saturate": [{ "backdrop-saturate": [N, A, P] }],
        "backdrop-sepia": [{ "backdrop-sepia": ["", N, A, P] }],
        "border-collapse": [{ border: ["collapse", "separate"] }],
        "border-spacing": [{ "border-spacing": v() }],
        "border-spacing-x": [{ "border-spacing-x": v() }],
        "border-spacing-y": [{ "border-spacing-y": v() }],
        "table-layout": [{ table: ["auto", "fixed"] }],
        caption: [{ caption: ["top", "bottom"] }],
        transition: [
          {
            transition: [
              "",
              "all",
              "colors",
              "opacity",
              "shadow",
              "transform",
              "none",
              A,
              P,
            ],
          },
        ],
        "transition-behavior": [{ transition: ["normal", "discrete"] }],
        duration: [{ duration: [N, "initial", A, P] }],
        ease: [{ ease: ["linear", "initial", y, A, P] }],
        delay: [{ delay: [N, A, P] }],
        animate: [{ animate: ["none", k, A, P] }],
        backface: [{ backface: ["hidden", "visible"] }],
        perspective: [{ perspective: [b, A, P] }],
        "perspective-origin": [{ "perspective-origin": S() }],
        rotate: [{ rotate: gt() }],
        "rotate-x": [{ "rotate-x": gt() }],
        "rotate-y": [{ "rotate-y": gt() }],
        "rotate-z": [{ "rotate-z": gt() }],
        scale: [{ scale: Ct() }],
        "scale-x": [{ "scale-x": Ct() }],
        "scale-y": [{ "scale-y": Ct() }],
        "scale-z": [{ "scale-z": Ct() }],
        "scale-3d": ["scale-3d"],
        skew: [{ skew: Lt() }],
        "skew-x": [{ "skew-x": Lt() }],
        "skew-y": [{ "skew-y": Lt() }],
        transform: [{ transform: [A, P, "", "none", "gpu", "cpu"] }],
        "transform-origin": [{ origin: S() }],
        "transform-style": [{ transform: ["3d", "flat"] }],
        translate: [{ translate: vt() }],
        "translate-x": [{ "translate-x": vt() }],
        "translate-y": [{ "translate-y": vt() }],
        "translate-z": [{ "translate-z": vt() }],
        "translate-none": ["translate-none"],
        accent: [{ accent: M() }],
        appearance: [{ appearance: ["none", "auto"] }],
        "caret-color": [{ caret: M() }],
        "color-scheme": [
          {
            scheme: [
              "normal",
              "dark",
              "light",
              "light-dark",
              "only-dark",
              "only-light",
            ],
          },
        ],
        cursor: [
          {
            cursor: [
              "auto",
              "default",
              "pointer",
              "wait",
              "text",
              "move",
              "help",
              "not-allowed",
              "none",
              "context-menu",
              "progress",
              "cell",
              "crosshair",
              "vertical-text",
              "alias",
              "copy",
              "no-drop",
              "grab",
              "grabbing",
              "all-scroll",
              "col-resize",
              "row-resize",
              "n-resize",
              "e-resize",
              "s-resize",
              "w-resize",
              "ne-resize",
              "nw-resize",
              "se-resize",
              "sw-resize",
              "ew-resize",
              "ns-resize",
              "nesw-resize",
              "nwse-resize",
              "zoom-in",
              "zoom-out",
              A,
              P,
            ],
          },
        ],
        "field-sizing": [{ "field-sizing": ["fixed", "content"] }],
        "pointer-events": [{ "pointer-events": ["auto", "none"] }],
        resize: [{ resize: ["none", "", "y", "x"] }],
        "scroll-behavior": [{ scroll: ["auto", "smooth"] }],
        "scroll-m": [{ "scroll-m": v() }],
        "scroll-mx": [{ "scroll-mx": v() }],
        "scroll-my": [{ "scroll-my": v() }],
        "scroll-ms": [{ "scroll-ms": v() }],
        "scroll-me": [{ "scroll-me": v() }],
        "scroll-mt": [{ "scroll-mt": v() }],
        "scroll-mr": [{ "scroll-mr": v() }],
        "scroll-mb": [{ "scroll-mb": v() }],
        "scroll-ml": [{ "scroll-ml": v() }],
        "scroll-p": [{ "scroll-p": v() }],
        "scroll-px": [{ "scroll-px": v() }],
        "scroll-py": [{ "scroll-py": v() }],
        "scroll-ps": [{ "scroll-ps": v() }],
        "scroll-pe": [{ "scroll-pe": v() }],
        "scroll-pt": [{ "scroll-pt": v() }],
        "scroll-pr": [{ "scroll-pr": v() }],
        "scroll-pb": [{ "scroll-pb": v() }],
        "scroll-pl": [{ "scroll-pl": v() }],
        "snap-align": [{ snap: ["start", "end", "center", "align-none"] }],
        "snap-stop": [{ snap: ["normal", "always"] }],
        "snap-type": [{ snap: ["none", "x", "y", "both"] }],
        "snap-strictness": [{ snap: ["mandatory", "proximity"] }],
        touch: [{ touch: ["auto", "none", "manipulation"] }],
        "touch-x": [{ "touch-pan": ["x", "left", "right"] }],
        "touch-y": [{ "touch-pan": ["y", "up", "down"] }],
        "touch-pz": ["touch-pinch-zoom"],
        select: [{ select: ["none", "text", "all", "auto"] }],
        "will-change": [
          { "will-change": ["auto", "scroll", "contents", "transform", A, P] },
        ],
        fill: [{ fill: ["none", ...M()] }],
        "stroke-w": [{ stroke: [N, pe, Ut, An] }],
        stroke: [{ stroke: ["none", ...M()] }],
        "forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }],
      },
      conflictingClassGroups: {
        overflow: ["overflow-x", "overflow-y"],
        overscroll: ["overscroll-x", "overscroll-y"],
        inset: [
          "inset-x",
          "inset-y",
          "start",
          "end",
          "top",
          "right",
          "bottom",
          "left",
        ],
        "inset-x": ["right", "left"],
        "inset-y": ["top", "bottom"],
        flex: ["basis", "grow", "shrink"],
        gap: ["gap-x", "gap-y"],
        p: ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"],
        px: ["pr", "pl"],
        py: ["pt", "pb"],
        m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"],
        mx: ["mr", "ml"],
        my: ["mt", "mb"],
        size: ["w", "h"],
        "font-size": ["leading"],
        "fvn-normal": [
          "fvn-ordinal",
          "fvn-slashed-zero",
          "fvn-figure",
          "fvn-spacing",
          "fvn-fraction",
        ],
        "fvn-ordinal": ["fvn-normal"],
        "fvn-slashed-zero": ["fvn-normal"],
        "fvn-figure": ["fvn-normal"],
        "fvn-spacing": ["fvn-normal"],
        "fvn-fraction": ["fvn-normal"],
        "line-clamp": ["display", "overflow"],
        rounded: [
          "rounded-s",
          "rounded-e",
          "rounded-t",
          "rounded-r",
          "rounded-b",
          "rounded-l",
          "rounded-ss",
          "rounded-se",
          "rounded-ee",
          "rounded-es",
          "rounded-tl",
          "rounded-tr",
          "rounded-br",
          "rounded-bl",
        ],
        "rounded-s": ["rounded-ss", "rounded-es"],
        "rounded-e": ["rounded-se", "rounded-ee"],
        "rounded-t": ["rounded-tl", "rounded-tr"],
        "rounded-r": ["rounded-tr", "rounded-br"],
        "rounded-b": ["rounded-br", "rounded-bl"],
        "rounded-l": ["rounded-tl", "rounded-bl"],
        "border-spacing": ["border-spacing-x", "border-spacing-y"],
        "border-w": [
          "border-w-x",
          "border-w-y",
          "border-w-s",
          "border-w-e",
          "border-w-t",
          "border-w-r",
          "border-w-b",
          "border-w-l",
        ],
        "border-w-x": ["border-w-r", "border-w-l"],
        "border-w-y": ["border-w-t", "border-w-b"],
        "border-color": [
          "border-color-x",
          "border-color-y",
          "border-color-s",
          "border-color-e",
          "border-color-t",
          "border-color-r",
          "border-color-b",
          "border-color-l",
        ],
        "border-color-x": ["border-color-r", "border-color-l"],
        "border-color-y": ["border-color-t", "border-color-b"],
        translate: ["translate-x", "translate-y", "translate-none"],
        "translate-none": [
          "translate",
          "translate-x",
          "translate-y",
          "translate-z",
        ],
        "scroll-m": [
          "scroll-mx",
          "scroll-my",
          "scroll-ms",
          "scroll-me",
          "scroll-mt",
          "scroll-mr",
          "scroll-mb",
          "scroll-ml",
        ],
        "scroll-mx": ["scroll-mr", "scroll-ml"],
        "scroll-my": ["scroll-mt", "scroll-mb"],
        "scroll-p": [
          "scroll-px",
          "scroll-py",
          "scroll-ps",
          "scroll-pe",
          "scroll-pt",
          "scroll-pr",
          "scroll-pb",
          "scroll-pl",
        ],
        "scroll-px": ["scroll-pr", "scroll-pl"],
        "scroll-py": ["scroll-pt", "scroll-pb"],
        touch: ["touch-x", "touch-y", "touch-pz"],
        "touch-x": ["touch"],
        "touch-y": ["touch"],
        "touch-pz": ["touch"],
      },
      conflictingClassGroupModifiers: { "font-size": ["leading"] },
      orderSensitiveModifiers: [
        "*",
        "**",
        "after",
        "backdrop",
        "before",
        "details-content",
        "file",
        "first-letter",
        "first-line",
        "marker",
        "placeholder",
        "selection",
      ],
    };
  },
  ry = km(Om);
export {
  y1 as $,
  Zm as A,
  c1 as B,
  h1 as C,
  D1 as D,
  w0 as E,
  z1 as F,
  U1 as G,
  q1 as H,
  Q1 as I,
  Ym as J,
  t0 as K,
  e0 as L,
  d0 as M,
  Xm as N,
  K1 as O,
  x0 as P,
  h0 as Q,
  J1 as R,
  L0 as S,
  O0 as T,
  ey as U,
  m1 as V,
  F0 as W,
  sy as X,
  k1 as Y,
  q0 as Z,
  b1 as _,
  ry as a,
  E0 as a$,
  o0 as a0,
  G0 as a1,
  V1 as a2,
  n1 as a3,
  N0 as a4,
  P0 as a5,
  Km as a6,
  l0 as a7,
  I1 as a8,
  j1 as a9,
  g0 as aA,
  H1 as aB,
  T0 as aC,
  f1 as aD,
  l1 as aE,
  L1 as aF,
  O1 as aG,
  U0 as aH,
  X1 as aI,
  _1 as aJ,
  x1 as aK,
  u1 as aL,
  oy as aM,
  c0 as aN,
  $1 as aO,
  C1 as aP,
  I0 as aQ,
  s1 as aR,
  z0 as aS,
  M1 as aT,
  Z1 as aU,
  k0 as aV,
  D0 as aW,
  C0 as aX,
  W1 as aY,
  j0 as aZ,
  _0 as a_,
  i0 as aa,
  r0 as ab,
  Q0 as ac,
  Qm as ad,
  R0 as ae,
  Jm as af,
  t1 as ag,
  K0 as ah,
  d1 as ai,
  ny as aj,
  A1 as ak,
  v0 as al,
  e1 as am,
  G1 as an,
  n0 as ao,
  P1 as ap,
  Z0 as aq,
  R1 as ar,
  S1 as as,
  w1 as at,
  N1 as au,
  g1 as av,
  A0 as aw,
  S0 as ax,
  b0 as ay,
  B0 as az,
  s0 as b,
  X0 as b0,
  H0 as b1,
  T1 as b2,
  W0 as b3,
  iy as c,
  i1 as d,
  Y0 as e,
  F1 as f,
  E1 as g,
  a1 as h,
  B1 as i,
  p1 as j,
  J0 as k,
  r1 as l,
  y0 as m,
  m0 as n,
  a0 as o,
  Y1 as p,
  v1 as q,
  V0 as r,
  u0 as s,
  Gm as t,
  $0 as u,
  p0 as v,
  f0 as w,
  o1 as x,
  ty as y,
  M0 as z,
};
