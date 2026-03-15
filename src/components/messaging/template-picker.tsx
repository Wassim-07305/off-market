"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  useMessageTemplates,
  useSearchTemplates,
  useIncrementTemplateUsage,
  type MessageTemplate,
} from "@/hooks/use-message-templates";
import { Zap, Search, Hash, Settings, TrendingUp } from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "Tous" },
  { value: "general", label: "General" },
  { value: "vente", label: "Vente" },
  { value: "support", label: "Support" },
  { value: "onboarding", label: "Onboarding" },
  { value: "relance", label: "Relance" },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  vente: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  support: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  onboarding:
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  relance:
    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
};

interface TemplatePickerProps {
  onSelect: (content: string) => void;
  onManage: () => void;
  shortcutQuery?: string | null;
  open: boolean;
  onClose: () => void;
}

export function TemplatePicker({
  onSelect,
  onManage,
  shortcutQuery,
  open,
  onClose,
}: TemplatePickerProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [shortcutResults, setShortcutResults] = useState<MessageTemplate[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: templates = [] } = useMessageTemplates(
    category !== "all" ? category : undefined,
  );
  const searchTemplates = useSearchTemplates();
  const incrementUsage = useIncrementTemplateUsage();

  // If triggered by shortcut (e.g. /welcome), search by shortcut
  useEffect(() => {
    if (shortcutQuery) {
      searchTemplates(shortcutQuery).then(setShortcutResults);
    } else {
      setShortcutResults([]);
    }
  }, [shortcutQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setSearch("");
      setCategory("all");
      setActiveIndex(0);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [open]);

  // Filter templates by search
  const displayTemplates = shortcutQuery
    ? shortcutResults
    : search
      ? templates.filter(
          (t) =>
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.content.toLowerCase().includes(search.toLowerCase()) ||
            (t.shortcut &&
              t.shortcut.toLowerCase().includes(search.toLowerCase())),
        )
      : templates;

  // Reset active index on filter change
  useEffect(() => {
    setActiveIndex(0);
  }, [search, category, shortcutQuery]);

  const handleSelect = useCallback(
    (template: MessageTemplate) => {
      onSelect(template.content);
      incrementUsage.mutate(template.id);
      onClose();
    },
    [onSelect, incrementUsage, onClose],
  );

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) =>
          i < displayTemplates.length - 1 ? i + 1 : 0,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) =>
          i > 0 ? i - 1 : displayTemplates.length - 1,
        );
      } else if (e.key === "Enter" && displayTemplates[activeIndex]) {
        e.preventDefault();
        handleSelect(displayTemplates[activeIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, activeIndex, displayTemplates, handleSelect, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as
      | HTMLElement
      | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Click outside to close
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full left-0 right-0 mb-2 z-30 bg-surface border border-border/60 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150"
      style={{ maxHeight: 400 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/30">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">
          Reponses rapides
        </span>
      </div>

      {/* Search (only when not in shortcut mode) */}
      {!shortcutQuery && (
        <>
          <div className="px-3 pt-2.5 pb-1.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un template..."
                className="w-full h-8 pl-8 pr-3 bg-muted/40 border border-border/30 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1 px-3 pb-2 overflow-x-auto scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors",
                  category === cat.value
                    ? "bg-primary text-white"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Template list */}
      <div
        ref={listRef}
        className="overflow-y-auto"
        style={{ maxHeight: shortcutQuery ? 240 : 200 }}
      >
        {displayTemplates.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun template trouve
            </p>
          </div>
        ) : (
          displayTemplates.map((template, i) => (
            <button
              key={template.id}
              onClick={() => handleSelect(template)}
              className={cn(
                "w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors border-b border-border/10 last:border-0",
                i === activeIndex
                  ? "bg-primary/8"
                  : "hover:bg-muted/50",
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-foreground truncate">
                    {template.title}
                  </p>
                  {template.shortcut && (
                    <span className="flex items-center gap-0.5 text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded shrink-0">
                      <Hash className="w-2.5 h-2.5" />
                      {template.shortcut}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {template.content}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded",
                    CATEGORY_COLORS[template.category] ??
                      CATEGORY_COLORS.general,
                  )}
                >
                  {template.category}
                </span>
                {template.usage_count > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <TrendingUp className="w-2.5 h-2.5" />
                    {template.usage_count}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border/30 px-3 py-2">
        <button
          onClick={() => {
            onClose();
            onManage();
          }}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
        >
          <Settings className="w-3 h-3" />
          Gerer les templates
        </button>
      </div>
    </div>
  );
}
