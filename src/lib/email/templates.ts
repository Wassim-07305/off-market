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

// ─── Session reminder ────────────────────

export function sessionReminderEmail(params: {
  clientName: string;
  sessionTitle: string;
  sessionDate: string;
  sessionTime: string;
  coachName: string;
  dashboardUrl: string;
}) {
  const subject = `Rappel — Seance "${params.sessionTitle}" demain`;
  const html = layout(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;font-weight:600;">Rappel de seance</h2>
    <p style="margin:0 0 12px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Bonjour ${params.clientName},
    </p>
    <p style="margin:0 0 20px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Tu as une seance de coaching prevue prochainement :
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:20px;">
      <tr>
        <td style="padding:12px 16px;background-color:#eff6ff;border-radius:8px;border:1px solid #bfdbfe;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="color:#1e40af;font-size:13px;padding:4px 0;">Seance</td>
              <td style="color:#1e40af;font-size:13px;font-weight:600;text-align:right;padding:4px 0;">${params.sessionTitle}</td>
            </tr>
            <tr>
              <td style="color:#1e40af;font-size:13px;padding:4px 0;">Date</td>
              <td style="color:#1e40af;font-size:13px;font-weight:600;text-align:right;padding:4px 0;">${params.sessionDate}</td>
            </tr>
            <tr>
              <td style="color:#1e40af;font-size:13px;padding:4px 0;">Heure</td>
              <td style="color:#1e40af;font-size:13px;font-weight:600;text-align:right;padding:4px 0;">${params.sessionTime}</td>
            </tr>
            <tr>
              <td style="color:#1e40af;font-size:13px;padding:4px 0;">Coach</td>
              <td style="color:#1e40af;font-size:13px;font-weight:600;text-align:right;padding:4px 0;">${params.coachName}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${button("Voir mes seances", params.dashboardUrl)}
    <p style="margin:0;color:#a1a1aa;font-size:12px;">
      Prepare tes questions et objectifs pour profiter au maximum de cette seance !
    </p>
  `);
  return { subject, html };
}

// ─── Check-in reminder ────────────────────

export function checkinReminderEmail(params: {
  clientName: string;
  weekLabel: string;
  checkinUrl: string;
}) {
  const subject = `N'oublie pas ton check-in de la semaine !`;
  const html = layout(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;font-weight:600;">Check-in hebdomadaire</h2>
    <p style="margin:0 0 12px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Bonjour ${params.clientName},
    </p>
    <p style="margin:0 0 20px;color:#3f3f46;font-size:14px;line-height:1.6;">
      C'est le moment de faire ton bilan de la semaine du <strong>${params.weekLabel}</strong> !
      Le check-in est essentiel pour suivre ta progression et permettre a ton coach de t'accompagner au mieux.
    </p>
    <ul style="margin:0 0 20px;padding-left:20px;color:#3f3f46;font-size:14px;line-height:1.8;">
      <li>Comment te sens-tu cette semaine ?</li>
      <li>Quels sont tes wins et tes blocages ?</li>
      <li>Quels objectifs pour la semaine prochaine ?</li>
    </ul>
    ${button("Faire mon check-in", params.checkinUrl)}
    <p style="margin:0;color:#a1a1aa;font-size:12px;">
      Le check-in ne prend que 2 minutes et te rapporte de l'XP !
    </p>
  `);
  return { subject, html };
}

// ─── Badge earned ────────────────────

export function badgeEarnedEmail(params: {
  clientName: string;
  badgeName: string;
  badgeDescription: string;
  xpEarned: number;
  dashboardUrl: string;
}) {
  const subject = `Bravo ! Tu as debloque le badge "${params.badgeName}"`;
  const html = layout(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;font-weight:600;">Nouveau badge debloque !</h2>
    <p style="margin:0 0 12px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Felicitations ${params.clientName} !
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:20px;">
      <tr>
        <td align="center" style="padding:24px 16px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:12px;">
          <p style="margin:0 0 4px;color:#92400e;font-size:18px;font-weight:700;">${params.badgeName}</p>
          <p style="margin:0;color:#a16207;font-size:13px;">${params.badgeDescription}</p>
          <p style="margin:12px 0 0;color:#92400e;font-size:13px;font-weight:600;">+${params.xpEarned} XP</p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 20px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Continue comme ca, tu es sur la bonne voie ! Retrouve tous tes badges dans ton espace.
    </p>
    ${button("Voir mes badges", params.dashboardUrl)}
  `);
  return { subject, html };
}

// ─── Coach alert: at-risk student ────────────────────

export function coachAlertEmail(params: {
  coachName: string;
  studentName: string;
  alertType: string;
  severity: string;
  description: string;
  dashboardUrl: string;
}) {
  const severityColors: Record<
    string,
    { bg: string; border: string; text: string }
  > = {
    critical: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
    high: { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412" },
    medium: { bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
    low: { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af" },
  };
  const colors = severityColors[params.severity] ?? severityColors.medium;

  const subject = `Alerte ${params.severity === "critical" ? "CRITIQUE " : ""}— ${params.studentName}`;
  const html = layout(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;font-weight:600;">Alerte coaching</h2>
    <p style="margin:0 0 12px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Bonjour ${params.coachName},
    </p>
    <p style="margin:0 0 20px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Une alerte a ete generee pour l'un de tes eleves :
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:20px;">
      <tr>
        <td style="padding:12px 16px;background-color:${colors.bg};border-radius:8px;border:1px solid ${colors.border};">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="color:${colors.text};font-size:13px;padding:4px 0;">Eleve</td>
              <td style="color:${colors.text};font-size:13px;font-weight:600;text-align:right;padding:4px 0;">${params.studentName}</td>
            </tr>
            <tr>
              <td style="color:${colors.text};font-size:13px;padding:4px 0;">Type</td>
              <td style="color:${colors.text};font-size:13px;font-weight:600;text-align:right;padding:4px 0;">${params.alertType}</td>
            </tr>
            <tr>
              <td style="color:${colors.text};font-size:13px;padding:4px 0;">Severite</td>
              <td style="color:${colors.text};font-size:13px;font-weight:600;text-align:right;padding:4px 0;">${params.severity.toUpperCase()}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 20px;color:#3f3f46;font-size:14px;line-height:1.6;">
      ${params.description}
    </p>
    ${button("Voir le profil eleve", params.dashboardUrl)}
  `);
  return { subject, html };
}

// ─── Weekly/Daily digest ────────────────────

export function digestEmail(params: {
  userName: string;
  period: string;
  stats: {
    newNotifications: number;
    unreadMessages: number;
    upcomingSessions: number;
    xpEarned: number;
  };
  highlights: string[];
  dashboardUrl: string;
}) {
  const highlightsHtml =
    params.highlights.length > 0
      ? `<ul style="margin:0 0 20px;padding-left:20px;color:#3f3f46;font-size:14px;line-height:1.8;">
        ${params.highlights.map((h) => `<li>${h}</li>`).join("")}
      </ul>`
      : "";

  const subject = `Ton resume ${params.period} — ${BRAND_NAME}`;
  const html = layout(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;font-weight:600;">Ton resume ${params.period}</h2>
    <p style="margin:0 0 20px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Bonjour ${params.userName}, voici ce qui s'est passe :
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:20px;">
      <tr>
        <td style="padding:4px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td align="center" style="width:25%;padding:12px 4px;background-color:#f4f4f5;border-radius:8px;">
                <p style="margin:0;color:#18181b;font-size:22px;font-weight:700;">${params.stats.newNotifications}</p>
                <p style="margin:4px 0 0;color:#71717a;font-size:11px;">Notifications</p>
              </td>
              <td style="width:4px;"></td>
              <td align="center" style="width:25%;padding:12px 4px;background-color:#f4f4f5;border-radius:8px;">
                <p style="margin:0;color:#18181b;font-size:22px;font-weight:700;">${params.stats.unreadMessages}</p>
                <p style="margin:4px 0 0;color:#71717a;font-size:11px;">Messages</p>
              </td>
              <td style="width:4px;"></td>
              <td align="center" style="width:25%;padding:12px 4px;background-color:#f4f4f5;border-radius:8px;">
                <p style="margin:0;color:#18181b;font-size:22px;font-weight:700;">${params.stats.upcomingSessions}</p>
                <p style="margin:4px 0 0;color:#71717a;font-size:11px;">Seances</p>
              </td>
              <td style="width:4px;"></td>
              <td align="center" style="width:25%;padding:12px 4px;background-color:#fef3c7;border-radius:8px;">
                <p style="margin:0;color:#92400e;font-size:22px;font-weight:700;">+${params.stats.xpEarned}</p>
                <p style="margin:4px 0 0;color:#a16207;font-size:11px;">XP gagnes</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${highlightsHtml}
    ${button("Acceder a mon espace", params.dashboardUrl)}
    <p style="margin:0;color:#a1a1aa;font-size:12px;">
      Tu peux modifier la frequence de ce digest dans tes parametres de notification.
    </p>
  `);
  return { subject, html };
}

// ─── Contract sign request ────────────────────

export function contractSignEmail(params: {
  clientName: string;
  contractTitle: string;
  createdDate: string;
  expiresDate: string | null;
  signUrl: string;
}) {
  const subject = `Contrat a signer — ${params.contractTitle}`;
  const html = layout(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;font-weight:600;">Contrat a signer</h2>
    <p style="margin:0 0 12px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Bonjour ${params.clientName},
    </p>
    <p style="margin:0 0 20px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Un contrat a ete prepare pour vous et attend votre signature electronique :
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:20px;">
      <tr>
        <td style="padding:12px 16px;background-color:#f4f4f5;border-radius:8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="color:#71717a;font-size:13px;padding:4px 0;">Contrat</td>
              <td style="color:#18181b;font-size:13px;font-weight:600;text-align:right;padding:4px 0;">${params.contractTitle}</td>
            </tr>
            <tr>
              <td style="color:#71717a;font-size:13px;padding:4px 0;">Date</td>
              <td style="color:#18181b;font-size:13px;font-weight:600;text-align:right;padding:4px 0;">${params.createdDate}</td>
            </tr>
            ${
              params.expiresDate
                ? `<tr>
              <td style="color:#71717a;font-size:13px;padding:4px 0;">Expire le</td>
              <td style="color:#dc2626;font-size:13px;font-weight:600;text-align:right;padding:4px 0;">${params.expiresDate}</td>
            </tr>`
                : ""
            }
          </table>
        </td>
      </tr>
    </table>
    ${button("Signer le contrat", params.signUrl)}
    <p style="margin:0;color:#a1a1aa;font-size:12px;">
      Ce lien vous permet de consulter et signer votre contrat en ligne. Aucun compte n'est necessaire.
    </p>
  `);
  return { subject, html };
}
