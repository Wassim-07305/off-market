import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const UNIPILE_BASE =
  process.env.UNIPILE_BASE_URL ?? "https://api33.unipile.com:16338";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ attendeeId: string }> },
) {
  // Auth check — admin/coach only
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "coach"].includes(profile.role)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const apiKey = process.env.UNIPILE_API_KEY;
  if (!apiKey) {
    return new NextResponse("UNIPILE_API_KEY not configured", { status: 500 });
  }

  const { attendeeId } = await params;

  try {
    const url = `${UNIPILE_BASE}/api/v1/chat_attendees/${encodeURIComponent(attendeeId)}/picture`;
    const res = await fetch(url, {
      headers: { "X-API-KEY": apiKey },
    });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
