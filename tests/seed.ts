/**
 * Script de seed — Crée 20 utilisateurs test dans Supabase
 *
 * Usage : npx tsx tests/seed.ts
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

const PASSWORD = "TestE2E123!";

type Role = "admin" | "coach" | "client" | "setter" | "closer";

interface SeedUser {
  email: string;
  full_name: string;
  role: Role;
}

const USERS: SeedUser[] = [
  // 3 admins
  {
    email: "e2e-admin-1@offmarket.test",
    full_name: "Julien Moreau",
    role: "admin",
  },
  {
    email: "e2e-admin-2@offmarket.test",
    full_name: "Claire Dupont",
    role: "admin",
  },
  {
    email: "e2e-admin-3@offmarket.test",
    full_name: "Antoine Leroy",
    role: "admin",
  },
  // 4 coaches
  {
    email: "e2e-coach-1@offmarket.test",
    full_name: "Sophie Martin",
    role: "coach",
  },
  {
    email: "e2e-coach-2@offmarket.test",
    full_name: "Thomas Bernard",
    role: "coach",
  },
  {
    email: "e2e-coach-3@offmarket.test",
    full_name: "Camille Petit",
    role: "coach",
  },
  {
    email: "e2e-coach-4@offmarket.test",
    full_name: "Lucas Fontaine",
    role: "coach",
  },
  // 8 clients
  {
    email: "e2e-client-1@offmarket.test",
    full_name: "Emma Girard",
    role: "client",
  },
  {
    email: "e2e-client-2@offmarket.test",
    full_name: "Hugo Roux",
    role: "client",
  },
  {
    email: "e2e-client-3@offmarket.test",
    full_name: "Lea Bonnet",
    role: "client",
  },
  {
    email: "e2e-client-4@offmarket.test",
    full_name: "Nathan Mercier",
    role: "client",
  },
  {
    email: "e2e-client-5@offmarket.test",
    full_name: "Manon Duval",
    role: "client",
  },
  {
    email: "e2e-client-6@offmarket.test",
    full_name: "Maxime Garnier",
    role: "client",
  },
  {
    email: "e2e-client-7@offmarket.test",
    full_name: "Chloe Lambert",
    role: "client",
  },
  {
    email: "e2e-client-8@offmarket.test",
    full_name: "Raphael Faure",
    role: "client",
  },
  // 3 setters
  {
    email: "e2e-setter-1@offmarket.test",
    full_name: "Ines Chevalier",
    role: "setter",
  },
  {
    email: "e2e-setter-2@offmarket.test",
    full_name: "Theo Blanchard",
    role: "setter",
  },
  {
    email: "e2e-setter-3@offmarket.test",
    full_name: "Jade Rousseau",
    role: "setter",
  },
  // 2 closers
  {
    email: "e2e-closer-1@offmarket.test",
    full_name: "Alexandre Dubois",
    role: "closer",
  },
  {
    email: "e2e-closer-2@offmarket.test",
    full_name: "Marie Lefebvre",
    role: "closer",
  },
];

async function seedUsers() {
  console.log(`\n🌱 Seed de ${USERS.length} utilisateurs test...\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of USERS) {
    try {
      // 1. Creer l'auth user (ou recuperer s'il existe deja)
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: user.email,
          password: PASSWORD,
          email_confirm: true,
          user_metadata: { full_name: user.full_name },
        });

      let userId: string;

      if (authError) {
        // Si l'utilisateur existe deja, on le recupere et on met a jour le mot de passe
        if (
          authError.message.includes("already been registered") ||
          authError.message.includes("already exists")
        ) {
          // Chercher l'utilisateur existant
          const { data: listData } = await supabase.auth.admin.listUsers({
            perPage: 1000,
          });

          const existing = listData?.users?.find((u) => u.email === user.email);

          if (!existing) {
            console.error(`  ⚠️  ${user.email} — existe mais introuvable`);
            errors++;
            continue;
          }

          userId = existing.id;

          // Mettre a jour le mot de passe
          await supabase.auth.admin.updateUserById(userId, {
            password: PASSWORD,
          });

          console.log(
            `  ♻️  ${user.email} — deja existant, mot de passe mis a jour`,
          );
          skipped++;
        } else {
          console.error(`  ❌ ${user.email} — ${authError.message}`);
          errors++;
          continue;
        }
      } else {
        userId = authData.user.id;
        console.log(`  ✅ ${user.email} — cree (${userId.slice(0, 8)}...)`);
        created++;
      }

      // 2. Mettre a jour le profile
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          onboarding_completed: true,
          onboarding_step: 7,
          timezone: "Europe/Paris",
          default_currency: "EUR",
        },
        { onConflict: "id" },
      );

      if (profileError) {
        console.error(
          `    ⚠️  Profile ${user.email} — ${profileError.message}`,
        );
      }

      // 3. Inserer dans user_roles (upsert pour eviter les doublons)
      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert(
          { user_id: userId, role: user.role },
          { onConflict: "user_id,role" },
        );

      if (roleError) {
        console.error(`    ⚠️  Role ${user.email} — ${roleError.message}`);
      }
    } catch (err) {
      console.error(`  ❌ ${user.email} — erreur inattendue :`, err);
      errors++;
    }
  }

  console.log(
    `\n📊 Resultat : ${created} crees, ${skipped} mis a jour, ${errors} erreurs`,
  );
  console.log(`🔑 Mot de passe commun : ${PASSWORD}\n`);
}

seedUsers();
