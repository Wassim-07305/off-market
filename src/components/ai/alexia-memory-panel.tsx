"use client";

import { useState } from "react";
import { useClientMemories } from "@/hooks/use-alexia";
import { cn } from "@/lib/utils";
import {
  Brain,
  User,
  ChevronRight,
  Loader2,
  MessageSquare,
} from "lucide-react";

export function AlexiaMemoryPanel() {
  const { data: memories, isLoading } = useClientMemories();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = memories?.find((m) => m.id === selectedId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground">
          Memoire clients
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          AlexIA memorise les informations cles de chaque client pour
          personnaliser ses reponses.
        </p>
      </div>

      {!memories?.length ? (
        <div className="text-center py-12">
          <Brain className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Aucune memoire pour l&apos;instant
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            La memoire se construit automatiquement au fil des conversations
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Client list */}
          <div className="space-y-2">
            {memories.map((mem) => (
              <button
                key={mem.id}
                onClick={() => setSelectedId(mem.id)}
                className={cn(
                  "w-full text-left bg-surface border rounded-xl px-4 py-3 flex items-center gap-3 transition-all",
                  selectedId === mem.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30",
                )}
              >
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {mem.client?.full_name ?? "Client"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="w-2.5 h-2.5" />
                      {mem.conversation_count} echange
                      {mem.conversation_count > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0" />
              </button>
            ))}
          </div>

          {/* Memory detail */}
          <div className="bg-surface border border-border rounded-2xl p-5">
            {selected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Memoire de {selected.client?.full_name ?? "Client"}
                  </h3>
                </div>
                {selected.summary ? (
                  <div className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                    {selected.summary}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Pas encore de memoire pour ce client
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                <Brain className="w-8 h-8 text-muted-foreground/20 mb-3" />
                <p className="text-sm">Selectionne un client</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
