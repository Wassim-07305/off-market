import { a as d, b as f, u as q } from "./vendor-query-sBpsl8Kt.js";
import { s as u } from "./index-DY9GA2La.js";
import { t as i } from "./vendor-ui-DDdrexJZ.js";
import { I as h } from "./constants-IBlSVYu1.js";
function v(r = {}) {
  const {
      search: e,
      status: s,
      source: n,
      client_id: t,
      assigned_to: c,
      page: l = 1,
    } = r,
    y = (l - 1) * h,
    g = y + h - 1;
  return q({
    queryKey: ["leads", r],
    queryFn: async () => {
      let o = u
        .from("leads")
        .select(
          "*, client:clients(id, name), assigned_profile:profiles!assigned_to(id, full_name, avatar_url)",
          { count: "exact" },
        )
        .order("created_at", { ascending: !1 })
        .range(y, g);
      (e && (o = o.or(`name.ilike.%${e}%,email.ilike.%${e}%`)),
        s && (o = o.eq("status", s)),
        n && (o = o.eq("source", n)),
        t && (o = o.eq("client_id", t)),
        c && (o = o.eq("assigned_to", c)));
      const { data: p, error: _, count: a } = await o;
      if (_) throw _;
      return { data: p, count: a ?? 0 };
    },
  });
}
function F() {
  return q({
    queryKey: ["leads", "all-kanban"],
    queryFn: async () => {
      const { data: r, error: e } = await u
        .from("leads")
        .select(
          "*, client:clients(id, name), assigned_profile:profiles!assigned_to(id, full_name, avatar_url)",
        )
        .order("created_at", { ascending: !1 })
        .limit(200);
      if (e) throw e;
      return r;
    },
  });
}
function K(r) {
  return q({
    queryKey: ["leads", "client", r],
    queryFn: async () => {
      if (!r) throw new Error("Client ID requis");
      const { data: e, error: s } = await u
        .from("leads")
        .select("*, assigned_profile:profiles!assigned_to(id, full_name)")
        .eq("client_id", r)
        .order("created_at", { ascending: !1 });
      if (s) throw s;
      return e;
    },
    enabled: !!r,
  });
}
function S() {
  const r = d();
  return f({
    mutationFn: async (e) => {
      const { data: s, error: n } = await u
        .from("leads")
        .insert(e)
        .select()
        .single();
      if (n) throw n;
      return s;
    },
    onSuccess: () => {
      (r.invalidateQueries({ queryKey: ["leads"] }),
        i.success("Lead créé avec succès"));
    },
    onError: (e) => {
      i.error(`Erreur: ${e.message}`);
    },
  });
}
function b() {
  const r = d();
  return f({
    mutationFn: async ({ id: e, ...s }) => {
      const { data: n, error: t } = await u
        .from("leads")
        .update(s)
        .eq("id", e)
        .select()
        .single();
      if (t) throw t;
      return n;
    },
    onSuccess: () => {
      (r.invalidateQueries({ queryKey: ["leads"] }),
        i.success("Lead mis à jour"));
    },
    onError: (e) => {
      i.error(`Erreur: ${e.message}`);
    },
  });
}
function Q() {
  const r = d();
  return f({
    mutationFn: async (e) => {
      const { error: s } = await u.from("leads").delete().eq("id", e);
      if (s) throw s;
    },
    onSuccess: () => {
      (r.invalidateQueries({ queryKey: ["leads"] }),
        i.success("Lead supprimé"));
    },
    onError: (e) => {
      i.error(`Erreur: ${e.message}`);
    },
  });
}
function k() {
  const r = d();
  return f({
    mutationFn: async (e) => {
      let s = 0,
        n = 0;
      for (let t = 0; t < e.length; t += 50) {
        const c = e.slice(t, t + 50),
          { error: l } = await u.from("leads").insert(c);
        l ? (n += c.length) : (s += c.length);
      }
      return { success: s, errors: n };
    },
    onSuccess: (e) => {
      (r.invalidateQueries({ queryKey: ["leads"] }),
        e.errors === 0
          ? i.success(`${e.success} leads importés avec succès`)
          : i.success(`${e.success} importés, ${e.errors} erreurs`));
    },
    onError: (e) => {
      i.error(`Erreur d'import: ${e.message}`);
    },
  });
}
function D() {
  const r = d();
  return f({
    mutationFn: async (e) => {
      const { error: s } = await u.from("leads").delete().in("id", e);
      if (s) throw s;
      return e.length;
    },
    onSuccess: (e) => {
      (r.invalidateQueries({ queryKey: ["leads"] }),
        i.success(`${e} lead${e > 1 ? "s" : ""} supprimé${e > 1 ? "s" : ""}`));
    },
    onError: (e) => {
      i.error(`Erreur: ${e.message}`);
    },
  });
}
function B() {
  const r = d();
  return f({
    mutationFn: async ({ ids: e, data: s }) => {
      const { error: n } = await u.from("leads").update(s).in("id", e);
      if (n) throw n;
      return e.length;
    },
    onSuccess: (e) => {
      (r.invalidateQueries({ queryKey: ["leads"] }),
        i.success(`${e} lead${e > 1 ? "s" : ""} mis à jour`));
    },
    onError: (e) => {
      i.error(`Erreur: ${e.message}`);
    },
  });
}
function x(r) {
  return q({
    queryKey: ["lead-stats", r],
    queryFn: async () => {
      let e = u.from("leads").select("*");
      r && (e = e.eq("client_id", r));
      const { data: s, error: n } = await e;
      if (n) throw n;
      const t = s,
        c = t.length,
        l = t.filter((a) => a.status === "close").length,
        y = t.filter((a) => a.status === "perdu").length,
        g = l + y,
        o = g > 0 ? (l / g) * 100 : 0,
        p = new Date(),
        _ = t.filter((a) => {
          if (
            a.status !== "en_discussion" &&
            a.status !== "qualifie" &&
            a.status !== "loom_envoye"
          )
            return !1;
          const m = new Date(a.updated_at || a.created_at);
          return (p.getTime() - m.getTime()) / (1e3 * 60 * 60) >= 48;
        }).length;
      return {
        total: c,
        à_relancer: _,
        en_discussion: t.filter((a) => a.status === "en_discussion").length,
        call_planifie: t.filter((a) => a.status === "call_planifie").length,
        close: l,
        ca_contracté: t.reduce((a, m) => a + Number(m.ca_contracté), 0),
        ca_collecté: t.reduce((a, m) => a + Number(m.ca_collecté), 0),
        tauxClosing: o,
      };
    },
  });
}
export {
  K as a,
  b,
  Q as c,
  S as d,
  k as e,
  D as f,
  B as g,
  v as h,
  F as i,
  x as u,
};
