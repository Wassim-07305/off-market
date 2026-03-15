/**
 * Calcule un lead score (0-100) a partir des donnees d'enrichissement et du contact.
 */
export function calculateLeadScore(contact: {
  enrichment_data: Record<string, unknown> | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  facebook_url: string | null;
  website_url: string | null;
}): number {
  let score = 0;
  const enrichment = (contact.enrichment_data ?? {}) as Record<string, unknown>;

  // ─── Basic contact info ──────────────────────────────────
  if (contact.email) score += 10;
  if (contact.phone) score += 5;
  if (contact.company) score += 5;

  // ─── Social presence + enrichment bonus ──────────────────
  if (contact.linkedin_url) {
    score += 5;
    if (enrichment.linkedin) score += 5;
  }
  if (contact.instagram_url) {
    score += 5;
    if (enrichment.instagram) score += 5;
  }
  if (contact.tiktok_url) {
    score += 3;
    if (enrichment.tiktok) score += 3;
  }
  if (contact.facebook_url) {
    score += 3;
    if (enrichment.facebook) score += 3;
  }
  if (contact.website_url) {
    score += 5;
    if (enrichment.website) score += 5;
  }

  // ─── Instagram deep metrics ──────────────────────────────
  const igData = enrichment.instagram as Record<string, unknown> | undefined;
  if (igData) {
    const followers = Number(igData.followersCount) || 0;
    if (followers > 10000) {
      score += 10;
    } else if (followers > 1000) {
      score += 5;
    }

    if (igData.isBusinessAccount) {
      score += 5;
    }

    // Engagement: average likes on recent posts > 100
    const recentPosts = igData.recentPosts as
      | Array<{ likesCount?: number }>
      | undefined;
    if (recentPosts && recentPosts.length > 0) {
      const avgLikes =
        recentPosts.reduce((sum, p) => sum + (Number(p.likesCount) || 0), 0) /
        recentPosts.length;
      if (avgLikes > 100) {
        score += 5;
      }
    }
  }

  // ─── LinkedIn deep metrics ───────────────────────────────
  const liData = enrichment.linkedin as Record<string, unknown> | undefined;
  if (liData) {
    const connections = Number(liData.connections) || 0;
    if (connections > 500) {
      score += 5;
    }
  }

  // ─── Multi-platform bonus ────────────────────────────────
  const platformsWithData = [
    enrichment.linkedin,
    enrichment.instagram,
    enrichment.tiktok,
    enrichment.facebook,
    enrichment.website,
  ].filter(Boolean).length;

  if (platformsWithData >= 3) {
    score += 5;
  }

  return Math.min(100, score);
}
