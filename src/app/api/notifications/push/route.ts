import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

// Send push notifications to specific users
// Called internally by other API routes or cron jobs

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_EMAIL = process.env.VAPID_EMAIL ?? "mailto:contact@offmarket.app";

export async function POST(request: Request) {
  // Verify auth: either cron secret or admin/coach user
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  const isAuthorizedCron =
    !!cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isAuthorizedCron) {
    // Check if caller is admin via service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: "Config manquante" }, { status: 500 });
    }

    const { createClient: createServerClient } =
      await import("@/lib/supabase/server");
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "coach"].includes(profile.role)) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return NextResponse.json(
      {
        error:
          "VAPID keys non configurees. Ajoutez NEXT_PUBLIC_VAPID_PUBLIC_KEY et VAPID_PRIVATE_KEY.",
      },
      { status: 500 },
    );
  }

  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const { userIds, title, body, url, tag } = await request.json();

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
    console.error("Push subscriptions fetch error:", subError);
    return NextResponse.json({ error: "Erreur DB" }, { status: 500 });
  }

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
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payload,
      );
      sentCount++;
    } catch (err: unknown) {
      const pushErr = err as { statusCode?: number };
      // 410 Gone or 404 means subscription expired
      if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
        expiredEndpoints.push(sub.endpoint);
      } else {
        console.error("Push send error:", err);
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
}
