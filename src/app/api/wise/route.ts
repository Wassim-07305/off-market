import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Wise (TransferWise) API integration for international payments
// Requires: WISE_API_KEY and WISE_PROFILE_ID in environment

const WISE_API_URL =
  process.env.WISE_SANDBOX === "true"
    ? "https://api.sandbox.transferwise.tech"
    : "https://api.transferwise.com";

async function wiseRequest(path: string, options: RequestInit = {}) {
  const apiKey = process.env.WISE_API_KEY;
  if (!apiKey) throw new Error("WISE_API_KEY non configure");

  const res = await fetch(`${WISE_API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Wise API error: ${res.status}`);
  }

  return res.json();
}

// GET /api/wise — Get balance + recent transfers
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin")
    return NextResponse.json({ error: "Admin requis" }, { status: 403 });

  const profileId = process.env.WISE_PROFILE_ID;
  if (!profileId || !process.env.WISE_API_KEY) {
    return NextResponse.json({ error: "Wise non configure" }, { status: 503 });
  }

  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "balance";

    if (action === "balance") {
      const balances = await wiseRequest(
        `/v4/profiles/${profileId}/balances?types=STANDARD`,
      );
      return NextResponse.json({ balances });
    }

    if (action === "transfers") {
      const limit = url.searchParams.get("limit") || "20";
      const transfers = await wiseRequest(
        `/v1/transfers?profile=${profileId}&limit=${limit}&offset=0`,
      );
      return NextResponse.json({ transfers });
    }

    if (action === "rates") {
      const source = url.searchParams.get("source") || "EUR";
      const target = url.searchParams.get("target") || "USD";
      const rates = await wiseRequest(
        `/v1/rates?source=${source}&target=${target}`,
      );
      return NextResponse.json({ rates });
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (error) {
    console.error("Wise API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur Wise" },
      { status: 500 },
    );
  }
}

// POST /api/wise — Create a transfer quote or transfer
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin")
    return NextResponse.json({ error: "Admin requis" }, { status: 403 });

  const profileId = process.env.WISE_PROFILE_ID;
  if (!profileId || !process.env.WISE_API_KEY) {
    return NextResponse.json({ error: "Wise non configure" }, { status: 503 });
  }

  const body = await request.json();
  const { action } = body;

  try {
    // Step 1: Create a quote
    if (action === "quote") {
      const { sourceCurrency, targetCurrency, sourceAmount, targetAmount } =
        body;

      const quote = await wiseRequest("/v3/profiles/" + profileId + "/quotes", {
        method: "POST",
        body: JSON.stringify({
          sourceCurrency: sourceCurrency || "EUR",
          targetCurrency: targetCurrency || "USD",
          sourceAmount: sourceAmount || undefined,
          targetAmount: targetAmount || undefined,
        }),
      });

      return NextResponse.json({ quote });
    }

    // Step 2: Create a recipient
    if (action === "recipient") {
      const { accountHolderName, currency, type, details } = body;

      const recipient = await wiseRequest("/v1/accounts", {
        method: "POST",
        body: JSON.stringify({
          profile: parseInt(profileId),
          accountHolderName,
          currency: currency || "USD",
          type: type || "email",
          details,
        }),
      });

      return NextResponse.json({ recipient });
    }

    // Step 3: Create a transfer
    if (action === "transfer") {
      const { targetAccount, quoteUuid, reference } = body;

      const transfer = await wiseRequest("/v1/transfers", {
        method: "POST",
        body: JSON.stringify({
          targetAccount,
          quoteUuid,
          customerTransactionId: crypto.randomUUID(),
          details: { reference: reference || "Off-Market payment" },
        }),
      });

      // Log in invoices if invoice_id provided
      if (body.invoiceId) {
        await supabase
          .from("invoices")
          .update({
            payment_method: "wise",
            status: "paid",
            paid_at: new Date().toISOString(),
          })
          .eq("id", body.invoiceId);
      }

      return NextResponse.json({ transfer });
    }

    // Step 4: Fund a transfer
    if (action === "fund") {
      const { transferId } = body;

      const funding = await wiseRequest(
        `/v3/profiles/${profileId}/transfers/${transferId}/payments`,
        {
          method: "POST",
          body: JSON.stringify({ type: "BALANCE" }),
        },
      );

      return NextResponse.json({ funding });
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (error) {
    console.error("Wise API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur Wise" },
      { status: 500 },
    );
  }
}
