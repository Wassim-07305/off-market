import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateLeadScore } from "@/lib/lead-score-calculator";

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_API = "https://api.apify.com/v2";

// Actor IDs
const LINKEDIN_ACTOR = "dev_fusion/Linkedin-Profile-Scraper";
const INSTAGRAM_ACTOR = "apify/instagram-profile-scraper";
const TIKTOK_ACTOR = "clockworks/tiktok-profile-scraper";
const FACEBOOK_ACTOR = "apify/facebook-pages-scraper";
const WEBSITE_ACTOR = "betterdevsscrape/contact-details-extractor";

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

function extractTikTokUsername(url: string): string | null {
  // Handle @username, tiktok.com/@username, or full URLs
  if (!url.includes("/")) return url.replace(/^@/, "");
  const match = url.match(/tiktok\.com\/@([^/?#]+)/);
  return match ? match[1] : null;
}

function extractFacebookPage(url: string): string | null {
  // Handle facebook.com/pagename or full URLs
  if (!url.includes("/")) return url;
  const match = url.match(/facebook\.com\/([^/?#]+)/);
  return match ? match[1] : null;
}

type EnrichmentType = "linkedin" | "instagram" | "tiktok" | "facebook" | "website" | "all";

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
    type: EnrichmentType;
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

    const shouldEnrich = (platform: string) =>
      type === platform || type === "all";

    // ─── LinkedIn enrichment ────────────────────────────────
    if (shouldEnrich("linkedin") && contact.linkedin_url) {
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
    if (shouldEnrich("instagram") && contact.instagram_url) {
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

    // ─── TikTok enrichment ──────────────────────────────────
    if (shouldEnrich("tiktok") && contact.tiktok_url) {
      const username = extractTikTokUsername(contact.tiktok_url);
      if (username) {
        const results = await runApifyActor(TIKTOK_ACTOR, {
          profiles: [username],
        });

        if (results && results.length > 0) {
          const profile = results[0];
          enrichmentData.tiktok = {
            fullName: profile.fullName || profile.nickName || profile.nickname,
            bio: profile.bio || profile.signature || profile.bioDescription,
            followersCount: profile.followersCount || profile.fans,
            followingCount: profile.followingCount || profile.following,
            heartsCount: profile.heartsCount || profile.heart || profile.diggCount,
            videoCount: profile.videoCount || profile.video,
            verified: profile.verified || profile.isVerified,
            profilePicUrl: profile.profilePicUrl || profile.avatarLarger || profile.avatarMedium,
            scraped_at: new Date().toISOString(),
          };
        }
      }
    }

    // ─── Facebook enrichment ────────────────────────────────
    if (shouldEnrich("facebook") && contact.facebook_url) {
      const pageName = extractFacebookPage(contact.facebook_url);
      if (pageName) {
        const results = await runApifyActor(FACEBOOK_ACTOR, {
          startUrls: [{ url: `https://www.facebook.com/${pageName}` }],
        });

        if (results && results.length > 0) {
          const page = results[0];
          enrichmentData.facebook = {
            name: page.name || page.title,
            about: page.about || page.description,
            email: page.email,
            phone: page.phone,
            website: page.website || page.url,
            likes: page.likes || page.likesCount,
            followers: page.followers || page.followersCount,
            rating: page.rating || page.overallStarRating,
            categories: page.categories || page.category,
            address: page.address,
            isAdRunning: page.isAdRunning ?? page.adLibrary?.isActive ?? null,
            scraped_at: new Date().toISOString(),
          };

          // Auto-fill missing contact fields
          const fbUpdates: Record<string, unknown> = {};
          if (!contact.email && page.email) fbUpdates.email = page.email;
          if (!contact.phone && page.phone) fbUpdates.phone = page.phone;
          if (!contact.website_url && (page.website || page.url)) {
            fbUpdates.website_url = page.website || page.url;
          }
          if (Object.keys(fbUpdates).length > 0) {
            await admin
              .from("crm_contacts")
              .update(fbUpdates)
              .eq("id", contactId);
          }
        }
      }
    }

    // ─── Website enrichment ─────────────────────────────────
    if (shouldEnrich("website") && contact.website_url) {
      const results = await runApifyActor(WEBSITE_ACTOR, {
        startUrls: [{ url: contact.website_url }],
        maxPages: 5,
      });

      if (results && results.length > 0) {
        // Aggregate results from all crawled pages
        const allEmails = new Set<string>();
        const allPhones = new Set<string>();
        const socialLinks: Record<string, string | null> = {
          linkedin: null,
          instagram: null,
          twitter: null,
          facebook: null,
          youtube: null,
          tiktok: null,
        };
        let companyName: string | null = null;
        let address: string | null = null;

        for (const page of results as Array<Record<string, unknown>>) {
          if (Array.isArray(page.emails)) {
            for (const e of page.emails) allEmails.add(e as string);
          }
          if (typeof page.email === "string") allEmails.add(page.email);

          if (Array.isArray(page.phones)) {
            for (const p of page.phones) allPhones.add(p as string);
          }
          if (typeof page.phone === "string") allPhones.add(page.phone);

          const links = (page.socialLinks || page.socials || {}) as Record<string, string>;
          for (const key of Object.keys(socialLinks)) {
            if (!socialLinks[key] && links[key]) {
              socialLinks[key] = links[key];
            }
          }

          if (!companyName && page.companyName) companyName = page.companyName as string;
          if (!companyName && page.title) companyName = page.title as string;
          if (!address && page.address) address = page.address as string;
        }

        enrichmentData.website = {
          emails: Array.from(allEmails),
          phones: Array.from(allPhones),
          socialLinks,
          companyName,
          address,
          scraped_at: new Date().toISOString(),
        };

        // Auto-fill missing contact fields from website data
        const webUpdates: Record<string, unknown> = {};
        const emails = Array.from(allEmails);
        const phones = Array.from(allPhones);

        if (!contact.email && emails.length > 0) webUpdates.email = emails[0];
        if (!contact.phone && phones.length > 0) webUpdates.phone = phones[0];
        if (!contact.company && companyName) webUpdates.company = companyName;
        if (!contact.linkedin_url && socialLinks.linkedin) {
          webUpdates.linkedin_url = socialLinks.linkedin;
        }
        if (!contact.instagram_url && socialLinks.instagram) {
          webUpdates.instagram_url = socialLinks.instagram;
        }
        if (!contact.tiktok_url && socialLinks.tiktok) {
          webUpdates.tiktok_url = socialLinks.tiktok;
        }
        if (!contact.facebook_url && socialLinks.facebook) {
          webUpdates.facebook_url = socialLinks.facebook;
        }

        if (Object.keys(webUpdates).length > 0) {
          await admin
            .from("crm_contacts")
            .update(webUpdates)
            .eq("id", contactId);
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

    // Auto-calculate lead score
    const updatedContact = await admin.from("crm_contacts").select("*").eq("id", contactId).single();
    if (updatedContact.data) {
      const newScore = calculateLeadScore(updatedContact.data);
      await admin.from("crm_contacts").update({ lead_score: newScore }).eq("id", contactId);
    }

    // Log as interaction
    await admin.from("contact_interactions").insert({
      contact_id: contactId,
      type: "note",
      content: `Enrichissement ${type === "all" ? "toutes plateformes" : type} effectue via Apify`,
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
