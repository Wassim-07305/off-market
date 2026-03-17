import {
  test as base,
  expect,
  type Page,
  type BrowserContext,
} from "@playwright/test";
import { type SupabaseClient } from "@supabase/supabase-js";
import { getAdminClient } from "./helpers/supabase";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TestRole = "admin" | "coach" | "client" | "setter" | "closer";

export interface TestUser {
  email: string;
  password: string;
  role: TestRole;
  fullName: string;
}

// ---------------------------------------------------------------------------
// Utilisateurs de test (20 au total)
// ---------------------------------------------------------------------------

function generateUsers(
  role: TestRole,
  count: number,
  startIndex: number,
): TestUser[] {
  const firstNames: Record<TestRole, string[]> = {
    admin: ["Alexia", "Julien", "Clara", "Victor"],
    coach: ["Sophie", "Nathan", "Camille", "Lucas"],
    client: [
      "Thomas",
      "Marie",
      "Antoine",
      "Laura",
      "Hugo",
      "Emma",
      "Paul",
      "Sarah",
    ],
    setter: ["Lea", "Maxime"],
    closer: ["Romain", "Chloe"],
  };

  const lastNames: Record<TestRole, string[]> = {
    admin: ["Laneau", "Moreau", "Duval", "Perrin"],
    coach: ["Martin", "Bernard", "Petit", "Robert"],
    client: [
      "Dupont",
      "Laurent",
      "Simon",
      "Michel",
      "Garcia",
      "David",
      "Bertrand",
      "Richard",
    ],
    setter: ["Roux", "Blanc"],
    closer: ["Faure", "Girard"],
  };

  return Array.from({ length: count }, (_, i) => ({
    email: `e2e-${role}-${startIndex + i}@offmarket.test`,
    password: "TestE2E123!",
    role,
    fullName: `${firstNames[role][i]} ${lastNames[role][i]}`,
  }));
}

export const TEST_USERS: TestUser[] = [
  ...generateUsers("admin", 4, 1),
  ...generateUsers("coach", 4, 1),
  ...generateUsers("client", 8, 1),
  ...generateUsers("setter", 2, 1),
  ...generateUsers("closer", 2, 1),
];

/**
 * Raccourcis pour recuperer un utilisateur par role.
 */
export function getUserByRole(role: TestRole, index = 0): TestUser {
  const users = TEST_USERS.filter((u) => u.role === role);
  if (!users[index]) {
    throw new Error(
      `Pas d'utilisateur test pour le role "${role}" a l'index ${index}`,
    );
  }
  return users[index];
}

// ---------------------------------------------------------------------------
// Repertoire d'auth cache
// ---------------------------------------------------------------------------

const AUTH_DIR = path.join(__dirname, ".auth");

function getStorageStatePath(email: string): string {
  return path.join(AUTH_DIR, `${email}.json`);
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

interface TestFixtures {
  authenticatedPage: { page: Page; context: BrowserContext; user: TestUser };
  testUser: TestUser;
  supabaseAdmin: SupabaseClient;
}

export const test = base.extend<TestFixtures>({
  /**
   * Utilisateur par defaut pour les tests.
   * Peut etre override dans chaque test : test.use({ testUser: getUserByRole("coach") })
   */
  testUser: [getUserByRole("admin"), { option: true }],

  /**
   * Page authentifiee avec storageState cache.
   * - Si le fichier .auth/{email}.json existe, reutilise la session
   * - Sinon, se connecte via le formulaire et sauvegarde la session
   */
  authenticatedPage: async ({ browser, testUser }, use) => {
    const storagePath = getStorageStatePath(testUser.email);

    // Verifie si on a deja un state sauvegarde et valide
    let context: BrowserContext;
    let page: Page;
    let needsLogin = true;

    if (fs.existsSync(storagePath)) {
      try {
        context = await browser.newContext({ storageState: storagePath });
        page = await context.newPage();
        needsLogin = false;
      } catch {
        // Fichier corrompu ou invalide — on refait le login
        context = await browser.newContext();
        page = await context.newPage();
      }
    } else {
      context = await browser.newContext();
      page = await context.newPage();
    }

    if (needsLogin) {
      // Navigue vers /login et remplit le formulaire
      await page.goto("/login");

      // Remplit les champs
      await page.getByLabel("Email").fill(testUser.email);
      await page.getByLabel("Mot de passe").fill(testUser.password);

      // Clique sur Se connecter
      await page.getByRole("button", { name: "Se connecter" }).click();

      // Attend la redirection vers le dashboard du role
      await page.waitForURL(/\/(admin|coach|client|sales)\//, {
        timeout: 120_000,
      });

      // Cree le repertoire .auth s'il n'existe pas
      if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
      }

      // Sauvegarde le storageState pour les prochains tests
      await context.storageState({ path: storagePath });
    }

    await use({ page, context, user: testUser });

    // Cleanup
    await context.close();
  },

  /**
   * Client Supabase admin (service_role) pour verifications DB directes.
   */
  supabaseAdmin: async ({}, use) => {
    const client = getAdminClient();
    await use(client);
  },
});

export { expect } from "@playwright/test";
