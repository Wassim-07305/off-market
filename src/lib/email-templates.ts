/**
 * Templates email pour Off-Market.
 * Chaque fonction retourne { subject, html }.
 * Style inline, couleur primaire #AF0000, responsive.
 */

const PRIMARY = "#AF0000";
const BG = "#f7f7f7";
const CARD_BG = "#ffffff";
const TEXT = "#333333";
const TEXT_LIGHT = "#666666";

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG};">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${CARD_BG};border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:${PRIMARY};padding:28px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Off-Market</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;color:${TEXT};font-size:15px;line-height:1.6;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 30px;text-align:center;color:${TEXT_LIGHT};font-size:12px;border-top:1px solid #eee;">
              <p style="margin:0;">&copy; ${new Date().getFullYear()} Off-Market. Tous droits reserves.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto;">
  <tr>
    <td style="background-color:${PRIMARY};border-radius:8px;">
      <a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

// ─── Templates ──────────────────────────────────────────────────────────────

export function welcomeEmail(
  name: string,
  loginUrl: string,
): { subject: string; html: string } {
  return {
    subject: "Bienvenue sur Off-Market !",
    html: layout(`
      <h2 style="margin:0 0 16px;color:${PRIMARY};font-size:20px;">Bienvenue, ${name} !</h2>
      <p style="margin:0 0 12px;">Votre compte Off-Market a ete cree avec succes. Vous pouvez desormais acceder a votre espace personnel.</p>
      <p style="margin:0 0 8px;">Voici ce que vous pouvez faire :</p>
      <ul style="margin:0 0 16px;padding-left:20px;color:${TEXT_LIGHT};">
        <li>Gerer vos clients et votre pipeline</li>
        <li>Acceder a vos formations</li>
        <li>Suivre vos performances</li>
      </ul>
      ${button("Se connecter", loginUrl)}
      <p style="margin:0;color:${TEXT_LIGHT};font-size:13px;">Si vous n'avez pas cree ce compte, vous pouvez ignorer cet email.</p>
    `),
  };
}

export function invitationEmail(
  name: string,
  inviterName: string,
  role: string,
  inviteUrl: string,
): { subject: string; html: string } {
  return {
    subject: `${inviterName} vous invite a rejoindre Off-Market`,
    html: layout(`
      <h2 style="margin:0 0 16px;color:${PRIMARY};font-size:20px;">Bonjour ${name},</h2>
      <p style="margin:0 0 12px;"><strong>${inviterName}</strong> vous invite a rejoindre Off-Market en tant que <strong>${role}</strong>.</p>
      <p style="margin:0 0 8px;">Cliquez sur le bouton ci-dessous pour accepter l'invitation et creer votre compte :</p>
      ${button("Accepter l'invitation", inviteUrl)}
      <p style="margin:0;color:${TEXT_LIGHT};font-size:13px;">Ce lien est valable pendant 7 jours. Si vous n'etes pas concerne, ignorez cet email.</p>
    `),
  };
}

export function passwordResetEmail(
  name: string,
  resetUrl: string,
): { subject: string; html: string } {
  return {
    subject: "Reinitialisation de votre mot de passe Off-Market",
    html: layout(`
      <h2 style="margin:0 0 16px;color:${PRIMARY};font-size:20px;">Bonjour ${name},</h2>
      <p style="margin:0 0 12px;">Vous avez demande la reinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en definir un nouveau :</p>
      ${button("Reinitialiser mon mot de passe", resetUrl)}
      <p style="margin:0 0 8px;color:${TEXT_LIGHT};font-size:13px;">Ce lien expire dans 1 heure.</p>
      <p style="margin:0;color:${TEXT_LIGHT};font-size:13px;">Si vous n'avez pas fait cette demande, ignorez cet email. Votre mot de passe restera inchange.</p>
    `),
  };
}

export function callReminderEmail(
  name: string,
  coachName: string,
  date: string,
  time: string,
  callUrl: string,
): { subject: string; html: string } {
  return {
    subject: `Rappel : appel avec ${coachName} le ${date}`,
    html: layout(`
      <h2 style="margin:0 0 16px;color:${PRIMARY};font-size:20px;">Rappel d'appel</h2>
      <p style="margin:0 0 12px;">Bonjour ${name},</p>
      <p style="margin:0 0 16px;">Vous avez un appel programme avec <strong>${coachName}</strong> :</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background-color:#fafafa;border-radius:8px;padding:16px;width:100%;">
        <tr>
          <td style="padding:16px;">
            <p style="margin:0 0 8px;font-size:14px;color:${TEXT_LIGHT};">Date</p>
            <p style="margin:0 0 16px;font-size:16px;font-weight:600;">${date}</p>
            <p style="margin:0 0 8px;font-size:14px;color:${TEXT_LIGHT};">Heure</p>
            <p style="margin:0;font-size:16px;font-weight:600;">${time}</p>
          </td>
        </tr>
      </table>
      ${button("Rejoindre l'appel", callUrl)}
    `),
  };
}

export function invoiceEmail(
  name: string,
  invoiceNumber: string,
  amount: string,
  dueDate: string,
  payUrl: string,
): { subject: string; html: string } {
  return {
    subject: `Nouvelle facture #${invoiceNumber} — ${amount}`,
    html: layout(`
      <h2 style="margin:0 0 16px;color:${PRIMARY};font-size:20px;">Nouvelle facture</h2>
      <p style="margin:0 0 12px;">Bonjour ${name},</p>
      <p style="margin:0 0 16px;">Une nouvelle facture a ete generee pour votre compte :</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background-color:#fafafa;border-radius:8px;width:100%;">
        <tr>
          <td style="padding:16px;">
            <p style="margin:0 0 4px;font-size:13px;color:${TEXT_LIGHT};">Numero</p>
            <p style="margin:0 0 12px;font-size:15px;font-weight:600;">#${invoiceNumber}</p>
            <p style="margin:0 0 4px;font-size:13px;color:${TEXT_LIGHT};">Montant</p>
            <p style="margin:0 0 12px;font-size:15px;font-weight:600;">${amount}</p>
            <p style="margin:0 0 4px;font-size:13px;color:${TEXT_LIGHT};">Echeance</p>
            <p style="margin:0;font-size:15px;font-weight:600;">${dueDate}</p>
          </td>
        </tr>
      </table>
      ${button("Payer maintenant", payUrl)}
    `),
  };
}

export function paymentReminderEmail(
  name: string,
  invoiceNumber: string,
  amount: string,
  daysOverdue: number,
): { subject: string; html: string } {
  return {
    subject: `Relance : facture #${invoiceNumber} en retard de ${daysOverdue} jour${daysOverdue > 1 ? "s" : ""}`,
    html: layout(`
      <h2 style="margin:0 0 16px;color:${PRIMARY};font-size:20px;">Relance de paiement</h2>
      <p style="margin:0 0 12px;">Bonjour ${name},</p>
      <p style="margin:0 0 12px;">La facture <strong>#${invoiceNumber}</strong> d'un montant de <strong>${amount}</strong> est en retard de <strong>${daysOverdue} jour${daysOverdue > 1 ? "s" : ""}</strong>.</p>
      <p style="margin:0 0 16px;">Merci de proceder au reglement dans les meilleurs delais.</p>
      <p style="margin:0;color:${TEXT_LIGHT};font-size:13px;">Si vous avez deja effectue le paiement, veuillez ignorer ce message.</p>
    `),
  };
}

export function checkinReminderEmail(
  name: string,
): { subject: string; html: string } {
  return {
    subject: "Rappel : votre check-in hebdomadaire vous attend",
    html: layout(`
      <h2 style="margin:0 0 16px;color:${PRIMARY};font-size:20px;">Check-in hebdomadaire</h2>
      <p style="margin:0 0 12px;">Bonjour ${name},</p>
      <p style="margin:0 0 12px;">C'est le moment de faire votre check-in hebdomadaire ! Prenez quelques minutes pour :</p>
      <ul style="margin:0 0 16px;padding-left:20px;color:${TEXT_LIGHT};">
        <li>Evaluer votre semaine</li>
        <li>Definir vos objectifs pour la semaine prochaine</li>
        <li>Partager vos reflexions dans votre journal</li>
      </ul>
      <p style="margin:0;color:${TEXT_LIGHT};font-size:13px;">Votre progression compte — ne sautez pas cette etape !</p>
    `),
  };
}

export function badgeUnlockedEmail(
  name: string,
  badgeName: string,
  badgeEmoji: string,
): { subject: string; html: string } {
  return {
    subject: `${badgeEmoji} Nouveau badge debloque : ${badgeName}`,
    html: layout(`
      <div style="text-align:center;">
        <p style="font-size:48px;margin:0 0 8px;">${badgeEmoji}</p>
        <h2 style="margin:0 0 16px;color:${PRIMARY};font-size:20px;">Felicitations ${name} !</h2>
        <p style="margin:0 0 12px;font-size:16px;">Vous avez debloque le badge</p>
        <p style="margin:0 0 20px;font-size:20px;font-weight:700;color:${PRIMARY};">${badgeName}</p>
        <p style="margin:0;color:${TEXT_LIGHT};font-size:14px;">Continuez comme ca pour debloquer encore plus de badges !</p>
      </div>
    `),
  };
}

export function digestEmail(
  name: string,
  items: { title: string; description: string }[],
): { subject: string; html: string } {
  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #eee;">
        <p style="margin:0 0 4px;font-weight:600;font-size:14px;">${item.title}</p>
        <p style="margin:0;color:${TEXT_LIGHT};font-size:13px;">${item.description}</p>
      </td>
    </tr>`,
    )
    .join("");

  return {
    subject: "Votre resume hebdomadaire Off-Market",
    html: layout(`
      <h2 style="margin:0 0 16px;color:${PRIMARY};font-size:20px;">Resume de la semaine</h2>
      <p style="margin:0 0 20px;">Bonjour ${name}, voici votre resume hebdomadaire :</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
        ${itemsHtml}
      </table>
      <p style="margin:20px 0 0;color:${TEXT_LIGHT};font-size:13px;">A la semaine prochaine !</p>
    `),
  };
}

// ─── Template registry ──────────────────────────────────────────────────────

export type TemplateName =
  | "welcome"
  | "invitation"
  | "password-reset"
  | "call-reminder"
  | "invoice"
  | "payment-reminder"
  | "checkin-reminder"
  | "badge-unlocked"
  | "digest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const templateMap: Record<TemplateName, (...args: any[]) => { subject: string; html: string }> = {
  welcome: (data: { name: string; loginUrl: string }) =>
    welcomeEmail(data.name, data.loginUrl),
  invitation: (data: { name: string; inviterName: string; role: string; inviteUrl: string }) =>
    invitationEmail(data.name, data.inviterName, data.role, data.inviteUrl),
  "password-reset": (data: { name: string; resetUrl: string }) =>
    passwordResetEmail(data.name, data.resetUrl),
  "call-reminder": (data: { name: string; coachName: string; date: string; time: string; callUrl: string }) =>
    callReminderEmail(data.name, data.coachName, data.date, data.time, data.callUrl),
  invoice: (data: { name: string; invoiceNumber: string; amount: string; dueDate: string; payUrl: string }) =>
    invoiceEmail(data.name, data.invoiceNumber, data.amount, data.dueDate, data.payUrl),
  "payment-reminder": (data: { name: string; invoiceNumber: string; amount: string; daysOverdue: number }) =>
    paymentReminderEmail(data.name, data.invoiceNumber, data.amount, data.daysOverdue),
  "checkin-reminder": (data: { name: string }) =>
    checkinReminderEmail(data.name),
  "badge-unlocked": (data: { name: string; badgeName: string; badgeEmoji: string }) =>
    badgeUnlockedEmail(data.name, data.badgeName, data.badgeEmoji),
  digest: (data: { name: string; items: { title: string; description: string }[] }) =>
    digestEmail(data.name, data.items),
};

/**
 * Resout un template par nom et retourne { subject, html }.
 */
export function resolveTemplate(
  template: TemplateName,
  data: Record<string, unknown>,
): { subject: string; html: string } {
  const fn = templateMap[template];
  if (!fn) {
    throw new Error(`Template inconnu : ${template}`);
  }
  return fn(data);
}
