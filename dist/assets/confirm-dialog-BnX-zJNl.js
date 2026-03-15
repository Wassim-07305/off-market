import { j as s } from "./vendor-query-sBpsl8Kt.js";
import { c as d } from "./index-DY9GA2La.js";
import { M as f } from "./modal-DBBZDXoW.js";
import { B as i } from "./button-DlbP8VPc.js";
function h({
  open: t,
  onClose: e,
  onConfirm: n,
  title: o,
  description: m,
  confirmLabel: a = "Confirmer",
  cancelLabel: c = "Annuler",
  variant: l = "destructive",
  loading: r = !1,
}) {
  return s.jsx(f, {
    open: t,
    onClose: e,
    title: o,
    description: m,
    size: "sm",
    hideCloseButton: !0,
    children: s.jsxs("div", {
      className: d("flex items-center justify-end gap-3 pt-2"),
      children: [
        s.jsx(i, {
          variant: "secondary",
          size: "sm",
          onClick: e,
          disabled: r,
          children: c,
        }),
        s.jsx(i, {
          variant: l,
          size: "sm",
          onClick: n,
          loading: r,
          children: a,
        }),
      ],
    }),
  });
}
export { h as C };
