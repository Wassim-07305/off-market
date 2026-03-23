import { Page, expect } from "@playwright/test";

interface NetworkError {
  url: string;
  status: number;
  method: string;
}

interface NetworkErrorTracker {
  getErrors: () => NetworkError[];
}

/**
 * Listens to all network responses and collects API errors (400, 401, 403, 500+).
 * Filters for Supabase REST/Auth calls and app API routes.
 * Ignores expected 404s (favicon, etc.) and expected auth redirects.
 */
export function setupNetworkErrorTracking(page: Page): NetworkErrorTracker {
  const errors: NetworkError[] = [];

  page.on("response", (response) => {
    const url = response.url();
    const status = response.status();

    // Only track API calls: Supabase REST, Supabase Auth, or app /api/ routes
    const isApiCall =
      url.includes("/rest/v1/") ||
      url.includes("/auth/v1/") ||
      url.includes("/api/");

    if (!isApiCall) return;

    // Ignore expected cases
    if (url.includes("favicon")) return;
    // Ignore auth token refresh returning 400 (expected when session expired)
    if (url.includes("/auth/v1/token") && status === 400) return;
    // Ignore expected 404s on optional resources
    if (status === 404) return;

    // Collect 400, 401, 403, and 500+ errors
    const isError =
      status === 400 || status === 401 || status === 403 || status >= 500;

    if (isError) {
      const method = response.request().method();
      errors.push({ url, status, method });
    }
  });

  return {
    getErrors: () => errors,
  };
}

/**
 * Asserts that no network errors were collected during the test.
 * If errors exist, prints each failing URL with its status code.
 */
export function checkNoNetworkErrors(tracker: NetworkErrorTracker): void {
  const errors = tracker.getErrors();
  if (errors.length > 0) {
    const details = errors
      .map((e) => `  [${e.status}] ${e.method} ${e.url}`)
      .join("\n");
    expect(
      errors,
      `Network API errors detected during test:\n${details}`
    ).toHaveLength(0);
  }
}
