import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  const now = new Date().toISOString();

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return NextResponse.json(
      { error: "Configuration Twilio manquante" },
      { status: 500 },
    );
  }

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString(
    "base64",
  );

  // Fetch pending reminders that are due
  const { data: pendingReminders, error: fetchError } = await supabase
    .from("sms_reminders")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_at", now)
    .order("scheduled_at", { ascending: true })
    .limit(50);

  if (fetchError) {
    console.error("Error fetching pending SMS reminders:", fetchError);
    return NextResponse.json(
      { error: "Erreur lors de la recuperation des rappels" },
      { status: 500 },
    );
  }

  if (!pendingReminders?.length) {
    return NextResponse.json({
      success: true,
      processed: 0,
      sent: 0,
      failed: 0,
    });
  }

  let sent = 0;
  let failed = 0;

  for (const reminder of pendingReminders) {
    try {
      const body = new URLSearchParams({
        To: reminder.recipient_phone,
        From: fromNumber,
        Body: reminder.message,
      });

      const twilioResponse = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      const twilioData = await twilioResponse.json();

      if (twilioResponse.ok) {
        await supabase
          .from("sms_reminders")
          .update({
            status: "sent",
            sent_at: now,
          })
          .eq("id", reminder.id);
        sent++;
      } else {
        const errorMsg =
          twilioData.message ?? "Erreur Twilio inconnue";
        await supabase
          .from("sms_reminders")
          .update({
            status: "failed",
            error_message: errorMsg,
          })
          .eq("id", reminder.id);
        failed++;
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erreur inconnue";
      await supabase
        .from("sms_reminders")
        .update({
          status: "failed",
          error_message: errorMsg,
        })
        .eq("id", reminder.id);
      failed++;
    }
  }

  return NextResponse.json({
    success: true,
    processed: pendingReminders.length,
    sent,
    failed,
    processed_at: now,
  });
}
