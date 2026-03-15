import { u as z, a as N, b, j as e } from "./vendor-query-sBpsl8Kt.js";
import { r as c } from "./vendor-react-Cci7g3Cb.js";
import {
  t as d,
  z as q,
  Q as E,
  a1 as R,
  ad as F,
  h as v,
  aW as L,
} from "./vendor-ui-DDdrexJZ.js";
import { s as n, i as k, c as i, S as u } from "./index-DY9GA2La.js";
import { B as y } from "./button-DlbP8VPc.js";
import { T } from "./textarea-D7qrlVHg.js";
import { E as A } from "./empty-state-BFSeK4Tv.js";
import { u as B } from "./usePageTitle-I7G4QvKX.js";
import "./vendor-utils-DoLlG-6J.js";
import "./vendor-supabase-BZ0N5lZN.js";
function O() {
  return z({
    queryKey: ["ai-conversations"],
    queryFn: async () => {
      const {
        data: { user: t },
      } = await n.auth.getUser();
      if (!t) throw new Error("Non authentifié");
      const { data: s, error: a } = await n
        .from("ai_conversations")
        .select("*")
        .eq("user_id", t.id)
        .order("updated_at", { ascending: !1 });
      if (a) throw a;
      return s;
    },
  });
}
function $(t) {
  return z({
    queryKey: ["ai-messages", t],
    queryFn: async () => {
      if (!t) throw new Error("ID de conversation requis");
      const { data: s, error: a } = await n
        .from("ai_messages")
        .select("*")
        .eq("conversation_id", t)
        .order("created_at", { ascending: !0 });
      if (a) throw a;
      return s;
    },
    enabled: !!t,
  });
}
function U() {
  const t = N();
  return b({
    mutationFn: async (s) => {
      const {
        data: { user: a },
      } = await n.auth.getUser();
      if (!a) throw new Error("Non authentifié");
      const { data: o, error: l } = await n
        .from("ai_conversations")
        .insert({ user_id: a.id, title: s || "Nouvelle conversation" })
        .select()
        .single();
      if (l) throw l;
      return o;
    },
    onSuccess: () => {
      t.invalidateQueries({ queryKey: ["ai-conversations"] });
    },
    onError: (s) => {
      d.error(`Erreur: ${s.message}`);
    },
  });
}
function V() {
  const t = N();
  return b({
    mutationFn: async ({ conversationId: s, content: a }) => {
      const { data: o, error: l } = await n
        .from("ai_messages")
        .insert({ conversation_id: s, role: "user", content: a })
        .select()
        .single();
      if (l) throw l;
      const { data: m } = await n
        .from("ai_messages")
        .select("id")
        .eq("conversation_id", s)
        .eq("role", "user");
      if (m && m.length === 1) {
        const h = a.length > 50 ? a.slice(0, 50) + "..." : a;
        await n
          .from("ai_conversations")
          .update({ title: h, updated_at: new Date().toISOString() })
          .eq("id", s);
      } else
        await n
          .from("ai_conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", s);
      const { data: f, error: x } = await n
        .from("ai_messages")
        .insert({
          conversation_id: s,
          role: "assistant",
          content:
            "Je suis l'assistant Off-Market. Cette fonctionnalité sera bientôt connectée à l'IA.",
        })
        .select()
        .single();
      if (x) throw x;
      return { userMessage: o, assistantMessage: f };
    },
    onSuccess: (s, a) => {
      (t.invalidateQueries({ queryKey: ["ai-messages", a.conversationId] }),
        t.invalidateQueries({ queryKey: ["ai-conversations"] }));
    },
    onError: (s) => {
      d.error(`Erreur: ${s.message}`);
    },
  });
}
function G() {
  const t = N();
  return b({
    mutationFn: async (s) => {
      const { error: a } = await n
        .from("ai_messages")
        .delete()
        .eq("conversation_id", s);
      if (a) throw a;
      const { error: o } = await n
        .from("ai_conversations")
        .delete()
        .eq("id", s);
      if (o) throw o;
    },
    onSuccess: () => {
      (t.invalidateQueries({ queryKey: ["ai-conversations"] }),
        d.success("Conversation supprimée"));
    },
    onError: (s) => {
      d.error(`Erreur: ${s.message}`);
    },
  });
}
function H() {
  return e.jsx("div", {
    className: "flex flex-col gap-4 p-6",
    children: Array.from({ length: 4 }).map((t, s) =>
      e.jsxs(
        "div",
        {
          className: i(
            "flex gap-3",
            s % 2 === 0 ? "justify-end" : "justify-start",
          ),
          children: [
            s % 2 !== 0 &&
              e.jsx(u, { className: "h-8 w-8 rounded-full shrink-0" }),
            e.jsxs("div", {
              className: i(
                "flex flex-col gap-1.5",
                s % 2 === 0 ? "items-end" : "items-start",
              ),
              children: [
                e.jsx(u, { className: "h-4 w-20" }),
                e.jsx(u, {
                  className: i(
                    "h-16 rounded-2xl",
                    s % 2 === 0 ? "w-64" : "w-72",
                  ),
                }),
              ],
            }),
          ],
        },
        s,
      ),
    ),
  });
}
function J() {
  return e.jsx("div", {
    className: "flex flex-col gap-1 p-2",
    children: Array.from({ length: 5 }).map((t, s) =>
      e.jsxs(
        "div",
        {
          className: "flex items-center gap-3 px-3 py-3",
          children: [
            e.jsx(u, { className: "h-4 w-4 rounded shrink-0" }),
            e.jsxs("div", {
              className: "flex flex-col gap-1.5 flex-1",
              children: [
                e.jsx(u, { className: "h-4 w-3/4" }),
                e.jsx(u, { className: "h-3 w-1/2" }),
              ],
            }),
          ],
        },
        s,
      ),
    ),
  });
}
function oe() {
  B("Assistant IA");
  const [t, s] = c.useState(null),
    [a, o] = c.useState(""),
    [l, m] = c.useState(!0),
    f = c.useRef(null),
    x = c.useRef(null),
    { data: h, isLoading: M } = O(),
    { data: w, isLoading: I } = $(t),
    j = U(),
    p = V(),
    P = G(),
    C = c.useCallback(() => {
      f.current?.scrollIntoView({ behavior: "smooth" });
    }, []);
  c.useEffect(() => {
    C();
  }, [w, C]);
  const _ = async () => {
      try {
        const r = await j.mutateAsync(void 0);
        (s(r.id), m(!1), x.current?.focus());
      } catch {
        d.error("Impossible de créer la conversation.");
      }
    },
    D = (r) => {
      (s(r.id), m(!1));
    },
    K = async (r, g) => {
      r.stopPropagation();
      try {
        (await P.mutateAsync(g), t === g && s(null));
      } catch {
        d.error("Impossible de supprimer la conversation.");
      }
    },
    S = async () => {
      const r = a.trim();
      if (!(!r || !t || p.isPending)) {
        o("");
        try {
          await p.mutateAsync({ conversationId: t, content: r });
        } catch {
          (d.error("Erreur lors de l'envoi du message."), o(r));
        }
      }
    },
    Q = (r) => {
      r.key === "Enter" && !r.shiftKey && (r.preventDefault(), S());
    };
  return e.jsxs("div", {
    className:
      "flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl border border-border/50 bg-white shadow-sm",
    children: [
      e.jsxs("div", {
        className: i(
          "flex flex-col border-r border-border/50 bg-muted/20",
          "w-full md:w-80 md:min-w-[320px] shrink-0",
          l ? "flex" : "hidden md:flex",
        ),
        children: [
          e.jsxs("div", {
            className:
              "flex items-center justify-between p-4 border-b border-border/50",
            children: [
              e.jsx("h2", {
                className: "text-base font-semibold text-foreground",
                children: "Conversations",
              }),
              e.jsx(y, {
                size: "sm",
                variant: "primary",
                icon: e.jsx(q, { className: "h-4 w-4" }),
                onClick: _,
                loading: j.isPending,
                children: "Nouvelle",
              }),
            ],
          }),
          e.jsx("div", {
            className: "flex-1 overflow-y-auto",
            children: M
              ? e.jsx(J, {})
              : h?.length
                ? e.jsx("div", {
                    className: "flex flex-col gap-0.5 p-2",
                    children: h.map((r) =>
                      e.jsxs(
                        "button",
                        {
                          onClick: () => D(r),
                          className: i(
                            "group flex items-center gap-3 rounded-lg px-3 py-3 text-left",
                            "transition-all duration-150 cursor-pointer",
                            "hover:bg-muted/60",
                            t === r.id
                              ? "bg-primary/5 border border-primary/20 text-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          ),
                          children: [
                            e.jsx(E, { className: "h-4 w-4 shrink-0" }),
                            e.jsxs("div", {
                              className: "flex-1 min-w-0",
                              children: [
                                e.jsx("p", {
                                  className: "text-sm font-medium truncate",
                                  children: r.title || "Nouvelle conversation",
                                }),
                                e.jsx("p", {
                                  className:
                                    "text-xs text-muted-foreground mt-0.5",
                                  children: k(r.updated_at),
                                }),
                              ],
                            }),
                            e.jsx("button", {
                              onClick: (g) => K(g, r.id),
                              className: i(
                                "shrink-0 rounded-md p-1.5",
                                "text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10",
                                "opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer",
                              ),
                              children: e.jsx(R, { className: "h-3.5 w-3.5" }),
                            }),
                          ],
                        },
                        r.id,
                      ),
                    ),
                  })
                : e.jsx(A, {
                    icon: e.jsx(E, { className: "h-6 w-6" }),
                    title: "Aucune conversation",
                    description:
                      "Commencez une nouvelle conversation avec l'assistant IA.",
                    className: "py-12",
                  }),
          }),
        ],
      }),
      e.jsx("div", {
        className: i(
          "flex flex-col flex-1 min-w-0",
          l ? "hidden md:flex" : "flex",
        ),
        children: t
          ? e.jsxs(e.Fragment, {
              children: [
                e.jsxs("div", {
                  className:
                    "flex items-center gap-3 px-4 py-3 border-b border-border/50 md:hidden",
                  children: [
                    e.jsx("button", {
                      onClick: () => m(!0),
                      className:
                        "rounded-lg p-1.5 hover:bg-muted/60 transition-colors cursor-pointer",
                      children: e.jsx(F, {
                        className: "h-5 w-5 text-muted-foreground",
                      }),
                    }),
                    e.jsxs("div", {
                      className: "flex items-center gap-2",
                      children: [
                        e.jsx(v, { className: "h-5 w-5 text-primary" }),
                        e.jsx("span", {
                          className: "text-sm font-medium",
                          children: "Assistant IA",
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsx("div", {
                  className: "flex-1 overflow-y-auto",
                  children: I
                    ? e.jsx(H, {})
                    : w?.length
                      ? e.jsxs("div", {
                          className: "flex flex-col gap-4 p-4 md:p-6",
                          children: [
                            w.map((r) =>
                              e.jsxs(
                                "div",
                                {
                                  className: i(
                                    "flex gap-3 max-w-[85%] md:max-w-[75%]",
                                    r.role === "user" ? "ml-auto" : "mr-auto",
                                  ),
                                  children: [
                                    r.role === "assistant" &&
                                      e.jsx("div", {
                                        className:
                                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20",
                                        children: e.jsx(v, {
                                          className: "h-4 w-4 text-primary",
                                        }),
                                      }),
                                    e.jsxs("div", {
                                      className: i(
                                        "flex flex-col gap-1",
                                        r.role === "user"
                                          ? "items-end"
                                          : "items-start",
                                      ),
                                      children: [
                                        e.jsx("div", {
                                          className: i(
                                            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                                            r.role === "user"
                                              ? "bg-primary text-primary-foreground rounded-br-md"
                                              : "bg-muted/60 text-foreground border border-border/50 rounded-bl-md",
                                          ),
                                          children: e.jsx("p", {
                                            className: "whitespace-pre-wrap",
                                            children: r.content,
                                          }),
                                        }),
                                        e.jsx("span", {
                                          className:
                                            "text-[11px] text-muted-foreground/60 px-1",
                                          children: k(r.created_at),
                                        }),
                                      ],
                                    }),
                                  ],
                                },
                                r.id,
                              ),
                            ),
                            e.jsx("div", { ref: f }),
                          ],
                        })
                      : e.jsxs("div", {
                          className:
                            "flex flex-col items-center justify-center h-full gap-4 p-6",
                          children: [
                            e.jsx("div", {
                              className:
                                "flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20",
                              children: e.jsx(v, {
                                className: "h-8 w-8 text-primary",
                              }),
                            }),
                            e.jsxs("div", {
                              className: "text-center",
                              children: [
                                e.jsx("h3", {
                                  className:
                                    "text-base font-semibold text-foreground",
                                  children: "Comment puis-je vous aider ?",
                                }),
                                e.jsx("p", {
                                  className:
                                    "mt-1.5 text-sm text-muted-foreground max-w-sm",
                                  children:
                                    "Posez-moi vos questions sur vos clients, vos leads, vos performances ou toute autre information de votre CRM.",
                                }),
                              ],
                            }),
                          ],
                        }),
                }),
                e.jsxs("div", {
                  className: "border-t border-border/50 bg-white p-4",
                  children: [
                    e.jsxs("div", {
                      className: "flex items-end gap-3",
                      children: [
                        e.jsx(T, {
                          ref: x,
                          value: a,
                          onChange: (r) => o(r.target.value),
                          onKeyDown: Q,
                          placeholder: "Écrivez votre message...",
                          autoGrow: !0,
                          className:
                            "min-h-[44px] max-h-[160px] resize-none rounded-xl border-border/60 bg-muted/20 focus:bg-white",
                        }),
                        e.jsx(y, {
                          size: "lg",
                          variant: "primary",
                          onClick: S,
                          disabled: !a.trim() || p.isPending,
                          loading: p.isPending,
                          icon: e.jsx(L, { className: "h-4 w-4" }),
                          className: "shrink-0 rounded-xl",
                        }),
                      ],
                    }),
                    e.jsx("p", {
                      className:
                        "text-[11px] text-muted-foreground/50 mt-2 text-center",
                      children:
                        "L'assistant IA peut faire des erreurs. Vérifiez les informations importantes.",
                    }),
                  ],
                }),
              ],
            })
          : e.jsx(A, {
              icon: e.jsx(v, { className: "h-6 w-6" }),
              title: "Sélectionnez une conversation",
              description:
                "Choisissez une conversation existante ou créez-en une nouvelle pour commencer.",
              action: e.jsx(y, {
                variant: "primary",
                icon: e.jsx(q, { className: "h-4 w-4" }),
                onClick: _,
                loading: j.isPending,
                children: "Nouvelle conversation",
              }),
              className: "h-full",
            }),
      }),
    ],
  });
}
export { oe as default };
