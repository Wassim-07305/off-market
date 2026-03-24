import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  full_name: z.string().min(2).max(200),
  email: z.string().email().max(320),
  phone: z.string().max(30).optional().default(""),
});

export async function POST(request: Request) {
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
      // User already exists — just send magic link
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/client/challenges`,
        },
      });

      // Also send the OTP email the user will actually receive
      // generateLink returns a token but doesn't send the email,
      // so we use signInWithOtp from a separate client to trigger the email
      const { error: otpError } = await admin.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/client/challenges`,
        },
      });

      if (otpError) {
        console.error("Magic link error (existing user):", otpError);
      }

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
        onboarding_completed: true, // skip onboarding for mini-challenge
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

    // 5. Send magic link so the prospect can log in without a password
    const { error: otpError } = await admin.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/client/challenges`,
      },
    });

    if (otpError) {
      console.error("Magic link send error:", otpError);
      // Don't fail — user was created, they can use forgot-password as fallback
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
