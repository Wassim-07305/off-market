import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase admin (service_role) pour les verifications DB dans les tests.
 * Necessite NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local.
 */
function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Variables d'environnement manquantes : NEXT_PUBLIC_SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY. " +
        "Verifie ton fichier .env.local.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/** Singleton du client admin */
let _adminClient: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    _adminClient = createAdminClient();
  }
  return _adminClient;
}

/**
 * Recupere le profil d'un utilisateur par son user ID.
 */
export async function getProfile(userId: string) {
  const client = getAdminClient();
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(
      `Impossible de recuperer le profil ${userId}: ${error.message}`,
    );
  }
  return data;
}

/**
 * Recupere tous les channels de messagerie.
 */
export async function getChannels() {
  const client = getAdminClient();
  const { data, error } = await client
    .from("channels")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Impossible de recuperer les channels: ${error.message}`);
  }
  return data;
}

/**
 * Nettoie les donnees de test creees pendant les tests E2E.
 * Supprime les entites dont l'email correspond au pattern e2e-*.
 */
export async function cleanupTestData() {
  const client = getAdminClient();

  // Supprime les utilisateurs de test via l'admin API
  const { data: users } = await client.auth.admin.listUsers();

  if (users?.users) {
    const testUsers = (
      users.users as Array<{ id: string; email?: string }>
    ).filter((u) => u.email?.endsWith("@offmarket.test"));

    for (const user of testUsers) {
      await client.auth.admin.deleteUser(user.id);
    }
  }
}
