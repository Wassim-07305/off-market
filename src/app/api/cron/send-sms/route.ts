import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSms } from "@/lib/twilio";

/**
 * Cron: envoie les SMS pending dont scheduled_at est passe.
 * Auth: CRON_SECRET header
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Recupere les SMS pending dont l'heure est passee
  const { data: pendingSms, error } = await supabase
    .from("sms_reminders")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(50);

  if (error) {
    console.error("[SMS Cron] Erreur fetch:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!pendingSms || pendingSms.length === 0) {
    return NextResponse.json({ sent: 0, message: "Aucun SMS a envoyer" });
  }

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const sms of pendingSms) {
    const result = await sendSms(sms.recipient_phone, sms.message);

    if (result.success) {
      // Marque comme envoye
      await supabase
        .from("sms_reminders")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("id", sms.id);
      sent++;
    } else {
      // Marque comme failed
      await supabase
        .from("sms_reminders")
        .update({
          status: "failed",
          error_message: result.error ?? "Erreur inconnue",
        })
        .eq("id", sms.id);
      failed++;
      errors.push(`${sms.id}: ${result.error}`);
    }
  }

  return NextResponse.json({
    sent,
    failed,
    total: pendingSms.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
