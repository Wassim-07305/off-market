import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email";

const schema = z.object({
  prospect_name: z.string().min(1),
  prospect_email: z.string().email(),
  date: z.string(),
  start_time: z.string(),
  end_time: z.string().optional(),
  coach_name: z.string().optional(),
  page_title: z.string().optional(),
});

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buildConfirmationEmail(params: {
  name: string;
  date: string;
  time: string;
  endTime?: string;
  coachName?: string;
  pageTitle?: string;
}): string {
  const timeRange = params.endTime
    ? `${params.time} - ${params.endTime}`
    : params.time;

  return `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #e4e4e7; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto;">
    <h1 style="font-size: 24px; color: #fff; margin-bottom: 8px;">Rendez-vous confirme</h1>
    <p style="color: #a1a1aa; line-height: 1.6;">
      Bonjour ${params.name}, votre rendez-vous est bien confirme.
    </p>

    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin: 24px 0;">
      ${params.pageTitle ? `<p style="color: #a1a1aa; font-size: 13px; margin: 0 0 12px;">
        <strong style="color: #fff;">${params.pageTitle}</strong>
      </p>` : ""}
      <p style="color: #fff; font-size: 15px; margin: 0 0 8px;">
        📅 ${formatDate(params.date)}
      </p>
      <p style="color: #fff; font-size: 15px; margin: 0 0 8px;">
        🕐 ${timeRange}
      </p>
      ${params.coachName ? `<p style="color: #a1a1aa; font-size: 14px; margin: 0;">
        Avec ${params.coachName}
      </p>` : ""}
    </div>

    <p style="color: #a1a1aa; font-size: 13px; line-height: 1.5;">
      Un rappel vous sera envoye la veille et 1h avant le rendez-vous. Si vous devez annuler, merci de nous prevenir au plus tot.
    </p>

    <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;" />
    <p style="color: #52525b; font-size: 12px;">Off Market — Programme d'accompagnement freelance</p>
  </div>
</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Donnees invalides" },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const result = await sendEmail({
      to: data.prospect_email,
      subject: `Rendez-vous confirme — ${formatDate(data.date)} a ${data.start_time}`,
      html: buildConfirmationEmail({
        name: data.prospect_name,
        date: data.date,
        time: data.start_time,
        endTime: data.end_time,
        coachName: data.coach_name,
        pageTitle: data.page_title,
      }),
    });

    return NextResponse.json({ success: result.success, id: result.id });
  } catch (err) {
    console.error("Booking confirmation email error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
