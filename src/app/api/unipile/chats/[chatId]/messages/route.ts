import { NextRequest, NextResponse } from "next/server";

const UNIPILE_BASE = "https://api33.unipile.com:16338/api/v1";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const apiKey = process.env.UNIPILE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "UNIPILE_API_KEY non configure" },
      { status: 500 },
    );
  }

  const { chatId } = await params;
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") ?? "50";

  try {
    const url = `${UNIPILE_BASE}/chats/${encodeURIComponent(chatId)}/messages?limit=${encodeURIComponent(limit)}`;
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
    console.error("Unipile messages error:", error);
    return NextResponse.json(
      { error: "Erreur de connexion a Unipile" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const apiKey = process.env.UNIPILE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "UNIPILE_API_KEY non configure" },
      { status: 500 },
    );
  }

  const { chatId } = await params;

  try {
    const body = await request.json();

    const res = await fetch(
      `${UNIPILE_BASE}/chats/${encodeURIComponent(chatId)}/messages`,
      {
        method: "POST",
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: body.text }),
      },
    );

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
    console.error("Unipile send message error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 },
    );
  }
}
