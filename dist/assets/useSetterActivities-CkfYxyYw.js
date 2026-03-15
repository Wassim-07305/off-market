import { u as _, a as g, b as y } from "./vendor-query-sBpsl8Kt.js";
import { s as u } from "./index-DY9GA2La.js";
import { t as d } from "./vendor-ui-DDdrexJZ.js";
function q(t = {}) {
  return _({
    queryKey: ["setter-activities", t],
    queryFn: async () => {
      let e = u
        .from("setter_activities")
        .select(
          "*, client:clients(id, name), profile:profiles!user_id(id, full_name)",
        )
        .order("date", { ascending: !1 });
      (t.user_id && (e = e.eq("user_id", t.user_id)),
        t.client_id && (e = e.eq("client_id", t.client_id)),
        t.date_from && (e = e.gte("date", t.date_from)),
        t.date_to && (e = e.lte("date", t.date_to)));
      const { data: n, error: a } = await e;
      if (a) throw a;
      return n;
    },
  });
}
function p() {
  const t = g();
  return y({
    mutationFn: async (e) => {
      const { data: n, error: a } = await u
        .from("setter_activities")
        .upsert(e, { onConflict: "user_id,client_id,date" })
        .select()
        .single();
      if (a) throw a;
      return n;
    },
    onSuccess: () => {
      (t.invalidateQueries({ queryKey: ["setter-activities"] }),
        d.success("Activité enregistrée"));
    },
    onError: (e) => {
      d.error(`Erreur: ${e.message}`);
    },
  });
}
function D(t) {
  return _({
    queryKey: ["setter-stats", t],
    queryFn: async () => {
      let e = u.from("setter_activities").select("date, messages_sent");
      t && (e = e.eq("user_id", t));
      const { data: n, error: a } = await e
        .order("date", { ascending: !1 })
        .limit(30);
      if (a) throw a;
      const r = n,
        o = new Date(),
        c = new Date(o);
      c.setDate(o.getDate() - o.getDay() + 1);
      const l = new Date(o.getFullYear(), o.getMonth(), 1),
        m = r.filter((s) => new Date(s.date) >= c),
        f = r.filter((s) => new Date(s.date) >= l);
      return {
        total_messages: r.reduce((s, i) => s + i.messages_sent, 0),
        messages_this_week: m.reduce((s, i) => s + i.messages_sent, 0),
        messages_this_month: f.reduce((s, i) => s + i.messages_sent, 0),
        average_daily:
          r.length > 0
            ? Math.round(r.reduce((s, i) => s + i.messages_sent, 0) / r.length)
            : 0,
        daily_data: r.slice(0, 14).reverse(),
      };
    },
  });
}
export { q as a, p as b, D as u };
