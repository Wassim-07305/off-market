import { test, expect } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ─── Constantes de test ──────────────────────────────────────────
const TEST_EMAIL = "e2e-onboarding-contract@offmarket.test";
const TEST_PASSWORD = "TestE2E123!";
const TEST_FULL_NAME = "Jean Dupont";

// Les 5 premieres etapes du flow client a marquer comme completees
const COMPLETED_STEPS = [
  "welcome_video",
  "about_you",
  "meet_csm",
  "feature_tour",
  "message_test",
];

// ─── Admin client Supabase ───────────────────────────────────────
function getAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Tests ───────────────────────────────────────────────────────
test.describe("Onboarding — Signature de contrat (client)", () => {
  let supabaseAdmin: SupabaseClient;
  let userId: string;

  test.beforeAll(async () => {
    supabaseAdmin = getAdminClient();

    // 1. Creer un user de test
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: TEST_FULL_NAME },
      });

    if (authError) throw new Error(`Creation user: ${authError.message}`);
    userId = authData.user.id;

    // 2. Mettre a jour le profil : role client, onboarding non termine, step 5
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        role: "client",
        full_name: TEST_FULL_NAME,
        onboarding_completed: false,
        onboarding_step: 5,
      })
      .eq("id", userId);

    if (profileError)
      throw new Error(`Update profil: ${profileError.message}`);

    // 3. Inserer les 5 premieres etapes comme completees dans onboarding_progress
    const progressRows = COMPLETED_STEPS.map((step) => ({
      user_id: userId,
      step,
      completed_at: new Date().toISOString(),
    }));

    const { error: progressError } = await supabaseAdmin
      .from("onboarding_progress")
      .insert(progressRows);

    if (progressError)
      throw new Error(`Insert progress: ${progressError.message}`);
  });

  test.afterAll(async () => {
    if (!userId) return;

    // Cleanup dans l'ordre inverse des dependances
    await supabaseAdmin
      .from("contracts")
      .delete()
      .eq("client_id", userId);

    await supabaseAdmin
      .from("onboarding_progress")
      .delete()
      .eq("user_id", userId);

    await supabaseAdmin.auth.admin.deleteUser(userId);
  });

  test("signe le contrat pendant l'onboarding et passe a la completion", async ({
    page,
  }) => {
    // ─── 1. Login via l'UI ───────────────────────────────────
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("input[type='email'], input[name='email']").fill(TEST_EMAIL);
    await page.locator("input[type='password'], input[name='password']").fill(TEST_PASSWORD);
    await page.locator('button[type="submit"]').first().click();

    // Attend la redirection (soit dashboard, soit onboarding)
    await page.waitForURL(/\/(client|onboarding)/, { timeout: 30_000 });

    // ─── 2. Naviguer vers /onboarding ────────────────────────
    await page.goto("/onboarding");
    await page.waitForLoadState("domcontentloaded");

    // ─── 3. Verifier que l'etape contrat est affichee ────────
    // Le composant affiche d'abord "Preparation de votre contrat..." puis le contrat
    // Attendre que le contrat soit charge (titre ou badge "Contrat d'accompagnement")
    await expect(
      page.getByText(/contrat d'accompagnement/i).first()
    ).toBeVisible({ timeout: 30_000 });

    // ─── 4. Cliquer "Signer ce contrat" ──────────────────────
    const signerBtn = page.getByRole("button", {
      name: /signer ce contrat/i,
    });
    await expect(signerBtn).toBeVisible({ timeout: 10_000 });
    await signerBtn.click();

    // ─── 5. Verifier le formulaire de signature ──────────────
    // Le champ nom doit etre pre-rempli
    const nomInput = page.locator('input[name="signer_name"]');
    await expect(nomInput).toBeVisible({ timeout: 10_000 });
    const nomValue = await nomInput.inputValue();
    expect(nomValue).toBeTruthy();

    // Remplir l'adresse
    const adresseInput = page.locator('input[name="address"]');
    await adresseInput.fill("123 Rue de la Paix");

    // Remplir la ville
    const villeInput = page.locator('input[name="city"]');
    await villeInput.fill("75001 Paris");

    // ─── 6. Dessiner sur le canvas (signature) ───────────────
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible({ timeout: 10_000 });

    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();

    if (box) {
      await page.mouse.move(box.x + 50, box.y + 50);
      await page.mouse.down();
      await page.mouse.move(box.x + 100, box.y + 70);
      await page.mouse.move(box.x + 150, box.y + 50);
      await page.mouse.move(box.x + 200, box.y + 80);
      await page.mouse.up();
    }

    // Cliquer le bouton "Signer le contrat" dans le SignaturePad
    const signerPadBtn = page
      .getByRole("button", { name: /signer le contrat/i })
      .last();
    await expect(signerPadBtn).toBeVisible();
    // Attendre que "Signature enregistree" apparaisse apres le clic pad
    await signerPadBtn.click();

    await expect(
      page.getByText("Signature enregistree")
    ).toBeVisible({ timeout: 5_000 });

    // ─── 7. Cocher "Lu et approuve" ──────────────────────────
    const checkbox = page.locator('input[type="checkbox"]');
    await checkbox.check({ force: true });

    // ─── 8. Soumettre le formulaire de signature ─────────────
    // Le bouton "Signer le contrat" dans le formulaire principal
    const submitBtn = page
      .getByRole("button", { name: /signer le contrat/i })
      .first();
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
    await submitBtn.click();

    // ─── 9. Verifier la phase "signed" ───────────────────────
    await expect(
      page.getByText("Contrat signe !").first()
    ).toBeVisible({ timeout: 30_000 });

    // Verifier que la signature est affichee
    await expect(page.locator('img[alt="Signature"]')).toBeVisible();

    // ─── 10. Cliquer "Continuer" ─────────────────────────────
    const continuerBtn = page.getByRole("button", { name: /continuer/i });
    await expect(continuerBtn).toBeVisible({ timeout: 5_000 });
    await continuerBtn.click();

    // ─── 11. Verifier l'etape completion ─────────────────────
    await expect(
      page.getByText(/acceder a mon espace/i).first()
    ).toBeVisible({ timeout: 15_000 });

    // Verifier que "Contrat signe" fait partie des items completes
    await expect(
      page.getByText("Contrat signe").first()
    ).toBeVisible();
  });
});
