"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  GraduationCap,
  FileText,
  Bot,
  BarChart3,
  Settings,
  Plus,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const pages = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, section: "Navigation" },
  { name: "CRM - Eleves", href: "/crm", icon: Users, section: "Navigation" },
  { name: "Messagerie", href: "/messaging", icon: MessageSquare, section: "Navigation" },
  { name: "Formation", href: "/school", icon: GraduationCap, section: "Navigation" },
  { name: "Formulaires", href: "/forms", icon: FileText, section: "Navigation" },
  { name: "Assistant IA", href: "/ai", icon: Bot, section: "Navigation" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, section: "Navigation" },
  { name: "Reglages", href: "/settings", icon: Settings, section: "Navigation" },
  { name: "Nouveau cours", href: "/school/builder", icon: Plus, section: "Actions" },
  { name: "Nouveau formulaire", href: "/forms/builder", icon: Plus, section: "Actions" },
];

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const filteredPages = useMemo(() => {
    if (!query) return pages;
    return pages.filter((page) =>
      page.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (href: string) => {
    router.push(href);
    setCommandPaletteOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filteredPages.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && filteredPages[selectedIndex]) {
      handleSelect(filteredPages[selectedIndex].href);
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          setCommandPaletteOpen(false);
          setQuery("");
        }}
      />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg animate-scale-in">
        <div className="bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher une page, une action..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
            />
            <kbd className="text-xs bg-muted border border-border rounded px-1.5 py-0.5 font-mono text-muted-foreground">
              ESC
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {filteredPages.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Aucun resultat
              </div>
            ) : (
              <>
                {["Navigation", "Actions"].map((section) => {
                  const items = filteredPages.filter(
                    (p) => p.section === section
                  );
                  if (items.length === 0) return null;
                  return (
                    <div key={section}>
                      <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {section}
                      </div>
                      {items.map((page) => {
                        const index = filteredPages.indexOf(page);
                        return (
                          <button
                            key={page.href}
                            onClick={() => handleSelect(page.href)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 h-10 rounded-lg text-sm transition-colors",
                              index === selectedIndex
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:bg-muted"
                            )}
                          >
                            <page.icon className="w-4 h-4" />
                            <span>{page.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
