"use client";

import { useState } from "react";
import type { CrmContact } from "@/types/pipeline";
import { useEnrichContact } from "@/hooks/use-enrichment";
import { usePipelineContacts } from "@/hooks/use-pipeline";
import { cn } from "@/lib/utils";
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
  Image,
  Heart,
  MessageCircle,
} from "lucide-react";

interface EnrichmentPanelProps {
  contact: CrmContact;
  open: boolean;
  onClose: () => void;
}

export function EnrichmentPanel({
  contact,
  open,
  onClose,
}: EnrichmentPanelProps) {
  const enrichMutation = useEnrichContact();
  const { updateContact } = usePipelineContacts();
  const [linkedinUrl, setLinkedinUrl] = useState(contact.linkedin_url || "");
  const [instagramUrl, setInstagramUrl] = useState(contact.instagram_url || "");

  if (!open) return null;

  const enrichmentData = contact.enrichment_data || {};
  const enrichmentStatus = contact.enrichment_status;
  const linkedin = enrichmentData.linkedin as Record<string, unknown> | undefined;
  const instagram = enrichmentData.instagram as Record<string, unknown> | undefined;

  const handleSaveUrls = () => {
    updateContact.mutate({
      id: contact.id,
      linkedin_url: linkedinUrl.trim() || null,
      instagram_url: instagramUrl.trim() || null,
    } as Parameters<typeof updateContact.mutate>[0]);
  };

  const handleEnrich = (type: "linkedin" | "instagram" | "both") => {
    // Save URLs first if changed
    const urlUpdates: Record<string, unknown> = {};
    if (linkedinUrl.trim()) urlUpdates.linkedin_url = linkedinUrl.trim();
    if (instagramUrl.trim()) urlUpdates.instagram_url = instagramUrl.trim();

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
  const canEnrichBoth = canEnrichLinkedin && canEnrichInstagram;

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
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-1">
                <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                Profil LinkedIn
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
                Profil Instagram
              </label>
              <input
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/username ou @username"
                className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
              />
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
            <button
              onClick={() => handleEnrich("linkedin")}
              disabled={!canEnrichLinkedin || enrichMutation.isPending}
              className="h-9 px-4 rounded-xl bg-[#0A66C2] text-white text-sm font-medium hover:bg-[#084d93] transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {enrichMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Linkedin className="w-3.5 h-3.5" />
              )}
              Enrichir LinkedIn
            </button>
            <button
              onClick={() => handleEnrich("instagram")}
              disabled={!canEnrichInstagram || enrichMutation.isPending}
              className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#E4405F] to-[#F77737] text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {enrichMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Instagram className="w-3.5 h-3.5" />
              )}
              Enrichir Instagram
            </button>
            {canEnrichBoth && (
              <button
                onClick={() => handleEnrich("both")}
                disabled={enrichMutation.isPending}
                className="h-9 px-4 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {enrichMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Tout enrichir
              </button>
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
                    <img
                      src={linkedin.profilePicture as string}
                      alt=""
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
                      {(
                        linkedin.experience as Array<Record<string, unknown>>
                      )
                        .slice(0, 3)
                        .map((exp, i) => (
                          <div key={i} className="text-xs text-muted-foreground">
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
                      {(linkedin.skills as string[]).slice(0, 8).map((skill, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] font-medium"
                        >
                          {typeof skill === "string" ? skill : (skill as Record<string, string>).name}
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
                    <img
                      src={instagram.profilePicUrl as string}
                      alt=""
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
                    <p className="text-[10px] text-muted-foreground">
                      Abonnes
                    </p>
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
                        <Image className="w-3 h-3" />
                        Posts recents
                      </p>
                      {(
                        instagram.recentPosts as Array<
                          Record<string, unknown>
                        >
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

          {/* Empty state */}
          {!linkedin && !instagram && !enrichMutation.isPending && (
            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Ajoutez une URL LinkedIn ou Instagram puis cliquez sur Enrichir
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Les donnees publiques du profil seront extraites via Apify
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
