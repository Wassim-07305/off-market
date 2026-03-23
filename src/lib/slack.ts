const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

interface SlackMessage {
  text: string;
  blocks?: SlackBlock[];
}

interface SlackBlock {
  type: string;
  text?: { type: string; text: string; emoji?: boolean };
  fields?: { type: string; text: string }[];
  elements?: { type: string; text: string }[];
}

/**
 * Envoie une notification Slack via webhook.
 */
export async function sendSlackNotification(
  message: SlackMessage,
): Promise<{ success: boolean; error?: string }> {
  if (!SLACK_WEBHOOK_URL) {
    return { success: false, error: "SLACK_WEBHOOK_URL non configure" };
  }

  try {
    const res = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `Slack ${res.status}: ${text}` };
    }

    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[Slack] Erreur:", error);
    return { success: false, error };
  }
}

/**
 * Helpers pour envoyer des notifications formatees.
 */
export async function notifyNewClient(name: string, email: string) {
  return sendSlackNotification({
    text: `Nouveau client : ${name}`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "🎉 Nouveau client", emoji: true },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Nom:*\n${name}` },
          { type: "mrkdwn", text: `*Email:*\n${email}` },
        ],
      },
    ],
  });
}

export async function notifyInvoicePaid(
  invoiceNumber: string,
  amount: number,
  clientName: string,
) {
  return sendSlackNotification({
    text: `Facture ${invoiceNumber} payee (${amount} EUR)`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "💰 Facture payée", emoji: true },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Facture:*\n${invoiceNumber}` },
          { type: "mrkdwn", text: `*Montant:*\n${amount} EUR` },
          { type: "mrkdwn", text: `*Client:*\n${clientName}` },
        ],
      },
    ],
  });
}

export async function notifyNewTicket(
  title: string,
  category: string,
  userName: string,
) {
  return sendSlackNotification({
    text: `Nouveau ticket : ${title}`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "🐛 Nouveau ticket support", emoji: true },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Titre:*\n${title}` },
          { type: "mrkdwn", text: `*Type:*\n${category}` },
          { type: "mrkdwn", text: `*Par:*\n${userName}` },
        ],
      },
    ],
  });
}
