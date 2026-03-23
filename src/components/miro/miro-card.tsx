"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Trash2, Link } from "lucide-react";
import type { MiroCard as MiroCardType } from "@/hooks/use-miro";

type CardStyle = "default" | "accent-border" | "dark" | "accent-bg";
type CardWidth = "default" | "wide" | "narrow";

interface MiroCardProps {
  card: MiroCardType;
  selected: boolean;
  zoom: number;
  badgeNumber: number;
  connectMode: boolean;
  onSelect: () => void;
  onStartDrag: (e: React.MouseEvent) => void;
  onUpdate: (updates: {
    title?: string | null;
    content?: string | null;
    card_type?: string;
    width?: number;
    style?: Record<string, unknown>;
  }) => void;
  onDelete: () => void;
  onConnectStart?: (cardId: string) => void;
}

const CARD_STYLES: {
  value: CardStyle;
  label: string;
  preview: React.CSSProperties;
}[] = [
  {
    value: "default",
    label: "Blanc",
    preview: { background: "#FFFFFF", border: "1px solid rgba(26,23,20,0.08)" },
  },
  {
    value: "accent-border",
    label: "Bordure",
    preview: {
      background: "#FFFFFF",
      border: "1px solid rgba(26,23,20,0.08)",
      borderLeft: "3px solid #AF0000",
    },
  },
  {
    value: "dark",
    label: "Sombre",
    preview: { background: "#1A1714", border: "1px solid rgba(175,0,0,0.3)" },
  },
  {
    value: "accent-bg",
    label: "Accent",
    preview: {
      background: "linear-gradient(135deg, #FFFFFF, rgba(175,0,0,0.02))",
      border: "1px solid rgba(175,0,0,0.15)",
    },
  },
];

const CARD_WIDTHS: { value: CardWidth; label: string; width: number }[] = [
  { value: "narrow", label: "Etroit (340px)", width: 340 },
  { value: "default", label: "Normal (420px)", width: 420 },
  { value: "wide", label: "Large (520px)", width: 520 },
];

// Style constants
const COLORS = {
  accent: "#AF0000",
  accentLight: "#D42B2B",
  text: "#1A1714",
  textSecondary: "#6B6560",
  textMuted: "#9B9590",
  border: "rgba(26, 23, 20, 0.08)",
  borderStrong: "rgba(26, 23, 20, 0.15)",
  bgCard: "#FFFFFF",
  bgWarm: "#F0EDE6",
  shadowSm: "0 2px 8px rgba(26, 23, 20, 0.06)",
  shadowMd: "0 6px 24px rgba(26, 23, 20, 0.08)",
  shadowLg: "0 16px 48px rgba(26, 23, 20, 0.12)",
  mono: "'JetBrains Mono', monospace",
  sans: "'Montserrat', system-ui, sans-serif",
};

function getCardStyles(
  cardType: CardStyle,
  selected: boolean,
  hovered: boolean,
): React.CSSProperties {
  let borderColor = COLORS.border;
  let borderLeftWidth = 1;
  let borderLeftColor = COLORS.border;

  if (hovered && !selected) {
    borderColor = COLORS.borderStrong;
  }
  if (selected) {
    borderColor = "rgba(175, 0, 0, 0.25)";
  }

  switch (cardType) {
    case "accent-border":
      borderLeftWidth = 4;
      borderLeftColor = COLORS.accent;
      break;
    case "dark":
      borderColor = "rgba(175, 0, 0, 0.3)";
      break;
    case "accent-bg":
      borderColor = "rgba(175, 0, 0, 0.15)";
      break;
  }

  const base: React.CSSProperties = {
    position: "absolute",
    background:
      cardType === "dark"
        ? "linear-gradient(135deg, #1A1714, #2A2520)"
        : cardType === "accent-bg"
          ? `linear-gradient(135deg, ${COLORS.bgCard}, rgba(175, 0, 0, 0.02))`
          : COLORS.bgCard,
    color: cardType === "dark" ? "#FFFFFF" : undefined,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth,
    borderTopStyle: "solid" as const,
    borderRightStyle: "solid" as const,
    borderBottomStyle: "solid" as const,
    borderLeftStyle: "solid" as const,
    borderTopColor: borderColor,
    borderRightColor: borderColor,
    borderBottomColor: borderColor,
    borderLeftColor,
    borderRadius: 16,
    padding: 32,
    boxShadow: selected
      ? COLORS.shadowLg
      : hovered
        ? COLORS.shadowMd
        : COLORS.shadowSm,
    cursor: "default",
    userSelect: "none",
    zIndex: selected ? 20 : hovered ? 10 : 2,
    willChange: "transform",
    transition: "box-shadow 0.3s ease, border-color 0.3s ease",
    fontFamily: COLORS.sans,
  };

  return base;
}

export function MiroCardComponent({
  card,
  selected,
  zoom,
  badgeNumber,
  connectMode,
  onSelect,
  onStartDrag,
  onUpdate,
  onDelete,
  onConnectStart,
}: MiroCardProps) {
  const [editing, setEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [title, setTitle] = useState(card.title ?? "");
  const [content, setContent] = useState(card.content ?? "");
  const [labelValue, setLabelValue] = useState(
    card.style && typeof card.style === "object" && "label" in card.style
      ? String(card.style.label ?? "")
      : "",
  );
  const [resizing, setResizing] = useState(false);
  const resizeStart = useRef<{ x: number; width: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Sync with card prop
  useEffect(() => {
    if (!editing) {
      setTitle(card.title ?? "");
      setContent(card.content ?? "");
      setLabelValue(
        card.style && typeof card.style === "object" && "label" in card.style
          ? String(card.style.label ?? "")
          : "",
      );
    }
  }, [card.title, card.content, editing]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (connectMode) return;
      setEditing(true);
    },
    [connectMode],
  );

  const handleBlur = useCallback(() => {
    // Delay to check if focus moved to another field within the card
    setTimeout(() => {
      const active = document.activeElement;
      if (
        active === labelRef.current ||
        active === titleRef.current ||
        active === contentRef.current
      ) {
        return;
      }
      setEditing(false);
      const currentLabel =
        card.style && typeof card.style === "object" && "label" in card.style
          ? String(card.style.label ?? "")
          : "";
      const updates: Record<string, unknown> = {};
      if (title !== (card.title ?? "") || content !== (card.content ?? "")) {
        updates.title = title || null;
        updates.content = content || null;
      }
      if (labelValue !== currentLabel) {
        updates.style = {
          ...(typeof card.style === "object" ? card.style : {}),
          label: labelValue || null,
        };
      }
      if (Object.keys(updates).length > 0) {
        onUpdate(
          updates as {
            title?: string | null;
            content?: string | null;
            style?: Record<string, unknown>;
          },
        );
      }
    }, 50);
  }, [
    title,
    content,
    labelValue,
    card.title,
    card.content,
    card.style,
    onUpdate,
  ]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const cardEl = document.getElementById(`miro-card-${card.id}`);
      if (cardEl) {
        const cardRect = cardEl.getBoundingClientRect();
        setMenuPos({
          x: (e.clientX - cardRect.left) / zoom,
          y: (e.clientY - cardRect.top) / zoom,
        });
      }
      setShowMenu((prev) => !prev);
    },
    [card.id, zoom],
  );

  // Close menu on click outside
  useEffect(() => {
    if (!showMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

  // Resize handler
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      resizeStart.current = { x: e.clientX, width: card.width };
      setResizing(true);

      const handleResizeMove = (ev: MouseEvent) => {
        if (!resizeStart.current) return;
        const delta = (ev.clientX - resizeStart.current.x) / zoom;
        const newWidth = Math.max(
          200,
          Math.min(800, resizeStart.current.width + delta),
        );
        const el = document.getElementById(`miro-card-${card.id}`);
        if (el) el.style.width = `${Math.round(newWidth)}px`;
      };

      const handleResizeEnd = (ev: MouseEvent) => {
        if (resizeStart.current) {
          const delta = (ev.clientX - resizeStart.current.x) / zoom;
          const newWidth = Math.max(
            200,
            Math.min(800, resizeStart.current.width + delta),
          );
          onUpdate({ width: Math.round(newWidth) });
        }
        resizeStart.current = null;
        setResizing(false);
        document.removeEventListener("mousemove", handleResizeMove);
        document.removeEventListener("mouseup", handleResizeEnd);
      };

      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
    },
    [card.width, card.id, zoom, onUpdate],
  );

  const cardType = (card.card_type ?? "default") as CardStyle;
  const isDark = cardType === "dark";
  const label =
    card.style &&
    typeof card.style === "object" &&
    "label" in card.style &&
    card.style.label
      ? String(card.style.label)
      : null;

  const cardStyles = getCardStyles(cardType, selected, hovered);

  // Determine current width category for menu highlight
  const currentWidthCategory: CardWidth =
    card.width >= 500 ? "wide" : card.width <= 360 ? "narrow" : "default";

  return (
    <div
      id={`miro-card-${card.id}`}
      style={{
        ...cardStyles,
        left: card.x,
        top: card.y,
        width: card.width,
        ...(resizing ? { transition: "none" } : {}),
        ...(connectMode ? { cursor: "crosshair" } : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={(e) => {
        if (connectMode && e.button === 0) {
          e.stopPropagation();
          onConnectStart?.(card.id);
          return;
        }
        if (e.button === 0 && !editing) {
          e.stopPropagation();
          onSelect();
          onStartDrag(e);
        }
      }}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {/* Badge numéro */}
      <div
        style={{
          position: "absolute",
          top: -10,
          left: -10,
          width: 24,
          height: 24,
          background: COLORS.accent,
          color: "#fff",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: COLORS.mono,
          fontSize: "0.6rem",
          fontWeight: 600,
          boxShadow: "0 2px 8px rgba(175,0,0,0.25)",
          zIndex: 30,
        }}
      >
        {badgeNumber}
      </div>

      {/* Label mono rouge — éditable */}
      {editing ? (
        <div
          style={{
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 16,
              height: 2,
              background: isDark ? "rgba(255,255,255,0.3)" : COLORS.accent,
              flexShrink: 0,
            }}
          />
          <input
            ref={labelRef}
            value={labelValue}
            onChange={(e) => setLabelValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                titleRef.current?.focus();
              }
            }}
            placeholder="LABEL..."
            style={{
              fontFamily: COLORS.mono,
              fontSize: "0.62rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: isDark ? "rgba(255,255,255,0.5)" : COLORS.accent,
              background: "transparent",
              border: "none",
              outline: "none",
              padding: 0,
              width: "100%",
            }}
          />
        </div>
      ) : label ? (
        <div
          style={{
            fontFamily: COLORS.mono,
            fontSize: "0.62rem",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: isDark ? "rgba(255,255,255,0.5)" : COLORS.accent,
            marginBottom: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 16,
              height: 2,
              background: isDark ? "rgba(255,255,255,0.3)" : COLORS.accent,
            }}
          />
          {label}
        </div>
      ) : null}

      {/* Titre */}
      {editing ? (
        <textarea
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              contentRef.current?.focus();
            }
            if (e.key === "Escape") {
              setTitle(card.title ?? "");
              setContent(card.content ?? "");
              setEditing(false);
            }
          }}
          autoFocus
          rows={1}
          style={{
            width: "100%",
            fontFamily: COLORS.sans,
            fontSize: "1.3rem",
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            color: isDark ? "#FFFFFF" : COLORS.text,
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            padding: 0,
            marginBottom: 8,
            overflow: "hidden",
          }}
          placeholder="Titre..."
        />
      ) : card.title ? (
        <h1
          style={{
            fontFamily: COLORS.sans,
            fontWeight: 700,
            fontSize: "1.3rem",
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            color: isDark ? "#FFFFFF" : COLORS.text,
            marginBottom: 8,
          }}
        >
          {card.title}
        </h1>
      ) : null}

      {/* Divider line */}
      {card.title && !editing && (
        <div
          style={{
            width: 32,
            height: 2,
            background: isDark ? "rgba(255,255,255,0.3)" : COLORS.accent,
            margin: "12px 0",
          }}
        />
      )}

      {/* Contenu */}
      {editing ? (
        <textarea
          ref={contentRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setContent(card.content ?? "");
              setTitle(card.title ?? "");
              setEditing(false);
            }
          }}
          rows={4}
          style={{
            width: "100%",
            fontFamily: COLORS.sans,
            fontSize: "0.82rem",
            lineHeight: 1.6,
            fontWeight: 400,
            color: isDark ? "rgba(255,255,255,0.7)" : COLORS.textSecondary,
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            padding: 0,
            minHeight: 60,
          }}
          placeholder="Contenu..."
        />
      ) : card.content ? (
        <p
          style={{
            fontFamily: COLORS.sans,
            fontSize: "0.82rem",
            lineHeight: 1.6,
            color: isDark ? "rgba(255,255,255,0.7)" : COLORS.textSecondary,
            fontWeight: 400,
            whiteSpace: "pre-wrap",
            margin: 0,
          }}
        >
          {card.content}
        </p>
      ) : null}

      {/* Placeholder si vide et pas en edition */}
      {!editing && !card.title && !card.content && (
        <p
          style={{
            fontFamily: COLORS.sans,
            fontSize: "0.82rem",
            fontStyle: "italic",
            color: isDark ? "rgba(255,255,255,0.3)" : COLORS.textMuted,
            margin: 0,
          }}
        >
          Double-clic pour editer...
        </p>
      )}

      {/* Resize handle - bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 20,
          height: 20,
          cursor: "se-resize",
          opacity: hovered ? 0.5 : 0,
          transition: "opacity 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "0 0 16px 0",
        }}
        onMouseDown={handleResizeStart}
      >
        <svg
          viewBox="0 0 16 16"
          fill={isDark ? "rgba(255,255,255,0.3)" : COLORS.textMuted}
          width={12}
          height={12}
        >
          <path d="M14 14H12V12H14V14ZM14 10H12V8H14V10ZM10 14H8V12H10V14Z" />
        </svg>
      </div>

      {/* Context menu */}
      {showMenu && (
        <div
          ref={menuRef}
          style={{
            position: "absolute",
            left: menuPos.x,
            top: menuPos.y,
            background: COLORS.bgCard,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            boxShadow: COLORS.shadowMd,
            padding: 6,
            zIndex: 50,
            minWidth: 180,
            fontFamily: COLORS.sans,
            maxHeight: 400,
            overflowY: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Style section */}
          <MenuSectionHeader label="Style" />
          {CARD_STYLES.map((s) => (
            <StyleMenuItem
              key={s.value}
              style={s}
              active={cardType === s.value}
              onClick={() => {
                onUpdate({ card_type: s.value });
                setShowMenu(false);
              }}
            />
          ))}

          <MenuDivider />

          {/* Width section */}
          <MenuSectionHeader label="Largeur" />
          {CARD_WIDTHS.map((w) => (
            <WidthMenuItem
              key={w.value}
              item={w}
              active={currentWidthCategory === w.value}
              onClick={() => {
                onUpdate({ width: w.width });
                setShowMenu(false);
              }}
            />
          ))}

          <MenuDivider />

          {/* Connect action */}
          <MenuActionButton
            icon={<Link size={14} />}
            label="Relier a..."
            onClick={() => {
              onConnectStart?.(card.id);
              setShowMenu(false);
            }}
          />

          <MenuActionButton
            icon={<Trash2 size={14} />}
            label="Supprimer"
            danger
            onClick={() => {
              onDelete();
              setShowMenu(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Menu Sub-Components ──────────────────────────────────

function MenuSectionHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "6px 10px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.6rem",
        fontWeight: 700,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "#9B9590",
        marginBottom: 4,
      }}
    >
      {label}
    </div>
  );
}

function MenuDivider() {
  return (
    <div
      style={{
        height: 1,
        background: "rgba(26, 23, 20, 0.08)",
        margin: "6px 0",
      }}
    />
  );
}

function MenuActionButton({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "8px 12px",
        border: "none",
        borderRadius: 8,
        background: "none",
        cursor: "pointer",
        fontFamily: "'Montserrat', system-ui, sans-serif",
        fontSize: "0.78rem",
        color: danger ? "#DC2626" : "#1A1714",
        display: "flex",
        alignItems: "center",
        gap: 8,
        transition: "background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger
          ? "rgba(220, 38, 38, 0.06)"
          : "#F0EDE6";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "none";
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Style Menu Item ──────────────────────────────────

function StyleMenuItem({
  style,
  active,
  onClick,
}: {
  style: { value: string; label: string; preview: React.CSSProperties };
  active: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "8px 12px",
        border: "none",
        borderRadius: 8,
        background: active
          ? "rgba(175, 0, 0, 0.06)"
          : hovered
            ? "#F0EDE6"
            : "none",
        cursor: "pointer",
        fontFamily: "'Montserrat', system-ui, sans-serif",
        fontSize: "0.78rem",
        fontWeight: active ? 600 : 400,
        color: active ? "#AF0000" : "#1A1714",
        display: "flex",
        alignItems: "center",
        gap: 10,
        transition: "background 0.15s ease",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 16,
          height: 16,
          borderRadius: 4,
          flexShrink: 0,
          ...style.preview,
        }}
      />
      {style.label}
    </button>
  );
}

// ─── Width Menu Item ──────────────────────────────────

function WidthMenuItem({
  item,
  active,
  onClick,
}: {
  item: { value: CardWidth; label: string; width: number };
  active: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "8px 12px",
        border: "none",
        borderRadius: 8,
        background: active
          ? "rgba(175, 0, 0, 0.06)"
          : hovered
            ? "#F0EDE6"
            : "none",
        cursor: "pointer",
        fontFamily: "'Montserrat', system-ui, sans-serif",
        fontSize: "0.78rem",
        fontWeight: active ? 600 : 400,
        color: active ? "#AF0000" : "#1A1714",
        display: "flex",
        alignItems: "center",
        gap: 10,
        transition: "background 0.15s ease",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 16,
          height: 10,
          borderRadius: 2,
          flexShrink: 0,
          background: active ? "#AF0000" : "rgba(26, 23, 20, 0.08)",
          transform:
            item.value === "wide"
              ? "scaleX(1.3)"
              : item.value === "narrow"
                ? "scaleX(0.7)"
                : "scaleX(1)",
        }}
      />
      {item.label}
    </button>
  );
}
