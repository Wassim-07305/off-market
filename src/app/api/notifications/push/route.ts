import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

// Send push notifications to specific users
// Called internally by other API routes or cron jobs

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_EMAIL = process.env.VAPID_EMAIL ?? "mailto:contact@offmarket.app";

export async function POST(request: Request) {
  try {
    // Verify auth: either cron secret or authenticated user
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    const isAuthorizedCron =
      !!cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isAuthorizedCron) {
      const { createClient: createServerClient } =
        await import("@/lib/supabase/server");
      const supabase = await createServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Non autorise" }, { status: 401 });
      }
    }

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.error("[push] VAPID keys missing — PUBLIC:", !!VAPID_PUBLIC_KEY, "PRIVATE:", !!VAPID_PRIVATE_KEY);
      return NextResponse.json(
        { error: "VAPID keys non configurees" },
        { status: 500 },
      );
    }

    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    const reqBody = await request.json();
    const { userIds, title, body, url, tag } = reqBody;

    console.log("[push] Request:", { userIds, title, body: body?.slice(0, 50) });

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "userIds requis" }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: "title requis" }, { status: 400 });
    }

    // Get push subscriptions for target users
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .in("user_id", userIds);

    if (subError) {
      console.error("[push] DB error:", subError);
      return NextResponse.json({ error: "Erreur DB", details: subError.message }, { status: 500 });
    }

    console.log("[push] Found", subscriptions?.length ?? 0, "subscriptions for", userIds.length, "users");

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ sent: 0, message: "Aucun abonnement push" });
    }

    const payload = JSON.stringify({
      title,
      body: body ?? "",
      url: url ?? "/",
      tag: tag ?? "off-market",
    });

    let sentCount = 0;
    const expiredEndpoints: string[] = [];

    for (const sub of subscriptions) {
      try {
        const keys = sub.keys as { p256dh?: string; auth?: string } | null;
        if (!keys?.p256dh || !keys?.auth) {
          console.warn("[push] Missing keys for sub:", sub.id, "keys:", JSON.stringify(keys));
          continue;
        }
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: keys.p256dh,
              auth: keys.auth,
            },
          },
          payload,
        );
        sentCount++;
        console.log("[push] Sent to:", sub.user_id);
      } catch (err: unknown) {
        const pushErr = err as { statusCode?: number; body?: string; message?: string };
        if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
          expiredEndpoints.push(sub.endpoint);
          console.log("[push] Expired endpoint for:", sub.user_id);
        } else {
          console.error("[push] Send error:", pushErr.statusCode, pushErr.message, pushErr.body);
        }
      }
    }

    // Clean up expired subscriptions
    if (expiredEndpoints.length > 0) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", expiredEndpoints);
    }

    return NextResponse.json({
      sent: sentCount,
      total: subscriptions.length,
      expired: expiredEndpoints.length,
    });
  } catch (err) {
    console.error("[push] Unhandled error:", err);
    return NextResponse.json(
      { error: "Erreur interne push", details: String(err) },
      { status: 500 },
    );
  }
}
