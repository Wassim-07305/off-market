"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  Bot,
  FileText,
  Languages,
  Lightbulb,
  HelpCircle,
  Loader2,
  Copy,
  Check,
  X,
  ArrowRight,
} from "lucide-react";

interface AiCommand {
  name: string;
  label: string;
  description: string;
  icon: typeof Bot;
  requiresParam?: boolean;
  paramPlaceholder?: string;
}

const AI_COMMANDS: AiCommand[] = [
  {
    name: "help",
    label: "/help",
    description: "Afficher les commandes IA disponibles",
    icon: HelpCircle,
  },
  {
    name: "resume",
    label: "/resume",
    description: "Resumer les derniers messages du canal",
    icon: FileText,
    requiresParam: true,
    paramPlaceholder: "nombre de messages (defaut: 20)",
  },
  {
    name: "translate",
    label: "/translate",
    description: "Traduire le dernier message",
    icon: Languages,
    requiresParam: true,
    paramPlaceholder: "langue cible (defaut: English)",
  },
  {
    name: "suggest",
    label: "/suggest",
    description: "Suggerer une reponse basee sur le contexte",
    icon: Lightbulb,
  },
];

const AI_COMMAND_NAMES = AI_COMMANDS.map((c) => c.name);

/** Check if a string starts with an AI slash command */
export function isAiSlashCommand(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  return AI_COMMAND_NAMES.some(
    (cmd) => trimmed === `/${cmd}` || trimmed.startsWith(`/${cmd} `),
  );
}

/** Parse the command name from input text */
export function parseAiCommand(text: string): {
  command: string;
  param: string;
} | null {
  const trimmed = text.trim();
  const match = trimmed.match(/^\/(\w+)\s*(.*)?$/);
  if (!match) return null;
  const command = match[1].toLowerCase();
  if (!AI_COMMAND_NAMES.includes(command)) return null;
  return { command, param: (match[2] ?? "").trim() };
}

interface AiSlashCommandsProps {
  query: string;
  channelId: string;
  onInsertResult: (text: string) => void;
  onClose: () => void;
  onClearInput: () => void;
}

export function AiSlashCommands({
  query,
  channelId,
  onInsertResult,
  onClose,
  onClearInput,
}: AiSlashCommandsProps) {
  const { isStaff } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const parsed = parseAiCommand(query);
  const isExactCommand = parsed !== null;

  // Filter commands based on partial query (e.g. "/res" matches "/resume")
  const filterQuery = query.replace(/^\//, "").toLowerCase().split(" ")[0];
  const filteredCommands = isExactCommand
    ? AI_COMMANDS.filter((c) => c.name === parsed.command)
    : AI_COMMANDS.filter(
        (c) =>
          c.name.startsWith(filterQuery) ||
          c.label.includes(filterQuery) ||
          c.description.toLowerCase().includes(filterQuery),
      );

  // Reset index when filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [filterQuery]);

  const executeCommand = useCallback(
    async (command: string, param: string) => {
      if (!isStaff) {
        setError("Les commandes IA sont reservees aux admins et coaches.");
        return;
      }

      // /help — show help inline, no API call
      if (command === "help") {
        const helpText = AI_COMMANDS.map(
          (c) => `**${c.label}** — ${c.description}`,
        ).join("\n");
        setResult(helpText);
        onClearInput();
        return;
      }

      setIsExecuting(true);
      setError(null);
      setResult(null);

      try {
        const params: Record<string, string> = {};
        if (command === "resume" && param) {
          params.count = param;
        }
        if (command === "translate" && param) {
          params.lang = param;
        }

        const res = await fetch("/api/ai/slash-command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command, channelId, params }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Erreur serveur");
        }

        const data = await res.json();
        setResult(data.result);
        onClearInput();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors de l'execution",
        );
      } finally {
        setIsExecuting(false);
      }
    },
    [channelId, isStaff, onClearInput],
  );

  // Keyboard navigation
  useEffect(() => {
    if (result || isExecuting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i < filteredCommands.length - 1 ? i + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i > 0 ? i - 1 : filteredCommands.length - 1));
      } else if (e.key === "Enter" && filteredCommands[activeIndex]) {
        e.preventDefault();
        const cmd = filteredCommands[activeIndex];
        const param = parsed?.param ?? "";
        executeCommand(cmd.name, param);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    result,
    isExecuting,
    activeIndex,
    filteredCommands,
    parsed,
    executeCommand,
    onClose,
  ]);

  // Scroll active into view
  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as
      | HTMLElement
      | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Click outside — ignore clicks inside the chat input container (parent with relative class)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(e.target as Node)) return;
      // Don't close when clicking inside the parent chat input area (the relative container)
      const parentRelative = containerRef.current.parentElement;
      if (parentRelative && parentRelative.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInsert = () => {
    if (result) {
      onInsertResult(result);
      onClose();
    }
  };

  if (filteredCommands.length === 0 && !result && !isExecuting) return null;

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full left-0 right-0 mb-2 z-30 bg-surface border border-border/60 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150"
      style={{ maxHeight: 420 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Commandes IA
          </span>
        </div>
        {(result || error) && (
          <button
            onClick={onClose}
            className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Loading state */}
      {isExecuting && (
        <div className="flex items-center gap-3 px-4 py-6">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">
            Traitement en cours...
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-4 py-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && !isExecuting && (
        <div className="px-4 py-3">
          <div className="bg-muted/40 rounded-lg p-3 text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
            {result}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleInsert}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              Inserer dans le chat
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-muted/80 transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? "Copie" : "Copier"}
            </button>
          </div>
        </div>
      )}

      {/* Command list (shown when not executing/showing result) */}
      {!isExecuting && !result && !error && (
        <div
          ref={listRef}
          className="overflow-y-auto"
          style={{ maxHeight: 280 }}
        >
          {filteredCommands.map((cmd, i) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.name}
                onClick={() => executeCommand(cmd.name, parsed?.param ?? "")}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-border/10 last:border-0",
                  i === activeIndex ? "bg-primary/8" : "hover:bg-muted/50",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    i === activeIndex
                      ? "bg-primary/15 text-primary"
                      : "bg-muted/60 text-muted-foreground",
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {cmd.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {cmd.description}
                  </p>
                </div>
                {isExactCommand && (
                  <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded shrink-0">
                    Entrer pour executer
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Hint footer */}
      {!isExecuting && !result && !error && (
        <div className="border-t border-border/30 px-3 py-2">
          <p className="text-[11px] text-muted-foreground">
            {!isStaff
              ? "Reserve aux admins et coaches"
              : "Navigue avec les fleches, Entrer pour executer, Echap pour fermer"}
          </p>
        </div>
      )}
    </div>
  );
}
