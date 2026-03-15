import { u as g, a as d, b as f, j as i } from "./vendor-query-sBpsl8Kt.js";
import { s as a, c } from "./index-DY9GA2La.js";
import { r as q } from "./vendor-react-Cci7g3Cb.js";
import { u as w } from "./vendor-forms-Ct2mZ2NL.js";
import { a as v } from "./zod-COY_rf8d.js";
import { b as E } from "./forms-zLivl21i.js";
import { t as n } from "./vendor-ui-DDdrexJZ.js";
import { M as N } from "./modal-DBBZDXoW.js";
import { I as y } from "./input-B9vrc6Q3.js";
import { T as S } from "./textarea-D7qrlVHg.js";
import { B as x } from "./button-DlbP8VPc.js";
function U(t = !1) {
  return g({
    queryKey: ["formations", { publishedOnly: t }],
    queryFn: async () => {
      let e = a
        .from("formations")
        .select("*")
        .order("sort_order", { ascending: !0 });
      t && (e = e.eq("is_published", !0));
      const { data: r, error: s } = await e;
      if (s) throw s;
      return r;
    },
  });
}
function L(t) {
  return g({
    queryKey: ["formations", t],
    queryFn: async () => {
      if (!t) return null;
      const { data: e, error: r } = await a
        .from("formations")
        .select("*")
        .eq("id", t)
        .single();
      if (r) throw r;
      return e;
    },
    enabled: !!t,
  });
}
function M() {
  const t = d();
  return f({
    mutationFn: async (e) => {
      const { data: r, error: s } = await a
        .from("formations")
        .insert(e)
        .select()
        .single();
      if (s) throw s;
      return r;
    },
    onSuccess: () => {
      (t.invalidateQueries({ queryKey: ["formations"] }),
        n.success("Formation créée"));
    },
    onError: (e) => {
      n.error(`Erreur: ${e.message}`);
    },
  });
}
function C() {
  const t = d();
  return f({
    mutationFn: async ({ id: e, ...r }) => {
      const { data: s, error: o } = await a
        .from("formations")
        .update(r)
        .eq("id", e)
        .select()
        .single();
      if (o) throw o;
      return s;
    },
    onSuccess: () => {
      (t.invalidateQueries({ queryKey: ["formations"] }),
        n.success("Formation mise à jour"));
    },
    onError: (e) => {
      n.error(`Erreur: ${e.message}`);
    },
  });
}
function V() {
  const t = d();
  return f({
    mutationFn: async ({ id: e, is_published: r }) => {
      const { data: s, error: o } = await a
        .from("formations")
        .update({ is_published: r })
        .eq("id", e)
        .select()
        .single();
      if (o) throw o;
      return s;
    },
    onSuccess: (e, r) => {
      (t.invalidateQueries({ queryKey: ["formations"] }),
        n.success(
          r.is_published ? "Formation publiée" : "Formation mise en privé",
        ));
    },
    onError: (e) => {
      n.error(`Erreur: ${e.message}`);
    },
  });
}
function z() {
  const t = d();
  return f({
    mutationFn: async (e) => {
      const { error: r } = await a.from("formations").delete().eq("id", e);
      if (r) throw r;
    },
    onSuccess: () => {
      (t.invalidateQueries({ queryKey: ["formations"] }),
        n.success("Formation supprimée"));
    },
    onError: (e) => {
      n.error(`Erreur: ${e.message}`);
    },
  });
}
function G({
  completed: t,
  total: e,
  className: r,
  showLabel: s = !0,
  size: o = "md",
}) {
  const u = e > 0 ? Math.round((t / e) * 100) : 0;
  return i.jsxs("div", {
    className: c("flex items-center gap-2", r),
    children: [
      i.jsx("div", {
        className: c(
          "flex-1 rounded-full bg-muted overflow-hidden",
          o === "sm" ? "h-1.5" : "h-2",
        ),
        children: i.jsx("div", {
          className: c(
            "h-full rounded-full transition-all duration-500",
            u === 100 ? "bg-green-500" : "bg-primary",
          ),
          style: { width: `${u}%` },
        }),
      }),
      s &&
        i.jsxs("span", {
          className: c(
            "shrink-0 font-medium",
            o === "sm" ? "text-[10px]" : "text-xs",
            "text-muted-foreground",
          ),
          children: [t, "/", e],
        }),
    ],
  });
}
function H({ open: t, onClose: e, formation: r }) {
  const s = !!r,
    o = M(),
    u = C(),
    {
      register: l,
      handleSubmit: F,
      reset: p,
      formState: { errors: h, isSubmitting: j },
    } = w({
      resolver: v(E),
      defaultValues: {
        title: "",
        description: "",
        thumbnail_url: "",
        is_published: !1,
      },
    });
  q.useEffect(() => {
    p(
      r
        ? {
            title: r.title,
            description: r.description ?? "",
            thumbnail_url: r.thumbnail_url ?? "",
            is_published: r.is_published,
          }
        : { title: "", description: "", thumbnail_url: "", is_published: !1 },
    );
  }, [r, p]);
  const _ = async (m) => {
    const b = {
      title: m.title,
      description: m.description || void 0,
      thumbnail_url: m.thumbnail_url || void 0,
      is_published: m.is_published,
    };
    (s && r ? await u.mutateAsync({ id: r.id, ...b }) : await o.mutateAsync(b),
      e());
  };
  return i.jsx(N, {
    open: t,
    onClose: e,
    title: s ? "Modifier la formation" : "Nouvelle formation",
    size: "md",
    children: i.jsxs("form", {
      onSubmit: F(_),
      className: "space-y-4",
      children: [
        i.jsx(y, { label: "Titre", ...l("title"), error: h.title?.message }),
        i.jsx(S, {
          label: "Description",
          ...l("description"),
          error: h.description?.message,
        }),
        i.jsx(y, {
          label: "URL de la miniature",
          type: "url",
          placeholder: "https://...",
          ...l("thumbnail_url"),
          error: h.thumbnail_url?.message,
        }),
        i.jsxs("label", {
          className: "flex items-center gap-2 text-sm",
          children: [
            i.jsx("input", {
              type: "checkbox",
              ...l("is_published"),
              className: "h-4 w-4 rounded border-border",
            }),
            i.jsx("span", {
              className: "font-medium text-foreground",
              children: "Publier la formation",
            }),
          ],
        }),
        i.jsxs("div", {
          className: "flex justify-end gap-3 pt-2",
          children: [
            i.jsx(x, {
              type: "button",
              variant: "secondary",
              onClick: e,
              children: "Annuler",
            }),
            i.jsx(x, {
              type: "submit",
              loading: j,
              children: s ? "Mettre à jour" : "Créer",
            }),
          ],
        }),
      ],
    }),
  });
}
export { H as F, G as P, V as a, L as b, z as c, U as u };
