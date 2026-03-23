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
 * Envoie un SMS via Twilio.
 * Retourne le SID du message ou null en cas d'erreur.
 */
export async function sendSms(
  to: string,
  body: string,
): Promise<{ success: boolean; sid?: string; error?: string }> {
  if (!client || !fromNumber) {
    return { success: false, error: "Twilio non configure" };
  }

  try {
    // Normalise le numéro (ajoute + si absent)
    const normalizedTo = to.startsWith("+") ? to : `+${to}`;

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
