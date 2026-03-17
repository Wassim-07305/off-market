/**
 * Script de cleanup — Supprime tous les utilisateurs @offmarket.test
 *
 * Usage : npx tsx tests/cleanup.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "❌ Variables manquantes : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Emails a ne jamais supprimer (comptes reels)
const PROTECTED_EMAILS = ["admin@offmarket.fr", "coach@offmarket.fr"];

async function cleanup() {
  console.log("\n🧹 Cleanup des utilisateurs @offmarket.test...\n");

  // Lister tous les users
  const { data: listData, error: listError } =
    await supabase.auth.admin.listUsers({ perPage: 1000 });

  if (listError) {
    console.error(
      "❌ Impossible de lister les utilisateurs :",
      listError.message,
    );
    process.exit(1);
  }

  const testUsers = listData.users.filter(
    (u) =>
      u.email?.endsWith("@offmarket.test") &&
      !PROTECTED_EMAILS.includes(u.email ?? ""),
  );

  if (testUsers.length === 0) {
    console.log("  Aucun utilisateur @offmarket.test trouve.\n");
    return;
  }

  console.log(`  ${testUsers.length} utilisateur(s) a supprimer :\n`);

  let deleted = 0;
  let errors = 0;

  for (const user of testUsers) {
    try {
      // Supprimer le user_roles d'abord (au cas ou pas de CASCADE)
      await supabase.from("user_roles").delete().eq("user_id", user.id);

      // Supprimer le profile (au cas ou pas de CASCADE)
      await supabase.from("profiles").delete().eq("id", user.id);

      // Supprimer l'auth user (les cascades DB gerent le reste)
      const { error } = await supabase.auth.admin.deleteUser(user.id);

      if (error) {
        console.error(`  ❌ ${user.email} — ${error.message}`);
        errors++;
      } else {
        console.log(`  🗑️  ${user.email} — supprime`);
        deleted++;
      }
    } catch (err) {
      console.error(`  ❌ ${user.email} — erreur inattendue :`, err);
      errors++;
    }
  }

  console.log(`\n📊 Resultat : ${deleted} supprimes, ${errors} erreurs\n`);
}

cleanup();
