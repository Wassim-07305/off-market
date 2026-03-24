import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { withErrorLogging } from "@/lib/error-logger-server";

const schema = z.object({
  full_name: z.string().min(2).max(200),
  email: z.string().email().max(320),
  phone: z.string().max(30).optional().default(""),
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function buildMagicLinkEmail(name: string, link: string): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #e4e4e7; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto;">
    <h1 style="font-size: 24px; color: #fff; margin-bottom: 8px;">Bienvenue ${name} !</h1>
    <p style="color: #a1a1aa; line-height: 1.6;">
      Ton mini-challenge de 5 jours est pret. Clique sur le bouton ci-dessous pour te connecter et commencer le Jour 1.
    </p>
    <div style="margin: 32px 0; text-align: center;">
      <a href="${link}" style="display: inline-block; background: #dc2626; color: #fff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
        Commencer le challenge
      </a>
    </div>
    <p style="color: #71717a; font-size: 13px; line-height: 1.5;">
      Ce lien est valable 24 heures. Si tu n'as pas demande cet acces, ignore cet email.
    </p>
    <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;" />
    <p style="color: #52525b; font-size: 12px;">Off Market — Programme d'accompagnement freelance</p>
  </div>
</body>
</html>`;
}

async function postHandler(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Donnees invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { full_name, email, phone } = parsed.data;
    const admin = createAdminClient();

    // 1. Check if auth user already exists
    const { data: existingUsers } = await admin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );

    if (existingUser) {
      // User already exists — generate magic link via admin API (no rate limit)
      const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: {
          redirectTo: `${APP_URL}/client/challenges`,
        },
      });

      if (linkError || !linkData?.properties?.action_link) {
        console.error("Generate link error (existing):", linkError);
        return NextResponse.json(
          { error: "Erreur lors de l'envoi du lien" },
          { status: 500 },
        );
      }

      // Send via Resend (bypasses Supabase email rate limits)
      await sendEmail({
        to: email,
        subject: "Ton lien de connexion — Mini-Challenge 5 jours",
        html: buildMagicLinkEmail(
          existingUser.user_metadata?.full_name || full_name,
          linkData.properties.action_link,
        ),
      });

      return NextResponse.json({ success: true, existing: true }, { status: 200 });
    }

    // 2. Create new auth user with a temp password + email confirmed
    const tempPassword = `OM_prospect_${crypto.randomUUID().slice(0, 16)}!`;
    const { data: newUser, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name },
      });

    if (createError) {
      console.error("Create user error:", createError);
      return NextResponse.json(
        { error: "Erreur lors de la creation du compte" },
        { status: 500 },
      );
    }

    if (!newUser.user) {
      return NextResponse.json(
        { error: "Erreur lors de la creation du compte" },
        { status: 500 },
      );
    }

    // 3. Set profile to prospect role
    await admin
      .from("profiles")
      .update({
        full_name,
        phone: phone || null,
        role: "prospect",
        onboarding_completed: true,
      })
      .eq("id", newUser.user.id);

    // 4. Create lead in crm_contacts
    await admin.from("crm_contacts").upsert(
      {
        full_name,
        email,
        phone: phone || null,
        source: "mini_challenge",
        stage: "prospect",
        lead_score: 30,
        qualification_score: 30,
        revenue_range: "less_5k",
        goals: "Mini-challenge 5 jours",
        tags: ["mini_challenge"],
        captured_at: new Date().toISOString(),
      },
      { onConflict: "email" },
    );

    // 5. Generate magic link via admin API (no rate limit) + send via Resend
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: `${APP_URL}/client/challenges`,
      },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("Generate link error (new user):", linkError);
      // User created but magic link failed — they can use forgot-password
    } else {
      await sendEmail({
        to: email,
        subject: "Bienvenue ! Ton Mini-Challenge 5 jours commence",
        html: buildMagicLinkEmail(full_name, linkData.properties.action_link),
      });
    }

    return NextResponse.json(
      { success: true, userId: newUser.user.id },
      { status: 201 },
    );
  } catch (err) {
    console.error("Mini-challenge signup error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export const POST = withErrorLogging("/api/leads/mini-challenge", postHandler);
