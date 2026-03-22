import { NextResponse } from "next/server";
import { validateApiKey, hasScope } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/v1/invoices — List invoices (financial_entries of type revenue)
export async function GET(request: Request) {
  const { ctx, error } = await validateApiKey(request);
  if (error) return error;
  if (!hasScope(ctx!, "read")) {
    return NextResponse.json({ error: "Scope 'read' requis" }, { status: 403 });
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const offset = (page - 1) * limit;
  const status = url.searchParams.get("status");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const supabase = createAdminClient();
  let query = supabase
    .from("financial_entries")
    .select(
      "id, label, amount, type, status, date, client_id, created_at, updated_at",
      { count: "exact" },
    )
    .eq("type", "revenue");

  if (status) query = query.eq("status", status);
  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);

  const {
    data,
    error: dbError,
    count,
  } = await query
    .order("date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (dbError) {
    console.error("v1/invoices error:", dbError);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }

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
