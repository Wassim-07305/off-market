import { u as v, a as h, b as p, j as e } from "./vendor-query-sBpsl8Kt.js";
import { r as d } from "./vendor-react-Cci7g3Cb.js";
import {
  j as f,
  s as c,
  w as b,
  S as N,
  x as C,
  i as q,
  c as x,
  g as z,
} from "./index-DY9GA2La.js";
import { C as _, d as w } from "./card-Dkj99_H3.js";
import { B as j } from "./button-DlbP8VPc.js";
import { T as k } from "./textarea-D7qrlVHg.js";
import { E as K } from "./empty-state-BFSeK4Tv.js";
import {
  t as m,
  M as P,
  ae as S,
  aV as F,
  a1 as T,
  H as Q,
} from "./vendor-ui-DDdrexJZ.js";
import { I as y } from "./constants-IBlSVYu1.js";
import { u as M } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
function A(s = 1) {
  const r = (s - 1) * y,
    t = r + y - 1;
  return v({
    queryKey: ["feed-posts", s],
    queryFn: async () => {
      const {
        data: n,
        error: a,
        count: o,
      } = await c
        .from("feed_posts")
        .select("*, author:profiles!author_id(id, full_name, avatar_url)", {
          count: "exact",
        })
        .order("is_pinned", { ascending: !1 })
        .order("created_at", { ascending: !1 })
        .range(r, t);
      if (a) throw a;
      return { data: n, count: o ?? 0 };
    },
  });
}
function U() {
  const s = h(),
    r = f((t) => t.user);
  return p({
    mutationFn: async (t) => {
      if (!r) throw new Error("Non authentifié");
      const { data: n, error: a } = await c
        .from("feed_posts")
        .insert({ author_id: r.id, content: t })
        .select("*, author:profiles!author_id(id, full_name, avatar_url)")
        .single();
      if (a) throw a;
      return n;
    },
    onSuccess: () => {
      (s.invalidateQueries({ queryKey: ["feed-posts"] }),
        m.success("Publication créée"));
    },
    onError: (t) => {
      m.error(`Erreur: ${t.message}`);
    },
  });
}
function D() {
  const s = h();
  return p({
    mutationFn: async (r) => {
      const { error: t } = await c.from("feed_posts").delete().eq("id", r);
      if (t) throw t;
    },
    onSuccess: () => {
      (s.invalidateQueries({ queryKey: ["feed-posts"] }),
        m.success("Publication supprimée"));
    },
    onError: (r) => {
      m.error(`Erreur: ${r.message}`);
    },
  });
}
function L(s) {
  return v({
    queryKey: ["feed-comments", s],
    queryFn: async () => {
      if (!s) throw new Error("Post ID requis");
      const { data: r, error: t } = await c
        .from("feed_comments")
        .select("*, author:profiles!author_id(id, full_name, avatar_url)")
        .eq("post_id", s)
        .order("created_at", { ascending: !0 });
      if (t) throw t;
      return r;
    },
    enabled: !!s,
  });
}
function $() {
  const s = h(),
    r = f((t) => t.user);
  return p({
    mutationFn: async ({ post_id: t, content: n }) => {
      if (!r) throw new Error("Non authentifié");
      const { data: a, error: o } = await c
        .from("feed_comments")
        .insert({ post_id: t, author_id: r.id, content: n })
        .select("*, author:profiles!author_id(id, full_name, avatar_url)")
        .single();
      if (o) throw o;
      return (
        await c.rpc("increment_comment_count", { row_id: t }).then(() => {}),
        a
      );
    },
    onSuccess: (t, n) => {
      (s.invalidateQueries({ queryKey: ["feed-comments", n.post_id] }),
        s.invalidateQueries({ queryKey: ["feed-posts"] }));
    },
    onError: (t) => {
      m.error(`Erreur: ${t.message}`);
    },
  });
}
function G() {
  const s = h(),
    r = f((t) => t.user);
  return p({
    mutationFn: async (t) => {
      if (!r) throw new Error("Non authentifié");
      const { data: n } = await c
        .from("feed_likes")
        .select("id")
        .eq("post_id", t)
        .eq("profile_id", r.id)
        .maybeSingle();
      if (n) {
        const { error: a } = await c.from("feed_likes").delete().eq("id", n.id);
        if (a) throw a;
        return (
          await c
            .from("feed_posts")
            .update({ likes_count: Math.max(0, -1) })
            .eq("id", t)
            .then(() => {}),
          { liked: !1, postId: t }
        );
      } else {
        const { error: a } = await c
          .from("feed_likes")
          .insert({ post_id: t, profile_id: r.id });
        if (a) throw a;
        return { liked: !0, postId: t };
      }
    },
    onSuccess: () => {
      (s.invalidateQueries({ queryKey: ["feed-posts"] }),
        s.invalidateQueries({ queryKey: ["my-likes"] }));
    },
    onError: (t) => {
      m.error(`Erreur: ${t.message}`);
    },
  });
}
function R() {
  const s = f((r) => r.user);
  return v({
    queryKey: ["my-likes", s?.id],
    queryFn: async () => {
      if (!s) return [];
      const { data: r, error: t } = await c
        .from("feed_likes")
        .select("post_id")
        .eq("profile_id", s.id);
      if (t) throw t;
      return r.map((n) => n.post_id);
    },
    enabled: !!s,
  });
}
function B() {
  const [s, r] = d.useState(""),
    t = U(),
    n = d.useCallback(() => {
      const a = s.trim();
      a && t.mutate(a, { onSuccess: () => r("") });
    }, [s, t]);
  return e.jsx(_, {
    children: e.jsxs(w, {
      className: "pt-5",
      children: [
        e.jsx(k, {
          placeholder: "Partagez quelque chose avec la communauté...",
          value: s,
          onChange: (a) => r(a.target.value),
          autoGrow: !0,
          className:
            "min-h-[60px] resize-none border-0 bg-muted/30 focus:ring-1",
        }),
        e.jsx("div", {
          className: "mt-3 flex justify-end",
          children: e.jsx(j, {
            size: "sm",
            disabled: !s.trim(),
            loading: t.isPending,
            onClick: n,
            icon: e.jsx(S, { className: "h-3.5 w-3.5" }),
            children: "Publier",
          }),
        }),
      ],
    }),
  });
}
function E({ name: s, avatarUrl: r, size: t = "md" }) {
  const n = t === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return r
    ? e.jsx("img", {
        src: r,
        alt: s,
        className: x("rounded-full object-cover", n),
      })
    : e.jsx("div", {
        className: x(
          "flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary",
          n,
        ),
        children: z(s),
      });
}
function H({ postId: s }) {
  const { data: r, isLoading: t } = L(s),
    n = $(),
    [a, o] = d.useState(""),
    u = d.useCallback(() => {
      const i = a.trim();
      i && n.mutate({ post_id: s, content: i }, { onSuccess: () => o("") });
    }, [a, s, n]);
  return e.jsxs("div", {
    className: "border-t border-border/50 px-6 pb-4 pt-3",
    children: [
      t
        ? e.jsx("div", {
            className: "space-y-3",
            children: [1, 2].map((i) =>
              e.jsxs(
                "div",
                {
                  className: "flex gap-2",
                  children: [
                    e.jsx(b, { size: "sm" }),
                    e.jsx(C, { lines: 1, className: "flex-1" }),
                  ],
                },
                i,
              ),
            ),
          })
        : e.jsx("div", {
            className: "space-y-3",
            children: r?.map((i) =>
              e.jsxs(
                "div",
                {
                  className: "flex gap-2.5",
                  children: [
                    e.jsx(E, {
                      name: i.author?.full_name ?? "Utilisateur",
                      avatarUrl: i.author?.avatar_url,
                      size: "sm",
                    }),
                    e.jsxs("div", {
                      className: "flex-1 min-w-0",
                      children: [
                        e.jsxs("div", {
                          className: "rounded-xl bg-muted/40 px-3 py-2",
                          children: [
                            e.jsx("p", {
                              className:
                                "text-xs font-semibold text-foreground",
                              children: i.author?.full_name ?? "Utilisateur",
                            }),
                            e.jsx("p", {
                              className:
                                "text-sm text-foreground/80 whitespace-pre-wrap",
                              children: i.content,
                            }),
                          ],
                        }),
                        e.jsx("p", {
                          className: "mt-0.5 text-[11px] text-muted-foreground",
                          children: q(i.created_at),
                        }),
                      ],
                    }),
                  ],
                },
                i.id,
              ),
            ),
          }),
      e.jsxs("div", {
        className: "mt-3 flex items-center gap-2",
        children: [
          e.jsx(k, {
            placeholder: "Écrire un commentaire...",
            value: a,
            onChange: (i) => o(i.target.value),
            className: "min-h-[36px] max-h-[120px] resize-none py-2 text-sm",
            autoGrow: !0,
            onKeyDown: (i) => {
              i.key === "Enter" && !i.shiftKey && (i.preventDefault(), u());
            },
          }),
          e.jsx(j, {
            variant: "ghost",
            size: "sm",
            disabled: !a.trim(),
            loading: n.isPending,
            onClick: u,
            className: "shrink-0",
            children: e.jsx(S, { className: "h-4 w-4" }),
          }),
        ],
      }),
    ],
  });
}
function J({ post: s, isLiked: r }) {
  const [t, n] = d.useState(!1),
    a = G(),
    o = D(),
    i = f((g) => g.user)?.id === s.author_id;
  return e.jsxs(_, {
    className: "overflow-hidden",
    children: [
      e.jsxs("div", {
        className: "flex items-start justify-between px-6 pt-5 pb-2",
        children: [
          e.jsxs("div", {
            className: "flex items-center gap-3",
            children: [
              e.jsx(E, {
                name: s.author?.full_name ?? "Utilisateur",
                avatarUrl: s.author?.avatar_url,
              }),
              e.jsxs("div", {
                children: [
                  e.jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [
                      e.jsx("p", {
                        className: "text-sm font-semibold text-foreground",
                        children: s.author?.full_name ?? "Utilisateur",
                      }),
                      s.is_pinned &&
                        e.jsxs("span", {
                          className:
                            "inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700",
                          children: [
                            e.jsx(F, { className: "h-3 w-3" }),
                            "Épinglé",
                          ],
                        }),
                    ],
                  }),
                  e.jsx("p", {
                    className: "text-xs text-muted-foreground",
                    children: q(s.created_at),
                  }),
                ],
              }),
            ],
          }),
          i &&
            e.jsx(j, {
              variant: "ghost",
              size: "sm",
              className:
                "h-8 w-8 p-0 text-muted-foreground hover:text-destructive",
              onClick: () => o.mutate(s.id),
              loading: o.isPending,
              children: e.jsx(T, { className: "h-4 w-4" }),
            }),
        ],
      }),
      e.jsx(w, {
        className: "pb-3",
        children: e.jsx("p", {
          className:
            "text-sm text-foreground leading-relaxed whitespace-pre-wrap",
          children: s.content,
        }),
      }),
      e.jsxs("div", {
        className:
          "flex items-center justify-between px-6 pb-2 text-xs text-muted-foreground",
        children: [
          e.jsxs("span", { children: [s.likes_count, " j'aime"] }),
          e.jsxs("span", {
            children: [
              s.comments_count,
              " commentaire",
              s.comments_count !== 1 ? "s" : "",
            ],
          }),
        ],
      }),
      e.jsxs("div", {
        className: "flex items-center border-t border-border/50 px-2",
        children: [
          e.jsxs("button", {
            onClick: () => a.mutate(s.id),
            className: x(
              "flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors rounded-lg mx-1 my-1",
              "hover:bg-muted/60",
              r
                ? "text-red-500"
                : "text-muted-foreground hover:text-foreground",
            ),
            children: [
              e.jsx(Q, { className: x("h-4.5 w-4.5", r && "fill-current") }),
              "J'aime",
            ],
          }),
          e.jsxs("button", {
            onClick: () => n(!t),
            className: x(
              "flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors rounded-lg mx-1 my-1",
              "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              t && "text-primary",
            ),
            children: [e.jsx(P, { className: "h-4.5 w-4.5" }), "Commenter"],
          }),
        ],
      }),
      t && e.jsx(H, { postId: s.id }),
    ],
  });
}
function V() {
  return e.jsxs(_, {
    children: [
      e.jsx("div", {
        className: "px-6 pt-5 pb-2",
        children: e.jsxs("div", {
          className: "flex items-center gap-3",
          children: [
            e.jsx(b, {}),
            e.jsxs("div", {
              className: "space-y-1.5",
              children: [
                e.jsx(N, { className: "h-4 w-28" }),
                e.jsx(N, { className: "h-3 w-20" }),
              ],
            }),
          ],
        }),
      }),
      e.jsx(w, { children: e.jsx(C, { lines: 3 }) }),
    ],
  });
}
function ie() {
  M("Communauté");
  const [s, r] = d.useState(1),
    { data: t, isLoading: n, isPending: a } = A(s),
    { data: o = [] } = R(),
    u = t?.data ?? [],
    i = t?.count ?? 0,
    g = s * y < i;
  return e.jsxs("div", {
    className: "mx-auto max-w-2xl space-y-6 p-6",
    children: [
      e.jsxs("div", {
        children: [
          e.jsx("h1", {
            className: "text-2xl font-bold text-foreground",
            children: "Communauté",
          }),
          e.jsx("p", {
            className: "mt-1 text-sm text-muted-foreground",
            children:
              "Échangez avec les autres membres, partagez vos victoires et posez vos questions.",
          }),
        ],
      }),
      e.jsx(B, {}),
      n
        ? e.jsx("div", {
            className: "space-y-4",
            children: [1, 2, 3].map((l) => e.jsx(V, {}, l)),
          })
        : u.length === 0
          ? e.jsx(K, {
              icon: e.jsx(P, { className: "h-6 w-6" }),
              title: "Aucune publication",
              description:
                "Soyez le premier à publier quelque chose dans la communauté !",
            })
          : e.jsxs("div", {
              className: "space-y-4",
              children: [
                u.map((l) =>
                  e.jsx(J, { post: l, isLiked: o.includes(l.id) }, l.id),
                ),
                g &&
                  e.jsx("div", {
                    className: "flex justify-center pt-2",
                    children: e.jsx(j, {
                      variant: "secondary",
                      onClick: () => r((l) => l + 1),
                      loading: a,
                      children: "Charger plus",
                    }),
                  }),
              ],
            }),
    ],
  });
}
export { ie as default };
