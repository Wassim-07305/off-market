import { NextResponse } from "next/server";
import { validateApiKey, hasScope } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/v1/contracts — List contracts
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
  const clientId = url.searchParams.get("client_id");

  const supabase = createAdminClient();
  let query = supabase
    .from("contracts")
    .select(
      "id, title, status, client_id, amount, start_date, end_date, signed_at, created_at, updated_at",
      { count: "exact" },
    );

  if (status) query = query.eq("status", status);
  if (clientId) query = query.eq("client_id", clientId);

  const {
    data,
    error: dbError,
    count,
  } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (dbError) {
    console.error("v1/contracts error:", dbError);
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
