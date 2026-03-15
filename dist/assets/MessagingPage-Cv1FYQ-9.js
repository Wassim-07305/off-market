import {
  j as e,
  a as P,
  d as V,
  b as I,
  u as ie,
} from "./vendor-query-sBpsl8Kt.js";
import { r as u } from "./vendor-react-Cci7g3Cb.js";
import {
  g as D,
  c as v,
  i as oe,
  d as J,
  s as N,
  j as F,
  u as X,
  f as z,
  S as k,
  k as de,
  l as ce,
  m as ue,
  n as me,
  o as fe,
  p as xe,
} from "./index-DY9GA2La.js";
import { c as he, f as U, m as pe } from "./vendor-utils-DoLlG-6J.js";
import {
  O as Y,
  z as ge,
  r as K,
  t as A,
  ad as be,
  S as je,
  az as ve,
  al as ye,
  a1 as H,
  aA as W,
  X as O,
  ae as Ne,
  a0 as Z,
  aa as we,
  V as _e,
  M as Ce,
} from "./vendor-ui-DDdrexJZ.js";
import { B as q } from "./button-DlbP8VPc.js";
import { u as ee } from "./useUsers-BngZVZxm.js";
import { M as te } from "./modal-DBBZDXoW.js";
import { I as se } from "./input-B9vrc6Q3.js";
import { S as Se } from "./select-E7QvXrZc.js";
import { E as Me } from "./empty-state-BFSeK4Tv.js";
import { u as ke } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-supabase-BZ0N5lZN.js";
const Ee = he()((t) => ({
  activeChannelId: null,
  setActiveChannel: (s) => t({ activeChannelId: s, mobileShowChat: !!s }),
  mobileShowChat: !1,
  setMobileShowChat: (s) => t({ mobileShowChat: s }),
}));
function G({ channel: t, isActive: s, onClick: r }) {
  const a =
      t.type === "direct" && t.other_member ? t.other_member.full_name : t.name,
    l = D(a),
    n = t.last_message,
    i = t.unread_count > 0;
  return e.jsxs("button", {
    type: "button",
    onClick: r,
    className: v(
      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
      s ? "bg-primary/10 text-foreground" : "text-foreground hover:bg-muted",
    ),
    children: [
      t.type === "direct"
        ? e.jsx("div", {
            className:
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700",
            children: t.other_member?.avatar_url
              ? e.jsx("img", {
                  src: t.other_member.avatar_url,
                  alt: a,
                  className: "h-10 w-10 rounded-full object-cover",
                })
              : l,
          })
        : e.jsx("div", {
            className:
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted",
            children: e.jsx(Y, { className: "h-5 w-5 text-muted-foreground" }),
          }),
      e.jsxs("div", {
        className: "min-w-0 flex-1",
        children: [
          e.jsxs("div", {
            className: "flex items-center justify-between gap-2",
            children: [
              e.jsx("span", {
                className: v(
                  "truncate text-sm",
                  i ? "font-semibold" : "font-medium",
                ),
                children: a,
              }),
              n &&
                e.jsx("span", {
                  className: "shrink-0 text-[10px] text-muted-foreground",
                  children: oe(n.created_at),
                }),
            ],
          }),
          e.jsxs("div", {
            className: "flex items-center justify-between gap-2",
            children: [
              e.jsx("p", {
                className: v(
                  "truncate text-xs",
                  i ? "font-medium text-foreground" : "text-muted-foreground",
                ),
                children: n ? n.content || "Fichier joint" : "Aucun message",
              }),
              i &&
                e.jsx("span", {
                  className:
                    "flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground",
                  children: t.unread_count > 99 ? "99+" : t.unread_count,
                }),
            ],
          }),
        ],
      }),
    ],
  });
}
function qe({
  channels: t,
  activeChannelId: s,
  onSelect: r,
  onCreateChannel: a,
}) {
  const { isAdmin: l } = J(),
    [n, i] = u.useState(""),
    m = u.useMemo(() => {
      if (!n.trim()) return t;
      const d = n.toLowerCase();
      return t.filter((o) =>
        (o.type === "direct" && o.other_member
          ? o.other_member.full_name
          : o.name
        )
          .toLowerCase()
          .includes(d),
      );
    }, [t, n]),
    c = m.filter((d) => d.type === "direct"),
    x = m.filter((d) => d.type === "group");
  return e.jsxs("div", {
    className: "flex h-full flex-col",
    children: [
      e.jsxs("div", {
        className:
          "flex items-center justify-between border-b border-border px-4 py-3",
        children: [
          e.jsx("h2", {
            className: "text-base font-semibold text-foreground",
            children: "Messages",
          }),
          l &&
            e.jsx("button", {
              type: "button",
              onClick: a,
              className:
                "rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              children: e.jsx(ge, { className: "h-5 w-5" }),
            }),
        ],
      }),
      e.jsx("div", {
        className: "px-3 py-2",
        children: e.jsxs("div", {
          className: "relative",
          children: [
            e.jsx(K, {
              className:
                "absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
            }),
            e.jsx("input", {
              type: "text",
              value: n,
              onChange: (d) => i(d.target.value),
              placeholder: "Rechercher...",
              className: v(
                "h-9 w-full rounded-xl border border-border bg-muted/30 pl-8 pr-3 text-sm",
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring",
              ),
            }),
          ],
        }),
      }),
      e.jsxs("div", {
        className: "flex-1 overflow-y-auto px-2 pb-2",
        children: [
          x.length > 0 &&
            e.jsxs("div", {
              className: "mb-1",
              children: [
                e.jsx("p", {
                  className:
                    "px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                  children: "Canaux",
                }),
                x.map((d) =>
                  e.jsx(
                    G,
                    {
                      channel: d,
                      isActive: d.id === s,
                      onClick: () => r(d.id),
                    },
                    d.id,
                  ),
                ),
              ],
            }),
          c.length > 0 &&
            e.jsxs("div", {
              className: "mb-1",
              children: [
                e.jsx("p", {
                  className:
                    "px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                  children: "Messages directs",
                }),
                c.map((d) =>
                  e.jsx(
                    G,
                    {
                      channel: d,
                      isActive: d.id === s,
                      onClick: () => r(d.id),
                    },
                    d.id,
                  ),
                ),
              ],
            }),
          m.length === 0 &&
            e.jsx("p", {
              className: "px-3 py-6 text-center text-sm text-muted-foreground",
              children: n ? "Aucun résultat" : "Aucune conversation",
            }),
        ],
      }),
    ],
  });
}
const R = 50;
function re(t, s, r) {
  t.setQueryData(["messages", s], (a) => {
    if (
      !a ||
      new Set(a.pages.flatMap((m) => m.data.map((c) => c.id))).has(r.id)
    )
      return a;
    const n = a.pages.length - 1,
      i = a.pages.map((m, c) => (c === n ? { ...m, data: [...m.data, r] } : m));
    return { ...a, pages: i };
  });
}
function Re(t) {
  const s = P(),
    r = u.useRef(new Set()),
    a = V({
      queryKey: ["messages", t],
      queryFn: async ({ pageParam: l = 0 }) => {
        if (!t) return { data: [], nextOffset: null };
        const n = l,
          i = n + R - 1,
          { data: m, error: c } = await N.from("messages")
            .select(
              "*, sender:profiles!sender_id(id, full_name, avatar_url, email)",
            )
            .eq("channel_id", t)
            .order("created_at", { ascending: !1 })
            .range(n, i);
        if (c) throw c;
        return { data: m.reverse(), nextOffset: m.length === R ? n + R : null };
      },
      initialPageParam: 0,
      getNextPageParam: (l) => l.nextOffset,
      enabled: !!t,
    });
  return (
    u.useEffect(() => {
      if (!t) return;
      const l = N.channel(`messages-${t}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `channel_id=eq.${t}`,
          },
          async (n) => {
            const i = n.new;
            if (r.current.has(i.id)) {
              (r.current.delete(i.id),
                s.invalidateQueries({ queryKey: ["channels"] }));
              return;
            }
            const { data: m } = await N.from("profiles")
                .select("id, full_name, avatar_url, email")
                .eq("id", i.sender_id)
                .single(),
              c = { ...i, sender: m ?? void 0 };
            (re(s, t, c), s.invalidateQueries({ queryKey: ["channels"] }));
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "messages",
            filter: `channel_id=eq.${t}`,
          },
          () => {
            s.invalidateQueries({ queryKey: ["messages", t] });
          },
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "messages",
            filter: `channel_id=eq.${t}`,
          },
          () => {
            s.invalidateQueries({ queryKey: ["messages", t] });
          },
        )
        .subscribe();
      return () => {
        N.removeChannel(l);
      };
    }, [t, s]),
    { ...a, sentMessageIds: r }
  );
}
function Ae() {
  const t = P();
  return I({
    mutationFn: async ({
      channelId: s,
      content: r,
      senderId: a,
      fileUrl: l,
      fileName: n,
      sentMessageIds: i,
    }) => {
      const { data: m, error: c } = await N.from("messages")
        .insert({
          channel_id: s,
          sender_id: a,
          content: r || null,
          file_url: l || null,
          file_name: n || null,
        })
        .select(
          "*, sender:profiles!sender_id(id, full_name, avatar_url, email)",
        )
        .single();
      if (c) throw c;
      const x = m;
      return (i && i.current.add(x.id), re(t, s, x), x);
    },
    onSuccess: () => {
      t.invalidateQueries({ queryKey: ["channels"] });
    },
    onError: (s) => {
      A.error(`Erreur: ${s.message}`);
    },
  });
}
function Pe(t, s) {
  return V({
    queryKey: ["messages-search", t, s],
    queryFn: async ({ pageParam: r = 0 }) => {
      if (!t || !s.trim()) return { data: [], nextOffset: null };
      const a = r,
        l = a + R - 1,
        { data: n, error: i } = await N.from("messages")
          .select(
            "*, sender:profiles!sender_id(id, full_name, avatar_url, email)",
          )
          .eq("channel_id", t)
          .ilike("content", `%${s.trim()}%`)
          .order("created_at", { ascending: !1 })
          .range(a, l);
      if (i) throw i;
      return { data: n, nextOffset: n.length === R ? a + R : null };
    },
    initialPageParam: 0,
    getNextPageParam: (r) => r.nextOffset,
    enabled: !!t && !!s.trim(),
  });
}
function Te() {
  const t = P();
  return I({
    mutationFn: async ({ id: s, content: r, channelId: a }) => {
      const { error: l } = await N.from("messages")
        .update({ content: r, is_edited: !0 })
        .eq("id", s);
      if (l) throw l;
      return a;
    },
    onSuccess: (s) => {
      t.invalidateQueries({ queryKey: ["messages", s] });
    },
    onError: (s) => {
      A.error(`Erreur: ${s.message}`);
    },
  });
}
function De() {
  const t = P();
  return I({
    mutationFn: async ({ id: s, channelId: r }) => {
      const { error: a } = await N.from("messages").delete().eq("id", s);
      if (a) throw a;
      return r;
    },
    onSuccess: (s) => {
      t.invalidateQueries({ queryKey: ["messages", s] });
    },
    onError: (s) => {
      A.error(`Erreur: ${s.message}`);
    },
  });
}
function Ie() {
  const t = P();
  return I({
    mutationFn: async (s) => {
      const { error: r } = await N.rpc("mark_channel_read", {
        p_channel_id: s,
      });
      if (r) throw r;
    },
    onSuccess: () => {
      t.invalidateQueries({ queryKey: ["channels"] });
    },
  });
}
const $e = 3e3,
  Le = 2e3;
function Fe(t) {
  const s = F((c) => c.user?.id),
    r = F((c) => c.profile),
    [a, l] = u.useState([]),
    n = u.useRef(0),
    i = u.useRef(new Map());
  u.useEffect(() => {
    if (!t || !s) return;
    const c = N.channel(`typing:${t}`);
    return (
      c
        .on("broadcast", { event: "typing" }, (x) => {
          const d = x.payload;
          if (d.userId === s) return;
          l((j) =>
            j.some((g) => g.userId === d.userId)
              ? j
              : [...j, { userId: d.userId, fullName: d.fullName }],
          );
          const o = i.current.get(d.userId);
          o && clearTimeout(o);
          const h = setTimeout(() => {
            (l((j) => j.filter((C) => C.userId !== d.userId)),
              i.current.delete(d.userId));
          }, $e);
          i.current.set(d.userId, h);
        })
        .subscribe(),
      () => {
        c.unsubscribe();
        for (const x of i.current.values()) clearTimeout(x);
        (i.current.clear(), l([]));
      }
    );
  }, [t, s]);
  const m = u.useCallback(() => {
    if (!t || !s || !r) return;
    const c = Date.now();
    c - n.current < Le ||
      ((n.current = c),
      N.channel(`typing:${t}`).send({
        type: "broadcast",
        event: "typing",
        payload: { userId: s, fullName: r.full_name },
      }));
  }, [t, s, r]);
  return { typingUsers: a, sendTyping: m };
}
function Ke(t) {
  return t ? Date.now() - new Date(t).getTime() < 300 * 1e3 : !1;
}
function Qe({
  channel: t,
  onBack: s,
  onSettings: r,
  onSearch: a,
  showBack: l = !1,
}) {
  const n =
      t.type === "direct" && t.other_member ? t.other_member.full_name : t.name,
    i = n
      .split(" ")
      .map((c) => c[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
    m =
      t.type === "direct" && t.other_member
        ? Ke(t.other_member.last_seen_at)
        : !1;
  return e.jsxs("div", {
    className:
      "flex h-14 items-center gap-3 border-b border-border bg-white px-4",
    children: [
      l &&
        e.jsx("button", {
          type: "button",
          onClick: s,
          className:
            "shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          children: e.jsx(be, { className: "h-5 w-5" }),
        }),
      t.type === "direct"
        ? e.jsxs("div", {
            className: "relative",
            children: [
              e.jsx("div", {
                className:
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700",
                children: t.other_member?.avatar_url
                  ? e.jsx("img", {
                      src: t.other_member.avatar_url,
                      alt: n,
                      className: "h-8 w-8 rounded-full object-cover",
                    })
                  : i,
              }),
              m &&
                e.jsx("span", {
                  className:
                    "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500",
                }),
            ],
          })
        : e.jsx("div", {
            className:
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted",
            children: e.jsx(Y, { className: "h-4 w-4 text-muted-foreground" }),
          }),
      e.jsxs("div", {
        className: "min-w-0 flex-1",
        children: [
          e.jsx("h2", {
            className: "truncate text-sm font-semibold text-foreground",
            children: n,
          }),
          e.jsx("p", {
            className: "truncate text-xs text-muted-foreground",
            children:
              t.type === "direct"
                ? m
                  ? "En ligne"
                  : "Message direct"
                : `${t.member_count} membres`,
          }),
        ],
      }),
      e.jsxs("div", {
        className: "flex items-center gap-1",
        children: [
          a &&
            e.jsx(q, {
              variant: "ghost",
              size: "sm",
              onClick: a,
              icon: e.jsx(K, { className: "h-4 w-4" }),
              className: v("shrink-0"),
              children: e.jsx("span", {
                className: "sr-only",
                children: "Rechercher",
              }),
            }),
          r &&
            t.type === "group" &&
            e.jsx(q, {
              variant: "ghost",
              size: "sm",
              onClick: r,
              icon: e.jsx(je, { className: "h-4 w-4" }),
              className: v("shrink-0"),
              children: e.jsx("span", {
                className: "sr-only",
                children: "Paramètres",
              }),
            }),
        ],
      }),
    ],
  });
}
const He = ["👍", "❤️", "😂", "😮", "😢", "🎉"];
function ze(t) {
  return ie({
    queryKey: ["message-reactions", t],
    queryFn: async () => {
      const { data: s, error: r } = await N.from("message_reactions")
        .select(
          `
          *,
          user:profiles!user_id(id, full_name, avatar_url)
        `,
        )
        .eq("message_id", t);
      if (r) throw r;
      return s ?? [];
    },
    enabled: !!t,
  });
}
function Ue() {
  const { user: t } = X(),
    s = P();
  return I({
    mutationFn: async ({ messageId: r, emoji: a }) => {
      if (!t) throw new Error("Non authentifié");
      const { data: l } = await N.from("message_reactions")
        .select("id")
        .eq("message_id", r)
        .eq("user_id", t.id)
        .eq("emoji", a)
        .maybeSingle();
      if (l) {
        const { error: n } = await N.from("message_reactions")
          .delete()
          .eq("id", l.id);
        if (n) throw n;
        return { action: "removed" };
      } else {
        const { error: n } = await N.from("message_reactions").insert({
          message_id: r,
          user_id: t.id,
          emoji: a,
        });
        if (n) throw n;
        return { action: "added" };
      }
    },
    onSuccess: (r, { messageId: a }) => {
      (s.invalidateQueries({ queryKey: ["message-reactions", a] }),
        s.invalidateQueries({ queryKey: ["messages"] }));
    },
  });
}
function Oe(t, s) {
  const r = new Map();
  for (const a of t) {
    const l = r.get(a.emoji) ?? { count: 0, users: [], hasReacted: !1 };
    (l.count++,
      a.user?.full_name && l.users.push(a.user.full_name),
      a.user_id === s && (l.hasReacted = !0),
      r.set(a.emoji, l));
  }
  return Array.from(r.entries()).map(([a, l]) => ({ emoji: a, ...l }));
}
function Be({ message: t, isOwn: s, showSender: r, onEdit: a, onDelete: l }) {
  const { user: n } = X(),
    [i, m] = u.useState(!1),
    [c, x] = u.useState(!1),
    { data: d } = ze(t.id),
    o = Ue(),
    h = u.useMemo(() => Oe(d ?? [], n?.id), [d, n?.id]),
    j = t.sender?.full_name ?? "Utilisateur",
    C = D(j),
    g = U(new Date(t.created_at), "HH:mm", { locale: z }),
    _ = (f) => {
      (o.mutate({ messageId: t.id, emoji: f }), x(!1));
    };
  return e.jsxs("div", {
    className: v("group flex gap-2", s ? "flex-row-reverse" : "flex-row"),
    onMouseEnter: () => m(!0),
    onMouseLeave: () => m(!1),
    children: [
      r && !s
        ? e.jsx("div", {
            className:
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700",
            children: t.sender?.avatar_url
              ? e.jsx("img", {
                  src: t.sender.avatar_url,
                  alt: j,
                  className: "h-8 w-8 rounded-full object-cover",
                })
              : C,
          })
        : s
          ? null
          : e.jsx("div", { className: "w-8 shrink-0" }),
      e.jsxs("div", {
        className: v(
          "flex max-w-[75%] flex-col",
          s ? "items-end" : "items-start",
        ),
        children: [
          r &&
            !s &&
            e.jsx("span", {
              className:
                "mb-0.5 px-1 text-xs font-medium text-muted-foreground",
              children: j,
            }),
          e.jsxs("div", {
            className: "relative flex items-center gap-1",
            children: [
              i &&
                e.jsxs("div", {
                  className: v(
                    "flex items-center gap-0.5",
                    s ? "order-first" : "order-last",
                  ),
                  children: [
                    e.jsxs("div", {
                      className: "relative",
                      children: [
                        e.jsx("button", {
                          type: "button",
                          onClick: () => x(!c),
                          className:
                            "rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                          children: e.jsx(ve, { className: "h-3.5 w-3.5" }),
                        }),
                        c &&
                          e.jsx("div", {
                            className: v(
                              "absolute z-10 flex gap-1 rounded-lg border border-border bg-white p-1.5 shadow-lg",
                              s ? "right-0" : "left-0",
                              "bottom-full mb-1",
                            ),
                            children: He.map((f) =>
                              e.jsx(
                                "button",
                                {
                                  onClick: () => _(f),
                                  className:
                                    "rounded p-1 text-base transition-transform hover:scale-125 hover:bg-muted",
                                  children: f,
                                },
                                f,
                              ),
                            ),
                          }),
                      ],
                    }),
                    s &&
                      a &&
                      t.content &&
                      e.jsx("button", {
                        type: "button",
                        onClick: () => a(t),
                        className:
                          "rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                        children: e.jsx(ye, { className: "h-3.5 w-3.5" }),
                      }),
                    s &&
                      l &&
                      e.jsx("button", {
                        type: "button",
                        onClick: () => l(t),
                        className:
                          "rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive",
                        children: e.jsx(H, { className: "h-3.5 w-3.5" }),
                      }),
                  ],
                }),
              e.jsxs("div", {
                className: "flex flex-col",
                children: [
                  e.jsxs("div", {
                    className: v(
                      "rounded-2xl px-3 py-2 text-sm",
                      s
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md",
                    ),
                    children: [
                      t.content &&
                        e.jsx("p", {
                          className: "whitespace-pre-wrap break-words",
                          children: t.content,
                        }),
                      t.file_url &&
                        e.jsx("a", {
                          href: t.file_url,
                          target: "_blank",
                          rel: "noopener noreferrer",
                          className: v(
                            "mt-1 flex items-center gap-1 text-xs underline",
                            s ? "text-primary-foreground/80" : "text-blue-600",
                          ),
                          children: t.file_name || "Fichier joint",
                        }),
                    ],
                  }),
                  h.length > 0 &&
                    e.jsx("div", {
                      className: v(
                        "mt-1 flex flex-wrap gap-1",
                        s ? "justify-end" : "justify-start",
                      ),
                      children: h.map(
                        ({ emoji: f, count: S, hasReacted: w, users: M }) =>
                          e.jsxs(
                            "button",
                            {
                              onClick: () => _(f),
                              title: M.join(", "),
                              className: v(
                                "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
                                w
                                  ? "border-primary/30 bg-primary/10 text-primary"
                                  : "border-border bg-white text-muted-foreground hover:border-primary/30 hover:bg-primary/5",
                              ),
                              children: [
                                e.jsx("span", { children: f }),
                                e.jsx("span", {
                                  className: "font-medium",
                                  children: S,
                                }),
                              ],
                            },
                            f,
                          ),
                      ),
                    }),
                ],
              }),
            ],
          }),
          e.jsxs("span", {
            className: "mt-0.5 px-1 text-[10px] text-muted-foreground",
            children: [g, t.is_edited && " (modifié)"],
          }),
        ],
      }),
    ],
  });
}
function We({
  onSend: t,
  disabled: s = !1,
  placeholder: r = "Écrire un message...",
  onTyping: a,
}) {
  const [l, n] = u.useState(""),
    [i, m] = u.useState(null),
    [c, x] = u.useState(!1),
    d = u.useRef(null),
    o = u.useRef(null),
    h = () => {
      const f = o.current;
      f &&
        ((f.style.height = "auto"),
        (f.style.height = `${Math.min(f.scrollHeight, 150)}px`));
    },
    j = async () => {
      const f = l.trim();
      if (!(!f && !i)) {
        if (i) {
          x(!0);
          try {
            const S = i.name.split(".").pop(),
              w = `messages/${Date.now()}-${Math.random().toString(36).slice(2)}.${S}`,
              { error: M } = await N.storage.from("files").upload(w, i);
            if (M) throw M;
            const { data: T } = N.storage.from("files").getPublicUrl(w);
            t(f || void 0, T.publicUrl, i.name);
          } catch {
            (A.error("Erreur lors de l'upload du fichier"), x(!1));
            return;
          }
          x(!1);
        } else t(f);
        (n(""), m(null), o.current && (o.current.style.height = "auto"));
      }
    },
    C = (f) => {
      f.key === "Enter" && !f.shiftKey && (f.preventDefault(), j());
    },
    g = (f) => {
      const S = f.target.files?.[0];
      if (S) {
        if (S.size > 10 * 1024 * 1024) {
          A.error("Le fichier ne doit pas dépasser 10 Mo");
          return;
        }
        m(S);
      }
      d.current && (d.current.value = "");
    },
    _ = (l.trim().length > 0 || i) && !c && !s;
  return e.jsxs("div", {
    className: "border-t border-border bg-white px-4 py-3",
    children: [
      i &&
        e.jsxs("div", {
          className:
            "mb-2 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm",
          children: [
            e.jsx(W, { className: "h-4 w-4 shrink-0 text-muted-foreground" }),
            e.jsx("span", {
              className: "min-w-0 flex-1 truncate text-foreground",
              children: i.name,
            }),
            e.jsx("button", {
              type: "button",
              onClick: () => m(null),
              className:
                "shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground",
              children: e.jsx(O, { className: "h-3.5 w-3.5" }),
            }),
          ],
        }),
      e.jsxs("div", {
        className: "flex items-end gap-2",
        children: [
          e.jsx("button", {
            type: "button",
            onClick: () => d.current?.click(),
            disabled: s || c,
            className: v(
              "shrink-0 rounded-lg p-2 text-muted-foreground transition-colors",
              "hover:bg-muted hover:text-foreground",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            ),
            children: e.jsx(W, { className: "h-5 w-5" }),
          }),
          e.jsx("input", {
            ref: d,
            type: "file",
            className: "hidden",
            onChange: g,
            accept: "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip",
          }),
          e.jsx("textarea", {
            ref: o,
            value: l,
            onChange: (f) => {
              (n(f.target.value), h(), a?.());
            },
            onKeyDown: C,
            placeholder: r,
            disabled: s || c,
            rows: 1,
            className: v(
              "max-h-[150px] min-h-[36px] flex-1 resize-none rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            ),
          }),
          e.jsx("button", {
            type: "button",
            onClick: j,
            disabled: !_,
            className: v(
              "shrink-0 rounded-xl p-2 transition-all",
              _
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            ),
            children: e.jsx(Ne, { className: "h-5 w-5" }),
          }),
        ],
      }),
    ],
  });
}
function Ge({ typingUsers: t }) {
  if (t.length === 0) return null;
  const s = t.map((a) => a.fullName.split(" ")[0]);
  let r;
  return (
    s.length === 1
      ? (r = `${s[0]} écrit`)
      : s.length === 2
        ? (r = `${s[0]} et ${s[1]} écrivent`)
        : (r = `${s[0]} et ${s.length - 1} autres écrivent`),
    e.jsxs("div", {
      className: "flex items-center gap-2 px-4 py-1.5",
      children: [
        e.jsxs("div", {
          className: "flex gap-0.5",
          children: [
            e.jsx("span", {
              className:
                "h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]",
            }),
            e.jsx("span", {
              className:
                "h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]",
            }),
            e.jsx("span", {
              className:
                "h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]",
            }),
          ],
        }),
        e.jsxs("span", {
          className: "text-xs text-muted-foreground",
          children: [r, "..."],
        }),
      ],
    })
  );
}
function Ve({ channelId: t, onClose: s, onSelectMessage: r }) {
  const [a, l] = u.useState(""),
    [n, i] = u.useState(""),
    m = u.useRef(null),
    c = u.useRef(void 0);
  u.useEffect(() => {
    m.current?.focus();
  }, []);
  const x = u.useCallback((g) => {
      (l(g),
        c.current && clearTimeout(c.current),
        (c.current = setTimeout(() => {
          i(g);
        }, 300)));
    }, []),
    { data: d, isLoading: o } = Pe(t, n),
    h = d?.pages.flatMap((g) => g.data) ?? [],
    j = u.useCallback(
      (g) => {
        (r?.(g.id), s());
      },
      [r, s],
    ),
    C = u.useCallback((g, _) => {
      if (!_.trim() || !g) return g;
      const f = new RegExp(
        `(${_.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi",
      );
      return g.split(f).map((w, M) =>
        f.test(w)
          ? e.jsx(
              "mark",
              {
                className: "bg-primary/20 text-primary rounded-sm px-0.5",
                children: w,
              },
              M,
            )
          : w,
      );
    }, []);
  return e.jsxs("div", {
    className: "flex flex-col border-b border-border bg-white",
    children: [
      e.jsxs("div", {
        className: "flex items-center gap-2 px-4 py-2",
        children: [
          e.jsx(K, { className: "h-4 w-4 shrink-0 text-muted-foreground" }),
          e.jsx("input", {
            ref: m,
            type: "text",
            value: a,
            onChange: (g) => x(g.target.value),
            placeholder: "Rechercher dans les messages...",
            className:
              "flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none",
          }),
          o &&
            e.jsx(Z, {
              className: "h-4 w-4 animate-spin text-muted-foreground",
            }),
          e.jsx("button", {
            onClick: s,
            className:
              "rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
            children: e.jsx(O, { className: "h-4 w-4" }),
          }),
        ],
      }),
      n.trim() &&
        e.jsxs("div", {
          className: "max-h-64 overflow-y-auto border-t border-border/50",
          children: [
            h.length === 0 && !o
              ? e.jsxs("p", {
                  className:
                    "px-4 py-3 text-center text-xs text-muted-foreground",
                  children: ["Aucun résultat pour « ", n, " »"],
                })
              : e.jsx("div", {
                  className: "divide-y divide-border/30",
                  children: h.map((g) =>
                    e.jsxs(
                      "button",
                      {
                        onClick: () => j(g),
                        className: v(
                          "flex w-full flex-col gap-0.5 px-4 py-2.5 text-left transition-colors",
                          "hover:bg-muted/50",
                        ),
                        children: [
                          e.jsxs("div", {
                            className:
                              "flex items-center justify-between gap-2",
                            children: [
                              e.jsx("span", {
                                className:
                                  "text-xs font-medium text-foreground",
                                children: g.sender?.full_name ?? "Inconnu",
                              }),
                              e.jsx("span", {
                                className:
                                  "shrink-0 text-[10px] text-muted-foreground",
                                children: U(
                                  new Date(g.created_at),
                                  "d MMM, HH:mm",
                                  { locale: z },
                                ),
                              }),
                            ],
                          }),
                          e.jsx("p", {
                            className:
                              "text-xs text-muted-foreground line-clamp-2",
                            children: C(g.content ?? "", n),
                          }),
                        ],
                      },
                      g.id,
                    ),
                  ),
                }),
            h.length > 0 &&
              e.jsxs("p", {
                className:
                  "px-4 py-1.5 text-center text-[10px] text-muted-foreground/60",
                children: [h.length, " résultat", h.length > 1 ? "s" : ""],
              }),
          ],
        }),
    ],
  });
}
function Je() {
  return e.jsxs("div", {
    className:
      "flex items-center gap-2 border-t border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground",
    children: [
      e.jsx(we, { className: "h-4 w-4 shrink-0" }),
      e.jsx("span", {
        children:
          "Ce canal est en lecture seule. Seuls les administrateurs peuvent envoyer des messages.",
      }),
    ],
  });
}
function Xe({ channel: t, onBack: s, onSettings: r, showBack: a = !1 }) {
  const l = F((p) => p.user?.id),
    { isAdmin: n } = J(),
    i = Re(t.id),
    m = Ae(),
    c = Te(),
    x = De(),
    d = Ie(),
    { typingUsers: o, sendTyping: h } = Fe(t.id),
    j = u.useRef(null),
    C = u.useRef(null),
    [g, _] = u.useState(!0),
    [f, S] = u.useState(!1),
    w = i.data?.pages.flatMap((p) => p.data) ?? [];
  (u.useEffect(() => {
    t.id && t.unread_count > 0 && d.mutate(t.id);
  }, [t.id]),
    u.useEffect(() => {
      g && j.current?.scrollIntoView({ behavior: "smooth" });
    }, [w.length, g]));
  const M = u.useCallback(() => {
      const p = C.current;
      if (!p) return;
      const { scrollTop: y, scrollHeight: E, clientHeight: B } = p,
        ae = E - y - B < 100;
      if ((_(ae), y < 50 && i.hasNextPage && !i.isFetchingNextPage)) {
        const ne = p.scrollHeight;
        i.fetchNextPage().then(() => {
          requestAnimationFrame(() => {
            const le = p.scrollHeight;
            p.scrollTop = le - ne;
          });
        });
      }
    }, [i]),
    T = t.write_mode === "all" || n,
    Q = (p, y, E) => {
      l &&
        (m.mutate({
          channelId: t.id,
          content: p,
          senderId: l,
          fileUrl: y,
          fileName: E,
          sentMessageIds: i.sentMessageIds,
        }),
        _(!0));
    },
    $ = (p) => {
      const y = window.prompt("Modifier le message :", p.content || "");
      y !== null &&
        y !== p.content &&
        c.mutate({ id: p.id, content: y, channelId: t.id });
    },
    b = (p) => {
      window.confirm("Supprimer ce message ?") &&
        x.mutate({ id: p.id, channelId: t.id });
    },
    L = (p, y) => {
      if (y === 0) return !0;
      const E = w[y - 1];
      return E.sender_id !== p.sender_id
        ? !0
        : new Date(p.created_at).getTime() - new Date(E.created_at).getTime() >
            300 * 1e3;
    };
  return e.jsxs("div", {
    className: "flex h-full flex-col",
    children: [
      e.jsx(Qe, {
        channel: t,
        onBack: s,
        onSettings: r,
        onSearch: () => S(!f),
        showBack: a,
      }),
      f && e.jsx(Ve, { channelId: t.id, onClose: () => S(!1) }),
      e.jsxs("div", {
        ref: C,
        onScroll: M,
        className: "flex-1 overflow-y-auto px-4 py-3",
        children: [
          i.isFetchingNextPage &&
            e.jsx("div", {
              className: "flex justify-center py-3",
              children: e.jsx(Z, {
                className: "h-5 w-5 animate-spin text-muted-foreground",
              }),
            }),
          i.isLoading
            ? e.jsx("div", {
                className: "space-y-4 py-4",
                children: Array.from({ length: 6 }).map((p, y) =>
                  e.jsxs(
                    "div",
                    {
                      className: `flex gap-2 ${y % 2 === 0 ? "" : "flex-row-reverse"}`,
                      children: [
                        e.jsx(k, {
                          className: "h-8 w-8 shrink-0 rounded-full",
                        }),
                        e.jsxs("div", {
                          className: "space-y-1",
                          children: [
                            e.jsx(k, { className: "h-4 w-24" }),
                            e.jsx(k, { className: "h-8 w-48 rounded-2xl" }),
                          ],
                        }),
                      ],
                    },
                    y,
                  ),
                ),
              })
            : w.length === 0
              ? e.jsx("div", {
                  className: "flex h-full items-center justify-center",
                  children: e.jsx("p", {
                    className: "text-sm text-muted-foreground",
                    children: "Aucun message. Commencez la conversation !",
                  }),
                })
              : e.jsxs("div", {
                  className: "space-y-1",
                  children: [
                    w.map((p, y) => {
                      const E =
                        y === 0 ||
                        !pe(
                          new Date(w[y - 1].created_at),
                          new Date(p.created_at),
                        );
                      return e.jsxs(
                        "div",
                        {
                          children: [
                            E &&
                              e.jsxs("div", {
                                className: "my-4 flex items-center gap-3",
                                children: [
                                  e.jsx("div", {
                                    className: "h-px flex-1 bg-border",
                                  }),
                                  e.jsx("span", {
                                    className:
                                      "shrink-0 text-xs font-medium text-muted-foreground",
                                    children: U(
                                      new Date(p.created_at),
                                      "EEEE d MMMM",
                                      { locale: z },
                                    ),
                                  }),
                                  e.jsx("div", {
                                    className: "h-px flex-1 bg-border",
                                  }),
                                ],
                              }),
                            e.jsx(Be, {
                              message: p,
                              isOwn: p.sender_id === l,
                              showSender: L(p, y),
                              onEdit: p.sender_id === l ? $ : void 0,
                              onDelete: p.sender_id === l || n ? b : void 0,
                            }),
                          ],
                        },
                        p.id,
                      );
                    }),
                    e.jsx("div", { ref: j }),
                  ],
                }),
        ],
      }),
      e.jsx(Ge, { typingUsers: o }),
      T
        ? e.jsx(We, { onSend: Q, disabled: m.isPending, onTyping: h })
        : e.jsx(Je, {}),
    ],
  });
}
function Ye({ profiles: t, selected: s, onChange: r, excludeIds: a = [] }) {
  const [l, n] = u.useState(""),
    i = u.useMemo(() => {
      const o = new Set(a);
      return t.filter((h) => !o.has(h.id));
    }, [t, a]),
    m = u.useMemo(() => {
      if (!l.trim()) return i;
      const o = l.toLowerCase();
      return i.filter(
        (h) =>
          h.full_name.toLowerCase().includes(o) ||
          h.email.toLowerCase().includes(o),
      );
    }, [i, l]),
    c = new Set(s),
    x = (o) => {
      c.has(o) ? r(s.filter((h) => h !== o)) : r([...s, o]);
    },
    d = t.filter((o) => c.has(o.id));
  return e.jsxs("div", {
    className: "space-y-3",
    children: [
      d.length > 0 &&
        e.jsx("div", {
          className: "flex flex-wrap gap-1.5",
          children: d.map((o) =>
            e.jsxs(
              "span",
              {
                className:
                  "inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary",
                children: [
                  o.full_name,
                  e.jsx("button", {
                    type: "button",
                    onClick: () => x(o.id),
                    className: "ml-0.5 rounded-full p-0.5 hover:bg-primary/20",
                    children: e.jsx(O, { className: "h-3 w-3" }),
                  }),
                ],
              },
              o.id,
            ),
          ),
        }),
      e.jsxs("div", {
        className: "relative",
        children: [
          e.jsx(K, {
            className:
              "absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
          }),
          e.jsx("input", {
            type: "text",
            value: l,
            onChange: (o) => n(o.target.value),
            placeholder: "Rechercher un membre...",
            className: v(
              "h-9 w-full rounded-xl border border-border bg-muted/30 pl-8 pr-3 text-sm",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring",
            ),
          }),
        ],
      }),
      e.jsx("div", {
        className: "max-h-48 overflow-y-auto rounded-xl border border-border",
        children:
          m.length === 0
            ? e.jsx("p", {
                className:
                  "px-3 py-4 text-center text-sm text-muted-foreground",
                children: "Aucun résultat",
              })
            : m.map((o) => {
                const h = c.has(o.id);
                return e.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => x(o.id),
                    className: v(
                      "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
                      "hover:bg-muted",
                      h && "bg-primary/5",
                    ),
                    children: [
                      e.jsx("div", {
                        className:
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700",
                        children: o.avatar_url
                          ? e.jsx("img", {
                              src: o.avatar_url,
                              alt: o.full_name,
                              className: "h-8 w-8 rounded-full object-cover",
                            })
                          : D(o.full_name),
                      }),
                      e.jsxs("div", {
                        className: "min-w-0 flex-1",
                        children: [
                          e.jsx("p", {
                            className: "truncate font-medium text-foreground",
                            children: o.full_name,
                          }),
                          e.jsx("p", {
                            className: "truncate text-xs text-muted-foreground",
                            children: o.email,
                          }),
                        ],
                      }),
                      h &&
                        e.jsx(_e, {
                          className: "h-4 w-4 shrink-0 text-primary",
                        }),
                    ],
                  },
                  o.id,
                );
              }),
      }),
    ],
  });
}
function Ze({ open: t, onClose: s }) {
  const r = F((d) => d.user?.id),
    a = de(),
    { data: l } = ee(),
    [n, i] = u.useState(""),
    [m, c] = u.useState([]),
    x = async (d) => {
      if ((d.preventDefault(), !n.trim() || !r)) return;
      const o = Array.from(new Set([r, ...m]));
      (await a.mutateAsync({
        name: n.trim(),
        type: "group",
        write_mode: "all",
        member_ids: o,
      }),
        i(""),
        c([]),
        s());
    };
  return e.jsx(te, {
    open: t,
    onClose: s,
    title: "Nouveau canal",
    size: "md",
    children: e.jsxs("form", {
      onSubmit: x,
      className: "space-y-4",
      children: [
        e.jsx(se, {
          label: "Nom du canal",
          value: n,
          onChange: (d) => i(d.target.value),
          placeholder: "ex: Groupe VIP",
          required: !0,
        }),
        e.jsxs("div", {
          className: "space-y-1.5",
          children: [
            e.jsx("label", {
              className: "text-sm font-medium text-foreground",
              children: "Membres",
            }),
            e.jsx(Ye, {
              profiles: l ?? [],
              selected: m,
              onChange: c,
              excludeIds: r ? [r] : [],
            }),
          ],
        }),
        e.jsxs("div", {
          className: "flex justify-end gap-3 pt-2",
          children: [
            e.jsx(q, {
              type: "button",
              variant: "secondary",
              onClick: s,
              children: "Annuler",
            }),
            e.jsx(q, {
              type: "submit",
              loading: a.isPending,
              disabled: !n.trim(),
              children: "Créer",
            }),
          ],
        }),
      ],
    }),
  });
}
const et = [
  { value: "all", label: "Tous les membres" },
  { value: "admin_only", label: "Admins uniquement" },
];
function tt({ open: t, onClose: s, channel: r, onDeleted: a }) {
  const l = ce(),
    n = ue(),
    i = me(),
    m = fe(),
    { data: c } = ee(),
    [x, d] = u.useState(""),
    [o, h] = u.useState("all"),
    [j, C] = u.useState([]),
    [g, _] = u.useState(!1),
    f = u.useCallback(async () => {
      if (!r) return;
      _(!0);
      const { data: b } = await N.from("channel_members")
        .select(
          "user_id, user:profiles!user_id(id, full_name, avatar_url, email)",
        )
        .eq("channel_id", r.id);
      (C(
        (b ?? []).map((L) => ({
          user_id: L.user_id,
          profile: L.user ?? void 0,
        })),
      ),
        _(!1));
    }, [r]);
  u.useEffect(() => {
    t && r && (d(r.name), h(r.write_mode), f());
  }, [t, r, f]);
  const S = async () => {
      r &&
        (await l.mutateAsync({ id: r.id, name: x.trim(), write_mode: o }), s());
    },
    w = async () => {
      r &&
        window.confirm("Supprimer ce canal ? Cette action est irréversible.") &&
        (await n.mutateAsync(r.id), a?.(), s());
    },
    M = async (b) => {
      r && (await i.mutateAsync({ channelId: r.id, userId: b }), await f());
    },
    T = async (b) => {
      if (r) {
        if (j.length <= 1) {
          A.error("Le canal doit avoir au moins un membre");
          return;
        }
        (await m.mutateAsync({ channelId: r.id, userId: b }), await f());
      }
    },
    Q = j.map((b) => b.user_id),
    $ = (c ?? []).filter((b) => !Q.includes(b.id));
  return r
    ? e.jsx(te, {
        open: t,
        onClose: s,
        title: "Paramètres du canal",
        size: "lg",
        children: e.jsxs("div", {
          className: "space-y-5",
          children: [
            e.jsxs("div", {
              className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
              children: [
                e.jsx(se, {
                  label: "Nom du canal",
                  value: x,
                  onChange: (b) => d(b.target.value),
                }),
                e.jsx(Se, {
                  label: "Qui peut écrire",
                  options: et,
                  value: o,
                  onChange: h,
                }),
              ],
            }),
            e.jsxs("div", {
              children: [
                e.jsxs("label", {
                  className: "text-sm font-medium text-foreground",
                  children: ["Membres (", j.length, ")"],
                }),
                e.jsx("div", {
                  className:
                    "mt-2 max-h-48 overflow-y-auto rounded-xl border border-border",
                  children: g
                    ? e.jsx("p", {
                        className:
                          "px-3 py-4 text-center text-sm text-muted-foreground",
                        children: "Chargement...",
                      })
                    : j.map((b) =>
                        e.jsxs(
                          "div",
                          {
                            className:
                              "flex items-center gap-3 border-b border-border px-3 py-2 last:border-0",
                            children: [
                              e.jsx("div", {
                                className:
                                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700",
                                children: b.profile?.avatar_url
                                  ? e.jsx("img", {
                                      src: b.profile.avatar_url,
                                      alt: "",
                                      className:
                                        "h-7 w-7 rounded-full object-cover",
                                    })
                                  : D(b.profile?.full_name ?? "?"),
                              }),
                              e.jsxs("div", {
                                className: "min-w-0 flex-1",
                                children: [
                                  e.jsx("p", {
                                    className:
                                      "truncate text-sm font-medium text-foreground",
                                    children: b.profile?.full_name,
                                  }),
                                  e.jsx("p", {
                                    className:
                                      "truncate text-xs text-muted-foreground",
                                    children: b.profile?.email,
                                  }),
                                ],
                              }),
                              e.jsx("button", {
                                type: "button",
                                onClick: () => T(b.user_id),
                                className:
                                  "shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive",
                                children: e.jsx(H, {
                                  className: "h-3.5 w-3.5",
                                }),
                              }),
                            ],
                          },
                          b.user_id,
                        ),
                      ),
                }),
              ],
            }),
            $.length > 0 &&
              e.jsxs("div", {
                children: [
                  e.jsx("label", {
                    className: "text-sm font-medium text-foreground",
                    children: "Ajouter un membre",
                  }),
                  e.jsx("div", {
                    className:
                      "mt-2 max-h-36 overflow-y-auto rounded-xl border border-border",
                    children: $.map((b) =>
                      e.jsxs(
                        "button",
                        {
                          type: "button",
                          onClick: () => M(b.id),
                          className:
                            "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                          children: [
                            e.jsx("div", {
                              className:
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700",
                              children: b.avatar_url
                                ? e.jsx("img", {
                                    src: b.avatar_url,
                                    alt: "",
                                    className:
                                      "h-7 w-7 rounded-full object-cover",
                                  })
                                : D(b.full_name),
                            }),
                            e.jsx("span", {
                              className: "truncate",
                              children: b.full_name,
                            }),
                          ],
                        },
                        b.id,
                      ),
                    ),
                  }),
                ],
              }),
            e.jsxs("div", {
              className:
                "flex items-center justify-between border-t border-border pt-4",
              children: [
                e.jsx(q, {
                  variant: "destructive",
                  size: "sm",
                  onClick: w,
                  loading: n.isPending,
                  icon: e.jsx(H, { className: "h-4 w-4" }),
                  children: "Supprimer le canal",
                }),
                e.jsxs("div", {
                  className: "flex gap-3",
                  children: [
                    e.jsx(q, {
                      variant: "secondary",
                      onClick: s,
                      children: "Annuler",
                    }),
                    e.jsx(q, {
                      onClick: S,
                      loading: l.isPending,
                      disabled: !x.trim(),
                      children: "Enregistrer",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      })
    : null;
}
function ht() {
  ke("Messagerie");
  const { data: t, isLoading: s } = xe(),
    {
      activeChannelId: r,
      setActiveChannel: a,
      mobileShowChat: l,
      setMobileShowChat: n,
    } = Ee(),
    [i, m] = u.useState(!1),
    [c, x] = u.useState(!1),
    d = t?.find((o) => o.id === r) ?? null;
  return (
    u.useEffect(() => {
      !r && t && t.length > 0 && a(t[0].id);
    }, [t, r, a]),
    u.useEffect(() => {
      r && t && !t.find((o) => o.id === r) && a(null);
    }, [t, r, a]),
    s
      ? e.jsxs("div", {
          className:
            "flex h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-xl border border-border bg-white",
          children: [
            e.jsxs("div", {
              className: "w-80 border-r border-border p-4 space-y-3",
              children: [
                e.jsx(k, { className: "h-8 w-32" }),
                e.jsx(k, { className: "h-9 w-full rounded-xl" }),
                Array.from({ length: 5 }).map((o, h) =>
                  e.jsxs(
                    "div",
                    {
                      className: "flex items-center gap-3",
                      children: [
                        e.jsx(k, { className: "h-10 w-10 rounded-full" }),
                        e.jsxs("div", {
                          className: "flex-1 space-y-1.5",
                          children: [
                            e.jsx(k, { className: "h-4 w-24" }),
                            e.jsx(k, { className: "h-3 w-36" }),
                          ],
                        }),
                      ],
                    },
                    h,
                  ),
                ),
              ],
            }),
            e.jsx("div", {
              className: "flex-1 p-6",
              children: e.jsx(k, { className: "h-full w-full rounded-xl" }),
            }),
          ],
        })
      : e.jsxs(e.Fragment, {
          children: [
            e.jsxs("div", {
              className:
                "flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-border bg-white",
              children: [
                e.jsx("div", {
                  className: v(
                    "w-full shrink-0 border-r border-border md:w-80",
                    l ? "hidden md:block" : "block",
                  ),
                  children: e.jsx(qe, {
                    channels: t ?? [],
                    activeChannelId: r,
                    onSelect: (o) => {
                      (a(o), n(!0));
                    },
                    onCreateChannel: () => m(!0),
                  }),
                }),
                e.jsx("div", {
                  className: v("min-w-0 flex-1", l ? "flex" : "hidden md:flex"),
                  children: d
                    ? e.jsx(Xe, {
                        channel: d,
                        onBack: () => n(!1),
                        onSettings: () => x(!0),
                        showBack: l,
                      })
                    : e.jsx("div", {
                        className: "flex flex-1 items-center justify-center",
                        children: e.jsx(Me, {
                          icon: e.jsx(Ce, { className: "h-6 w-6" }),
                          title: "Sélectionnez une conversation",
                          description:
                            "Choisissez un canal ou un message direct pour commencer.",
                        }),
                      }),
                }),
              ],
            }),
            e.jsx(Ze, { open: i, onClose: () => m(!1) }),
            e.jsx(tt, {
              open: c,
              onClose: () => x(!1),
              channel: d,
              onDeleted: () => a(null),
            }),
          ],
        })
  );
}
export { ht as default };
