import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    // ─── CSRF / Origin check ─────────────────────────────────
    const headersList = await headers();
    const origin = headersList.get("origin");
    const referer = headersList.get("referer");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const allowedOrigin = new URL(appUrl).origin;

    const requestOrigin = origin ?? (referer ? new URL(referer).origin : null);
    if (!requestOrigin || requestOrigin !== allowedOrigin) {
      return NextResponse.json(
        { error: "Forbidden: invalid origin" },
        { status: 403 },
      );
    }

    const { invite_code, email, apply_role } = await request.json();

    if (!invite_code && !email) {
      return NextResponse.json(
        { error: "Missing invite_code or email" },
        { status: 400 },
      );
    }

    // ─── Auth check: require authenticated user for role application ──
    const supabaseAuth = await createClient();
    const {
      data: { user: authUser },
    } = await supabaseAuth.auth.getUser();

    if (apply_role && !authUser) {
      return NextResponse.json(
        { error: "Authentication required to apply role" },
        { status: 401 },
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
      // Use the authenticated user if their email matches, otherwise find by email
      let targetUserId: string | null = null;

      if (authUser && authUser.email === invite.email) {
        targetUserId = authUser.id;
      }

      // If not matched, find user by email
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

        // ─── Auto-provisioning for clients ──────────────────────
        if (invite.role === "client") {
          try {
            // Find the least loaded coach (fewest active assignments)
            const { data: coaches } = await admin
              .from("profiles")
              .select("id, full_name")
              .eq("role", "coach");

            if (coaches && coaches.length > 0) {
              // Count active assignments per coach
              const { data: assignments } = await admin
                .from("coach_assignments")
                .select("coach_id")
                .eq("status", "active");

              const assignmentCounts: Record<string, number> = {};
              for (const a of assignments ?? []) {
                assignmentCounts[a.coach_id] = (assignmentCounts[a.coach_id] ?? 0) + 1;
              }

              // Pick the coach with fewest clients
              let leastLoadedCoach = coaches[0];
              let minCount = assignmentCounts[coaches[0].id] ?? 0;
              for (const coach of coaches) {
                const count = assignmentCounts[coach.id] ?? 0;
                if (count < minCount) {
                  minCount = count;
                  leastLoadedCoach = coach;
                }
              }

              // Create coach assignment
              await admin.from("coach_assignments").insert({
                coach_id: leastLoadedCoach.id,
                client_id: targetUserId,
                status: "active",
                assigned_by: leastLoadedCoach.id,
                assigned_at: new Date().toISOString(),
              });

              // Create CRM contact for the new client
              await admin.from("crm_contacts").insert({
                full_name: invite.full_name,
                email: invite.email,
                source: "invitation",
                stage: "client",
                assigned_to: leastLoadedCoach.id,
                converted_profile_id: targetUserId,
              });

              // Notify the assigned coach
              await admin.from("notifications").insert({
                recipient_id: leastLoadedCoach.id,
                title: "Nouveau client assigne",
                body: `Nouveau client assigne : ${invite.full_name}`,
                type: "info",
                action_url: `/coach/clients`,
              });
            }
          } catch (provisioningError) {
            // Log but don't fail the invitation acceptance
            console.error("[AcceptInvite] Auto-provisioning error:", provisioningError);
          }
        }
      }
    }

    return NextResponse.json({ success: true, role: invite.role });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    console.error("[AcceptInvite] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
