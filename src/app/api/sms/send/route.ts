import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // Admin-only check
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Acces reserve aux administrateurs" },
        { status: 403 },
      );
    }

    const { to, message, reminderId } = await req.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: "Numero de telephone et message requis" },
        { status: 400 },
      );
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json(
        { error: "Configuration Twilio manquante" },
        { status: 500 },
      );
    }

    // Send SMS via Twilio REST API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString(
      "base64",
    );

    const body = new URLSearchParams({
      To: to,
      From: fromNumber,
      Body: message,
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

    if (!twilioResponse.ok) {
      const errorMsg =
        twilioData.message ?? "Erreur lors de l'envoi du SMS";

      // Update reminder status to failed if reminderId provided
      if (reminderId) {
        await supabase
          .from("sms_reminders")
          .update({
            status: "failed",
            error_message: errorMsg,
          })
          .eq("id", reminderId);
      }

      return NextResponse.json({ error: errorMsg }, { status: 502 });
    }

    // Update reminder status to sent if reminderId provided
    if (reminderId) {
      await supabase
        .from("sms_reminders")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("id", reminderId);
    }

    return NextResponse.json({
      success: true,
      sid: twilioData.sid,
    });
  } catch (err) {
    console.error("SMS send error:", err);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
