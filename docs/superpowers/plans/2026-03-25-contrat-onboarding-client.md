# Contrat dans l'onboarding client — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une étape obligatoire de signature de contrat dans l'onboarding client, entre `message_test` et `completion`.

**Architecture:** Le contrat est créé en DB via une API route dédiée à partir d'un template. Le client lit le contrat rendu en HTML (sanitisé via DOMPurify), remplit ses infos (nom, adresse, ville), signe via le SignaturePad existant, puis voit le contrat rempli avant de continuer. On réutilise le système de contrats existant (table `contracts`, `SignaturePad`, API sign).

**Tech Stack:** Next.js 16 App Router, Supabase (contracts + contract_templates), React Hook Form + Zod, SignaturePad (canvas), DOMPurify, Framer Motion

**Spec:** `docs/superpowers/specs/2026-03-25-onboarding-contrat-prospect-design.md`

---

## File Structure

| Action | Fichier | Responsabilité |
|--------|---------|----------------|
| Create | `src/components/onboarding/contract-sign-step.tsx` | Composant étape contrat (3 phases : lecture, signature, validation) |
| Create | `src/app/api/contracts/auto-generate/route.ts` | API route pour créer un contrat depuis le template pour le user connecté |
| Create | `supabase/migrations/XXX_contract_template_onboarding.sql` | Migration : insérer le template contrat d'accompagnement |
| Modify | `src/hooks/use-onboarding.ts:19-26` | Ajouter `contract_sign` dans les étapes client |
| Modify | `src/app/(onboarding)/onboarding/page.tsx:96-130,276-392` | Ajouter le case `contract_sign` + COMPLETED_ITEMS |
| Reuse  | `src/components/contracts/signature-pad.tsx` | SignaturePad existant (canvas + mode texte) |
| Reuse  | `src/hooks/use-contracts.ts` | `useContract(id)`, `useContracts().signContract` |
| Reuse  | `src/app/api/contracts/[id]/sign/route.ts` | API de signature existante |

---

### Task 1: Migration SQL — Template contrat d'accompagnement

**Files:**
- Create: `supabase/migrations/XXX_contract_template_onboarding.sql`

Le template stocke le contenu complet du contrat (30 articles) en HTML avec les variables `{{client_name}}`, `{{client_address}}`, `{{client_city}}`, `{{date}}`.

- [ ] **Step 1: Trouver le prochain numéro de migration**

```bash
ls supabase/migrations/ | tail -3
```

- [ ] **Step 2: Créer la migration**

Créer `supabase/migrations/NNN_contract_template_onboarding.sql` avec :
- `INSERT INTO contract_templates` contenant le titre "Contrat d'Accompagnement — Système Off-Market"
- Le champ `content` = le contrat complet en HTML (copié depuis le PDF, tous les 30 articles)
- Les variables : `client_name` (text), `client_address` (text), `client_city` (text), `date` (date)
- `is_active = true`
- Mettre `created_by = NULL` (template système)
- Ajouter un tag/marker `is_onboarding_template = true` ou utiliser un titre spécifique pour le retrouver

- [ ] **Step 3: Appliquer la migration**

```bash
source .env.local && psql "$DATABASE_URL" -f supabase/migrations/NNN_contract_template_onboarding.sql
```

- [ ] **Step 4: Vérifier**

```bash
source .env.local && psql "$DATABASE_URL" -c "SELECT id, title, is_active FROM contract_templates WHERE title LIKE '%Accompagnement%';"
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/NNN_contract_template_onboarding.sql
git commit -m "db: ajoute le template contrat d'accompagnement pour l'onboarding"
```

---

### Task 2: API Route — Auto-generate contrat pour l'utilisateur connecté

**Files:**
- Create: `src/app/api/contracts/auto-generate/route.ts`

Cette route est appelée quand le client arrive à l'étape `contract_sign`. Elle :
1. Récupère le user depuis la session Supabase
2. Cherche si un contrat `draft` ou `sent` existe déjà pour ce client
3. Si oui : retourne le contrat existant
4. Si non : récupère le template onboarding, remplace les variables, crée un contrat en DB avec status `sent`
5. Retourne `{ contract_id: string }`

- [ ] **Step 1: Créer la route**

Fichier `src/app/api/contracts/auto-generate/route.ts` :
- Import `createServerClient` depuis `@/lib/supabase/server`
- `export async function POST()`
- Récupère le user via `supabase.auth.getUser()`
- Query `contract_templates` WHERE title LIKE '%Accompagnement%' AND is_active = true, LIMIT 1
- Query `contracts` WHERE client_id = user.id AND status IN ('draft', 'sent'), LIMIT 1
- Si contrat existe, retourne `{ contract_id: contrat.id }`
- Sinon : remplace `{{client_name}}` par `profile.full_name`, `{{date}}` par today
- Insert dans `contracts` avec status `sent`, `client_id`, `template_id`, `content` (rendu), `title`, `sent_at`
- Retourne `{ contract_id: newContract.id }`

- [ ] **Step 2: Tester manuellement**

```bash
curl -X POST http://localhost:3000/api/contracts/auto-generate \
  -H "Cookie: $(cat .cookie)" 2>&1 | head -5
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/contracts/auto-generate/route.ts
git commit -m "feat: API auto-generate contrat pour l'onboarding client"
```

---

### Task 3: Composant ContractSignStep

**Files:**
- Create: `src/components/onboarding/contract-sign-step.tsx`

Composant principal de l'étape. 3 phases internes gérées par un state `phase: "reading" | "signing" | "signed"`.

**Sécurité :** Le contenu HTML du contrat vient de notre template DB (pas d'input utilisateur). On utilise DOMPurify pour sanitiser le HTML avant de le rendre, par précaution.

- [ ] **Step 1: Installer DOMPurify**

```bash
npm install dompurify && npm install -D @types/dompurify
```

- [ ] **Step 2: Créer le composant — Phase "reading"**

Props : `onComplete: () => void`

Au mount :
- Appel `POST /api/contracts/auto-generate` pour obtenir le `contract_id`
- Charge le contrat via `useContract(contractId)`
- Affiche le contrat en HTML scrollable (sanitisé avec DOMPurify)
- Bouton "Signer ce contrat" en bas

- [ ] **Step 3: Phase "signing" — Modale de signature**

Au clic sur "Signer ce contrat", `phase = "signing"`, affiche une modale/sheet avec :
- React Hook Form + Zod schema :
  - `signer_name`: string, required, pré-rempli depuis profile.full_name
  - `address`: string, required
  - `city`: string, required
  - `lu_et_approuve`: boolean, must be true
- `SignaturePad` importé depuis `@/components/contracts/signature-pad`
- State local `signatureDataUrl: string | null` — rempli par le callback `onSign` du SignaturePad
- Bouton "Signer" disabled si form invalide OU signature vide

Au submit :
- Appel `signContract.mutate()` depuis `useContracts()` avec `{ id: contractId, signatureData: { ip_address, user_agent, signer_name }, signatureImage: dataUrl }`
- On success, `phase = "signed"`

- [ ] **Step 4: Phase "signed" — Visualisation du contrat signé**

Quand `phase === "signed"` :
- Re-fetch le contrat (`queryClient.invalidateQueries(["contract", contractId])`)
- Afficher le contrat avec les infos remplies + signature image en bas
- Confetti
- Bouton "Continuer" qui appelle `onComplete()`

- [ ] **Step 5: Commit**

```bash
git add src/components/onboarding/contract-sign-step.tsx
git commit -m "feat: composant ContractSignStep — lecture, signature et validation du contrat"
```

---

### Task 4: Intégrer l'étape dans le flow d'onboarding

**Files:**
- Modify: `src/hooks/use-onboarding.ts:19-26`
- Modify: `src/app/(onboarding)/onboarding/page.tsx:96-130,276-392`

- [ ] **Step 1: Ajouter `contract_sign` dans les steps client**

Dans `src/hooks/use-onboarding.ts`, modifier `ROLE_ONBOARDING_STEPS.client` (ligne 19-26) :

```ts
client: [
  "welcome_video",
  "about_you",
  "meet_csm",
  "feature_tour",
  "message_test",
  "contract_sign",  // NOUVEAU
  "completion",
] as const,
```

Aussi ajouter `"contract_sign"` dans `ALL_STEP_KEYS` (ligne 38-49).

- [ ] **Step 2: Ajouter le case dans renderStep()**

Dans `src/app/(onboarding)/onboarding/page.tsx`, après le case `"message_test"` (ligne ~345) :

```tsx
case "contract_sign":
  return (
    <ContractSignStep onComplete={goNext} />
  );
```

Ajouter l'import en haut du fichier :
```tsx
import { ContractSignStep } from "@/components/onboarding/contract-sign-step";
```

- [ ] **Step 3: Mettre à jour COMPLETED_ITEMS.client**

Dans `page.tsx` lignes 108-114, ajouter "Contrat signe" :

```ts
client: [
  "Video d'accueil regardee",
  "Profil business complete",
  "CSM rencontre",
  "Visite de la plateforme",
  "Premier message envoye",
  "Contrat signe",  // NOUVEAU
],
```

- [ ] **Step 4: Retirer l'auto-generate du completeOnboarding**

Dans `src/hooks/use-onboarding.ts`, dans la mutation `completeOnboarding.mutationFn`, retirer le bloc fire-and-forget qui appelle `/api/contracts/auto-generate` (c'est maintenant fait dans l'étape `contract_sign`).

- [ ] **Step 5: Build**

```bash
npm run build 2>&1 | tail -15
```

- [ ] **Step 6: Commit**

```bash
git add src/hooks/use-onboarding.ts src/app/\(onboarding\)/onboarding/page.tsx
git commit -m "feat: integre l'etape contract_sign dans l'onboarding client"
```

---

### Task 5: Test E2E — Flow complet onboarding client avec contrat

**Files:**
- Create: `tests/e2e/features/onboarding-contract.spec.ts`

- [ ] **Step 1: Écrire le test**

Test Playwright :
1. Créer un user test avec role `client` via Supabase admin API
2. Se connecter
3. Naviguer les étapes d'onboarding jusqu'à `contract_sign`
4. Vérifier que le contrat s'affiche (texte "CONTRAT D'ACCOMPAGNEMENT" visible)
5. Cliquer "Signer ce contrat"
6. Remplir les champs (nom, adresse, ville)
7. Cocher "Lu et approuvé"
8. Dessiner/taper une signature
9. Cliquer "Signer"
10. Vérifier que le contrat signé s'affiche
11. Cliquer "Continuer"
12. Vérifier qu'on arrive sur l'étape completion

- [ ] **Step 2: Commit**

```bash
git add tests/e2e/features/onboarding-contract.spec.ts
git commit -m "test: E2E onboarding client avec signature de contrat"
```

---

## Récapitulatif des tasks

| # | Task | Fichiers |
|---|------|----------|
| 1 | Migration SQL template | `supabase/migrations/NNN_*.sql` |
| 2 | API auto-generate | `src/app/api/contracts/auto-generate/route.ts` |
| 3 | Composant ContractSignStep | `src/components/onboarding/contract-sign-step.tsx` |
| 4 | Intégrer dans le flow | `use-onboarding.ts` + `page.tsx` |
| 5 | Test E2E | `tests/e2e/features/onboarding-contract.spec.ts` |
