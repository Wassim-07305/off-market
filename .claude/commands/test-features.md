# Test Features — Analyse + E2E automatique + Rapport manuel

Tu es un QA engineer senior. Tu dois analyser les features de l'app, determiner lesquelles sont testables en E2E et lesquelles necessitent des tests manuels, puis executer les tests E2E et fournir un rapport.

## Input
- Fichier de features/checklist : $ARGUMENTS (si vide, cherche CHECKLIST-MANUELLE.md ou un fichier similaire dans le repo)
- URL de l'app : utilise NEXT_PUBLIC_APP_URL de .env.local ou https://off-market-amber.vercel.app par defaut

## Workflow

### Phase 1 : Analyse des features
1. Lis le fichier de features/checklist fourni
2. Pour CHAQUE feature/item, classe-la dans une de ces categories :
   - **E2E** : testable automatiquement (navigation, clics, formulaires, filtres, toasts, erreurs reseau)
   - **Manuel** : necessite un humain (OAuth, Stripe, WebRTC, upload fichier, drag-and-drop, responsive visuel, email reel, real-time multi-users, signature canvas)
   - **Semi-auto** : le test E2E peut verifier une partie mais pas tout (ex: AI chat — on peut verifier que l'input marche mais pas la qualite de la reponse)

### Phase 2 : Verification de la DB
Avant de creer les tests, TOUJOURS verifier les schemas de la DB :
- Utilise `mcp__claude_ai_Supabase__execute_sql` avec `SELECT column_name FROM information_schema.columns WHERE table_name = 'xxx'` pour chaque table concernee
- Ne JAMAIS deviner les noms de colonnes — toujours verifier

### Phase 3 : Generation des tests E2E
Pour chaque feature classee "E2E" :
1. Cree un fichier de test dans tests/e2e/features/
2. Chaque test DOIT :
   - Importer et utiliser `setupNetworkErrorTracking` + `checkNoNetworkErrors` du fichier helpers.ts
   - Se connecter avec la fonction login() standard
   - Verifier les elements UI specifiques (pas juste "la page charge")
   - Verifier qu'il n'y a AUCUNE erreur reseau 400/500 pendant le test
   - JAMAIS cliquer sur Supprimer/Delete/Deconnexion/Logout
   - JAMAIS soumettre de formulaires de paiement
   - Fermer les modals avec Escape sans soumettre (sauf si le test verifie la soumission)
3. Lance les tests : `npx playwright test tests/e2e/features/ --project=chromium --timeout=60000 --workers=4`
4. Corrige les tests qui echouent et relance jusqu'a 100% de succes

### Phase 4 : Rapport
Genere un rapport structure :

```markdown
## Rapport de Test Features

### Resume
- Features totales : X
- Testees en E2E : X (X% de couverture)
- Tests E2E passes : X/Y
- A tester manuellement : X

### Tests E2E — Resultats
| Feature | Test | Status | Erreurs reseau |
|---------|------|--------|----------------|
| Dashboard KPIs | dashboard.spec.ts | PASS | 0 |
| ...

### A TESTER MANUELLEMENT
Pour chaque item, donne :
- [ ] **Feature** — Description precise de ce qu'il faut tester et le resultat attendu
- Pourquoi c'est pas automatisable (en 1 ligne)

Exemple :
- [ ] **Google OAuth** — Cliquer "Continuer avec Google" sur /login → doit rediriger vers accounts.google.com → apres auth, redirection vers /admin/dashboard. *Raison: redirect vers domaine externe*
- [ ] **Upload avatar** — Settings > cliquer sur l'avatar > choisir une image > verifier qu'elle s'affiche. *Raison: necessite fichier reel + storage B2*
```

## Regles
- Toute l'UI est en francais
- Base URL depuis .env.local ou Vercel
- Credentials de test : test@test.com / test123
- Ne JAMAIS modifier le code source de l'app — uniquement creer/modifier des fichiers de test
- Si un test echoue a cause d'un BUG dans l'app (pas un probleme de selecteur), le signaler dans le rapport avec le detail de l'erreur
