import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { invite_code, email, apply_role } = await request.json();

    if (!invite_code && !email) {
      return NextResponse.json(
        { error: "Missing invite_code or email" },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    // 1. Find the pending invitation
    let findQuery = admin
      .from("user_invites")
      .select("id, email, role, full_name, specialties")
      .eq("status", "pending");

    if (invite_code) {
      findQuery = findQuery.eq("invite_code", invite_code);
    } else {
      findQuery = findQuery.eq("email", email);
    }

    const { data: invite } = await findQuery.maybeSingle();

    if (!invite) {
      return NextResponse.json(
        { error: "Invitation not found or already used" },
        { status: 404 },
      );
    }

    // 2. Mark invitation as accepted
    await admin
      .from("user_invites")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

    // 3. Apply role to the user's profile
    if (apply_role) {
      // Try to get the authenticated user first
      let targetUserId: string | null = null;

      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && user.email === invite.email) {
          targetUserId = user.id;
        }
      } catch {
        // Not authenticated — find user by email via admin
      }

      // If not authenticated, find user by email
      if (!targetUserId) {
        const { data: profile } = await admin
          .from("profiles")
          .select("id")
          .eq("email", invite.email)
          .maybeSingle();
        targetUserId = profile?.id ?? null;
      }

      if (targetUserId) {
        const skipOnboarding = !["client", "prospect"].includes(invite.role);
        const specialties = (invite as Record<string, unknown>).specialties as string[] | null;

        // Upsert: create profile if trigger didn't, or update if it did
        await admin.from("profiles").upsert(
          {
            id: targetUserId,
            email: invite.email,
            full_name: invite.full_name,
            role: invite.role,
            onboarding_completed: skipOnboarding,
            ...(specialties?.length ? { specialties } : {}),
          },
          { onConflict: "id" },
        );
      }
    }

    return NextResponse.json({ success: true, role: invite.role });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    console.error("[AcceptInvite] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
