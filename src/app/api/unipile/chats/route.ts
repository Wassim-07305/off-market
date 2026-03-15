import { NextRequest, NextResponse } from "next/server";

const UNIPILE_BASE = "https://api33.unipile.com:16338/api/v1";

export async function GET(request: NextRequest) {
  const apiKey = process.env.UNIPILE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "UNIPILE_API_KEY non configure" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("account_id");
  const limit = searchParams.get("limit") ?? "20";

  if (!accountId) {
    return NextResponse.json(
      { error: "account_id requis" },
      { status: 400 },
    );
  }

  try {
    const url = `${UNIPILE_BASE}/chats?account_id=${encodeURIComponent(accountId)}&limit=${encodeURIComponent(limit)}`;
    const res = await fetch(url, {
      headers: { "X-API-KEY": apiKey },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Unipile error: ${res.status} — ${text}` },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Unipile chats error:", error);
    return NextResponse.json(
      { error: "Erreur de connexion a Unipile" },
      { status: 500 },
    );
  }
}
