 PLAN DE TEST — Parcours Complet CDC                                                
                                                                                     
  PARCOURS 1 : Lead Magnet → Prospect (pages publiques, sans compte)

  ┌─────┬───────────────────────┬─────────────────┬──────────────────────────────┐   
  │  #  │        Action         │      Route      │           Verifier           │   
  ├─────┼───────────────────────┼─────────────────┼──────────────────────────────┤   
  │ 1.1 │ Ouvrir le lead magnet │ /lead-magnet    │ Page s'affiche, formulaire   │   ok
  │     │                       │                 │ visible                      │   
  ├─────┼───────────────────────┼─────────────────┼──────────────────────────────┤   
  │ 1.2 │ Remplir nom, email,   │                 │ Validation Zod fonctionne,   │   ok
  │     │ tel, CA, objectifs    │                 │ boutons CA cliquables        │   
  ├─────┼───────────────────────┼─────────────────┼──────────────────────────────┤   
  │ 1.3 │ Soumettre             │                 │ Vue de succes affichee, lead │   k
  │     │                       │                 │  cree en DB (crm_contacts)   │   
  ├─────┼───────────────────────┼─────────────────┼──────────────────────────────┤   
  │ 1.4 │ Ouvrir le             │ /mini-challenge │ Landing page avec 5 jours,   │   
  │     │ mini-challenge        │                 │ formulaire inscription       │   ok
  ├─────┼───────────────────────┼─────────────────┼──────────────────────────────┤   
  │     │ S'inscrire au         │                 │ Formulaire soumis, vue       │   
  │ 1.5 │ mini-challenge        │                 │ confirmation, CTA "Se        │   
  │     │                       │                 │ connecter"                   │   pas de domaine donc mail s'e,vpoe pas mais ok
  ├─────┼───────────────────────┼─────────────────┼──────────────────────────────┤   
  │ 1.6 │ Ouvrir la page de     │ /book/[slug]    │ Calendrier de dispo visible, │   
  │     │ booking publique      │                 │  creneaux selectionnables    │   ok
  └─────┴───────────────────────┴─────────────────┴──────────────────────────────┘   

  ---
  PARCOURS 2 : Admin — Setup initial

  Connexion : /login avec compte admin

  ┌──────┬──────────────┬──────────────────────────┬─────────────────────────────┐   
  │  #   │    Action    │          Route           │          Verifier           │   
  ├──────┼──────────────┼──────────────────────────┼─────────────────────────────┤   
  │      │ Dashboard    │                          │ KPIs affiches (CA, clients  │   
  │ 2.1  │ admin        │ /admin/dashboard         │ actifs, retention, LTV,     │   ok
  │      │              │                          │ churn)                      │   
  ├──────┼──────────────┼──────────────────────────┼─────────────────────────────┤   
  │ 2.2  │ Creer un     │ /admin/users             │ Inviter un utilisateur avec │   ok
  │      │ coach        │                          │  role "coach", email envoye │   
  ├──────┼──────────────┼──────────────────────────┼─────────────────────────────┤   
  │ 2.3  │ Creer un     │ /admin/users             │ Inviter avec role "setter"  │   ok
  │      │ setter       │                          │                             │   
  ├──────┼──────────────┼──────────────────────────┼─────────────────────────────┤   
  │ 2.4  │ Creer un     │ /admin/users             │ Inviter avec role "closer"  │   
  │      │ closeur      │                          │                             │   ok
  ├──────┼──────────────┼──────────────────────────┼─────────────────────────────┤   
  │ 2.5  │ Configurer   │ /admin/settings >        │ Logo, couleurs, nom de      │   
  │      │ branding     │ Branding                 │ l'app modifiables           │   ok
  ├──────┼──────────────┼──────────────────────────┼─────────────────────────────┤   
  │      │ Creer un     │                          │ Variables dynamiques,       │   
  │ 2.6  │ template de  │ /admin/billing/templates │ apercu                      │   
  │      │ contrat      │                          │                             │   k
  ├──────┼──────────────┼──────────────────────────┼─────────────────────────────┤   
  │ 2.7  │ Configurer   │ /admin/badges            │ XP config, badges, niveaux  │   
  │      │ gamification │                          │ visibles                    │   ok
  ├──────┼──────────────┼──────────────────────────┼─────────────────────────────┤   
  │ 2.8  │ Configurer   │ /admin/commissions       │ Regles par role (fixe, %,   │   
  │      │ commissions  │                          │ paliers)                    │   
  ├──────┼──────────────┼──────────────────────────┼─────────────────────────────┤   
  │ 2.9  │ Configurer   │ /admin/ai                │ AlexIA knowledge base,      │   
  │      │ base IA      │                          │ ajout documents             │   ok
  ├──────┼──────────────┼──────────────────────────┼─────────────────────────────┤   
  │ 2.10 │ Creer une    │ /admin/school > Builder  │ Parcours > Module > Lecon   │   
  │      │ formation    │                          │ (video/texte), prerequis    │   ok
  ├──────┼──────────────┼──────────────────────────┼─────────────────────────────┤   
  │ 2.11 │ Uploader une │ /admin/resources         │ Fichier uploade, categorie, │   
  │      │  ressource   │                          │  visibilite                 │   ok
  ├──────┼──────────────┼──────────────────────────┼─────────────────────────────┤   
  │      │ Creer un     │                          │ Defi                        │   
  │ 2.12 │ challenge    │ /admin/challenges        │ hebdo/mensuel/communautaire │   
  │      │              │                          │  avec XP                    │   
  └──────┴──────────────┴──────────────────────────┴─────────────────────────────┘   

  ---
  PARCOURS 3 : Admin — Onboarding d'un client (CDC 6.1)

  ┌─────┬──────────────────┬───────────────────────────┬─────────────────────────┐   
  │  #  │      Action      │           Route           │        Verifier         │   
  ├─────┼──────────────────┼───────────────────────────┼─────────────────────────┤   
  │ 3.1 │ Inviter un       │ /admin/invitations        │ Email d'invitation      │   
  │     │ client           │                           │ envoye                  │   ok
  ├─────┼──────────────────┼───────────────────────────┼─────────────────────────┤   
  │ 3.2 │ Attribuer un     │ /admin/crm > fiche client │ Coach assigne visible   │   ok
  │     │ coach au client  │                           │                         │   
  ├─────┼──────────────────┼───────────────────────────┼─────────────────────────┤   
  │     │ Generer un       │                           │ Template rempli,        │   
  │ 3.3 │ contrat          │ Fiche client > Contrat    │ variables dynamiques    │   ok
  │     │                  │                           │ injectees               │   
  ├─────┼──────────────────┼───────────────────────────┼─────────────────────────┤   
  │ 3.4 │ Client signe le  │ /contracts/[id]/sign      │ Signature pad,          │   ok
  │     │ contrat          │ (public)                  │ horodatage, PDF genere  │   
  ├─────┼──────────────────┼───────────────────────────┼─────────────────────────┤   
  │ 3.5 │ Creer une        │ /admin/billing/invoices   │ Numerotation auto, PDF  │   
  │     │ facture          │                           │ telechar.               │   ok
  ├─────┼──────────────────┼───────────────────────────┼─────────────────────────┤   
  │ 3.6 │ Configurer       │ Fiche facture             │ Paiement 1x, 3x, 6x...  │   logique est faites ?
  │     │ echeancier       │                           │                         │   
  ├─────┼──────────────────┼───────────────────────────┼─────────────────────────┤   
  │     │ Verifier         │                           │ Sequences configurees   │   
  │ 3.7 │ relances         │ /admin/billing > Relances │ (J-3, J, J+3, J+7,      │   
  │     │                  │                           │ J+14)                   │   logiques est faites ?
  └─────┴──────────────────┴───────────────────────────┴─────────────────────────┘   

  ---
  PARCOURS 4 : Coach — Gestion quotidienne (CDC 4)

  Connexion : /login avec compte coach

  ┌─────┬───────────────┬─────────────────────┬──────────────────────────────────┐   
  │  #  │    Action     │        Route        │             Verifier             │   
  ├─────┼───────────────┼─────────────────────┼──────────────────────────────────┤   
  │ 4.1 │ Dashboard     │ /coach/dashboard    │ Clients attribues, stats, code   │   ok
  │     │ coach         │                     │ couleur (vert/orange/rouge)      │   
  ├─────┼───────────────┼─────────────────────┼──────────────────────────────────┤   
  │     │ Ouvrir fiche  │                     │ Infos, historique seances,       │   
  │ 4.2 │ client        │ /coach/crm/[id]     │ notes, objectifs, check-ins,     │   ok
  │     │               │                     │ paiements                        │   
  ├─────┼───────────────┼─────────────────────┼──────────────────────────────────┤   
  │ 4.3 │ Fixer un      │ Fiche client >      │ Objectif cree avec statut "En    │   
  │     │ objectif      │ Objectifs           │ cours"                           │   
  ├─────┼───────────────┼─────────────────────┼──────────────────────────────────┤   
  │     │ Ecrire une    │ /coach/calls ou     │ Note sauvegardee (mode prive ou  │   
  │ 4.4 │ note de       │ fiche client        │ partage)          ok               │   
  │     │ seance        │                     │                                  │   
  ├─────┼───────────────┼─────────────────────┼──────────────────────────────────┤   
  │ 4.5 │ Verifier les  │ /coach/alerts ou    │ Alertes auto : inactivite, pas   │   
  │     │ alertes       │ dashboard           │ de check-in, CA en baisse  ok      │   
  ├─────┼───────────────┼─────────────────────┼──────────────────────────────────┤   
  │ 4.6 │ Consulter les │ /coach/checkins     │ Check-ins des clients avec CA,   │   
  │     │  check-ins    │                     │ prospection, victoire, blocage    │   
  ├─────┼───────────────┼─────────────────────┼──────────────────────────────────┤   
  │ 4.7 │ Envoyer un    │ /coach/messaging    │ Channel interne equipe           │   
  │     │ message       │                     │ (invisible clients) + DM client ok  │   
  ├─────┼───────────────┼─────────────────────┼──────────────────────────────────┤   
  │ 4.8 │ Planifier une │ /coach/calendar     │ Google Calendar sync, rappels    │   
  │     │  seance       │                     │ automatiques                 ok    │   
  ├─────┼───────────────┼─────────────────────┼──────────────────────────────────┤   
  │     │ Consulter     │                     │ Notes du client visibles par le  │   
  │ 4.9 │ journal       │ /coach/journal      │ coach attribue                   │   
  │     │ client        │                     │                          ok        │   
  └─────┴───────────────┴─────────────────────┴──────────────────────────────────┘   

  ---
  PARCOURS 5 : Client — Experience complete (CDC 2)

  Connexion : /login avec compte client

  ┌──────┬─────────────────┬───────────────────────┬─────────────────────────────┐   
  │  #   │     Action      │         Route         │          Verifier           │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │ 5.1  │ Onboarding      │ /onboarding           │ Etapes progressives,        │   
  │      │                 │                       │ questionnaire    ok           │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │      │                 │                       │ CA du mois, prospects,      │   
  │ 5.2  │ Dashboard       │ /client/dashboard     │ appels, conversion, jauge   │   
  │      │                 │                       │ 10K             ok            │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │ 5.3  │ Suivre une      │ /client/school        │ Parcours > Modules >        │   
  │      │ formation       │                       │ Lecons, barre progression ok  │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │ 5.4  │ Marquer lecon   │ Page lecon            │ Checkbox, progression mise  │   
  │      │ completee       │                       │ a jour                  ok    │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │ 5.5  │ Consulter       │ /client/replays       │ Bibliotheque, tags,         │   
  │      │ replays         │                       │ recherche, favoris          │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │ 5.6  │ Remplir         │ /client/checkin       │ CA, prospection, victoire,  │   
  │      │ check-in hebdo  │                       │ blocage, objectif   ok        │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │ 5.7  │ Ecrire dans le  │ /client/journal       │ Note sauvegardee,           │   
  │      │ journal         │                       │ historique par date   ok      │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │ 5.8  │ Voir objectifs  │ /client/goals         │ Objectifs du coach, statuts │   
  │      │ coaching        │                       │  En cours/Atteint   ok        │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │ 5.9  │ Envoyer un      │ /client/messaging     │ Channels groupe + DM coach, │   
  │      │ message         │                       │  @mentions        ok          │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │ 5.10 │ Poser question  │ Messaging > @Alexia   │ Reponse IA, boutons "Utile" │   
  │      │ a l'IA          │                       │  / "Besoin d'un coach"      │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │ 5.11 │ Poster dans le  │ /client/feed          │ Post victoire, likes,       │   
  │      │ feed            │                       │ commentaires        ko        │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │      │                 │                       │ Pipeline kanban (Contacte > │   
  │ 5.12 │ Mini-CRM        │ /client/crm           │  Booke > Realise > Offre >  │   
  │      │                 │                       │ Signe)             ok         │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │ 5.13 │ Reserver une    │ /client/booking       │ Creneaux dispo,             │   
  │      │ seance          │                       │ confirmation, rappels      ok │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │ 5.14 │ Calculateur     │ /client/tools         │ Sliders, calcul             │   
  │      │ tarif           │                       │ TH/TJM/projet en temps reel ok│   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │ 5.15 │ Consulter       │ /client/resources     │ Templates telechargeables   │   
  │      │ ressources      │                       │                         ok    │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │ 5.16 │ Voir            │ /client/gamification  │ XP total, niveau, badges    │   
  │      │ gamification    │                       │ debloques          ok         │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │ 5.17 │ Voir defis      │ /client/challenges    │ Defis actifs, rejoindre,    │   
  │      │                 │                       │ progression                 │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │ 5.18 │ Classement      │ /client/leaderboard   │ Top XP, opt-in privacy      │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │ 5.19 │ Hall of Fame    │ /client/hall-of-fame  │ Mur des diplomes 10K   ok     │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │ 5.20 │ Factures        │ /client/invoices      │ Factures, statuts, PDF  ok    │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │ 5.21 │ Contrats        │ /client/contracts     │ Contrats signes, PDF        │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │ 5.22 │ Profil          │ /client/profile       │ Badges, niveau, XP visibles ok │   
  ├──────┼─────────────────┼───────────────────────┼─────────────────────────────┤   
  │ 5.23 │ Notifications   │ /client/notifications │ Cloche, liste, preferences ok │   
  └──────┴─────────────────┴───────────────────────┴─────────────────────────────┘   

  ---
  PARCOURS 6 : Setter — Saisie et performance (CDC 5)

  Connexion : /login avec compte setter

  ┌─────┬────────────────┬────────────────────┬──────────────────────────────────┐   
  │  #  │     Action     │       Route        │             Verifier             │   
  ├─────┼────────────────┼────────────────────┼──────────────────────────────────┤   
  │ 6.1 │ Dashboard      │ /sales/dashboard   │ Taux reponse, booking, show,     │   
  │     │                │                    │ objectifs, graphiques        ok    │   
  ├─────┼────────────────┼────────────────────┼──────────────────────────────────┤   
  │ 6.2 │ Saisie         │ /sales/pipeline    │ DMs envoyes, reponses,           │   
  │     │ quotidienne    │                    │ qualifies, bookes, no-shows   ok   │   
  ├─────┼────────────────┼────────────────────┼──────────────────────────────────┤   
  │ 6.3 │ Voir pipeline  │ /sales/pipeline    │ Leads dans kanban, contexte      │   
  │     │                │                    │ quiz/score                    ok   │   
  ├─────┼────────────────┼────────────────────┼──────────────────────────────────┤   
  │ 6.4 │ Suivi          │ /sales/commissions │ "Ce mois tu as gagne X EUR",     │   
  │     │ commissions    │                    │ detail par ligne          ok       │   
  ├─────┼────────────────┼────────────────────┼──────────────────────────────────┤   
  │ 6.5 │ Messagerie     │ /sales/messaging   │ Channels equipe          ok        │   
  └─────┴────────────────┴────────────────────┴──────────────────────────────────┘   

  ---
  PARCOURS 7 : Closeur — Closing et remuneration (CDC 5)

  Connexion : /login avec compte closer

  ┌─────┬───────────────┬─────────────────────────┬──────────────────────────────┐   
  │  #  │    Action     │          Route          │           Verifier           │   
  ├─────┼───────────────┼─────────────────────────┼──────────────────────────────┤   
  │ 7.1 │ Dashboard     │ /sales/dashboard        │ Appels realises, deals clos, │   
  │     │               │                         │  montant, taux closing   ok    │   
  ├─────┼───────────────┼─────────────────────────┼──────────────────────────────┤   
  │ 7.2 │ Saisie appels │ /sales/calls ou         │ Appels, no-shows, deals,     │   
  │     │               │ /sales/pipeline         │ montant, follow-ups    ok      │   
  ├─────┼───────────────┼─────────────────────────┼───────────────────────────ok───┤   
  │ 7.3 │ Suivi         │ /sales/commissions      │ % du deal, paliers           │   
  │     │ commissions   │                         │ progressifs, export CSV/PDF  │   
  ├─────┼───────────────┼─────────────────────────┼──────────────────────────────┤   
  │ 7.4 │ Classement    │ /sales/dashboard        │ Ranking setters vs closeurs  │   
  │     │ equipe        │                         │                      ok        │   
  └─────┴───────────────┴─────────────────────────┴──────────────────────────────┘   

  ---
  PARCOURS 8 : Admin — Pilotage et exports (CDC 7)

  ┌─────┬──────────────────┬──────────────────────┬──────────────────────────────┐   
  │  #  │      Action      │        Route         │           Verifier           │   
  ├─────┼──────────────────┼──────────────────────┼──────────────────────────────┤   
  │ 8.1 │ Metriques        │ /admin/dashboard     │ Clients actifs, retention,   │   
  │     │ business         │                      │ NPS, CA, LTV, churn    ok      │   
  ├─────┼──────────────────┼──────────────────────┼──────────────────────────────┤   
  │ 8.2 │ Performance CSM  │ /admin/dashboard     │ Clients/coach, satisfaction, │   
  │     │                  │                      │  retention par coach         │   
  ├─────┼──────────────────┼──────────────────────┼──────────────────────────────┤   
  │ 8.3 │ Donnees          │ /admin/analytics ou  │ Modules populaires, taux     │   
  │     │ formation        │ school               │ completion, decrochage       │   
  ├─────┼──────────────────┼──────────────────────┼──────────────────────────────┤   
  │ 8.4 │ Performance      │ /admin/dashboard     │ Funnel, CAC, commissions a   │   
  │     │ commerciale      │                      │ verser                       │   
  ├─────┼──────────────────┼──────────────────────┼──────────────────────────────┤   
  │ 8.5 │ Dashboard        │ /admin/billing       │ A jour, retard, impayes, CA  │   
  │     │ paiements        │                      │ encaisse vs prevu            │   
  ├─────┼──────────────────┼──────────────────────┼──────────────────────────────┤   
  │ 8.6 │ Export CSV/PDF   │ Dashboard > Export   │ Fichier telecharge           │   
  ├─────┼──────────────────┼──────────────────────┼──────────────────────────────┤   
  │ 8.7 │ Rapport IA       │ Dashboard > Rapport  │ Rapport genere               │   
  │     │                  │ IA                   │ automatiquement              │   
  └─────┴──────────────────┴──────────────────────┴──────────────────────────────┘   

  ---
  PARCOURS 9 : Verifications transversales

  ┌─────┬─────────────────┬──────────────────────────────────────────────────────┐   
  │  #  │      Test       │                       Comment                        │   
  ├─────┼─────────────────┼──────────────────────────────────────────────────────┤   
  │ 9.1 │ Permissions     │ Un client ne voit PAS /admin/*, un setter ne voit    │   
  │     │ RBAC            │ PAS /coach/*                                         │   
  ├─────┼─────────────────┼──────────────────────────────────────────────────────┤   
  │ 9.2 │ Prospect gate   │ Un prospect voit les sections verrouillees (blur +   │   
  │     │                 │ message) sur school, messaging, gamification         │   
  ├─────┼─────────────────┼──────────────────────────────────────────────────────┤   
  │ 9.3 │ Responsive      │ Tester chaque page sur mobile (375px) — sidebar      │   
  │     │                 │ masquee, bottom nav visible                          │   
  ├─────┼─────────────────┼──────────────────────────────────────────────────────┤   
  │ 9.4 │ Notifications   │ Envoyer un message a un client, verifier la notif    │   
  │     │                 │ in-app (cloche)                                      │   
  ├─────┼─────────────────┼──────────────────────────────────────────────────────┤   
  │ 9.5 │ Recherche       │ Chercher un mot dans /messaging — resultats affiches │   
  │     │ messages        │                                                      │   
  ├─────┼─────────────────┼──────────────────────────────────────────────────────┤   
  │ 9.6 │ 2FA             │ Activer 2FA dans les settings, tester le login avec  │   
  │     │                 │ TOTP                                                 │   
  ├─────┼─────────────────┼──────────────────────────────────────────────────────┤   
  │ 9.7 │ RGPD            │ /client/settings > exporter ses donnees, supprimer   │   
  │     │                 │ son compte                                           │   
  ├─────┼─────────────────┼──────────────────────────────────────────────────────┤   
  │ 9.8 │ Branding        │ Modifier logo/couleurs en admin, verifier que ca se  │   
  │     │                 │ propage partout                                      │   
  ├─────┼─────────────────┼──────────────────────────────────────────────────────┤   
  │ 9.9 │ Audit log       │ Actions sensibles (suppression contrat, modif role)  │   
  │     │                 │ loguees dans /admin/audit-log                        │   
  └─────┴─────────────────┴──────────────────────────────────────────────────────┘ 