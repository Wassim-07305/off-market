import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("app_settings")
      .select("key, value, description, is_secret, updated_at")
      .order("key");

    if (error) throw error;

    // Masque les valeurs secrètes (affiche seulement les 4 derniers caractères)
    const masked = (data ?? []).map((s) => ({
      ...s,
      value:
        s.is_secret && s.value
          ? "••••••••" + s.value.slice(-4)
          : s.value,
      hasValue: !!s.value,
    }));

    return NextResponse.json(masked);
  } catch (err) {
    console.error("[Settings] GET error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }

    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Clé et valeur requises" }, { status: 400 });
    }

    const { error } = await supabase
      .from("app_settings")
      .update({ value, updated_by: user.id })
      .eq("key", key);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Settings] PATCH error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
