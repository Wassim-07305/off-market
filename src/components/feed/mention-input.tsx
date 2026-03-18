"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from "react";
import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";
import { useProfilesForMention } from "@/hooks/use-profiles-search";
import type { MentionProfile } from "@/hooks/use-profiles-search";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function MentionInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  className,
  autoFocus,
}: MentionInputProps) {
  const { profiles } = useProfilesForMention();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter profiles based on mention query
  const filteredProfiles = mentionQuery
    ? profiles
        .filter((p) =>
          p.full_name.toLowerCase().includes(mentionQuery.toLowerCase()),
        )
        .slice(0, 5)
    : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart ?? newValue.length;
    onChange(newValue);

    // Check if we're in a mention context
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf("@");

    if (atIndex >= 0) {
      const charBeforeAt = atIndex > 0 ? textBeforeCursor[atIndex - 1] : " ";
      // Only trigger mention if @ is at start or preceded by a space
      if (atIndex === 0 || charBeforeAt === " ") {
        const query = textBeforeCursor.slice(atIndex + 1);
        // No space in query means user is still typing the mention
        if (!query.includes(" ") || query.length === 0) {
          setMentionQuery(query);
          setMentionStartIndex(atIndex);
          setShowSuggestions(true);
          setSelectedIndex(0);
          return;
        }
      }
    }
    setShowSuggestions(false);
    setMentionQuery("");
  };

  const insertMention = useCallback(
    (profile: MentionProfile) => {
      const before = value.slice(0, mentionStartIndex);
      const after = value.slice(mentionStartIndex + mentionQuery.length + 1);
      const newValue = `${before}@${profile.full_name} ${after}`;
      onChange(newValue);
      setShowSuggestions(false);
      setMentionQuery("");

      // Focus back on input
      setTimeout(() => {
        inputRef.current?.focus();
        const cursorPos = mentionStartIndex + profile.full_name.length + 2;
        inputRef.current?.setSelectionRange(cursorPos, cursorPos);
      }, 0);
    },
    [value, mentionStartIndex, mentionQuery, onChange],
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && filteredProfiles.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredProfiles.length - 1 ? prev + 1 : 0,
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredProfiles.length - 1,
        );
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(filteredProfiles[selectedIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowSuggestions(false);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey && !showSuggestions) {
      e.preventDefault();
      onSubmit();
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? "Ecrire un commentaire..."}
        autoFocus={autoFocus}
        className={cn(
          "w-full h-9 px-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow",
          className,
        )}
      />

      {/* Mention suggestions dropdown */}
      {showSuggestions && filteredProfiles.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute bottom-full left-0 mb-1 w-full max-w-xs bg-surface rounded-xl py-1 z-30 overflow-hidden"
          style={{ boxShadow: "var(--shadow-elevated)" }}
        >
          {filteredProfiles.map((profile, index) => (
            <button
              key={profile.id}
              onClick={() => insertMention(profile)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors",
                index === selectedIndex ? "bg-primary/10" : "hover:bg-muted",
              )}
            >
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt=""
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] text-primary font-semibold">
                  {getInitials(profile.full_name)}
                </div>
              )}
              <span className="truncate font-medium">{profile.full_name}</span>
              <span className="text-[10px] text-muted-foreground ml-auto capitalize">
                {profile.role}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Renders text content with @mentions highlighted in blue.
 */
export function RenderMentions({ text }: { text: string }) {
  // Match @Name patterns (handles multi-word names separated by spaces)
  const parts = text.split(/(@[A-Za-zÀ-ÿ]+(?: [A-Za-zÀ-ÿ]+)*)/g);

  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          <span
            key={i}
            className="text-primary font-medium cursor-pointer hover:underline"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
