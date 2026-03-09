import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { invitationEmail } from "@/lib/email/templates";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { inviteId } = await req.json();
    if (!inviteId) {
      return NextResponse.json({ error: "ID invitation requis" }, { status: 400 });
    }

    // Fetch invite details
    const { data: invite, error } = await supabase
      .from("user_invites")
      .select("*")
      .eq("id", inviteId)
      .single();

    if (error || !invite) {
      return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 });
    }

    // Get inviter name
    const { data: inviter } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", invite.invited_by)
      .single();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const { subject, html } = invitationEmail({
      inviterName: inviter?.full_name ?? "Off-Market",
      role: invite.role,
      inviteUrl: `${appUrl}/auth/callback?invite=${invite.invite_code}`,
    });

    const result = await sendEmail({
      to: invite.email,
      subject,
      html,
    });

    if (!result.success) {
      return NextResponse.json({ error: "Echec de l'envoi" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send invitation email error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
