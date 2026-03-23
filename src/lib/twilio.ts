import Twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !fromNumber) {
  console.warn(
    "[Twilio] Variables manquantes (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)",
  );
}

const client =
  accountSid && authToken ? Twilio(accountSid, authToken) : null;

/**
 * Normalise un numéro de téléphone au format international E.164.
 * Exemples :
 *   "0784288684"     → "+33784288684"
 *   "07 84 28 86 84" → "+33784288684"
 *   "+33784288684"   → "+33784288684"
 *   "33784288684"    → "+33784288684"
 *   "+1 (507) 417-2073" → "+15074172073"
 */
export function normalizePhone(phone: string): string {
  // Supprime tout sauf les chiffres et le +
  let cleaned = phone.replace(/[^\d+]/g, "");

  // Si commence par 0 → numéro français, remplace par +33
  if (cleaned.startsWith("0") && !cleaned.startsWith("00")) {
    cleaned = "+33" + cleaned.slice(1);
  }

  // Si commence par 00 → remplace par +
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
  }

  // Si pas de + et commence par un indicatif pays (33, 1, 44...)
  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  return cleaned;
}

/**
 * Envoie un SMS via Twilio.
 * Normalise automatiquement le numéro au format E.164.
 */
export async function sendSms(
  to: string,
  body: string,
): Promise<{ success: boolean; sid?: string; error?: string }> {
  if (!client || !fromNumber) {
    return { success: false, error: "Twilio non configuré" };
  }

  try {
    const normalizedTo = normalizePhone(to);

    // Validation basique
    if (normalizedTo.length < 10 || normalizedTo.length > 16) {
      return { success: false, error: `Numéro invalide: ${normalizedTo}` };
    }

    const message = await client.messages.create({
      body,
      from: fromNumber,
      to: normalizedTo,
    });

    return { success: true, sid: message.sid };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[Twilio] Erreur envoi SMS:", error);
    return { success: false, error };
  }
}
