"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Selection d'emojis courants organises par categorie
const EMOJI_GROUPS = [
  {
    label: "Pages",
    emojis: [
      "📄",
      "📝",
      "📋",
      "📑",
      "🗒️",
      "📒",
      "📓",
      "📔",
      "📕",
      "📗",
      "📘",
      "📙",
      "📚",
      "📖",
      "🔖",
      "🏷️",
      "📰",
      "🗞️",
    ],
  },
  {
    label: "Business",
    emojis: [
      "💼",
      "📊",
      "📈",
      "📉",
      "💰",
      "💳",
      "🏦",
      "🎯",
      "🚀",
      "⚡",
      "🔥",
      "💎",
      "🏆",
      "🥇",
      "📣",
      "📢",
      "🔔",
      "💡",
    ],
  },
  {
    label: "Communication",
    emojis: [
      "💬",
      "🗣️",
      "📞",
      "📧",
      "✉️",
      "📩",
      "📨",
      "🌐",
      "📱",
      "💻",
      "🖥️",
      "📡",
      "🔗",
      "🔍",
      "🔎",
    ],
  },
  {
    label: "Organisation",
    emojis: [
      "✅",
      "❌",
      "⭐",
      "❓",
      "❗",
      "⚠️",
      "🔴",
      "🟢",
      "🔵",
      "🟡",
      "🟠",
      "🟣",
      "📌",
      "📍",
      "🗂️",
      "📁",
      "🗃️",
      "🔒",
    ],
  },
  {
    label: "Personnes",
    emojis: [
      "👤",
      "👥",
      "🤝",
      "👋",
      "🙌",
      "💪",
      "🧠",
      "👨‍💼",
      "👩‍💼",
      "👨‍🏫",
      "👩‍🏫",
      "🧑‍💻",
    ],
  },
];

interface KBIconPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function KBIconPicker({ onSelect, onClose }: KBIconPickerProps) {
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Fermer au clic exterieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Filtrer les emojis (simpliste — juste par label de groupe)
  const filteredGroups = search.trim()
    ? EMOJI_GROUPS.map((g) => ({
        ...g,
        emojis: g.emojis, // On ne peut pas filtrer par texte, on garde tout
      })).filter((g) => g.label.toLowerCase().includes(search.toLowerCase()))
    : EMOJI_GROUPS;

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1 z-50 w-72 bg-background border border-border rounded-xl shadow-lg p-3"
    >
      {/* Search */}
      <input
        type="text"
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full h-7 px-2.5 text-xs bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 mb-2"
        autoFocus
      />

      {/* Emoji grid */}
      <div className="max-h-52 overflow-y-auto space-y-2">
        {filteredGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-0.5">
              {group.emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onSelect(emoji)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-base transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Remove icon option */}
        <button
          onClick={() => onSelect("")}
          className="w-full h-7 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          Supprimer l'icone
        </button>
      </div>
    </div>
  );
}
