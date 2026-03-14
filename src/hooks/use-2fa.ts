"use client";

import { useState, useCallback } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

interface TotpFactor {
  id: string;
  type: "totp";
  friendly_name: string | null;
  status: "verified" | "unverified";
}

export function use2FA() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const [factors, setFactors] = useState<TotpFactor[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);

  const isEnabled = factors.some((f) => f.status === "verified");

  // Fetch existing MFA factors
  const fetchFactors = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      setFactors((data.totp ?? []) as unknown as TotpFactor[]);
    } catch {
      // Silently handle — MFA may not be enabled
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  // Start TOTP enrollment — generates QR code
  const startEnroll = useCallback(async () => {
    if (!user) return;
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator",
      });
      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
    } catch (err) {
      toast.error("Erreur lors de l'activation du 2FA");
      console.error("2FA enroll error:", err);
      setEnrolling(false);
    }
  }, [supabase, user]);

  // Verify TOTP code to complete enrollment
  const verifyEnroll = useCallback(
    async (code: string) => {
      if (!factorId) {
        toast.error("Aucun facteur en attente");
        return false;
      }
      try {
        const { data: challengeData, error: challengeError } =
          await supabase.auth.mfa.challenge({ factorId });

        if (challengeError) throw challengeError;

        const { error: verifyError } = await supabase.auth.mfa.verify({
          factorId,
          challengeId: challengeData.id,
          code,
        });

        if (verifyError) {
          toast.error("Code invalide. Reessaie.");
          return false;
        }

        toast.success("2FA active avec succes !");
        setQrCode(null);
        setSecret(null);
        setFactorId(null);
        setEnrolling(false);
        await fetchFactors();
        return true;
      } catch {
        toast.error("Erreur lors de la verification");
        return false;
      }
    },
    [factorId, supabase, fetchFactors],
  );

  // Cancel enrollment
  const cancelEnroll = useCallback(() => {
    if (factorId) {
      supabase.auth.mfa.unenroll({ factorId }).catch(() => {});
    }
    setQrCode(null);
    setSecret(null);
    setFactorId(null);
    setEnrolling(false);
  }, [factorId, supabase]);

  // Disable 2FA — unenroll the verified factor
  const disable = useCallback(async () => {
    const verifiedFactor = factors.find((f) => f.status === "verified");
    if (!verifiedFactor) return;

    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: verifiedFactor.id,
      });
      if (error) throw error;
      toast.success("2FA desactive");
      await fetchFactors();
    } catch {
      toast.error("Erreur lors de la desactivation du 2FA");
    }
  }, [factors, supabase, fetchFactors]);

  // Verify a TOTP code during login (challenge + verify)
  const verifyLogin = useCallback(
    async (code: string) => {
      const verifiedFactor = factors.find((f) => f.status === "verified");
      if (!verifiedFactor) return false;

      try {
        const { data: challengeData, error: challengeError } =
          await supabase.auth.mfa.challenge({ factorId: verifiedFactor.id });

        if (challengeError) throw challengeError;

        const { error: verifyError } = await supabase.auth.mfa.verify({
          factorId: verifiedFactor.id,
          challengeId: challengeData.id,
          code,
        });

        if (verifyError) {
          toast.error("Code 2FA invalide");
          return false;
        }

        return true;
      } catch {
        toast.error("Erreur de verification 2FA");
        return false;
      }
    },
    [factors, supabase],
  );

  return {
    factors,
    isEnabled,
    loading,
    enrolling,
    qrCode,
    secret,
    fetchFactors,
    startEnroll,
    verifyEnroll,
    cancelEnroll,
    disable,
    verifyLogin,
  };
}
