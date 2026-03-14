"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Check, Loader2, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FaqMatch {
  id: string;
  question: string;
  answer: string;
  category: string;
  occurrence_count: number;
}

interface FaqAutoSuggestProps {
  message: string;
  channelId: string;
  onSendAnswer: (answer: string) => void;
  isStaff: boolean;
}

export function FaqAutoSuggest({
  message,
  channelId,
  onSendAnswer,
  isStaff,
}: FaqAutoSuggestProps) {
  const [match, setMatch] = useState<FaqMatch | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [lastSearched, setLastSearched] = useState("");

  const searchFaq = useCallback(
    async (text: string) => {
      if (text.length < 10 || text === lastSearched) return;
      setIsSearching(true);
      setLastSearched(text);

      try {
        const res = await fetch("/api/ai/faq-match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, channelId }),
        });

        if (!res.ok) {
          setMatch(null);
          return;
        }

        const data = await res.json();
        if (data.match) {
          setMatch(data.match);
          setDismissed(false);
        } else {
          setMatch(null);
        }
      } catch {
        setMatch(null);
      } finally {
        setIsSearching(false);
      }
    },
    [channelId, lastSearched],
  );

  // Debounce search when message changes
  useEffect(() => {
    if (!message || message.length < 10) {
      setMatch(null);
      return;
    }

    const timer = setTimeout(() => {
      searchFaq(message);
    }, 1000);

    return () => clearTimeout(timer);
  }, [message, searchFaq]);

  if (!match || dismissed) {
    if (isSearching && message.length >= 10) {
      return (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-600">
          <Loader2 className="h-3 w-3 animate-spin" />
          Recherche dans la base FAQ...
        </div>
      );
    }
    return null;
  }

  return (
    <div className="mx-4 mb-2 rounded-xl border border-blue-200 bg-blue-50/80 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100">
            <Zap className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-blue-800">
              Reponse FAQ suggeree
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <Badge variant="secondary" className="text-[10px]">
                <BookOpen className="mr-1 h-2.5 w-2.5" />
                {match.category}
              </Badge>
              <span className="text-[10px] text-blue-600">
                Posee {match.occurrence_count} fois
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-md p-1 text-blue-400 transition-colors hover:bg-blue-100 hover:text-blue-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-2 rounded-lg bg-white/70 p-2.5">
        <p className="text-xs font-medium text-foreground">
          Q : {match.question}
        </p>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-3">
          {match.answer}
        </p>
      </div>

      {isStaff && (
        <div className="mt-2 flex gap-2">
          <Button
            size="sm"
            variant="primary"
            icon={<Check className="h-3.5 w-3.5" />}
            onClick={() => onSendAnswer(match.answer)}
            className={cn(
              "h-7 text-xs",
              "bg-blue-600 hover:bg-blue-700 shadow-none",
            )}
          >
            Envoyer cette reponse
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(true)}
            className="h-7 text-xs text-blue-600 hover:bg-blue-100"
          >
            Ignorer
          </Button>
        </div>
      )}
    </div>
  );
}
