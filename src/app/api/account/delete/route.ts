import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const userId = body.userId ?? user.id;

    // Only allow deleting your own account (unless admin)
    if (userId !== user.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "admin") {
        return NextResponse.json({ error: "Non autorise" }, { status: 403 });
      }
    }

    const admin = createAdminClient();

    // Use server-side function that handles all FK cleanup
    const { error: rpcError } = await admin.rpc("delete_user_account", {
      target_user_id: userId,
    });

    if (rpcError) {
      console.error("[DeleteAccount] RPC error:", rpcError.message);
      return NextResponse.json(
        { error: rpcError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[DeleteAccount] Unexpected error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
