import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cron job for automatic contract renewal:
// 1. Send reminder notifications for contracts approaching end_date
// 2. Auto-renew contracts on expiry
// 3. Mark expired contracts that are not set to auto-renew

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  const today = new Date().toISOString().split("T")[0];

  const results = {
    reminders_sent: 0,
    auto_renewed: 0,
    expired_marked: 0,
  };

  // ═══════════════════════════════════════
  // 1. Send reminders for contracts within notice period
  // ═══════════════════════════════════════
  try {
    // Fetch contracts with auto_renew that have an upcoming end_date
    const { data: contractsForReminder } = await supabase
      .from("contracts")
      .select("id, client_id, title, end_date, renewal_notice_days, auto_renew")
      .eq("auto_renew", true)
      .in("status", ["signed", "active"])
      .is("renewal_status", null)
      .not("end_date", "is", null);

    if (contractsForReminder?.length) {
      for (const contract of contractsForReminder) {
        if (!contract.end_date) continue;

        const endDate = new Date(contract.end_date);
        const noticeDays = contract.renewal_notice_days ?? 30;
        const noticeDate = new Date(endDate);
        noticeDate.setDate(noticeDate.getDate() - noticeDays);
        const noticeDateStr = noticeDate.toISOString().split("T")[0];

        // Check if today is the notice date (send reminder once)
        if (noticeDateStr !== today) continue;

        // Check if we already sent a reminder for this contract
        const { data: existingLog } = await supabase
          .from("contract_renewal_logs")
          .select("id")
          .eq("contract_id", contract.id)
          .eq("action", "reminder_sent")
          .limit(1);

        if (existingLog && existingLog.length > 0) continue;

        // Send notification to admin/contract owner
        await supabase.from("notifications").insert({
          recipient_id: contract.client_id,
          type: "contract_renewal_reminder",
          title: "Renouvellement de contrat",
          body: `Votre contrat "${contract.title}" sera renouvele automatiquement le ${contract.end_date}.`,
          category: "billing",
          data: {
            contract_id: contract.id,
            end_date: contract.end_date,
            action: "renewal_reminder",
          },
        });

        // Log the reminder
        await supabase.from("contract_renewal_logs").insert({
          contract_id: contract.id,
          action: "reminder_sent",
          details: {
            notice_days: noticeDays,
            end_date: contract.end_date,
            sent_to: contract.client_id,
          },
        });

        results.reminders_sent++;
      }
    }
  } catch (err) {
    console.error("Renewal reminders error:", err);
  }

  // ═══════════════════════════════════════
  // 2. Auto-renew expired contracts with auto_renew = true
  // ═══════════════════════════════════════
  try {
    const { data: contractsToRenew } = await supabase
      .from("contracts")
      .select("*")
      .eq("auto_renew", true)
      .in("status", ["signed", "active"])
      .is("renewal_status", null)
      .lte("end_date", today);

    if (contractsToRenew?.length) {
      for (const contract of contractsToRenew) {
        const periodMonths = contract.renewal_period_months ?? 12;
        const newStartDate = contract.end_date ?? today;
        const newEndDate = new Date(newStartDate);
        newEndDate.setMonth(newEndDate.getMonth() + periodMonths);

        // Create renewed contract
        const { data: renewed, error: createError } = await supabase
          .from("contracts")
          .insert({
            template_id: contract.template_id,
            client_id: contract.client_id,
            title: `${contract.title} (Renouvellement)`,
            content: contract.content,
            created_by: contract.created_by,
            status: "draft",
            amount: contract.amount,
            start_date: newStartDate,
            end_date: newEndDate.toISOString().split("T")[0],
            renewed_from_id: contract.id,
            auto_renew: true,
            renewal_period_months: periodMonths,
            renewal_notice_days: contract.renewal_notice_days ?? 30,
          })
          .select("id")
          .single();

        if (createError || !renewed) {
          console.error("Failed to renew contract:", contract.id, createError);
          continue;
        }

        // Mark original as renewed
        await supabase
          .from("contracts")
          .update({
            renewal_status: "renewed",
            renewed_to: renewed.id,
          })
          .eq("id", contract.id);

        // Log the renewal
        await supabase.from("contract_renewal_logs").insert({
          contract_id: contract.id,
          action: "auto_renewed",
          details: {
            new_contract_id: renewed.id,
            period_months: periodMonths,
            new_start_date: newStartDate,
            new_end_date: newEndDate.toISOString().split("T")[0],
          },
        });

        // Notify client
        await supabase.from("notifications").insert({
          recipient_id: contract.client_id,
          type: "contract_renewed",
          title: "Contrat renouvele",
          body: `Votre contrat "${contract.title}" a ete renouvele automatiquement.`,
          category: "billing",
          data: {
            old_contract_id: contract.id,
            new_contract_id: renewed.id,
          },
        });

        results.auto_renewed++;
      }
    }
  } catch (err) {
    console.error("Auto-renewal error:", err);
  }

  // ═══════════════════════════════════════
  // 3. Mark contracts without auto_renew as expired
  // ═══════════════════════════════════════
  try {
    const { data: expiredContracts } = await supabase
      .from("contracts")
      .select("id, client_id, title")
      .eq("auto_renew", false)
      .in("status", ["signed", "active"])
      .is("renewal_status", null)
      .lte("end_date", today);

    if (expiredContracts?.length) {
      for (const contract of expiredContracts) {
        await supabase
          .from("contracts")
          .update({ renewal_status: "expired" })
          .eq("id", contract.id);

        await supabase.from("contract_renewal_logs").insert({
          contract_id: contract.id,
          action: "expired",
          details: { expired_on: today },
        });

        results.expired_marked++;
      }
    }
  } catch (err) {
    console.error("Expired marking error:", err);
  }

  return NextResponse.json({
    success: true,
    ...results,
    processed_at: new Date().toISOString(),
  });
}
