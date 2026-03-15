# Suivi d'avancement - Cahier des Charges Off-Market

> Derniere mise a jour : 2026-03-16
> Avancement global : **~99%** (CDC technique) / **~98%** (besoins Alexia Call1+Call2)

---

## Legende

| Symbole | Signification              |
| ------- | -------------------------- |
| Done    | Fonctionnalite implementee |
| Partiel | Partiellement implementee  |
| Manque  | Non implementee            |

---

## 3. Tableau de Bord

| Ref  | Fonctionnalite           | Statut | Notes                                                                                           |
| ---- | ------------------------ | ------ | ----------------------------------------------------------------------------------------------- |
| F1   | Dashboard Admin          | Done   | KPIs, utilisateurs, alertes                                                                     |
| F2   | Dashboard Coach          | Done   | Eleves, alertes, progression, activite                                                          |
| F3   | Dashboard Client         | Done   | Progression, XP, badges, appels                                                                 |
| F4   | Dashboard Sales          | Done   | KPIs financiers, MRR, forecast, top clients (Sprint 22)                                         |
| F4.1 | Widgets KPI              | Done   | MRR/ARR, retention, NPS basique                                                                 |
| F4.2 | Graphiques & Historiques | Done   | Courbes revenus + export + heatmaps activite + comparaisons periodes + closing rate (Sprint 38) |

### Manques Dashboard

- [x] Export PDF/Excel des rapports (Sprint 25)
- [x] Heatmaps d'activite par jour/heure (activity-heatmap.tsx Sprint 38)
- [x] Comparaisons periode a periode (period-comparison.tsx Sprint 38)
- [x] Widgets configurables (drag-drop dashboard) — widget-grid.tsx + use-dashboard-layout.ts + dashboard_layouts table (Sprint 39)

---

## 4. CRM & Suivi des Eleves

| Ref  | Fonctionnalite             | Statut  | Notes                                                                      |
| ---- | -------------------------- | ------- | -------------------------------------------------------------------------- |
| F5   | Fiches Eleves              | Done    | Profil, historique, notes, contrats, statut                                |
| F6   | Tags d'Engagement          | Done    | VIP, Standard, New, At-Risk, Churned + couleurs                            |
| F7   | Pipeline Etudiant          | Done    | Kanban drag-drop + vue liste + filtres                                     |
| F8   | Alertes Automatiques Coach | Done    | Inactivite, at-risk, objectifs, check-in                                   |
| F8.1 | Visualisations Pipeline    | Done    | Kanban + Liste + Timeline + Bulk actions (Sprint 26)                       |
| F8.2 | Segmentation et Filtrage   | Partiel | Filtres par tag, recherche. Manque segments sauvegardes, export CSV avance |

### Manques CRM

- [x] Vue Timeline (progression temporelle) (Sprint 26)
- [x] Bulk actions (modifier plusieurs eleves) (Sprint 26)
- [x] Segments sauvegardes et partageables — saved-segments.tsx + use-saved-segments.ts + table Supabase (Sprint 40)
- [x] Historique des mouvements pipeline avec timestamps (Sprint 26)

---

## 5. Formation (LMS)

| Ref   | Fonctionnalite             | Statut  | Notes                                                                          |
| ----- | -------------------------- | ------- | ------------------------------------------------------------------------------ |
| F9    | Cours et Modules           | Done    | Hierarchie cours > modules > lecons                                            |
| F10   | School Builder             | Done    | Drag-drop, types de contenu, editeur                                           |
| F11   | Quiz et Exercices          | Done    | Quiz player + timer, soumission exercices, correction coach, stats (Sprint 24) |
| F12   | Progression et Tracking    | Done    | Pourcentage completion, lecons completees                                      |
| F12.1 | Parcours d'Apprentissage   | Done    | Prerequis entre cours, verrouillage, gate page, gestion admin (Sprint 28)      |
| F12.2 | Contenus Multimedias       | Partiel | Video (YouTube/Vimeo) OK. Manque audio, embeds Figma/Miro                      |
| F12.3 | Gamification Apprentissage | Done    | XP par lecon, badges completion, streaks                                       |

### Manques LMS

- [x] Interface quiz avec scoring automatique (Sprint 24)
- [x] Correction manuelle exercices par coach (Sprint 24)
- [x] Stats quiz/exercices pour coach (Sprint 24)
- [x] Timer quiz avec auto-submit (Sprint 24)
- [x] Certificats de completion (certificate-card.tsx + use-certificates.ts)
- [x] Parcours d'apprentissage avec prerequis (Sprint 28)
- [ ] Support audio/podcast
- [ ] Embeds externes (Figma, Miro, Google Docs)

---

## 6. Messagerie

| Ref   | Fonctionnalite             | Statut  | Notes                                                                        |
| ----- | -------------------------- | ------- | ---------------------------------------------------------------------------- |
| F13   | Chat Temps Reel            | Done    | Messages, typing, fichiers, reactions, edit/delete                           |
| F14   | Canaux et Fils             | Done    | Canaux publics/prives, threads, mentions                                     |
| F15   | Assistant IA Chat          | Done    | Slash commands /resume /translate /suggest integres dans chat (Sprint 38)    |
| F16   | Recherche et Notifications | Partiel | Recherche messages OK. Notifications in-app OK                               |
| F16.1 | Canaux Personnalises       | Done    | Publics, prives, par equipe, permissions                                     |
| F16.2 | Gestion Conversations      | Done    | Favoris (bookmarks), mute, epinglage, templates reponses rapides (Sprint 37) |

### Manques Messagerie

- [x] Epinglage de messages (is_pinned dans schema messages)
- [x] Templates / reponses rapides (template-picker.tsx + template-manager-modal.tsx Sprint 37)
- [x] Archive de conversations (Sprint 38)
- [x] IA integree dans le chat — /resume, /translate, /suggest (Sprint 38)
- [x] Mode "Do Not Disturb" — hook + header toggle + durees (Sprint 38)

---

## 7. Appels & Calendrier

| Ref   | Fonctionnalite            | Statut | Notes                                                                |
| ----- | ------------------------- | ------ | -------------------------------------------------------------------- |
| F17   | Planification d'Appels    | Done   | Slots, reservation, calendrier semaine/liste                         |
| F18   | Calendrier Integre        | Done   | Vue semaine, sync Google Calendar                                    |
| F19   | Appels Video WebRTC       | Done   | Video room, controles, screen sharing                                |
| F20   | Transcription Automatique | Done   | Transcription + enregistrement video + player + download (Sprint 38) |
| F20.1 | Rescheduling et Absence   | Done   | Report avec raison, date originale tracee (Sprint 23)                |
| F20.2 | Notes et Follow-up        | Done   | Notes post-appel, templates, action items (Sprint 23)                |
| F20.3 | Metriques et Reporting    | Done   | KPIs, taux completion, satisfaction, par type/jour (Sprint 23)       |

### Manques Appels

- [x] Enregistrement des appels video (Sprint 38)
- [x] UI de lecture des transcriptions — recording-player.tsx (Sprint 38)
- [x] Export transcriptions en PDF/texte — transcript-panel.tsx + /api/transcriptions/live/pdf (Sprint 40)
- [ ] Rappels email/SMS avant appel
- [ ] Support multi-participants (appels groupe)

---

## 8. Gamification

| Ref   | Fonctionnalite            | Statut | Notes                                                                                                             |
| ----- | ------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| F21   | Systeme XP et Progression | Done   | Points, niveaux, leaderboard                                                                                      |
| F22   | Badges et Achievements    | Done   | Badges visuels, conditions, notifications                                                                         |
| F23   | Leaderboard               | Done   | Global, podium top 3, position personnelle                                                                        |
| F24   | Challenges Hebdomadaires  | Done   | Types varies, progression, participants                                                                           |
| F25   | Check-Ins Quotidiens      | Done   | Check-in matinal + soir, mood, energie (Sprint 21)                                                                |
| F25.1 | Streaks et Habits         | Done   | Streak tracking, compteur                                                                                         |
| F25.2 | Social Proof              | Done   | Leaderboard avec filtres semaine/mois/tout + rank changes (Sprint 38)                                             |
| F25.3 | Rewards et Privileges     | Done   | Catalogue rewards, redemption XP, admin gestion, stock (use-rewards.ts + admin-rewards.tsx + rewards-catalog.tsx) |

### Manques Gamification

- [x] Systeme de rewards/redemption (convertir XP en avantages) (Sprint 36)
- [x] Filtres leaderboard (semaine/mois/tout) (Sprint 38)
- [x] Anonymat optionnel leaderboard — leaderboard_anonymous sur profiles + UI (Sprint 39)
- [x] Team competitions / defis d'equipe — use-competitions.ts + team-card.tsx + competition tables (Sprint 39)
- [x] Badges rares et exclusifs configurables par admin — use-badges.ts + 5 rarites (Sprint 40)

---

## 9. Journal & Check-Ins

| Ref | Fonctionnalite           | Statut  | Notes                                                   |
| --- | ------------------------ | ------- | ------------------------------------------------------- |
| F26 | Journal de Coaching      | Done    | Edition libre, calendrier, historique                   |
| F27 | Check-Ins Structures     | Done    | Mood, energie, gratitudes, objectifs, notes (Sprint 21) |
| F28 | Suivi Objectifs Coaching | Partiel | Hook useCoachingGoals existe. UI limitee                |

### Manques Journal

- [x] Prompts guides pour le journal — use-journal-prompts.ts + journal-prompt-card.tsx (existait)
- [x] Medias (images, attachements) dans journal — media-upload.tsx + journal-media bucket (existait)
- [x] Journal prive vs partage avec coach — share-toggle.tsx + shared_with_coach flag (existait)
- [x] Export journal en PDF — jspdf + modal date range (Sprint 40)
- [x] Rapports automatises sur tendances check-in — useCheckinTrends avec insights mood/energy (Sprint 40)
- [x] Objectifs SMART avec sous-objectifs et jalons — use-coaching-goals.ts avec target/current/deadline (existait)

---

## 10. Formulaires (Form Builder)

| Ref   | Fonctionnalite               | Statut  | Notes                                                                                               |
| ----- | ---------------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| F29   | Editeur Drag-and-Drop        | Done    | @dnd-kit, library de champs, preview                                                                |
| F30   | Types de Champs              | Done    | Text, email, phone, select, rating, NPS, date, file, etc.                                           |
| F31   | Logique Conditionnelle       | Done    | Show/hide, conditions, operateurs                                                                   |
| F32   | Collecte et Gestion Reponses | Partiel | Stockage + export CSV/PDF OK (Sprint 25). Manque rapports agreges, webhooks                         |
| F32.1 | Evaluations et Sondages      | Partiel | NPS/rating OK. Manque CSAT, pre/post tests                                                          |
| F32.2 | Intake et Onboarding Forms   | Partiel | Formulaire onboarding basique                                                                       |
| F32.3 | Lead Magnet Forms            | Done    | Formulaires publics capture leads + scoring + stats admin (use-lead-magnet.ts + /api/leads/capture) |

### Manques Formulaires

- [x] Export reponses CSV/Excel (Sprint 25)
- [x] Lead magnet forms publics (Sprint 36)
- [x] Rapports agreges avec statistiques — useFormAnalytics avec NPS score, field summaries (Sprint 40)
- [x] Templates de formulaires pre-construits — 8 templates (NPS, CSAT, onboarding, feedback, etc.) (Sprint 40)
- [x] Webhooks sur soumission — /api/forms/submit + dispatchWebhook("form.submitted") (Sprint 40)
- [x] Alertes si reponse critique (NPS < 5) — useNpsAlerts avec alertes critiques auto (Sprint 40)

---

## 11. Contrats & Facturation

| Ref   | Fonctionnalite             | Statut | Notes                                                                                       |
| ----- | -------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| F33   | Gestion des Contrats       | Done   | Templates, creation, envoi, statuts                                                         |
| F34   | Facturation Automatique    | Done   | Generation factures, PDF, numerotation                                                      |
| F35   | Gestion des Paiements      | Done   | Stripe complet + Wise API + refunds (Sprint 35)                                             |
| F36   | Relances Automatiques      | Done   | 5 relances auto + cron dispatch email (Sprint 35)                                           |
| F37   | Rapports Financiers        | Done   | MRR/ARR, graphiques, forecast (Sprint 22)                                                   |
| F37.1 | Signatures Electroniques   | Done   | E-signature integree : signature-pad.tsx + /api/contracts/[id]/sign + metadata IP/timestamp |
| F37.2 | Gestion Renouvellements    | Done   | Facturation recurrente via echeanciers (Sprint 35)                                          |
| F37.3 | Gestion Refunds et Credits | Done   | Remboursement total/partiel via Stripe (Sprint 35)                                          |

### Manques Facturation

- [x] E-signature integree (Sprint 36)
- [x] Renouvellement automatique contrats — useContractRenewal + contrats expirants (Sprint 40)
- [x] Gestion remboursements partiels/totaux (Sprint 35)
- [x] Integration Wise (virements internationaux) (Sprint 35)
- [x] Facturation recurrente automatique (Sprint 35)
- [ ] Multi-devises

---

## 12. Communaute (Feed)

| Ref   | Fonctionnalite              | Statut  | Notes                                                                                                          |
| ----- | --------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| F38   | Feed Social                 | Done    | Posts, likes, commentaires, types, moderation                                                                  |
| F39   | Partage Wins & Achievements | Partiel | Posts type "victory" OK. Manque templates wins                                                                 |
| F40   | Profils Publics             | Done    | Page profil complete: avatar, role, bio, follow/unfollow, stats XP/badges/followers, posts recents (Sprint 27) |
| F40.1 | Regles Communautaires       | Partiel | Moderation OK. Manque code of conduct affiche                                                                  |
| F40.2 | Moderation et Reporting     | Done    | Report, admin review, pin, delete                                                                              |
| F40.3 | Communautes Specialisees    | Done    | Sous-communautes thematiques avec cards, CRUD, feed filtre (Sprint 38)                                         |

### Manques Communaute

- [x] Profils publics complets (badges, wins, stats, follow) (Sprint 27)
- [x] Systeme follow/unfollow (Sprint 27)
- [x] Sous-communautes par niche/interet — communities tables + hooks (Sprint 38)
- [x] Commentaires imbriques (nested replies) — parent_id + tree building + comment-thread.tsx (Sprint 40)
- [x] Trending posts / most liked — useTrendingPosts + useMostLikedPosts + trending-sidebar (Sprint 40)

---

## 13. Onboarding

| Ref   | Fonctionnalite         | Statut | Notes                                                                                 |
| ----- | ---------------------- | ------ | ------------------------------------------------------------------------------------- |
| F41   | Flow Onboarding Client | Done   | Walkthrough interactif avec tooltips, visite guidee plateforme (Sprint 30)            |
| F42   | Checklist Onboarding   | Done   | Checklist 6 etapes + XP rewards + banniere rappel + integration dashboard (Sprint 30) |
| F42.1 | Engagement Progressif  | Manque | Pas de pacing jour 1/2-3/4-5/semaine 2                                                |
| F42.2 | Support et Assistance  | Manque | Pas de chatbot onboarding, FAQ                                                        |
| F42.3 | Personnalisation       | Manque | Pas de chemins differencies selon profil                                              |

### Manques Onboarding

- [x] Walkthrough interactif avec tooltips (Sprint 30)
- [x] Videos guides integrees (csm-video-step.tsx Sprint 37)
- [x] Recompenses XP a chaque etape completee (Sprint 30)
- [x] Personnalisation selon type d'offre/formation — onboarding branching via onboarding answers (existait)
- [x] Chatbot d'assistance onboarding — use-onboarding-chat.ts avec 6 etapes conversationnelles (existait)

---

## 14. Intelligence Artificielle

| Ref   | Fonctionnalite             | Statut  | Notes                                                                           |
| ----- | -------------------------- | ------- | ------------------------------------------------------------------------------- |
| F43   | Assistant IA Coaching      | Done    | Chat Claude, prompts coaching, historique conversations                         |
| F44   | Analyse de Risque Eleve    | Done    | Analyse auto multi-facteurs, health_score, alertes, recommandations (Sprint 29) |
| F45   | Generation de Contenu      | Partiel | IA genere sur demande. Pas de workflow automatise                               |
| F46   | Insights Coaching          | Partiel | Reponses IA OK. Manque rapports periodiques auto                                |
| F46.1 | Transparence IA            | Manque  | Pas de labels "reponse IA", confidence scores                                   |
| F46.2 | Confidentialite Donnees IA | Partiel | Donnees non partagees. Manque consentement explicite                            |
| F46.3 | Bias et Fairness           | Manque  | Pas d'audit de biais                                                            |

### Manques IA

- [x] Analyse de risque automatique (scoring at-risk) (Sprint 29)
- [x] Rapports IA periodiques generes automatiquement — ai-periodic-report.tsx + /api/ai/periodic-report (Sprint 40)
- [x] Labels "Reponse IA" vs humain — ai-response-badge.tsx sur messages IA + FAQ (Sprint 40)
- [x] Integration IA dans messagerie (slash commands) — /resume /translate /suggest (Sprint 38)
- [x] Consentement explicite pour usage IA — ai-consent-modal.tsx + use-ai-consent.ts + settings toggle (Sprint 40)

---

## 15. Notifications

| Ref   | Fonctionnalite            | Statut  | Notes                                                                                                                            |
| ----- | ------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| F47   | Notifications In-App      | Done    | Cloche, liste, filtres, marquage lu                                                                                              |
| F48   | Notifications Email       | Done    | 11 templates: facture, paiement, invitation, welcome, rappel, contrat, session, checkin, badge, alerte coach, digest (Sprint 31) |
| F49   | Notifications Push        | Done    | Web Push API + service worker + VAPID + toggle settings + push send API (Sprint 31)                                              |
| F50   | Parametres Notification   | Done    | Toggles par type, digest email                                                                                                   |
| F50.1 | Notification Intelligente | Manque  | Pas de batching, timing optimal, priority scoring                                                                                |
| F50.2 | Notifications Critiques   | Partiel | Alertes systeme basiques                                                                                                         |
| F50.3 | Analytics Notification    | Manque  | Pas de tracking delivery/open/click rates                                                                                        |

### Manques Notifications

- [x] Notifications push navigateur (Web Push API) (Sprint 31)
- [x] Templates email varies (session, checkin, badge, coach alert, digest) (Sprint 31)
- [ ] SMS via Twilio
- [ ] Notification intelligente (batching, timing optimal)
- [ ] Analytics notifications (taux ouverture, clics)

---

## 16. Invitations & Gestion Utilisateurs

| Ref   | Fonctionnalite               | Statut  | Notes                                                             |
| ----- | ---------------------------- | ------- | ----------------------------------------------------------------- |
| F51   | Systeme d'Invitation         | Done    | Invitations email, statut, expiration                             |
| F52   | Auto-Provisioning            | Partiel | Invitation-only. Manque auto-creation premier acces               |
| F53   | Gestion Roles et Permissions | Partiel | Roles predefinis OK. Manque roles custom, permissions granulaires |
| F54   | Authentification et Securite | Done    | Email/password + OAuth Google + 2FA TOTP (Sprint 32)              |
| F54.1 | Onboarding Coach             | Manque  | Pas de flow specifique coach                                      |
| F54.2 | Onboarding Staff             | Manque  | Pas de flow specifique staff                                      |
| F54.3 | Offboarding Utilisateur      | Manque  | Pas de transfert de donnees, desactivation                        |

### Manques Utilisateurs

- [x] 2FA (TOTP authenticator) (Sprint 32)
- [ ] SSO Google/Microsoft optionnel
- [x] Invitation en masse (CSV import) — csv-import-modal.tsx (existait Sprint 37)
- [ ] Roles personnalises creables par admin
- [x] Offboarding avec transfert responsabilites — user-offboarding-modal.tsx + offboardUser mutation (existait)
- [x] Audit des connexions et acces — audit_logs table + audit-log-table.tsx + logAudit() (Sprint 40)

---

## 17. Parametres

| Ref   | Fonctionnalite          | Statut  | Notes                                                                  |
| ----- | ----------------------- | ------- | ---------------------------------------------------------------------- |
| F55   | Configuration Admin     | Done    | Organisation, integrations, templates                                  |
| F56   | Branding et Theme       | Done    | Light/dark + logo custom, couleurs, polices, border-radius (Sprint 33) |
| F57   | Integrations Tierces    | Partiel | Google Calendar OK, Stripe partiel                                     |
| F58   | Sauvegardes et RGPD     | Done    | Suppression compte + export JSON + consentements RGPD (Sprint 32)      |
| F58.1 | Branding Avance         | Done    | Logo, palette, favicon, polices, border-radius (Sprint 33)             |
| F58.2 | Pages Publiques Branded | Manque  | Login/landing pas personnalisables                                     |
| F58.3 | Domaine Personnalise    | Manque  | Pas de custom domain                                                   |

### Manques Parametres

- [x] Branding complet (logo, couleurs, polices) (Sprint 33)
- [ ] Pages login/landing branded
- [ ] Domaine personnalise
- [x] Export donnees personnelles JSON (RGPD) (Sprint 32)
- [x] Consentement RGPD au premier acces (Sprint 32)

---

## X. Securite et Conformite

| Ref | Fonctionnalite                   | Statut  | Notes                                                                |
| --- | -------------------------------- | ------- | -------------------------------------------------------------------- |
| F61 | Chiffrement des Donnees          | Partiel | TLS via Vercel/Supabase. Manque E2E custom                           |
| F62 | Conformite RGPD                  | Done    | Suppression compte + export JSON + banniere consentement (Sprint 32) |
| F63 | Authentification et Autorisation | Done    | OAuth + RLS + 2FA TOTP (Sprint 32). Manque IP whitelist              |
| F64 | Audit et Monitoring              | Manque  | Pas d'audit logs, SIEM                                               |
| F65 | Haute Disponibilite              | Partiel | Vercel + Supabase managed. Pas de multi-region custom                |

---

## 18. Integrations

| Ref | Fonctionnalite             | Statut | Notes                                                             |
| --- | -------------------------- | ------ | ----------------------------------------------------------------- |
| F66 | Integrations Paiement      | Done   | Stripe complet (checkout, webhook, refund) + Wise API (Sprint 35) |
| F67 | Integrations Calendrier    | Done   | Google Calendar bidirectionnel                                    |
| F68 | Integrations Communication | Manque | Pas de Slack, Teams, SMS, WhatsApp                                |
| F69 | Integrations Analytics     | Manque | Pas de Google Analytics, Mixpanel, Segment                        |
| F70 | API REST                   | Done   | API v1 (clients, leads, calls) + API keys + webhooks (Sprint 34)  |

### Manques Integrations

- [x] Wise pour virements internationaux (Sprint 35)
- [ ] Slack notifications evenements cles
- [ ] SMS via Twilio
- [ ] Google Analytics / Mixpanel
- [x] API REST publique /api/v1/ (clients, leads, calls) (Sprint 34)
- [x] Webhooks custom configurables avec HMAC + logs (Sprint 34)
- [ ] Zapier connector

---

## Historique des Sprints

| Sprint | Contenu                                                                                                                                                                                               | Date          |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 1-20   | Fondations plateforme (auth, dashboards, CRM, LMS, messagerie, appels, gamification, journal, forms, billing, feed, onboarding, IA, notifications)                                                    | < 2026-03-11  |
| 21     | Systeme de checkin ameliore (mood, energie, gratitudes, objectifs, heatmap)                                                                                                                           | 2026-03-11    |
| 22     | Rapports financiers & Sales Dashboard (payment reminders, KPIs, forecast, top clients)                                                                                                                | 2026-03-11    |
| 23     | Gestion appels avancee (reschedule, satisfaction, note templates, call metrics)                                                                                                                       | 2026-03-11    |
| 24-31  | Quiz, exports, timeline CRM, profils publics, parcours LMS, analyse risque IA, onboarding, notifications push/email                                                                                   | 2026-03-11~12 |
| 32     | RGPD complet (export JSON, consentements, banniere) + 2FA TOTP (enrollment, login flow)                                                                                                               | 2026-03-14    |
| 33     | Branding & white-label (logo custom, couleurs, polices, favicon, border-radius, preview live)                                                                                                         | 2026-03-14    |
| 34     | API REST publique v1 (clients, leads, calls) + API keys + webhooks HMAC + admin UI                                                                                                                    | 2026-03-14    |
| 35     | Stripe complet (refunds, cron overdue/reminders/recurring) + Wise API (quotes, transfers, balance)                                                                                                    | 2026-03-14    |
| 36     | CDC gap fill — gamification (challenges, badges), coaching (sessions, alertes), formations (comments, prereqs), contenu (kanban, calendrier), objectifs, CSM auto-assign, roadmap IA, rituels/streaks | 2026-03-15    |
| 37     | Enrichissement Apify 5 plateformes, lead scoring auto, templates messages, sequences relance, import CSV CRM, video onboarding CSM, dashboard client premium                                          | 2026-03-15    |
| 38     | IA slash commands chat, archive conversations, DND, enregistrement video, notif flag, leaderboard filtres, sous-communautes, roadmap PDF, heatmap, comparaison periodes, closing rate                 | 2026-03-15    |

---

## Prochains Sprints Recommandes

### Vague 1 - Gaps critiques

- [x] **Sprint 24** : Quiz & Exercices UI — timer, soumission, correction, stats (F11)
- [x] **Sprint 25** : Export PDF/Excel — dashboards sales/billing + reponses formulaires CSV/PDF (F4.2, F32)
- [x] **Sprint 26** : Vue Timeline CRM + bulk actions — 3 vues, multi-select, tag batch (F8.1)

### Vague 2 - Differenciation

- [x] **Sprint 27** : Profils publics + follow system (F40)
- [x] **Sprint 28** : Parcours d'apprentissage avec prerequis (F12.1)
- [x] **Sprint 29** : Analyse de risque IA automatique (F44)
- [x] **Sprint 30** : Onboarding interactif walkthrough (F41-F42)

### Vague 3 - Polish & Conformite

- [x] **Sprint 31** : Notifications push + email templates (F48-F49)
- [x] **Sprint 32** : RGPD complet + 2FA (F54, F62)
- [x] **Sprint 33** : Branding & white-label (F56, F58.1)
- [x] **Sprint 34** : API REST publique + webhooks (F70)
- [x] **Sprint 35** : Integrations Stripe complet + Wise (F66)

---

## Checklist Alexia (Call1 + Call2) — Couverture

> Features demandees par Alexia lors des appels decouverte. Comparaison avec l'etat actuel du code.

### Features Principales

| Feature                                          | Statut  | Notes                                                                                                               |
| ------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------- |
| Workbooks / Questionnaires dynamiques            | Done    | Workbook editor + player + soumission + review coach (use-workbooks.ts + workbook-editor.tsx + workbook-player.tsx) |
| Appels video natifs + transcription              | Done    | WebRTC + transcription temps reel (Web Speech API) + use-webrtc.ts + use-transcription.ts                           |
| Generation docs post-appel (transcript+workbook) | Done    | Fusion IA transcript + workbook → document (/api/ai/workbook-fusion + /api/ai/transcript-fusion)                    |
| Messagerie simplifiee (remplace Slack)           | Done    | Channels publics/prives, DMs, threads, reactions, typing, fichiers + templates reponses rapides                     |
| Canal individuel par client                      | Done    | DM channels fonctionnels                                                                                            |
| Canaux de groupe (General, Lives, Challenge)     | Done    | Channels publics/prives creables                                                                                    |
| Badge messages non lus (compteur rouge)          | Done    | Unread count tracking dans use-channels.ts                                                                          |
| Systeme #urgent / @urgent                        | Done    | Flag urgent dans messaging + son different + notification prioritaire                                               |
| Mute des abuseurs                                | Done    | notifications_muted en DB + UI mute dans channel-sidebar.tsx                                                        |
| Onboarding client guide                          | Done    | Walkthrough interactif, checklist, XP rewards (Sprint 30)                                                           |
| Video accueil / onboarding                       | Done    | csm-video-step.tsx : video HTML5/iframe avec auto-detection 80% + fallback bio (Sprint 37)                          |
| Formulaire step-by-step onboarding               | Partiel | Onboarding basique. Manque : "pourquoi Alexia", revenus actuels, infos business                                     |
| Tutorial guide interactif (style SaaS)           | Done    | walkthrough-provider.tsx avec tooltips et highlights                                                                |
| Test obligatoire (message test)                  | Done    | message-test-step.tsx dans onboarding                                                                               |
| Video personnalisee CSM                          | Done    | csm-video-step.tsx + intro_video_url sur profiles (Sprint 37)                                                       |
| Dashboard progression client                     | Done    | Dashboard client premium : streak, XP, objectifs, cours, badges, upsell (Sprint 37)                                 |
| Roadmap personnalisee auto-generee par IA        | Done    | auto-roadmap-trigger.ts + /api/ai/generate-roadmap (Sprint 36)                                                      |
| Jalons/milestones avec criteres validation       | Partiel | Pipeline stages existent. Manque criteres explicites de validation                                                  |
| Questions pre-appel standardisees                | Done    | use-pre-call-questions.ts avec questions configurables                                                              |
| Reponse video au lieu d'appel                    | Manque  | Pas de systeme de reponse video asynchrone                                                                          |
| Systeme de flags (Green/Orange/Red)              | Done    | student_details.flag + flag history + UI dans side panel                                                            |
| Notification auto quand flag change              | Done    | Auto-notification admin + coach sur changement flag (Sprint 38)                                                     |
| Attribution auto CSM                             | Done    | csm-auto-assign.ts avec algo specialite + charge (Sprint 36)                                                        |
| Override manuel CSM                              | Done    | csm-dashboard.tsx avec UI attribution + batch assign                                                                |
| Vue groupee par CSM                              | Done    | csm-dashboard.tsx avec metriques par coach + clients groupes (Sprint 36)                                            |
| Correlation performance CSM <-> resultats        | Done    | csm-dashboard.tsx avec health scores + revenue par coach                                                            |
| FAQ / Base de connaissances IA                   | Done    | use-faq.ts + faq-dashboard.tsx + /api/ai/faq-match (auto-reponse IA, tracking, alertes)                             |
| IA scoring urgence client                        | Done    | Analyse risque IA avec health_score (Sprint 29)                                                                     |

### Features Secondaires (Nice to Have)

| Feature                              | Statut  | Notes                                                                           |
| ------------------------------------ | ------- | ------------------------------------------------------------------------------- |
| Dashboard financier complet          | Done    | MRR, ventes, KPIs, forecast, cash collecte vs facture (financial-dashboard.tsx) |
| Cash collecte vs cash facture        | Done    | Vue comparee dans financial-dashboard.tsx (Sprint 22)                           |
| LTV par client                       | Done    | use-ltv.ts + ltv-ranking.tsx (calcul auto, classement top N)                    |
| Ventes par canal                     | Done    | Revenue by channel dans financial-dashboard.tsx (pie chart)                     |
| Taux de closing + commentaires       | Done    | Closing rate par source + lost_reason + temps moyen (Sprint 38)                 |
| Calcul auto paiements contracteurs   | Done    | Auto-commission a la conversion client (use-pipeline.ts moveContact)            |
| Generation auto contrats/factures    | Done    | Templates + PDF + envoi email                                                   |
| Signature electronique               | Done    | E-signature integree : signature-pad.tsx + API sign + metadata IP               |
| CRM mobile setter                    | Partiel | PWA responsive. Manque optimisation mobile specifique setter                    |
| Challenges / Leaderboard anti-triche | Partiel | Gamification complete. Manque integration LinkedIn API verif                    |
| Lead Magnet forms publics            | Done    | /api/leads/capture + /f/[formId] + use-lead-magnet.ts + stats admin             |
| Calendrier lives partage             | Partiel | Calendrier appels existe. Manque calendrier lives groupe                        |
| Upsell automatise par palier revenu  | Done    | use-upsell.ts avec rules + triggers auto + dashboard admin                      |

### Preferences UI / Design

| Feature                         | Statut  | Notes                                                  |
| ------------------------------- | ------- | ------------------------------------------------------ |
| Simplicite (anti-Slack)         | Done    | UI epuree, fonctionnalites essentielles                |
| Vue liste ET mosaique clients   | Done    | Grid + list dans CRM                                   |
| Tri par activite recente        | Partiel | Tri par date. Manque tri par "dernier message non lu"  |
| Filtrage/tri avance             | Done    | Tags, recherche, filtres dans CRM                      |
| Branding Off-Market             | Done    | Logo, couleurs, polices personnalisables (Sprint 33)   |
| Tutorial guide interactif       | Done    | Walkthrough provider (Sprint 30)                       |
| Notifications differenciees son | Manque  | Pas de sons differents urgent vs normal                |
| Badge rouge messages non lus    | Done    | Unread counter dans sidebar                            |
| Roadmap imprimable client       | Done    | /api/roadmap/[id]/pdf + bouton telecharger (Sprint 38) |
| Mobile-first CRM setter         | Partiel | PWA responsive mais pas optimise mobile setter         |

---

## Resume des Gaps Prioritaires (Alexia)

### ✅ Priorite Haute — TOUT FAIT

1. ~~Workbooks adaptatifs~~ — Done (workbook-editor.tsx + workbook-player.tsx + use-workbooks.ts)
2. ~~Fusion auto transcript + workbook~~ — Done (/api/ai/workbook-fusion + /api/ai/transcript-fusion)
3. ~~Questions pre-appel obligatoires~~ — Done (use-pre-call-questions.ts)
4. ~~Attribution auto CSM~~ — Done (csm-auto-assign.ts + csm-dashboard.tsx)
5. ~~Vue groupee par CSM~~ — Done (csm-dashboard.tsx)
6. ~~Systeme #urgent~~ — Done (flag urgent messaging + son different)

### ✅ Priorite Moyenne — TOUT FAIT

7. ~~FAQ/KB IA~~ — Done (use-faq.ts + faq-dashboard.tsx + /api/ai/faq-match)
8. ~~Roadmap personnalisee IA~~ — Done (auto-roadmap-trigger.ts + /api/ai/generate-roadmap)
9. ~~Video onboarding personnalisee CSM~~ — Done (csm-video-step.tsx + intro_video_url Sprint 37)
10. ~~LTV par client~~ — Done (use-ltv.ts + ltv-ranking.tsx)
11. ~~Upsell automatise~~ — Done (use-upsell.ts avec rules + triggers)

### ✅ Priorite Basse — Majorite faite

12. ~~Enregistrement appels video~~ — Done (use-call-recording.ts + recording-controls.tsx + recording-player.tsx Sprint 38)
13. LinkedIn API integration (anti-triche) — Manque
14. ~~Lead magnet forms publics~~ — Done (/api/leads/capture + /f/[formId])
15. ~~E-signature integree~~ — Done (signature-pad.tsx + /api/contracts/[id]/sign)
16. Multi-devises — Manque
17. ~~Sous-communautes thematiques~~ — Done (communities tables + hooks + UI Sprint 38)

### Nouveaux ajouts Sprint 37

18. **Templates messages / reponses rapides** — Done (template-picker.tsx + template-manager-modal.tsx + use-message-templates.ts)
19. **Sequences de relance automatique** — Done (relance-sequence-builder.tsx + use-relance.ts + /api/relance/process)
20. **Import CSV contacts CRM** — Done (csv-import-modal.tsx + use-csv-import.ts, wizard 4 etapes)
21. **Dashboard client premium** — Done (client-dashboard.tsx avec streak, XP, cours, objectifs, badges, upsell)
22. **Enrichissement multi-plateforme** — Done (LinkedIn, Instagram, TikTok, Facebook, Website via Apify)
