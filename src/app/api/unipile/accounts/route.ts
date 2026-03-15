import { NextResponse } from "next/server";

const UNIPILE_BASE = "https://api33.unipile.com:16338/api/v1";

export async function GET() {
  const apiKey = process.env.UNIPILE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "UNIPILE_API_KEY non configure" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`${UNIPILE_BASE}/accounts`, {
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
    console.error("Unipile accounts error:", error);
    return NextResponse.json(
      { error: "Erreur de connexion a Unipile" },
      { status: 500 },
    );
  }
}
