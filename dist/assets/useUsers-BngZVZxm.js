import { u as i, a as n, b as l } from "./vendor-query-sBpsl8Kt.js";
import { s as u } from "./index-DY9GA2La.js";
import { t as a } from "./vendor-ui-DDdrexJZ.js";
function y() {
  return i({
    queryKey: ["users"],
    queryFn: async () => {
      const { data: e, error: r } = await u
        .from("profiles")
        .select("*")
        .order("full_name", { ascending: !0 });
      if (r) throw r;
      const { data: o, error: s } = await u.from("user_roles").select("*");
      if (s) throw s;
      return e.map((t) => ({
        ...t,
        role: o.find((c) => c.user_id === t.id)?.role ?? "prospect",
      }));
    },
  });
}
function p() {
  return i({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data: e, error: r } = await u
        .from("profiles")
        .select("id, full_name, avatar_url, email")
        .order("full_name");
      if (r) throw r;
      return e;
    },
  });
}
function q() {
  const e = n();
  return l({
    mutationFn: async ({ userId: r, role: o }) => {
      const { error: s } = await u
        .from("user_roles")
        .upsert({ user_id: r, role: o }, { onConflict: "user_id" });
      if (s) throw s;
    },
    onSuccess: () => {
      (e.invalidateQueries({ queryKey: ["users"] }),
        a.success("Rôle mis à jour"));
    },
    onError: (r) => {
      a.error(`Erreur: ${r.message}`);
    },
  });
}
function w() {
  const e = n();
  return l({
    mutationFn: async ({ id: r, ...o }) => {
      const { data: s, error: t } = await u
        .from("profiles")
        .update(o)
        .eq("id", r)
        .select()
        .single();
      if (t) throw t;
      return s;
    },
    onSuccess: () => {
      (e.invalidateQueries({ queryKey: ["users"] }),
        e.invalidateQueries({ queryKey: ["profiles"] }),
        a.success("Profil mis à jour"));
    },
    onError: (r) => {
      a.error(`Erreur: ${r.message}`);
    },
  });
}
export { q as a, w as b, y as c, p as u };
