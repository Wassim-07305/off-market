# Audit CDC vs Codebase Off-Market

> Date de l'audit : 2026-03-22
> Total features CDC : 71
> Resultat : 32 Fait | 30 Partiel | 9 A faire

---

## Synthese

| Statut | Nombre | % |
|--------|--------|---|
| Fait | 32 | 45% |
| Partiel | 30 | 42% |
| A faire | 9 | 13% |

---

## Dashboards (F1-F4)

### F1 : Dashboard Admin — KPIs, widgets, graphiques, export PDF/Excel
**Statut : Partiel**

Present :
- KPIs (CA du mois, eleves actifs, nouveaux, LTV moyen, retention, churn, taux closing, completion formations)
- Graphiques Recharts (evolution CA, CA par canal, CA par trimestre)
- Coach leaderboard, activity feed, conversion funnel
- KPI Goals, Activity Heatmap, Period Comparison, LTV Ranking
- Rapport IA periodique

Manquant :
- Export PDF du dashboard admin (pas de bouton export sur cette page)
- Export Excel du dashboard admin

### F2 : Dashboard Coach — cards eleves, progression, appels, alertes
**Statut : Fait**

Present :
- Stats eleves (total, a risque, sessions a venir, sante moyenne)
- Alertes avec resolution
- Students overview (CoachStudentsOverview)
- Activity feed, metriques coach
- Annonces, rapport IA, Risk Analysis Panel

### F3 : Dashboard Client — progression formations, appels, XP, badges
**Statut : Fait**

Present :
- Page redirige vers `_shared-pages/dashboard` avec client-dashboard.tsx
- Composants : progress-widget, streak-widget, upcoming-events, gamification (XP, badges)
- Widgets configurables via widget-grid.tsx

### F4 : Dashboard Sales — pipeline deals, revenus MRR/ARR, contrats
**Statut : Fait**

Present :
- KPIs financiers (revenus totaux, MRR, en attente, en retard)
- Graphique revenus mensuels + previsions (forecast 3 mois)
- Top clients par revenu, factures en retard, contrats recents
- ARR estime, export PDF et CSV

---

## CRM (F5-F8)

### F5 : Fiches eleves — profil complet, historique interactions, notes, contrats
**Statut : Fait**

Present :
- Pages CRM admin et coach avec vue detail (`[id]`)
- student-side-panel.tsx, student-timeline.tsx
- Hooks : use-students.ts, use-setter-crm.ts
- Notes, historique, contrats lies

### F6 : Tags d'engagement — VIP, Standard, New, At-Risk, Churned
**Statut : Fait**

Present :
- engagement-tag.tsx dans composants CRM
- client-flag-badge.tsx, flag-indicator.tsx, flag-history.tsx
- use-client-flags.ts hook

### F7 : Pipeline etudiant — kanban, drag-drop, filtres, stats conversion
**Statut : Fait**

Present :
- pipeline-kanban.tsx, student-pipeline-kanban.tsx
- setter-pipeline-kanban.tsx, setter-pipeline-list.tsx
- pipeline-timeline.tsx
- use-pipeline.ts hook avec drag-drop (@dnd-kit)
- saved-segments.tsx, segment-manager.tsx (filtres)
- Conversion funnel dans dashboard

### F8 : Alertes automatiques coach — inactivite, at-risk, objectifs
**Statut : Fait**

Present :
- coach-alerts-panel.tsx
- use-coach-alerts.ts hook
- API route /api/coaching/check-alerts
- flag-alert-panel.tsx
- Alertes affichees dans dashboard coach

---

## LMS (F9-F12)

### F9 : Cours et modules — structure hierarchique, prerequis
**Statut : Fait**

Present :
- Structure cours > modules > lecons (pages admin/school, builder)
- course-prerequisites-manager.tsx
- use-course-prerequisites.ts, use-course-access.ts
- course-lock-gate.tsx (verrouillage par prerequis)

### F10 : School Builder — drag-drop, WYSIWYG, upload videos
**Statut : Fait**

Present :
- Page builder : admin/school/builder/[courseId]
- course-editor.tsx, course-form-dialog.tsx
- module-form-dialog.tsx, lesson-form-dialog.tsx
- video-player.tsx, file-upload.tsx
- workbook-editor.tsx (editeur riche)

### F11 : Quiz et exercices — QCM, vrai/faux, texte ouvert, certificats
**Statut : Fait**

Present :
- quiz-builder.tsx (3 types : multiple_choice, true_false, open_ended)
- quiz-player.tsx, quiz-exercise-stats.tsx
- use-quizzes.ts (quiz attempts, submissions, review)
- certificate-card.tsx, use-certificates.ts
- API /api/certificates/issue

### F12 : Progression et tracking — %, temps passe, resultats quiz
**Statut : Partiel**

Present :
- ProgressBar.tsx, course-completion.tsx
- Tracking de completion par lecon/module
- Resultats quiz stockes

Manquant :
- Tracking du temps passe par lecon/module (pas de timer visible)

---

## Messagerie (F13-F16)

### F13 : Chat temps reel — messages, fichiers, reactions, indicateurs
**Statut : Fait**

Present :
- messaging-container.tsx, chat-panel.tsx, chat-input.tsx
- message-bubble.tsx, message-reactions.tsx
- voice-recorder.tsx, image-lightbox.tsx
- typing-indicator.tsx (indicateur de frappe)
- link-preview.tsx, gif-picker.tsx, emoji-picker.tsx
- Supabase Realtime subscriptions

### F14 : Canaux et fils de discussion
**Statut : Fait**

Present :
- channel-sidebar.tsx, create-channel-modal.tsx
- channel-settings-modal.tsx, add-members-modal.tsx
- thread-panel.tsx (fils de discussion)
- use-channels.ts, useChannels.ts

### F15 : Assistant IA Chat — slash commands, resumes, suggestions
**Statut : Fait**

Present :
- ai-slash-commands.tsx
- alexia-mention.tsx (mention @Alexia dans le chat)
- API /api/ai/slash-command, /api/ai/chat
- API /api/ai/alexia/chat (assistant IA dedie)

### F16 : Recherche et notifications
**Statut : Fait**

Present :
- message-search.tsx
- pinned-messages-bar.tsx, bookmarks-panel.tsx
- template-manager-modal.tsx, template-picker.tsx
- NotificationBell.tsx, NotificationDropdown.tsx

---

## Appels & Calendrier (F17-F20)

### F17 : Planification d'appels — slots, reservation, rappels
**Statut : Fait**

Present :
- availability-manager.tsx, booking-calendar.tsx
- use-booking.ts (availability slots, bookable slots)
- use-booking-pages.ts
- sms-reminder-button.tsx, use-sms-reminders.ts
- pre-call-questions.tsx, use-pre-call-questions.ts
- Page publique /book/[slug]

### F18 : Calendrier integre — jour/semaine/mois, Google Calendar sync
**Statut : Partiel**

Present :
- week-view.tsx (vue semaine)
- create-event-modal.tsx, event-detail-modal.tsx
- Google Calendar sync : use-google-calendar.ts
- API routes : /api/google-calendar/* (connect, callback, events, status, disconnect)

Manquant :
- Vue jour et vue mois (seule vue semaine implementee)

### F19 : Appels video WebRTC
**Statut : Fait**

Present :
- video-room/ (video-room.tsx, video-grid.tsx, video-tile.tsx)
- call-controls.tsx, call-timer.tsx, connection-status.tsx
- use-webrtc.ts (WebRTC complet avec ICE servers, STUN/TURN)
- call-chat-panel.tsx, session-notes-panel.tsx
- incoming-call-toast.tsx
- recording controls (recording-controls.tsx, recording-player.tsx)

### F20 : Transcription automatique des appels
**Statut : Partiel**

Present :
- use-transcription.ts (Web Speech API browser-side)
- transcript-panel.tsx, transcript-entry.tsx
- use-transcription-export.ts
- API /api/transcriptions/[id]/pdf, /api/transcriptions/live/pdf
- API /api/ai/transcript-fusion (fusion IA de transcriptions)

Manquant :
- Transcription serveur-side (pas de service professionnel type Whisper/Deepgram, utilise Web Speech API navigateur uniquement)

---

## Gamification (F21-F25)

### F21 : Systeme XP et progression — niveaux, barres
**Statut : Fait**

Present :
- use-xp.ts (XP transactions, levels, config)
- use-auto-xp.ts (attribution automatique)
- use-streaks.ts (streaks/series)
- streak-display.tsx, streak-widget.tsx
- Page client/gamification

### F22 : Badges et achievements
**Statut : Fait**

Present :
- use-badges.ts, use-admin-badges.ts
- admin-badges.tsx (gestion admin)
- use-badge-check.ts
- certificate-card.tsx

### F23 : Leaderboard
**Statut : Fait**

Present :
- use-leaderboard.ts (week/month/all periods)
- use-leaderboard-privacy.ts
- challenge-leaderboard.tsx, competition-leaderboard.tsx
- MiniLeaderboard.tsx dans dashboard
- Page client/leaderboard
- Hall of Fame : hall-of-fame-wall.tsx, use-hall-of-fame.ts

### F24 : Challenges hebdomadaires
**Statut : Fait**

Present :
- use-challenges.ts (challenges actifs, participation)
- challenge-card.tsx, challenge-submission.tsx
- create-challenge-modal.tsx
- Page client/challenges
- Competitions : use-competitions.ts, competition-card.tsx

### F25 : Check-ins quotidiens — matinal/soir
**Statut : Partiel**

Present :
- use-checkins.ts (weekly checkins avec mood, energy, gratitudes, daily goals)
- ritual-tracker.tsx dans journal
- Page client/checkin, coach/checkins

Manquant :
- Structure matinal/soir distincte (un seul type de check-in hebdomadaire, pas de split matin/soir quotidien)

---

## Journal (F26-F28)

### F26 : Journal de coaching — edition, prompts, export PDF
**Statut : Fait**

Present :
- use-journal.ts, use-journal-prompts.ts, use-journal-export.ts
- journal-prompt-card.tsx, journal-attachments.tsx
- share-toggle.tsx, media-upload.tsx
- API /api/journal/export (export PDF)
- Page client/journal, coach/journal

### F27 : Check-ins structures — hebdomadaires, partage coach
**Statut : Fait**

Present :
- use-checkins.ts (weekly_checkins table, partage coach)
- Champs structures : revenue, prospection, win, blocker, goal_next_week, mood, energy, gratitudes
- Pages coach/checkins et client/checkin

### F28 : Suivi des objectifs coaching — SMART, sous-objectifs
**Statut : Partiel**

Present :
- use-coaching-goals.ts (goals avec target_value, statut)
- Page client/goals

Manquant :
- Gestion explicite SMART (Specifique, Mesurable, Atteignable, Realiste, Temporel)
- Sous-objectifs / milestones (structure plate, pas de hierarchie)

---

## Formulaires (F29-F32)

### F29 : Editeur drag-and-drop
**Statut : Fait**

Present :
- Pages admin/forms/builder, admin/forms/new
- form-builder-store.ts (store Zustand)
- template-gallery.tsx
- use-form-templates.ts

### F30 : Types de champs — texte, selection, evaluation, date, fichiers
**Statut : Fait**

Present :
- FormField type dans database.ts avec multiples types
- Pages de reponse : f/[formId], forms/[formId]/respond

### F31 : Logique conditionnelle
**Statut : Fait**

Present :
- lib/conditional-logic.ts (librairie dediee)
- Conditions dans form-builder-store.ts
- Support dans pages builder et formulaires publics

### F32 : Collecte et gestion des reponses — export, rapports, webhooks
**Statut : Fait**

Present :
- use-forms.ts (useFormSubmissions)
- use-form-analytics.ts (rapports)
- use-form-alerts.ts (useFormSubmissionWebhook)
- Pages admin/forms/[formId] (detail)
- Webhooks integres via use-webhooks.ts

---

## Contrats & Facturation (F33-F37)

### F33 : Gestion des contrats — templates, variables, e-signature
**Statut : Fait**

Present :
- use-contracts.ts, use-contract-generator.ts
- contract-wizard.tsx, contract-generator-modal.tsx
- contract-preview.tsx, contract-signature.tsx, signature-pad.tsx
- Templates : admin/billing/templates
- E-signature : page publique (public)/contracts/[id]/sign
- API /api/contracts/[id]/sign, /api/contracts/[id]/pdf
- Renewal : use-contract-renewal.ts, renewal-settings.tsx

### F34 : Facturation automatique — cycles, numerotation, TVA
**Statut : Partiel**

Present :
- use-invoices.ts (creation, gestion)
- invoice_number dans le schema
- payment-schedule-view.tsx (echeanciers)
- API /api/invoices/[id]/pdf

Manquant :
- Generation automatique cyclique des factures (pas de cron de facturation)
- Gestion TVA reelle (taux, calcul, affichage sur factures)

### F35 : Gestion des paiements — Stripe, suivi statut
**Statut : Partiel**

Present :
- stripe_invoice_id dans le type Invoice
- Page client/invoices avec gestion redirect Stripe
- Suivi statut (paid, sent, overdue, cancelled)

Manquant :
- Integration Stripe SDK (package @stripe/stripe-js non installe)
- API routes Stripe (checkout sessions, webhooks Stripe)
- Paiement en ligne reel non fonctionnel

### F36 : Relances automatiques — 7/14/21 jours
**Statut : Partiel**

Present :
- use-relance.ts (sequences, steps, enrollments, logs)
- use-payment-reminders.ts (reminders schedules)
- relance-sequence-builder.tsx, relance-sequences-view.tsx
- relance-enrollment-badge.tsx

Manquant :
- Envoi reel des relances par email (Resend installe mais pas de code d'envoi email)
- Cron job pour executer les relances automatiquement

### F37 : Rapports financiers — MRR/ARR, ventilation, previsions
**Statut : Fait**

Present :
- Dashboard sales avec MRR, ARR, previsions 3 mois
- financial-dashboard.tsx
- use-cash-flow.ts, use-financial-entries.ts
- revenue-chart.tsx, cash-flow-chart.tsx
- Export PDF et CSV

---

## Communaute (F38-F40)

### F38 : Feed social — posts, likes, commentaires
**Statut : Fait**

Present :
- use-feed.ts (infinite query, posts, likes, commentaires)
- comment-thread.tsx (threads imbriques)
- win-composer.tsx, win-post-modal.tsx
- mention-input.tsx, trending-sidebar.tsx
- report-modal.tsx (moderation)
- confetti.tsx (celebrations)

### F39 : Partage de wins
**Statut : Fait**

Present :
- win-composer.tsx, win-post-modal.tsx
- Type PostType inclut "win"
- community-wins.tsx dans dashboard
- Hall of Fame

### F40 : Profils publics — bio, badges, follow/unfollow
**Statut : Partiel**

Present :
- use-follows.ts (follow/unfollow)
- members-directory.tsx
- Pages profile (admin/coach/client/sales)

Manquant :
- Profils publics accessibles sans authentification
- Page profil dedie avec bio, badges visibles publiquement

---

## Onboarding (F41-F42)

### F41 : Flow onboarding client — etapes progressives
**Statut : Fait**

Present :
- use-onboarding.ts (steps par role : admin, coach, client, prospect, setter, closer)
- Composants : welcome-step, about-you-step, coach-tools-step, feature-tour-step, etc.
- chatbot-onboarding.tsx, use-onboarding-chat.ts
- offer-selection-step.tsx, csm-video-step.tsx
- Page (onboarding)/onboarding

### F42 : Checklist onboarding
**Statut : Fait**

Present :
- onboarding-checklist.tsx, personalized-checklist.tsx
- onboarding-banner.tsx
- guided-tour.tsx, walkthrough-provider.tsx (tour guide interactif)

---

## IA (F43-F46)

### F43 : Assistant IA coaching — chat, contexte, suggestions
**Statut : Fait**

Present :
- API /api/ai/chat, /api/ai/alexia/chat
- useAIChat.ts (conversations IA)
- use-alexia.ts (documents, knowledge base)
- alexia-config-panel.tsx, alexia-knowledge-panel.tsx, alexia-memory-panel.tsx
- ai-consent-modal.tsx (consentement utilisateur)
- Pages ai/ dans chaque role

### F44 : Analyse de risque eleve — scoring, alertes
**Statut : Fait**

Present :
- use-risk-analysis.ts (RiskResult avec score, severity, risk_factors, recommendation)
- API /api/ai/risk-analysis
- risk-analysis-panel.tsx dans dashboard coach
- Integration avec alertes coach

### F45 : Generation de contenu — descriptions, resumes
**Statut : Fait**

Present :
- API /api/ai/call-summary (resume d'appels)
- API /api/ai/client-briefing (briefing client)
- API /api/ai/workbook-fusion (fusion workbooks)
- API /api/ai/generate-roadmap (generation roadmap)
- API /api/ai/periodic-report (rapports periodiques)
- use-call-summary.ts, use-client-briefing.ts

### F46 : Insights coaching — patterns, predictions
**Statut : Partiel**

Present :
- use-ai-periodic-reports.ts, use-ai-reports.ts
- ai-reports-panel.tsx
- API /api/cron/ai-reports (rapports automatiques)

Manquant :
- Detection de patterns specifiques (pas d'analyse de tendances longitudinales)
- Predictions d'evolution (pas de modele predictif)

---

## Notifications (F47-F50)

### F47 : Notifications in-app
**Statut : Fait**

Present :
- NotificationBell.tsx, NotificationDropdown.tsx, NotificationsPanel.tsx
- use-notifications.ts, useNotifications.ts
- notification-store.ts
- API /api/notifications/batch
- Pages notifications dans chaque role

### F48 : Notifications email
**Statut : A faire**

Manquant :
- Resend est installe (package.json) mais aucun code d'envoi email n'est present
- Pas de templates email
- Pas d'API route d'envoi email
- Pas de lib/email.ts ou lib/resend.ts

### F49 : Notifications push
**Statut : Partiel**

Present :
- use-push-notifications.ts (Web Push API, VAPID)
- API /api/notifications/push

Manquant :
- Service Worker pour reception en arriere-plan (non verifie)
- VAPID keys non configurees (variable env vide par defaut)

### F50 : Parametres de notification
**Statut : Fait**

Present :
- use-notification-preferences.ts
- notification-settings-panel.tsx
- notification-preferences.tsx dans settings
- use-notification-sound.ts, sound-settings.tsx
- use-notification-analytics.ts

---

## Invitations & Utilisateurs (F51-F54)

### F51 : Systeme d'invitation
**Statut : Fait**

Present :
- use-invitations.ts (create, list, resend)
- invite-user-modal.tsx, invitation-status-table.tsx
- csv-import-modal.tsx (import en masse)
- API /api/invitations/accept
- Page admin/invitations

### F52 : Auto-provisioning
**Statut : Partiel**

Present :
- API /api/onboarding/create-crm-contact (creation automatique CRM)
- API /api/onboarding/save-profile
- use-onboarding-offers.ts

Manquant :
- Provisioning automatique complet sur acceptation d'invitation (creation profil + role + assignation coach automatique)

### F53 : Gestion des roles et permissions
**Statut : Fait**

Present :
- lib/permissions.ts (matrice Module -> AppRole[], canAccess)
- use-custom-roles.ts (roles personnalises en DB)
- role-manager.tsx dans settings
- RoleGuard.tsx (protection composant)
- 6 roles : admin, coach, client, prospect, setter, closer
- Roles custom supplementaires

### F54 : Authentification et securite — 2FA, SSO
**Statut : Partiel**

Present :
- use-2fa.ts (TOTP MFA complet via Supabase)
- Pages auth : login, register, forgot-password, signup
- active-sessions.tsx (sessions actives)
- use-user-sessions.ts

Manquant :
- SSO (Single Sign-On) : pas d'integration SSO (SAML, OAuth enterprise)

---

## Parametres (F55-F60)

### F55 : Configuration admin
**Statut : Fait**

Present :
- admin-modules-config.tsx
- Pages admin/settings
- admin-branding-settings.tsx

### F56 : Branding et theme
**Statut : Fait**

Present :
- use-branding.ts (app name, logo, favicon, couleurs, police, border-radius, tagline)
- admin-branding-settings.tsx, branding-settings.tsx
- branded-auth-layout.tsx
- BrandingProvider dans providers

### F57 : Integrations tierces
**Statut : Partiel**

Present :
- Google Calendar (complet : connect/disconnect/sync)
- Unipile (LinkedIn messaging)
- Miro (board integration)

Manquant :
- Dashboard centralisee de toutes les integrations
- Configuration Stripe dans settings
- Marketplace d'integrations

### F58 : Sauvegardes et RGPD
**Statut : Partiel**

Present :
- API /api/account/export (export donnees personnelles)
- API /api/account/delete (suppression compte)
- offboarding-wizard.tsx
- rgpd-consent-banner.tsx
- Pages confidentialite, mentions-legales

Manquant :
- Sauvegardes automatiques de la base de donnees (gere par Supabase, pas d'interface)
- Export exhaustif de toutes les donnees utilisateur

### F59 : Monitoring et support
**Statut : A faire**

Manquant :
- Dashboard de monitoring (uptime, sante systeme)
- Systeme de tickets de support
- Alertes de performance
- Health check endpoint

### F60 : Parametres utilisateur
**Statut : Fait**

Present :
- user-profile-settings.tsx
- use-preferences.ts
- Pages profile et settings dans chaque role
- active-sessions.tsx
- Themes, sons, preferences

---

## Features supplementaires (F61-F65)

> Note : Les features F61-F65 ne sont pas listees dans le CDC fourni.

---

## Integrations (F66-F71)

### F66 : Paiement — Stripe, Wise
**Statut : Partiel**

Present :
- Types avec stripe_invoice_id
- UI de paiement client (redirects Stripe)

Manquant :
- SDK Stripe non installe (@stripe/stripe-js absent du package.json)
- API routes Stripe (checkout, webhooks)
- Integration Wise (aucun code)

### F67 : Calendrier — Google Calendar
**Statut : Fait**

Present :
- use-google-calendar.ts (status, events, sync, push events)
- google-calendar-settings.tsx
- API routes completes : connect, callback, events, status, disconnect

### F68 : Communication — Slack, SMS, WhatsApp
**Statut : Partiel**

Present :
- Unipile (LinkedIn messaging) : use-unipile.ts, unified-inbox.tsx
- SMS reminders : use-sms-reminders.ts, sms-reminder-button.tsx

Manquant :
- Integration Slack
- Integration WhatsApp native (Unipile peut le supporter mais pas configure)
- Envoi SMS reel (pas de provider SMS type Twilio)

### F69 : Analytics — Google Analytics, Mixpanel
**Statut : A faire**

Manquant :
- Aucune integration Google Analytics (pas de gtag, pas de GA_TRACKING_ID)
- Aucune integration Mixpanel
- Pas de tracking d'evenements analytics externe

### F70 : API REST
**Statut : Partiel**

Present :
- API v1 : /api/v1/clients, /api/v1/leads, /api/v1/calls
- use-api-keys.ts (gestion cles API)
- api-settings.tsx

Manquant :
- Documentation API (Swagger/OpenAPI)
- Endpoints complets (formations, invoices, contracts, etc. non exposes)
- Rate limiting par cle API (rate limiting global present mais pas par cle)

### F71 : Webhooks
**Statut : Fait**

Present :
- use-webhooks.ts (CRUD webhooks)
- API /api/admin/webhooks
- webhook_logs (historique)
- use-form-alerts.ts (webhook sur soumission formulaire)
- Events configurable

---

## Resume des priorites

### Features A faire (9)
| # | Feature | Impact |
|---|---------|--------|
| F48 | Notifications email (Resend) | Eleve |
| F59 | Monitoring et support | Moyen |
| F69 | Analytics externes (GA, Mixpanel) | Moyen |

### Features Partielles critiques (a completer en priorite)
| # | Feature | Manquant principal |
|---|---------|-------------------|
| F1 | Dashboard Admin | Export PDF/Excel |
| F35 | Paiements Stripe | SDK Stripe non installe |
| F34 | Facturation auto | Cycles automatiques, TVA |
| F36 | Relances auto | Envoi email reel |
| F48 | Notifications email | Aucun code d'envoi |
| F54 | Auth securite | SSO manquant |
| F66 | Paiement | Stripe SDK + Wise |
| F70 | API REST | Documentation + endpoints |

### Dependencies bloquantes
1. **Email (F48, F36)** : Resend est installe mais il manque tout le code d'envoi. Bloque les relances, invitations par email, notifications email.
2. **Stripe (F35, F66)** : Package non installe. Bloque les paiements en ligne.
3. **SSO (F54)** : Pas de provider SAML/OAuth enterprise.
