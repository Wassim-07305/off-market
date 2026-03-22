"use client";

import { useState } from "react";
import Image from "next/image";
import type { CrmContact } from "@/types/pipeline";
import { useEnrichContact } from "@/hooks/use-enrichment";
import { usePipelineContacts } from "@/hooks/use-pipeline";
import { useRateLimitStatus } from "@/hooks/use-rate-limit";
import { cn } from "@/lib/utils";
import { formatResetTime } from "@/lib/rate-limiter";
import { RateLimitBadge } from "@/components/ui/rate-limit-badge";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Linkedin,
  Instagram,
  Sparkles,
  Loader2,
  X,
  Globe,
  MapPin,
  Briefcase,
  Users,
  Mail,
  Phone,
  CheckCircle,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Video,
  Facebook,
  Youtube,
  Link,
  Building2,
  Star,
  Megaphone,
  Tag,
} from "lucide-react";

interface EnrichmentPanelProps {
  contact: CrmContact;
  open: boolean;
  onClose: () => void;
}

type EnrichmentType =
  | "linkedin"
  | "instagram"
  | "tiktok"
  | "facebook"
  | "website"
  | "all";

export function EnrichmentPanel({
  contact,
  open,
  onClose,
}: EnrichmentPanelProps) {
  const enrichMutation = useEnrichContact();
  const { updateContact } = usePipelineContacts();
  const linkedinLimit = useRateLimitStatus("linkedin_enrich");
  const instagramLimit = useRateLimitStatus("instagram_enrich");
  const bulkLimit = useRateLimitStatus("bulk_enrich");
  const [linkedinUrl, setLinkedinUrl] = useState(contact.linkedin_url || "");
  const [instagramUrl, setInstagramUrl] = useState(contact.instagram_url || "");
  const [tiktokUrl, setTiktokUrl] = useState(contact.tiktok_url || "");
  const [facebookUrl, setFacebookUrl] = useState(contact.facebook_url || "");
  const [websiteUrl, setWebsiteUrl] = useState(contact.website_url || "");
  const [youtubeUrl, setYoutubeUrl] = useState(contact.youtube_url || "");

  const limitTooltip = (resetAt: string) =>
    `Limite atteinte, reessayez a ${formatResetTime(resetAt)}`;

  if (!open) return null;

  const enrichmentData = contact.enrichment_data || {};
  const enrichmentStatus = contact.enrichment_status;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linkedin = enrichmentData.linkedin as Record<string, any> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instagram = enrichmentData.instagram as Record<string, any> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tiktok = enrichmentData.tiktok as Record<string, any> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const facebook = enrichmentData.facebook as Record<string, any> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const website = enrichmentData.website as Record<string, any> | undefined;

  const handleSaveUrls = () => {
    updateContact.mutate({
      id: contact.id,
      linkedin_url: linkedinUrl.trim() || null,
      instagram_url: instagramUrl.trim() || null,
      tiktok_url: tiktokUrl.trim() || null,
      facebook_url: facebookUrl.trim() || null,
      website_url: websiteUrl.trim() || null,
      youtube_url: youtubeUrl.trim() || null,
    } as Parameters<typeof updateContact.mutate>[0]);
  };

  const handleEnrich = (type: EnrichmentType) => {
    // Save URLs first if changed
    const urlUpdates: Record<string, unknown> = {};
    if (linkedinUrl.trim()) urlUpdates.linkedin_url = linkedinUrl.trim();
    if (instagramUrl.trim()) urlUpdates.instagram_url = instagramUrl.trim();
    if (tiktokUrl.trim()) urlUpdates.tiktok_url = tiktokUrl.trim();
    if (facebookUrl.trim()) urlUpdates.facebook_url = facebookUrl.trim();
    if (websiteUrl.trim()) urlUpdates.website_url = websiteUrl.trim();
    if (youtubeUrl.trim()) urlUpdates.youtube_url = youtubeUrl.trim();

    if (Object.keys(urlUpdates).length > 0) {
      updateContact.mutate({
        id: contact.id,
        ...urlUpdates,
      } as Parameters<typeof updateContact.mutate>[0]);
    }

    enrichMutation.mutate({ contactId: contact.id, type });
  };

  const canEnrichLinkedin = !!linkedinUrl.trim();
  const canEnrichInstagram = !!instagramUrl.trim();
  const canEnrichTiktok = !!tiktokUrl.trim();
  const canEnrichFacebook = !!facebookUrl.trim();
  const canEnrichWebsite = !!websiteUrl.trim();
  const canEnrichAny =
    canEnrichLinkedin ||
    canEnrichInstagram ||
    canEnrichTiktok ||
    canEnrichFacebook ||
    canEnrichWebsite;
  const hasAnyData = linkedin || instagram || tiktok || facebook || website;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative bg-surface border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden mx-4"
        style={{ boxShadow: "var(--shadow-elevated)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-semibold text-foreground">
              Enrichissement — {contact.full_name}
            </h2>
            {enrichmentStatus && (
              <span
                className={cn(
                  "text-[11px] px-2 py-0.5 rounded-full font-medium",
                  enrichmentStatus === "enriched"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : enrichmentStatus === "pending"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-red-500/10 text-red-600",
                )}
              >
                {enrichmentStatus === "enriched"
                  ? "Enrichi"
                  : enrichmentStatus === "pending"
                    ? "En cours..."
                    : "Echoue"}
              </span>
            )}
            <RateLimitBadge
              remaining={linkedinLimit.remaining}
              limit={linkedinLimit.limit}
              resetAt={linkedinLimit.resetAt}
              isLimited={linkedinLimit.isLimited}
            />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(85vh-80px)] space-y-5">
          {/* URL inputs */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-1">
                  <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                  LinkedIn
                </label>
                <input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-1">
                  <Instagram className="w-3.5 h-3.5 text-[#E4405F]" />
                  Instagram
                </label>
                <input
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="@username ou instagram.com/..."
                  className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-1">
                  <Video className="w-3.5 h-3.5 text-[#000000] dark:text-white" />
                  TikTok
                </label>
                <input
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="@username ou tiktok.com/@..."
                  className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-1">
                  <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
                  Facebook
                </label>
                <input
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="facebook.com/page"
                  className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-1">
                  <Globe className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                  Site web
                </label>
                <input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://website.com"
                  className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-1">
                  <Youtube className="w-3.5 h-3.5 text-[#FF0000]" />
                  YouTube
                </label>
                <input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="youtube.com/@channel"
                  className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSaveUrls}
              disabled={updateContact.isPending}
              className="h-9 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              Sauvegarder les URLs
            </button>
            <Tooltip
              content={
                linkedinLimit.isLimited
                  ? limitTooltip(linkedinLimit.resetAt)
                  : null
              }
            >
              <button
                onClick={() => handleEnrich("linkedin")}
                disabled={
                  !canEnrichLinkedin ||
                  enrichMutation.isPending ||
                  linkedinLimit.isLimited
                }
                className="h-9 px-4 rounded-xl bg-[#0A66C2] text-white text-sm font-medium hover:bg-[#084d93] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {enrichMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Linkedin className="w-3.5 h-3.5" />
                )}
                LinkedIn
              </button>
            </Tooltip>
            <Tooltip
              content={
                instagramLimit.isLimited
                  ? limitTooltip(instagramLimit.resetAt)
                  : null
              }
            >
              <button
                onClick={() => handleEnrich("instagram")}
                disabled={
                  !canEnrichInstagram ||
                  enrichMutation.isPending ||
                  instagramLimit.isLimited
                }
                className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#E4405F] to-[#F77737] text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {enrichMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Instagram className="w-3.5 h-3.5" />
                )}
                Instagram
              </button>
            </Tooltip>
            <Tooltip
              content={
                linkedinLimit.isLimited
                  ? limitTooltip(linkedinLimit.resetAt)
                  : null
              }
            >
              <button
                onClick={() => handleEnrich("tiktok")}
                disabled={
                  !canEnrichTiktok ||
                  enrichMutation.isPending ||
                  linkedinLimit.isLimited
                }
                className="h-9 px-4 rounded-xl bg-black dark:bg-surface dark:text-black text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {enrichMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Video className="w-3.5 h-3.5" />
                )}
                TikTok
              </button>
            </Tooltip>
            <Tooltip
              content={
                linkedinLimit.isLimited
                  ? limitTooltip(linkedinLimit.resetAt)
                  : null
              }
            >
              <button
                onClick={() => handleEnrich("facebook")}
                disabled={
                  !canEnrichFacebook ||
                  enrichMutation.isPending ||
                  linkedinLimit.isLimited
                }
                className="h-9 px-4 rounded-xl bg-[#1877F2] text-white text-sm font-medium hover:bg-[#1466D8] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {enrichMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Facebook className="w-3.5 h-3.5" />
                )}
                Facebook
              </button>
            </Tooltip>
            <Tooltip
              content={
                linkedinLimit.isLimited
                  ? limitTooltip(linkedinLimit.resetAt)
                  : null
              }
            >
              <button
                onClick={() => handleEnrich("website")}
                disabled={
                  !canEnrichWebsite ||
                  enrichMutation.isPending ||
                  linkedinLimit.isLimited
                }
                className="h-9 px-4 rounded-xl bg-zinc-700 dark:bg-zinc-300 dark:text-zinc-900 text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {enrichMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Globe className="w-3.5 h-3.5" />
                )}
                Site web
              </button>
            </Tooltip>
            {canEnrichAny && (
              <Tooltip
                content={
                  bulkLimit.isLimited ? limitTooltip(bulkLimit.resetAt) : null
                }
              >
                <button
                  onClick={() => handleEnrich("all")}
                  disabled={enrichMutation.isPending || bulkLimit.isLimited}
                  className="h-9 px-4 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {enrichMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  Tout enrichir
                </button>
              </Tooltip>
            )}
          </div>

          {/* Loading state */}
          {enrichMutation.isPending && (
            <div className="flex items-center justify-center gap-3 py-6">
              <Loader2 className="w-6 h-6 animate-spin text-red-500" />
              <p className="text-sm text-muted-foreground">
                Enrichissement en cours via Apify...
              </p>
            </div>
          )}

          {/* LinkedIn results */}
          {linkedin && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                Donnees LinkedIn
              </h3>
              <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-3">
                {linkedin.profilePicture && (
                  <div className="flex items-center gap-3">
                    <Image
                      src={linkedin.profilePicture as string}
                      alt=""
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#0A66C2]/20"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {linkedin.headline as string}
                      </p>
                      {linkedin.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {linkedin.location as string}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {!linkedin.profilePicture && linkedin.headline && (
                  <p className="text-sm font-medium text-foreground">
                    {linkedin.headline as string}
                  </p>
                )}

                {linkedin.summary && (
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {linkedin.summary as string}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {linkedin.company && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Briefcase className="w-3 h-3" />
                      {linkedin.company as string}
                    </div>
                  )}
                  {linkedin.position && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Briefcase className="w-3 h-3" />
                      {linkedin.position as string}
                    </div>
                  )}
                  {linkedin.connections && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {String(linkedin.connections)} connexions
                    </div>
                  )}
                  {linkedin.followers && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {String(linkedin.followers)} abonnes
                    </div>
                  )}
                  {linkedin.email && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {linkedin.email as string}
                    </div>
                  )}
                  {linkedin.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {linkedin.phone as string}
                    </div>
                  )}
                </div>

                {/* Experience */}
                {Array.isArray(linkedin.experience) &&
                  linkedin.experience.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-border">
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        Experience
                      </p>
                      {(linkedin.experience as Array<Record<string, any>>)
                        .slice(0, 3)
                        .map((exp, i) => (
                          <div
                            key={i}
                            className="text-xs text-muted-foreground"
                          >
                            <span className="font-medium text-foreground">
                              {(exp.title || exp.position) as string}
                            </span>
                            {(exp.companyName || exp.company) && (
                              <span>
                                {" "}
                                @ {(exp.companyName || exp.company) as string}
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  )}

                {/* Skills */}
                {Array.isArray(linkedin.skills) &&
                  linkedin.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-border">
                      {(linkedin.skills as string[])
                        .slice(0, 8)
                        .map((skill, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] font-medium"
                          >
                            {typeof skill === "string"
                              ? skill
                              : (skill as Record<string, string>).name}
                          </span>
                        ))}
                    </div>
                  )}

                <p className="text-[10px] text-muted-foreground/60">
                  Scrape le{" "}
                  {new Date(linkedin.scraped_at as string).toLocaleString(
                    "fr-FR",
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Instagram results */}
          {instagram && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Instagram className="w-4 h-4 text-[#E4405F]" />
                Donnees Instagram
              </h3>
              <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {instagram.profilePicUrl && (
                    <Image
                      src={instagram.profilePicUrl as string}
                      alt=""
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#E4405F]/20"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-foreground">
                        {instagram.fullName as string}
                      </p>
                      {instagram.isVerified && (
                        <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                      )}
                      {instagram.isBusinessAccount && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 font-medium">
                          Business
                        </span>
                      )}
                    </div>
                    {instagram.businessCategory && (
                      <p className="text-xs text-muted-foreground">
                        {instagram.businessCategory as string}
                      </p>
                    )}
                  </div>
                </div>

                {instagram.biography && (
                  <p className="text-xs text-muted-foreground">
                    {instagram.biography as string}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-surface border border-border">
                    <p className="text-lg font-bold text-foreground">
                      {formatNumber(instagram.followersCount as number)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Abonnes</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-surface border border-border">
                    <p className="text-lg font-bold text-foreground">
                      {formatNumber(instagram.followsCount as number)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Abonnements
                    </p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-surface border border-border">
                    <p className="text-lg font-bold text-foreground">
                      {formatNumber(instagram.postsCount as number)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Posts</p>
                  </div>
                </div>

                {instagram.externalUrl && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Globe className="w-3 h-3" />
                    <a
                      href={instagram.externalUrl as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {instagram.externalUrl as string}
                    </a>
                  </div>
                )}

                {/* Recent posts */}
                {Array.isArray(instagram.recentPosts) &&
                  instagram.recentPosts.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        Posts recents
                      </p>
                      {(
                        instagram.recentPosts as Array<Record<string, unknown>>
                      ).map((post, i) => (
                        <div
                          key={i}
                          className="text-xs text-muted-foreground p-2 rounded-lg bg-surface border border-border"
                        >
                          <p className="line-clamp-2">
                            {post.caption as string}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {formatNumber(post.likesCount as number)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {formatNumber(post.commentsCount as number)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                <p className="text-[10px] text-muted-foreground/60">
                  Scrape le{" "}
                  {new Date(instagram.scraped_at as string).toLocaleString(
                    "fr-FR",
                  )}
                </p>
              </div>
            </div>
          )}

          {/* TikTok results */}
          {tiktok && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Video className="w-4 h-4" />
                Donnees TikTok
              </h3>
              <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {tiktok.profilePicUrl && (
                    <Image
                      src={tiktok.profilePicUrl as string}
                      alt=""
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover border-2 border-zinc-300 dark:border-zinc-600"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-foreground">
                        {tiktok.fullName as string}
                      </p>
                      {tiktok.verified && (
                        <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </div>
                  </div>
                </div>

                {tiktok.bio && (
                  <p className="text-xs text-muted-foreground">
                    {tiktok.bio as string}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-2 rounded-lg bg-surface border border-border">
                    <p className="text-lg font-bold text-foreground">
                      {formatNumber(tiktok.followersCount as number)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Abonnes</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-surface border border-border">
                    <p className="text-lg font-bold text-foreground">
                      {formatNumber(tiktok.followingCount as number)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Abonnements
                    </p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-surface border border-border">
                    <p className="text-lg font-bold text-foreground">
                      {formatNumber(tiktok.heartsCount as number)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Likes</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-surface border border-border">
                    <p className="text-lg font-bold text-foreground">
                      {formatNumber(tiktok.videoCount as number)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Videos</p>
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground/60">
                  Scrape le{" "}
                  {new Date(tiktok.scraped_at as string).toLocaleString(
                    "fr-FR",
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Facebook results */}
          {facebook && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Facebook className="w-4 h-4 text-[#1877F2]" />
                Donnees Facebook
              </h3>
              <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-foreground">
                    {facebook.name as string}
                  </p>
                  {facebook.isAdRunning && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-medium flex items-center gap-0.5">
                      <Megaphone className="w-3 h-3" />
                      Ads actives
                    </span>
                  )}
                </div>

                {facebook.about && (
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {facebook.about as string}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {facebook.followers != null && (
                    <div className="text-center p-2 rounded-lg bg-surface border border-border">
                      <p className="text-lg font-bold text-foreground">
                        {formatNumber(facebook.followers as number)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Abonnes
                      </p>
                    </div>
                  )}
                  {facebook.likes != null && (
                    <div className="text-center p-2 rounded-lg bg-surface border border-border">
                      <p className="text-lg font-bold text-foreground">
                        {formatNumber(facebook.likes as number)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Likes</p>
                    </div>
                  )}
                  {facebook.rating != null && (
                    <div className="text-center p-2 rounded-lg bg-surface border border-border">
                      <p className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-amber-500" />
                        {String(facebook.rating)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Note</p>
                    </div>
                  )}
                </div>

                {/* Categories */}
                {facebook.categories && (
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(facebook.categories)
                      ? (facebook.categories as string[])
                      : [facebook.categories as string]
                    ).map((cat, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[#1877F2]/10 text-[#1877F2] font-medium flex items-center gap-0.5"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                {/* Contact info */}
                <div className="grid grid-cols-2 gap-2">
                  {facebook.email && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {facebook.email as string}
                    </div>
                  )}
                  {facebook.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {facebook.phone as string}
                    </div>
                  )}
                  {facebook.website && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Globe className="w-3 h-3" />
                      <a
                        href={facebook.website as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        {facebook.website as string}
                      </a>
                    </div>
                  )}
                  {facebook.address && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {typeof facebook.address === "string"
                        ? facebook.address
                        : JSON.stringify(facebook.address)}
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-muted-foreground/60">
                  Scrape le{" "}
                  {new Date(facebook.scraped_at as string).toLocaleString(
                    "fr-FR",
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Website results */}
          {website && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Globe className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                Donnees du site web
              </h3>
              <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-3">
                {(website.companyName as string) && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      {website.companyName as string}
                    </p>
                  </div>
                )}

                {/* Emails found */}
                {Array.isArray(website.emails) &&
                  (website.emails as string[]).length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Emails trouves
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(website.emails as string[]).map((email, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 font-medium"
                          >
                            {email}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Phones found */}
                {Array.isArray(website.phones) &&
                  (website.phones as string[]).length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        Telephones trouves
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(website.phones as string[]).map((phone, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 font-medium"
                          >
                            {phone}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Social links */}
                {website.socialLinks && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Link className="w-3 h-3" />
                      Liens sociaux
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(
                        website.socialLinks as Record<string, string | null>,
                      )
                        .filter(([, url]) => url)
                        .map(([platform, url]) => (
                          <a
                            key={platform}
                            href={url as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-zinc-400 transition-colors"
                          >
                            {platform === "linkedin" && (
                              <Linkedin className="w-3 h-3 text-[#0A66C2]" />
                            )}
                            {platform === "instagram" && (
                              <Instagram className="w-3 h-3 text-[#E4405F]" />
                            )}
                            {platform === "facebook" && (
                              <Facebook className="w-3 h-3 text-[#1877F2]" />
                            )}
                            {platform === "youtube" && (
                              <Youtube className="w-3 h-3 text-[#FF0000]" />
                            )}
                            {platform === "tiktok" && (
                              <Video className="w-3 h-3" />
                            )}
                            {platform === "twitter" && (
                              <Globe className="w-3 h-3" />
                            )}
                            {platform.charAt(0).toUpperCase() +
                              platform.slice(1)}
                          </a>
                        ))}
                    </div>
                  </div>
                )}

                {(website.address as string) && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {website.address as string}
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground/60">
                  Scrape le{" "}
                  {new Date(website.scraped_at as string).toLocaleString(
                    "fr-FR",
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!hasAnyData && !enrichMutation.isPending && (
            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Ajoutez des URLs puis cliquez sur Enrichir pour extraire les
                donnees
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Les donnees publiques seront extraites via Apify (LinkedIn,
                Instagram, TikTok, Facebook, site web)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatNumber(n: number | undefined | null): string {
  if (n == null) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
