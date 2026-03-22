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

- [ ] Hero visible avec titre "Sors du marche visible"
- [ ] 2 CTA : "Postuler maintenant" et "Comment ca marche"
- [ ] 3 trust pills (Shield, Clock, Zap)
- [ ] 3 stats animees (35+, 10K, 97%)
- [ ] 6 cartes features
- [ ] 3 etapes "Comment ca marche"
- [ ] 3 cartes "Pourquoi Off-Market"
- [ ] 3 temoignages avec etoiles
- [ ] **FAQ accordeon** (6 questions, cliquer chaque question, une seule ouverte a la fois)
- [ ] CTA final "Postuler maintenant" → redirige vers `/signup`
- [ ] Footer : 3 colonnes, liens fonctionnels
- [ ] Lien "CGV" → `/cgv` (page charge sans login)
- [ ] Lien "Mentions legales" → `/mentions-legales`
- [ ] Lien "Confidentialite" → `/confidentialite`
- [ ] Lien "FAQ" dans la navbar scrolle vers la section FAQ
- [ ] **Mobile 375px** : menu hamburger, sections empilees, CTA visible

---

## 2. Auth — Login (`/login`)

- [ ] Formulaire email + mot de passe
- [ ] Toggle oeil pour voir/cacher le mot de passe
- [ ] Lien "Oublie ?" → `/forgot-password`
- [ ] **Bouton "Continuer avec Google"** visible (fond blanc, logo Google)
- [ ] **Bouton "Continuer avec Microsoft"** visible (fond blanc, logo Microsoft)
- [ ] Connexion avec bon email/mdp → redirige vers dashboard du role
- [ ] Connexion avec mauvais mdp → toast "Email ou mot de passe incorrect"
- [ ] Formulaire vide → validation native du navigateur
- [ ] **Titre "Connexion" visible sur mobile**
- [ ] Lien "S'inscrire" → `/signup`

---

## 3. Auth — Signup (`/signup`)

- [ ] 4 champs : Nom complet, Email, Mot de passe, **Confirmer le mot de passe**
- [ ] Toggle oeil independant sur chaque champ mot de passe
- [ ] **Case CGU** : "J'accepte les CGV et la politique de confidentialite"
- [ ] Liens CGV et confidentialite s'ouvrent dans un nouvel onglet
- [ ] **Bouton desactive** si CGU pas cochee
- [ ] Mot de passe < 6 chars → toast erreur
- [ ] Mots de passe differents → toast "Les mots de passe ne correspondent pas"
- [ ] **Erreurs Supabase en francais** (pas en anglais)
- [ ] **Boutons SSO Google/Microsoft** visibles
- [ ] **Titre "Inscription" visible sur mobile**

---

## 4. Auth — Register (`/register`)

- [ ] Sans `?code=` : message "Invitation requise" + lien vers `/signup`
- [ ] Avec code invalide : message "Invitation invalide"
- [ ] Avec code valide : formulaire 2 champs (mdp + confirmation)
- [ ] Toggle oeil independant par champ

---

## 5. Auth — Forgot Password (`/forgot-password`)

- [ ] Champ email + bouton "Envoyer le lien"
- [ ] Apres envoi : message "Email envoye" (meme si email n'existe pas = securise)
- [ ] Lien retour vers login

---

## 6. Onboarding (`/onboarding`)

- [ ] Redirection auto apres premiere connexion si `onboarding_completed = false`
- [ ] Barre de progression en haut
- [ ] Etape 1 : Video de bienvenue + bouton "C'est parti"
- [ ] Etape 2 : "Parle-nous de toi" (niche, revenus, objectifs, source)
- [ ] Validation des champs requis
- [ ] Navigation precedent/suivant
- [ ] Etape finale : confettis + badge "Newcomer"
- [ ] Bouton "Acceder a mon espace" → redirige vers dashboard

---

## 7. Dashboard Admin (`/admin/dashboard`)

- [ ] Message de salutation personnalise (Bonjour/Bon apres-midi + prenom)
- [ ] 4 KPI cartes (CA du mois, Eleves actifs, Nouveaux, LTV moyen)
- [ ] 4 cartes Row 2 (Retention, Churn, Taux closing, Completion formations)
- [ ] Graphique "Evolution CA" (AreaChart)
- [ ] Donut "CA par canal"
- [ ] Heatmap d'activite
- [ ] Leaderboard coaches
- [ ] Activity feed
- [ ] **Bouton Export** (Rapport PDF + Export CSV)
- [ ] Banniere d'alertes systeme (si eleves a risque)

---

## 8. CRM (`/admin/crm`)

- [ ] 4 onglets : Clients, Suivi Coaches, Pipeline Setter, Pipeline Closer
- [ ] **Mode Clients** : liste avec recherche, filtres par tag/flag
- [ ] Pastilles de flag colorees (vert/orange/rouge, animation ping sur rouge)
- [ ] Clic sur client → fiche detail avec 7 onglets
- [ ] **Mode Suivi Coaches** : 4 KPI + liste coaches extensible
- [ ] **Mode Pipeline Setter** : kanban avec colonnes, drag-and-drop
- [ ] Bouton "Nouveau prospect" → cree une carte
- [ ] **Mode Pipeline Closer** : kanban closer
- [ ] **Import CSV** : bouton importer → modal 4 etapes (fichier, colonnes, apercu, import)
- [ ] **Skeleton de chargement** visible quand on switch entre modes
- [ ] **Mobile** : onglets scrollables horizontalement

---

## 9. Fiche Contact Detail (`/admin/crm/[id]`)

- [ ] Header : avatar, nom, flag, tag engagement, email, telephone
- [ ] 5 cartes stats : Score sante, Engagement, Revenus, Inscription, Derniere activite
- [ ] **Onglet Apercu** : objectifs, programme, notes, progression pipeline
- [ ] **Onglet Business** : niche, CA actuel, objectif, LTV, barre progression
- [ ] **Onglet Timeline** : activites chronologiques
- [ ] **Onglet Notes** : ajout note (Entree), epinglage, affichage
- [ ] **Onglet Taches** : creation tache, completion (cercle vert + barre)
- [ ] **Onglet Drapeaux** : changement de flag + historique
- [ ] **Changement de flag** : selector → confirmation → toast

---

## 10. Messagerie (`/admin/messaging`)

- [ ] Sidebar canaux (publics # / prives verrou)
- [ ] Section DMs avec recherche
- [ ] Badges non-lu (compteur rouge)
- [ ] Clic canal → charge les messages
- [ ] **Envoi message** : taper + Entree
- [ ] **Formatage** : gras, italique, listes (boutons dans la barre)
- [ ] **Shift+Entree** = nouvelle ligne (pas envoyer)
- [ ] **Fichier joint** : bouton paperclip → upload + apercu
- [ ] **Message vocal** : bouton micro → enregistrement → envoi
- [ ] **Reactions** : bouton smile → 6 emojis rapides
- [ ] **Reponse** : bouton repondre → banniere citation
- [ ] **Fils (threads)** : bouton fil → panneau lateral
- [ ] **Epinglage** : bouton pin → barre des epingles en haut
- [ ] **Signets** : bouton bookmark → panneau signets
- [ ] **Recherche** : bouton loupe → filtre messages
- [ ] **Message urgent** : bouton alerte → fond rouge + badge URGENT
- [ ] **Templates** : bouton Zap → picker + gestion templates
- [ ] **@mention** : taper @ → autocomplete
- [ ] **Commandes IA** : taper /help → panneau commandes
- [ ] **Creation canal** : bouton + → modal (nom, description, public/prive, membres)
- [ ] **Parametres canal** : modal avec Sourdine, Epingler, Archiver, Membres

---

## 11. Formations / LMS (`/admin/school`)

- [ ] Liste des formations avec filtres (Toutes, En cours, Terminees, Non commencees)
- [ ] Barre de recherche
- [ ] Lien "Gerer les formations" → `/admin/school/admin`
- [ ] **Creation formation** : bouton + modal (titre, description)
- [ ] **Publier/Depublier** : toggle statut
- [ ] **Builder de cours** : modules + lecons, drag-and-drop
- [ ] **Types de lecons** : Texte, Video, Quiz, Exercice, PDF
- [ ] **Quiz builder** : 3 types (choix multiple, vrai/faux, reponse libre)
- [ ] **Prerequis** : configurer un cours requis avant un autre
- [ ] **Vue client** : progression, lecons verrouillees sequentiellement
- [ ] **Marquer lecon terminee** → barre progression augmente
- [ ] **Certificat** : genere a 100% de completion
- [ ] **Tracking temps** : le temps passe par lecon est enregistre

---

## 12. Appels & Calendrier (`/admin/calls`)

- [ ] 2 onglets : Appels et Lives
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

- [ ] Liste des formulaires avec filtres (Tous, Actifs, Fermes)
- [ ] **Nouveau formulaire** : galerie de templates → builder
- [ ] **Builder** : palette de champs a gauche, canvas central, drag-and-drop
- [ ] Types de champs : texte, email, choix unique/multiple, NPS, rating, scale, date, fichier, heading
- [ ] **Logique conditionnelle** : bouton GitBranch → config "si... alors..."
- [ ] **Apercu** : bouton oeil
- [ ] **Formulaire public** (`/f/[formId]`) : style Typeform, question par question
- [ ] Navigation Suivant/Precedent, barre de progression
- [ ] Toggle dark/light
- [ ] **Analytics** : vue tableau + vue fiches, export CSV/Markdown

---

## 18. Contrats & Facturation (`/admin/billing`)

- [ ] HeroMetric "Revenus du mois"
- [ ] 4 cartes stats (Encaisses, En attente, En retard, Contrats signes)
- [ ] Graphique Cash Flow
- [ ] Panneaux "Derniers contrats" et "Dernieres factures"
- [ ] **Export** : Rapport PDF + Factures CSV

### Contrats (`/admin/billing/contracts`)
- [ ] Liste avec filtres (Tous, Brouillons, Envoyes, Signes, Annules)
- [ ] Recherche
- [ ] **Nouveau contrat** : modal (template optionnel, client, titre, contenu)
- [ ] **Templates** : variables dynamiques {{nom}}, {{montant}}
- [ ] **Envoi** : passer de Brouillon a Envoye
- [ ] **Lien de signature** : copier le lien public
- [ ] **Signature publique** (`/contracts/[id]/sign`) : mode dessin + mode taper, theme dark
- [ ] **PDF contrat** : bouton telecharger

### Factures (`/admin/billing/invoices`)
- [ ] 4 KPI + 8 onglets de statut
- [ ] **Nouvelle facture** : lignes de facturation, quantite × prix, TVA (20%), remise
- [ ] Calcul auto : HT, TVA, TTC
- [ ] Workflow : Brouillon → Envoyee → Payee / En retard / Remboursee
- [ ] **Export PDF** facture individuelle
- [ ] **Bouton Payer** (Stripe) si configure
- [ ] **Echeanciers** : onglet Echeanciers

### Commissions (`/sales/commissions`)
- [ ] 4 KPI : Total gagne, A recevoir, Deja paye, Nb ventes
- [ ] Sections "A recevoir" et "Historique"

---

## 19. Communaute / Feed (`/admin/feed`)

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

- [ ] Bouton "Nouvelle annonce"
- [ ] 5 types : Info (bleu), Succes (vert), Attention (ambre), Urgent (rouge), Mise a jour (violet)
- [ ] Ciblage par role (multi-select)
- [ ] Toggle Actif/Inactif
- [ ] Modification et suppression (avec confirmation)

---

## 21. Communaute / Membres (`/admin/community`)

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

- [ ] **Profil** : nom, telephone, bio, avatar upload
- [ ] **Theme** : Clair, Sombre, Systeme
- [ ] **Mot de passe** : ancien + nouveau + confirmation
- [ ] **Notifications** : 9 toggles + digest email
- [ ] **Branding** (admin) : nom app, couleurs, police, border-radius, logo, favicon
- [ ] **API Keys** (admin) : creation, copie (visible une seule fois), revocation
- [ ] **Webhooks** (admin) : creation, toggle activation, suppression
- [ ] **Accessible depuis la nav sidebar** (pas de doublon)

---

## 26. Invitations (`/admin/invitations`)

- [ ] Liste avec filtres (all, pending, accepted, expired)
- [ ] **Nouvelle invitation** : email + role → toast succes
- [ ] **Email d'invitation envoye** (si Resend configure)
- [ ] Copie du lien d'invitation
- [ ] Suppression d'invitation

---

## 27. Gestion Utilisateurs (`/admin/users`)

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
- [ ] 6 cartes : Google Calendar, Stripe, Resend, Unipile, OpenRouter, Miro
- [ ] Badge "Configure" (vert) / "Non configure" (gris) pour chaque service
- [ ] Bouton "Connecter" pour Google Calendar

### Monitoring (`/admin/monitoring`)
- [ ] Statut systeme : badge vert/orange/rouge + latence DB
- [ ] Metriques d'usage : utilisateurs actifs, messages, appels, formulaires
- [ ] Logs recents
- [ ] Bouton "Verifier maintenant" → rafraichit tout

### Documentation API (`/admin/api-docs`)
- [ ] Liste des 6 endpoints documentes
- [ ] Sections : Authentification, Rate Limiting, Pagination
- [ ] Exemples de reponse JSON

---

## 29. Pages Legales (SANS connexion)

- [ ] `/cgv` : charge sans redirection vers login, contenu visible
- [ ] `/mentions-legales` : charge sans redirection
- [ ] `/confidentialite` : charge sans redirection

---

## 30. Profil Public (`/profile/[id]`)

- [ ] Accessible sans connexion
- [ ] Affiche : avatar, nom, bio, XP, niveau, badges, formations
- [ ] Si profil prive : message "Profil prive"

---

## 31. Health Check (`/api/health`)

- [ ] Retourne JSON : `{ status: "ok", checks: { database: { status, latency_ms } } }`
- [ ] Accessible sans authentification

---

## 32. Navigation Admin

- [ ] **Sidebar** : 4 sections (Pilotage, Contenu, Business, Administration)
- [ ] **Items** : Dashboard, CRM, Personnes, Appels, Messagerie, Finances, Formation, Feed, Ressources, AlexIA, Formulaires, Booking, Appels Closing, Facturation, Gamification, Annonces, Miro, Integrations, Monitoring, Documentation API, Reglages
- [ ] **Pas de doublon** "Parametres" en bas de sidebar
- [ ] **Collapse sidebar** : icones seules + tooltips
- [ ] **Mobile bottom nav** : Dashboard, CRM, Messagerie, Formation, Facturation
- [ ] **Menu hamburger** : ouvre sidebar complete

---

## 33. Responsive (375px)

- [ ] Landing : menu burger, FAQ, CTA, footer
- [ ] Login/Signup : titres visibles, boutons SSO
- [ ] Dashboard : KPIs en 2 colonnes
- [ ] CRM : onglets scrollables, pipeline scroll horizontal
- [ ] Messagerie : sidebar slide-in
- [ ] AlexIA : sidebar masquee, chat plein ecran
- [ ] Billing : header en colonne
- [ ] Calendar : vue jour forcee, semaine cachee

---

## 34. Securite

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
