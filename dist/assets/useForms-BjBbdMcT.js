import { u as m, a as u, b as a } from "./vendor-query-sBpsl8Kt.js";
import { s as i } from "./index-DY9GA2La.js";
import { t as o } from "./vendor-ui-DDdrexJZ.js";
import { I as l } from "./constants-IBlSVYu1.js";
function g(e = {}) {
  const { search: r, status: s, page: t = 1 } = e,
    n = (t - 1) * l,
    d = n + l - 1;
  return m({
    queryKey: ["forms", e],
    queryFn: async () => {
      let c = i
        .from("forms")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: !1 })
        .range(n, d);
      (r && (c = c.or(`title.ilike.%${r}%,description.ilike.%${r}%`)),
        s && (c = c.eq("status", s)));
      const { data: y, error: f, count: q } = await c;
      if (f) throw f;
      return { data: y, count: q ?? 0 };
    },
  });
}
function E(e) {
  return m({
    queryKey: ["forms", e, "fields"],
    queryFn: async () => {
      if (!e) throw new Error("ID requis");
      const [r, s] = await Promise.all([
        i.from("forms").select("*").eq("id", e).single(),
        i
          .from("form_fields")
          .select("*")
          .eq("form_id", e)
          .order("sort_order", { ascending: !0 }),
      ]);
      if (r.error) throw r.error;
      if (s.error) throw s.error;
      return { ...r.data, fields: s.data };
    },
    enabled: !!e,
  });
}
function _(e) {
  return m({
    queryKey: ["forms", e, "submissions"],
    queryFn: async () => {
      if (!e) throw new Error("ID requis");
      const {
        data: r,
        error: s,
        count: t,
      } = await i
        .from("form_submissions")
        .select("*", { count: "exact" })
        .eq("form_id", e)
        .order("submitted_at", { ascending: !1 });
      if (s) throw s;
      return { data: r, count: t ?? 0 };
    },
    enabled: !!e,
  });
}
function C() {
  const e = u();
  return a({
    mutationFn: async (r) => {
      const { data: s, error: t } = await i
        .from("forms")
        .insert({
          title: r.title,
          description: r.description ?? null,
          status: "brouillon",
        })
        .select()
        .single();
      if (t) throw t;
      return s;
    },
    onSuccess: () => {
      (e.invalidateQueries({ queryKey: ["forms"] }),
        o.success("Formulaire créé avec succès"));
    },
    onError: (r) => {
      o.error(`Erreur: ${r.message}`);
    },
  });
}
function b() {
  const e = u();
  return a({
    mutationFn: async ({ id: r, ...s }) => {
      const { data: t, error: n } = await i
        .from("forms")
        .update(s)
        .eq("id", r)
        .select()
        .single();
      if (n) throw n;
      return t;
    },
    onSuccess: (r) => {
      (e.invalidateQueries({ queryKey: ["forms"] }),
        e.setQueryData(["forms", r.id, "fields"], void 0),
        o.success("Formulaire mis à jour"));
    },
    onError: (r) => {
      o.error(`Erreur: ${r.message}`);
    },
  });
}
function K() {
  const e = u();
  return a({
    mutationFn: async (r) => {
      const { error: s } = await i.from("forms").delete().eq("id", r);
      if (s) throw s;
    },
    onSuccess: () => {
      (e.invalidateQueries({ queryKey: ["forms"] }),
        o.success("Formulaire supprimé"));
    },
    onError: (r) => {
      o.error(`Erreur: ${r.message}`);
    },
  });
}
function Q() {
  const e = u();
  return a({
    mutationFn: async (r) => {
      const { data: s, error: t } = await i
        .from("form_fields")
        .insert(r)
        .select()
        .single();
      if (t) throw t;
      return s;
    },
    onSuccess: (r) => {
      (e.invalidateQueries({ queryKey: ["forms", r.form_id, "fields"] }),
        o.success("Champ ajouté"));
    },
    onError: (r) => {
      o.error(`Erreur: ${r.message}`);
    },
  });
}
function v() {
  const e = u();
  return a({
    mutationFn: async ({ id: r, ...s }) => {
      const { data: t, error: n } = await i
        .from("form_fields")
        .update(s)
        .eq("id", r)
        .select()
        .single();
      if (n) throw n;
      return t;
    },
    onSuccess: (r) => {
      (e.invalidateQueries({ queryKey: ["forms", r.form_id, "fields"] }),
        o.success("Champ mis à jour"));
    },
    onError: (r) => {
      o.error(`Erreur: ${r.message}`);
    },
  });
}
function S() {
  const e = u();
  return a({
    mutationFn: async ({ id: r, formId: s }) => {
      const { error: t } = await i.from("form_fields").delete().eq("id", r);
      if (t) throw t;
      return { formId: s };
    },
    onSuccess: (r) => {
      (e.invalidateQueries({ queryKey: ["forms", r.formId, "fields"] }),
        o.success("Champ supprimé"));
    },
    onError: (r) => {
      o.error(`Erreur: ${r.message}`);
    },
  });
}
export {
  g as a,
  K as b,
  E as c,
  b as d,
  Q as e,
  v as f,
  S as g,
  _ as h,
  C as u,
};
