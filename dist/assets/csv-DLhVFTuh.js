import { g as u } from "./vendor-react-Cci7g3Cb.js";
import { t as d } from "./vendor-utils-DoLlG-6J.js";
var b = d();
const f = u(b);
function L(c, a, p) {
  const s = a.map((o) => o.label),
    r = c.map((o) => a.map((m) => String(o[m.key] ?? ""))),
    n = f.unparse({ fields: s, data: r }),
    i = new Blob(["\uFEFF" + n], { type: "text/csv;charset=utf-8;" }),
    e = URL.createObjectURL(i),
    t = document.createElement("a");
  ((t.href = e), (t.download = `${p}.csv`), t.click(), URL.revokeObjectURL(e));
}
function g(c, a) {
  return new Promise((p, s) => {
    f.parse(c, {
      header: !0,
      skipEmptyLines: !0,
      complete: (r) => {
        if (r.errors.length > 0) {
          s(new Error(r.errors.map((e) => e.message).join(", ")));
          return;
        }
        const n = new Map();
        for (const e of a) n.set(e.label.toLowerCase().trim(), e.key);
        const i = r.data.map((e) => {
          const t = {};
          for (const [o, m] of Object.entries(e)) {
            const l = n.get(o.toLowerCase().trim());
            l && (t[l] = m ?? "");
          }
          return t;
        });
        p(i);
      },
      error: (r) => {
        s(r);
      },
    });
  });
}
export { L as e, g as i };
