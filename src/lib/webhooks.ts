import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export type WebhookEvent =
  | "client.created"
  | "client.updated"
  | "client.deleted"
  | "lead.created"
  | "lead.updated"
  | "lead.status_changed"
  | "call.scheduled"
  | "call.completed"
  | "call.cancelled"
  | "invoice.created"
  | "invoice.paid"
  | "form.submitted";

interface WebhookPayload {
  event: WebhookEvent;
  data: Record<string, unknown>;
  timestamp: string;
}

/**
 * Dispatch a webhook event to all registered active webhooks.
 * Runs asynchronously — does not block the caller.
 */
export async function dispatchWebhook(
  event: WebhookEvent,
  data: Record<string, unknown>,
): Promise<void> {
  const supabase = createAdminClient();

  // Find active webhooks subscribed to this event
  const { data: webhooks, error } = await supabase
    .from("webhooks")
    .select("id, url, secret")
    .eq("is_active", true)
    .contains("events", [event]);

  if (error || !webhooks?.length) return;

  const payload: WebhookPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
  };

  const body = JSON.stringify(payload);

  // Send to each webhook in parallel
  await Promise.allSettled(
    webhooks.map(async (webhook) => {
      const startTime = Date.now();
      let status = 0;
      let responseBody = "";
      let success = false;

      try {
        // Generate HMAC signature
        const signature = crypto
          .createHmac("sha256", webhook.secret)
          .update(body)
          .digest("hex");

        const response = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Signature": `sha256=${signature}`,
            "X-Webhook-Event": event,
            "User-Agent": "OffMarket-Webhooks/1.0",
          },
          body,
          signal: AbortSignal.timeout(10000), // 10s timeout
        });

        status = response.status;
        responseBody = await response.text().catch(() => "");
        success = response.ok;
      } catch (err) {
        responseBody = err instanceof Error ? err.message : "Unknown error";
      }

      const durationMs = Date.now() - startTime;

      // Log the delivery attempt
      await supabase.from("webhook_logs").insert({
        webhook_id: webhook.id,
        event,
        payload,
        response_status: status || null,
        response_body: responseBody.slice(0, 1000),
        duration_ms: durationMs,
        success,
      });
    }),
  );
}
