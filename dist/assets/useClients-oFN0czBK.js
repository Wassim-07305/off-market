import { u as p, a, b as l } from "./vendor-query-sBpsl8Kt.js";
import { s as u } from "./index-DY9GA2La.js";
import { t as i } from "./vendor-ui-DDdrexJZ.js";
import { I as f } from "./constants-IBlSVYu1.js";
function h(s = {}) {
  const { search: e, status: r, page: n = 1 } = s,
    t = (n - 1) * f,
    o = t + f - 1;
  return p({
    queryKey: ["clients", s],
    queryFn: async () => {
      let c = u
        .from("clients")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: !1 })
        .range(t, o);
      (e &&
        (c = c.or(`name.ilike.%${e}%,email.ilike.%${e}%,phone.ilike.%${e}%`)),
        r && (c = c.eq("status", r)));
      const { data: y, error: m, count: d } = await c;
      if (m) throw m;
      return { data: y, count: d ?? 0 };
    },
  });
}
function $() {
  const s = a();
  return l({
    mutationFn: async (e) => {
      const { data: r, error: n } = await u
        .from("clients")
        .insert(e)
        .select()
        .single();
      if (n) throw n;
      return r;
    },
    onSuccess: () => {
      (s.invalidateQueries({ queryKey: ["clients"] }),
        i.success("Client créé avec succès"));
    },
    onError: (e) => {
      i.error(`Erreur: ${e.message}`);
    },
  });
}
function w() {
  const s = a();
  return l({
    mutationFn: async ({ id: e, ...r }) => {
      const { data: n, error: t } = await u
        .from("clients")
        .update(r)
        .eq("id", e)
        .select()
        .single();
      if (t) throw t;
      return n;
    },
    onSuccess: (e) => {
      (s.invalidateQueries({ queryKey: ["clients"] }),
        s.setQueryData(["clients", e.id], e),
        i.success("Client mis à jour"));
    },
    onError: (e) => {
      i.error(`Erreur: ${e.message}`);
    },
  });
}
function Q() {
  const s = a();
  return l({
    mutationFn: async (e) => {
      let r = 0,
        n = 0;
      for (let t = 0; t < e.length; t += 50) {
        const o = e.slice(t, t + 50),
          { error: c } = await u.from("clients").insert(o);
        c ? (n += o.length) : (r += o.length);
      }
      return { success: r, errors: n };
    },
    onSuccess: (e) => {
      (s.invalidateQueries({ queryKey: ["clients"] }),
        e.errors === 0
          ? i.success(`${e.success} clients importés avec succès`)
          : i.success(`${e.success} importés, ${e.errors} erreurs`));
    },
    onError: (e) => {
      i.error(`Erreur d'import: ${e.message}`);
    },
  });
}
function v() {
  const s = a();
  return l({
    mutationFn: async (e) => {
      const { error: r } = await u.from("clients").delete().eq("id", e);
      if (r) throw r;
    },
    onSuccess: () => {
      (s.invalidateQueries({ queryKey: ["clients"] }),
        i.success("Client supprimé"));
    },
    onError: (e) => {
      i.error(`Erreur: ${e.message}`);
    },
  });
}
export { $ as a, w as b, Q as c, v as d, h as u };
