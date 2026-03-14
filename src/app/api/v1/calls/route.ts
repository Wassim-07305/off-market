import { NextResponse } from "next/server";
import { validateApiKey, hasScope } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/v1/calls — List calls
export async function GET(request: Request) {
  const { ctx, error } = await validateApiKey(request);
  if (error) return error;
  if (!hasScope(ctx!, "read")) {
    return NextResponse.json({ error: "Scope 'read' requis" }, { status: 403 });
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  const offset = (page - 1) * limit;
  const status = url.searchParams.get("status");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const supabase = createAdminClient();
  let query = supabase
    .from("call_calendar")
    .select("id, title, date, time_start, time_end, call_type, status, client_id, assigned_to, created_at", { count: "exact" });

  if (status) query = query.eq("status", status);
  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);

  const { data, error: dbError, count } = await query
    .order("date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      pages: Math.ceil((count ?? 0) / limit),
    },
  });
}
