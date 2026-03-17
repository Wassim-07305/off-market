# Off-Market — Plan de Tests E2E

> Genere apres exploration manuelle de l'application deployee sur https://off-market-amber.vercel.app
> Date : 2026-03-17

## Comptes de test

| Role   | Email                 | Mot de passe      | Nom reel      | Espace  |
| ------ | --------------------- | ----------------- | ------------- | ------- |
| Admin  | admin@offmarket.fr    | TestAdmin2026!    | Alexia Laneau | /admin  |
| Coach  | coach@offmarket.fr    | TestCoach2026!    | Sophie Martin | /coach  |
| Client | prospect@offmarket.fr | TestProspect2026! | Thomas Dupont | /client |

> Note : admin@offmarket.fr redirige vers /admin/dashboard (Alexia Laneau, role admin).
> coach@offmarket.fr redirige vers /coach/dashboard (Sophie Martin, role coach).
> prospect@offmarket.fr redirige vers /client/dashboard (Thomas Dupont, role client).

---

## Scenario 1 : Authentification

### Test 1.1 : Login admin reussi

- **Precondition** : Utilisateur deconnecte
- **Etape 1** : Naviguer vers `/login`
- **Etape 2** : Remplir le champ "Email" (placeholder `ton@email.com`) avec `admin@offmarket.fr`
- **Etape 3** : Remplir le champ "Mot de passe" (placeholder `••••••••`) avec `TestAdmin2026!`
- **Etape 4** : Cliquer sur le bouton "Se connecter"
- **Resultat attendu** : Redirection vers `/admin/dashboard`, sidebar avec "Alexia Laneau / Admin" visible
- **DB check** : `SELECT id, full_name, role FROM profiles WHERE email = 'admin@offmarket.fr';`

### Test 1.2 : Login coach reussi

- **Precondition** : Utilisateur deconnecte
- **Etape 1** : Naviguer vers `/login`
- **Etape 2** : Remplir "Email" avec `coach@offmarket.fr`
- **Etape 3** : Remplir "Mot de passe" avec `TestCoach2026!`
- **Etape 4** : Cliquer sur "Se connecter"
- **Resultat attendu** : Redirection vers `/coach/dashboard`, sidebar avec "Sophie Martin / Coach" visible
- **DB check** : `SELECT id, full_name, role FROM profiles WHERE email = 'coach@offmarket.fr';`

### Test 1.3 : Login client reussi

- **Precondition** : Utilisateur deconnecte
- **Etape 1** : Naviguer vers `/login`
- **Etape 2** : Remplir "Email" avec `prospect@offmarket.fr`
- **Etape 3** : Remplir "Mot de passe" avec `TestProspect2026!`
- **Etape 4** : Cliquer sur "Se connecter"
- **Resultat attendu** : Redirection vers `/client/dashboard`, sidebar avec "Thomas Dupont / Client" visible

### Test 1.4 : Login avec mauvais mot de passe

- **Etape 1** : Naviguer vers `/login`
- **Etape 2** : Remplir "Email" avec `admin@offmarket.fr`
- **Etape 3** : Remplir "Mot de passe" avec `mauvais_mdp`
- **Etape 4** : Cliquer sur "Se connecter"
- **Resultat attendu** : Rester sur `/login`, message d'erreur affiché, pas de redirection

### Test 1.5 : Login avec email inexistant

- **Etape 1** : Naviguer vers `/login`
- **Etape 2** : Remplir "Email" avec `inconnu@test.fr`
- **Etape 3** : Remplir "Mot de passe" avec `nimporte`
- **Etape 4** : Cliquer sur "Se connecter"
- **Resultat attendu** : Rester sur `/login`, message d'erreur affiché

### Test 1.6 : Deconnexion

- **Precondition** : Utilisateur connecte comme coach
- **Etape 1** : Cliquer sur le bouton "Déconnexion" dans la sidebar
- **Resultat attendu** : Redirection vers `/login`, session supprimee

### Test 1.7 : Acces sans authentification redirige vers login

- **Etape 1** : Naviguer directement vers `/admin/dashboard` sans etre connecte
- **Resultat attendu** : Redirection vers `/login`

### Test 1.8 : Acces a un espace d'un autre role redirige

- **Precondition** : Connecte comme client (prospect@offmarket.fr)
- **Etape 1** : Naviguer vers `/admin/dashboard`
- **Resultat attendu** : Redirection vers `/client/dashboard` ou `/login` (pas acces admin)

### Test 1.9 : Lien "Oublié ?" disponible

- **Etape 1** : Naviguer vers `/login`
- **Etape 2** : Verifier presence du lien "Oublie ?"
- **Resultat attendu** : Lien visible, clic navigue vers `/forgot-password`

### Test 1.10 : Lien "S'inscrire" disponible

- **Etape 1** : Naviguer vers `/login`
- **Etape 2** : Verifier presence du lien "S'inscrire"
- **Resultat attendu** : Lien visible, clic navigue vers `/signup`

### Test 1.11 : Toggle visibilite mot de passe

- **Etape 1** : Naviguer vers `/login`
- **Etape 2** : Remplir "Mot de passe" avec `TestAdmin2026!`
- **Etape 3** : Cliquer sur le bouton icone "oeil" a droite du champ mot de passe
- **Resultat attendu** : Le texte du mot de passe devient visible (type=text)

---

## Scenario 2 : Dashboard Admin

### Test 2.1 : KPIs affiches sur le dashboard admin

- **Precondition** : Connecte comme admin@offmarket.fr
- **Etape 1** : Naviguer vers `/admin/dashboard`
- **Resultat attendu** : Les 4 cartes KPI sont visibles — "CA du mois", "Eleves actifs", "Nouveaux ce mois", "LTV moyen"

### Test 2.2 : Metriques secondaires presentes

- **Etape 1** : Verifier la presence des 4 metriques : "Retention", "Churn", "Taux closing", "Completion formations"
- **Resultat attendu** : Les 4 pourcentages sont affiches

### Test 2.3 : Graphique "Evolution CA" visible

- **Etape 1** : Verifier la presence de la section "Evolution CA"
- **Resultat attendu** : Graphique en barres affiche pour les 6 derniers mois

### Test 2.4 : Graphique "CA par canal" visible

- **Etape 1** : Verifier la presence de la section "CA par canal"
- **Resultat attendu** : Graphique camembert visible avec legende

### Test 2.5 : Comparaison de periodes fonctionnelle

- **Etape 1** : Localiser la section "Comparaison de periodes"
- **Etape 2** : Modifier la date de "Periode 1" (textbox date, ref e430)
- **Etape 3** : Modifier la date de "Periode 2" (textbox date, ref e436)
- **Resultat attendu** : Les valeurs des metriques (Revenus, Nouveaux clients, Appels, Lecons) se mettent a jour

### Test 2.6 : Rapport IA hebdomadaire visible

- **Etape 1** : Verifier la section "Rapport IA hebdomadaire"
- **Resultat attendu** : Section avec bouton "Regenerer" visible

### Test 2.7 : Bouton "Voir les alertes" fonctionnel

- **Etape 1** : Localiser la banniere d'alertes ("15 alertes systeme")
- **Etape 2** : Cliquer sur "Voir les alertes"
- **Resultat attendu** : Navigation ou modal d'alertes s'ouvre

### Test 2.8 : Sidebar admin contient tous les liens

- **Etape 1** : Verifier la presence de chaque lien dans la navigation :
  Dashboard, CRM, Clients, Messagerie, Formation, Formulaires, Facturation, Contenu, Feed, Appels, Disponibilites, Assistant IA, Invitations, Ressources, Recompenses, Badges, Moderation, Calendrier, Equipe CSM, Analytics, Audit, FAQ / Base IA, Upsell, Parametres
- **Resultat attendu** : Tous les 24 liens sont presents

### Test 2.9 : Bouton "Reduire" sidebar

- **Etape 1** : Cliquer sur le bouton "Reduire" dans la sidebar
- **Resultat attendu** : La sidebar se reduit (labels des menus disparaissent ou sidebar se retrecit)

---

## Scenario 3 : CRM (Admin)

### Test 3.1 : Page CRM chargee avec vue Pipeline

- **Precondition** : Connecte comme admin
- **Etape 1** : Naviguer vers `/admin/crm`
- **Resultat attendu** : Titre "CRM" visible, sous-titre "Pipeline commercial", boutons de vue (Pipeline, Timeline, Par Coach, Leads, Relances)

### Test 3.2 : Vue Pipeline affiche les colonnes Kanban

- **Etape 1** : Sur `/admin/crm`, verifier que la vue "Pipeline" est active
- **Resultat attendu** : 5 colonnes visibles : "Prospect", "Qualifie", "Proposition", "Closing", "Client", "Perdu" avec compteurs

### Test 3.3 : Creer un nouveau contact CRM

- **Etape 1** : Cliquer sur le bouton "+ Contact"
- **Etape 2** : Remplir le formulaire du modal (nom, email, telephone, valeur estimee)
- **Etape 3** : Soumettre le formulaire
- **Resultat attendu** : Le contact apparait dans la colonne "Prospect" du Kanban
- **DB check** : `SELECT * FROM crm_contacts WHERE full_name = 'Test Contact E2E' ORDER BY created_at DESC LIMIT 1;`

### Test 3.4 : Enrichir un contact via Apify

- **Etape 1** : Localiser un contact dans le Kanban (ex: "213321" dans "Qualifie")
- **Etape 2** : Cliquer sur le bouton "Enrichir via Apify" du contact
- **Resultat attendu** : Bouton cliquable (peut afficher un loader ou message)

### Test 3.5 : Bouton "Enrichir tout"

- **Etape 1** : Cliquer sur le bouton "Enrichir tout" en haut du pipeline
- **Resultat attendu** : Action lancee (loader ou notification)

### Test 3.6 : Bouton "Importer CSV"

- **Etape 1** : Cliquer sur le bouton "Importer CSV"
- **Resultat attendu** : Modal ou dialogue d'import CSV s'ouvre

### Test 3.7 : Bouton "Segments"

- **Etape 1** : Cliquer sur le bouton "Segments" (avec chevron dropdown)
- **Resultat attendu** : Menu dropdown de segments s'ouvre

### Test 3.8 : Switcher vers vue "Timeline"

- **Etape 1** : Cliquer sur le bouton "Timeline"
- **Resultat attendu** : Vue timeline des contacts s'affiche

### Test 3.9 : Switcher vers vue "Par Coach"

- **Etape 1** : Cliquer sur le bouton "Par Coach"
- **Resultat attendu** : Vue regroupee par coach s'affiche

### Test 3.10 : Switcher vers vue "Leads"

- **Etape 1** : Cliquer sur le bouton "Leads"
- **Resultat attendu** : Vue liste des leads s'affiche

### Test 3.11 : Switcher vers vue "Relances"

- **Etape 1** : Cliquer sur le bouton "Relances"
- **Resultat attendu** : Vue des relances planifiees s'affiche

### Test 3.12 : Cliquer sur un contact ouvre sa fiche

- **Etape 1** : Cliquer sur la carte du contact "213321" dans la colonne "Qualifie"
- **Resultat attendu** : Fiche detail du contact s'ouvre (modal ou page)

---

## Scenario 4 : Clients (Admin)

### Test 4.1 : Page Clients chargee

- **Precondition** : Connecte comme admin
- **Etape 1** : Naviguer vers `/admin/clients`
- **Resultat attendu** : Titre "Clients", sous-titre "0 clients", barre de recherche, filtres par segment

### Test 4.2 : Ajouter un client

- **Etape 1** : Cliquer sur le bouton "Ajouter"
- **Etape 2** : Remplir les champs du formulaire (nom, email, etc.)
- **Etape 3** : Soumettre
- **Resultat attendu** : Client ajoute et visible dans la liste, compteur mis a jour
- **DB check** : `SELECT * FROM profiles WHERE role = 'client' ORDER BY created_at DESC LIMIT 1;`

### Test 4.3 : Export de la liste clients

- **Etape 1** : Cliquer sur le bouton "Export"
- **Resultat attendu** : Fichier CSV telecharge avec les donnees clients

### Test 4.4 : Recherche d'un client

- **Etape 1** : Taper "Thomas" dans le champ "Rechercher un client..."
- **Resultat attendu** : La liste est filtree, seuls les clients correspondants sont affiches

### Test 4.5 : Filtres par segment fonctionnels

- **Etape 1** : Cliquer successivement sur "VIP", "Standard", "Nouveau", "A risque", "Perdu"
- **Resultat attendu** : La liste se filtre a chaque clic

### Test 4.6 : Dropdown "Segments"

- **Etape 1** : Cliquer sur le bouton "Segments" (avec chevron)
- **Resultat attendu** : Menu de gestion des segments s'ouvre

---

## Scenario 5 : Messagerie

### Test 5.1 : Page Messagerie (Coach) chargee

- **Precondition** : Connecte comme coach@offmarket.fr
- **Etape 1** : Naviguer vers `/coach/messaging`
- **Resultat attendu** : Panneau de gauche avec "Canaux" et "Messages directs", canal "General" actif par defaut

### Test 5.2 : Switcher entre onglets Off-Market / Boite unifiee

- **Etape 1** : Cliquer sur "Boite unifiee"
- **Resultat attendu** : Vue boite unifiee s'affiche

### Test 5.3 : Envoyer un message dans le canal General

- **Etape 1** : Cliquer sur le canal "General" dans la sidebar gauche
- **Etape 2** : Taper un message dans le textbox "Message General..."
- **Etape 3** : Cliquer sur le bouton "Envoyer"
- **Resultat attendu** : Message apparait dans la conversation
- **DB check** : `SELECT * FROM messages WHERE channel_id = (SELECT id FROM channels WHERE name = 'General') ORDER BY created_at DESC LIMIT 1;`

### Test 5.4 : Envoyer un message vocal

- **Etape 1** : Cliquer sur le bouton "Message vocal"
- **Resultat attendu** : Interface d'enregistrement vocal s'ouvre

### Test 5.5 : Attacher un fichier

- **Etape 1** : Cliquer sur le bouton "Joindre un fichier"
- **Resultat attendu** : Dialogue de selection de fichier s'ouvre

### Test 5.6 : Boutons de mise en forme (gras, italique, barre)

- **Etape 1** : Cliquer sur "Gras", "Italique", "Barre"
- **Resultat attendu** : Le texte dans le champ de saisie prend la mise en forme correspondante

### Test 5.7 : Templates / Reponses rapides

- **Etape 1** : Cliquer sur le bouton "Templates / Reponses rapides"
- **Resultat attendu** : Modal avec liste de templates s'ouvre

### Test 5.8 : Emoji picker

- **Etape 1** : Cliquer sur le bouton "Emoji"
- **Resultat attendu** : Selecteur d'emoji s'ouvre

### Test 5.9 : GIF picker

- **Etape 1** : Cliquer sur le bouton "GIF"
- **Resultat attendu** : Selecteur de GIF s'ouvre

### Test 5.10 : Marquer comme urgent

- **Etape 1** : Cliquer sur "Marquer comme urgent"
- **Resultat attendu** : Le message est marque comme urgent (icone ou label)

### Test 5.11 : Programmer un message

- **Etape 1** : Cliquer sur "Programmer"
- **Resultat attendu** : Modal de planification de message s'ouvre

### Test 5.12 : Rechercher un message direct

- **Etape 1** : Taper "Alexia" dans le champ "Rechercher..."
- **Resultat attendu** : La liste est filtree

### Test 5.13 : Ouvrir une conversation directe

- **Etape 1** : Cliquer sur "Alexia Laneau" dans la liste des messages directs
- **Resultat attendu** : La conversation avec Alexia s'ouvre

### Test 5.14 : Vue mosaique des messages directs

- **Etape 1** : Cliquer sur le bouton "Vue mosaïque" a cote de "Messages directs"
- **Resultat attendu** : Les messages directs s'affichent en mosaique

### Test 5.15 : Creer un nouveau canal

- **Etape 1** : Cliquer sur le bouton "+" a cote de "Canaux"
- **Resultat attendu** : Modal de creation de canal s'ouvre

---

## Scenario 6 : Formation (LMS)

### Test 6.1 : Page Formation (Coach) chargee

- **Precondition** : Connecte comme coach@offmarket.fr
- **Etape 1** : Naviguer vers `/coach/school`
- **Resultat attendu** : Titre "Formation", lien "Gerer les formations", liste des formations disponibles

### Test 6.2 : Filtres de formations

- **Etape 1** : Cliquer successivement sur "Toutes", "En cours", "Terminées", "Non commencées"
- **Resultat attendu** : La liste se filtre a chaque clic

### Test 6.3 : Recherche de formation

- **Etape 1** : Taper "111" dans "Rechercher une formation..."
- **Resultat attendu** : Seule la formation "111" s'affiche

### Test 6.4 : Acces a la page d'administration des formations

- **Etape 1** : Cliquer sur "Gerer les formations"
- **Resultat attendu** : Navigation vers `/coach/school/admin`

### Test 6.5 : Cliquer sur une formation ouvre le detail

- **Etape 1** : Cliquer sur la formation "111"
- **Resultat attendu** : Navigation vers `/coach/school/{id}` avec detail de la formation

### Test 6.6 : Page Formation (Client) chargee

- **Precondition** : Connecte comme prospect@offmarket.fr
- **Etape 1** : Naviguer vers `/client/school`
- **Resultat attendu** : Meme liste de formations, sans le lien "Gerer les formations"
- **DB check** : `SELECT id, title, description FROM formations ORDER BY created_at DESC LIMIT 5;`

---

## Scenario 7 : Contenu Social

### Test 7.1 : Page Contenu (Coach) chargee

- **Precondition** : Connecte comme coach@offmarket.fr
- **Etape 1** : Naviguer vers `/coach/content`
- **Resultat attendu** : Titre "Contenu", compteurs de statuts (Brouillons, Planifies, Publies, Archives, par reseau), board Kanban vide

### Test 7.2 : Creer un nouveau contenu

- **Etape 1** : Cliquer sur "Nouveau contenu"
- **Etape 2** : Remplir le formulaire (titre, plateforme Instagram/LinkedIn/TikTok, contenu, date de publication)
- **Etape 3** : Soumettre
- **Resultat attendu** : Carte apparait dans la colonne "Brouillon" du board
- **DB check** : `SELECT * FROM social_content ORDER BY created_at DESC LIMIT 1;`

### Test 7.3 : Vue Calendrier du contenu

- **Etape 1** : Cliquer sur le bouton "Calendrier"
- **Resultat attendu** : Vue calendrier des contenus planifies s'affiche

### Test 7.4 : Filtres par plateforme

- **Etape 1** : Cliquer sur "Instagram", "LinkedIn", "TikTok", "Tout"
- **Resultat attendu** : Le board Kanban filtre selon la plateforme selectionnee

### Test 7.5 : Colonnes du board Kanban

- **Etape 1** : Verifier la presence des 4 colonnes : "Brouillon", "Planifie", "Publie", "Archive"
- **Resultat attendu** : Les 4 colonnes sont presentes avec leur compteur

---

## Scenario 8 : Feed Social

### Test 8.1 : Page Feed (Coach) chargee

- **Precondition** : Connecte comme coach@offmarket.fr
- **Etape 1** : Naviguer vers `/coach/feed`
- **Resultat attendu** : Zone de publication, filtres de categories, section "Tendances"

### Test 8.2 : Publier un post

- **Etape 1** : Cliquer dans le textbox "Partagez quelque chose avec la communaute..."
- **Etape 2** : Taper un message de test
- **Etape 3** : Selectionner une categorie (ex: "🏆 Victoires")
- **Etape 4** : Cliquer sur le bouton de publication (soumettre)
- **Resultat attendu** : Le post apparait dans le feed
- **DB check** : `SELECT * FROM feed_posts ORDER BY created_at DESC LIMIT 1;`

### Test 8.3 : Filtres du feed

- **Etape 1** : Cliquer successivement sur "Tout", "🏆 Victoires", "❓ Questions", "💡 Experiences", "💬 General"
- **Resultat attendu** : Le feed est filtre selon la categorie

### Test 8.4 : Tri du feed

- **Etape 1** : Cliquer sur "Recents", "Tendances", "Plus aimes"
- **Resultat attendu** : L'ordre des posts change selon le critere

---

## Scenario 9 : Appels (Coach)

### Test 9.1 : Page Appels (Coach) chargee

- **Precondition** : Connecte comme coach@offmarket.fr
- **Etape 1** : Naviguer vers `/coach/calls`
- **Resultat attendu** : Titre "Appels", vue hebdomadaire avec les 7 jours de la semaine, bouton "Nouvel appel"

### Test 9.2 : Creer un nouvel appel

- **Etape 1** : Cliquer sur "Nouvel appel"
- **Etape 2** : Remplir le formulaire (client, date/heure, type d'appel)
- **Etape 3** : Soumettre
- **Resultat attendu** : L'appel apparait dans le calendrier hebdomadaire
- **DB check** : `SELECT * FROM closer_calls ORDER BY created_at DESC LIMIT 1;`

### Test 9.3 : Navigation semaine precedente/suivante

- **Etape 1** : Cliquer sur le bouton ">" (semaine suivante)
- **Resultat attendu** : La semaine affichee avance d'une semaine
- **Etape 2** : Cliquer sur "<" (semaine precedente)
- **Resultat attendu** : Retour a la semaine precedente

### Test 9.4 : Bouton "Aujourd'hui"

- **Etape 1** : Naviguer a une autre semaine, puis cliquer "Aujourd'hui"
- **Resultat attendu** : Retour a la semaine courante

### Test 9.5 : Switcher vue "Liste"

- **Etape 1** : Cliquer sur le bouton "Liste"
- **Resultat attendu** : Vue liste des appels s'affiche

### Test 9.6 : Switcher vue "Stats"

- **Etape 1** : Cliquer sur le bouton "Stats"
- **Resultat attendu** : Vue statistiques des appels s'affiche

---

## Scenario 10 : Check-ins (Coach)

### Test 10.1 : Page Check-ins (Coach) chargee

- **Precondition** : Connecte comme coach@offmarket.fr
- **Etape 1** : Naviguer vers `/coach/checkins`
- **Resultat attendu** : Titre "Check-ins clients", KPIs (Total, Humeur moy., Energie moy., Moral bas), liste vide

### Test 10.2 : Recherche de client dans les check-ins

- **Etape 1** : Taper dans "Rechercher un client..."
- **Resultat attendu** : La liste se filtre

### Test 10.3 : Filtres par humeur

- **Etape 1** : Cliquer sur "Moral bas", puis "Moral haut"
- **Resultat attendu** : La liste se filtre selon l'humeur

---

## Scenario 11 : Communaute (Coach)

### Test 11.1 : Page Communaute (Coach) chargee

- **Precondition** : Connecte comme coach@offmarket.fr
- **Etape 1** : Naviguer vers `/coach/community`
- **Resultat attendu** : Titre "Communaute", "14 membres", liste des membres avec niveaux/XP

### Test 11.2 : Recherche d'un membre

- **Etape 1** : Taper "Thomas" dans "Rechercher un membre..."
- **Resultat attendu** : La liste est filtree

### Test 11.3 : Filtre par role

- **Etape 1** : Changer le combobox "Tous les roles" vers "Coach"
- **Resultat attendu** : Seuls les coaches sont affiches

### Test 11.4 : Tri des membres

- **Etape 1** : Changer le combobox "Par niveau" vers "Par XP", "Par nom", "Recent"
- **Resultat attendu** : L'ordre de la liste change

### Test 11.5 : Cliquer sur un profil membre

- **Etape 1** : Cliquer sur le membre "Thomas Dupont"
- **Resultat attendu** : Navigation vers `/coach/profile/{id}`

---

## Scenario 12 : Calendrier (Coach)

### Test 12.1 : Page Calendrier (Coach) chargee

- **Precondition** : Connecte comme coach@offmarket.fr
- **Etape 1** : Naviguer vers `/coach/calendar`
- **Resultat attendu** : Titre "Calendrier", vue mois, bouton "Evenement"

### Test 12.2 : Creer un evenement depuis le bouton principal

- **Etape 1** : Cliquer sur "Evenement"
- **Etape 2** : Remplir le formulaire (titre, date, heure, type Session/Appel/Événement)
- **Etape 3** : Soumettre
- **Resultat attendu** : Evenement apparait dans le calendrier
- **DB check** : `SELECT * FROM call_calendar ORDER BY created_at DESC LIMIT 1;`

### Test 12.3 : Creer un evenement depuis un jour

- **Etape 1** : Cliquer sur un bouton "+ Ajouter" d'un jour specifique
- **Resultat attendu** : Modal de creation avec la date pre-remplie

### Test 12.4 : Switcher entre vues Mois / Semaine / Jour

- **Etape 1** : Cliquer successivement sur "Mois", "Semaine", "Jour"
- **Resultat attendu** : La vue du calendrier change

### Test 12.5 : Navigation entre mois

- **Etape 1** : Cliquer sur "<" pour aller au mois precedent
- **Etape 2** : Cliquer sur ">" pour aller au mois suivant
- **Resultat attendu** : Le mois change et la grille se met a jour

---

## Scenario 13 : Check-in Client

### Test 13.1 : Page Check-in (Client) chargee

- **Precondition** : Connecte comme prospect@offmarket.fr
- **Etape 1** : Naviguer vers `/client/checkin`
- **Resultat attendu** : Titre "Check-in hebdomadaire", KPIs, historique d'humeur sur 12 semaines, tabs Bien-etre/Business/Gratitudes/Objectifs/Bilan

### Test 13.2 : Remplir un check-in (etape Bien-etre)

- **Etape 1** : Cliquer sur "😊 Bien" dans "Comment te sens-tu ?"
- **Etape 2** : Cliquer sur "💪 En forme" dans "Niveau d'energie"
- **Etape 3** : Cliquer sur "Suivant"
- **Resultat attendu** : Passage a l'etape suivante (Business)

### Test 13.3 : Completer et soumettre le check-in

- **Etape 1** : Parcourir toutes les etapes du check-in
- **Etape 2** : Soumettre le check-in
- **Resultat attendu** : Check-in enregistre, KPIs mis a jour, historique ajoute
- **DB check** : `SELECT * FROM journal_entries WHERE profile_id = '5fd740bb-84f9-43b3-80e9-64a71a53fcf6' ORDER BY created_at DESC LIMIT 1;`

### Test 13.4 : Historique de check-ins affiche

- **Etape 1** : Verifier la section "Historique"
- **Resultat attendu** : Les semaines precedentes sont affichees avec les humeurs

---

## Scenario 14 : Journal (Client)

### Test 14.1 : Page Journal (Client) chargee

- **Precondition** : Connecte comme prospect@offmarket.fr
- **Etape 1** : Naviguer vers `/client/journal`
- **Resultat attendu** : Titre "Journal", statistiques (Entrees, Jours de suite, Humeur moy.), prompt du jour, templates

### Test 14.2 : Creer une entree de journal

- **Etape 1** : Cliquer sur le bouton "Ecrire"
- **Etape 2** : Remplir le modal/formulaire de journal
- **Etape 3** : Soumettre
- **Resultat attendu** : Entree ajoutee au journal, compteur "Entrees" incremente
- **DB check** : `SELECT * FROM journal_entries WHERE profile_id = '5fd740bb-84f9-43b3-80e9-64a71a53fcf6' ORDER BY created_at DESC LIMIT 1;`

### Test 14.3 : Utiliser un prompt du jour

- **Etape 1** : Cliquer sur "Utiliser ce prompt"
- **Resultat attendu** : Le prompt est pre-rempli dans le formulaire d'ecriture

### Test 14.4 : Nouveau prompt

- **Etape 1** : Cliquer sur "Nouveau prompt"
- **Resultat attendu** : Un nouveau prompt s'affiche

### Test 14.5 : Selectionner un template

- **Etape 1** : Cliquer sur "✏️ Libre", "🙏 Gratitude", "🪞 Reflexion", "🎯 Objectifs", "🏆 Victoires"
- **Resultat attendu** : Le template est selectionne et applique au formulaire

---

## Scenario 15 : Objectifs (Client)

### Test 15.1 : Page Objectifs (Client) chargee

- **Precondition** : Connecte comme prospect@offmarket.fr
- **Etape 1** : Naviguer vers `/client/goals`
- **Resultat attendu** : Titre "Mes objectifs", KPIs (En cours, Termines, Progression), tabs "En cours" et "Tous"

### Test 15.2 : Onglets des objectifs

- **Etape 1** : Cliquer sur "Tous (0)"
- **Resultat attendu** : Vue "Tous" s'affiche

---

## Scenario 16 : Dashboard Client

### Test 16.1 : Dashboard Client complet

- **Precondition** : Connecte comme prospect@offmarket.fr
- **Etape 1** : Naviguer vers `/client/dashboard`
- **Resultat attendu** :
  - Salutation "Bonjour Thomas !"
  - Banniere d'onboarding (si non complete)
  - Section "Premiers pas" avec 6 etapes et XP
  - Section "Prochaines etapes"
  - Section "Formations en cours"
  - Section "Objectifs actifs"
  - Section "Journal recent"
  - Section "Badges obtenus"
  - Section "Actualites"

### Test 16.2 : Lien "Continuer" l'onboarding

- **Etape 1** : Cliquer sur "Continuer" dans la banniere d'onboarding
- **Resultat attendu** : Navigation vers `/client/onboarding`

### Test 16.3 : Liens des etapes d'onboarding

- **Etape 1** : Cliquer sur "Completer ton profil" → vers `/client/settings`
- **Etape 2** : Cliquer sur "Definir tes objectifs" → vers `/client/goals`
- **Etape 3** : Cliquer sur "Premier check-in" → vers `/client/checkin`
- **Etape 4** : Cliquer sur "Explorer la formation" → vers `/client/school`
- **Resultat attendu** : Chaque lien navigue vers la bonne page

### Test 16.4 : Sidebar Client contient tous les liens

- **Etape 1** : Verifier la presence de tous les liens :
  Dashboard, Formation, Messagerie, Formulaires, Contrats, Factures, Feed, Check-in, Journal, Objectifs, Certificats, Progression, Defis, Classement, Recompenses, Roadmap, Communaute, Hall of Fame, Ressources, Reserver, Appels
- **Resultat attendu** : Les 21 liens sont presents

---

## Scenario 17 : Formulaires (Client)

### Test 17.1 : Page Formulaires (Client) chargee

- **Precondition** : Connecte comme prospect@offmarket.fr
- **Etape 1** : Naviguer vers `/client/forms`
- **Resultat attendu** : Page chargee sans erreur, liste des formulaires assignes

---

## Scenario 18 : Contrats (Client)

### Test 18.1 : Page Contrats (Client) chargee

- **Precondition** : Connecte comme prospect@offmarket.fr
- **Etape 1** : Naviguer vers `/client/contracts`
- **Resultat attendu** : Page chargee sans erreur, liste des contrats du client

---

## Scenario 19 : Factures (Client)

### Test 19.1 : Page Factures (Client) chargee

- **Precondition** : Connecte comme prospect@offmarket.fr
- **Etape 1** : Naviguer vers `/client/invoices`
- **Resultat attendu** : Page chargee sans erreur, liste des factures du client

---

## Scenario 20 : Navigation et UX globale

### Test 20.1 : Mode "Ne pas deranger" (Do Not Disturb)

- **Precondition** : N'importe quel role connecte
- **Etape 1** : Cliquer sur le bouton "Activer Ne pas deranger" dans le header
- **Resultat attendu** : Mode Ne pas deranger active (icone change, notifications suspendues)

### Test 20.2 : Panneau Notifications

- **Etape 1** : Cliquer sur le bouton "Notifications" dans le header
- **Resultat attendu** : Panneau de notifications s'ouvre/se ferme

### Test 20.3 : Bouton profil utilisateur dans le header

- **Etape 1** : Cliquer sur le bouton du profil (initiales ou avatar) dans le header
- **Resultat attendu** : Menu ou modal du profil s'ouvre

### Test 20.4 : Page Parametres (Coach)

- **Precondition** : Connecte comme coach@offmarket.fr
- **Etape 1** : Cliquer sur "Paramètres" dans la sidebar
- **Resultat attendu** : Navigation vers `/coach/settings`, page de parametres chargee

### Test 20.5 : Page Parametres (Client)

- **Precondition** : Connecte comme prospect@offmarket.fr
- **Etape 1** : Cliquer sur "Paramètres" dans la sidebar
- **Resultat attendu** : Navigation vers `/client/settings`

### Test 20.6 : Disponibilites (Coach)

- **Precondition** : Connecte comme coach@offmarket.fr
- **Etape 1** : Cliquer sur "Disponibilites" dans la sidebar
- **Resultat attendu** : Navigation vers `/coach/settings/availability`

---

## Scenario 21 : Pages avec erreurs identifiees

> Ces pages renvoient une erreur "TypeError: Cannot read properties of undefined" et doivent etre corrigees.

### Test 21.1 : Page Seances (Coach) — bug identifie

- **Precondition** : Connecte comme coach@offmarket.fr
- **Etape 1** : Naviguer vers `/coach/sessions`
- **Resultat attendu (actuel)** : Page d'erreur "Erreur — Espace Coach" avec TypeError
- **Resultat attendu (cible)** : Page des seances de coaching chargee sans erreur
- **Action requise** : Corriger le bug TypeError dans le composant Seances

### Test 21.2 : Page Alertes (Coach) — bug identifie

- **Precondition** : Connecte comme coach@offmarket.fr
- **Etape 1** : Naviguer vers `/coach/alerts`
- **Resultat attendu (actuel)** : Page d'erreur "Erreur — Espace Coach" avec TypeError
- **Resultat attendu (cible)** : Page des alertes chargee avec la liste des alertes clients
- **Action requise** : Corriger le bug TypeError dans le composant Alertes

---

## Scenario 22 : Pages Admin supplementaires

### Test 22.1 : Page Facturation (Admin)

- **Precondition** : Connecte comme admin@offmarket.fr
- **Etape 1** : Naviguer vers `/admin/billing`
- **Resultat attendu** : Page de facturation chargee sans erreur

### Test 22.2 : Page Formulaires (Admin)

- **Etape 1** : Naviguer vers `/admin/forms`
- **Resultat attendu** : Page du form builder chargee

### Test 22.3 : Page Invitations (Admin)

- **Etape 1** : Naviguer vers `/admin/invitations`
- **Resultat attendu** : Page de gestion des invitations chargee

### Test 22.4 : Page Ressources (Admin)

- **Etape 1** : Naviguer vers `/admin/resources`
- **Resultat attendu** : Page des ressources chargee

### Test 22.5 : Page Recompenses (Admin)

- **Etape 1** : Naviguer vers `/admin/rewards`
- **Resultat attendu** : Page de gestion des recompenses chargee

### Test 22.6 : Page Badges (Admin)

- **Etape 1** : Naviguer vers `/admin/badges`
- **Resultat attendu** : Page de gestion des badges chargee

### Test 22.7 : Page Moderation (Admin)

- **Etape 1** : Naviguer vers `/admin/moderation`
- **Resultat attendu** : Page de moderation du feed chargee

### Test 22.8 : Page Equipe CSM (Admin)

- **Etape 1** : Naviguer vers `/admin/csm`
- **Resultat attendu** : Page de gestion de l'equipe CSM chargee

### Test 22.9 : Page Analytics (Admin)

- **Etape 1** : Naviguer vers `/admin/analytics`
- **Resultat attendu** : Page analytique avec graphiques chargee

### Test 22.10 : Page Audit (Admin)

- **Etape 1** : Naviguer vers `/admin/audit`
- **Resultat attendu** : Journal d'audit charge

### Test 22.11 : Page FAQ / Base IA (Admin)

- **Etape 1** : Naviguer vers `/admin/faq`
- **Resultat attendu** : Page FAQ et base de connaissances IA chargee

### Test 22.12 : Page Upsell (Admin)

- **Etape 1** : Naviguer vers `/admin/upsell`
- **Resultat attendu** : Page Upsell chargee

---

## Scenario 23 : Securite et controle d'acces

### Test 23.1 : Client ne peut pas acceder aux pages admin

- **Precondition** : Connecte comme prospect@offmarket.fr
- **Etape 1** : Naviguer directement vers `/admin/clients`
- **Resultat attendu** : Redirection vers `/client/dashboard` ou `/login`, pas acces aux donnees admin

### Test 23.2 : Client ne peut pas acceder aux pages coach

- **Precondition** : Connecte comme prospect@offmarket.fr
- **Etape 1** : Naviguer directement vers `/coach/crm`
- **Resultat attendu** : Redirection vers `/client/dashboard` ou `/login`

### Test 23.3 : Coach ne peut pas acceder aux pages admin

- **Precondition** : Connecte comme coach@offmarket.fr
- **Etape 1** : Naviguer directement vers `/admin/billing`
- **Resultat attendu** : Redirection vers `/coach/dashboard` ou `/login`

### Test 23.4 : Erreurs DB 403 identifies

- **Observation** : Des erreurs 403 Supabase RLS sont presentes sur plusieurs pages :
  - `crm_contacts?select=pipeline_stage` (CRM admin et coach)
  - `profiles` (clients listing)
  - `course_prerequisites`
  - `activity_logs`
  - `journal_entries`
- **Action requise** : Verifier et corriger les politiques RLS Supabase pour ces tables

---

## Scenario 24 : Pages Client supplementaires

### Test 24.1 : Page Certificats

- **Precondition** : Connecte comme prospect@offmarket.fr
- **Etape 1** : Naviguer vers `/client/certificates`
- **Resultat attendu** : Page chargee, liste des certificats obtenus

### Test 24.2 : Page Progression

- **Etape 1** : Naviguer vers `/client/progress`
- **Resultat attendu** : Page de progression globale chargee avec graphiques

### Test 24.3 : Page Defis

- **Etape 1** : Naviguer vers `/client/challenges`
- **Resultat attendu** : Liste des defis disponibles et actifs

### Test 24.4 : Page Classement

- **Etape 1** : Naviguer vers `/client/leaderboard`
- **Resultat attendu** : Tableau de classement des membres par XP

### Test 24.5 : Page Recompenses (Client)

- **Etape 1** : Naviguer vers `/client/rewards`
- **Resultat attendu** : Liste des recompenses disponibles et gagnees

### Test 24.6 : Page Roadmap (Client)

- **Etape 1** : Naviguer vers `/client/roadmap`
- **Resultat attendu** : Feuille de route du client affichee

### Test 24.7 : Page Communaute (Client)

- **Etape 1** : Naviguer vers `/client/community`
- **Resultat attendu** : Liste des membres de la communaute

### Test 24.8 : Page Hall of Fame (Client)

- **Etape 1** : Naviguer vers `/client/hall-of-fame`
- **Resultat attendu** : Hall of Fame avec les meilleurs membres

### Test 24.9 : Page Ressources (Client)

- **Etape 1** : Naviguer vers `/client/resources`
- **Resultat attendu** : Bibliotheque de ressources

### Test 24.10 : Page Reserver (Client)

- **Etape 1** : Naviguer vers `/client/booking`
- **Resultat attendu** : Interface de reservation de seances

### Test 24.11 : Page Appels (Client)

- **Etape 1** : Naviguer vers `/client/calls`
- **Resultat attendu** : Historique et prochains appels du client

---

## Annexe : Requetes DB de reference

```sql
-- Lister tous les utilisateurs et leurs roles
SELECT id, full_name, email, role FROM profiles ORDER BY role, full_name;

-- Contacts CRM
SELECT id, full_name, email, pipeline_stage, estimated_value FROM crm_contacts ORDER BY created_at DESC;

-- Formations
SELECT id, title, description, created_at FROM formations ORDER BY created_at DESC;

-- Messages du canal General
SELECT m.*, p.full_name as sender_name
FROM messages m
JOIN profiles p ON p.id = m.sender_id
WHERE m.channel_id = (SELECT id FROM channels WHERE name = 'General')
ORDER BY m.created_at DESC LIMIT 10;

-- Check-ins journal
SELECT * FROM journal_entries ORDER BY created_at DESC LIMIT 10;

-- Objectifs coaching
SELECT * FROM coaching_sessions ORDER BY created_at DESC LIMIT 10;

-- Appels enregistres
SELECT * FROM closer_calls ORDER BY created_at DESC LIMIT 10;

-- Contenus sociaux
SELECT * FROM social_content ORDER BY created_at DESC LIMIT 10;

-- Verifier politiques RLS
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## Resume des bugs detectes lors de l'exploration

| Page                       | URL                               | Erreur                                              | Priorite      |
| -------------------------- | --------------------------------- | --------------------------------------------------- | ------------- |
| Seances (Coach)            | `/coach/sessions`                 | `TypeError: Cannot read properties of undefined`    | P0 - Critique |
| Alertes (Coach)            | `/coach/alerts`                   | `TypeError: Cannot read properties of undefined`    | P0 - Critique |
| CRM (Admin + Coach)        | `/admin/crm`, `/coach/crm`        | Erreur 403 Supabase sur `crm_contacts`              | P1 - Haut     |
| Clients (Admin)            | `/admin/clients`                  | Erreur 403 Supabase sur `profiles` (role=client)    | P1 - Haut     |
| Formation (Coach + Client) | `/coach/school`, `/client/school` | Erreur 403 sur `course_prerequisites`               | P2 - Moyen    |
| Dashboard Client           | `/client/dashboard`               | Erreur 403 sur `activity_logs` et `journal_entries` | P1 - Haut     |
