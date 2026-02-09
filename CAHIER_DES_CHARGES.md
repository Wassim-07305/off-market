# Cahier des charges - Off-Market

## 1. Presentation generale

**Off-Market** est un CRM (Customer Relationship Management) specialise pour les agences de coaching, consulting et vente en ligne. Il centralise la gestion des clients, des leads, des appels de vente, des finances, du contenu social et de l'activite d'equipe dans une seule plateforme.

L'application est une **Single Page Application (SPA)** deployee en mode PWA (Progressive Web App), accessible sur desktop, tablette et mobile.

---

## 2. Stack technique

| Couche | Technologie | Version |
|---|---|---|
| **Framework front** | React (TypeScript) | 19.2 |
| **Build** | Vite | 7.2.4 |
| **Routeur** | React Router DOM | 6.30 |
| **State management** | Zustand (avec persistence localStorage) | 5.0.11 |
| **Data fetching** | TanStack React Query | 5.90.20 |
| **Backend / BDD** | Supabase (PostgreSQL + Auth + RLS) | 2.95.3 |
| **Validation** | Zod | 4.3.6 |
| **Formulaires** | React Hook Form | 7.71 |
| **CSS** | Tailwind CSS (via Vite plugin) | 4.1.18 |
| **Icones** | Lucide React | 0.563.0 |
| **Graphiques** | Recharts | 3.7.0 |
| **Animations** | Framer Motion | 12.34.0 |
| **Tableaux** | TanStack React Table | 8.21.3 |
| **Drag & Drop** | @dnd-kit (core, sortable, utilities) | - |
| **CSV** | PapaParse | 5.5.3 |
| **Notifications toast** | Sonner | 2.0.7 |
| **PWA** | Vite PWA Plugin | 1.2.0 |
| **Dates** | date-fns (locale FR) | - |
| **Deploiement** | Vercel | - |

---

## 3. Architecture du projet

```
src/
├── App.tsx                     # Configuration du routeur principal
├── main.tsx                    # Point d'entree React
├── index.css                   # Styles globaux
│
├── types/
│   ├── database.ts             # Types TypeScript (15 interfaces + Database type)
│   └── forms.ts                # Schemas Zod pour tous les formulaires
│
├── stores/                     # Zustand stores (3 stores)
│   ├── auth-store.ts           # Etat d'authentification
│   ├── ui-store.ts             # Etat UI (sidebar, search, etc.) - persiste
│   └── notification-store.ts   # Etat des notifications
│
├── hooks/                      # Hooks React personnalises (~13 hooks)
│   ├── useAuth.ts              # Authentification + cycle de vie session
│   ├── useRole.ts              # Verification des roles et permissions
│   ├── useClients.ts           # CRUD clients
│   ├── useLeads.ts             # CRUD leads
│   ├── useCallCalendar.ts      # CRUD calendrier d'appels
│   ├── useCloserCalls.ts       # CRUD appels closer
│   ├── useFinances.ts          # CRUD finances + echeanciers
│   ├── useSocialContent.ts     # CRUD contenus sociaux
│   ├── useSetterActivities.ts  # CRUD activites setter
│   ├── useInstagram.ts         # CRUD comptes Instagram + stats
│   ├── useNotifications.ts     # CRUD notifications
│   ├── useDashboardStats.ts    # Stats aggregees du dashboard
│   ├── useUsers.ts             # Gestion utilisateurs
│   └── useClientAssignments.ts # Assignations client-utilisateur
│
├── lib/
│   ├── supabase.ts             # Initialisation client Supabase
│   ├── permissions.ts          # Systeme de permissions par module
│   ├── constants.ts            # Constantes (statuts, couleurs, labels)
│   ├── utils.ts                # Utilitaires (formatage, dates, devises)
│   ├── csv.ts                  # Import/export CSV
│   └── seedDemoData.ts         # Injection de donnees de demonstration
│
├── components/
│   ├── layout/                 # Layout principal (6 composants)
│   │   ├── Layout.tsx          # Wrapper global (sidebar + header + outlet)
│   │   ├── Sidebar.tsx         # Navigation laterale responsive
│   │   ├── Header.tsx          # Barre superieure (search, notifs, profil)
│   │   ├── CommandPalette.tsx   # Palette de commandes (Cmd+K)
│   │   ├── Breadcrumb.tsx      # Fil d'Ariane
│   │   └── GlobalSearch.tsx    # Recherche globale
│   │
│   ├── auth/                   # Composants d'authentification
│   │   ├── RouteGuard.tsx      # Protection des routes (redirect login)
│   │   └── RoleGuard.tsx       # Protection par role (acces refuse)
│   │
│   ├── ui/                     # Design system (21 composants)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── modal.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── checkbox.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── date-picker.tsx
│   │   ├── data-table.tsx
│   │   ├── pagination.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── tooltip.tsx
│   │   ├── tabs.tsx
│   │   ├── empty-state.tsx
│   │   ├── skeleton.tsx
│   │   ├── search-input.tsx
│   │   ├── confirm-dialog.tsx
│   │   ├── inline-edit.tsx
│   │   └── OffMarketLogo.tsx
│   │
│   ├── dashboard/              # 9 composants (stats, charts, KPIs)
│   ├── clients/                # 14 composants (table, detail, onglets)
│   ├── leads/                  # 8 composants (table, formulaire, KPIs)
│   ├── calls/                  # 7 composants (calendrier, liste, KPIs)
│   ├── finances/               # 8 composants (entrees, echeanciers)
│   ├── social/                 # 5 composants (board, pipeline, drag&drop)
│   ├── setter/                 # 5 composants (activite, metriques)
│   ├── instagram/              # 6 composants (comptes, stats posts)
│   ├── notifications/          # 6 composants (panneau, liste)
│   ├── users/                  # 4 composants (table, gestion roles)
│   ├── admin/                  # 3 composants (seed demo, config)
│   └── shared/                 # 5 composants (filtres, badges)
│
├── pages/                      # 15 pages
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── DashboardPage.tsx
│   ├── ClientsPage.tsx
│   ├── ClientDetailPage.tsx
│   ├── LeadsPage.tsx
│   ├── CallCalendarPage.tsx
│   ├── CloserCallsPage.tsx
│   ├── SetterActivityPage.tsx
│   ├── SocialContentPage.tsx
│   ├── FinancesPage.tsx
│   ├── InstagramPage.tsx
│   ├── UsersPage.tsx
│   └── DocumentationPage.tsx
│
└── styles/
    └── animations.css

supabase/
└── migrations/
    ├── 001_initial_schema.sql   # Schema initial (tables, triggers, fonctions)
    ├── 002_rls_policies.sql     # Politiques Row Level Security
    ├── 003_indexes.sql          # 24 index de performance
    ├── 004_add_recurrence.sql   # Ajout recurrence aux finances
    ├── 005_seed_rpc.sql         # Fonctions RPC (seed, search, stats)
    └── 006_default_role_admin.sql # Role par defaut = admin
```

---

## 4. Authentification et autorisation

### 4.1 Authentification

- **Supabase Auth** avec email + mot de passe
- Sessions JWT gerees automatiquement par Supabase
- Creation automatique du profil et du role a l'inscription (trigger `on_auth_user_created`)
- Reinitialisation du mot de passe par email
- Ecran de connexion, inscription et mot de passe oublie

### 4.2 Systeme de roles

6 roles definis :

| Role | Description |
|---|---|
| **admin** | Acces complet a tous les modules et gestion utilisateurs |
| **manager** | Vue d'ensemble de l'equipe, gestion clients et leads |
| **coach** | Suivi des clients assignes et progression |
| **setter** | Gestion de la prospection et des messages envoyes |
| **closer** | Gestion des appels de closing et conversions |
| **monteur** | Gestion des contenus sociaux et pipeline de creation |

### 4.3 Matrice des permissions par module

| Module | admin | manager | coach | setter | closer | monteur |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Dashboard | x | x | x | x | x | x |
| Clients | x | x | x | x | x | x |
| Leads | x | x | x | x | x | |
| Calendrier | x | x | x | x | x | |
| CA & Calls | x | x | | | x | |
| Activite Setter | x | x | | x | | |
| Contenus Social | x | x | x | | | x |
| Finances | x | x | | | | |
| Instagram | x | x | x | | | x |
| Utilisateurs | x | | | | | |
| Documentation | x | x | x | x | x | x |

### 4.4 Securite base de donnees

- **Row Level Security (RLS)** active sur toutes les tables
- Politiques basees sur les fonctions : `has_role()`, `is_assigned_to_client()`, `is_coached_by()`
- Les admins voient toutes les donnees
- Les autres roles ne voient que les donnees liees a leurs clients assignes ou a leur hierarchie de coaching

### 4.5 Hierarchie de coaching

- Chaque utilisateur peut avoir un `coach_id` reliant son profil a un coach
- Les coaches peuvent voir l'activite, les leads et les appels de leurs membres d'equipe
- Les politiques RLS appliquent cette visibilite

---

## 5. Schema de base de donnees

### 5.1 Tables principales (15 tables)

#### `profiles`
Profils utilisateurs avec hierarchie de coaching.

| Colonne | Type | Description |
|---|---|---|
| id | UUID (PK) | ID Supabase Auth |
| email | text | Email de l'utilisateur |
| full_name | text | Nom complet |
| avatar_url | text | URL de l'avatar |
| coach_id | UUID (FK -> profiles) | Coach assigne |
| phone | text | Telephone |
| created_at | timestamptz | Date de creation |
| updated_at | timestamptz | Date de mise a jour |

#### `user_roles`
Attribution des roles (1 role par utilisateur).

| Colonne | Type | Description |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK -> auth.users, UNIQUE) | |
| role | app_role | admin, manager, coach, setter, closer, monteur |
| created_at | timestamptz | |

#### `clients`
Fiche client principale.

| Colonne | Type | Description |
|---|---|---|
| id | UUID (PK) | |
| name | text | Nom du client |
| email | text | Email |
| phone | text | Telephone |
| notes | text | Notes |
| status | text | actif, inactif, archive |
| created_by | UUID (FK -> auth.users) | Createur |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `client_assignments`
Assignations utilisateur-client avec role.

| Colonne | Type | Description |
|---|---|---|
| id | UUID (PK) | |
| client_id | UUID (FK -> clients) | |
| user_id | UUID (FK -> auth.users) | |
| role | app_role | Role dans ce client |
| assigned_at | timestamptz | |

Contrainte : UNIQUE(client_id, user_id)

#### `leads`
Suivi des prospects.

| Colonne | Type | Description |
|---|---|---|
| id | UUID (PK) | |
| client_id | UUID (FK -> clients) | Client rattache |
| assigned_to | UUID (FK -> auth.users) | Setter assigne |
| name | text | Nom du lead |
| email | text | Email |
| phone | text | Telephone |
| source | text | instagram, linkedin, tiktok, referral, ads, autre |
| status | text | a_relancer, booke, no_show, pas_interesse, en_cours |
| client_status | text | contacte, qualifie, propose, close, perdu |
| ca_contracte | numeric | CA contracte |
| ca_collecte | numeric | CA collecte |
| commission_setter | numeric | Commission setter |
| commission_closer | numeric | Commission closer |
| notes | text | Notes |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `call_calendar`
Appels planifies.

| Colonne | Type | Description |
|---|---|---|
| id | UUID (PK) | |
| client_id | UUID (FK -> clients) | |
| lead_id | UUID (FK -> leads) | |
| assigned_to | UUID (FK -> auth.users) | Responsable |
| date | date | Date de l'appel |
| time | time | Heure |
| type | text | manuel, iclosed, calendly, autre |
| status | text | planifie, realise, no_show, annule, reporte |
| link | text | Lien visio |
| notes | text | Notes |
| created_at | timestamptz | |

#### `closer_calls`
Resultats des appels de closing.

| Colonne | Type | Description |
|---|---|---|
| id | UUID (PK) | |
| client_id | UUID (FK -> clients) | |
| lead_id | UUID (FK -> leads) | |
| closer_id | UUID (FK -> auth.users) | Closer |
| date | date | Date |
| status | text | close, non_close |
| revenue | numeric | Revenu genere |
| nombre_paiements | integer | Nombre d'echeances |
| link | text | Lien de l'appel |
| debrief | text | Compte-rendu |
| notes | text | Notes |
| created_at | timestamptz | |

#### `financial_entries`
Entrees financieres (CA, charges, recurrent, prestataires).

| Colonne | Type | Description |
|---|---|---|
| id | UUID (PK) | |
| client_id | UUID (FK -> clients) | Client rattache |
| type | text | ca, recurrent, charge, prestataire |
| label | text | Libelle |
| amount | numeric | Montant |
| prestataire | text | Nom du prestataire |
| is_paid | boolean | Paye ou non |
| date | date | Date |
| recurrence | text | mensuel, trimestriel, annuel |
| created_at | timestamptz | |

#### `payment_schedules`
Echeanciers de paiement.

| Colonne | Type | Description |
|---|---|---|
| id | UUID (PK) | |
| financial_entry_id | UUID (FK -> financial_entries) | |
| client_id | UUID (FK -> clients) | |
| amount | numeric | Montant de l'echeance |
| due_date | date | Date d'echeance |
| is_paid | boolean | Paye ou non |
| paid_at | timestamptz | Date de paiement |
| created_at | timestamptz | |

#### `social_content`
Pipeline de creation de contenu social.

| Colonne | Type | Description |
|---|---|---|
| id | UUID (PK) | |
| client_id | UUID (FK -> clients) | |
| title | text | Titre du contenu |
| status | text | a_tourner, idee, en_cours, publie, reporte |
| format | text | reel, story, carrousel, post |
| video_type | text | react, b-roll, video_virale, preuve_sociale, facecam, talking_head, vlog |
| link | text | Lien vers la publication |
| is_validated | boolean | Valide par le client |
| text_content | text | Description/script |
| planned_date | date | Date prevue |
| sort_order | integer | Ordre d'affichage (drag & drop) |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `setter_activities`
Suivi quotidien de l'activite des setters.

| Colonne | Type | Description |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK -> auth.users) | Setter |
| client_id | UUID (FK -> clients) | Client |
| date | date | Date |
| messages_sent | integer | Nombre de messages envoyes |
| notes | text | Notes |
| created_at | timestamptz | |

Contrainte : UNIQUE(user_id, client_id, date)

#### `instagram_accounts`
Comptes Instagram des clients.

| Colonne | Type | Description |
|---|---|---|
| id | UUID (PK) | |
| client_id | UUID (FK -> clients) | |
| username | text | Nom d'utilisateur IG |
| followers | integer | Abonnes |
| following | integer | Abonnements |
| media_count | integer | Nombre de publications |
| last_synced_at | timestamptz | Derniere synchronisation |
| created_at | timestamptz | |

#### `instagram_post_stats`
Statistiques par publication Instagram.

| Colonne | Type | Description |
|---|---|---|
| id | UUID (PK) | |
| account_id | UUID (FK -> instagram_accounts) | |
| post_url | text | URL de la publication |
| likes | integer | |
| comments | integer | |
| shares | integer | |
| saves | integer | |
| reach | integer | Portee |
| impressions | integer | |
| engagement_rate | numeric | Taux d'engagement |
| posted_at | timestamptz | Date de publication |
| created_at | timestamptz | |

#### `notifications`
Systeme de notifications.

| Colonne | Type | Description |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK -> auth.users) | Destinataire |
| type | text | lead_status, new_call, call_closed, general |
| title | text | Titre |
| message | text | Contenu |
| is_read | boolean | Lu ou non |
| metadata | jsonb | Donnees supplementaires |
| created_at | timestamptz | |

#### `rituals`
Rituels recurrents par client.

| Colonne | Type | Description |
|---|---|---|
| id | UUID (PK) | |
| client_id | UUID (FK -> clients) | |
| title | text | Titre |
| description | text | Description |
| frequency | text | quotidien, hebdomadaire, mensuel |
| is_active | boolean | Actif ou non |
| created_at | timestamptz | |

### 5.2 Fonctions RPC

| Fonction | Arguments | Retour | Description |
|---|---|---|---|
| `has_role(_role)` | app_role | boolean | Verifie si l'utilisateur a un role specifique |
| `is_assigned_to_client(_client_id)` | UUID | boolean | Verifie l'assignation a un client |
| `is_coached_by(_user_id)` | UUID | boolean | Verifie la relation de coaching |
| `get_dashboard_stats()` | - | JSON | Retourne les KPIs agreges (CA, calls, closing, messages) avec comparaison mensuelle |
| `global_search(search_term)` | text | JSON | Recherche full-text sur clients, leads et contenus sociaux |

### 5.3 Triggers

| Trigger | Table | Description |
|---|---|---|
| `on_auth_user_created` | auth.users | Cree automatiquement le profil et assigne le role par defaut (admin) |
| `notify_lead_status_change` | leads | Cree une notification quand le statut d'un lead change |
| `notify_new_call_created` | call_calendar | Cree une notification pour un nouvel appel planifie |
| `notify_call_closed` | closer_calls | Cree une notification quand un appel est close avec revenu |
| `update_*_updated_at` | Plusieurs | Met a jour automatiquement les timestamps de modification |

### 5.4 Index

24 index sur les cles etrangeres, les roles, les statuts et les colonnes de date pour optimiser les requetes RLS et de filtrage.

---

## 6. Pages et fonctionnalites

### 6.1 Authentification

#### Page de connexion (`/login`)
- Formulaire email + mot de passe
- Validation Zod (email valide, mot de passe min 6 caracteres)
- Toggle visibilite mot de passe
- Lien vers inscription et mot de passe oublie
- Redirection vers `/` apres connexion reussie
- Messages d'erreur via toast

#### Page d'inscription (`/register`)
- Formulaire : nom complet, email, mot de passe, confirmation
- Validation avec correspondance des mots de passe
- Creation automatique du profil et role via trigger

#### Mot de passe oublie (`/forgot-password`)
- Formulaire email
- Envoi de l'email de reinitialisation via Supabase

---

### 6.2 Dashboard (`/`)

**Acces :** Tous les roles

Le tableau de bord affiche une vue d'ensemble des performances.

**Composants :**
- **GreetingHeader** : Message d'accueil personnalise + selecteur de periode
- **4 cartes KPI** :
  - CA Total (vert) - chiffre d'affaires total
  - Appels (bleu) - nombre d'appels realises
  - Taux de closing (rouge) - pourcentage de conversion
  - Messages (ambre) - nombre de messages setter
- **Tendances** : Comparaison mois en cours vs mois precedent en pourcentage
- **Alerte** : Si le taux de closing < 30%
- **RevenueChart** : Graphique de l'evolution du CA (Recharts)
- **LeadsChart** : Distribution des statuts de leads
- **SetterActivityChart** : Evolution des messages envoyes
- **UrgentActions** : Actions prioritaires a traiter
- **MiniLeaderboard** : Classement des performeurs
- **RecentActivity** : Fil d'activite recente
- **RecentLeads** : Derniers leads ajoutes

---

### 6.3 Gestion des clients (`/clients`)

**Acces :** Tous les roles sauf monteur

**Liste des clients :**
- Tableau avec tri et filtrage
- Colonnes : nom, email, telephone, statut, date de creation
- Badges de statut : actif (vert), inactif (gris), archive (rouge)
- Actions : voir detail, modifier, supprimer
- Bouton creation d'un nouveau client

**Detail client (`/clients/:id`) :**

Page a onglets affichant toutes les informations d'un client :

| Onglet | Contenu |
|---|---|
| Vue d'ensemble | Informations generales, score de sante, timeline activite |
| Equipe | Membres assignes avec leurs roles |
| Leads | Leads rattaches au client |
| Closer Calls | Appels de closing lies au client |
| Calendrier | Appels planifies pour ce client |
| Finances | Entrees financieres et echeanciers |
| Setter | Activite quotidienne des setters |
| Social | Contenus sociaux du client |
| Instagram | Comptes IG et statistiques |

**Fonctionnalites :**
- Formulaire de creation/edition via modal (React Hook Form + Zod)
- Dialogue de confirmation avant suppression
- Assignation de membres d'equipe avec roles

---

### 6.4 Suivi des leads (`/leads`)

**Acces :** admin, manager, coach, setter, closer

**Fonctionnalites :**
- Tableau avec edition inline des statuts
- Double pipeline de statuts :
  - **Statut lead** : a relancer, booke, no show, pas interesse, en cours
  - **Statut client** : contacte, qualifie, propose, close, perdu
- Sources d'acquisition : Instagram, LinkedIn, TikTok, Referral, Ads, Autre
- Suivi financier par lead : CA contracte, CA collecte, commissions setter/closer
- Filtres par client, statut, source, setter assigne
- Formulaire de creation/edition complet

---

### 6.5 Calendrier d'appels (`/call-calendar`)

**Acces :** admin, manager, coach, setter, closer

**Fonctionnalites :**
- Vue semaine (WeekView) et vue liste (ListView)
- Types d'appels : manuel, iClosed, Calendly, autre
- Statuts : planifie, realise, no show, annule, reporte
- KPIs : nombre d'appels par statut
- Lien vers la visioconference
- Attribution a un responsable
- Rattachement a un client et un lead

---

### 6.6 CA & Calls Closer (`/closer-calls`)

**Acces :** admin, manager, closer

**Fonctionnalites :**
- Tableau des appels de closing
- KPIs : CA genere, taux de closing, nombre d'appels
- Statuts : close, non close
- Suivi du revenu par appel
- Nombre de paiements prevus
- Debrief detaille de chaque appel
- Rattachement a un client et un lead

---

### 6.7 Activite Setter (`/setter-activity`)

**Acces :** admin, manager, setter

**Fonctionnalites :**
- Dashboard d'activite quotidienne
- Suivi du nombre de messages envoyes par jour, par client, par setter
- Notes par session
- Metriques de performance : total messages, moyenne/jour
- Comparaison entre setters (pour admin/manager)
- Contrainte d'unicite : 1 entree par setter/client/jour

---

### 6.8 Contenus Social (`/social-content`)

**Acces :** admin, manager, coach, monteur

**Fonctionnalites :**
- Board/pipeline de gestion de contenu
- Statuts du pipeline : idee -> a tourner -> en cours -> publie (+ reporte)
- Formats : reel, story, carrousel, post
- Types de video : react, b-roll, video virale, preuve sociale, facecam, talking head, vlog
- Drag & drop pour reordonner (via @dnd-kit)
- Validation client (checkbox)
- Date de publication prevue
- Script/description du contenu
- Lien vers la publication

---

### 6.9 Finances (`/finances`)

**Acces :** admin, manager

**Fonctionnalites :**
- 4 types d'entrees financieres :
  - **CA** : Chiffre d'affaires ponctuel
  - **Recurrent** : Revenus recurrents (mensuel, trimestriel, annuel)
  - **Charge** : Depenses et frais
  - **Prestataire** : Paiements a des prestataires
- Echeanciers de paiement :
  - Decoupage en plusieurs echeances
  - Suivi de l'etat de paiement (paye/en attente)
  - Date d'echeance et date de paiement effectif
- Vue d'ensemble financiere
- Filtrage par type, client, statut de paiement
- Export CSV

---

### 6.10 Instagram (`/instagram`)

**Acces :** admin, manager, coach, monteur

**Fonctionnalites :**
- Gestion des comptes Instagram des clients
- Donnees par compte : username, abonnes, abonnements, publications
- Statistiques par publication :
  - Likes, commentaires, partages, sauvegardes
  - Portee (reach) et impressions
  - Taux d'engagement
  - Date de publication
- Dashboard de performance globale

---

### 6.11 Gestion des utilisateurs (`/users`)

**Acces :** admin uniquement

**Fonctionnalites :**
- Liste des utilisateurs avec roles
- Attribution et modification des roles
- Visualisation des profils (nom, email, telephone, avatar)
- Assignation de coach aux membres d'equipe

---

### 6.12 Documentation (`/documentation`)

**Acces :** Tous les roles

Page d'aide interne avec :
- Guide de prise en main rapide
- Description de chaque module
- Explication des roles et permissions

---

## 7. Composants transversaux

### 7.1 Navigation

**Sidebar :**
- 3 sections : Principal, Operations, Gestion
- Filtrage dynamique selon le role de l'utilisateur
- Mode collapse pour desktop (enregistre dans localStorage)
- Drawer mobile avec backdrop
- Indicateur de route active (barre rouge)
- Tooltips en mode reduit
- Profil utilisateur avec indicateur de presence
- Bouton deconnexion

**Header :**
- Breadcrumb dynamique
- Recherche globale (desktop)
- Badge de notifications non lues
- Menu utilisateur avec dropdown
- Hamburger mobile

**Command Palette (Cmd+K) :**
- Navigation rapide vers tous les modules
- Actions rapides : nouveau lead, nouveau call, nouveau contenu
- Recherche globale en temps reel (RPC Supabase)
- Navigation au clavier (fleches + Enter)

### 7.2 Design system

21 composants UI reutilisables :
- Button (variantes : primary, secondary, ghost, destructive)
- Card
- Modal
- Input, Select, Textarea, Checkbox
- Badge
- Avatar
- DatePicker
- DataTable (avec TanStack React Table)
- Pagination
- DropdownMenu
- Tooltip
- Tabs (TabsList + TabsContent)
- EmptyState
- Skeleton (chargement)
- SearchInput
- ConfirmDialog
- InlineEdit (edition sur place)
- OffMarketLogo

### 7.3 Notifications

- Panneau lateral de notifications
- Types : changement statut lead, nouvel appel, appel close, general
- Badge non lu sur l'icone cloche
- Marquer comme lu / tout marquer comme lu
- Trigger automatique via triggers Supabase (INSERT sur tables)

---

## 8. Gestion d'etat

### 8.1 Stores Zustand (3)

| Store | Persistance | Contenu |
|---|---|---|
| **auth-store** | Non | session, user, profile, role, loading |
| **ui-store** | Oui (localStorage) | sidebarCollapsed, sidebarMobileOpen, searchQuery, commandPaletteOpen, notificationsPanelOpen |
| **notification-store** | Non | notifications[], unreadCount |

### 8.2 React Query (server state)

- Cache avec stale time de 5 minutes
- 1 retry en cas d'erreur
- Pas de refetch au focus de la fenetre
- Invalidation manuelle du cache apres chaque mutation
- Mutations optimistes sur certaines operations
- Pattern standard :
  - `useQuery` pour les lectures
  - `useMutation` pour les ecritures (avec toast success/error)

### 8.3 Formulaires

- React Hook Form pour la gestion d'etat des formulaires
- Zod pour la validation avec messages d'erreur en francais
- Validation a la soumission
- Messages d'erreur par champ

---

## 9. Patterns et conventions

### 9.1 Architecture des donnees

Chaque entite suit le meme pattern :
1. **Type** dans `types/database.ts` (interface TypeScript)
2. **Schema** dans `types/forms.ts` (schema Zod)
3. **Hook** dans `hooks/` (useQuery + useMutation)
4. **Composants** dans `components/[module]/` (Table, FormModal, Detail, KPIs)
5. **Page** dans `pages/` (composition des composants)

### 9.2 Operations CRUD

Chaque hook de donnees fournit :
- `useXxx()` : lecture avec filtres
- `useCreateXxx()` : mutation de creation
- `useUpdateXxx()` : mutation de mise a jour
- `useDeleteXxx()` : mutation de suppression

Toutes les mutations :
- Utilisent `supabase.from(table).insert/update/delete`
- Affichent un toast de succes ou d'erreur
- Invalident le cache React Query concerne

### 9.3 Formatage

- Devises : format EUR avec locale francaise (`Intl.NumberFormat`)
- Dates : `date-fns` avec locale `fr` (mois en toutes lettres)
- Dates relatives : "il y a 2 jours", etc.
- Pourcentages : 1 decimale
- Toute l'interface est en francais

### 9.4 Responsive

- **Mobile** (< 768px) : Sidebar en drawer, layout empile
- **Tablette** (768-1024px) : Sidebar collapsed
- **Desktop** (> 1024px) : Sidebar complete, largeur max 1400px

### 9.5 Animations

- Framer Motion pour les transitions de page (fade + slide)
- AnimatePresence pour la command palette et les modals
- Transitions CSS pour les hovers et changements d'etat

---

## 10. Deploiement et configuration

### 10.1 Variables d'environnement

```
VITE_SUPABASE_URL=<url_supabase>
VITE_SUPABASE_ANON_KEY=<cle_publique_supabase>
```

### 10.2 Scripts

| Commande | Action |
|---|---|
| `npm run dev` | Serveur de developpement Vite |
| `npm run build` | Verification TypeScript + build production |
| `npm run lint` | Linting ESLint |
| `npm run preview` | Preview du build de production |

### 10.3 PWA

- Mode standalone (app-like)
- Auto-update en arriere-plan
- Couleur du theme : `#1a1f36` (bleu fonce)
- Icones SVG : 192x192 et 512x512
- Manifest genere automatiquement par Vite PWA

### 10.4 Deploiement

- Heberge sur **Vercel**
- Configuration dans `vercel.json`
- Build automatique a chaque push

---

## 11. Donnees de demonstration

L'application inclut un systeme de seed de donnees de demonstration (`seedDemoData.ts`) accessible depuis l'interface admin.

**Donnees generees :**
- 5 profils demo (closer, 2 setters, coach, monteur)
- 8 clients avec differents statuts
- 30 leads distribues sur 8 semaines
- 25 appels calendrier (passes et futurs)
- 20 appels closer avec revenus repartis sur 6 mois
- ~120 activites setter (14 jours x 3 setters x 3 clients)
- 15 entrees financieres + 8 echeanciers
- 20 contenus sociaux
- 2 comptes Instagram + 15 stats de posts
- 15 notifications

Le systeme permet aussi de **nettoyer** les donnees demo sans affecter les donnees reelles.

---

## 12. Routes de l'application

### Routes publiques
| Route | Page | Description |
|---|---|---|
| `/login` | LoginPage | Connexion |
| `/register` | RegisterPage | Inscription |
| `/forgot-password` | ForgotPasswordPage | Reinitialisation mot de passe |

### Routes protegees (authentification requise)
| Route | Page | Module | Roles autorises |
|---|---|---|---|
| `/` | DashboardPage | dashboard | Tous |
| `/clients` | ClientsPage | clients | Tous |
| `/clients/:id` | ClientDetailPage | clients | Tous |
| `/leads` | LeadsPage | leads | admin, manager, coach, setter, closer |
| `/call-calendar` | CallCalendarPage | call-calendar | admin, manager, coach, setter, closer |
| `/closer-calls` | CloserCallsPage | closer-calls | admin, manager, closer |
| `/setter-activity` | SetterActivityPage | setter-activity | admin, manager, setter |
| `/social-content` | SocialContentPage | social-content | admin, manager, coach, monteur |
| `/finances` | FinancesPage | finances | admin, manager |
| `/instagram` | InstagramPage | instagram | admin, manager, coach, monteur |
| `/users` | UsersPage | users | admin |
| `/documentation` | DocumentationPage | documentation | Tous |
