import { u as c, j as d } from "./vendor-query-sBpsl8Kt.js";
import { s as u, c as l } from "./index-DY9GA2La.js";
function y() {
  return c({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data: e, error: s } = await u.rpc("get_dashboard_stats");
      if (s) throw s;
      return e;
    },
    refetchInterval: 6e4,
  });
}
function f() {
  return c({
    queryKey: ["revenue-chart"],
    queryFn: async () => {
      const e = new Date();
      e.setMonth(e.getMonth() - 6);
      const { data: s, error: n } = await u
        .from("leads")
        .select("*")
        .eq("status", "close")
        .gte("updated_at", e.toISOString())
        .order("updated_at", { ascending: !0 });
      if (n) throw n;
      const t = {};
      for (const a of s) {
        const r = a.updated_at.substring(0, 7);
        t[r] = (t[r] ?? 0) + Number(a.ca_contracté ?? 0);
      }
      return Object.entries(t).map(([a, r]) => ({ month: a, revenue: r }));
    },
  });
}
function w() {
  return c({
    queryKey: ["leads-chart"],
    queryFn: async () => {
      const e = new Date();
      e.setMonth(e.getMonth() - 3);
      const { data: s, error: n } = await u
        .from("leads")
        .select("created_at, status")
        .gte("created_at", e.toISOString())
        .order("created_at", { ascending: !0 });
      if (n) throw n;
      const t = {};
      for (const a of s) {
        const r = new Date(a.created_at),
          i = new Date(r);
        i.setDate(r.getDate() - r.getDay() + 1);
        const o = i.toISOString().split("T")[0];
        (t[o] || (t[o] = { total: 0, close: 0 }),
          t[o].total++,
          a.status === "close" && t[o].close++);
      }
      return Object.entries(t).map(([a, r]) => ({ week: a, ...r }));
    },
  });
}
function p() {
  return c({
    queryKey: ["setter-activity-chart"],
    queryFn: async () => {
      const e = new Date();
      e.setDate(e.getDate() - 14);
      const { data: s, error: n } = await u
        .from("setter_activities")
        .select("date, messages_sent")
        .gte("date", e.toISOString().split("T")[0])
        .order("date", { ascending: !0 });
      if (n) throw n;
      const t = {};
      for (const a of s) t[a.date] = (t[a.date] ?? 0) + a.messages_sent;
      return Object.entries(t).map(([a, r]) => ({ date: a, messages: r }));
    },
  });
}
const g = {
  day: "Jour",
  week: "Semaine",
  month: "Mois",
  quarter: "Trimestre",
  year: "Année",
};
function D({ value: e, onChange: s, className: n }) {
  return d.jsx("div", {
    className: l("inline-flex items-center rounded-xl bg-muted p-1 gap-0.5", n),
    children: Object.keys(g).map((t) =>
      d.jsx(
        "button",
        {
          onClick: () => s(t),
          className: l(
            "px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
            e === t
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          ),
          children: g[t],
        },
        t,
      ),
    ),
  });
}
export { D as T, w as a, p as b, y as c, f as u };
