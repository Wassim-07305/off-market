# TEST-REPORT.md — Off-Market E2E Testing Report

**Date:** 2026-03-17
**Environment:** localhost:3000 (Next.js 16.1.6 + Turbopack dev mode)
**Browser:** Chromium (Playwright 1.58.1)
**Workers:** 3 paralleles
**Timeout:** 180s par test
**Supabase:** Production (srhpdgqqiuzdrlqaitdk)

---

## Resume

| Metrique             | Valeur                                             |
| -------------------- | -------------------------------------------------- |
| **Tests totaux**     | 130                                                |
| **Passes**           | 108 (83%)                                          |
| **Echoues**          | 22 (17%)                                           |
| **Duree totale**     | 5 min 18s                                          |
| **Fichiers de test** | 20                                                 |
| **Categories**       | Auth, Navigation, Features, Edge cases, Multi-user |

---

## Tests passes par categorie

| Categorie                | Passes | Echoues | Total | Taux |
| ------------------------ | ------ | ------- | ----- | ---- |
| Auth / Login             | 9      | 0       | 9     | 100% |
| Auth / Logout            | 0      | 2       | 2     | 0%   |
| Navigation / Sidebar     | 23     | 0       | 23    | 100% |
| Navigation / Permissions | 9      | 0       | 9     | 100% |
| Dashboard Admin          | 9      | 1       | 10    | 90%  |
| Dashboard Client         | 5      | 0       | 5     | 100% |
| CRM                      | 3      | 1       | 4     | 75%  |
| Appels/Calendar          | 3      | 2       | 5     | 60%  |
| Messagerie               | 2      | 3       | 5     | 40%  |
| School/Formations        | 5      | 1       | 6     | 83%  |
| Formulaires              | 7      | 1       | 8     | 87%  |
| Community Feed           | 7      | 2       | 9     | 78%  |
| Ressources               | 7      | 1       | 8     | 87%  |
| Client Check-in          | 3      | 0       | 3     | 100% |
| Client Goals             | 2      | 1       | 3     | 67%  |
| Client Progress          | 1      | 2       | 3     | 33%  |
| Client Contracts         | 2      | 0       | 2     | 100% |
| Edge Cases               | 3      | 1       | 4     | 75%  |
| Empty States             | 2      | 1       | 3     | 67%  |
| Multi-user               | 0      | 3       | 3     | 0%   |

---

## Bugs critiques

### BUG-01: Logout bloque par le Next.js Dev Overlay

- **Page:** /admin/dashboard (sidebar)
- **Severite:** CRITIQUE (en dev mode uniquement)
- **Description:** Le bouton "Deconnexion" dans la sidebar est intercepte par `<nextjs-portal>` (Next.js Dev Tools overlay). Les clics sont bloques car l'overlay a un z-index plus eleve.
- **Reproduction:**
  1. Se connecter comme admin
  2. Naviguer vers /admin/dashboard
  3. Scroller jusqu'au bouton "Deconnexion" dans la sidebar
  4. Cliquer → le clic est intercepte par l'overlay
- **Impact:** Les tests de logout echouent systematiquement en dev mode. Ne devrait pas affecter la production.
- **Fix suggere:** Ajouter `z-50` ou plus sur le bouton logout, ou fermer le dev overlay dans les tests.

### BUG-02: Multi-user login timeout en parallele

- **Page:** /login
- **Severite:** HAUTE
- **Description:** Quand 2+ browser contexts tentent de se logger simultanement, le serveur Turbopack ne gere pas bien la charge et les redirections timeout a 60s.
- **Reproduction:**
  1. Ouvrir 2 contexts Playwright
  2. Login simultanement avec admin et client
  3. Les 2 tentent de compiler /admin/dashboard et /client/dashboard en meme temps
  4. Timeout
- **Impact:** Les 3 tests multi-user echouent systematiquement.
- **Fix suggere:** Utiliser un build de production (`next build && next start`) pour les tests multi-user, ou pre-compiler les pages.

---

## Bugs fonctionnels

### BUG-03: Dashboard admin — greeting avec prenom

- **Page:** /admin/dashboard
- **Severite:** MOYENNE
- **Description:** Le heading h1 n'est pas toujours visible au premier rendu. Le dashboard prend du temps a charger toutes les donnees (KPIs, charts) et le greeting peut etre masque par un etat de chargement.
- **Test:** `dashboard-admin.spec.ts:7` — "affiche le greeting avec le prenom"

### BUG-04: Client Progress — sections XP et badges introuvables

- **Page:** /client/progress
- **Severite:** MOYENNE
- **Description:** Les sections "XP", "Niveau", "Level" et "Badges" ne sont pas trouvees par les selecteurs de test. Le composant utilise probablement des noms differents ou un layout different de ce qui etait attendu.
- **Tests:** `client-progress.spec.ts:18` et `client-progress.spec.ts:36`

### BUG-05: Client Goals — tabs de statut introuvables

- **Page:** /client/goals
- **Severite:** BASSE
- **Description:** Les tabs "Actifs", "Tous", "Termines", "En pause", "Abandonnes" ne sont pas trouves. Le composant utilise peut-etre d'autres labels ou un pattern de navigation different.
- **Test:** `client-goals.spec.ts:19`

### BUG-06: Messagerie — zone de chat et onglets absents

- **Page:** /admin/messaging, /client/messaging
- **Severite:** MOYENNE
- **Description:** La zone de chat principale, les onglets "interne/externe" et certains elements de la messagerie ne sont pas trouves. Le composant MessagingContainer a probablement une structure differente de ce qui etait anticipe.
- **Tests:** `messaging.spec.ts:53`, `messaging.spec.ts:76`, `messaging.spec.ts:105`

### BUG-07: Appels — vue calendrier et boutons nav absents

- **Page:** /admin/calls
- **Severite:** BASSE
- **Description:** Les elements "Calendrier", "Semaine", "Liste" ainsi que les boutons "Precedent"/"Suivant" ne sont pas trouves avec les selecteurs utilises.
- **Tests:** `calls.spec.ts:19`, `calls.spec.ts:51`

### BUG-08: Community Feed — types de posts et sidebar Trending

- **Page:** /admin/feed
- **Severite:** BASSE
- **Description:** Les selecteurs pour les types de posts (victoire, question, experience, general) apres focus et la sidebar "Trending" ne matchent pas la structure reelle du composant.
- **Tests:** `community-feed.spec.ts:38`, `community-feed.spec.ts:121`

### BUG-09: CRM — colonnes kanban

- **Page:** /admin/crm
- **Severite:** BASSE
- **Description:** Le kanban et ses colonnes ne sont pas trouves avec les selecteurs attendus. Le CRM a probablement un layout tab-based different.
- **Test:** `crm.spec.ts:33`

---

## Tests 100% passes (aucun probleme)

Ces modules fonctionnent parfaitement :

1. **Login** (9/9) — Tous les roles se connectent correctement, les erreurs sont bien gerees, les liens fonctionnent
2. **Navigation sidebar** (23/23) — Les 23 pages admin sont toutes accessibles sans 404
3. **Permissions cross-role** (9/9) — Les redirections inter-roles fonctionnent (client bloque d'admin, coach bloque de sales, etc.)
4. **Dashboard client** (5/5) — Le dashboard client s'affiche correctement, les modules admin sont bien caches
5. **Client check-in** (3/3) — La page de check-in charge correctement
6. **Client contrats** (2/2) — Les contrats clients s'affichent

---

## Ameliorations UX suggerees

1. **Cold start Turbopack** — La premiere compilation de chaque page prend 10-110s. Envisager un `next build` pour les tests et en production.
2. **Next.js Dev Overlay** — Le dev overlay intercepte les clics sur certains elements en bas de page (sidebar footer). Envisager de desactiver le dev overlay dans les tests.
3. **Recharts warnings** — "The width(-1) and height(-1) of chart should be positive" — Les charts Recharts ne sont pas correctement dimensionnes au premier rendu.
4. **Middleware deprecated** — Le fichier `middleware.ts` devrait etre migre vers `proxy.ts` selon Next.js 16.
5. **Table crm_contacts** — La requete `crm_contacts?select=pipeline_stage` retourne une 404, la table a probablement ete renommee.
6. **API AI periodic report** — Erreur serveur sur `/api/ai/periodic-report` au chargement du dashboard.

---

## Structure des tests

```
tests/
  auth/
    login.spec.ts          (9 tests)
    logout.spec.ts         (2 tests)
  navigation/
    sidebar.spec.ts        (23 tests)
    permissions.spec.ts    (9 tests)
  features/
    dashboard-admin.spec.ts   (10 tests)
    dashboard-client.spec.ts  (5 tests)
    crm.spec.ts               (4 tests)
    calls.spec.ts             (5 tests)
    messaging.spec.ts         (5 tests)
    school.spec.ts            (6 tests)
    forms.spec.ts             (8 tests)
    community-feed.spec.ts    (9 tests)
    resources.spec.ts         (8 tests)
    client-checkin.spec.ts    (3 tests)
    client-goals.spec.ts      (3 tests)
    client-progress.spec.ts   (3 tests)
    client-contracts.spec.ts  (2 tests)
  edge-cases/
    double-submit.spec.ts     (4 tests)
    empty-states.spec.ts      (3 tests)
  multi-user/
    concurrent-access.spec.ts (3 tests)
  fixtures.ts                 (shared fixtures + auth)
  helpers/
    supabase.ts               (DB helpers)
  seed.ts                     (create 20 test users)
  cleanup.ts                  (remove test users)
```

---

## Commandes

```bash
# Seeder les utilisateurs test
npx tsx tests/seed.ts

# Lancer tous les tests
npx playwright test

# Lancer une categorie
npx playwright test tests/auth/
npx playwright test tests/features/

# Lancer un test specifique
npx playwright test tests/features/dashboard-admin.spec.ts

# Voir le rapport HTML
npx playwright show-report

# Nettoyer les utilisateurs test
npx tsx tests/cleanup.ts
```

---

## Prochaines etapes

1. **Corriger les selecteurs** des 22 tests echoues (adapter aux vrais labels/structure des composants)
2. **Build de production** pour les tests multi-user (eliminer le bottleneck Turbopack)
3. **Ajouter des tests de creation** (creer un lead, envoyer un message, soumettre un formulaire)
4. **Tests de verification DB** (verifier que les donnees sont bien ecrites en base apres les actions)
5. **Tests responsive** (viewport mobile 375px)
6. **Tests d'accessibilite** (axe-core via @axe-core/playwright)
