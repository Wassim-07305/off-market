import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

const startTime = Date.now();

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  const uptime_seconds = Math.floor((Date.now() - startTime) / 1000);

  const checks: Record<
    string,
    { status: "ok" | "degraded" | "down"; latency_ms: number; error?: string }
  > = {};

  // ── Database check ──
  try {
    const dbStart = Date.now();
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .limit(1);
    const latency_ms = Date.now() - dbStart;

    if (error) {
      checks.database = { status: "degraded", latency_ms, error: error.message };
    } else {
      checks.database = { status: "ok", latency_ms };
    }
  } catch (err) {
    checks.database = {
      status: "down",
      latency_ms: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }

  // ── Aggregate status ──
  const statuses = Object.values(checks).map((c) => c.status);
  let status: "ok" | "degraded" | "down" = "ok";
  if (statuses.includes("down")) status = "down";
  else if (statuses.includes("degraded")) status = "degraded";

  return NextResponse.json(
    {
      status,
      timestamp,
      checks,
      version: "1.0.0",
      uptime_seconds,
    },
    {
      status: status === "down" ? 503 : 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
