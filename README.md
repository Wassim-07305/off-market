# Off-Market

Plateforme de coaching et de gestion business pour freelancers et coachs. Interface en francais.

## Stack technique

- **Frontend** : React 19, TypeScript 5, Next.js 16 (App Router), Tailwind CSS 4
- **Backend** : Supabase (PostgreSQL, Auth, RLS, Storage, Realtime)
- **State** : Zustand (3 stores) + TanStack React Query (server state)
- **UI** : Radix UI, Lucide Icons, Framer Motion, Recharts
- **IA** : Anthropic Claude SDK
- **Deploiement** : Vercel

## Fonctionnalites

### Portails multi-roles

- **Admin** : gestion complete de la plateforme, analytics, facturation, moderation
- **Coach** : suivi des eleves, dashboard avec alertes, check-ins, appels
- **Client** : progression, gamification, check-ins, journal, cours, communaute
- **Sales** : pipeline CRM, contacts, prospection
- **Setter / Closer** : gestion des appels commerciaux

### Modules principaux

- **CRM** : pipeline Kanban 5 colonnes, scoring des leads, historique d'interactions
- **Messaging** : temps reel, threads, reactions, mentions, messages vocaux, pieces jointes, messages programmes
- **LMS (School)** : cours, modules, lecons, quiz, certificats
- **Formulaires** : constructeur drag-and-drop avec logique conditionnelle
- **Gamification** : XP, badges, leaderboard, challenges, streaks
- **Facturation** : contrats avec signature electronique, factures, templates, integration Stripe
- **Check-ins** : suivi hebdomadaire avec humeur, energie, gratitudes, objectifs, heatmap calendrier, streaks
- **Journal** : entrees avec templates (gratitude, reflexion, objectifs, victoires), tags, mood tracking
- **Appels** : calendrier, visio, notes d'appel, enregistrement
- **Notifications** : categories, filtres, actions groupees, archivage
- **Communaute** : feed social, likes, commentaires, moderation
- **IA Coach** : analyse des eleves, detection des risques, generation de contenu

## Demarrage

### Prerequis

- Node.js 18+
- Compte Supabase

### Installation

```bash
npm install
```

### Configuration

Creer un fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
```

### Lancer le serveur de dev

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Commandes

| Commande        | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Serveur de developpement |
| `npm run build` | Build de production      |
| `npm run lint`  | Linting ESLint           |

## Structure du projet

```
src/
  app/
    (auth)/              # Routes d'authentification (login, signup, forgot-password)
    admin/               # Portail admin (~20 routes)
    coach/               # Portail coach (~12 routes)
    client/              # Portail client (~15 routes)
    sales/               # Portail sales (~6 routes)
    _shared-pages/       # Pages partagees entre roles
    api/                 # Routes API (IA, admin, facturation, Stripe)
  components/            # Composants React organises par module
  hooks/                 # 29+ hooks TanStack Query
  stores/                # 3 stores Zustand (UI, form-builder, messaging)
  lib/                   # Utilitaires, clients Supabase, animations, navigation
  types/                 # Types TypeScript
supabase/
  migrations/            # 32 fichiers de migration SQL
```

## Base de donnees

Les migrations Supabase se trouvent dans `supabase/migrations/`. Elles couvrent :

- Schema initial (profiles, channels, messages, courses, etc.)
- Systeme de roles (admin, coach, client, setter, closer, sales)
- Facturation et contrats
- Feed communautaire
- Coaching (check-ins, goals, sessions, alertes)
- Gamification (XP, badges, challenges, streaks)
- Calendrier d'appels et visio
- Messaging avance (threads, reactions, pieces jointes)
- Notifications avec categories
- Pipeline CRM avec interactions

## Deploiement

Deployer sur [Vercel](https://vercel.com) :

```bash
npx vercel
```

Configurer les variables d'environnement dans le dashboard Vercel.
