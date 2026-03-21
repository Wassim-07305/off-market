"use client";

import { Lock } from "lucide-react";

interface ProspectGateProps {
  /** Message affiché sur l'overlay */
  message?: string;
}

/**
 * Blocks prospect access entirely — no children rendered, no backend calls.
 * Shows a fake blurred placeholder with a CTA.
 */
export function ProspectGate({
  message = "Devenez client pour acceder a cette fonctionnalite",
}: ProspectGateProps) {
  return (
    <div className="relative min-h-[60vh]">
      {/* Fake blurred placeholder — no real content rendered */}
      <div className="pointer-events-none select-none blur-[6px] opacity-40 space-y-6">
        {/* Fake header */}
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-muted" />
          <div className="h-4 w-72 rounded bg-muted/60" />
        </div>
        {/* Fake stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl border border-border bg-surface"
            />
          ))}
        </div>
        {/* Fake content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-64 rounded-2xl border border-border bg-surface" />
          <div className="h-64 rounded-2xl border border-border bg-surface" />
        </div>
      </div>

      {/* Overlay CTA */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center px-6 py-8 bg-surface/95 border border-border rounded-2xl shadow-lg max-w-sm backdrop-blur-sm">
          <div className="size-12 rounded-full bg-[#AF0000]/10 flex items-center justify-center">
            <Lock className="size-5 text-[#AF0000]" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Acces reserve aux clients
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
