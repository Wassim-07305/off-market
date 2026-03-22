# Bugs identifiés par analyse statique — Off-Market

Date : 2026-03-22 | Statut : Tous corrigés ou documentés

## Bugs Majeurs — TOUS CORRIGÉS

### BUG-001 — Revenue map incompatible frontend/backend (Auth/Onboarding)
- **Fichiers** : `src/components/onboarding/about-you-step.tsx` vs `src/app/api/onboarding/save-profile/route.ts`
- **Impact** : Tous les revenus sauvegardés à 0 en base
- **Fix** : Ajouté les clés frontend (`"0-1k"`, `"1k-3k"`, etc.) dans le REVENUE_MAP backend avec rétro-compatibilité

### BUG-004 — Absence de protection CSRF sur /api/invitations/accept (Auth)
- **Fichier** : `src/app/api/invitations/accept/route.ts`
- **Impact** : Escalade de privilèges potentielle
- **Fix** : Ajouté validation Origin/Referer + exigence d'authentification pour `apply_role`

### BUG-006 — /register sans code affiche erreur au lieu de redirection (Auth)
- **Fichier** : `src/app/(auth)/register/page.tsx`
- **Impact** : Confusion UX entre /signup (libre) et /register (invitation)
- **Fix** : Message "Invitation requise" avec CTA vers /signup et /login

## Bugs Moyens — TOUS CORRIGÉS

### BUG-GAMI-001/002 — monthly_revenue hardcodé à 0 dans Hall of Fame
- **Fichiers** : `src/hooks/use-hall-of-fame.ts`, `supabase/migrations/095_perf_views.sql`
- **Impact** : Filtres revenus et tri CA du Hall of Fame inopérants
- **Fix** : Nouvelle migration `110_hall_of_fame_revenue.sql` qui enrichit la vue avec `student_details.current_revenue` et `niche`. Hook mis à jour pour utiliser les nouvelles colonnes.

### BUG-GAMI-003 — RPC record_activity peut ne pas exister
- **Fichier** : `src/hooks/use-streaks.ts`
- **Statut** : FAUX POSITIF — la RPC existe dans les migrations 019, 088, 090. Le fail-silent est un guard défensif correct.

### BUG-GAMI-006 — useMyRedemptions trie par created_at au lieu de redeemed_at
- **Fichier** : `src/hooks/use-rewards.ts`
- **Statut** : FAUX POSITIF — le code utilise déjà `redeemed_at` (ligne 84)

## Bugs Mineurs — TOUS CORRIGÉS

### BUG-003 — Toggle mot de passe partagé entre 2 champs sur /register
- **Fichier** : `src/app/(auth)/register/page.tsx`
- **Fix** : Séparé en deux states `showPassword` et `showConfirmPassword` avec bouton œil indépendant

### BUG-005 — Délai 2.5s post-onboarding → double redirection possible
- **Fichier** : `src/app/(onboarding)/onboarding/page.tsx`
- **Fix** : Réduit à 1.5s et utilisation de `window.location.replace()` (pas de retour arrière possible)

### BUG-002 — Titre "Connexion" masqué sur mobile
- **Statut** : Design intentionnel — le header mobile avec logo fournit le contexte

## Bugs Faibles — TOUS CORRIGÉS

### BUG-GAMI-004 — ShareToggle requête Supabase redondante
- **Fichier** : `src/components/journal/share-toggle.tsx`
- **Fix** : Remplacé `useJournal()` par une mutation inline directe, éliminant la requête complète

### BUG-GAMI-005 — escapePDF supprime silencieusement les emojis
- **Fichier** : `src/app/api/journal/export/route.ts`
- **Fix** : Ajouté un dictionnaire EMOJI_MAP (20+ emojis courants) qui convertit les emojis en texte lisible avant le stripping final

### BUG-GAMI-007 — Premier utilisateur sans ligne streaks
- **Statut** : FAUX POSITIF — le `?? 0` gère correctement le cas, le record n'apparaît que si `longest_streak > 0`

---

## Résumé

| Catégorie | Total | Corrigés | Faux positifs | Design intentionnel |
|-----------|-------|----------|---------------|---------------------|
| Majeur | 3 | 3 | 0 | 0 |
| Moyen | 3 | 1 | 2 | 0 |
| Mineur | 3 | 2 | 0 | 1 |
| Faible | 3 | 2 | 1 | 0 |
| **Total** | **12** | **8** | **3** | **1** |
