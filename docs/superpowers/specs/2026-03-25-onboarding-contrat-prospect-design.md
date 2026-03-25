# Spec : Contrat dans l'onboarding client + Onboarding prospect

**Date** : 2026-03-25
**Projet** : Off-Market
**Statut** : Approuvé

---

## Chantier 1 : Étape contrat dans l'onboarding client

### Contexte

L'onboarding client actuel a 6 étapes : `welcome_video` → `about_you` → `meet_csm` → `feature_tour` → `message_test` → `completion`. Il n'y a pas d'étape de signature de contrat. Le contrat est auto-généré en fire-and-forget à la completion mais jamais présenté au client.

Le contrat PDF existant (`public/contrat-off-market.pdf`) fait 9 pages, 30 articles. Les champs client à remplir sont : nom/prénom, adresse, code postal/ville, mention "lu et approuvé", signature.

### Objectif

Ajouter une étape obligatoire `contract_sign` entre `message_test` et `completion` où le client lit, remplit ses informations et signe le contrat. Pas de bouton "Passer" — la signature est obligatoire.

### Flow client modifié

```
welcome_video → about_you → meet_csm → feature_tour → message_test → contract_sign → completion
```

7 étapes au lieu de 6.

### Étape `contract_sign` — 3 phases

#### Phase 1 : Lecture du contrat

- Le contrat complet (HTML rendu depuis le template DB) est affiché en scrollable
- En haut : infos prestataire (Get Your Goals Co.) pré-remplies, infos client en placeholder
- Scroll indicator pour inciter à tout lire
- En bas : bouton **"Signer ce contrat"**

#### Phase 2 : Modale de signature

Au clic sur "Signer ce contrat", une modale (Sheet/Dialog) s'ouvre avec :

| Champ | Type | Pré-rempli | Obligatoire |
|-------|------|-----------|-------------|
| Nom et Prénom | text | Oui (depuis `profile.full_name`) | Oui |
| Adresse | text | Non | Oui |
| Code postal et Ville | text | Non | Oui |
| Checkbox "Lu et approuvé" | checkbox | Non | Oui |
| Signature | SignaturePad (canvas existant) | Non | Oui |

Le bouton "Signer" est disabled tant que tous les champs ne sont pas remplis et la signature pas posée.

#### Phase 3 : Validation post-signature

Après signature réussie (API `POST /api/contracts/[id]/sign`) :
- Le contrat se ré-affiche avec les infos du client remplies + la signature visible en bas
- Confetti
- Bouton **"Continuer"** → passe à l'étape `completion`

### Implémentation technique

#### Fichiers à créer

| Fichier | Description |
|---------|-------------|
| `src/components/onboarding/contract-sign-step.tsx` | Composant de l'étape contrat (lecture + signature + validation) |

#### Fichiers à modifier

| Fichier | Modification |
|---------|-------------|
| `src/hooks/use-onboarding.ts` | Ajouter `contract_sign` dans `ROLE_ONBOARDING_STEPS.client` (entre `message_test` et `completion`). Déplacer l'auto-generate du contrat de `completeOnboarding` vers cette étape |
| `src/app/(onboarding)/onboarding/page.tsx` | Ajouter le case `contract_sign` dans `renderStep()` |
| `src/components/onboarding/completion-step.tsx` | Mettre à jour `COMPLETED_ITEMS` pour inclure "Contrat signé" |

#### Logique de génération du contrat

1. Quand le client arrive à l'étape `contract_sign`, on vérifie s'il a déjà un contrat en DB avec status `sent` ou `draft`
2. Si non : appel `POST /api/contracts/auto-generate` pour en créer un depuis le template
3. Affichage du contrat via `useContract(contractId)`
4. Signature via `POST /api/contracts/[id]/sign` avec `signature_image` + `signature_data` (signer_name, address, city, IP, user_agent)

#### Template contrat en DB

Créer un template `contract_templates` avec le contenu du PDF converti en HTML/Markdown, avec les variables :
- `{{client_name}}` — Nom et Prénom du client
- `{{client_address}}` — Adresse
- `{{client_city}}` — Code postal et Ville
- `{{date}}` — Date du jour
- `{{signature}}` — Placeholder pour la signature

Le template sera inséré en DB via une migration SQL.

#### Composants réutilisés

- `SignaturePad` (`src/components/contracts/signature-pad.tsx`) — canvas dessin + mode texte cursive
- `useContract`, `useContracts` (`src/hooks/use-contracts.ts`) — CRUD contrats
- API `POST /api/contracts/[id]/sign` — signature avec metadata (IP, UA)

---

## Chantier 2 : Onboarding prospect (parcours différent)

### Contexte

Les prospects ont actuellement le même squelette d'onboarding que les clients mais allégé (4 étapes : `welcome_video` → `about_you` → `feature_tour` → `completion`). Le problème : ce parcours ne qualifie pas le prospect et ne pousse pas vers un appel de closing.

Les prospects ne sont PAS des élèves. Ils n'ont PAS de contrat à signer. Leur onboarding doit les qualifier et leur donner envie de rejoindre l'accompagnement.

### Objectif

Remplacer l'onboarding prospect par un parcours de qualification/conversion en 4 étapes.

### Flow prospect

```
welcome_video → qualification → value_preview → booking_cta
```

4 étapes, pas de `completion` classique — le CTA final est le booking d'appel.

### Étape 1 : `welcome_video` (existante, inchangée)

Vidéo d'accueil + texte de bienvenue.

### Étape 2 : `qualification`

Formulaire de qualification (remplace `about_you` + `feature_tour`) :

| Question | Type | Options | Scoring |
|----------|------|---------|---------|
| Quelle est ton activité ? | select | Freelance dev, Consultant, Coach, Agence, Autre | — |
| Ton CA mensuel actuel ? | select | < 2K, 2-5K, 5-8K, 8K+ | 8K+ = +30, 5-8K = +20, 2-5K = +10 |
| Ton objectif de CA mensuel ? | slider | 5K → 30K | 15K+ = +15 |
| Ton plus gros blocage ? | multi-select | Pas assez de clients, Prix trop bas, Trop de temps en prospection, Pas de structure, Scaler/déléguer | "Pas assez de clients" ou "Prix trop bas" = +20 |
| Prêt à investir pour résoudre ça ? | scale 1-10 | — | 7+ = +25, 4-6 = +10 |

Score stocké dans `crm_contacts.lead_score` ou `student_details` du prospect.

### Étape 3 : `value_preview`

Contenu de teasing personnalisé selon les réponses :

- **Résultat client** : card témoignage (photo, métier, CA avant/après, quote). Données statiques ou depuis une table `testimonials`.
- **Extrait formation** : 1 module gratuit adapté au blocage sélectionné (lien vers un module `is_free` dans la table `module_items`)
- **Aperçu plateforme** : 3-4 screenshots/cards des fonctionnalités clés
- **Chiffre clé** : stat de réussite ("X% de nos membres atteignent leur objectif en 6 mois")

### Étape 4 : `booking_cta`

Mini-diagnostic auto-généré :

> **Ton profil** : [activité] à [CA actuel]/mois, objectif [objectif]
> **Blocage principal** : [blocage sélectionné]
> **Score** : [score]/100

CTA principal : **"Réserver mon appel stratégique"** → lien vers la page booking (`/book/[slug]`)

CTA secondaire : **"Explorer la plateforme"** → redirige vers `/client/dashboard` (accès limité prospect)

Les deux CTA complètent l'onboarding (`onboarding_completed = true`).

Si le prospect clique "Réserver" : notification au setter/closer + `crm_contacts` mis à jour avec `stage = "booking"`.

### Implémentation technique

#### Fichiers à créer

| Fichier | Description |
|---------|-------------|
| `src/components/onboarding/qualification-step.tsx` | Formulaire de qualification avec scoring |
| `src/components/onboarding/value-preview-step.tsx` | Contenu de teasing personnalisé |
| `src/components/onboarding/booking-cta-step.tsx` | Diagnostic + CTA booking |

#### Fichiers à modifier

| Fichier | Modification |
|---------|-------------|
| `src/hooks/use-onboarding.ts` | Modifier `ROLE_ONBOARDING_STEPS.prospect` : `["welcome_video", "qualification", "value_preview", "booking_cta"]` |
| `src/app/(onboarding)/onboarding/page.tsx` | Ajouter les 3 nouveaux cases dans `renderStep()` |

#### Migration SQL

- Ajouter colonnes scoring au prospect dans `student_details` ou utiliser `crm_contacts.lead_score`
- Table `testimonials` (optionnel — peut être en dur dans le composant au début)

---

## Ordre d'implémentation recommandé

1. **Chantier 1 d'abord** (contrat onboarding client) — plus critique business, le système de contrats existe déjà
2. **Chantier 2 ensuite** (onboarding prospect) — indépendant, peut être fait en parallèle

## Hors scope

- Modification du contrat PDF lui-même (le contenu vient du template DB)
- Paiement Stripe dans l'onboarding (post-contrat, séparé)
- Séquences email nurturing pour prospects froids (post-MVP)
