# Checklist Complète — Projet Off-Market (Alexia)

> Extraction exhaustive des appels Call1 (58 min) et Call2 (34 min) — Mars 2026

---

## 1. Features Principales (Cœur de l'app)

### Workbooks / Questionnaires dynamiques

- [ ] Système de workbooks (formulaires type Typeform) intégrés à l'app — remplace Lovébol
- [ ] Variables dynamiques : les questions s'adaptent selon les réponses précédentes
- [ ] Workbooks par module : Marché, Offre, Communication, Acquisition, Conversion, Diagnostic (3 boutons cliquables)
- [ ] Notification automatique sur Slack (ou dans l'app) quand un workbook est complété
- [ ] Export du workbook en Markdown pour traitement IA

### Appels vidéo natifs & transcription

- [ ] Appels vidéo intégrés dans l'app (remplacer Google Meet)
- [ ] Transcription automatique en temps réel pendant l'appel
- [ ] Possibilité de scroller/relire le transcript pendant l'appel en cours
- [ ] Enregistrement automatique de l'appel (remplacer Fathom)

### Génération automatique de documents post-appel

- [ ] Fusion automatique du transcript d'appel + réponses du workbook en un seul document
- [ ] Document généré par IA immédiatement après l'appel
- [ ] Export en PDF pour le client
- [ ] Supprime le workflow manuel actuel (export Fathom → export workbook Markdown → envoi sur Claude → fusion manuelle)

### Système de messaging simplifié

- [ ] Messagerie intégrée à l'app — remplace Slack
- [ ] Canal individuel par client (1-to-1 avec coach/CSM)
- [ ] Canaux de groupe : Général, Lives, Challenge, Victoires/Wins
- [ ] Simplicité : uniquement les fonctionnalités essentielles (pas de surcharge comme Slack)
- [ ] Indicateur de messages non lus (badge rouge avec compteur)
- [ ] Système #urgent / @urgent : notification distincte (son différent, notification lock screen)
- [ ] Messages urgents environ 2/semaine max — possibilité de muter les abuseurs

### Onboarding client

- [ ] Création de compte avec mot de passe
- [ ] Page d'accueil branded Off-Market (logo, identité visuelle)
- [ ] Vidéo d'accueil / onboarding (vidéo générale de formation)
- [ ] Formulaire step-by-step : pourquoi Alexia, revenus actuels, infos business
- [ ] Accès immédiat après onboarding : formation, messagerie, toutes les features
- [ ] Tutorial guidé interactif (style SaaS) : guide step-by-step, highlights, explication IA de chaque feature
- [ ] Test obligatoire : le client envoie un message test dans la messagerie pendant le tutorial
- [ ] Vidéo personnalisée du CSM assigné ("Salut, tu seras accompagné par moi...")
- [ ] Présentation du CSM dès l'onboarding (pas après) — le CSM est dans le channel dès le jour 1
- [ ] Psychologie du "C'est pas cheap" — impression pro dès la première seconde

### Suivi de progression client

- [ ] Dashboard de progression visible pour coach et client
- [ ] Roadmap personnalisée auto-générée après l'appel de kickoff (IA analyse le transcript)
- [ ] Jalons / milestones clairs avec critères de validation explicites (ex : "Le marché est validé quand le positionnement est off-market ET X ET Y")
- [ ] Roadmap imprimable pour le client
- [ ] Gestion des rythmes différents : certains clients finissent en 1 mois, d'autres prennent plus longtemps

### Questions pré-appel standardisées

- [ ] Avant chaque appel, le client doit répondre à 2 questions obligatoires :
  1. "Quel est l'objectif de cet appel / quel problème veux-tu résoudre ?"
  2. "Quelle solution as-tu déjà essayée ?"
- [ ] Si la question est simple : possibilité de répondre par vidéo au lieu d'un appel
- [ ] Réduction des coûts CSM en évitant les appels inutiles

### Système de flags (Green / Orange / Red)

- [ ] **Green** : tout va bien, pas de problème
- [ ] **Orange** : le client commence à se plaindre ou n'avance pas (ex : non-engagement, pas de résultats malgré efforts)
- [ ] **Red** : le client demande un remboursement, accuse d'arnaque — intervention urgente
- [ ] Le CSM ou Alexia pose le flag manuellement
- [ ] Notification automatique à Alexia quand un flag change de statut
- [ ] Objectif : ne jamais rater un red flag qui pourrait nuire à la réputation

### Gestion des CSM (Customer Success Managers)

- [ ] Attribution automatique d'un CSM au nouveau client basée sur :
  - Spécialité du client (tech, coach, etc.) extraite du formulaire d'onboarding
  - Répartition équilibrée de la charge (load balancing)
- [ ] Override manuel : Alexia peut réassigner si l'algo se trompe
- [ ] Vidéo de bienvenue par CSM (chaque CSM enregistre sa vidéo)
- [ ] CSM a accès complet aux données Off-Market du client
- [ ] CSM ne voit PAS les autres business/programmes d'Alexia (ABCÉDÉ, etc.)
- [ ] Exception : CSM peut voir le nombre de clients acquis (pour vérifier ses commissions)
- [ ] Vue groupée par CSM : qui a combien de clients (ex : Luc 8, Marie 4, Géraldine 7)
- [ ] Corrélation performance CSM ↔ résultats clients

### FAQ / Base de connaissances IA

- [ ] Tracking de toutes les questions clients et réponses d'Alexia
- [ ] Si une même question est reposée → l'IA répond automatiquement avec la réponse précédente
- [ ] Compteur : +1, +2, +3... à chaque occurrence de la même question
- [ ] Alerte quand une question est posée 5+ fois/semaine → suggestion de créer une vidéo sur le sujet
- [ ] Réduit les coûts CSM (pas besoin de répondre aux questions répétitives)
- [ ] Création de contenu data-driven (savoir quels sujets nécessitent des vidéos)

### IA Assistant / Scoring d'urgence

- [ ] IA analyse les enregistrements/transcripts d'appels pour scorer automatiquement l'urgence du client
- [ ] Identification du problème principal sans devoir réécouter l'appel
- [ ] Permet au CSM de prioriser et cibler le vrai problème pendant le coaching
- [ ] Sessions de coaching plus courtes et plus efficaces

---

## 2. Features Secondaires (Nice to Have)

### Dashboard financier

- [ ] Cash collecté vs cash facturé
- [ ] Nombre de ventes / clients acquis
- [ ] LTV par client (actuellement ~4000€)
- [ ] Ventes par canal (LinkedIn 38%, Upsell 24%, Instagram 9%)
- [ ] Taux de closing + commentaires (raison de non-closing)
- [ ] Source, segment, statut de qualification par deal
- [ ] Revenus par période de 3 mois
- [ ] Objectif d'atteinte affiché

### Calcul automatique des paiements contracteurs

- [ ] Déduction automatique de ce qu'Alexia doit aux setters/CSM quand une vente est faite
- [ ] Gestion des pourcentages différents par contracteur et par vente
- [ ] Gestion des paiements partiels (ex : client paie via Secura → Alexia reçoit 70% → le contracteur touche 5% de ce montant → le reste est dû plus tard)
- [ ] Éliminer les erreurs de calcul manuels (même 10€ d'écart pose problème en compta)

### Génération automatique de contrats/factures

- [ ] Formulaire dans l'app : le client remplit SIRET, SI, LA
- [ ] Génération auto du contrat (remplace Google Docs → PDF → YouSign)
- [ ] Envoi automatique pour signature électronique
- [ ] Gain de temps : 15 min par client actuellement

### CRM basique pour setters/prospecteurs

- [ ] Nom du contact, réponses, infos
- [ ] Accessible sur iPhone (mobile-first pour les setters)
- [ ] Remplace l'Excel de Max (setter actuel)

### Challenges / Leaderboard / Gamification

- [ ] Système de challenges avec classement
- [ ] Critères : nombre de prospects contactés, nombre de closes, etc.
- [ ] Intégration LinkedIn API pour vérification automatique (anti-triche)
- [ ] Auto-sync avec le CRM pour voir les vrais chiffres
- [ ] Problème actuel : les clients mentent sur leurs métriques

### Lead Magnet

- [ ] Création et partage de liens lead magnet depuis l'app
- [ ] Génération de leads inbound

### Calendrier partagé pour les lives

- [ ] Calendrier montrant les sessions live / appels de groupe
- [ ] Visible par tous les coaches
- [ ] Même fonctionnalité que dans School

### Upsell automatisé

- [ ] Quand un client atteint un palier de revenus (7K-8K), déclencher un upsell
- [ ] Objectif : LTV maximale, le client "ne quitte jamais" la plateforme
- [ ] Fidélisation long terme (10+ ans)

---

## 3. Préférences UI / Design

- [ ] **Simplicité avant tout** : uniquement les fonctionnalités essentielles, pas de surcharge (anti-Slack)
- [ ] **Vue liste ET mosaïque/grille** pour la liste des clients (toggle entre les deux)
- [ ] **Tri par activité récente** : clients avec messages non lus en haut
- [ ] **Filtrage/tri** des clients (pas juste alphabétique A-Z)
- [ ] **Branding Off-Market** : logo et identité visuelle dès l'onboarding
- [ ] **Tutorial guidé interactif** style SaaS pour les nouveaux clients
- [ ] **Notifications différenciées** : son distinct pour les messages urgents vs normaux
- [ ] **Badge rouge** avec compteur de messages non lus
- [ ] **Roadmap imprimable** pour les clients
- [ ] **Mobile-first** pour le CRM des setters (iPhone)

---

## 4. Intégrations / APIs Mentionnées

| Outil        | Usage actuel                        | Remplacement prévu                      |
| ------------ | ----------------------------------- | --------------------------------------- |
| Slack        | Messagerie & notifications          | Messaging intégré dans l'app            |
| Lovébol      | Workbooks / formulaires             | Workbooks intégrés dans l'app           |
| Google Meet  | Appels vidéo                        | Appels vidéo natifs dans l'app          |
| Fathom       | Enregistrement & transcription      | Transcription native dans l'app         |
| Claude (IA)  | Fusion de documents                 | IA intégrée pour génération de docs     |
| School       | Plateforme de formation             | Intégration formation dans l'app        |
| Google Docs  | Génération de contrats              | Génération auto dans l'app              |
| YouSign      | Signature électronique              | Envoi auto pour signature               |
| Airtable     | Tracking de progression (abandonné) | Dashboard de progression intégré        |
| LinkedIn API | Vérification prospection (souhaité) | Intégration pour anti-triche challenges |
| WhatsApp     | Collecte infos clients              | Formulaire intégré dans l'app           |
| Excel        | CRM setter (Max)                    | CRM intégré dans l'app                  |

---

## 5. Points de Douleur du Client (À Absolument Éviter)

- [ ] ❌ **Outils dispersés** : actuellement School + Slack + Lovébol + Google Docs + Fathom + YouSign + WhatsApp + Excel → tout doit être centralisé
- [ ] ❌ **Perte de temps manuelle** : 15 min/client pour les contrats, heures/semaine pour fusion de documents, calcul de paiements contracteurs à la main
- [ ] ❌ **Pas de visibilité sur la progression** : impossible de savoir où en est chaque client sans demander
- [ ] ❌ **Notifications non fiables** (Slack) : parfois reçues, parfois non → Alexia vérifie manuellement les 35 clients chaque soir
- [ ] ❌ **Pas de distinction urgent/normal** : impossible de savoir quand un client a un vrai problème urgent
- [ ] ❌ **Clients qui mentent** sur leurs métriques dans les challenges
- [ ] ❌ **Erreurs de calcul** des paiements contracteurs (même 10€ d'écart = problème)
- [ ] ❌ **Red flags ratés** : pas de système pour détecter tôt les clients insatisfaits
- [ ] ❌ **Questions répétitives** : Alexia et les CSM répondent aux mêmes questions encore et encore
- [ ] ❌ **Onboarding impersonnel** : les clients ne comprennent pas la valeur immédiatement → risque de remboursement
- [ ] ❌ **Complexité de Slack** : trop de boutons et d'options que les clients n'utilisent jamais
- [ ] ❌ **Tri alphabétique inutile** avec 35+ clients
- [ ] ❌ **Impossible de corréler performance CSM ↔ résultats clients**
- [ ] ❌ **Clients qui ne savent pas quand une étape est "validée"** → confusion constante
- [ ] ❌ **Appels non préparés** : clients racontent leur vie au lieu de parler business

---

## 6. Passages Flous / Inaudibles / Ambigus

| Passage                              | Timestamp approx. | Interprétation probable                                                                                                                 |
| ------------------------------------ | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| "Secura" — paiement partiel          | Call1 ~30:26      | Probablement **Alma** ou un autre processeur de paiement en plusieurs fois (Secura n'est pas un outil connu)                            |
| "Lovébol" — outil workbooks          | Call1 ~8:06       | Probablement **Involve.me** (outil de formulaires/workbooks interactifs)                                                                |
| "ABCÉDÉ" — autre programme d'Alexia  | Call1 ~17:00      | Nom d'un autre programme/business d'Alexia que le CSM ne doit pas voir — nom possiblement déformé par la transcription                  |
| Mélange français/anglais fréquent    | Tout au long      | La transcription Fathom bascule entre FR et EN, parfois au milieu d'une phrase — le sens général reste clair                            |
| "SIRET, SI, LA" — infos pour contrat | Call1 ~24:38      | SIRET = numéro d'entreprise FR / "SI" et "LA" probablement des champs administratifs spécifiques ou une déformation de la transcription |
| "School" — plateforme de formation   | Call1 & Call2     | Probablement **Skool** (skool.com), plateforme communautaire de formation en ligne                                                      |
| "LTV de 4 million"                   | Call2 ~4:13       | Probablement "4000€" (confirmé dans Call1), pas 4 millions — déformation transcription                                                  |
| "il y a 2 lives par semaine"         | Call1 ~7:52       | Pas clair si c'est 2 lives de groupe ou 2 appels individuels — le contexte suggère des lives de groupe                                  |

---

_Document généré le 12 mars 2026 — Sources : Call1.rtf (58 min) et Call2.rtf (34 min)_
