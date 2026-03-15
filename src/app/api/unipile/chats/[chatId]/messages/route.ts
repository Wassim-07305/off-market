import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const UNIPILE_BASE = process.env.UNIPILE_BASE_URL ?? "https://api33.unipile.com:16338";

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "coach"].includes(profile.role)) return null;
  return user;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const apiKey = process.env.UNIPILE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "UNIPILE_API_KEY non configure" },
      { status: 500 },
    );
  }

  const { chatId } = await params;
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") ?? "50";

  try {
    const url = `${UNIPILE_BASE}/api/v1/chats/${encodeURIComponent(chatId)}/messages?limit=${encodeURIComponent(limit)}`;
    const res = await fetch(url, {
      headers: { "X-API-KEY": apiKey },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur lors du chargement des messages" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Unipile messages error:", error);
    return NextResponse.json(
      { error: "Erreur de connexion a Unipile" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const apiKey = process.env.UNIPILE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "UNIPILE_API_KEY non configure" },
      { status: 500 },
    );
  }

  const { chatId } = await params;

  try {
    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text || text.length > 5000) {
      return NextResponse.json(
        { error: "Message invalide (1-5000 caracteres)" },
        { status: 400 },
      );
    }

    const res = await fetch(
      `${UNIPILE_BASE}/api/v1/chats/${encodeURIComponent(chatId)}/messages`,
      {
        method: "POST",
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur lors de l'envoi du message" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Unipile send message error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 },
    );
  }
}
