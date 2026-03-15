import { u as f } from "./vendor-query-sBpsl8Kt.js";
import { s } from "./index-DY9GA2La.js";
import { I as d } from "./constants-IBlSVYu1.js";
function b(e = {}) {
  const { search: r, page: a = 1 } = e,
    n = (a - 1) * d,
    m = n + d - 1;
  return f({
    queryKey: ["eleves", e],
    queryFn: async () => {
      const { data: _, error: c } = await s
        .from("user_roles")
        .select("user_id")
        .eq("role", "prospect");
      if (c) throw c;
      const i = _.map((t) => t.user_id);
      if (i.length === 0) return { data: [], count: 0 };
      let o = s
        .from("profiles")
        .select("*", { count: "exact" })
        .in("id", i)
        .order("created_at", { ascending: !1 })
        .range(n, m);
      r && (o = o.or(`full_name.ilike.%${r}%,email.ilike.%${r}%`));
      const { data: y, error: l, count: p } = await o;
      if (l) throw l;
      return {
        data: await Promise.all(
          (y ?? []).map(async (t) => {
            const { data: w } = await s
                .from("leads")
                .select("*")
                .eq("assigned_to", t.id),
              u = w ?? [];
            return {
              ...t,
              leads_count: u.length,
              ca_total: u.reduce((h, q) => h + Number(q.ca_contracté), 0),
              last_activity_at: t.last_seen_at,
            };
          }),
        ),
        count: p ?? 0,
      };
    },
  });
}
function P(e) {
  return f({
    queryKey: ["eleves", e],
    queryFn: async () => {
      if (!e) throw new Error("ID requis");
      const { data: r, error: a } = await s
        .from("profiles")
        .select("*")
        .eq("id", e)
        .single();
      if (a) throw a;
      return r;
    },
    enabled: !!e,
  });
}
export { P as a, b as u };
