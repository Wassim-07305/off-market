import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const UNIPILE_BASE =
  process.env.UNIPILE_BASE_URL ?? "https://api33.unipile.com:16338";

export async function GET(request: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "coach"].includes(profile.role)) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  const apiKey = process.env.UNIPILE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "UNIPILE_API_KEY non configure" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("account_id");
  const limit = searchParams.get("limit") ?? "20";

  if (!accountId) {
    return NextResponse.json({ error: "account_id requis" }, { status: 400 });
  }

  try {
    const url = `${UNIPILE_BASE}/api/v1/chats?account_id=${encodeURIComponent(accountId)}&limit=${encodeURIComponent(limit)}`;
    const res = await fetch(url, {
      headers: { "X-API-KEY": apiKey },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur lors du chargement des conversations" },
        { status: res.status },
      );
    }

    const data = await res.json();
    const chats = (data.items ?? data ?? []) as {
      id: string;
      name?: string;
      [key: string]: unknown;
    }[];

    // Enrich: fetch attendees for each chat in parallel to get real names
    const enriched = await Promise.all(
      chats.map(async (chat) => {
        try {
          const attUrl = `${UNIPILE_BASE}/api/v1/chats/${encodeURIComponent(chat.id)}/attendees`;
          const attRes = await fetch(attUrl, {
            headers: { "X-API-KEY": apiKey },
          });
          if (!attRes.ok) return chat;
          const attData = await attRes.json();
          const attendees = (attData.items ?? attData ?? []) as {
            id: string;
            display_name?: string;
            name?: string;
            is_self?: boolean;
          }[];

          // Find the other person (not self)
          const other = attendees.find((a) => !a.is_self);
          const otherName = other?.display_name ?? other?.name;

          return {
            ...chat,
            name: chat.name || otherName || "Conversation",
            _attendee_id: other?.id ?? null,
          };
        } catch {
          return chat;
        }
      }),
    );

    return NextResponse.json({ items: enriched });
  } catch (error) {
    console.error("Unipile chats error:", error);
    return NextResponse.json(
      { error: "Erreur de connexion a Unipile" },
      { status: 500 },
    );
  }
}
