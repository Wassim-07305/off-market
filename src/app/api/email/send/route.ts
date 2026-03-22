import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { resolveTemplate, type TemplateName } from "@/lib/email-templates";

export async function POST(request: Request) {
  try {
    // ─── Auth check ──────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 },
      );
    }

    // Verify role (admin or coach only)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "coach"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Acces refuse : role admin ou coach requis" },
        { status: 403 },
      );
    }

    // ─── Parse body ──────────────────────────────────────────────
    const body = await request.json();
    const { to, template, data } = body as {
      to: string | string[];
      template: TemplateName;
      data: Record<string, unknown>;
    };

    if (!to || !template || !data) {
      return NextResponse.json(
        { error: "Champs requis : to, template, data" },
        { status: 400 },
      );
    }

    // ─── Resolve template & send ─────────────────────────────────
    const { subject, html } = resolveTemplate(template, data);
    const result = await sendEmail({ to, subject, html });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Erreur lors de l'envoi" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    console.error("[API Email Send] Erreur:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
