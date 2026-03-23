# Check DB Columns — Vérifie que le code match la DB

Tu dois analyser tout le code source et vérifier que chaque colonne référencée dans les queries Supabase existe réellement dans la base de données.

## Workflow

### Phase 1 : Extraire les colonnes utilisées dans le code
Cherche dans tout `src/` les patterns suivants :
- `.select("...")` — extraire les noms de colonnes
- `.eq("colonne", ...)` — extraire le nom de colonne
- `.order("colonne", ...)` — extraire le nom de colonne
- `.update({ colonne: ... })` — extraire les clés de l'objet
- `.insert({ colonne: ... })` — extraire les clés de l'objet
- `.upsert({ colonne: ... })` — extraire les clés de l'objet
- `.from("table")` — associer la table aux colonnes qui suivent

Construis une map : `{ table_name: Set<column_name> }`

### Phase 2 : Récupérer le vrai schéma DB
Pour chaque table trouvée, exécute via `mcp__claude_ai_Supabase__execute_sql` :
```sql
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'xxx';
```
Le project_id Supabase est : `srhpdgqqiuzdrlqaitdk`

### Phase 3 : Comparer et rapporter
Pour chaque colonne utilisée dans le code :
- Si elle existe en DB → OK
- Si elle n'existe PAS en DB → **MISMATCH**

### Phase 4 : Rapport
Affiche un rapport structuré :

```
## Rapport DB Column Check

### Résumé
- Tables analysées : X
- Colonnes vérifiées : X
- Mismatches trouvés : X ❌
- Tout OK : X ✅

### ❌ MISMATCHES (colonnes dans le code mais PAS en DB)
| Table | Colonne dans le code | Fichier:ligne | Colonne probable en DB |
|-------|---------------------|---------------|----------------------|
| google_calendar_tokens | is_active | src/app/api/.../route.ts:34 | (n'existe pas) |
| google_calendar_tokens | token_expiry | src/app/api/.../route.ts:48 | expires_at |
| user_preferences | notify_messages | src/app/.../settings.tsx:55 | notification_messages |

### ✅ Tables OK (toutes les colonnes matchent)
- profiles ✅
- messages ✅
- ...
```

### Phase 5 : Proposer les corrections
Pour chaque mismatch, propose le fix exact (ancien nom → nouveau nom) et demande à l'utilisateur s'il veut appliquer les corrections automatiquement.

## Règles
- Ne modifie AUCUN fichier sans demander à l'utilisateur d'abord
- Si une colonne dans le code semble être un alias de select (ex: `client:profiles(...)`) c'est pas un mismatch
- Les colonnes dans les `.select("*")` ne sont pas vérifiables — skip
- Les FK hints comme `profiles!contracts_client_id_fkey` sont des hints, pas des colonnes
