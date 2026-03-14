import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateApiKey } from "@/lib/api-auth";

// GET — List all API keys (admin only)
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin requis" }, { status: 403 });

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, scopes, is_active, last_used_at, expires_at, created_at, revoked_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ keys: data });
}

// POST — Create a new API key
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin requis" }, { status: 403 });

  const { name, scopes, expires_at } = await request.json();

  if (!name) return NextResponse.json({ error: "name requis" }, { status: 400 });

  const { key, hash, prefix } = generateApiKey();

  const { error } = await supabase.from("api_keys").insert({
    owner_id: user.id,
    name,
    key_hash: hash,
    key_prefix: prefix,
    scopes: scopes || ["read"],
    expires_at: expires_at || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Return the plaintext key ONCE — it cannot be retrieved later
  return NextResponse.json({
    key,
    prefix,
    name,
    scopes: scopes || ["read"],
    message: "Conserve cette cle — elle ne sera plus affichee.",
  });
}

// DELETE — Revoke an API key
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin requis" }, { status: 403 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const { error } = await supabase
    .from("api_keys")
    .update({ is_active: false, revoked_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
