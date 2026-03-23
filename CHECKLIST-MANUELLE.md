# Checklist de Test Manuel — Off-Market

> Date : 22 mars 2026 | CDC : 71/71 features couvertes
> URL : https://off-market-amber.vercel.app

---

## Comment utiliser ce fichier

Pour chaque item, teste manuellement et coche :
- [x] = OK
- [ ] = A tester
- BUG: description si probleme trouve

---

## 1. Landing Page (`/`)

- [ ok] Hero visible avec titre "Sors du marche visible"
- [ ok] 2 CTA : "Postuler maintenant" et "Comment ca marche"
- [ ok] 3 trust pills (Shield, Clock, Zap)
- [ok ] 3 stats animees (35+, 10K, 97%)
- [ok ] 6 cartes features
- [ ok] 3 etapes "Comment ca marche"
- [ ok] 3 cartes "Pourquoi Off-Market"
- [ ok] 3 temoignages avec etoiles
- [ok ] **FAQ accordeon** (6 questions, cliquer chaque question, une seule ouverte a la fois)
- [ok ] CTA final "Postuler maintenant" → redirige vers `/signup`
- [ok ] Footer : 3 colonnes, liens fonctionnels
- [ ok] Lien "CGV" → `/cgv` (page charge sans login)
- [ ok] Lien "Mentions legales" → `/mentions-legales`
- [ok ] Lien "Confidentialite" → `/confidentialite`
- [ ok] Lien "FAQ" dans la navbar scrolle vers la section FAQ
- [ok ] **Mobile 375px** : menu hamburger, sections empilees, CTA visible

---

## 2. Auth — Login (`/login`)

- [ ok] Formulaire email + mot de passe
- [ok] Toggle oeil pour voir/cacher le mot de passe
- [ ok] Lien "Oublie ?" → `/forgot-password`
- [ok ] **Bouton "Continuer avec Google"** visible (fond blanc, logo Google)
- [] **Bouton "Continuer avec Microsoft"** visible (fond blanc, logo Microsoft) on le fait pas celui la du coup vérifier a ce qu'il ne soit plus présent
- [ ok] Connexion avec bon email/mdp → redirige vers dashboard du role
- [ ok] Connexion avec mauvais mdp → toast "Email ou mot de passe incorrect"
- [ok ] Formulaire vide → validation native du navigateur
- [ ok] **Titre "Connexion" visible sur mobile**
- [ ok] Lien "S'inscrire" → `/signup`

---

## 3. Auth — Signup (`/signup`)

- [ ok] 4 champs : Nom complet, Email, Mot de passe, **Confirmer le mot de passe**
- [ ok] Toggle oeil independant sur chaque champ mot de passe
- [ ok] **Case CGU** : "J'accepte les CGV et la politique de confidentialite"
- [ ok] Liens CGV et confidentialite s'ouvrent dans un nouvel onglet
- [ ok] **Bouton desactive** si CGU pas cochee
- [ ok] Mot de passe < 6 chars → toast erreur
- [ ok] Mots de passe differents → toast "Les mots de passe ne correspondent pas"
- [ ok] **Erreurs Supabase en francais** (pas en anglais)
- [ ok] **Boutons SSO Google/Microsoft** visibles mais ne marche pas
- [ ok] **Titre "Inscription" visible sur mobile**

---

## 4. Auth — Register (`/register`)

- [ok ] Sans `?code=` : message "Invitation requise" + lien vers `/signup`
- [ok ] Avec code invalide : message "Invitation invalide"
- [ ok] Avec code valide : formulaire 2 champs (mdp + confirmation)
- [ok ] Toggle oeil independant par champ

---

## 5. Auth — Forgot Password (`/forgot-password`)

- [ ok] Champ email + bouton "Envoyer le lien"
- [ok ] Apres envoi : message "Email envoye" (meme si email n'existe pas = securise)
- [ok ] Lien retour vers login

---

## 6. Onboarding (`/onboarding`)

- [ok ] Redirection auto apres premiere connexion si `onboarding_completed = false`
- [ok ] Barre de progression en haut
- [ok ] Etape 1 : Video de bienvenue + bouton "C'est parti"
- [ok ] Etape 2 : "Parle-nous de toi" (niche, revenus, objectifs, source)
- [ ok] Validation des champs requis
- [ ok] Navigation precedent/suivant
- [ ok] Etape finale : confettis + badge "Newcomer"
- [ ok] Bouton "Acceder a mon espace" → redirige vers dashboard

---

## 7. Dashboard Admin (`/admin/dashboard`)

- [ok ] Message de salutation personnalise (Bonjour/Bon apres-midi + prenom)
- ok[ ] 4 KPI cartes (CA du mois, Eleves actifs, Nouveaux, LTV moyen)
- [ok ] 4 cartes Row 2 (Retention, Churn, Taux closing, Completion formations)
- [ok ] Graphique "Evolution CA" (AreaChart)
- [ok ] Donut "CA par canal"
- [ok ] Heatmap d'activite
- [ok ] Leaderboard coaches
- [ok ] Activity feed
- [ ] **Bouton Export** (Rapport PDF + Export CSV) il me retorune sa {"error":"Acces reserve aux administrateurs"}
- [ ok] Banniere d'alertes systeme (si eleves a risque)

---

## 8. CRM (`/admin/crm`)

- [ ok] 4 onglets : Clients, Suivi Coaches, Pipeline Setter, Pipeline Closer
- [ ] **Mode Clients** : liste avec recherche, filtres par tag/flag le filtre par segments s'affiche mal
- [ok ] Pastilles de flag colorees (vert/orange/rouge, animation ping sur rouge)
- [ok ] Clic sur client → fiche detail avec 7 onglets
- [ok ] **Mode Suivi Coaches** : 4 KPI + liste coaches extensible
- [ ok] **Mode Pipeline Setter** : kanban avec colonnes, drag-and-drop
- [ok ] Bouton "Nouveau prospect" → cree une carte
- [ ok] **Mode Pipeline Closer** : kanban closer
- [ ] **Import CSV** : bouton importer → modal 4 etapes (fichier, colonnes, apercu, import) je vois pas ou il est
- [ok ] **Skeleton de chargement** visible quand on switch entre modes
- [ ok] **Mobile** : onglets scrollables horizontalement

---

## 9. Fiche Contact Detail (`/admin/crm/[id]`)

- [ ok] Header : avatar, nom, flag, tag engagement, email, telephone
- [ ] 5 cartes stats : Score sante, Engagement, Revenus, Inscription, Derniere activite je vois pa inscription et derniere activite et quand je clique sur messaging sa ne m'ouvre pas la conversation avec la personne en question
- [ok ] **Onglet Apercu** : objectifs, programme, notes, progression pipeline
- [ ] **Onglet Business** : niche, CA actuel, objectif, LTV, barre progression ya pas de barre de progression
- [ ok] **Onglet Timeline** : activites chronologiques
- [ ok] **Onglet Notes** : ajout note (Entree), epinglage, affichage
- [ ok] **Onglet Taches** : creation tache, completion (cercle vert + barre)
- [ok ] **Onglet Drapeaux** : changement de flag + historique
- [ ok] **Changement de flag** : selector → confirmation → toast
B
---

## 10. Messagerie (`/admin/messaging`)

- [ ok] Sidebar canaux (publics # / prives verrou)
- [ok ] Section DMs avec recherche
- [] Badges non-lu (compteur rouge) c'est ok mais il y a un canal qui reste a 3 je ne sai spas pourquoi
- [ ok] Clic canal → charge les messages
- [ok ] **Envoi message** : taper + Entree
- [ok ] **Formatage** : gras, italique, listes (boutons dans la barre)
- [ok ] **Shift+Entree** = nouvelle ligne (pas envoyer)
- [ok ] **Fichier joint** : bouton paperclip → upload + apercu
- [] **Message vocal** : bouton micro → enregistrement → envoi ok mais je vois les message vocal qui dure tous 0 secondes
- [ok ] **Reactions** : bouton smile → 6 emojis rapides
- [ ] **Reponse** : bouton repondre → banniere citation ok mais quand je clique pour répondre a un message quand jenvoie le message rien ne montre que j'ai répondu a ce message je ne peux pas cliquer rapidement pour le retrouver
- [ ] **Fils (threads)** : bouton fil → panneau lateral vu que réponse ne marche pas sa ne marche pas en soit
- [ ok] **Epinglage** : bouton pin → barre des epingles en haut
- [ ] **Signets** : bouton bookmark → panneau signets ok mais par contre les images affiche juste Image
- [ ok] **Recherche** : bouton loupe → filtre messages
- [ ok] **Message urgent** : bouton alerte → fond rouge + badge URGENT
- [ ] **Templates** : bouton Zap → picker + gestion templates ok pour le template qui se place par contre le systeme ou on peut mettre {{nom}} par exemple ne amrche pas il affiche {{nom}} dans le message
- [ok] **@mention** : taper @ → autocomplete
- [ ] **Commandes IA** : taper /help → panneau commandes n'affiche rien
- [ok] **Creation canal** : bouton + → modal (nom, description, public/prive, membres)
- [ok] **Parametres canal** : modal avec Sourdine, Epingler, Archiver, Membres

---

## 11. Formations / LMS (`/admin/school`)

- [ok] Liste des formations avec filtres (Toutes, En cours, Terminees, Non commencees)
- [ok] Barre de recherche
- [ok] Lien "Gerer les formations" → `/admin/school/admin`
- [ok] **Creation formation** : bouton + modal (titre, description)
- [ ok] **Publier/Depublier** : toggle statut
- [] **Builder de cours** : modules + lecons, drag-and-drop je n'arrive pas a créer un cours sa charge a l'infini quand je clique sur enregistrer
- [ ] **Types de lecons** : Texte, Video, Quiz, Exercice, PDF il y a pas sa
- [ ] **Quiz builder** : 3 types (choix multiple, vrai/faux, reponse libre) je le vois pas en tout cas
- [ ] **Prerequis** : configurer un cours requis avant un autre je vois pas
- [ ] **Vue client** : progression, lecons verrouillees sequentiellement je n'arrive pas a voir la page d'une formation sa charge en boucle
- [ ] **Marquer lecon terminee** → barre progression augmente je vois pas
- [ ] **Certificat** : genere a 100% de completion je vois pas
- [ ] **Tracking temps** : le temps passe par lecon est enregistre je vois pas

---

## 12. Appels & Calendrier (`/admin/calls`)
je vois rien sa charge a l'infini
- [] 2 onglets : Appels et Lives sa charge a l'infini le panel
- [ ] **Appel instantane** : dropdown → "Appel instantane" → lien genere
- [ ] **Planifier appel** : modal (client, date, heure, duree)
- [ ] **Nouveau live** : modal (titre, date, duree)
- [ ] Filtres par statut (Tous, Planifies, Realises, Annules)
- [ ] Recherche
- [ ] Badge "Rejoindre" sur les appels du jour
- [ ] **Salle video** : WebRTC, camera/micro, partage ecran
- [ ] **Enregistrement** : bouton enregistrer → arret → **bouton Transcrire** (Whisper)
- [ ] **Calendrier** : vue jour, ~~semaine~~, mois (semaine cachee sur mobile)
- [ ] Navigation fleches + bouton "Aujourd'hui"
- [ ] Double-clic jour en vue mois → bascule vue jour

---

## 13. Gamification (`/client/gamification`)
charge a linfini
- [ ] Carte Niveau avec barre XP et progression
- [ ] Carte Streak (flamme coloree si actif, grise sinon)
- [ ] 3 mini-cartes stats (XP Total, Badges gagnes, Recompenses)
- [ ] **Onglet Badges** : distinction obtenu (coche verte) / verrouille (cadenas gris)
- [ ] **Onglet Recompenses** : bouton "Echanger" actif si XP suffisant, "XP insuffisant" sinon
- [ ] **Echange** : clic Echanger → toast succes → apparait dans Historique
- [ ] **Onglet Classement** : top 10 avec medailles or/argent/bronze, "(toi)" surligne
- [ ] **Onglet Historique** : statuts colores (En attente ambre, Approuve vert, Refuse rouge)

---

## 14. Journal (`/client/journal`)

- [ ] Bouton "Ecrire" → compositeur
- [ ] 3 stats : Entrees, Jours de suite, Humeur moy.
- [ ] **Prompt du jour** : carte coloree + bouton shuffle + "Utiliser ce prompt"
- [ ] **Templates** : Libre, Gratitude, Reflexion, Objectifs, Victoires
- [ ] **Creation entree** : titre + contenu + humeur (emoji) + tags + toggle partage coach
- [ ] **Edition** : clic crayon → formulaire pre-rempli
- [ ] **Suppression** : clic corbeille → disparition
- [ ] **Partage coach** : toggle Prive/Partage → toast confirmation
- [ ] **Recherche** + **filtre par humeur** + **filtre par tag**
- [ ] **Export PDF** : bouton → panneau dates → telecharger
- [ ] **Vue coach** (`/coach/journal`) : seules les entrees partagees visibles

---

## 15. Check-ins (`/client/checkin`)

- [ ] **Check-in quotidien** (NOUVEAU) : carte avec onglets Matin/Soir
  - [ ] Matin : energie slider, mood emoji, objectif du jour, priorite
  - [ ] Soir : victoire, apprentissages, challenges, gratitude
  - [ ] Si deja fait : coche verte + lecture seule
- [ ] **Check-in hebdomadaire** (existant) : formulaire multi-etapes
- [ ] **Vue coach** (`/coach/checkins`) : tous les check-ins clients

---

## 16. Objectifs (`/client/goals`)

- [ ] 3 stats : En cours, Termines, Progression %
- [ ] Onglets : En cours, Tous
- [ ] Barre de progression par objectif
- [ ] **Milestones** (NOUVEAU) : checkboxes sous chaque objectif
- [ ] Ajout de milestone inline
- [ ] **Difficulte** (NOUVEAU) : barre 1-5 coloree
- [ ] **Notes coach** visibles
- [ ] Boutons : Mettre a jour progression, Terminer, Pause, Abandonner

---

## 17. Formulaires (`/admin/forms`)

- [ ok] Liste des formulaires avec filtres (Tous, Actifs, Fermes)
- [ok ] **Nouveau formulaire** : galerie de templates → builder
- [ ok] **Builder** : palette de champs a gauche, canvas central, drag-and-drop
- [ ok] Types de champs : texte, email, choix unique/multiple, NPS, rating, scale, date, fichier, heading
- [ok ] **Logique conditionnelle** : bouton GitBranch → config "si... alors..."
- [ ok] **Apercu** : bouton oeil
- [ ok] **Formulaire public** (`/f/[formId]`) : style Typeform, question par question
- [ok ] Navigation Suivant/Precedent, barre de progression
- [ ok] Toggle dark/light
- [ ] **Analytics** : vue tableau + vue fiches, export CSV/Markdown je ne vois pas + je ne peux pas mettre les formulaire en publique

---

## 18. Contrats & Facturation (`/admin/billing`) a revoir

- [ok ] HeroMetric "Revenus du mois"
- [ ok] 4 cartes stats (Encaisses, En attente, En retard, Contrats signes)
- [ ] Graphique Cash Flow
- [ ] Panneaux "Derniers contrats" et "Dernieres factures"
- [ ] **Export** : Rapport PDF + Factures CSV

### Contrats (`/admin/billing/contracts`) a revoir
- [ ] Liste avec filtres (Tous, Brouillons, Envoyes, Signes, Annules)
- [ ] Recherche
- [ ] **Nouveau contrat** : modal (template optionnel, client, titre, contenu)
- [ ] **Templates** : variables dynamiques {{nom}}, {{montant}}
- [ ] **Envoi** : passer de Brouillon a Envoye
- [ ] **Lien de signature** : copier le lien public
- [ ] **Signature publique** (`/contracts/[id]/sign`) : mode dessin + mode taper, theme dark
- [ ] **PDF contrat** : bouton telecharger

### Factures (`/admin/billing/invoices`) a revoir
- [ ] 4 KPI + 8 onglets de statut
- [ ] **Nouvelle facture** : lignes de facturation, quantite × prix, TVA (20%), remise
- [ ] Calcul auto : HT, TVA, TTC
- [ ] Workflow : Brouillon → Envoyee → Payee / En retard / Remboursee
- [ ] **Export PDF** facture individuelle
- [ ] **Bouton Payer** (Stripe) si configure
- [ ] **Echeanciers** : onglet Echeanciers

### Commissions (`/sales/commissions`) sa nexiste pas
- [ ] 4 KPI : Total gagne, A recevoir, Deja paye, Nb ventes
- [ ] Sections "A recevoir" et "Historique"

---

## 19. Communaute / Feed (`/admin/feed`)
charge longtemps a revoir
- [ ] Composeur de post (texte + type)
- [ ] Types : Victoire (WinComposer structure), Question, Experience, General
- [ ] Filtres : Tout, Annonces, Victoires, Questions, Experiences, General
- [ ] Tri : Recents, Tendances, Plus aimes
- [ ] **Likes** : toggle coeur rouge / vide
- [ ] **Commentaires** : section extensible
- [ ] **Infinite scroll** : charge plus de posts au scroll
- [ ] **Sidebar tendances** (desktop)
- [ ] **Signalement** : bouton report

---

## 20. Annonces (`/admin/announcements`)
charge longtemps a revoir
- [ ] Bouton "Nouvelle annonce"
- [ ] 5 types : Info (bleu), Succes (vert), Attention (ambre), Urgent (rouge), Mise a jour (violet)
- [ ] Ciblage par role (multi-select)
- [ ] Toggle Actif/Inactif
- [ ] Modification et suppression (avec confirmation)

---

## 21. Communaute / Membres (`/admin/community`)
n'est pas présent dans la sidebar + charge a l'infini
- [ ] Repertoire des membres avec avatar, nom, XP, badges
- [ ] Recherche par nom
- [ ] Filtre par role
- [ ] Tri : par niveau, par nom, recent
- [ ] Vue grille / vue liste
- [ ] **"(Toi)"** surligne pour l'utilisateur courant
- [ ] Clic → profil du membre

---

## 22. Booking (`/admin/booking`)

- [ ] KPIs booking (vues, reservations, taux conversion)
- [ ] Liste des pages de booking
- [ ] Gestion des disponibilites
- [ ] **Page publique** (`/book/[slug]`) : accessible SANS connexion
  - [ ] 4 etapes : Infos → Date → Heure → Confirmation
  - [ ] Validation du champ nom requis
  - [ ] Validation des champs custom required
  - [ ] Calendrier : jours passes grises
  - [ ] Creneaux horaires
  - [ ] Confirmation avec resume

---

## 23. AlexIA — IA (`/admin/ai`)

- [ ] **Modal de consentement RGPD** au premier acces (pas d'auto-accept)
- [ ] Apres acceptation : interface de chat
- [ ] 6 suggestions de prompts
- [ ] Envoi message → reponse IA en Markdown
- [ ] **Sidebar conversations** : creation, navigation, suppression
- [ ] **Toggle sidebar** : bouton fermer/ouvrir
- [ ] **Sidebar masquee sur mobile** par defaut
- [ ] **Onglet Configuration** (admin) : 3 panneaux
  - [ ] Base de connaissances : upload docs
  - [ ] Config IA : ton, instructions, message d'accueil
  - [ ] Memoire clients

---

## 24. Ressources (`/admin/resources`)

- [ ] Liste avec 7 filtres categories
- [ ] Recherche
- [ ] **Upload** : bouton "Ajouter" → zone depot fichier, titre auto, categorie, visibilite
- [ ] Fichier > 50Mo refuse
- [ ] **Telechargement** : compteur incremente
- [ ] **Epinglage** : menu contextuel (3 points) → pin
- [ ] **Menu contextuel visible sur touch** (pas besoin de hover)
- [ ] **Vue client** : ressources "staff" invisibles, pas de bouton upload

---

## 25. Parametres (`/admin/settings`)

- [ ] **Profil** : nom, telephone, bio, avatar upload on peut pas sauvegarder et mettre une photo
- [ ok] **Theme** : Clair, Sombre, Systeme
- [ ] **Mot de passe** : ancien + nouveau + confirmation comment faire si connecter via google ?
- [ ] **Notifications** : 9 toggles + digest email ne fait rien quand je clique
- [ ] **Branding** (admin) : nom app, couleurs, police, border-radius, logo, favicon je vois pas
- [ ] **API Keys** (admin) : creation, copie (visible une seule fois), revocation je vois pas
- [ ] **Webhooks** (admin) : creation, toggle activation, suppression je vois pas
- [ok] **Accessible depuis la nav sidebar** (pas de doublon) 

---

## 26. Invitations (`/admin/invitations`) c'est ok mais c'est dans https://off-market-amber.vercel.app/admin/personnes

- [ ] Liste avec filtres (all, pending, accepted, expired)
- [ ] **Nouvelle invitation** : email + role → toast succes
- [ ] **Email d'invitation envoye** (si Resend configure)
- [ ] Copie du lien d'invitation
- [ ] Suppression d'invitation

---

## 27. Gestion Utilisateurs (`/admin/users`) ne se trouve pas dans la sidebar charge a l'infini

- [ ] Tableau avec filtres (Actifs, Archives, Tous)
- [ ] Recherche par nom/email
- [ ] **Changement de role** : clic sur badge role → select
- [ ] **Archivage** : bouton archive → confirmation → disparait des actifs
- [ ] **Restauration** : dans Archives → bouton restaurer
- [ ] **Selection multiple** + actions en masse
- [ ] **Offboarding** : bouton → wizard

---

## 28. Nouvelles Pages Admin

### Integrations (`/admin/integrations`)
- [ ok] 6 cartes : Google Calendar, Stripe, Resend, Unipile, OpenRouter, Miro
- [ok ] Badge "Configure" (vert) / "Non configure" (gris) pour chaque service
- [ ] Bouton "Connecter" pour Google Calendar Vous ne pouvez pas vous connecter, car cette appli a envoyé une demande non valide. Vous pouvez réessayer plus tard ou contacter le développeur à propos de ce problème. En savoir plus sur cette erreur
Si vous avez développé cette appli, consultez les détails de l'erreur.
Erreur 400 : redirect_uri_mismatch quand j'essaie de me connecter

### Monitoring (`/admin/monitoring`) sa marche vraiment ?
- [ok ] Statut systeme : badge vert/orange/rouge + latence DB
- [ ok] Metriques d'usage : utilisateurs actifs, messages, appels, formulaires
- [ok ] Logs recents
- [ok ] Bouton "Verifier maintenant" → rafraichit tout

### Documentation API (`/admin/api-docs`)
- [ ] Liste des 6 endpoints documentes juste il y a un texte jaune sur du jaune on voit mal mais sinon c'es tok
- [ok] Sections : Authentification, Rate Limiting, Pagination
- [ ok] Exemples de reponse JSON

---

## 29. Pages Legales (SANS connexion)

- [ok] `/cgv` : charge sans redirection vers login, contenu visible
- [ ok] `/mentions-legales` : charge sans redirection
- [ ok] `/confidentialite` : charge sans redirection

---

## 30. Profil Public (`/profile/[id]`) check de ton coté

- [ ] Accessible sans connexion
- [ ] Affiche : avatar, nom, bio, XP, niveau, badges, formations
- [ ] Si profil prive : message "Profil prive"

---

## 31. Health Check (`/api/health`)

- [ ] Retourne JSON : `{ status: "ok", checks: { database: { status, latency_ms } } }` check de ton coté
- [ ] Accessible sans authentification check de ton coté

---

## 32. Navigation Admin check de ton coté

- [ ] **Sidebar** : 4 sections (Pilotage, Contenu, Business, Administration)
- [ ] **Items** : Dashboard, CRM, Personnes, Appels, Messagerie, Finances, Formation, Feed, Ressources, AlexIA, Formulaires, Booking, Appels Closing, Facturation, Gamification, Annonces, Miro, Integrations, Monitoring, Documentation API, Reglages
- [ ] **Pas de doublon** "Parametres" en bas de sidebar
- [ ] **Collapse sidebar** : icones seules + tooltips
- [ ] **Mobile bottom nav** : Dashboard, CRM, Messagerie, Formation, Facturation
- [ ] **Menu hamburger** : ouvre sidebar complete

---

## 33. Responsive (375px) check de ton coté

- [ ] Landing : menu burger, FAQ, CTA, footer
- [ ] Login/Signup : titres visibles, boutons SSO
- [ ] Dashboard : KPIs en 2 colonnes
- [ ] CRM : onglets scrollables, pipeline scroll horizontal
- [ ] Messagerie : sidebar slide-in
- [ ] AlexIA : sidebar masquee, chat plein ecran
- [ ] Billing : header en colonne
- [ ] Calendar : vue jour forcee, semaine cachee

---

## 34. Securite check de ton coté

- [ ] Pages protegees redirigent vers `/login` sans auth
- [ ] Client ne peut pas acceder a `/admin/*`
- [ ] Setter/Closer ne peut pas acceder a `/client/*`
- [ ] API routes verifient l'authentification
- [ ] `/api/health` accessible sans auth
- [ ] Rate limiting sur les API (tester requetes rapides)
- [ ] 2FA TOTP fonctionne (si active dans Supabase)

---

## Resultats

| Section | Tests | OK | Bugs |
|---------|-------|-----|------|
| Landing | 16 | | |
| Auth | 25 | | |
| Onboarding | 8 | | |
| Dashboard | 10 | | |
| CRM | 14 | | |
| Fiche Contact | 10 | | |
| Messagerie | 22 | | |
| LMS | 13 | | |
| Appels | 12 | | |
| Gamification | 8 | | |
| Journal | 11 | | |
| Check-ins | 5 | | |
| Objectifs | 7 | | |
| Formulaires | 12 | | |
| Facturation | 20 | | |
| Communaute | 15 | | |
| Booking | 10 | | |
| AlexIA | 9 | | |
| Ressources | 7 | | |
| Parametres | 8 | | |
| Invitations | 5 | | |
| Utilisateurs | 7 | | |
| Nouvelles pages | 8 | | |
| Pages legales | 3 | | |
| Profil public | 3 | | |
| Navigation | 6 | | |
| Responsive | 8 | | |
| Securite | 7 | | |
| **TOTAL** | **~300** | | |
