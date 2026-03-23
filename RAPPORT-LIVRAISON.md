# Rapport de Livraison — Off-Market

> Date : 2026-03-23
> URL de production : https://off-market-amber.vercel.app
> Branche : `main`

---

## 1. Build & Deploiement

| Point | Statut | Detail |
|-------|--------|--------|
| TypeScript (`tsc --noEmit`) | ⚠️ 2 erreurs | `use-lead-magnet.ts:173` (type CapturedContact) + `use-ltv.ts:48` (cast InvoiceWithClient) |
| Build Vercel | ✅ OK | Dernier deploiement READY (build en cours pour le commit Google Calendar) |
| Branche main | ✅ A jour | 13 fichiers modifies localement (non pushes) |
| URL production | ✅ Active | https://off-market-amber.vercel.app |

> **Note** : `ignoreBuildErrors: true` dans next.config — les 2 erreurs TS n'empechent pas le build mais doivent etre corrigees.

---

## 2. Fonctionnalites (FEATURES.md)

| Statut | Nombre | % |
|--------|--------|---|
| ✅ Fait | 32 | 45% |
| 🔧 Partiel | 30 | 42% |
| ⬜ A faire | 9 | 13% |
| **Total** | **71** | |

### Features completes (32/71)

F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F13, F14, F15, F16, F17, F19, F21, F22, F23, F24, F26, F27, F29, F30, F31, F32, F33, F37, F38, F39, F41, F42, F47, F50, F51, F53, F55, F56, F60, F67, F71

### Features a faire (9)

| # | Feature | Impact |
|---|---------|--------|
| F48 | Notifications email (Resend) | Eleve — bloque relances et invitations |
| F59 | Monitoring et support | Moyen |
| F69 | Analytics externes (GA, Mixpanel) | Moyen |

### Blockers critiques

1. **Email (F48, F36)** : Resend installe mais aucun code d'envoi. Bloque relances, notifications email, invitations.
2. **Stripe (F35, F66)** : SDK `@stripe/stripe-js` non installe. Paiements en ligne non fonctionnels.
3. **SSO (F54)** : Pas d'integration SAML/OAuth enterprise.

---

## 3. Tests Navigateur (Playwright — Production)

| Test | Statut | Detail |
|------|--------|--------|
| Landing page charge | ✅ PASS | Titre, H1, 8 CTAs visibles, nav complete |
| Login page | ✅ PASS | Formulaire email/password, boutons Google/Microsoft |
| Redirect routes protegees | ✅ PASS | `/admin/dashboard` → redirige vers `/login` |
| Mobile responsive (375px) | ✅ PASS | Pas de scroll horizontal, menu hamburger, CTAs full-width |
| Erreurs console | ✅ PASS | 0 erreurs JS sur toutes les pages testees |
| Route publique `/book` | ⚠️ PARTIEL | Redirige vers login sans slug — OK si `/book/[slug]` fonctionne |
| Route publique `/f/` | ⚠️ PARTIEL | Redirige vers login sans form ID — OK si `/f/[formId]` fonctionne |

---

## 4. Responsive

| Point | Statut |
|-------|--------|
| Landing page lisible (375px) | ✅ |
| Pas de debordement horizontal | ✅ |
| Navigation mobile (hamburger) | ✅ |
| CTAs touch-friendly | ✅ |

---

## 5. Performance & SEO

| Point | Statut | Detail |
|-------|--------|--------|
| `<title>` global | ✅ | "Off Market — Deviens le choix evident" |
| Meta OpenGraph | ✅ | title, description, siteName, type, locale fr_FR |
| Twitter Card | ✅ | summary_large_image |
| OG Image dynamique | ✅ | opengraph-image.tsx (1200x630, Edge runtime) |
| Favicon/Icons | ✅ | 16x16, 32x32, apple-touch-icon, manifest.json |
| Langue HTML | ✅ | `lang="fr"` |
| PWA manifest | ✅ | manifest.json avec icons 192/512 |
| `robots.txt` | ❌ Manquant | Pas de fichier robots.txt ni src/app/robots.ts |
| Sitemap | ❌ Manquant | Pas de src/app/sitemap.ts |
| Canonical URLs | ❌ Manquant | Pas de balise canonical |
| JSON-LD (schema.org) | ❌ Manquant | Pas de donnees structurees |
| Google Search Console | ❌ Non configure | Pas de meta verification |

---

## 6. Securite

### 6.1 Protection des routes

| Point | Statut | Detail |
|-------|--------|--------|
| Middleware auth | ✅ | Toutes les routes protegees redirigent vers `/login` |
| Verification role serveur | ✅ | Middleware + layouts verifient le role |
| Rate limiting API | ✅ | AI: 10/min, v1: 20/min, generique: 60/min |
| Onboarding enforced | ✅ | Impossible d'acceder aux pages role sans onboarding complet |
| Cache profil (TTL 60s) | ✅ | Cookie `om_profile_cache` evite les requetes DB repetees |

### 6.2 Secrets cote client

| Point | Statut |
|-------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` expose en NEXT_PUBLIC | ✅ Non expose |
| `STRIPE_SECRET_KEY` expose en NEXT_PUBLIC | ✅ Non expose |
| Secrets uniquement cote serveur | ✅ Verifie (admin.ts, stripe.ts, API routes) |

### 6.3 API Routes — Authentification

| Categorie | Nombre | Statut |
|-----------|--------|--------|
| Routes avec auth (getUser) | 63 | ✅ |
| Routes avec API key (v1) | 6 | ✅ |
| Routes cron (CRON_SECRET) | 5 | ✅ |
| Routes webhook (signature) | 1 | ✅ |
| Routes publiques intentionnelles | 3 | ✅ `/api/health`, `/api/integrations/status`, `/api/email/status` |
| **Routes sans auth problematiques** | **3** | ❌ Voir ci-dessous |

### Routes API sans authentification (a corriger)

| Route | Risque | Detail |
|-------|--------|--------|
| `/api/contracts/[id]/sign` | **ELEVE** | N'importe qui peut signer un contrat en connaissant l'ID |
| `/api/contracts/[id]/pdf` | **ELEVE** | N'importe qui peut telecharger un contrat en connaissant l'ID |
| `/api/contracts/[id]/public` | **ELEVE** | N'importe qui peut voir un contrat en connaissant l'ID |

> **Mitigation** : Les IDs sont des UUID v4 (non devinables), mais ces routes devraient idealement verifier un token de signature ou l'identite du signataire.

---

## 7. Base de Donnees (Supabase)

| Point | Valeur |
|-------|--------|
| Tables | 155 |
| Migrations | 8 |
| RLS active | ✅ Sur toutes les tables |
| Profils | 33 utilisateurs |

### Advisories Supabase

| Severite | Nombre | Detail |
|----------|--------|--------|
| ERROR | 17 | Principalement auth (leaked password protection non activee) |
| WARN | 54 | 36 policies RLS `always true` + 17 fonctions `search_path mutable` + 1 extension `vector` dans public |
| INFO | 5 | 5 tables avec RLS mais sans policies |

### Tables sans policies RLS (5)

- `attachments`, `avatars`, `branding`, `flag_history`, `uploads`

> Ces tables ont RLS active mais aucune policy — elles sont donc **inaccessibles** par les clients (securise par defaut, mais les fonctionnalites associees ne marcheront pas).

### Policies RLS "always true" (36 tables)

Plusieurs tables ont des policies qui autorisent toutes les operations sans condition (`true`). Exemples critiques :
- `financial_entries` — donnees financieres accessibles a tous les utilisateurs authentifies
- `closer_calls`, `client_assignments` — donnees sensibles
- `google_calendar_tokens` — tokens OAuth accessibles

> **Recommandation** : Restreindre ces policies avec `auth.uid() = user_id` ou des conditions de role.

---

## 8. Erreurs Production (24h)

| Route | Erreur | Nombre |
|-------|--------|--------|
| `/api/ai/periodic-report` | 500 — OpenRouter 402 (credits epuises) | ~48 |
| `/api/google-calendar/callback` | 307 — Echec stockage token | ~2 |

> **Action requise** : Recharger les credits OpenRouter ou configurer un fallback (Gemini/Anthropic deja en place mais non priorise pour cette route).

---

## 9. Resume Global

```
✅ PASSE (15)                          ❌ ECHOUE / MANQUANT (9)
─────────────────────────────          ─────────────────────────────
Landing page                           robots.txt
Login page                             Sitemap
Redirect auth                          Canonical URLs
Mobile responsive                      JSON-LD
Console errors (0)                     Auth sur /api/contracts/*
Meta OG + Twitter Card                 36 policies RLS "always true"
OG Image dynamique                     5 tables sans policies
Favicon + PWA                          Credits OpenRouter epuises
Secrets non exposes                    Notifications email (F48)
72/81 API routes authentifiees
Rate limiting
Role verification
RLS active (155 tables)
Session cleanup
Onboarding enforcement
```

---

## 10. Recommandations pour la Suite

### Priorite 1 — Avant livraison client

1. **Securiser les routes contrats** : Ajouter verification token/signataire sur `/api/contracts/[id]/sign|pdf|public`
2. **Corriger les policies RLS "always true"** sur les tables sensibles (`financial_entries`, `google_calendar_tokens`, `closer_calls`)
3. **Recharger credits OpenRouter** ou router `/api/ai/periodic-report` vers Gemini/Anthropic
4. **Corriger les 2 erreurs TypeScript** (`use-lead-magnet.ts`, `use-ltv.ts`)

### Priorite 2 — Post-livraison

5. **Ajouter robots.txt + sitemap** pour le SEO
6. **Implementer les notifications email** (F48) — Resend est installe, manque le code d'envoi
7. **Installer Stripe SDK** et connecter les paiements reels
8. **Ajouter policies RLS** sur les 5 tables sans policies (`attachments`, `avatars`, `branding`, `flag_history`, `uploads`)
9. **Activer la protection leaked passwords** dans Supabase Auth (HaveIBeenPwned)
10. **Fixer les `search_path` des fonctions DB** (54 warnings)

### Priorite 3 — Ameliorations

11. Ajouter JSON-LD (schema.org) pour les rich snippets
12. Configurer Google Search Console
13. Implementer le monitoring/support (F59)
14. Ajouter analytics (F69)
15. SSO enterprise (F54)

---

## Verdict

| Critere | Note |
|---------|------|
| Build & Deploiement | 8/10 |
| Fonctionnalites | 6/10 (45% completes, 42% partielles) |
| UX & Responsive | 9/10 |
| SEO | 6/10 |
| Securite applicative | 7.5/10 |
| Securite DB (RLS) | 5/10 (trop de policies permissives) |
| **Global** | **7/10 — Livrable avec reserves** |

> **Conclusion** : Le projet est fonctionnel et deployable pour une demo ou un beta test. Les points bloquants pour une mise en production complete sont : la securisation des routes contrats, le durcissement des policies RLS, et la resolution du probleme de credits IA. Les features partielles (Stripe, email, SSO) peuvent etre livrees en iterations suivantes.
