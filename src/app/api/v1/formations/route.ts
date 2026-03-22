import { NextResponse } from "next/server";
import { validateApiKey, hasScope } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/v1/formations — List formations
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
  const search = url.searchParams.get("search");
  const status = url.searchParams.get("status");

  const supabase = createAdminClient();
  let query = supabase
    .from("formations")
    .select(
      "id, title, description, status, thumbnail_url, modules_count, created_at, updated_at",
      { count: "exact" },
    );

  if (status) query = query.eq("status", status);
  if (search) {
    const sanitized = search.replace(
      /[%,.()\[\]{}|\\\/'"`;:!@#$^&*+=<>?~]/g,
      "",
    );
    if (sanitized)
      query = query.ilike("title", `%${sanitized}%`);
  }

  const {
    data,
    error: dbError,
    count,
  } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (dbError) {
    console.error("v1/formations error:", dbError);
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
