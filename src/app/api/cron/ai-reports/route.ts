import { NextRequest, NextResponse } from "next/server";

const AI_REPORT_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://off-market-amber.vercel.app";

/**
 * Cron endpoint pour la generation hebdomadaire des rapports IA.
 * Vercel Cron envoie un GET avec le header Authorization: Bearer <CRON_SECRET>.
 * Ce handler delegue au POST /api/ai/periodic-report qui contient toute la logique.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // Generer les 3 types de rapports
    const reportTypes = [
      "weekly_coaching",
      "monthly_performance",
      "client_risk",
    ] as const;

    const results: {
      type: string;
      success: boolean;
      error?: string;
    }[] = [];

    for (const type of reportTypes) {
      try {
        const res = await fetch(`${AI_REPORT_URL}/api/ai/periodic-report`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cronSecret}`,
          },
          body: JSON.stringify({ type }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          results.push({
            type,
            success: false,
            error: err?.error ?? `HTTP ${res.status}`,
          });
        } else {
          results.push({ type, success: true });
        }
      } catch (err) {
        results.push({
          type,
          success: false,
          error: err instanceof Error ? err.message : "Erreur inconnue",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      message: `${successCount}/${reportTypes.length} rapports generes`,
      results,
    });
  } catch (error) {
    console.error("Cron AI reports error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation des rapports IA" },
      { status: 500 },
    );
  }
}
