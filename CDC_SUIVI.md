# Suivi d'avancement - Cahier des Charges Off-Market

> Derniere mise a jour : 2026-03-14
> Avancement global : **~90%**

---

## Legende

| Symbole | Signification              |
| ------- | -------------------------- |
| Done    | Fonctionnalite implementee |
| Partiel | Partiellement implementee  |
| Manque  | Non implementee            |

---

## 3. Tableau de Bord

| Ref  | Fonctionnalite           | Statut  | Notes                                                                                            |
| ---- | ------------------------ | ------- | ------------------------------------------------------------------------------------------------ |
| F1   | Dashboard Admin          | Done    | KPIs, utilisateurs, alertes                                                                      |
| F2   | Dashboard Coach          | Done    | Eleves, alertes, progression, activite                                                           |
| F3   | Dashboard Client         | Done    | Progression, XP, badges, appels                                                                  |
| F4   | Dashboard Sales          | Done    | KPIs financiers, MRR, forecast, top clients (Sprint 22)                                          |
| F4.1 | Widgets KPI              | Done    | MRR/ARR, retention, NPS basique                                                                  |
| F4.2 | Graphiques & Historiques | Partiel | Courbes revenus + export PDF/CSV OK (Sprint 25). Manque heatmaps activite, comparaisons periodes |

### Manques Dashboard

- [x] Export PDF/Excel des rapports (Sprint 25)
- [ ] Heatmaps d'activite par jour/heure
- [ ] Comparaisons periode a periode
- [ ] Widgets configurables (drag-drop dashboard)

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
- [ ] Segments sauvegardes et partageables
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
- [ ] Certificats de completion (table existe, UI manquante)
- [x] Parcours d'apprentissage avec prerequis (Sprint 28)
- [ ] Support audio/podcast
- [ ] Embeds externes (Figma, Miro, Google Docs)

---

## 6. Messagerie

| Ref   | Fonctionnalite             | Statut  | Notes                                                          |
| ----- | -------------------------- | ------- | -------------------------------------------------------------- |
| F13   | Chat Temps Reel            | Done    | Messages, typing, fichiers, reactions, edit/delete             |
| F14   | Canaux et Fils             | Done    | Canaux publics/prives, threads, mentions                       |
| F15   | Assistant IA Chat          | Partiel | Chat IA separe existe. Pas integre directement dans messagerie |
| F16   | Recherche et Notifications | Partiel | Recherche messages OK. Notifications in-app OK                 |
| F16.1 | Canaux Personnalises       | Done    | Publics, prives, par equipe, permissions                       |
| F16.2 | Gestion Conversations      | Partiel | Manque favoris, mute, archive, export historique               |

### Manques Messagerie

- [ ] Epinglage de messages (pinning)
- [ ] Archive de conversations
- [ ] IA integree dans le chat (slash commands /help, /summarize)
- [ ] Mode "Do Not Disturb"
- [ ] Digests resumes en cas d'absence

---

## 7. Appels & Calendrier

| Ref   | Fonctionnalite            | Statut  | Notes                                                          |
| ----- | ------------------------- | ------- | -------------------------------------------------------------- |
| F17   | Planification d'Appels    | Done    | Slots, reservation, calendrier semaine/liste                   |
| F18   | Calendrier Integre        | Done    | Vue semaine, sync Google Calendar                              |
| F19   | Appels Video WebRTC       | Done    | Video room, controles, screen sharing                          |
| F20   | Transcription Automatique | Partiel | Table DB + hook existent. Manque UI lecture/export             |
| F20.1 | Rescheduling et Absence   | Done    | Report avec raison, date originale tracee (Sprint 23)          |
| F20.2 | Notes et Follow-up        | Done    | Notes post-appel, templates, action items (Sprint 23)          |
| F20.3 | Metriques et Reporting    | Done    | KPIs, taux completion, satisfaction, par type/jour (Sprint 23) |

### Manques Appels

- [ ] Enregistrement des appels video
- [ ] UI de lecture des transcriptions
- [ ] Export transcriptions en PDF/texte
- [ ] Rappels email/SMS avant appel
- [ ] Support multi-participants (appels groupe)

---

## 8. Gamification

| Ref   | Fonctionnalite            | Statut  | Notes                                                             |
| ----- | ------------------------- | ------- | ----------------------------------------------------------------- |
| F21   | Systeme XP et Progression | Done    | Points, niveaux, leaderboard                                      |
| F22   | Badges et Achievements    | Done    | Badges visuels, conditions, notifications                         |
| F23   | Leaderboard               | Done    | Global, podium top 3, position personnelle                        |
| F24   | Challenges Hebdomadaires  | Done    | Types varies, progression, participants                           |
| F25   | Check-Ins Quotidiens      | Done    | Check-in matinal + soir, mood, energie (Sprint 21)                |
| F25.1 | Streaks et Habits         | Done    | Streak tracking, compteur                                         |
| F25.2 | Social Proof              | Partiel | Leaderboard public OK. Manque filtres periode, anonymat optionnel |
| F25.3 | Rewards et Privileges     | Manque  | Pas de systeme de redemption de points                            |

### Manques Gamification

- [ ] Filtres leaderboard (semaine/mois/tout)
- [ ] Anonymat optionnel leaderboard
- [ ] Systeme de rewards/redemption (convertir XP en avantages)
- [ ] Team competitions / defis d'equipe
- [ ] Badges rares et exclusifs configurables par admin

---

## 9. Journal & Check-Ins

| Ref | Fonctionnalite           | Statut  | Notes                                                   |
| --- | ------------------------ | ------- | ------------------------------------------------------- |
| F26 | Journal de Coaching      | Done    | Edition libre, calendrier, historique                   |
| F27 | Check-Ins Structures     | Done    | Mood, energie, gratitudes, objectifs, notes (Sprint 21) |
| F28 | Suivi Objectifs Coaching | Partiel | Hook useCoachingGoals existe. UI limitee                |

### Manques Journal

- [ ] Prompts guides pour le journal
- [ ] Medias (images, attachements) dans journal
- [ ] Journal prive vs partage avec coach
- [ ] Export journal en PDF
- [ ] Rapports automatises sur tendances check-in
- [ ] Objectifs SMART avec sous-objectifs et jalons

---

## 10. Formulaires (Form Builder)

| Ref   | Fonctionnalite               | Statut  | Notes                                                                       |
| ----- | ---------------------------- | ------- | --------------------------------------------------------------------------- |
| F29   | Editeur Drag-and-Drop        | Done    | @dnd-kit, library de champs, preview                                        |
| F30   | Types de Champs              | Done    | Text, email, phone, select, rating, NPS, date, file, etc.                   |
| F31   | Logique Conditionnelle       | Done    | Show/hide, conditions, operateurs                                           |
| F32   | Collecte et Gestion Reponses | Partiel | Stockage + export CSV/PDF OK (Sprint 25). Manque rapports agreges, webhooks |
| F32.1 | Evaluations et Sondages      | Partiel | NPS/rating OK. Manque CSAT, pre/post tests                                  |
| F32.2 | Intake et Onboarding Forms   | Partiel | Formulaire onboarding basique                                               |
| F32.3 | Lead Magnet Forms            | Manque  | Pas de formulaires publics de capture leads                                 |

### Manques Formulaires

- [x] Export reponses CSV/Excel (Sprint 25)
- [ ] Rapports agreges avec statistiques
- [ ] Templates de formulaires pre-construits
- [ ] Webhooks sur soumission
- [ ] Alertes si reponse critique (NPS < 5)
- [ ] Lead magnet forms publics

---

## 11. Contrats & Facturation

| Ref   | Fonctionnalite             | Statut  | Notes                                                  |
| ----- | -------------------------- | ------- | ------------------------------------------------------ |
| F33   | Gestion des Contrats       | Done    | Templates, creation, envoi, statuts                    |
| F34   | Facturation Automatique    | Done    | Generation factures, PDF, numerotation                 |
| F35   | Gestion des Paiements      | Done    | Stripe complet + Wise API + refunds (Sprint 35)        |
| F36   | Relances Automatiques      | Done    | 5 relances auto + cron dispatch email (Sprint 35)      |
| F37   | Rapports Financiers        | Done    | MRR/ARR, graphiques, forecast (Sprint 22)              |
| F37.1 | Signatures Electroniques   | Manque  | Pas d'integration e-signature (Docusign ou equivalent) |
| F37.2 | Gestion Renouvellements    | Done    | Facturation recurrente via echeanciers (Sprint 35)     |
| F37.3 | Gestion Refunds et Credits | Done    | Remboursement total/partiel via Stripe (Sprint 35)     |

### Manques Facturation

- [ ] E-signature integree
- [ ] Renouvellement automatique contrats
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
| F40.3 | Communautes Specialisees    | Manque  | Pas de sous-groupes thematiques                                                                                |

### Manques Communaute

- [x] Profils publics complets (badges, wins, stats, follow) (Sprint 27)
- [x] Systeme follow/unfollow (Sprint 27)
- [ ] Sous-communautes par niche/interet
- [ ] Commentaires imbriques (nested replies)
- [ ] Trending posts / most liked

---

## 13. Onboarding

| Ref   | Fonctionnalite         | Statut  | Notes                                                    |
| ----- | ---------------------- | ------- | -------------------------------------------------------- |
| F41   | Flow Onboarding Client | Done    | Walkthrough interactif avec tooltips, visite guidee plateforme (Sprint 30) |
| F42   | Checklist Onboarding   | Done    | Checklist 6 etapes + XP rewards + banniere rappel + integration dashboard (Sprint 30) |
| F42.1 | Engagement Progressif  | Manque  | Pas de pacing jour 1/2-3/4-5/semaine 2                   |
| F42.2 | Support et Assistance  | Manque  | Pas de chatbot onboarding, FAQ                           |
| F42.3 | Personnalisation       | Manque  | Pas de chemins differencies selon profil                 |

### Manques Onboarding

- [x] Walkthrough interactif avec tooltips (Sprint 30)
- [ ] Videos guides integrees
- [x] Recompenses XP a chaque etape completee (Sprint 30)
- [ ] Personnalisation selon type d'offre/formation
- [ ] Chatbot d'assistance onboarding

---

## 14. Intelligence Artificielle

| Ref   | Fonctionnalite             | Statut  | Notes                                                   |
| ----- | -------------------------- | ------- | ------------------------------------------------------- |
| F43   | Assistant IA Coaching      | Done    | Chat Claude, prompts coaching, historique conversations |
| F44   | Analyse de Risque Eleve    | Done    | Analyse auto multi-facteurs, health_score, alertes, recommandations (Sprint 29) |
| F45   | Generation de Contenu      | Partiel | IA genere sur demande. Pas de workflow automatise       |
| F46   | Insights Coaching          | Partiel | Reponses IA OK. Manque rapports periodiques auto        |
| F46.1 | Transparence IA            | Manque  | Pas de labels "reponse IA", confidence scores           |
| F46.2 | Confidentialite Donnees IA | Partiel | Donnees non partagees. Manque consentement explicite    |
| F46.3 | Bias et Fairness           | Manque  | Pas d'audit de biais                                    |

### Manques IA

- [x] Analyse de risque automatique (scoring at-risk) (Sprint 29)
- [ ] Rapports IA periodiques generes automatiquement
- [ ] Labels "Reponse IA" vs humain
- [ ] Integration IA dans messagerie (slash commands)
- [ ] Consentement explicite pour usage IA

---

## 15. Notifications

| Ref   | Fonctionnalite            | Statut  | Notes                                                     |
| ----- | ------------------------- | ------- | --------------------------------------------------------- |
| F47   | Notifications In-App      | Done    | Cloche, liste, filtres, marquage lu                       |
| F48   | Notifications Email       | Done    | 11 templates: facture, paiement, invitation, welcome, rappel, contrat, session, checkin, badge, alerte coach, digest (Sprint 31) |
| F49   | Notifications Push        | Done    | Web Push API + service worker + VAPID + toggle settings + push send API (Sprint 31) |
| F50   | Parametres Notification   | Done    | Toggles par type, digest email                            |
| F50.1 | Notification Intelligente | Manque  | Pas de batching, timing optimal, priority scoring         |
| F50.2 | Notifications Critiques   | Partiel | Alertes systeme basiques                                  |
| F50.3 | Analytics Notification    | Manque  | Pas de tracking delivery/open/click rates                 |

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
- [ ] Invitation en masse (CSV import)
- [ ] Roles personnalises creables par admin
- [ ] Offboarding avec transfert responsabilites
- [ ] Audit des connexions et acces

---

## 17. Parametres

| Ref   | Fonctionnalite          | Statut  | Notes                                                    |
| ----- | ----------------------- | ------- | -------------------------------------------------------- |
| F55   | Configuration Admin     | Done    | Organisation, integrations, templates                    |
| F56   | Branding et Theme       | Done    | Light/dark + logo custom, couleurs, polices, border-radius (Sprint 33) |
| F57   | Integrations Tierces    | Partiel | Google Calendar OK, Stripe partiel                       |
| F58   | Sauvegardes et RGPD     | Done    | Suppression compte + export JSON + consentements RGPD (Sprint 32) |
| F58.1 | Branding Avance         | Done    | Logo, palette, favicon, polices, border-radius (Sprint 33) |
| F58.2 | Pages Publiques Branded | Manque  | Login/landing pas personnalisables                       |
| F58.3 | Domaine Personnalise    | Manque  | Pas de custom domain                                     |

### Manques Parametres

- [x] Branding complet (logo, couleurs, polices) (Sprint 33)
- [ ] Pages login/landing branded
- [ ] Domaine personnalise
- [x] Export donnees personnelles JSON (RGPD) (Sprint 32)
- [x] Consentement RGPD au premier acces (Sprint 32)

---

## X. Securite et Conformite

| Ref | Fonctionnalite                   | Statut  | Notes                                                 |
| --- | -------------------------------- | ------- | ----------------------------------------------------- |
| F61 | Chiffrement des Donnees          | Partiel | TLS via Vercel/Supabase. Manque E2E custom            |
| F62 | Conformite RGPD                  | Done    | Suppression compte + export JSON + banniere consentement (Sprint 32) |
| F63 | Authentification et Autorisation | Partiel | OAuth + RLS. Manque 2FA, IP whitelist                 |
| F64 | Audit et Monitoring              | Manque  | Pas d'audit logs, SIEM                                |
| F65 | Haute Disponibilite              | Partiel | Vercel + Supabase managed. Pas de multi-region custom |

---

## 18. Integrations

| Ref | Fonctionnalite             | Statut  | Notes                                          |
| --- | -------------------------- | ------- | ---------------------------------------------- |
| F66 | Integrations Paiement      | Done    | Stripe complet (checkout, webhook, refund) + Wise API (Sprint 35) |
| F67 | Integrations Calendrier    | Done    | Google Calendar bidirectionnel                 |
| F68 | Integrations Communication | Manque  | Pas de Slack, Teams, SMS, WhatsApp             |
| F69 | Integrations Analytics     | Manque  | Pas de Google Analytics, Mixpanel, Segment     |
| F70 | API REST                   | Done    | API v1 (clients, leads, calls) + API keys + webhooks (Sprint 34) |

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

| Sprint | Contenu                                                                                                                                            | Date         |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| 1-20   | Fondations plateforme (auth, dashboards, CRM, LMS, messagerie, appels, gamification, journal, forms, billing, feed, onboarding, IA, notifications) | < 2026-03-11 |
| 21     | Systeme de checkin ameliore (mood, energie, gratitudes, objectifs, heatmap)                                                                        | 2026-03-11   |
| 22     | Rapports financiers & Sales Dashboard (payment reminders, KPIs, forecast, top clients)                                                             | 2026-03-11   |
| 23     | Gestion appels avancee (reschedule, satisfaction, note templates, call metrics)                                                                    | 2026-03-11   |
| 24-31  | Quiz, exports, timeline CRM, profils publics, parcours LMS, analyse risque IA, onboarding, notifications push/email                               | 2026-03-11~12 |
| 32     | RGPD complet (export JSON, consentements, banniere) + 2FA TOTP (enrollment, login flow)                                                           | 2026-03-14   |
| 33     | Branding & white-label (logo custom, couleurs, polices, favicon, border-radius, preview live)                                                     | 2026-03-14   |
| 34     | API REST publique v1 (clients, leads, calls) + API keys + webhooks HMAC + admin UI                                                               | 2026-03-14   |
| 35     | Stripe complet (refunds, cron overdue/reminders/recurring) + Wise API (quotes, transfers, balance)                                               | 2026-03-14   |

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
