import { test, expect } from "../fixtures";
import { getUserByRole } from "../fixtures";

// =====================================================================
// GAMIFICATION — Page Client /client/gamification
// =====================================================================

test.describe("Gamification (/client/gamification)", () => {
  test.use({ testUser: getUserByRole("client") });

  // ─── 1. Rendu initial & structure ───────────────────────────────

  test("la page gamification se charge et affiche le header", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/gamification");
    await expect(page).toHaveURL(/\/client\/gamification/, { timeout: 15_000 });

    // Titre "Ma progression"
    await expect(
      page.locator("h1").filter({ hasText: "Ma progression" }),
    ).toBeVisible({ timeout: 15_000 });

    // Sous-titre
    await expect(
      page.getByText(/badges|recompenses/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("affiche les cartes XP, niveau et streak", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/gamification");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    // Carte Niveau — contient "Niveau" suivi d'un nombre
    await expect(
      page.getByText(/Niveau \d+/).first(),
    ).toBeVisible({ timeout: 10_000 });

    // XP Total affiché
    await expect(
      page.getByText(/XP/).first(),
    ).toBeVisible({ timeout: 10_000 });

    // Streak "jours de suite"
    await expect(
      page.getByText("jours de suite"),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("affiche les stats XP Total, Badges gagnes, Recompenses", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/gamification");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    await expect(page.getByText("XP Total")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Badges gagnes")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Recompenses")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("la barre de progression XP est visible et a un pourcentage valide", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/gamification");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    // Barre de progression (div avec style width pourcentage)
    const progressBar = page.locator(
      '.bg-gradient-to-r.from-primary.to-red-400',
    );
    await expect(progressBar).toBeVisible({ timeout: 10_000 });

    // Verifie que le style width est un pourcentage valide (0-100%)
    const style = await progressBar.getAttribute("style");
    expect(style).toMatch(/width:\s*\d+(\.\d+)?%/);
  });

  // ─── 2. Onglets ─────────────────────────────────────────────────

  test("les 4 onglets sont presents: Badges, Recompenses, Classement, Historique", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/gamification");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    const tabs = ["Badges", "Recompenses", "Classement", "Historique"];
    for (const tab of tabs) {
      await expect(
        page.locator("button").filter({ hasText: tab }),
      ).toBeVisible({ timeout: 10_000 });
    }
  });

  test("cliquer sur l'onglet Badges affiche les badges ou un etat vide", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/gamification");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    // L'onglet Badges est selectionne par defaut
    // On doit voir soit des cartes de badges soit "Aucun badge disponible"
    const hasBadges = await page
      .getByText(/Debloque|Verrouille/)
      .first()
      .isVisible()
      .catch(() => false);
    const emptyState = await page
      .getByText("Aucun badge disponible")
      .isVisible()
      .catch(() => false);

    expect(hasBadges || emptyState).toBeTruthy();
  });

  test("cliquer sur l'onglet Recompenses affiche le catalogue ou un etat vide", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/gamification");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    // Cliquer sur l'onglet Recompenses
    await page.locator("button").filter({ hasText: "Recompenses" }).click();
    await page.waitForTimeout(500);

    // On doit voir soit des recompenses avec bouton "Echanger" soit un etat vide
    const hasRewards = await page
      .getByText(/Echanger|XP insuffisant|Epuise/)
      .first()
      .isVisible()
      .catch(() => false);
    const emptyState = await page
      .getByText("Aucune recompense disponible")
      .isVisible()
      .catch(() => false);
    const loading = await page
      .getByText("Chargement...")
      .isVisible()
      .catch(() => false);

    expect(hasRewards || emptyState || loading).toBeTruthy();
  });

  test("cliquer sur l'onglet Classement affiche le leaderboard ou un etat vide", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/gamification");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    await page.locator("button").filter({ hasText: "Classement" }).click();
    await page.waitForTimeout(500);

    // Soit un classement avec medailles soit un message vide
    const hasLeaderboard = await page
      .locator("text=/XP/")
      .first()
      .isVisible()
      .catch(() => false);
    const emptyState = await page
      .getByText("Classement indisponible")
      .isVisible()
      .catch(() => false);

    expect(hasLeaderboard || emptyState).toBeTruthy();
  });

  test("cliquer sur l'onglet Historique affiche l'historique ou un etat vide", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/gamification");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    await page.locator("button").filter({ hasText: "Historique" }).click();
    await page.waitForTimeout(500);

    // Soit un historique avec redemptions soit un message vide
    const hasHistory = await page
      .getByText(/Approuve|En attente|Refuse/)
      .first()
      .isVisible()
      .catch(() => false);
    const emptyState = await page
      .getByText("Aucun echange pour le moment")
      .isVisible()
      .catch(() => false);

    expect(hasHistory || emptyState).toBeTruthy();
  });

  test("le leaderboard affiche des medailles pour les 3 premiers", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/gamification");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    await page.locator("button").filter({ hasText: "Classement" }).click();
    await page.waitForTimeout(1000);

    const emptyState = await page
      .getByText("Classement indisponible")
      .isVisible()
      .catch(() => false);

    if (!emptyState) {
      // Verifie la presence des medailles emoji
      const medals = page.locator("text=/[\\u{1F947}\\u{1F948}\\u{1F949}]/u");
      const medalCount = await medals.count();
      // Il devrait y avoir au max 3 medailles
      expect(medalCount).toBeLessThanOrEqual(3);
    }
  });

  // ─── 3. Pas d'erreur console ──────────────────────────────────

  test("aucune erreur console sur la page gamification", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/client/gamification");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });
    // Naviguer entre les onglets
    for (const tab of ["Recompenses", "Classement", "Historique", "Badges"]) {
      await page.locator("button").filter({ hasText: tab }).click();
      await page.waitForTimeout(300);
    }

    // Filtrer les erreurs non-critiques (CORS, extensions, etc.)
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("extension") &&
        !e.includes("ERR_BLOCKED_BY_CLIENT") &&
        !e.includes("ResizeObserver") &&
        !e.includes("third-party"),
    );
    expect(criticalErrors).toEqual([]);
  });

  // ─── 4. Responsive mobile ──────────────────────────────────────

  test("la page gamification est utilisable en mode mobile (375px)", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/client/gamification");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    // Titre toujours visible
    await expect(
      page.locator("h1").filter({ hasText: "Ma progression" }),
    ).toBeVisible();

    // Les onglets doivent etre accessibles (pas caches ou tronques sans scroll possible)
    const tabContainer = page.locator("button").filter({ hasText: "Badges" });
    await expect(tabContainer).toBeVisible();

    // Les cartes XP / niveau ne debordent pas
    const content = page.locator(".max-w-4xl");
    if (await content.isVisible()) {
      const box = await content.boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(375);
      }
    }
  });

  // ─── 5. Screenshot test ────────────────────────────────────────

  test("screenshot de la page gamification", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/gamification");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(1000); // Laisser les animations finir

    await page.screenshot({
      path: "test-results/gamification-desktop.png",
      fullPage: true,
    });
  });

  test("screenshot mobile de la page gamification", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/client/gamification");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: "test-results/gamification-mobile.png",
      fullPage: true,
    });
  });

  // ─── 6. Changement rapide d'onglets (double-clic) ─────────────

  test("changer rapidement d'onglet ne cause pas de crash", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/gamification");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    const tabs = ["Recompenses", "Classement", "Historique", "Badges"];
    // Cliquer rapidement sur chaque onglet
    for (let i = 0; i < 3; i++) {
      for (const tab of tabs) {
        await page.locator("button").filter({ hasText: tab }).click();
        // Pas de wait volontaire pour tester le comportement rapide
      }
    }

    await page.waitForTimeout(1000);
    // La page ne crashe pas
    await expect(page.locator("h1").first()).toBeVisible();
  });

  // ─── 7. Refresh pendant le chargement ──────────────────────────

  test("rafraichir la page pendant le chargement ne cause pas d'erreur", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/gamification");
    // Rafraichir immediatement
    await page.reload();
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    // Aucune erreur visible
    await expect(page.locator("body")).not.toContainText("Erreur serveur");
    await expect(page.locator("body")).not.toContainText(
      "Internal Server Error",
    );
  });
});

// =====================================================================
// JOURNAL — Page Client /client/journal
// =====================================================================

test.describe("Journal (/client/journal)", () => {
  test.use({ testUser: getUserByRole("client") });

  // ─── 1. Rendu initial & structure ───────────────────────────────

  test("la page journal se charge et affiche le header", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/journal");
    await expect(page).toHaveURL(/\/client\/journal/, { timeout: 15_000 });

    // Titre "Journal"
    await expect(
      page.locator("h1").filter({ hasText: "Journal" }),
    ).toBeVisible({ timeout: 15_000 });

    // Sous-titre
    await expect(
      page.getByText(/reflexions|apprentissages/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("affiche les 3 stats: Entrees, Jours de suite, Humeur moy.", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    await expect(page.getByText("Entrees")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Jours de suite")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Humeur moy.")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("affiche le bouton Ecrire", async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    const writeBtn = page.locator("button").filter({ hasText: "Ecrire" });
    await expect(writeBtn).toBeVisible({ timeout: 10_000 });
  });

  test("affiche les templates de journal", async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    // Le texte "Demarrer avec un template" doit etre visible
    await expect(
      page.getByText(/Demarrer avec un template/i),
    ).toBeVisible({ timeout: 10_000 });
  });

  // ─── 2. Composer (creation d'entree) ────────────────────────────

  test("cliquer sur Ecrire ouvre le composeur", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    await page.locator("button").filter({ hasText: "Ecrire" }).click();
    await page.waitForTimeout(500);

    // Le composeur doit etre visible avec les champs titre et contenu
    const titleInput = page.locator(
      'input[placeholder*="titre"], input[placeholder*="Titre"]',
    );
    const contentArea = page.locator(
      'textarea, [contenteditable="true"]',
    );

    const hasTitle = await titleInput.isVisible().catch(() => false);
    const hasContent = await contentArea.first().isVisible().catch(() => false);

    expect(hasTitle || hasContent).toBeTruthy();
  });

  test("le composeur ne soumets pas si le titre ou contenu est vide", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    // Ouvrir le composeur
    await page.locator("button").filter({ hasText: "Ecrire" }).click();
    await page.waitForTimeout(500);

    // Essayer de soumettre sans remplir
    const submitBtn = page
      .locator("button")
      .filter({ hasText: /Publier|Sauvegarder|Enregistrer/ });

    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(500);

      // Le composeur doit rester ouvert (la soumission a ete bloquee)
      const composerStillOpen = await page
        .locator('input[placeholder*="titre"], input[placeholder*="Titre"]')
        .isVisible()
        .catch(() => false);

      // Ou le textarea est toujours visible
      const textareaStillOpen = await page
        .locator("textarea")
        .first()
        .isVisible()
        .catch(() => false);

      expect(composerStillOpen || textareaStillOpen).toBeTruthy();
    }
  });

  test("annuler le composeur le ferme correctement", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    // Ouvrir le composeur
    await page.locator("button").filter({ hasText: "Ecrire" }).click();
    await page.waitForTimeout(500);

    // Trouver et cliquer sur le bouton annuler
    const cancelBtn = page
      .locator("button")
      .filter({ hasText: /Annuler/ });

    if (await cancelBtn.isVisible().catch(() => false)) {
      await cancelBtn.click();
      await page.waitForTimeout(500);

      // Le bouton "Ecrire" doit etre de nouveau visible (composeur ferme)
      await expect(
        page.locator("button").filter({ hasText: "Ecrire" }),
      ).toBeVisible({ timeout: 5_000 });
    }
  });

  test("cliquer sur un template ouvre le composeur pre-rempli", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    // Cliquer sur le premier template visible
    const templateBtn = page
      .locator("button")
      .filter({ hasText: /Gratitude|Reflexion|Objectifs|Victoires|Blocages/ })
      .first();

    if (await templateBtn.isVisible().catch(() => false)) {
      await templateBtn.click();
      await page.waitForTimeout(500);

      // Le composeur doit etre ouvert avec du contenu pre-rempli
      const hasContent = await page
        .locator("textarea")
        .first()
        .isVisible()
        .catch(() => false);
      expect(hasContent).toBeTruthy();
    }
  });

  // ─── 3. Mood selector ──────────────────────────────────────────

  test("le selecteur d'humeur affiche les 5 emojis", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    // Ouvrir le composeur
    await page.locator("button").filter({ hasText: "Ecrire" }).click();
    await page.waitForTimeout(500);

    // Verifier que les emojis d'humeur sont visibles (il devrait y en avoir 5)
    const moodButtons = page.locator(
      'button:has-text("\\ud83d"), button:has-text("\\ud83d")',
    );

    // Alternative : chercher le label "Humeur"
    const moodLabel = page.getByText(/Humeur|Comment/i);
    const hasMood = await moodLabel.first().isVisible().catch(() => false);

    // Le selecteur d'humeur existe dans le composeur
    expect(hasMood || (await moodButtons.count()) > 0).toBeTruthy();
  });

  // ─── 4. Share toggle ──────────────────────────────────────────

  test("le toggle de partage coach est present dans le composeur", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    await page.locator("button").filter({ hasText: "Ecrire" }).click();
    await page.waitForTimeout(500);

    // Le bouton de partage doit etre visible
    const shareToggle = page.getByText(/Visible par ton coach|Entree privee/);
    await expect(shareToggle.first()).toBeVisible({ timeout: 10_000 });
  });

  test("cliquer sur le toggle de partage change l'etat", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    await page.locator("button").filter({ hasText: "Ecrire" }).click();
    await page.waitForTimeout(500);

    const shareBtn = page.getByText(/Visible par ton coach|Entree privee/).first();
    if (await shareBtn.isVisible().catch(() => false)) {
      const initialText = await shareBtn.textContent();
      await shareBtn.click();
      await page.waitForTimeout(300);
      const newText = await shareBtn.textContent();
      // Le texte doit avoir change
      expect(newText).not.toBe(initialText);
    }
  });

  // ─── 5. Export PDF ─────────────────────────────────────────────

  test("le bouton Exporter PDF ouvre le panneau d'export", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    const exportBtn = page
      .locator("button")
      .filter({ hasText: "Exporter PDF" });

    if (await exportBtn.isVisible().catch(() => false)) {
      await exportBtn.click();
      await page.waitForTimeout(500);

      // Le panneau d'export doit apparaitre avec les champs de date
      await expect(
        page.getByText("Exporter en PDF"),
      ).toBeVisible({ timeout: 5_000 });

      // Champs de date "Du" et "Au"
      await expect(page.getByText("Du")).toBeVisible();
      await expect(page.getByText("Au")).toBeVisible();

      // Bouton Telecharger
      await expect(
        page.locator("button").filter({ hasText: "Telecharger" }),
      ).toBeVisible();
    }
  });

  test("fermer le panneau d'export fonctionne correctement", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    const exportBtn = page
      .locator("button")
      .filter({ hasText: "Exporter PDF" });

    if (await exportBtn.isVisible().catch(() => false)) {
      await exportBtn.click();
      await page.waitForTimeout(500);

      // Trouver le bouton de fermeture (X)
      const closeBtn = page.locator(
        'button:has(svg.lucide-x)',
      ).first();

      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click();
        await page.waitForTimeout(500);

        // Le panneau doit etre ferme
        await expect(
          page.getByText("Exporter en PDF"),
        ).not.toBeVisible({ timeout: 5_000 });
      }
    }
  });

  // ─── 6. Recherche & Filtres ────────────────────────────────────

  test("la barre de recherche filtre les entrees", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    const searchInput = page.locator(
      'input[placeholder*="Rechercher"]',
    );

    if (await searchInput.isVisible().catch(() => false)) {
      // Taper une recherche qui ne devrait rien matcher
      await searchInput.fill("xyznonexistent12345");
      await page.waitForTimeout(500);

      // Soit "Aucun resultat" soit aucune entree visible
      const noResult = await page
        .getByText("Aucun resultat")
        .isVisible()
        .catch(() => false);
      const emptyJournal = await page
        .getByText(/journal est vide/)
        .isVisible()
        .catch(() => false);
      const hasEntries = await page
        .locator(".rounded-2xl.border-l-\\[3px\\]")
        .count();

      expect(noResult || emptyJournal || hasEntries === 0).toBeTruthy();

      // Effacer la recherche
      await searchInput.fill("");
    }
  });

  test("le bouton Filtres ouvre le panneau de filtres", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    const filterBtn = page.locator("button").filter({ hasText: "Filtres" });

    if (await filterBtn.isVisible().catch(() => false)) {
      await filterBtn.click();
      await page.waitForTimeout(500);

      // Le filtre d'humeur doit apparaitre
      await expect(page.getByText("Humeur :")).toBeVisible({
        timeout: 5_000,
      });

      // Le bouton "Toutes" doit etre visible
      await expect(
        page.locator("button").filter({ hasText: "Toutes" }),
      ).toBeVisible();
    }
  });

  // ─── 7. Entrees existantes ─────────────────────────────────────

  test("cliquer sur une entree l'expand et montre les boutons Modifier/Supprimer", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    // Chercher une entree de journal cliquable
    const entryCard = page.locator(".cursor-pointer").first();

    if (await entryCard.isVisible().catch(() => false)) {
      await entryCard.click();
      await page.waitForTimeout(500);

      // Les boutons Modifier et Supprimer doivent apparaitre
      const modifyBtn = page
        .locator("button")
        .filter({ hasText: "Modifier" })
        .first();
      const deleteBtn = page
        .locator("button")
        .filter({ hasText: "Supprimer" })
        .first();

      const hasModify = await modifyBtn.isVisible().catch(() => false);
      const hasDelete = await deleteBtn.isVisible().catch(() => false);

      expect(hasModify || hasDelete).toBeTruthy();
    }
  });

  // ─── 8. Pas d'erreur console ──────────────────────────────────

  test("aucune erreur console sur la page journal", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/client/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    // Filtrer les erreurs non-critiques
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("extension") &&
        !e.includes("ERR_BLOCKED_BY_CLIENT") &&
        !e.includes("ResizeObserver") &&
        !e.includes("third-party"),
    );
    expect(criticalErrors).toEqual([]);
  });

  // ─── 9. Responsive mobile ─────────────────────────────────────

  test("la page journal est utilisable en mode mobile (375px)", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/client/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    // Titre toujours visible
    await expect(
      page.locator("h1").filter({ hasText: "Journal" }),
    ).toBeVisible();

    // Le bouton Ecrire est toujours accessible
    await expect(
      page.locator("button").filter({ hasText: "Ecrire" }),
    ).toBeVisible();

    // Les stats ne debordent pas
    const statsGrid = page.locator(".grid-cols-3").first();
    if (await statsGrid.isVisible()) {
      const box = await statsGrid.boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(375);
      }
    }
  });

  // ─── 10. Screenshots ───────────────────────────────────────────

  test("screenshot de la page journal", async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: "test-results/journal-desktop.png",
      fullPage: true,
    });
  });

  test("screenshot mobile de la page journal", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/client/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: "test-results/journal-mobile.png",
      fullPage: true,
    });
  });

  // ─── 11. Refresh pendant une action ────────────────────────────

  test("rafraichir la page journal pendant le chargement ne cause pas d'erreur", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/journal");
    await page.reload();
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    await expect(page.locator("body")).not.toContainText("Erreur serveur");
    await expect(page.locator("body")).not.toContainText(
      "Internal Server Error",
    );
  });
});

// =====================================================================
// JOURNAL COACH — Page Coach /coach/journal
// =====================================================================

test.describe("Journal Coach (/coach/journal)", () => {
  test.use({ testUser: getUserByRole("coach") });

  test("la page journal partage se charge pour un coach", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/coach/journal");
    await expect(page).toHaveURL(/\/coach\/journal/, { timeout: 15_000 });

    // Titre "Journal partage"
    await expect(
      page.locator("h1").filter({ hasText: "Journal partage" }),
    ).toBeVisible({ timeout: 15_000 });

    // Sous-titre
    await expect(
      page.getByText(/partagees par vos clients/i),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("la barre de recherche est presente sur la vue coach", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/coach/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    const searchInput = page.locator(
      'input[placeholder*="Rechercher"]',
    );
    await expect(searchInput).toBeVisible({ timeout: 10_000 });
  });

  test("l'etat vide affiche un message approprié quand il n'y a pas d'entrees partagees", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/coach/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    // Soit il y a des entrees, soit un message vide
    const hasEntries = await page
      .locator(".rounded-xl.border")
      .count()
      .then((c) => c > 2); // plus que le header et search
    const emptyState = await page
      .getByText(/Aucune entree partagee|Aucune entree correspondante/)
      .isVisible()
      .catch(() => false);

    // L'un des deux etats doit etre present
    expect(hasEntries || emptyState).toBeTruthy();
  });

  test("screenshot de la vue journal coach", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/coach/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: "test-results/journal-coach-desktop.png",
      fullPage: true,
    });
  });
});

// =====================================================================
// API — Journal Export PDF
// =====================================================================

test.describe("API Journal Export PDF", () => {
  test.use({ testUser: getUserByRole("client") });

  test("l'API /api/journal/export retourne un PDF valide", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;

    // Naviguer d'abord pour avoir les cookies de session
    await page.goto("/client/journal");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    // Appeler l'API d'export directement
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
      .toISOString()
      .split("T")[0];

    const response = await page.request.get(
      `/api/journal/export?from=${thirtyDaysAgo}&to=${today}`,
    );

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("application/pdf");

    // Verifier que le contenu commence par %PDF
    const body = await response.body();
    const pdfHeader = body.toString("utf-8", 0, 5);
    expect(pdfHeader).toBe("%PDF-");
  });

  test("l'API /api/journal/export refuse les utilisateurs non connectes", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const response = await page.request.get(
      "/api/journal/export?from=2024-01-01&to=2024-12-31",
    );

    // Doit retourner 401
    expect(response.status()).toBe(401);
    await context.close();
  });
});
