import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { invite_code, email } = await request.json();

    if (!invite_code && !email) {
      return NextResponse.json(
        { error: "Missing invite_code or email" },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    // Update by invite_code or by email
    let query = admin.from("user_invites").update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
    });

    if (invite_code) {
      query = query.eq("invite_code", invite_code);
    } else {
      query = query.eq("email", email);
    }

    const { error } = await query.eq("status", "pending");

    if (error) {
      console.error("[AcceptInvite] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
