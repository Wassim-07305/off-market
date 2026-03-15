import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const WHEREBY_API_KEY = process.env.WHEREBY_API_KEY ?? "";
const WHEREBY_API_URL = "https://api.whereby.dev/v1";

export async function POST(req: NextRequest) {
  try {
    // Verify auth via Supabase
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    if (!WHEREBY_API_KEY) {
      return NextResponse.json(
        { error: "WHEREBY_API_KEY non configuree" },
        { status: 500 },
      );
    }

    const body = await req.json();
    const { callId, callTitle, endDate } = body;

    if (!callId) {
      return NextResponse.json(
        { error: "callId requis" },
        { status: 400 },
      );
    }

    // Create a Whereby meeting room
    const endDateTime = endDate
      ? new Date(endDate).toISOString()
      : new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(); // 4h from now

    const response = await fetch(`${WHEREBY_API_URL}/meetings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHEREBY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endDate: endDateTime,
        roomNamePrefix: callId.slice(0, 8),
        roomNamePattern: "human-short",
        roomMode: "group",
        fields: ["hostRoomUrl"],
        templateType: "viewerMode",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Whereby API error:", errorText);
      return NextResponse.json(
        { error: "Erreur lors de la creation de la room Whereby" },
        { status: response.status },
      );
    }

    const meeting = await response.json();

    // Store room URL in call_calendar
    await supabase
      .from("call_calendar")
      .update({
        whereby_room_url: meeting.roomUrl,
        whereby_host_url: meeting.hostRoomUrl,
        whereby_meeting_id: meeting.meetingId,
      })
      .eq("id", callId);

    return NextResponse.json({
      roomUrl: meeting.roomUrl,
      hostRoomUrl: meeting.hostRoomUrl,
      meetingId: meeting.meetingId,
    });
  } catch (error) {
    console.error("Whereby room creation error:", error);
    return NextResponse.json(
      { error: "Erreur interne" },
      { status: 500 },
    );
  }
}
