"use client";

import { useState, useEffect, useRef } from "react";
import { getInitials, cn } from "@/lib/utils";

interface MemberOption {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
}

interface MentionAutocompleteProps {
  query: string;
  members: MemberOption[];
  onSelect: (member: MemberOption) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export function MentionAutocomplete({
  query,
  members,
  onSelect,
  onClose,
  position,
}: MentionAutocompleteProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = members.filter((m) =>
    m.full_name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (filtered[activeIndex]) {
          onSelect(filtered[activeIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, filtered, onSelect, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (filtered.length === 0) return null;

  const ROLE_COLORS: Record<string, string> = {
    admin: "text-red-500",
    coach: "text-primary",
    sales: "text-amber-600",
    client: "text-blue-500",
  };

  return (
    <div
      ref={listRef}
      className="absolute z-30 bg-surface border border-border/60 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto w-64 animate-in fade-in slide-in-from-bottom-2 duration-150"
      style={{ bottom: position.top, left: position.left }}
    >
      <div className="px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/30">
        Mentionner
      </div>
      {filtered.slice(0, 8).map((member, i) => (
        <button
          key={member.id}
          onClick={() => onSelect(member)}
          className={cn(
            "w-full flex items-center gap-2.5 px-2.5 py-2 text-left transition-colors",
            i === activeIndex ? "bg-primary/8" : "hover:bg-muted/50"
          )}
        >
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
            {member.avatar_url ? (
              <img src={member.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <span className="text-[10px] font-semibold text-primary">
                {getInitials(member.full_name)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{member.full_name}</p>
          </div>
          <span className={cn("text-[10px] capitalize shrink-0", ROLE_COLORS[member.role] ?? "text-muted-foreground")}>
            {member.role}
          </span>
        </button>
      ))}
    </div>
  );
}
