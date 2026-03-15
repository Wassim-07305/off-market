import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_API = "https://api.apify.com/v2";

// LinkedIn profile scraper actor
const LINKEDIN_ACTOR = "dev_fusion/Linkedin-Profile-Scraper";
// Instagram profile scraper actor
const INSTAGRAM_ACTOR = "apify/instagram-profile-scraper";

async function runApifyActor(actorId: string, input: Record<string, unknown>) {
  const encodedActor = encodeURIComponent(actorId);
  const res = await fetch(
    `${APIFY_API}/acts/${encodedActor}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(120_000), // 2 min timeout
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apify error ${res.status}: ${text}`);
  }

  return res.json();
}

function extractLinkedInUsername(url: string): string | null {
  const match = url.match(/linkedin\.com\/in\/([^/?#]+)/);
  return match ? match[1] : null;
}

function extractInstagramUsername(url: string): string | null {
  // Handle both URLs and plain usernames
  if (!url.includes("/")) return url.replace(/^@/, "");
  const match = url.match(/instagram\.com\/([^/?#]+)/);
  return match ? match[1] : null;
}

// POST /api/enrichment
export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  // Role check — admin or coach only
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const userRoles = roles?.map((r) => r.role) ?? [];
  if (!userRoles.some((r) => r === "admin" || r === "coach")) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  if (!APIFY_TOKEN) {
    return NextResponse.json(
      { error: "APIFY_TOKEN non configure" },
      { status: 500 },
    );
  }

  const body = await req.json();
  const { contactId, type } = body as {
    contactId: string;
    type: "linkedin" | "instagram" | "both";
  };

  if (!contactId || !type) {
    return NextResponse.json(
      { error: "contactId et type requis" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Fetch contact
  const { data: contact, error: contactErr } = await admin
    .from("crm_contacts")
    .select("*")
    .eq("id", contactId)
    .single();

  if (contactErr || !contact) {
    return NextResponse.json({ error: "Contact non trouve" }, { status: 404 });
  }

  // Mark as pending
  await admin
    .from("crm_contacts")
    .update({ enrichment_status: "pending" })
    .eq("id", contactId);

  try {
    const enrichmentData: Record<string, unknown> = {
      ...(contact.enrichment_data as Record<string, unknown> || {}),
    };

    // ─── LinkedIn enrichment ────────────────────────────────
    if ((type === "linkedin" || type === "both") && contact.linkedin_url) {
      const username = extractLinkedInUsername(contact.linkedin_url);
      if (username) {
        const results = await runApifyActor(LINKEDIN_ACTOR, {
          urls: [`https://www.linkedin.com/in/${username}`],
        });

        if (results && results.length > 0) {
          const profile = results[0];
          enrichmentData.linkedin = {
            headline: profile.headline || profile.title,
            summary: profile.summary || profile.about,
            location: profile.location || profile.addressLocality,
            company: profile.companyName || profile.company,
            position: profile.position || profile.jobTitle,
            connections: profile.connectionsCount || profile.connections,
            followers: profile.followersCount || profile.followers,
            experience: profile.experience || profile.positions,
            education: profile.education,
            skills: profile.skills,
            email: profile.email,
            phone: profile.phone,
            profilePicture: profile.profilePicUrl || profile.photo,
            scraped_at: new Date().toISOString(),
          };

          // Auto-fill missing contact fields
          const updates: Record<string, unknown> = {};
          if (!contact.email && profile.email) updates.email = profile.email;
          if (!contact.phone && profile.phone) updates.phone = profile.phone;
          if (!contact.company && (profile.companyName || profile.company)) {
            updates.company = profile.companyName || profile.company;
          }
          if (Object.keys(updates).length > 0) {
            await admin
              .from("crm_contacts")
              .update(updates)
              .eq("id", contactId);
          }
        }
      }
    }

    // ─── Instagram enrichment ───────────────────────────────
    if ((type === "instagram" || type === "both") && contact.instagram_url) {
      const username = extractInstagramUsername(contact.instagram_url);
      if (username) {
        const results = await runApifyActor(INSTAGRAM_ACTOR, {
          usernames: [username],
          resultsLimit: 1,
        });

        if (results && results.length > 0) {
          const profile = results[0];
          enrichmentData.instagram = {
            fullName: profile.fullName,
            biography: profile.biography,
            followersCount: profile.followersCount,
            followsCount: profile.followsCount,
            postsCount: profile.postsCount,
            isVerified: profile.verified,
            isBusinessAccount: profile.isBusinessAccount,
            businessCategory: profile.businessCategoryName,
            externalUrl: profile.externalUrl,
            profilePicUrl: profile.profilePicUrlHD || profile.profilePicUrl,
            recentPosts: (profile.latestPosts || []).slice(0, 5).map(
              (p: Record<string, unknown>) => ({
                caption: (p.caption as string)?.slice(0, 200),
                likesCount: p.likesCount,
                commentsCount: p.commentsCount,
                timestamp: p.timestamp,
                type: p.type,
              }),
            ),
            scraped_at: new Date().toISOString(),
          };
        }
      }
    }

    // Save enrichment results
    await admin
      .from("crm_contacts")
      .update({
        enrichment_data: enrichmentData,
        enrichment_status: "enriched",
        last_enriched_at: new Date().toISOString(),
      })
      .eq("id", contactId);

    // Log as interaction
    await admin.from("contact_interactions").insert({
      contact_id: contactId,
      type: "note",
      content: `Enrichissement ${type} effectue via Apify`,
      metadata: { action: "enrichment", type, source: "apify" },
      created_by: user.id,
    });

    return NextResponse.json({
      success: true,
      enrichment_data: enrichmentData,
    });
  } catch (err) {
    console.error("Enrichment error:", err);

    await admin
      .from("crm_contacts")
      .update({ enrichment_status: "failed" })
      .eq("id", contactId);

    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Erreur lors de l'enrichissement",
      },
      { status: 500 },
    );
  }
}
