import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyNewTicket } from "@/lib/slack";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, category, priority, page_url } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Titre et description requis" },
        { status: 400 },
      );
    }

    // Cree le ticket
    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .insert({
        user_id: user.id,
        title,
        description,
        category: category || "bug",
        priority: priority || "medium",
        page_url: page_url || null,
        user_agent: req.headers.get("user-agent"),
      })
      .select()
      .single();

    if (error) throw error;

    // Recupere le nom de l'utilisateur pour Slack
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    // Notification Slack (fire-and-forget)
    notifyNewTicket(
      title,
      category || "bug",
      profile?.full_name || user.email || "Inconnu",
    ).catch(() => {});

    return NextResponse.json(ticket);
  } catch (err) {
    console.error("[Support] Erreur:", err);
    return NextResponse.json(
      { error: "Erreur lors de la creation du ticket" },
      { status: 500 },
    );
  }
}
