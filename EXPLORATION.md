# EXPLORATION.md — Off-Market Testing Exploration

## Date: 2026-03-17

## Methode d'exploration

- Analyse statique de la codebase (App Router, pages, hooks, composants)
- Navigation Playwright MCP sur localhost:3000
- Inspection des snapshots d'accessibilite Playwright

---

## 1. Pages d'authentification

### /login

- **Elements**: Formulaire email + mot de passe, bouton "Se connecter", lien "Oublie ?" (forgot-password), lien "S'inscrire" (/signup)
- **2FA**: Si l'utilisateur a le 2FA active, ecran secondaire avec 6 inputs numeriques (TOTP)
- **Branding**: Logo "Off Market", couleur primaire rouge (#DC2626), layout split desktop (branding gauche, form droite)
- **Comportement**: Apres login, redirect vers `/{role}/dashboard` via middleware
- **Erreur**: Toast "Email ou mot de passe incorrect"
- **Bug note**: Premiere compilation Turbopack tres lente (~110s pour le dashboard)

### /signup

- Formulaire: full name, email, password (min 6 chars)
- Success: toast "Compte cree ! Verifie tes emails"

### /forgot-password

- Formulaire: email
- Success: toast "Email envoye"

### /register?code=xxx

- Inscription par invitation
- Affiche info de l'invite (nom, email, role assigne)
- Formulaire: password + confirmation

### /auth/callback

- Route API pour OAuth et magic links
- Echange le code pour une session

---

## 2. Dashboard Admin (/admin/dashboard)

### Sidebar (22+ liens)

| Lien           | URL                          | Icone                |
| -------------- | ---------------------------- | -------------------- |
| Dashboard      | /admin/dashboard             | Oui                  |
| CRM            | /admin/crm                   | Oui                  |
| Clients        | /admin/clients               | Oui                  |
| Messagerie     | /admin/messaging             | Oui                  |
| Formation      | /admin/school                | Oui                  |
| Formulaires    | /admin/forms                 | Oui                  |
| Facturation    | /admin/billing               | Oui                  |
| Contenu        | /admin/content               | Oui                  |
| Feed           | /admin/feed                  | Oui                  |
| Appels         | /admin/calls                 | Oui                  |
| Disponibilites | /admin/settings/availability | Oui                  |
| Assistant IA   | /admin/ai                    | Oui                  |
| Invitations    | /admin/invitations           | Oui                  |
| Ressources     | /admin/resources             | Oui                  |
| Recompenses    | /admin/rewards               | Oui                  |
| Badges         | /admin/badges                | Oui                  |
| Moderation     | /admin/moderation            | Oui                  |
| Calendrier     | /admin/calendar              | Oui                  |
| Equipe CSM     | /admin/csm                   | Oui                  |
| Analytics      | /admin/analytics             | Oui                  |
| Audit          | /admin/audit                 | Oui                  |
| FAQ / Base IA  | /admin/faq                   | Oui                  |
| Upsell         | /admin/upsell                | Oui                  |
| Parametres     | /admin/settings              | Oui (footer sidebar) |

### Header

- Breadcrumb: Home icon > Admin > Dashboard
- Bouton recherche "Rechercher... Cmd+K"
- Bouton "Ne pas deranger"
- Bouton Notifications
- Avatar utilisateur (Alexia Laneau, Admin)

### Contenu principal

- **Greeting**: "Bonjour, Alexia" + "Vue d'ensemble de la plateforme"
- **Alertes systeme**: "15 alertes systeme — 14 eleves inactifs - 1 a risque" + bouton "Voir les alertes"
- **KPI row 1**: CA du mois (0EUR), Eleves actifs (9), Nouveaux ce mois (9), LTV moyen (0EUR)
- **KPI row 2**: Retention (100%), Churn (0%), Taux closing (0%), Completion formations (2%)
- **Chart: Evolution CA** — Recharts AreaChart, 6 derniers mois (oct-mars), valeurs 0k
- **Chart: CA par canal** — Recharts PieChart, "Autre 0%"
- **Cash cards**: Cash encaisse (0EUR), Cash facture (0EUR), Check-ins semaine (0)
- **Rapport IA hebdomadaire**: "Generation du rapport en cours..." + bouton Regenerer (disabled)
- **Heatmap activite**: Grille Lun-Dim x 00-21h, legende Moins/Plus
- **Comparaison de periodes**: 2 periodes avec dates, 4 metriques (Revenus, Nouveaux clients, Appels completes, Lecons terminees)
- **Classement LTV clients**: "Aucune donnee LTV"
- **Objectifs KPI**: "Aucun objectif defini" + bouton configurer
- **Funnel de conversion**: (vide)
- **Activite recente**: "Aucune activite recente"
- **Leaderboard coaches**: Test User 1 (0 eleves), Test User 2 (0 eleves), Sophie Martin (0 eleves)

### Erreurs console

- `crm_contacts?select=pipeline_stage` — 404 (table probablement renommee)
- `/api/ai/periodic-report` — erreur serveur
- Warnings Recharts: chart width/height -1

---

## 3. Structure des roles et navigation

### 5 roles

| Role   | Prefix route | Dashboard         |
| ------ | ------------ | ----------------- |
| admin  | /admin       | /admin/dashboard  |
| coach  | /coach       | /coach/dashboard  |
| client | /client      | /client/dashboard |
| setter | /sales       | /sales/dashboard  |
| closer | /sales       | /sales/dashboard  |

### Pattern de pages partagees

La majorite des pages role-specifiques reexportent depuis `_shared-pages/`:

```
export { default } from "@/app/_shared-pages/[feature]/page"
```

Seules quelques pages sont uniques par role (admin/dashboard, admin/csm, admin/users, admin/billing, sales/dashboard, client/checkin, client/goals, etc.)

---

## 4. Bugs et problemes detectes

1. **Cold start Turbopack**: Premiere compilation de chaque page prend 10-110s
2. **Middleware deprecated**: Warning "middleware file convention is deprecated, use proxy instead" (Next.js 16)
3. **crm_contacts table**: 404 sur `crm_contacts?select=pipeline_stage` — la table n'existe peut-etre pas
4. **API AI periodic report**: Erreur serveur sur `/api/ai/periodic-report`
5. **Recharts warnings**: "The width(-1) and height(-1) of chart should be positive" — charts pas bien dimensionnes au premier rendu
6. **Logo warning**: "Image with src '/logo.png' was detected as the Largest Contentful Paint"
7. **Env vars mixtes**: `.env` a des `VITE_` prefixes (legacy), `.env.local` a des `NEXT_PUBLIC_` prefixes

---

## 5. Utilisateurs existants en base

| Nom              | Email                          | Role   |
| ---------------- | ------------------------------ | ------ |
| Gilles           | gilles.hayibor@gmail.com       | admin  |
| Alexia Laneau    | admin@offmarket.fr             | admin  |
| Sophie Martin    | coach@offmarket.fr             | coach  |
| Thomas Dupont    | prospect@offmarket.fr          | client |
| alex laneau      | alexlaneau46@gmail.com         | client |
| Test User 1      | test-user-1@offmarket.test     | coach  |
| Test User 2      | test-user-2@offmarket.test     | coach  |
| Test User 3-5    | test-user-{3-5}@offmarket.test | client |
| QA Test Admin    | qa-admin@offmarket.test        | client |
| Participant Test | test-participant@off-market.fr | client |
| 123              | 123@gmail.com                  | client |
| 222              | 222@mail.com                   | client |

---

## 6. Fonctionnalites a tester en priorite

### Critique (core business)

1. Login/signup/logout
2. Navigation par role
3. Dashboard (KPIs, charts)
4. CRM/Pipeline (Kanban, leads)
5. Messagerie (real-time)
6. Formations (courses, progression)
7. Appels/Calendar
8. Facturation (contracts, invoices)

### Important

9. Community/Feed
10. Check-in client (5 etapes)
11. Goals tracking
12. Journal
13. Gamification (XP, badges)
14. Formulaires (builder + soumission)
15. Onboarding wizard

### A verifier

16. Permissions cross-role
17. RLS Supabase
18. Responsive (mobile)
19. Edge cases (double submit, refresh, etc.)
20. Multi-user concurrent
