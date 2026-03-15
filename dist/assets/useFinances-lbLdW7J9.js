import { u as q, a as m, b as p } from "./vendor-query-sBpsl8Kt.js";
import { s as o } from "./index-DY9GA2La.js";
import { t as u } from "./vendor-ui-DDdrexJZ.js";
import { I as _ } from "./constants-IBlSVYu1.js";
function S(r = {}) {
  const { page: e = 1, ...t } = r,
    n = (e - 1) * _,
    s = n + _ - 1;
  return q({
    queryKey: ["financial-entries", r],
    queryFn: async () => {
      let i = o
        .from("financial_entries")
        .select("*, client:clients(id, name)", { count: "exact" })
        .order("date", { ascending: !1 })
        .range(n, s);
      (t.client_id && (i = i.eq("client_id", t.client_id)),
        t.type && (i = i.eq("type", t.type)),
        t.date_from && (i = i.gte("date", t.date_from)),
        t.date_to && (i = i.lte("date", t.date_to)));
      const { data: y, error: l, count: d } = await i;
      if (l) throw l;
      return { data: y, count: d ?? 0 };
    },
  });
}
function Q() {
  const r = m();
  return p({
    mutationFn: async (e) => {
      const { data: t, error: n } = await o
        .from("financial_entries")
        .insert(e)
        .select()
        .single();
      if (n) throw n;
      return t;
    },
    onSuccess: () => {
      (r.invalidateQueries({ queryKey: ["financial-entries"] }),
        r.invalidateQueries({ queryKey: ["finance-stats"] }),
        u.success("Entrée financière créée"));
    },
    onError: (e) => {
      u.error(`Erreur: ${e.message}`);
    },
  });
}
function b() {
  const r = m();
  return p({
    mutationFn: async ({ id: e, ...t }) => {
      const { data: n, error: s } = await o
        .from("financial_entries")
        .update(t)
        .eq("id", e)
        .select()
        .single();
      if (s) throw s;
      return n;
    },
    onSuccess: () => {
      (r.invalidateQueries({ queryKey: ["financial-entries"] }),
        r.invalidateQueries({ queryKey: ["finance-stats"] }),
        u.success("Entrée mise à jour"));
    },
    onError: (e) => {
      u.error(`Erreur: ${e.message}`);
    },
  });
}
function v(r) {
  return q({
    queryKey: ["finance-stats", r],
    queryFn: async () => {
      let e = o.from("financial_entries").select("type, amount, is_paid");
      r && (e = e.eq("client_id", r));
      const { data: t, error: n } = await e;
      if (n) throw n;
      const s = t,
        i = s
          .filter((a) => a.type === "ca")
          .reduce((a, c) => a + Number(c.amount), 0),
        y = s
          .filter((a) => a.type === "récurrent")
          .reduce((a, c) => a + Number(c.amount), 0),
        l = s
          .filter((a) => a.type === "charge")
          .reduce((a, c) => a + Number(c.amount), 0),
        d = s
          .filter((a) => a.type === "prestataire")
          .reduce((a, c) => a + Number(c.amount), 0),
        f = i + y,
        h = l + d,
        g = f > 0 ? ((f - h) / f) * 100 : 0;
      return {
        ca: i,
        récurrent: y,
        charges: l,
        prestataires: d,
        revenue: f,
        expenses: h,
        marge: g,
      };
    },
  });
}
function C(r) {
  return q({
    queryKey: ["payment-schedules", r],
    queryFn: async () => {
      let e = o
        .from("payment_schedules")
        .select("*, client:clients(id, name)")
        .order("due_date", { ascending: !0 });
      r && (e = e.eq("client_id", r));
      const { data: t, error: n } = await e;
      if (n) throw n;
      return t;
    },
  });
}
function P() {
  const r = m();
  return p({
    mutationFn: async (e) => {
      const { data: t, error: n } = await o
        .from("payment_schedules")
        .insert(e)
        .select()
        .single();
      if (n) throw n;
      return t;
    },
    onSuccess: () => {
      (r.invalidateQueries({ queryKey: ["payment-schedules"] }),
        u.success("Échéance créée"));
    },
    onError: (e) => {
      u.error(`Erreur: ${e.message}`);
    },
  });
}
function N() {
  const r = m();
  return p({
    mutationFn: async ({ id: e, ...t }) => {
      const { data: n, error: s } = await o
        .from("payment_schedules")
        .update(t)
        .eq("id", e)
        .select()
        .single();
      if (s) throw s;
      return n;
    },
    onSuccess: () => {
      (r.invalidateQueries({ queryKey: ["payment-schedules"] }),
        u.success("Échéance mise à jour"));
    },
    onError: (e) => {
      u.error(`Erreur: ${e.message}`);
    },
  });
}
export { v as a, C as b, b as c, Q as d, N as e, P as f, S as u };
