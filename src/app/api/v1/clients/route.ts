import { NextResponse } from "next/server";
import { validateApiKey, hasScope } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { dispatchWebhook } from "@/lib/webhooks";

// GET /api/v1/clients — List clients
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
  const search = url.searchParams.get("search");
  const tag = url.searchParams.get("tag");

  const supabase = createAdminClient();
  let query = supabase
    .from("clients")
    .select("id, full_name, email, phone, tag, status, created_at, updated_at", { count: "exact" });

  if (search) {
    const sanitized = search.replace(/[%,.()\[\]{}|\\\/'"`;:!@#$^&*+=<>?~]/g, "");
    if (sanitized) query = query.or(`full_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%`);
  }
  if (tag) query = query.eq("tag", tag);

  const { data, error: dbError, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (dbError) {
    console.error("v1/clients error:", dbError);
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

// POST /api/v1/clients — Create a client
export async function POST(request: Request) {
  const { ctx, error } = await validateApiKey(request);
  if (error) return error;
  if (!hasScope(ctx!, "write")) {
    return NextResponse.json({ error: "Scope 'write' requis" }, { status: 403 });
  }

  const body = await request.json();
  const { full_name, email, phone, tag } = body;

  if (!full_name || !email) {
    return NextResponse.json({ error: "full_name et email requis" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error: dbError } = await supabase
    .from("clients")
    .insert({ full_name, email, phone, tag })
    .select()
    .single();

  if (dbError) {
    console.error("v1/clients error:", dbError);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }

  // Dispatch webhook
  dispatchWebhook("client.created", { client: data }).catch(() => {});

  return NextResponse.json({ data }, { status: 201 });
}
