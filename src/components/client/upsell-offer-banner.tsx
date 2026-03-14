"use client";

import { Sparkles, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useMyUpsellOffers,
  useDismissUpsell,
  useConvertUpsell,
} from "@/hooks/use-upsell";

export function UpsellOfferBanner() {
  const { data: offers = [] } = useMyUpsellOffers();
  const dismissUpsell = useDismissUpsell();
  const convertUpsell = useConvertUpsell();

  if (offers.length === 0) return null;

  // Show the first pending offer
  const offer = offers[0];
  const rule = offer.rule;

  if (!rule) return null;

  function handleConvert() {
    if (rule?.offer_url) {
      window.open(rule.offer_url, "_blank");
    }
    convertUpsell.mutate(offer.id);
  }

  function handleDismiss() {
    dismissUpsell.mutate(offer.id);
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/20",
        "bg-gradient-to-r from-primary/5 via-primary/10 to-amber-500/5",
        "p-5 sm:p-6",
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/50 transition-colors text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Icon */}
        <div className="shrink-0 p-3 rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-6 w-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground">
            {rule.offer_title}
          </h3>
          {rule.offer_description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {rule.offer_description}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="shrink-0 w-full sm:w-auto">
          <Button
            onClick={handleConvert}
            loading={convertUpsell.isPending}
            className="w-full sm:w-auto"
            iconRight={<ArrowRight className="h-4 w-4" />}
          >
            Decouvrir l&apos;offre
          </Button>
        </div>
      </div>
    </div>
  );
}
