import { u, a as c, b as d } from "./vendor-query-sBpsl8Kt.js";
import { s as i } from "./index-DY9GA2La.js";
import { t as o } from "./vendor-ui-DDdrexJZ.js";
function m(a = {}) {
  return u({
    queryKey: ["call-calendar", a],
    queryFn: async () => {
      let e = i
        .from("call_calendar")
        .select(
          "*, client:clients(id, name), lead:leads(id, name), assigned_profile:profiles!assigned_to(id, full_name, avatar_url)",
        )
        .order("date", { ascending: !0 })
        .order("time", { ascending: !0 });
      (a.date_from && (e = e.gte("date", a.date_from)),
        a.date_to && (e = e.lte("date", a.date_to)),
        a.client_id && (e = e.eq("client_id", a.client_id)),
        a.assigned_to && (e = e.eq("assigned_to", a.assigned_to)),
        a.status && (e = e.eq("status", a.status)),
        a.type && (e = e.eq("type", a.type)));
      const { data: n, error: t } = await e;
      if (t) throw t;
      return n;
    },
  });
}
function f() {
  const a = c();
  return d({
    mutationFn: async (e) => {
      const { data: n, error: t } = await i
        .from("call_calendar")
        .insert(e)
        .select()
        .single();
      if (t) throw t;
      return n;
    },
    onSuccess: () => {
      (a.invalidateQueries({ queryKey: ["call-calendar"] }),
        o.success("Call planifié avec succès"));
    },
    onError: (e) => {
      o.error(`Erreur: ${e.message}`);
    },
  });
}
function q() {
  const a = c();
  return d({
    mutationFn: async ({ id: e, ...n }) => {
      const { data: t, error: s } = await i
        .from("call_calendar")
        .update(n)
        .eq("id", e)
        .select()
        .single();
      if (s) throw s;
      return t;
    },
    onSuccess: () => {
      (a.invalidateQueries({ queryKey: ["call-calendar"] }),
        o.success("Call mis à jour"));
    },
    onError: (e) => {
      o.error(`Erreur: ${e.message}`);
    },
  });
}
function p(a = {}) {
  return u({
    queryKey: ["call-stats", a],
    queryFn: async () => {
      let e = i.from("call_calendar").select("status, date");
      (a.client_id && (e = e.eq("client_id", a.client_id)),
        a.assigned_to && (e = e.eq("assigned_to", a.assigned_to)));
      const { data: n, error: t } = await e;
      if (t) throw t;
      const s = new Date().toISOString().split("T")[0],
        l = n;
      return {
        total: l.length,
        today: l.filter((r) => r.date === s).length,
        upcoming: l.filter((r) => r.date > s && r.status === "planifié").length,
        réalisé: l.filter((r) => r.status === "réalisé").length,
        no_show: l.filter((r) => r.status === "no_show").length,
      };
    },
  });
}
export { p as a, q as b, f as c, m as u };
