import { NextResponse } from "next/server";
import { logServerError } from "@/lib/error-logger-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, stack, source, severity, page, metadata } = body;

    if (!message) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    await logServerError({
      message: String(message).slice(0, 2000),
      stack: stack ? String(stack).slice(0, 5000) : null,
      route: page ?? null,
      source: source === "error-boundary" ? "api-error" : "manual",
      severity: severity === "critical" ? "critical" : "error",
      metadata: metadata ?? {},
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to log" }, { status: 500 });
  }
}
