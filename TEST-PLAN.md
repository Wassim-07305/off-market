# Plan de test exhaustif — Off-Market

> CRM/Coaching platform — Next.js 16 + Supabase
> 5 roles : `admin`, `coach`, `client`, `setter`, `closer`
> Derniere mise a jour : 2026-03-17

---

## Table des matieres

1. [Auth](#1-auth)
2. [Navigation et routing](#2-navigation-et-routing)
3. [Dashboard](#3-dashboard)
4. [CRM / Pipeline](#4-crm--pipeline)
5. [Messagerie](#5-messagerie)
6. [School / Formations](#6-school--formations)
7. [Formulaires](#7-formulaires)
8. [Appels / Calendrier](#8-appels--calendrier)
9. [Communaute / Feed](#9-communaute--feed)
10. [Features client](#10-features-client)
11. [Features admin](#11-features-admin)
12. [Edge cases](#12-edge-cases)
13. [Multi-utilisateur](#13-multi-utilisateur)
14. [Permissions cross-role](#14-permissions-cross-role)

---

## 1. Auth

### 1.1 Login (`/login`)

**Roles concernes :** tous

| #      | Scenario                     | Happy path                                                                                                                     | Cas d'erreur                   | Assertions                                                                    |
| ------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ | ----------------------------------------------------------------------------- |
| 1.1.1  | Login email/password valide  | Saisir email + mdp valide, cliquer "Se connecter"                                                                              | —                              | UI: redirect vers `/{role}/dashboard`. DB: session creee dans `auth.sessions` |
| 1.1.2  | Email inexistant             | —                                                                                                                              | Saisir un email non inscrit    | UI: message "Email ou mot de passe incorrect". Pas de redirect                |
| 1.1.3  | Mot de passe incorrect       | —                                                                                                                              | Bon email, mauvais mdp         | UI: message d'erreur generique (pas de leak d'info). DB: pas de session       |
| 1.1.4  | Champs vides                 | —                                                                                                                              | Soumettre le formulaire vide   | UI: validation Zod, messages sous les champs requis                           |
| 1.1.5  | Email format invalide        | —                                                                                                                              | Saisir "abc@"                  | UI: erreur de validation format email                                         |
| 1.1.6  | Compte non confirme          | —                                                                                                                              | Login avant confirmation email | UI: message invitant a confirmer l'email                                      |
| 1.1.7  | Rate limiting                | —                                                                                                                              | 10+ tentatives rapides         | UI: erreur 429 "Trop de requetes". Headers: `Retry-After` present             |
| 1.1.8  | Redirect post-login par role | Login admin → `/admin/dashboard`, coach → `/coach/dashboard`, client → `/client/dashboard`, setter/closer → `/sales/dashboard` | —                              | UI: chaque role atterrit sur son dashboard                                    |
| 1.1.9  | Session persistante          | Login, fermer onglet, rouvrir                                                                                                  | —                              | UI: toujours connecte (cookie Supabase valide)                                |
| 1.1.10 | Redirect si deja connecte    | Visiter `/login` en etant connecte                                                                                             | —                              | UI: redirect vers dashboard du role                                           |

### 1.2 Signup (`/signup`)

**Roles concernes :** tous (creation compte)

| #     | Scenario                      | Happy path                         | Cas d'erreur                   | Assertions                                                                                             |
| ----- | ----------------------------- | ---------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| 1.2.1 | Inscription complete          | Remplir tous les champs, soumettre | —                              | DB: user cree dans `auth.users` + `profiles`. UI: message de confirmation email ou redirect onboarding |
| 1.2.2 | Email deja utilise            | —                                  | Saisir un email existant       | UI: erreur "Cet email est deja utilise"                                                                |
| 1.2.3 | Mot de passe trop court       | —                                  | mdp < 8 caracteres             | UI: validation Zod, message de longueur minimale                                                       |
| 1.2.4 | Confirmation mdp differente   | —                                  | mdp et confirmation differents | UI: erreur "Les mots de passe ne correspondent pas"                                                    |
| 1.2.5 | Champs obligatoires manquants | —                                  | Soumettre formulaire partiel   | UI: erreurs de validation sur chaque champ requis                                                      |

### 1.3 Mot de passe oublie (`/forgot-password`)

**Roles concernes :** tous

| #     | Scenario             | Happy path                                | Cas d'erreur               | Assertions                                                                   |
| ----- | -------------------- | ----------------------------------------- | -------------------------- | ---------------------------------------------------------------------------- |
| 1.3.1 | Demande reset valide | Saisir email existant, soumettre          | —                          | UI: message "Lien envoye". DB: email de reset envoye via Supabase Auth       |
| 1.3.2 | Email inexistant     | —                                         | Email non inscrit          | UI: meme message generique (pas de leak). Pas d'email envoye                 |
| 1.3.3 | Reset effectif       | Cliquer le lien email, saisir nouveau mdp | —                          | UI: confirmation. DB: hash mdp mis a jour. Login avec nouveau mdp fonctionne |
| 1.3.4 | Lien expire          | —                                         | Cliquer un lien de + de 1h | UI: message "Lien expire, veuillez reessayer"                                |

### 1.4 Register / Invitation (`/register`)

**Roles concernes :** tous (invitation par admin)

| #     | Scenario                          | Happy path                             | Cas d'erreur                     | Assertions                                                                 |
| ----- | --------------------------------- | -------------------------------------- | -------------------------------- | -------------------------------------------------------------------------- |
| 1.4.1 | Inscription via lien d'invitation | Cliquer le lien, remplir le formulaire | —                                | DB: compte cree avec le role de l'invitation. UI: redirect vers onboarding |
| 1.4.2 | Token d'invitation invalide       | —                                      | URL avec token falsifie          | UI: erreur "Invitation invalide ou expiree"                                |
| 1.4.3 | Token deja utilise                | —                                      | Re-cliquer un lien deja consomme | UI: erreur "Invitation deja utilisee"                                      |
| 1.4.4 | Invitation expiree                | —                                      | Lien de + de X jours             | UI: message d'expiration                                                   |

### 1.5 Session management

| #     | Scenario      | Happy path                               | Cas d'erreur               | Assertions                                                               |
| ----- | ------------- | ---------------------------------------- | -------------------------- | ------------------------------------------------------------------------ |
| 1.5.1 | Deconnexion   | Cliquer "Se deconnecter"                 | —                          | UI: redirect `/login`. DB: session invalidee. Cookie supprime            |
| 1.5.2 | Token expire  | —                                        | Attendre expiration du JWT | UI: redirect automatique vers `/login` au prochain appel API             |
| 1.5.3 | Refresh token | Rester connecte > 1h                     | —                          | Middleware renouvelle le token via `updateSession()`. Pas de deconnexion |
| 1.5.4 | Multi-onglet  | Ouvrir 2 onglets, se deconnecter dans un | —                          | L'autre onglet detecte la deconnexion au prochain appel                  |

---

## 2. Navigation et routing

### 2.1 Middleware et redirections

**Roles concernes :** tous

| #     | Scenario                     | Happy path                                     | Cas d'erreur | Assertions                                        |
| ----- | ---------------------------- | ---------------------------------------------- | ------------ | ------------------------------------------------- |
| 2.1.1 | Non connecte → page protegee | Visiter `/admin/dashboard` sans session        | —            | UI: redirect vers `/login`                        |
| 2.1.2 | Client → URL admin           | Client tente `/admin/dashboard`                | —            | UI: redirect vers `/client/dashboard` ou page 403 |
| 2.1.3 | Coach → URL client           | Coach tente `/client/dashboard`                | —            | UI: redirect vers `/coach/dashboard`              |
| 2.1.4 | Setter → URL admin           | Setter tente `/admin/analytics`                | —            | UI: redirect vers `/sales/dashboard`              |
| 2.1.5 | Onboarding non complete      | User connecte, `onboarding_completed = false`  | —            | UI: redirect vers `/onboarding`                   |
| 2.1.6 | Onboarding complete          | User ayant fini onboarding tente `/onboarding` | —            | UI: redirect vers dashboard role                  |

### 2.2 Pages par role — Admin

| #      | Route                                 | Assertions                                       |
| ------ | ------------------------------------- | ------------------------------------------------ |
| 2.2.1  | `/admin/dashboard`                    | Page charge, KPIs affiches, pas d'erreur console |
| 2.2.2  | `/admin/crm`                          | Liste des leads visible                          |
| 2.2.3  | `/admin/crm/[id]`                     | Detail lead avec timeline                        |
| 2.2.4  | `/admin/clients`                      | Liste clients                                    |
| 2.2.5  | `/admin/clients/[id]`                 | Fiche client complete                            |
| 2.2.6  | `/admin/clients/[id]/roadmap`         | Roadmap client visible                           |
| 2.2.7  | `/admin/messaging`                    | Liste channels                                   |
| 2.2.8  | `/admin/messaging/[channelId]`        | Conversation chargee, messages affiches          |
| 2.2.9  | `/admin/school`                       | Liste formations                                 |
| 2.2.10 | `/admin/school/[courseId]`            | Detail cours                                     |
| 2.2.11 | `/admin/school/[courseId]/[lessonId]` | Contenu lecon                                    |
| 2.2.12 | `/admin/school/admin`                 | Administration formations                        |
| 2.2.13 | `/admin/school/builder`               | Liste cours a editer                             |
| 2.2.14 | `/admin/school/builder/[courseId]`    | Builder de cours                                 |
| 2.2.15 | `/admin/forms`                        | Liste formulaires                                |
| 2.2.16 | `/admin/forms/new`                    | Creation formulaire                              |
| 2.2.17 | `/admin/forms/[formId]`               | Detail formulaire + reponses                     |
| 2.2.18 | `/admin/forms/[formId]/respond`       | Repondre a un formulaire                         |
| 2.2.19 | `/admin/forms/builder/[formId]`       | Builder formulaire                               |
| 2.2.20 | `/admin/billing`                      | Page facturation principale                      |
| 2.2.21 | `/admin/billing/contracts`            | Liste contrats                                   |
| 2.2.22 | `/admin/billing/contracts/[id]`       | Detail contrat                                   |
| 2.2.23 | `/admin/billing/invoices`             | Liste factures                                   |
| 2.2.24 | `/admin/billing/templates`            | Templates de facturation                         |
| 2.2.25 | `/admin/content`                      | Gestion contenu                                  |
| 2.2.26 | `/admin/feed`                         | Feed activite                                    |
| 2.2.27 | `/admin/calls`                        | Liste appels                                     |
| 2.2.28 | `/admin/calls/[callId]`               | Detail appel                                     |
| 2.2.29 | `/admin/calendar`                     | Calendrier                                       |
| 2.2.30 | `/admin/settings/availability`        | Disponibilites                                   |
| 2.2.31 | `/admin/ai`                           | Assistant IA                                     |
| 2.2.32 | `/admin/invitations`                  | Gestion invitations                              |
| 2.2.33 | `/admin/resources`                    | Ressources                                       |
| 2.2.34 | `/admin/rewards`                      | Recompenses                                      |
| 2.2.35 | `/admin/badges`                       | Badges                                           |
| 2.2.36 | `/admin/moderation`                   | Moderation contenu                               |
| 2.2.37 | `/admin/csm`                          | Equipe CSM                                       |
| 2.2.38 | `/admin/analytics`                    | Analytics                                        |
| 2.2.39 | `/admin/audit`                        | Audit                                            |
| 2.2.40 | `/admin/audit-log`                    | Journal d'audit                                  |
| 2.2.41 | `/admin/faq`                          | FAQ / Base IA                                    |
| 2.2.42 | `/admin/upsell`                       | Upsell                                           |
| 2.2.43 | `/admin/knowledge-base`               | Base de connaissances                            |
| 2.2.44 | `/admin/knowledge-base/[pageId]`      | Page KB                                          |
| 2.2.45 | `/admin/community`                    | Communaute                                       |
| 2.2.46 | `/admin/community/members`            | Membres communaute                               |
| 2.2.47 | `/admin/onboarding`                   | Gestion onboarding                               |
| 2.2.48 | `/admin/onboarding/[clientId]`        | Onboarding client specifique                     |
| 2.2.49 | `/admin/users`                        | Gestion utilisateurs                             |
| 2.2.50 | `/admin/settings`                     | Parametres                                       |
| 2.2.51 | `/admin/notifications`                | Notifications                                    |
| 2.2.52 | `/admin/profile/[userId]`             | Profil utilisateur                               |

### 2.3 Pages par role — Client

| #      | Route                                  | Assertions              |
| ------ | -------------------------------------- | ----------------------- |
| 2.3.1  | `/client/dashboard`                    | Dashboard client charge |
| 2.3.2  | `/client/calls`                        | Liste appels            |
| 2.3.3  | `/client/calls/[callId]`               | Detail appel            |
| 2.3.4  | `/client/contracts`                    | Liste contrats          |
| 2.3.5  | `/client/contracts/[id]`               | Detail contrat          |
| 2.3.6  | `/client/invoices`                     | Factures                |
| 2.3.7  | `/client/certificates`                 | Certificats             |
| 2.3.8  | `/client/progress`                     | Progression XP/badges   |
| 2.3.9  | `/client/checkin`                      | Check-in (5 etapes)     |
| 2.3.10 | `/client/goals`                        | Objectifs               |
| 2.3.11 | `/client/journal`                      | Journal                 |
| 2.3.12 | `/client/community`                    | Communaute              |
| 2.3.13 | `/client/community/members`            | Membres communaute      |
| 2.3.14 | `/client/messaging`                    | Messagerie              |
| 2.3.15 | `/client/messaging/[channelId]`        | Conversation            |
| 2.3.16 | `/client/school`                       | Liste formations        |
| 2.3.17 | `/client/school/[courseId]`            | Detail cours            |
| 2.3.18 | `/client/school/[courseId]/[lessonId]` | Lecon                   |
| 2.3.19 | `/client/forms`                        | Formulaires             |
| 2.3.20 | `/client/forms/new`                    | Nouveau formulaire      |
| 2.3.21 | `/client/forms/[formId]`               | Detail formulaire       |
| 2.3.22 | `/client/forms/[formId]/respond`       | Repondre formulaire     |
| 2.3.23 | `/client/feed`                         | Feed                    |
| 2.3.24 | `/client/resources`                    | Ressources              |
| 2.3.25 | `/client/knowledge-base`               | Base de connaissances   |
| 2.3.26 | `/client/knowledge-base/[pageId]`      | Page KB                 |
| 2.3.27 | `/client/ai`                           | Assistant IA            |
| 2.3.28 | `/client/notifications`                | Notifications           |
| 2.3.29 | `/client/booking`                      | Reservation             |
| 2.3.30 | `/client/replays`                      | Replays                 |
| 2.3.31 | `/client/hall-of-fame`                 | Hall of Fame            |
| 2.3.32 | `/client/leaderboard`                  | Classement              |
| 2.3.33 | `/client/rewards`                      | Recompenses             |
| 2.3.34 | `/client/challenges`                   | Challenges              |
| 2.3.35 | `/client/roadmap`                      | Roadmap                 |
| 2.3.36 | `/client/onboarding`                   | Onboarding client       |
| 2.3.37 | `/client/settings`                     | Parametres              |
| 2.3.38 | `/client/profile/[userId]`             | Profil                  |

### 2.4 Pages par role — Coach

| #      | Route                                 | Assertions               |
| ------ | ------------------------------------- | ------------------------ |
| 2.4.1  | `/coach/dashboard`                    | Dashboard coach          |
| 2.4.2  | `/coach/crm`                          | CRM leads                |
| 2.4.3  | `/coach/crm/[id]`                     | Detail lead              |
| 2.4.4  | `/coach/crm/[id]/roadmap`             | Roadmap lead             |
| 2.4.5  | `/coach/calls`                        | Liste appels             |
| 2.4.6  | `/coach/calls/[callId]`               | Detail appel             |
| 2.4.7  | `/coach/school`                       | Formations               |
| 2.4.8  | `/coach/school/[courseId]`            | Detail cours             |
| 2.4.9  | `/coach/school/[courseId]/[lessonId]` | Lecon                    |
| 2.4.10 | `/coach/school/admin`                 | Admin formations         |
| 2.4.11 | `/coach/school/builder`               | Builder formations       |
| 2.4.12 | `/coach/school/builder/[courseId]`    | Builder cours specifique |
| 2.4.13 | `/coach/messaging`                    | Messagerie               |
| 2.4.14 | `/coach/messaging/[channelId]`        | Conversation             |
| 2.4.15 | `/coach/community`                    | Communaute               |
| 2.4.16 | `/coach/community/members`            | Membres                  |
| 2.4.17 | `/coach/knowledge-base`               | Base connaissances       |
| 2.4.18 | `/coach/knowledge-base/[pageId]`      | Page KB                  |
| 2.4.19 | `/coach/ai`                           | Assistant IA             |
| 2.4.20 | `/coach/resources`                    | Ressources               |
| 2.4.21 | `/coach/checkins`                     | Check-ins clients        |
| 2.4.22 | `/coach/feed`                         | Feed                     |
| 2.4.23 | `/coach/settings/availability`        | Disponibilites           |
| 2.4.24 | `/coach/settings`                     | Parametres               |
| 2.4.25 | `/coach/calendar`                     | Calendrier               |
| 2.4.26 | `/coach/content`                      | Contenu                  |
| 2.4.27 | `/coach/journal`                      | Journal                  |
| 2.4.28 | `/coach/sessions`                     | Sessions coaching        |
| 2.4.29 | `/coach/alerts`                       | Alertes                  |
| 2.4.30 | `/coach/notifications`                | Notifications            |
| 2.4.31 | `/coach/profile/[userId]`             | Profil                   |

### 2.5 Pages par role — Sales (setter/closer)

| #      | Route                          | Assertions      |
| ------ | ------------------------------ | --------------- |
| 2.5.1  | `/sales/dashboard`             | Dashboard sales |
| 2.5.2  | `/sales/calls`                 | Liste appels    |
| 2.5.3  | `/sales/calls/[callId]`        | Detail appel    |
| 2.5.4  | `/sales/pipeline`              | Pipeline ventes |
| 2.5.5  | `/sales/messaging`             | Messagerie      |
| 2.5.6  | `/sales/messaging/[channelId]` | Conversation    |
| 2.5.7  | `/sales/resources`             | Ressources      |
| 2.5.8  | `/sales/notifications`         | Notifications   |
| 2.5.9  | `/sales/settings`              | Parametres      |
| 2.5.10 | `/sales/profile/[userId]`      | Profil          |

### 2.6 Pages publiques

| #     | Route                  | Assertions                                           |
| ----- | ---------------------- | ---------------------------------------------------- |
| 2.6.1 | `/` (marketing)        | Landing page charge, pas besoin d'auth               |
| 2.6.2 | `/contracts/[id]/sign` | Page de signature contrat publique, charge sans auth |
| 2.6.3 | `/lead-magnet`         | Page lead magnet accessible sans auth                |

### 2.7 Responsive et sidebar

| #     | Scenario              | Assertions                                     |
| ----- | --------------------- | ---------------------------------------------- |
| 2.7.1 | Desktop (>1024px)     | Sidebar visible, tous les liens affiches       |
| 2.7.2 | Tablette (768-1024px) | Sidebar collapses ou burger menu               |
| 2.7.3 | Mobile (<768px)       | Bottom nav ou menu hamburger. Sidebar cachee   |
| 2.7.4 | Breadcrumbs           | Chaque page affiche le bon breadcrumb          |
| 2.7.5 | Page 404              | URL inexistante affiche page 404 personnalisee |

---

## 3. Dashboard

### 3.1 Dashboard admin (`/admin/dashboard`)

**Role concerne :** admin

| #      | Scenario                | Happy path                     | Cas d'erreur | Assertions                                                                                  |
| ------ | ----------------------- | ------------------------------ | ------------ | ------------------------------------------------------------------------------------------- |
| 3.1.1  | KPIs principaux         | Page charge                    | —            | UI: CA du mois, Eleves actifs, Nouveaux ce mois, LTV moyen affiches avec valeurs numeriques |
| 3.1.2  | Taux affichages         | —                              | —            | UI: Retention, Churn, Taux closing, Completion formations visibles en %                     |
| 3.1.3  | Chart evolution CA      | —                              | —            | UI: Graphique Recharts rendu, axes labels visibles, donnees coherentes                      |
| 3.1.4  | Chart CA par canal      | —                              | —            | UI: Graphique camembert/barres avec legendes                                                |
| 3.1.5  | Heatmap activite        | —                              | —            | UI: Grille couleur representant l'activite                                                  |
| 3.1.6  | Comparaison periodes    | Changer la periode             | —            | UI: Donnees se mettent a jour, comparaison avant/apres visible                              |
| 3.1.7  | Rapport IA hebdomadaire | —                              | —            | UI: Section rapport IA visible, contenu genere                                              |
| 3.1.8  | Classement LTV          | —                              | —            | UI: Liste ordonnee des clients par LTV                                                      |
| 3.1.9  | Objectifs KPI           | —                              | —            | UI: Barre de progression pour chaque KPI cible                                              |
| 3.1.10 | Funnel conversion       | —                              | —            | UI: Funnel avec etapes et taux de conversion                                                |
| 3.1.11 | Leaderboard coaches     | —                              | —            | UI: Classement des coaches par performance                                                  |
| 3.1.12 | Dashboard vide          | Pas de donnees en DB           | —            | UI: Empty states avec messages explicatifs, pas de crash                                    |
| 3.1.13 | Donnees temps reel      | Ajouter un client en parallele | —            | UI: KPIs se mettent a jour (si subscription temps reel)                                     |

### 3.2 Dashboard client (`/client/dashboard`)

**Role concerne :** client

| #     | Scenario              | Happy path                  | Cas d'erreur | Assertions                                                     |
| ----- | --------------------- | --------------------------- | ------------ | -------------------------------------------------------------- |
| 3.2.1 | Affichage global      | Page charge                 | —            | UI: Progression, prochains appels, derniers check-ins visibles |
| 3.2.2 | XP et badges          | —                           | —            | UI: Points XP, niveau, badges obtenus                          |
| 3.2.3 | Prochains rendez-vous | RDV planifies               | —            | UI: Liste avec date, heure, coach                              |
| 3.2.4 | Nouveau client (vide) | Client venant de s'inscrire | —            | UI: Empty states, CTA pour onboarding/check-in                 |

### 3.3 Dashboard coach (`/coach/dashboard`)

**Role concerne :** coach

| #     | Scenario         | Happy path                  | Cas d'erreur | Assertions                                                 |
| ----- | ---------------- | --------------------------- | ------------ | ---------------------------------------------------------- |
| 3.3.1 | Affichage global | Page charge                 | —            | UI: Clients actifs, sessions a venir, stats de performance |
| 3.3.2 | Alertes clients  | Client avec check-in manque | —            | UI: Notification/alerte dans le dashboard                  |

### 3.4 Dashboard sales (`/sales/dashboard`)

**Roles concernes :** setter, closer

| #     | Scenario         | Happy path         | Cas d'erreur | Assertions                                          |
| ----- | ---------------- | ------------------ | ------------ | --------------------------------------------------- |
| 3.4.1 | Affichage setter | Connecte en setter | —            | UI: Pipeline, prochains appels, metriques de setter |
| 3.4.2 | Affichage closer | Connecte en closer | —            | UI: Appels de closing, taux de conversion, revenus  |

---

## 4. CRM / Pipeline

### 4.1 CRM Admin/Coach (`/admin/crm`, `/coach/crm`)

**Roles concernes :** admin, coach

| #     | Scenario                  | Happy path                                | Cas d'erreur              | Assertions                                                                  |
| ----- | ------------------------- | ----------------------------------------- | ------------------------- | --------------------------------------------------------------------------- |
| 4.1.1 | Liste des leads           | Page charge                               | —                         | UI: Tableau/liste des leads avec nom, statut, date. DB: `leads` table query |
| 4.1.2 | Creer un lead             | Cliquer "Nouveau", remplir formulaire     | —                         | UI: Lead apparait dans la liste. DB: insert dans `leads`                    |
| 4.1.3 | Creer lead — champs vides | —                                         | Soumettre formulaire vide | UI: Validation Zod, erreurs affichees                                       |
| 4.1.4 | Editer un lead            | Cliquer lead, modifier infos, sauvegarder | —                         | UI: Toast succes. DB: update `leads`                                        |
| 4.1.5 | Supprimer un lead         | Confirmer suppression                     | —                         | UI: Lead retire de la liste. DB: delete `leads`                             |
| 4.1.6 | Filtrer par statut        | Selectionner un filtre statut             | —                         | UI: Seuls les leads du statut selectionne affiches                          |
| 4.1.7 | Recherche lead            | Taper dans la barre de recherche          | —                         | UI: Resultats filtres en temps reel                                         |
| 4.1.8 | Detail lead               | Cliquer sur un lead                       | —                         | UI: `/admin/crm/[id]` charge avec timeline, infos completes                 |

### 4.2 Pipeline Sales (`/sales/pipeline`)

**Roles concernes :** setter, closer

| #     | Scenario         | Happy path                               | Cas d'erreur | Assertions                                                |
| ----- | ---------------- | ---------------------------------------- | ------------ | --------------------------------------------------------- |
| 4.2.1 | Vue Kanban       | Page charge                              | —            | UI: Colonnes par statut, cards deplacables                |
| 4.2.2 | Drag & drop      | Deplacer un lead d'une colonne a l'autre | —            | UI: Card se deplace. DB: `status` mis a jour dans `leads` |
| 4.2.3 | Filtres pipeline | Filtrer par setter/closer assigne        | —            | UI: Seuls les leads filtres visibles                      |
| 4.2.4 | Pipeline vide    | Aucun lead assigne                       | —            | UI: Empty state avec message                              |

### 4.3 Clients (`/admin/clients`)

**Roles concernes :** admin, coach

| #     | Scenario            | Happy path                             | Cas d'erreur | Assertions                                                         |
| ----- | ------------------- | -------------------------------------- | ------------ | ------------------------------------------------------------------ |
| 4.3.1 | Liste clients       | Page charge                            | —            | UI: Tableau avec nom, email, date inscription, statut              |
| 4.3.2 | Fiche client detail | Cliquer sur un client                  | —            | UI: `/admin/clients/[id]` avec historique, contrats, progression   |
| 4.3.3 | Roadmap client      | Aller dans roadmap                     | —            | UI: `/admin/clients/[id]/roadmap` charge                           |
| 4.3.4 | Isolation coach     | Coach ne voit que ses clients assignes | —            | DB: RLS filtre par `coach_id`. UI: pas de clients d'autres coaches |

---

## 5. Messagerie

### 5.1 Channels

**Roles concernes :** admin, coach, client, setter, closer

| #     | Scenario                     | Happy path             | Cas d'erreur          | Assertions                                     |
| ----- | ---------------------------- | ---------------------- | --------------------- | ---------------------------------------------- |
| 5.1.1 | Liste channels               | Ouvrir messagerie      | —                     | UI: Liste des channels auxquels l'user a acces |
| 5.1.2 | Creer un channel (admin)     | Admin cree un channel  | —                     | UI: Channel apparait. DB: insert `channels`    |
| 5.1.3 | Creer un channel (non-admin) | —                      | Client tente de creer | UI: Bouton absent ou erreur permission         |
| 5.1.4 | Ouvrir une conversation      | Cliquer sur un channel | —                     | UI: Messages charges, scroll en bas            |
| 5.1.5 | Channel vide                 | Channel sans messages  | —                     | UI: Empty state "Commencez la conversation"    |

### 5.2 Messages temps reel

| #     | Scenario                     | Happy path                   | Cas d'erreur               | Assertions                                                            |
| ----- | ---------------------------- | ---------------------------- | -------------------------- | --------------------------------------------------------------------- |
| 5.2.1 | Envoyer un message           | Taper texte, cliquer envoyer | —                          | UI: Message apparait instantanement. DB: insert `messages`            |
| 5.2.2 | Recevoir un message          | Autre user envoie            | —                          | UI: Message apparait sans refresh (Supabase subscription)             |
| 5.2.3 | Message vide                 | —                            | Cliquer envoyer sans texte | UI: Bouton desactive ou validation                                    |
| 5.2.4 | Message long (5000+ chars)   | Envoyer message tres long    | —                          | UI: Message affiche avec troncature ou scroll. DB: sauvegarde complet |
| 5.2.5 | Supprimer un message         | Supprimer son propre message | —                          | UI: Message retire. DB: soft/hard delete                              |
| 5.2.6 | Supprimer message d'un autre | —                            | Tenter de supprimer        | UI: Option absente ou erreur permission                               |
| 5.2.7 | Scroll historique            | Channel avec 100+ messages   | —                          | UI: Scroll up charge les anciens messages (pagination)                |

### 5.3 DMs

| #     | Scenario        | Happy path                  | Cas d'erreur                    | Assertions                          |
| ----- | --------------- | --------------------------- | ------------------------------- | ----------------------------------- |
| 5.3.1 | Ouvrir DM       | Cliquer sur un user pour DM | —                               | UI: Conversation privee ouverte     |
| 5.3.2 | DM entre roles  | Client DM son coach         | —                               | UI: Les deux voient la conversation |
| 5.3.3 | DM non autorise | —                           | Setter DM un client directement | UI: Bloque par RLS ou permission    |

---

## 6. School / Formations

### 6.1 Catalogue formations

**Roles concernes :** admin, coach, client

| #     | Scenario              | Happy path                | Cas d'erreur | Assertions                                                        |
| ----- | --------------------- | ------------------------- | ------------ | ----------------------------------------------------------------- |
| 6.1.1 | Liste formations      | Ouvrir `/school`          | —            | UI: Cards des formations avec titre, description, progression     |
| 6.1.2 | Formation non publiee | Admin voit les drafts     | —            | UI: Badge "Brouillon". Client ne voit PAS les drafts              |
| 6.1.3 | Detail formation      | Cliquer sur une formation | —            | UI: Description, modules, progression, bouton commencer/reprendre |
| 6.1.4 | Formation vide        | Aucune formation creee    | —            | UI: Empty state                                                   |

### 6.2 Lecons et progression

**Roles concernes :** client (consommation), admin/coach (creation)

| #     | Scenario               | Happy path                                      | Cas d'erreur              | Assertions                                                       |
| ----- | ---------------------- | ----------------------------------------------- | ------------------------- | ---------------------------------------------------------------- |
| 6.2.1 | Voir une lecon         | Cliquer sur une lecon                           | —                         | UI: Contenu (texte, video, quiz) affiche                         |
| 6.2.2 | Marquer comme complete | Finir une lecon, cliquer "Terminee"             | —                         | UI: Checkmark, progression mise a jour. DB: insert `completions` |
| 6.2.3 | Progression globale    | Completer 3/10 lecons                           | —                         | UI: Barre 30%, compteur "3/10"                                   |
| 6.2.4 | Prerequis              | Tenter d'acceder a lecon 5 sans avoir fait la 4 | —                         | UI: Lecon verrouillee ou message                                 |
| 6.2.5 | Double completion      | —                                               | Cliquer "Terminee" 2 fois | DB: Pas de doublon dans `completions`. UI: pas d'erreur          |

### 6.3 Builder formations (staff)

**Roles concernes :** admin, coach

| #     | Scenario             | Happy path                          | Cas d'erreur | Assertions                                             |
| ----- | -------------------- | ----------------------------------- | ------------ | ------------------------------------------------------ |
| 6.3.1 | Creer un cours       | `/school/builder`, nouveau cours    | —            | UI: Formulaire creation. DB: insert `courses`          |
| 6.3.2 | Ajouter un module    | Dans le builder, ajouter module     | —            | UI: Module apparait dans l'arbre. DB: insert `modules` |
| 6.3.3 | Ajouter une lecon    | Dans un module, ajouter lecon       | —            | UI: Lecon dans la liste. DB: insert `module_items`     |
| 6.3.4 | Editer contenu lecon | Modifier le texte/video d'une lecon | —            | UI: Toast succes. DB: update content                   |
| 6.3.5 | Reordonner lecons    | Drag & drop pour reordonner         | —            | UI: Ordre mis a jour. DB: `position` updated           |
| 6.3.6 | Publier un cours     | Changer statut en "Publie"          | —            | UI: Visible pour les clients. DB: `status = published` |
| 6.3.7 | Supprimer un cours   | Supprimer depuis le builder         | —            | UI: Confirm dialog. DB: soft delete ou cascade         |
| 6.3.8 | Admin formations     | `/school/admin`                     | —            | UI: Stats inscrits, taux completion, gestion batch     |

---

## 7. Formulaires

### 7.1 Form builder (staff)

**Roles concernes :** admin, coach

| #     | Scenario                 | Happy path                                    | Cas d'erreur | Assertions                                               |
| ----- | ------------------------ | --------------------------------------------- | ------------ | -------------------------------------------------------- |
| 7.1.1 | Creer un formulaire      | `/forms/builder`, ajouter champs              | —            | UI: Builder avec champs drag & drop. DB: insert `forms`  |
| 7.1.2 | Types de champs          | Ajouter texte, nombre, select, checkbox, date | —            | UI: Chaque type se rend correctement dans le preview     |
| 7.1.3 | Champ obligatoire        | Marquer un champ required                     | —            | UI: Asterisque visible. Validation cote client           |
| 7.1.4 | Preview formulaire       | Cliquer "Apercu"                              | —            | UI: Formulaire rendu tel qu'il sera vu                   |
| 7.1.5 | Sauvegarder en brouillon | Sauvegarder sans publier                      | —            | UI: Statut "Brouillon". DB: `status = draft`             |
| 7.1.6 | Publier formulaire       | Publier                                       | —            | UI: Lien de partage disponible. DB: `status = published` |
| 7.1.7 | Copier lien              | Cliquer icone copier                          | —            | UI: Toast "Lien copie". Clipboard contient l'URL         |

### 7.2 Soumission formulaire

**Roles concernes :** client (principal), tous (selon formulaire)

| #     | Scenario              | Happy path                         | Cas d'erreur                       | Assertions                                                 |
| ----- | --------------------- | ---------------------------------- | ---------------------------------- | ---------------------------------------------------------- |
| 7.2.1 | Remplir et soumettre  | Remplir tous les champs, soumettre | —                                  | UI: Toast succes, redirect. DB: insert `form_submissions`  |
| 7.2.2 | Champ requis manquant | —                                  | Soumettre sans champ obligatoire   | UI: Message d'erreur sur le champ                          |
| 7.2.3 | Format invalide       | —                                  | Email invalide dans champ email    | UI: Validation format                                      |
| 7.2.4 | Double soumission     | —                                  | Cliquer 2 fois sur soumettre       | DB: 1 seule soumission. UI: bouton disabled apres 1er clic |
| 7.2.5 | Formulaire ferme      | —                                  | Acceder a un formulaire non publie | UI: Message "Formulaire indisponible"                      |

### 7.3 Gestion reponses (staff)

| #     | Scenario                | Happy path        | Cas d'erreur | Assertions                               |
| ----- | ----------------------- | ----------------- | ------------ | ---------------------------------------- |
| 7.3.1 | Voir les reponses       | `/forms/[formId]` | —            | UI: Tableau des soumissions avec donnees |
| 7.3.2 | Exporter reponses       | Bouton export CSV | —            | UI: Telechargement fichier CSV           |
| 7.3.3 | Formulaire sans reponse | —                 | —            | UI: Empty state "Aucune reponse"         |

---

## 8. Appels / Calendrier

### 8.1 Liste et gestion d'appels

**Roles concernes :** admin, coach, client, setter, closer

| #     | Scenario                      | Happy path                               | Cas d'erreur                 | Assertions                                                   |
| ----- | ----------------------------- | ---------------------------------------- | ---------------------------- | ------------------------------------------------------------ |
| 8.1.1 | Vue semaine                   | Ouvrir `/calls`                          | —                            | UI: Calendrier semaine ou liste avec creneaux                |
| 8.1.2 | Vue liste                     | Basculer en mode liste                   | —                            | UI: Tableau avec date, heure, participant, statut            |
| 8.1.3 | Creer un appel (staff)        | Cliquer "Nouvel appel", remplir          | —                            | UI: Appel cree. DB: insert `call_calendar` ou `closer_calls` |
| 8.1.4 | Creer appel — conflit horaire | —                                        | Choisir un creneau deja pris | UI: Erreur "Creneau indisponible"                            |
| 8.1.5 | Creer appel — champs vides    | —                                        | Soumettre sans infos         | UI: Validation formulaire                                    |
| 8.1.6 | Detail appel                  | Cliquer sur un appel                     | —                            | UI: Page detail avec infos, notes, statut, actions           |
| 8.1.7 | Annuler un appel              | Annuler depuis le detail                 | —                            | UI: Statut "Annule". DB: update statut                       |
| 8.1.8 | Filtrer par statut            | Filtrer "A venir" / "Passes" / "Annules" | —                            | UI: Liste filtree                                            |

### 8.2 Disponibilites (`/settings/availability`)

**Roles concernes :** admin, coach

| #     | Scenario               | Happy path                  | Cas d'erreur | Assertions                                          |
| ----- | ---------------------- | --------------------------- | ------------ | --------------------------------------------------- |
| 8.2.1 | Definir creneaux       | Selectionner jours + heures | —            | UI: Creneaux sauvegardes. DB: update disponibilites |
| 8.2.2 | Supprimer creneau      | Retirer un creneau          | —            | UI: Creneau disparu. DB: delete                     |
| 8.2.3 | Google Calendar toggle | Activer/desactiver synchro  | —            | UI: Toggle change d'etat                            |

### 8.3 Booking client (`/client/booking`)

**Role concerne :** client

| #     | Scenario            | Happy path                   | Cas d'erreur                         | Assertions                            |
| ----- | ------------------- | ---------------------------- | ------------------------------------ | ------------------------------------- |
| 8.3.1 | Voir creneaux dispo | Ouvrir booking               | —                                    | UI: Creneaux du coach affiches        |
| 8.3.2 | Reserver un creneau | Cliquer sur un creneau libre | —                                    | UI: Confirmation. DB: appel cree      |
| 8.3.3 | Creneau deja pris   | —                            | Cliquer sur creneau pris entre-temps | UI: Erreur de conflit                 |
| 8.3.4 | Annuler reservation | Annuler un RDV               | —                                    | UI: RDV annule. DB: statut mis a jour |

---

## 9. Communaute / Feed

### 9.1 Feed

**Roles concernes :** admin, coach, client

| #      | Scenario                              | Happy path                     | Cas d'erreur             | Assertions                                                |
| ------ | ------------------------------------- | ------------------------------ | ------------------------ | --------------------------------------------------------- |
| 9.1.1  | Affichage feed                        | Ouvrir `/feed`                 | —                        | UI: Posts recents, scroll infini ou pagine                |
| 9.1.2  | Creer un post                         | Ecrire texte, publier          | —                        | UI: Post apparait en haut. DB: insert posts               |
| 9.1.3  | Post avec image                       | Uploader image + texte         | —                        | UI: Image affichee dans le post. Storage: fichier uploade |
| 9.1.4  | Post vide                             | —                              | Publier sans contenu     | UI: Bouton desactive ou erreur                            |
| 9.1.5  | Liker un post                         | Cliquer coeur/like             | —                        | UI: Compteur +1, coeur rempli. DB: insert like            |
| 9.1.6  | Unlike                                | Cliquer a nouveau              | —                        | UI: Compteur -1. DB: delete like                          |
| 9.1.7  | Commenter                             | Ecrire commentaire, envoyer    | —                        | UI: Commentaire visible. DB: insert comment               |
| 9.1.8  | Commenter vide                        | —                              | Envoyer commentaire vide | UI: Bloque                                                |
| 9.1.9  | Supprimer son post                    | Supprimer un post qu'on a cree | —                        | UI: Post retire. DB: delete                               |
| 9.1.10 | Supprimer post d'un autre (non-admin) | —                              | Pas admin, essayer       | UI: Option absente                                        |
| 9.1.11 | Trending / trie                       | Trier par popularite           | —                        | UI: Ordre change selon likes/comments                     |

### 9.2 Communaute et membres

| #     | Scenario         | Happy path                       | Cas d'erreur | Assertions                                          |
| ----- | ---------------- | -------------------------------- | ------------ | --------------------------------------------------- |
| 9.2.1 | Liste membres    | `/community/members`             | —            | UI: Liste avec avatar, nom, role, derniere activite |
| 9.2.2 | Profil membre    | Cliquer sur un membre            | —            | UI: Page profil avec infos publiques                |
| 9.2.3 | Recherche membre | Taper dans la barre de recherche | —            | UI: Filtrage en temps reel                          |

---

## 10. Features client

### 10.1 Check-in (5 etapes) (`/client/checkin`)

**Role concerne :** client

| #      | Scenario                    | Happy path                 | Cas d'erreur                       | Assertions                                                          |
| ------ | --------------------------- | -------------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| 10.1.1 | Etape 1 : Humeur            | Selectionner une humeur    | —                                  | UI: Selection visuelle (emoji/slider). Passer a etape 2             |
| 10.1.2 | Etape 2 : Energie           | Evaluer son energie        | —                                  | UI: Slider/selection. Passer a etape 3                              |
| 10.1.3 | Etape 3 : Objectifs du jour | Ecrire ses objectifs       | —                                  | UI: Champ texte libre. Passer a etape 4                             |
| 10.1.4 | Etape 4 : Blocages          | Identifier les blocages    | —                                  | UI: Champ texte/select. Passer a etape 5                            |
| 10.1.5 | Etape 5 : Engagement        | Confirmer engagement       | —                                  | UI: Bouton "Valider". DB: insert check-in complet                   |
| 10.1.6 | Soumettre check-in          | Completer les 5 etapes     | —                                  | UI: Toast succes, XP gagne. DB: `journal_entries` ou table check-in |
| 10.1.7 | Retour en arriere           | Revenir a etape precedente | —                                  | UI: Donnees conservees, stepper mis a jour                          |
| 10.1.8 | Quitter mid-checkin         | Fermer la page a etape 3   | —                                  | UI: Donnees NON sauvegardees (ou brouillon). Confirmation quitter ? |
| 10.1.9 | Double check-in meme jour   | —                          | Soumettre 2 check-ins le meme jour | UI: Erreur "Deja complete aujourd'hui" ou ecrase le precedent       |

### 10.2 Goals (`/client/goals`)

**Role concerne :** client

| #      | Scenario              | Happy path               | Cas d'erreur | Assertions                              |
| ------ | --------------------- | ------------------------ | ------------ | --------------------------------------- |
| 10.2.1 | Voir ses objectifs    | Ouvrir goals             | —            | UI: Liste objectifs avec progression    |
| 10.2.2 | Creer un objectif     | Ajouter un objectif      | —            | UI: Objectif dans la liste. DB: insert  |
| 10.2.3 | Marquer comme atteint | Cocher un objectif       | —            | UI: Style "complete". DB: update statut |
| 10.2.4 | Modifier un objectif  | Editer titre/description | —            | UI: Modifie. DB: update                 |
| 10.2.5 | Supprimer un objectif | Supprimer                | —            | UI: Retire. DB: delete                  |

### 10.3 Journal (`/client/journal`)

**Role concerne :** client

| #      | Scenario        | Happy path                  | Cas d'erreur           | Assertions                                       |
| ------ | --------------- | --------------------------- | ---------------------- | ------------------------------------------------ |
| 10.3.1 | Voir historique | Ouvrir journal              | —                      | UI: Entrees passees ordonnees par date           |
| 10.3.2 | Nouvelle entree | Ecrire, sauvegarder         | —                      | UI: Entree ajoutee. DB: insert `journal_entries` |
| 10.3.3 | Entree vide     | —                           | Sauvegarder sans texte | UI: Validation erreur                            |
| 10.3.4 | Modifier entree | Editer une entree existante | —                      | UI: Modifiee. DB: update                         |

### 10.4 Progression / XP / Badges (`/client/progress`)

**Role concerne :** client

| #      | Scenario             | Happy path            | Cas d'erreur | Assertions                                                     |
| ------ | -------------------- | --------------------- | ------------ | -------------------------------------------------------------- |
| 10.4.1 | Affichage XP         | Ouvrir progress       | —            | UI: Points XP, niveau actuel, barre vers prochain niveau       |
| 10.4.2 | Badges obtenus       | —                     | —            | UI: Grille badges avec obtenus (colores) et manquants (grises) |
| 10.4.3 | Gain XP apres action | Completer un check-in | —            | UI: Animation XP +X points. DB: insert `gamification_entries`  |
| 10.4.4 | Deblocage badge      | Atteindre un seuil    | —            | UI: Notification badge debloque. DB: badge attribue            |

### 10.5 Contrats (`/client/contracts`)

**Role concerne :** client

| #      | Scenario           | Happy path                  | Cas d'erreur               | Assertions                                            |
| ------ | ------------------ | --------------------------- | -------------------------- | ----------------------------------------------------- |
| 10.5.1 | Liste contrats     | Ouvrir contracts            | —                          | UI: Contrats avec statut (en attente, signe, expire)  |
| 10.5.2 | Voir contrat       | Cliquer sur un contrat      | —                          | UI: Detail avec conditions, PDF, statut               |
| 10.5.3 | Signer un contrat  | Page `/contracts/[id]/sign` | —                          | UI: Signature electronique. DB: update statut "signe" |
| 10.5.4 | Contrat deja signe | —                           | Acceder a un contrat signe | UI: Message "Deja signe", pas de double signature     |

### 10.6 Factures (`/client/invoices`)

**Role concerne :** client

| #      | Scenario                | Happy path       | Cas d'erreur | Assertions                                                  |
| ------ | ----------------------- | ---------------- | ------------ | ----------------------------------------------------------- |
| 10.6.1 | Liste factures          | Ouvrir invoices  | —            | UI: Factures avec montant, date, statut (payee, en attente) |
| 10.6.2 | Telecharger facture PDF | Cliquer download | —            | UI: PDF telecharge                                          |
| 10.6.3 | Facture en attente      | —                | —            | UI: Badge "En attente" + CTA paiement si applicable         |

### 10.7 Certificats (`/client/certificates`)

**Role concerne :** client

| #      | Scenario               | Happy path                | Cas d'erreur | Assertions                        |
| ------ | ---------------------- | ------------------------- | ------------ | --------------------------------- |
| 10.7.1 | Liste certificats      | Formations completes      | —            | UI: Certificats disponibles       |
| 10.7.2 | Telecharger certificat | Cliquer download          | —            | UI: PDF avec nom, formation, date |
| 10.7.3 | Pas de certificat      | Aucune formation complete | —            | UI: Empty state                   |

### 10.8 Booking (`/client/booking`)

Voir section 8.3

### 10.9 Replays (`/client/replays`)

**Role concerne :** client

| #      | Scenario       | Happy path     | Cas d'erreur | Assertions                     |
| ------ | -------------- | -------------- | ------------ | ------------------------------ |
| 10.9.1 | Liste replays  | Ouvrir replays | —            | UI: Videos de sessions passees |
| 10.9.2 | Lire un replay | Cliquer play   | —            | UI: Video player charge        |
| 10.9.3 | Aucun replay   | —              | —            | UI: Empty state                |

### 10.10 Hall of Fame / Leaderboard

**Role concerne :** client

| #       | Scenario             | Happy path                         | Cas d'erreur | Assertions                                                |
| ------- | -------------------- | ---------------------------------- | ------------ | --------------------------------------------------------- |
| 10.10.1 | Classement           | Ouvrir hall-of-fame ou leaderboard | —            | UI: Classement par XP/badges. User actuel mis en evidence |
| 10.10.2 | Position personnelle | —                                  | —            | UI: "Vous etes Xeme" visible                              |

### 10.11 Challenges (`/client/challenges`)

**Role concerne :** client

| #       | Scenario               | Happy path           | Cas d'erreur | Assertions                                          |
| ------- | ---------------------- | -------------------- | ------------ | --------------------------------------------------- |
| 10.11.1 | Liste challenges       | Ouvrir challenges    | —            | UI: Challenges actifs avec progression              |
| 10.11.2 | Rejoindre un challenge | Cliquer "Participer" | —            | UI: Inscription confirmee. DB: insert participation |
| 10.11.3 | Challenge termine      | —                    | —            | UI: Resultats, classement final                     |

### 10.12 Roadmap client (`/client/roadmap`)

**Role concerne :** client

| #       | Scenario               | Happy path     | Cas d'erreur           | Assertions                                             |
| ------- | ---------------------- | -------------- | ---------------------- | ------------------------------------------------------ |
| 10.12.1 | Voir sa roadmap        | Ouvrir roadmap | —                      | UI: Etapes avec progression, prochaines actions        |
| 10.12.2 | Roadmap non configuree | —              | Pas de roadmap definie | UI: Message "Votre coach va configurer votre parcours" |

---

## 11. Features admin

### 11.1 Gestion utilisateurs (`/admin/users`)

**Role concerne :** admin

| #      | Scenario           | Happy path                          | Cas d'erreur | Assertions                                               |
| ------ | ------------------ | ----------------------------------- | ------------ | -------------------------------------------------------- |
| 11.1.1 | Liste users        | Ouvrir users                        | —            | UI: Tableau avec nom, email, role, statut, date creation |
| 11.1.2 | Filtrer par role   | Selectionner "Coach" dans le filtre | —            | UI: Seuls les coaches affiches                           |
| 11.1.3 | Changer le role    | Modifier le role d'un user          | —            | UI: Role mis a jour. DB: update `user_roles`             |
| 11.1.4 | Desactiver un user | Toggle actif/inactif                | —            | UI: Statut change. DB: user ne peut plus se connecter    |
| 11.1.5 | Voir profil        | Cliquer sur un user                 | —            | UI: Page profil complete                                 |
| 11.1.6 | Recherche          | Chercher par nom/email              | —            | UI: Resultats filtres                                    |

### 11.2 Facturation (`/admin/billing`)

**Role concerne :** admin

| #      | Scenario              | Happy path                | Cas d'erreur | Assertions                                               |
| ------ | --------------------- | ------------------------- | ------------ | -------------------------------------------------------- |
| 11.2.1 | Vue d'ensemble        | Ouvrir billing            | —            | UI: KPIs facturation (CA, impayes, echeanciers)          |
| 11.2.2 | Liste contrats        | `/billing/contracts`      | —            | UI: Tableau contrats avec montant, client, statut        |
| 11.2.3 | Creer contrat         | Nouveau contrat           | —            | UI: Formulaire. DB: insert `contracts`                   |
| 11.2.4 | Detail contrat        | `/billing/contracts/[id]` | —            | UI: Infos completes, echeancier                          |
| 11.2.5 | Liste factures        | `/billing/invoices`       | —            | UI: Factures avec filtres (payee, en attente, en retard) |
| 11.2.6 | Templates             | `/billing/templates`      | —            | UI: Templates de contrats/factures                       |
| 11.2.7 | Marquer facture payee | Changer statut            | —            | UI: Badge "Payee". DB: update                            |

### 11.3 Equipe CSM (`/admin/csm`)

**Role concerne :** admin

| #      | Scenario         | Happy path                    | Cas d'erreur | Assertions                                   |
| ------ | ---------------- | ----------------------------- | ------------ | -------------------------------------------- |
| 11.3.1 | Vue equipe       | Ouvrir csm                    | —            | UI: Liste coaches/setters/closers avec stats |
| 11.3.2 | Assigner client  | Assigner un client a un coach | —            | DB: `client_assignments` mis a jour          |
| 11.3.3 | Stats par membre | Cliquer sur un membre         | —            | UI: KPIs individuels                         |

### 11.4 Onboarding management (`/admin/onboarding`)

**Role concerne :** admin

| #      | Scenario          | Happy path                               | Cas d'erreur | Assertions                                                        |
| ------ | ----------------- | ---------------------------------------- | ------------ | ----------------------------------------------------------------- |
| 11.4.1 | Liste onboardings | Ouvrir onboarding                        | —            | UI: Clients en cours d'onboarding avec progression                |
| 11.4.2 | Detail onboarding | `/onboarding/[clientId]`                 | —            | UI: Etapes completees/restantes                                   |
| 11.4.3 | Forcer completion | Marquer onboarding complete manuellement | —            | DB: `onboarding_completed = true`. Client redirige vers dashboard |

### 11.5 Analytics (`/admin/analytics`)

**Role concerne :** admin

| #      | Scenario       | Happy path            | Cas d'erreur | Assertions                               |
| ------ | -------------- | --------------------- | ------------ | ---------------------------------------- |
| 11.5.1 | Page analytics | Ouvrir analytics      | —            | UI: Graphiques Recharts, KPIs, tendances |
| 11.5.2 | Filtre periode | Changer date range    | —            | UI: Donnees mises a jour                 |
| 11.5.3 | Export donnees | Exporter en CSV       | —            | UI: Fichier telecharge                   |
| 11.5.4 | Pas de donnees | Nouvelle installation | —            | UI: Empty states, pas de crash           |

### 11.6 Invitations (`/admin/invitations`)

**Role concerne :** admin

| #      | Scenario            | Happy path                        | Cas d'erreur           | Assertions                                                           |
| ------ | ------------------- | --------------------------------- | ---------------------- | -------------------------------------------------------------------- |
| 11.6.1 | Creer invitation    | Saisir email + role, envoyer      | —                      | UI: Invitation envoyee. DB: insert `invitations`. Email envoye       |
| 11.6.2 | Email invalide      | —                                 | Format email incorrect | UI: Validation erreur                                                |
| 11.6.3 | Email deja invite   | —                                 | Re-inviter meme email  | UI: Warning "Deja invite"                                            |
| 11.6.4 | Revoquer invitation | Annuler une invitation en attente | —                      | UI: Invitation supprimee. DB: delete/revoke                          |
| 11.6.5 | Liste invitations   | —                                 | —                      | UI: Tableau avec email, role, statut (en attente, acceptee, expiree) |

### 11.7 Ressources (`/admin/resources`)

**Roles concernes :** admin (gestion), tous (consultation)

| #      | Scenario                  | Happy path                       | Cas d'erreur | Assertions                           |
| ------ | ------------------------- | -------------------------------- | ------------ | ------------------------------------ |
| 11.7.1 | Liste ressources          | Ouvrir resources                 | —            | UI: Fichiers/liens avec categories   |
| 11.7.2 | Ajouter ressource (admin) | Uploader fichier ou ajouter lien | —            | DB: insert. Storage: fichier uploade |
| 11.7.3 | Telecharger ressource     | Cliquer download                 | —            | UI: Fichier telecharge               |
| 11.7.4 | Supprimer ressource       | Admin supprime                   | —            | UI: Ressource retiree. DB: delete    |

### 11.8 Recompenses et Badges (`/admin/rewards`, `/admin/badges`)

**Role concerne :** admin

| #      | Scenario                     | Happy path                        | Cas d'erreur | Assertions                                            |
| ------ | ---------------------------- | --------------------------------- | ------------ | ----------------------------------------------------- |
| 11.8.1 | Liste recompenses            | Ouvrir rewards                    | —            | UI: Recompenses configurables                         |
| 11.8.2 | Creer recompense             | Ajouter nom, description, cout XP | —            | DB: insert. UI: recompense dans la liste              |
| 11.8.3 | Gestion badges               | Ouvrir badges                     | —            | UI: Liste badges avec criteres d'obtention            |
| 11.8.4 | Creer badge                  | Definir badge + conditions        | —            | DB: insert badge                                      |
| 11.8.5 | Attribuer badge manuellement | Donner badge a un client          | —            | DB: attribution. UI: badge apparait sur profil client |

### 11.9 Moderation (`/admin/moderation`)

**Role concerne :** admin

| #      | Scenario            | Happy path                       | Cas d'erreur | Assertions                                  |
| ------ | ------------------- | -------------------------------- | ------------ | ------------------------------------------- |
| 11.9.1 | Contenu signale     | Voir posts/commentaires signales | —            | UI: Liste avec contenu + raison signalement |
| 11.9.2 | Supprimer contenu   | Supprimer un post signale        | —            | UI: Post retire. DB: delete                 |
| 11.9.3 | Ignorer signalement | Marquer comme OK                 | —            | UI: Signalement retire                      |

### 11.10 Audit (`/admin/audit`, `/admin/audit-log`)

**Role concerne :** admin

| #       | Scenario              | Happy path                | Cas d'erreur | Assertions                                            |
| ------- | --------------------- | ------------------------- | ------------ | ----------------------------------------------------- |
| 11.10.1 | Journal d'audit       | Ouvrir audit-log          | —            | UI: Actions enregistrees avec timestamp, user, action |
| 11.10.2 | Filtrer par user      | Filtrer actions d'un user | —            | UI: Seules ses actions affichees                      |
| 11.10.3 | Filtrer par date      | Selectionner range        | —            | UI: Actions dans la periode                           |
| 11.10.4 | Page audit principale | Ouvrir audit              | —            | UI: Vue synthetique securite/conformite               |

### 11.11 Upsell (`/admin/upsell`)

**Role concerne :** admin

| #       | Scenario            | Happy path          | Cas d'erreur | Assertions                                   |
| ------- | ------------------- | ------------------- | ------------ | -------------------------------------------- |
| 11.11.1 | Vue upsell          | Ouvrir upsell       | —            | UI: Opportunites d'upsell, clients eligibles |
| 11.11.2 | Creer offre upsell  | Definir offre       | —            | DB: insert offre                             |
| 11.11.3 | Envoyer proposition | Envoyer a un client | —            | UI: Notification/email client                |

### 11.12 FAQ / Base IA (`/admin/faq`)

**Roles concernes :** admin, coach

| #       | Scenario         | Happy path           | Cas d'erreur | Assertions                        |
| ------- | ---------------- | -------------------- | ------------ | --------------------------------- |
| 11.12.1 | Liste FAQ        | Ouvrir faq           | —            | UI: Questions/reponses organisees |
| 11.12.2 | Ajouter question | Creer Q&A            | —            | DB: insert. UI: FAQ mise a jour   |
| 11.12.3 | Editer reponse   | Modifier une reponse | —            | DB: update                        |
| 11.12.4 | Supprimer FAQ    | Retirer une entree   | —            | DB: delete                        |

### 11.13 Knowledge Base

**Roles concernes :** admin, coach, client

| #       | Scenario            | Happy path                 | Cas d'erreur | Assertions                         |
| ------- | ------------------- | -------------------------- | ------------ | ---------------------------------- |
| 11.13.1 | Liste pages KB      | Ouvrir knowledge-base      | —            | UI: Pages organisees par categorie |
| 11.13.2 | Voir page           | `/knowledge-base/[pageId]` | —            | UI: Contenu markdown/rich text     |
| 11.13.3 | Creer page (admin)  | Ajouter une nouvelle page  | —            | DB: insert. UI: page creee         |
| 11.13.4 | Editer page (admin) | Modifier contenu           | —            | DB: update                         |
| 11.13.5 | Recherche KB        | Chercher un terme          | —            | UI: Resultats pertinents           |

### 11.14 Assistant IA

**Roles concernes :** admin, coach, client

| #       | Scenario                 | Happy path                   | Cas d'erreur         | Assertions                                           |
| ------- | ------------------------ | ---------------------------- | -------------------- | ---------------------------------------------------- |
| 11.14.1 | Ouvrir chat IA           | Aller sur `/ai`              | —                    | UI: Interface chat visible                           |
| 11.14.2 | Poser une question       | Taper question, envoyer      | —                    | UI: Reponse IA generee. API: appel a l'endpoint IA   |
| 11.14.3 | Question vide            | —                            | Envoyer message vide | UI: Bloque                                           |
| 11.14.4 | Rate limit IA            | 20+ requetes rapides         | —                    | UI: Erreur 429. Headers: rate limit IA (preset "ai") |
| 11.14.5 | Historique conversations | Voir les echanges precedents | —                    | UI: Historique charge                                |

### 11.15 Contenu (`/admin/content`, `/coach/content`)

**Roles concernes :** admin, coach

| #       | Scenario              | Happy path          | Cas d'erreur | Assertions                       |
| ------- | --------------------- | ------------------- | ------------ | -------------------------------- |
| 11.15.1 | Voir contenu          | Ouvrir content      | —            | UI: Posts sociaux, planification |
| 11.15.2 | Creer contenu         | Nouveau post        | —            | DB: insert `social_content`      |
| 11.15.3 | Planifier publication | Definir date future | —            | DB: scheduled_at                 |

### 11.16 Settings

**Roles concernes :** tous

| #       | Scenario               | Happy path           | Cas d'erreur    | Assertions                              |
| ------- | ---------------------- | -------------------- | --------------- | --------------------------------------- |
| 11.16.1 | Modifier profil        | Changer nom, avatar  | —               | UI: Toast succes. DB: update `profiles` |
| 11.16.2 | Changer mot de passe   | Ancien + nouveau mdp | —               | UI: Confirmation. DB: hash mis a jour   |
| 11.16.3 | Mot de passe incorrect | —                    | Ancien mdp faux | UI: Erreur                              |

---

## 12. Edge cases

| #     | Scenario                    | Actions                                          | Assertions                                                        |
| ----- | --------------------------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| 12.1  | Double submit formulaire    | Cliquer 2x rapidement sur "Soumettre"            | 1 seule insertion en DB. Bouton disabled apres 1er clic           |
| 12.2  | Refresh mid-action          | F5 pendant une creation de lead                  | Formulaire vide, pas de donnee fantome en DB                      |
| 12.3  | Back navigation             | Soumettre form, cliquer "Retour"                 | Pas de re-soumission. Page precedente charge proprement           |
| 12.4  | Empty states                | Ouvrir chaque page sans donnees                  | Chaque page affiche un message/illustration vide, pas de crash JS |
| 12.5  | Inputs tres longs           | Saisir 10 000 caracteres dans un champ texte     | Sauvegarde OK ou troncature avec message. Pas de crash            |
| 12.6  | Caracteres speciaux         | Saisir `<script>alert(1)</script>` dans un champ | XSS bloque. Texte affiche comme texte brut                        |
| 12.7  | Emojis dans les champs      | Saisir emojis dans nom, messages                 | Sauvegarde et affichage corrects (UTF-8)                          |
| 12.8  | Connexion lente             | Throttle reseau a 3G                             | Loaders/skeletons visibles. Pas de timeout premature              |
| 12.9  | Perte de connexion          | Couper le wifi mid-session                       | Toast erreur "Connexion perdue". Pas de perte de donnees          |
| 12.10 | Token JWT expire mid-action | JWT expire pendant edition                       | Refresh silencieux ou redirect login avec message                 |
| 12.11 | URL avec ID inexistant      | `/admin/clients/uuid-bidon`                      | Page 404 ou message "Introuvable". Pas de crash                   |
| 12.12 | Concurrent edit             | 2 admins editent le meme lead                    | Le dernier save gagne ou conflit detecte                          |
| 12.13 | Upload fichier trop gros    | Uploader 100 MB                                  | Erreur "Fichier trop volumineux" avec taille max                  |
| 12.14 | Upload format interdit      | Uploader un .exe                                 | Erreur "Format non supporte"                                      |
| 12.15 | Session multi-onglet        | Actions dans 2 onglets                           | Coherence des donnees, pas de conflit de session                  |
| 12.16 | Navigation clavier          | Tab + Enter sur tous les formulaires             | Focus visible, soumission clavier fonctionne                      |
| 12.17 | PWA offline                 | Ouvrir l'app en mode offline (PWA)               | Pages cachees accessibles, message pour actions serveur           |

---

## 13. Multi-utilisateur

| #    | Scenario                       | Setup                                 | Actions                                 | Assertions                                                         |
| ---- | ------------------------------ | ------------------------------------- | --------------------------------------- | ------------------------------------------------------------------ |
| 13.1 | Messaging simultane            | 2 users connectes au meme channel     | Les 2 tapent et envoient                | Les 2 voient les messages en temps reel (Supabase subscription)    |
| 13.2 | Notification temps reel        | Admin envoie annonce                  | Client connecte                         | Client voit la notification sans refresh                           |
| 13.3 | Pipeline concurrent            | 2 closers sur le pipeline             | Closer A deplace lead, Closer B refresh | Closer B voit le lead dans la nouvelle colonne                     |
| 13.4 | Edition lead concurrent        | Coach A et Admin editent le meme lead | Les 2 sauvegardent                      | Dernier write gagne. Pas de corruption. Donnees coherentes         |
| 13.5 | Reservation creneau concurrent | 2 clients reservent le meme creneau   | Clic simultane                          | 1 seul obtient le creneau. L'autre recoit erreur "Plus disponible" |
| 13.6 | Data isolation client          | Client A connecte                     | Tente d'acceder aux donnees de Client B | RLS bloque. API retourne vide ou 403. Pas de leak                  |
| 13.7 | Data isolation coach           | Coach A connecte                      | Tente de voir les clients du Coach B    | RLS filtre. Seuls ses clients assignes visibles                    |
| 13.8 | Feed multi-user                | 3 users connectes au feed             | User A poste                            | Users B et C voient le post (si real-time) ou au refresh           |

---

## 14. Permissions cross-role

### 14.1 Matrice d'acces (basee sur `permissions.ts`)

Pour chaque module, verifier que seuls les roles autorises y ont acces. Les roles non listes doivent recevoir un refus (redirect ou 403).

| Module              | admin | coach | client | setter | closer |
| ------------------- | :---: | :---: | :----: | :----: | :----: |
| dashboard           |  OK   |  OK   |   OK   |   OK   |   OK   |
| messaging           |  OK   |  OK   |   OK   |   OK   |   OK   |
| formations / school |  OK   |  OK   |   OK   |  DENY  |  DENY  |
| eleves / clients    |  OK   |  OK   |  DENY  |  DENY  |  DENY  |
| pipeline            |  OK   | DENY  |  DENY  |   OK   |   OK   |
| calendrier          |  OK   |  OK   |  DENY  |  DENY  |  DENY  |
| activite            |  OK   | DENY  |  DENY  |   OK   |   OK   |
| finances            |  OK   | DENY  |  DENY  |  DENY  |  DENY  |
| users               |  OK   | DENY  |  DENY  |  DENY  |  DENY  |
| notifications       |  OK   |  OK   |   OK   |   OK   |   OK   |
| settings            |  OK   |  OK   |   OK   |   OK   |   OK   |
| analytics           |  OK   | DENY  |  DENY  |  DENY  |  DENY  |
| closer-calls        |  OK   | DENY  |  DENY  |  DENY  |   OK   |
| social-content      |  OK   |  OK   |  DENY  |  DENY  |  DENY  |
| instagram           |  OK   |  OK   |  DENY  |  DENY  |  DENY  |
| rituals             |  OK   |  OK   |   OK   |  DENY  |  DENY  |
| journal             |  OK   |  OK   |   OK   |  DENY  |  DENY  |
| gamification        |  OK   |  OK   |   OK   |  DENY  |  DENY  |
| forms               |  OK   |  OK   |  DENY  |  DENY  |  DENY  |
| coaching            |  OK   |  OK   |  DENY  |  DENY  |  DENY  |
| assistant / ai      |  OK   |  OK   |   OK   |  DENY  |  DENY  |
| feed                |  OK   |  OK   |   OK   |  DENY  |  DENY  |
| contracts           |  OK   | DENY  |  DENY  |   OK   |   OK   |
| documentation       |  OK   |  OK   |   OK   |  DENY  |  DENY  |
| billing             |  OK   | DENY  |  DENY  |  DENY  |  DENY  |
| invitations         |  OK   | DENY  |  DENY  |  DENY  |  DENY  |
| resources           |  OK   |  OK   |   OK   |   OK   |   OK   |
| community           |  OK   |  OK   |   OK   |  DENY  |  DENY  |
| hall-of-fame        |  OK   |  OK   |   OK   |  DENY  |  DENY  |
| audit               |  OK   | DENY  |  DENY  |  DENY  |  DENY  |
| faq                 |  OK   |  OK   |  DENY  |  DENY  |  DENY  |
| upsell              |  OK   | DENY  |  DENY  |  DENY  |  DENY  |
| roadmap             |  OK   |  OK   |   OK   |  DENY  |  DENY  |

### 14.2 Tests d'acces par URL directe

| #       | Scenario                                      | Actions                 | Assertions                               |
| ------- | --------------------------------------------- | ----------------------- | ---------------------------------------- |
| 14.2.1  | Client → `/admin/dashboard`                   | Taper l'URL directement | Redirect `/client/dashboard` ou page 403 |
| 14.2.2  | Client → `/admin/users`                       | Taper l'URL             | Redirect ou 403                          |
| 14.2.3  | Client → `/admin/billing`                     | Taper l'URL             | Redirect ou 403                          |
| 14.2.4  | Client → `/admin/analytics`                   | Taper l'URL             | Redirect ou 403                          |
| 14.2.5  | Coach → `/admin/billing`                      | Taper l'URL             | Redirect ou 403                          |
| 14.2.6  | Coach → `/admin/users`                        | Taper l'URL             | Redirect ou 403                          |
| 14.2.7  | Coach → `/sales/pipeline`                     | Taper l'URL             | Redirect ou 403                          |
| 14.2.8  | Setter → `/admin/analytics`                   | Taper l'URL             | Redirect ou 403                          |
| 14.2.9  | Setter → `/client/checkin`                    | Taper l'URL             | Redirect ou 403                          |
| 14.2.10 | Setter → `/coach/school/builder`              | Taper l'URL             | Redirect ou 403                          |
| 14.2.11 | Closer → `/admin/billing`                     | Taper l'URL             | Redirect ou 403                          |
| 14.2.12 | Closer → `/client/journal`                    | Taper l'URL             | Redirect ou 403                          |
| 14.2.13 | Non connecte → n'importe quelle page protegee | Taper l'URL             | Redirect `/login`                        |

### 14.3 Tests RLS (Row Level Security)

| #      | Scenario                           | Actions                                       | Assertions                                        |
| ------ | ---------------------------------- | --------------------------------------------- | ------------------------------------------------- |
| 14.3.1 | Client voit uniquement ses donnees | Query `journal_entries` via API               | RLS filtre par `user_id = auth.uid()`             |
| 14.3.2 | Coach voit ses clients assignes    | Query `clients` via API                       | RLS filtre par `coach_id` ou `client_assignments` |
| 14.3.3 | Setter voit son pipeline           | Query `leads` via API                         | RLS filtre par `setter_id`                        |
| 14.3.4 | Closer voit ses appels             | Query `closer_calls` via API                  | RLS filtre par `closer_id`                        |
| 14.3.5 | Admin voit tout                    | Query n'importe quelle table                  | RLS autorise pour role admin                      |
| 14.3.6 | Insert non autorise                | Client tente insert dans `forms`              | RLS bloque. Erreur 403                            |
| 14.3.7 | Delete non autorise                | Coach tente delete sur `financial_entries`    | RLS bloque                                        |
| 14.3.8 | Update non autorise                | Setter tente update sur `profiles` d'un autre | RLS bloque                                        |

### 14.4 Tests API rate limiting

| #      | Scenario                | Actions                        | Assertions                                                                         |
| ------ | ----------------------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| 14.4.1 | Rate limit API standard | 100+ requetes `/api/` en 60s   | Status 429 apres seuil. Header `Retry-After` present                               |
| 14.4.2 | Rate limit API IA       | 20+ requetes `/api/ai/` en 60s | Status 429 avec seuil plus bas (preset "ai")                                       |
| 14.4.3 | Rate limit API v1       | Requetes rapides `/api/v1/`    | Status 429 apres seuil (preset "v1")                                               |
| 14.4.4 | Headers rate limit      | Requete standard               | Headers `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` presents |

---

## Onboarding (`/onboarding`)

**Roles concernes :** tous (premiere connexion)

| #    | Scenario                     | Happy path                                 | Cas d'erreur | Assertions                                                                                 |
| ---- | ---------------------------- | ------------------------------------------ | ------------ | ------------------------------------------------------------------------------------------ |
| O.1  | Etape 1/6                    | Remplir infos de base                      | —            | UI: Progression 1/6, passage a etape 2                                                     |
| O.2  | Etape 2/6                    | Remplir etape suivante                     | —            | UI: Progression 2/6                                                                        |
| O.3  | Etape 3/6                    | Idem                                       | —            | UI: Progression 3/6                                                                        |
| O.4  | Etape 4/6                    | Idem                                       | —            | UI: Progression 4/6                                                                        |
| O.5  | Etape 5/6                    | Idem                                       | —            | UI: Progression 5/6                                                                        |
| O.6  | Etape 6/6 — Finalisation     | Completer derniere etape                   | —            | UI: Redirect vers dashboard role. DB: `onboarding_completed = true`                        |
| O.7  | Skip etape                   | Tenter de passer une etape obligatoire     | —            | UI: Validation bloque, champs requis                                                       |
| O.8  | Retour arriere               | Revenir a une etape precedente             | —            | UI: Donnees conservees                                                                     |
| O.9  | Quitter mid-onboarding       | Fermer le navigateur a etape 3             | —            | UI: Au prochain login, reprend a l'etape ou il s'est arrete (si persistence) ou recommence |
| O.10 | Acces direct post-onboarding | Taper `/onboarding` apres l'avoir complete | —            | UI: Redirect vers dashboard                                                                |

---

## Checklist de regression pre-deploy

Avant chaque mise en production, executer les tests suivants a minima :

- [ ] Login/logout pour chaque role (admin, coach, client, setter, closer)
- [ ] Dashboard charge sans erreur pour chaque role
- [ ] Messagerie : envoi + reception temps reel
- [ ] School : acces cours, completion lecon
- [ ] CRM : creation, edition, suppression lead
- [ ] Pipeline : drag & drop
- [ ] Permissions : au moins 5 tests cross-role de la matrice 14.1
- [ ] RLS : query API avec mauvais role → donnees non exposees
- [ ] Rate limiting : au moins 1 test 429
- [ ] Responsive : test mobile sur 3 pages critiques
- [ ] Edge cases : double submit, URL inexistante, empty states
- [ ] Build : `npm run build` passe sans erreur TypeScript
