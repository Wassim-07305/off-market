// Off-Market email templates — all in French, inline CSS for email compatibility

const BRAND_COLOR = "#6366f1";
const BRAND_NAME = "Off-Market";

function layout(content: string) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND_COLOR};padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">${BRAND_NAME}</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e4e4e7;">
              <p style="margin:0;color:#a1a1aa;font-size:12px;line-height:1.5;">
                ${BRAND_NAME} — Plateforme de Coaching & Gestion Business<br>
                Cet email a ete envoye automatiquement. Merci de ne pas y repondre directement.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(text: string, url: string) {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background-color:${BRAND_COLOR};border-radius:8px;padding:12px 24px;">
      <a href="${url}" style="color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;display:inline-block;">${text}</a>
    </td>
  </tr>
</table>`;
}

// ─── Invoice sent to client ────────────────────

export function invoiceSentEmail(params: {
  clientName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  payUrl: string;
}) {
  const subject = `Facture ${params.invoiceNumber} — ${params.amount}`;
  const html = layout(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;font-weight:600;">Nouvelle facture</h2>
    <p style="margin:0 0 12px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Bonjour ${params.clientName},
    </p>
    <p style="margin:0 0 20px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Une nouvelle facture a ete emise pour votre accompagnement :
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:20px;">
      <tr>
        <td style="padding:12px 16px;background-color:#f4f4f5;border-radius:8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="color:#71717a;font-size:13px;padding:4px 0;">Numero</td>
              <td style="color:#18181b;font-size:13px;font-weight:600;text-align:right;padding:4px 0;">${params.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="color:#71717a;font-size:13px;padding:4px 0;">Montant TTC</td>
              <td style="color:#18181b;font-size:13px;font-weight:600;text-align:right;padding:4px 0;">${params.amount}</td>
            </tr>
            <tr>
              <td style="color:#71717a;font-size:13px;padding:4px 0;">Echeance</td>
              <td style="color:#18181b;font-size:13px;font-weight:600;text-align:right;padding:4px 0;">${params.dueDate}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${button("Payer maintenant", params.payUrl)}
    <p style="margin:0;color:#a1a1aa;font-size:12px;">
      Vous pouvez egalement retrouver cette facture dans votre espace client.
    </p>
  `);
  return { subject, html };
}

// ─── Payment confirmed ────────────────────

export function paymentConfirmedEmail(params: {
  clientName: string;
  invoiceNumber: string;
  amount: string;
  paidDate: string;
  dashboardUrl: string;
}) {
  const subject = `Paiement confirme — Facture ${params.invoiceNumber}`;
  const html = layout(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;font-weight:600;">Paiement recu !</h2>
    <p style="margin:0 0 12px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Bonjour ${params.clientName},
    </p>
    <p style="margin:0 0 20px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Nous confirmons la reception de votre paiement. Merci !
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:20px;">
      <tr>
        <td style="padding:12px 16px;background-color:#ecfdf5;border-radius:8px;border:1px solid #a7f3d0;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="color:#047857;font-size:13px;padding:4px 0;">Facture</td>
              <td style="color:#047857;font-size:13px;font-weight:600;text-align:right;padding:4px 0;">${params.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="color:#047857;font-size:13px;padding:4px 0;">Montant paye</td>
              <td style="color:#047857;font-size:13px;font-weight:600;text-align:right;padding:4px 0;">${params.amount}</td>
            </tr>
            <tr>
              <td style="color:#047857;font-size:13px;padding:4px 0;">Date</td>
              <td style="color:#047857;font-size:13px;font-weight:600;text-align:right;padding:4px 0;">${params.paidDate}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${button("Acceder a mon espace", params.dashboardUrl)}
    <p style="margin:0;color:#a1a1aa;font-size:12px;">
      Votre facture PDF est disponible dans votre espace Factures.
    </p>
  `);
  return { subject, html };
}

// ─── Invitation email ────────────────────

export function invitationEmail(params: {
  inviterName: string;
  role: string;
  inviteUrl: string;
}) {
  const roleLabels: Record<string, string> = {
    client: "Eleve",
    coach: "Coach",
    admin: "Administrateur",
    setter: "Setter",
    closer: "Closer",
    sales: "Sales",
  };
  const roleLabel = roleLabels[params.role] ?? params.role;
  const subject = `Vous etes invite a rejoindre ${BRAND_NAME}`;
  const html = layout(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;font-weight:600;">Vous etes invite !</h2>
    <p style="margin:0 0 12px;color:#3f3f46;font-size:14px;line-height:1.6;">
      ${params.inviterName} vous invite a rejoindre <strong>${BRAND_NAME}</strong> en tant que <strong>${roleLabel}</strong>.
    </p>
    <p style="margin:0 0 20px;color:#3f3f46;font-size:14px;line-height:1.6;">
      ${BRAND_NAME} est votre plateforme tout-en-un pour le coaching, la formation et le suivi de votre progression.
    </p>
    ${button("Accepter l'invitation", params.inviteUrl)}
    <p style="margin:0;color:#a1a1aa;font-size:12px;">
      Ce lien est valable 7 jours. Si vous n'avez pas demande cette invitation, ignorez cet email.
    </p>
  `);
  return { subject, html };
}

// ─── Welcome email ────────────────────

export function welcomeEmail(params: {
  clientName: string;
  dashboardUrl: string;
}) {
  const subject = `Bienvenue sur ${BRAND_NAME} !`;
  const html = layout(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;font-weight:600;">Bienvenue, ${params.clientName} !</h2>
    <p style="margin:0 0 12px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Votre compte ${BRAND_NAME} est maintenant actif. Nous sommes ravis de vous accompagner dans votre parcours.
    </p>
    <p style="margin:0 0 20px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Voici vos prochaines etapes :
    </p>
    <ul style="margin:0 0 20px;padding-left:20px;color:#3f3f46;font-size:14px;line-height:1.8;">
      <li>Completez votre profil</li>
      <li>Decouvrez vos formations</li>
      <li>Planifiez votre premier appel coaching</li>
    </ul>
    ${button("Acceder a mon espace", params.dashboardUrl)}
  `);
  return { subject, html };
}

// ─── Payment reminder ────────────────────

export function paymentReminderEmail(params: {
  clientName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  daysOverdue: number;
  payUrl: string;
}) {
  const urgency =
    params.daysOverdue > 14
      ? "Dernier rappel"
      : params.daysOverdue > 7
        ? "Second rappel"
        : "Rappel";

  const subject = `${urgency} — Facture ${params.invoiceNumber} en attente`;
  const html = layout(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;font-weight:600;">${urgency} de paiement</h2>
    <p style="margin:0 0 12px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Bonjour ${params.clientName},
    </p>
    <p style="margin:0 0 20px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Votre facture <strong>${params.invoiceNumber}</strong> d'un montant de <strong>${params.amount}</strong>
      ${
        params.daysOverdue > 0
          ? `est en retard de ${params.daysOverdue} jour${params.daysOverdue > 1 ? "s" : ""}.`
          : `arrive a echeance le ${params.dueDate}.`
      }
    </p>
    ${button("Payer maintenant", params.payUrl)}
    <p style="margin:0;color:#a1a1aa;font-size:12px;">
      Si vous avez deja effectue le paiement, merci d'ignorer cet email.
    </p>
  `);
  return { subject, html };
}
