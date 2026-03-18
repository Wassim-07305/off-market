import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email/send";

// Cron-compatible endpoint that processes pending relance steps.
// Finds all active enrollments where next_step_at <= now(), sends the
// next step, advances the enrollment, and auto-cancels when applicable.

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://off-market-amber.vercel.app";

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/** Replace {{variable}} placeholders with contact data */
function interpolateContent(
  template: string,
  contact: {
    full_name: string;
    company: string | null;
    stage: string;
    estimated_value: number;
    last_contact_at: string | null;
  },
): string {
  const firstName = contact.full_name?.split(" ")[0] ?? "";
  const daysSinceContact = contact.last_contact_at
    ? Math.floor(
        (Date.now() - new Date(contact.last_contact_at).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  const formatEUR = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(n);

  const stageLabels: Record<string, string> = {
    prospect: "Prospect",
    qualifie: "Qualifie",
    proposition: "Proposition",
    closing: "Closing",
    client: "Client",
    perdu: "Perdu",
  };

  return template
    .replace(/\{\{prenom\}\}/g, firstName)
    .replace(/\{\{entreprise\}\}/g, contact.company ?? "")
    .replace(/\{\{etape\}\}/g, stageLabels[contact.stage] ?? contact.stage)
    .replace(/\{\{valeur\}\}/g, formatEUR(contact.estimated_value))
    .replace(/\{\{jours_sans_contact\}\}/g, String(daysSinceContact));
}

export async function POST(request: Request) {
  // ─── Auth: cron secret OR admin/coach role ─────────────
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  let authenticated = false;

  // Check cron secret
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    authenticated = true;
  }

  // Fallback: check user role via Supabase auth
  if (!authenticated && authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser(token);

    if (user) {
      const adminSb = getAdminSupabase();
      const { data: role } = await adminSb
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "coach"])
        .maybeSingle();

      if (role) authenticated = true;
    }
  }

  if (!authenticated) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  const now = new Date().toISOString();

  const results = {
    processed: 0,
    sent: 0,
    completed: 0,
    cancelled: 0,
    errors: 0,
  };

  // ═══════════════════════════════════════
  // 1. Find active enrollments due for processing
  // ═══════════════════════════════════════
  const { data: dueEnrollments, error: fetchError } = await supabase
    .from("relance_enrollments")
    .select("id, contact_id, sequence_id, current_step, status")
    .eq("status", "active")
    .lte("next_step_at", now)
    .limit(100);

  if (fetchError) {
    console.error("Error fetching due enrollments:", fetchError);
    return NextResponse.json(
      { error: "Erreur lors de la recuperation des inscriptions" },
      { status: 500 },
    );
  }

  if (!dueEnrollments?.length) {
    return NextResponse.json({
      success: true,
      message: "Aucune relance a traiter",
      ...results,
      processed_at: now,
    });
  }

  for (const enrollment of dueEnrollments) {
    try {
      results.processed++;

      // ─── Get the contact ───────────────────
      const { data: contact } = await supabase
        .from("crm_contacts")
        .select(
          "id, full_name, email, phone, company, stage, estimated_value, last_contact_at",
        )
        .eq("id", enrollment.contact_id)
        .single();

      if (!contact) {
        // Contact deleted, cancel enrollment
        await supabase
          .from("relance_enrollments")
          .update({ status: "cancelled" })
          .eq("id", enrollment.id);
        results.cancelled++;
        continue;
      }

      // ─── Auto-cancel if contact moved to client/perdu ───
      if (contact.stage === "client" || contact.stage === "perdu") {
        await supabase
          .from("relance_enrollments")
          .update({ status: "cancelled" })
          .eq("id", enrollment.id);
        results.cancelled++;
        continue;
      }

      // ─── Get the next step ─────────────────
      const nextStepOrder = enrollment.current_step + 1;
      const { data: step } = await supabase
        .from("relance_steps")
        .select("*")
        .eq("sequence_id", enrollment.sequence_id)
        .eq("step_order", nextStepOrder)
        .eq("is_active", true)
        .single();

      if (!step) {
        // No more steps, mark as completed
        await supabase
          .from("relance_enrollments")
          .update({ status: "completed", completed_at: now })
          .eq("id", enrollment.id);
        results.completed++;
        continue;
      }

      // ─── Interpolate content ───────────────
      const interpolatedContent = interpolateContent(step.content, contact);
      const interpolatedSubject = step.subject
        ? interpolateContent(step.subject, contact)
        : null;

      // ─── Send based on channel ─────────────
      let sendStatus: "sent" | "failed" = "sent";
      const metadata: Record<string, unknown> = {};

      switch (step.channel) {
        case "email":
          if (contact.email) {
            const result = await sendEmail({
              to: contact.email,
              subject: interpolatedSubject ?? "Relance Off-Market",
              html: interpolatedContent,
            });
            if (!result.success) {
              sendStatus = "failed";
              metadata.error = result.error;
            } else {
              metadata.email_id = result.id;
            }
          } else {
            sendStatus = "failed";
            metadata.error = "Pas d'email pour ce contact";
          }
          break;

        case "notification":
          // Create an in-app notification for the assigned user
          if (contact.stage) {
            const { data: assigned } = await supabase
              .from("crm_contacts")
              .select("assigned_to")
              .eq("id", contact.id)
              .single();

            if (assigned?.assigned_to) {
              await supabase.from("notifications").insert({
                user_id: assigned.assigned_to,
                type: "relance",
                title: `Relance: ${contact.full_name}`,
                message: interpolatedContent.slice(0, 200),
                link: `/pipeline?contact=${contact.id}`,
              });
            }
          }
          break;

        case "sms":
          // SMS sending would be integrated here (Twilio, etc.)
          metadata.note = "SMS non configure — notification creee en fallback";
          // Fallback to notification
          const { data: smsAssigned } = await supabase
            .from("crm_contacts")
            .select("assigned_to")
            .eq("id", contact.id)
            .single();

          if (smsAssigned?.assigned_to) {
            await supabase.from("notifications").insert({
              user_id: smsAssigned.assigned_to,
              type: "relance",
              title: `Relance SMS: ${contact.full_name}`,
              message: interpolatedContent.slice(0, 200),
              link: `/pipeline?contact=${contact.id}`,
            });
          }
          break;
      }

      // ─── Log the send ──────────────────────
      await supabase.from("relance_logs").insert({
        enrollment_id: enrollment.id,
        step_id: step.id,
        channel: step.channel,
        content: interpolatedContent,
        status: sendStatus,
        metadata,
      });

      if (sendStatus === "sent") {
        results.sent++;
      } else {
        results.errors++;
      }

      // ─── Calculate next step timing ────────
      const { data: nextStep } = await supabase
        .from("relance_steps")
        .select("delay_days")
        .eq("sequence_id", enrollment.sequence_id)
        .eq("step_order", nextStepOrder + 1)
        .eq("is_active", true)
        .maybeSingle();

      const nextStepAt = nextStep
        ? new Date(
            Date.now() + nextStep.delay_days * 24 * 60 * 60 * 1000,
          ).toISOString()
        : null;

      // ─── Advance enrollment ────────────────
      if (nextStep) {
        await supabase
          .from("relance_enrollments")
          .update({
            current_step: nextStepOrder,
            next_step_at: nextStepAt,
          })
          .eq("id", enrollment.id);
      } else {
        // This was the last step
        await supabase
          .from("relance_enrollments")
          .update({
            current_step: nextStepOrder,
            status: "completed",
            completed_at: now,
            next_step_at: null,
          })
          .eq("id", enrollment.id);
        results.completed++;
      }

      // ─── Update contact last_contact_at ────
      await supabase
        .from("crm_contacts")
        .update({ last_contact_at: now })
        .eq("id", contact.id);
    } catch (err) {
      console.error(`Error processing enrollment ${enrollment.id}:`, err);
      results.errors++;
    }
  }

  return NextResponse.json({
    success: true,
    ...results,
    processed_at: now,
  });
}
