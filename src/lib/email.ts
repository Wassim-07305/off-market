import { Resend } from "resend";

const DEFAULT_FROM = "Off-Market <noreply@off-market.fr>";

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Envoie un email via Resend.
 * Echoue silencieusement si RESEND_API_KEY n'est pas configuree.
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = DEFAULT_FROM,
}: SendEmailParams): Promise<SendEmailResult> {
  const client = getResend();

  if (!client) {
    console.error(
      "[Email] RESEND_API_KEY non configuree — email non envoye",
    );
    return { success: false, error: "RESEND_API_KEY non configuree" };
  }

  try {
    const { data, error } = await client.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error("[Email] Erreur Resend:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[Email] Erreur inattendue:", message);
    return { success: false, error: message };
  }
}
