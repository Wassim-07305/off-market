# Cahier des charges Off-Market — V3 (Mars 2026)

---

## MODULE 1 — ONBOARDING CLIENT

### 1.1 Création du compte client

- Alexia crée un profil client dans le back-office (nom, email, CSM assigné)
- Génération automatique d'un lien d'invitation unique
- Le client clique sur le lien → crée son mot de passe → accède à l'app

### 1.2 Page d'accueil brandée

- Logo Off-Market + couleurs d'Alexia
- Vidéo de bienvenue d'Alexia qui explique le déroulé
- Guided tour step-by-step de l'app (style SaaS : zones floutées, tutoriel progressif)

### 1.3 Formulaire d'onboarding

- Questions : pourquoi il a choisi Alexia, son activité, son CA actuel, sa spécialité (tech/IA, coaching, autre…)
- La réponse spécialité détermine automatiquement le CSM assigné
- Progression step-by-step avec validation de chaque étape
- Page de confirmation "Merci, tu es bien onboardé"

### 1.4 Actions automatiques post-onboarding

- Création automatique du canal de messagerie (client + CSM + Alexia)
- Affichage de la vidéo de présentation du CSM assigné
- Accès immédiat à la formation + à la messagerie
- Notification à Alexia que le client est onboardé

### 1.5 Attribution CSM

- Automatique selon la spécialité renseignée dans l'onboarding
- Override manuel possible par Alexia en back-office
- Le CSM est dans le canal dès le jour 1

---

## MODULE 2 — MESSAGERIE

### 2.1 Canaux

- Un canal individuel par client (client + CSM + Alexia)
- Canaux collectifs fixes : Général, Lives, Challenge, Wins/Succès

### 2.2 Vue clients

- Switchable : mode liste OU mode mosaïque (avatars/photos)
- Tri intelligent : clients avec messages non lus remontent en haut
- Badge rouge avec compteur sur chaque client non lu
- Regroupement possible par CSM assigné

### 2.3 Notifications

- Push notification fiable sur mobile pour chaque nouveau message
- Tag #urgent ou @urgent → notification prioritaire avec sonnerie distincte
- Séparation visuelle entre messages urgents et normaux

---

## MODULE 3 — WORKBOOKS

### 3.1 Création et remplissage

- Workbooks interactifs intégrés (style formulaire/Typeform)
- Sauvegarde automatique de la progression
- Variables conditionnelles selon les réponses

### 3.2 Notifications & suivi

- Notification à Alexia dès qu'un workbook est complété
- Statut de progression visible par Alexia et le CSM

### 3.3 Fusion transcript + workbook

- Après chaque appel lié à un workbook : l'IA fusionne transcript + réponses workbook
- Génère un document finalisé (PDF) envoyé au client

---

## MODULE 4 — APPELS

### 4.1 Appels intégrés

- Appels vidéo directement dans l'app (remplace Google Meet)
- Transcript en temps réel affiché pendant l'appel

### 4.2 Formulaire pré-call obligatoire

- 2 questions : problématique/objectif + solution déjà essayée
- Si trivial → réponse possible par vidéo loom sans call
- Formulaire visible par Alexia/CSM avant l'appel

---

## MODULE 5 — IA & AUTOMATISATION

### 5.1 Roadmap personnalisée post-kickoff

- Après le premier appel de kickoff, l'IA génère une roadmap personnalisée
- Contenu : prochaines étapes, jalons, actions, critères de validation
- Format : document propre, exportable / imprimable

### 5.2 Assistant IA (« Jarvis Off-Market »)

- Nourri avec toutes les réponses d'Alexia aux questions clients passées
- Répond automatiquement aux questions fréquentes

### 5.3 Analyse client IA

- Analyse conversations + transcripts passés
- Génère un briefing automatique avant chaque session CSM

### 5.4 FAQ & log des questions récurrentes

- Enregistrement auto de chaque question posée
- Compteur +1 à chaque récurrence
- Dashboard : top questions les plus fréquentes
- Partageable avec les CSM

---

## MODULE 6 — FORMATION

### 6.1 Espace cours intégré

- Modules de formation dans l'app
- Plusieurs formations possibles
- Ressources attachées à chaque module

### 6.2 Accès conditionnel

- Certains modules se débloquent selon la progression (workbooks, étapes)

---

## MODULE 7 — DASHBOARD FINANCIER & CRM

### 7.1 Métriques principales

- CA sur les 3 derniers mois
- Nombre de clients actifs
- Taux de recouvrement (cash facturé vs cash collecté)
- LTV moyenne par client
- Nombre de ventes

### 7.2 Sources d'acquisition

- Répartition % par canal : LinkedIn, Instagram, upsell, inbound, référencement
- Évolution dans le temps

### 7.3 CRM closing

- Par deal : nom, source, segment, qualifié, résultat, montant, commentaire
- Taux de closing global
- Vue setter limitée : nom du prospect + ses réponses

---

## MODULE 8 — COMMISSIONS PRESTATAIRES

### 8.1 Paramétrage

- % par prestataire, conditions d'application

### 8.2 Calcul automatique

- À chaque vente : calcul auto de ce qui est dû
- Gestion paiement en plusieurs fois

### 8.3 Tableau de bord prestataires

- Montant dû par vente, historique virements

---

## MODULE 9 — CONTRATS

### 9.1 Génération automatique

- Formulaire rempli par le client (nom, entreprise, SIRET, adresse)
- Génération auto depuis template
- Signature électronique intégrée

---

## MODULE 10 — FLAGS CLIENTS

### 10.1 Système de drapeaux

- 🟢 Green : tout va bien
- 🟠 Orange : client mécontent ou sans résultats → notification non-urgente
- 🔴 Red : risque de remboursement → notification prioritaire "Appel dans la journée"

### 10.2 Pose du flag

- CSM et Alexia peuvent poser/modifier
- Notification automatique à Alexia sur orange ou rouge

---

## MODULE 11 — CHALLENGE & CLASSEMENT

### 11.1 Classement des élèves

- Score calculé (prospects, ventes, workbooks)
- Affichage dans un canal dédié

### 11.2 Connexion LinkedIn API

- Tracking auto des activités de prospection LinkedIn
- Données remontent dans le CRM

---

## MODULE 12 — CALENDRIER PARTAGÉ

- Calendrier commun visible par tous
- Dates des lives, appels planifiés
- Synchronisation dans l'app

---

## MODULE 13 — GESTION DES CSM

- Vue d'ensemble : quel CSM a quels clients
- Performances croisées : résultats des clients par CSM
- Accès CSM limité au CA Off-Market uniquement

---

## MODULE 14 — LEAD MAGNET / QUALIFICATION ENTRANTE

- Page publique ou lien LinkedIn → analyse auto du profil prospect
- Score ou évaluation du positionnement Off-Market
- Alexia valide ou non l'entrée sans appel de qualification complet

---

## PRIORITÉS

| Priorité        | Modules                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------ |
| 🔴 Critique     | Messagerie (notifs), Flags clients, Contrats, Commissions, Dashboard financier             |
| 🟠 Haute valeur | Workbooks + fusion transcript, Onboarding automatisé, Formulaire pré-call, IA briefing CSM |
| 🟡 V2           | Roadmap IA post-kickoff, FAQ log, Classement LinkedIn API, Lead magnet, Calendrier         |
