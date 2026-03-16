import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  // Verify admin
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  const { requestId } = await request.json();

  if (!requestId) {
    return NextResponse.json(
      { error: "requestId requis" },
      { status: 400 },
    );
  }

  // Fetch the offboarding request
  const { data: offboardReq, error: fetchError } = await supabase
    .from("offboarding_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (fetchError || !offboardReq) {
    return NextResponse.json(
      { error: "Demande introuvable" },
      { status: 404 },
    );
  }

  const req = offboardReq as {
    id: string;
    user_id: string;
    transfer_to_id: string | null;
    data_actions: {
      transfer_clients?: boolean;
      transfer_channels?: boolean;
      archive_messages?: boolean;
      export_data?: boolean;
    };
    status: string;
  };

  if (req.status === "completed") {
    return NextResponse.json(
      { error: "Offboarding deja traite" },
      { status: 400 },
    );
  }

  // Mark as in progress
  await supabase
    .from("offboarding_requests")
    .update({ status: "in_progress" } as never)
    .eq("id", requestId);

  const userId = req.user_id;
  const transferToId = req.transfer_to_id;
  const actions = req.data_actions;

  try {
    // 1. Transfer clients (student_details assigned_coach + client_assignments)
    if (actions.transfer_clients && transferToId) {
      await supabase
        .from("student_details")
        .update({ assigned_coach: transferToId } as never)
        .eq("assigned_coach", userId);

      await supabase
        .from("client_assignments")
        .update({ coach_id: transferToId } as never)
        .eq("coach_id", userId)
        .eq("status", "active");
    }

    // 2. Transfer channel ownership
    if (actions.transfer_channels && transferToId) {
      await supabase
        .from("channels")
        .update({ created_by: transferToId } as never)
        .eq("created_by", userId);

      // Update channel_members role to admin for the new owner
      const { data: ownedChannels } = await supabase
        .from("channels")
        .select("id")
        .eq("created_by", transferToId);

      if (ownedChannels && ownedChannels.length > 0) {
        const channelIds = ownedChannels.map((c) => c.id);
        // Ensure new owner is a member of transferred channels
        for (const cid of channelIds) {
          await supabase.from("channel_members").upsert(
            {
              channel_id: cid,
              profile_id: transferToId,
              role: "admin",
            } as never,
            { onConflict: "channel_id,profile_id" },
          );
        }
      }
    }

    // 3. Archive messages (soft delete)
    if (actions.archive_messages) {
      await supabase
        .from("messages")
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq("sender_id", userId)
        .is("deleted_at", null);
    }

    // 4. Export data (we store a flag — actual export is via the existing RGPD route)
    // The export_data flag is informational; the admin can download the user data
    // via the existing /api/account/export endpoint before processing.

    // 5. Deactivate user account
    await supabase
      .from("profiles")
      .update({
        is_archived: true,
        archived_at: new Date().toISOString(),
        archived_by: user.id,
      } as never)
      .eq("id", userId);

    // 6. Mark offboarding as completed
    await supabase
      .from("offboarding_requests")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      } as never)
      .eq("id", requestId);

    // 7. Audit log
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "user.offboard_complete",
      entity_type: "profile",
      entity_id: userId,
      details: {
        request_id: requestId,
        transfer_to: transferToId,
        data_actions: actions,
      },
      user_agent: request.headers.get("user-agent") ?? "",
    } as never);

    return NextResponse.json({ success: true });
  } catch (err) {
    // Revert status on failure
    await supabase
      .from("offboarding_requests")
      .update({ status: "pending" } as never)
      .eq("id", requestId);

    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
