import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { invoiceSentEmail } from "@/lib/email/templates";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // Authorization: only admin/coach can send invoice emails
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || !["admin", "coach"].includes(profile.role)) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    const { data: invoice, error } = await supabase
      .from("invoices")
      .select(
        "*, client:profiles!invoices_client_id_fkey(id, full_name, email)",
      )
      .eq("id", id)
      .single();

    if (error || !invoice) {
      return NextResponse.json(
        { error: "Facture introuvable" },
        { status: 404 },
      );
    }

    if (!invoice.client?.email) {
      return NextResponse.json(
        { error: "Email client manquant" },
        { status: 400 },
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "https://off-market-amber.vercel.app";
    const formatEUR = (n: number) =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(n);
    const formatDate = (d: string | null) => {
      if (!d) return "-";
      return new Date(d).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    const { subject, html } = invoiceSentEmail({
      clientName: invoice.client.full_name ?? "Client",
      invoiceNumber: invoice.invoice_number,
      amount: formatEUR(Number(invoice.total)),
      dueDate: formatDate(invoice.due_date),
      payUrl: `${appUrl}/client/invoices`,
    });

    const result = await sendEmail({
      to: invoice.client.email,
      subject,
      html,
    });

    if (!result.success) {
      return NextResponse.json({ error: "Echec de l'envoi" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send invoice email error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
