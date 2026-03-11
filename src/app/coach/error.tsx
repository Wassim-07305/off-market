"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function CoachError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Off-Market][Coach] Erreur:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
        <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Erreur — Espace Coach
        </h2>
        <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
          Une erreur est survenue dans le portail coach. Veuillez réessayer.
        </p>
        {error.digest && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Référence : {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <RotateCcw className="h-4 w-4" />
          Réessayer
        </button>
        <Link
          href="/coach/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
      </div>
    </div>
  );
}
