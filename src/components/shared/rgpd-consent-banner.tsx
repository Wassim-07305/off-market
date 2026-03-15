"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/hooks/use-supabase";
import { Shield, X } from "lucide-react";
import { cn } from "@/lib/utils";

const CONSENT_COOKIE_KEY = "off_market_rgpd_consent";

export function RgpdConsentBanner() {
  const { user, profile } = useAuth();
  const supabase = useSupabase();
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Check local cookie first
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${CONSENT_COOKIE_KEY}=`));
    if (cookie) return;

    // Check DB for existing consent
    supabase
      .from("user_consents" as never)
      .select("id" as never)
      .eq("user_id" as never, user.id as never)
      .eq("consent_type" as never, "rgpd_general" as never)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          // Already consented — set cookie and hide
          setCookie();
        } else {
          setVisible(true);
        }
      });
  }, [user, supabase]);

  function setCookie() {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${CONSENT_COOKIE_KEY}=true; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }

  async function handleAccept() {
    if (!user) return;
    setSaving(true);

    await supabase.from("user_consents" as never).insert({
      user_id: user.id,
      consent_type: "rgpd_general",
      consent_version: "1.0",
      ip_address: null,
      accepted: true,
    } as never);

    setCookie();
    setSaving(false);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9990] p-4">
      <div
        className="max-w-2xl mx-auto bg-surface border border-border rounded-2xl p-5 shadow-xl"
        style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.1)" }}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Protection de tes donnees
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Off Market utilise tes donnees personnelles pour te fournir un
              accompagnement personnalise. Tes donnees sont stockees de maniere
              securisee et ne sont jamais partagees avec des tiers. Tu peux
              exporter ou supprimer tes donnees a tout moment depuis les
              Reglages.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              En continuant, tu acceptes notre{" "}
              <a href="/privacy" className="text-primary hover:underline">
                politique de confidentialite
              </a>{" "}
              et le traitement de tes donnees conformement au RGPD.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            onClick={handleAccept}
            disabled={saving}
            className={cn(
              "h-9 px-5 rounded-xl bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-all active:scale-[0.98]",
              saving && "opacity-50 cursor-not-allowed",
            )}
          >
            {saving ? "..." : "J'accepte"}
          </button>
        </div>
      </div>
    </div>
  );
}
