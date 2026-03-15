import { j as n } from "./vendor-query-sBpsl8Kt.js";
import { c as s } from "./index-DY9GA2La.js";
const a = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  secondary: "bg-secondary text-secondary-foreground",
  outline: "border border-border text-foreground bg-transparent",
};
function d({ className: e, variant: t = "default", ...r }) {
  return n.jsx("span", {
    className: s(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      "transition-all duration-200",
      a[t],
      e,
    ),
    ...r,
  });
}
export { d as B };
