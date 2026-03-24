import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { withErrorLogging } from "@/lib/error-logger-server";

/**
 * Cron endpoint pour publier les messages programmes.
 * Vercel Cron envoie un GET avec le header Authorization: Bearer <CRON_SECRET>.
 * Toutes les 5 minutes, on cherche les messages dont scheduled_at <= NOW()
 * et on les "publie" en mettant scheduled_at = null.
 */

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function handler(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const supabase = getAdminSupabase();
    const now = new Date().toISOString();

    // Trouver les messages programmes dont l'heure est passee
    const { data: scheduledMessages, error: fetchError } = await supabase
      .from("messages")
      .select("id, channel_id, sender_id")
      .not("scheduled_at", "is", null)
      .lte("scheduled_at", now)
      .is("deleted_at", null)
      .limit(100);

    if (fetchError) {
      console.error("Erreur fetch messages programmes:", fetchError);
      return NextResponse.json(
        { error: "Erreur lors de la recuperation des messages" },
        { status: 500 },
      );
    }

    if (!scheduledMessages?.length) {
      return NextResponse.json({
        success: true,
        published: 0,
        processed_at: now,
      });
    }

    // Publier les messages en mettant scheduled_at = null
    const ids = scheduledMessages.map((m) => m.id);

    const { error: updateError, count } = await supabase
      .from("messages")
      .update({ scheduled_at: null })
      .in("id", ids);

    if (updateError) {
      console.error("Erreur publication messages:", updateError);
      return NextResponse.json(
        { error: "Erreur lors de la publication des messages" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      published: count ?? ids.length,
      processed_at: now,
    });
  } catch (error) {
    console.error("Cron scheduled-messages error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export const GET = withErrorLogging("/api/cron/scheduled-messages", handler);
