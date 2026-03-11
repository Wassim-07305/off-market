"use client";

import { useState } from "react";

const EMOJI_CATEGORIES = [
  {
    name: "Frequents",
    emojis: [
      "😊",
      "😂",
      "❤️",
      "👍",
      "🎉",
      "🔥",
      "💪",
      "✅",
      "👏",
      "🙏",
      "💯",
      "⭐",
    ],
  },
  {
    name: "Visages",
    emojis: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "🤣",
      "😇",
      "🙂",
      "😉",
      "😌",
      "😍",
      "🥰",
      "😘",
      "😎",
      "🤩",
      "🤔",
      "🤗",
      "😬",
      "😱",
    ],
  },
  {
    name: "Mains",
    emojis: [
      "👋",
      "🤚",
      "✋",
      "🖐️",
      "👌",
      "🤌",
      "✌️",
      "🤞",
      "🫰",
      "🤙",
      "👈",
      "👉",
      "👆",
      "👇",
      "☝️",
      "👊",
      "✊",
      "🤝",
    ],
  },
  {
    name: "Objets",
    emojis: [
      "💰",
      "📈",
      "📊",
      "🎯",
      "🏆",
      "🥇",
      "📚",
      "💡",
      "🔔",
      "📱",
      "💻",
      "🎓",
    ],
  },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="absolute bottom-full right-0 mb-2 bg-surface border border-border rounded-xl shadow-lg w-72 overflow-hidden z-10">
      <div className="flex border-b border-border">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(i)}
            className={`flex-1 text-xs py-2 transition-colors ${
              activeCategory === i
                ? "text-primary border-b-2 border-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <div className="p-2 grid grid-cols-8 gap-0.5 max-h-40 overflow-y-auto">
        {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted transition-colors text-lg"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
