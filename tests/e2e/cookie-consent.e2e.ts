/**
 * E2E: Cookie consent banner
 *
 * Tests:
 * 1. Banner visible on first visit (no localStorage entry).
 * 2. Clicking "Accept" hides the banner and sets localStorage to "accepted".
 * 3. Revisiting the page: banner does NOT reappear (choice persisted).
 * 4. Clicking "Decline" hides the banner and sets localStorage to "declined".
 * 5. Decline choice also persists across navigation.
 *
 * These tests only require the Next.js server — no database or API keys.
 */

import { expect, test } from '@playwright/test';

// The CookieConsent component reads/writes localStorage key 'cookie-consent'.
const CONSENT_KEY = 'cookie-consent';

// ---------------------------------------------------------------------------
// Shared helper: navigate to the landing page with a clean localStorage state
// ---------------------------------------------------------------------------
async function gotoFreshLanding(page: import('@playwright/test').Page): Promise<void> {
  // Clear localStorage before navigating so the banner always shows
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  // Reload so the React component picks up the cleared state
  await page.reload();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Cookie consent banner', () => {
  test('banner is visible on first visit (no prior consent)', async ({ page }) => {
    await gotoFreshLanding(page);

    // The CookieConsent component has role="dialog" aria-label="Cookie consent"
    const banner = page.getByRole('dialog', { name: /cookie consent/i });

    await expect(banner).toBeVisible({ timeout: 5000 });

    // Both Accept and Decline buttons should be present
    await expect(banner.getByRole('button', { name: /accept/i })).toBeVisible();
    await expect(banner.getByRole('button', { name: /decline/i })).toBeVisible();
  });

  test('banner contains a link to the privacy policy', async ({ page }) => {
    await gotoFreshLanding(page);

    const banner = page.getByRole('dialog', { name: /cookie consent/i });

    await expect(banner.getByRole('link', { name: /learn more/i })).toHaveAttribute(
      'href',
      '/privacy',
    );
  });

  // ── Accept flow ──────────────────────────────────────────────────────────

  test('clicking Accept hides the banner', async ({ page }) => {
    await gotoFreshLanding(page);

    const banner = page.getByRole('dialog', { name: /cookie consent/i });
    await banner.getByRole('button', { name: /accept/i }).click();

    // Banner should disappear
    await expect(banner).toBeHidden();
  });

  test('clicking Accept sets localStorage to "accepted"', async ({ page }) => {
    await gotoFreshLanding(page);

    await page.getByRole('dialog', { name: /cookie consent/i })
      .getByRole('button', { name: /accept/i })
      .click();

    const value = await page.evaluate(
      (key: string) => localStorage.getItem(key),
      CONSENT_KEY,
    );

    expect(value).toBe('accepted');
  });

  test('banner does NOT reappear after accepting and reloading', async ({ page }) => {
    await gotoFreshLanding(page);

    // Accept
    await page.getByRole('dialog', { name: /cookie consent/i })
      .getByRole('button', { name: /accept/i })
      .click();

    // Reload the page
    await page.reload();

    // Banner should not be visible
    const banner = page.getByRole('dialog', { name: /cookie consent/i });

    await expect(banner).not.toBeVisible({ timeout: 5000 });
  });

  test('banner does NOT reappear on a new page navigation after accepting', async ({ page }) => {
    await gotoFreshLanding(page);

    // Accept on the landing page
    await page.getByRole('dialog', { name: /cookie consent/i })
      .getByRole('button', { name: /accept/i })
      .click();

    // Navigate to a different page (assessment)
    await page.goto('/assessment');

    // Banner should not appear here — the landing page re-renders fresh in Next.js
    // but localStorage persists within the same browser context
    await page.goto('/');

    const banner = page.getByRole('dialog', { name: /cookie consent/i });

    await expect(banner).not.toBeVisible({ timeout: 3000 });
  });

  // ── Decline flow ─────────────────────────────────────────────────────────

  test('clicking Decline hides the banner', async ({ page }) => {
    await gotoFreshLanding(page);

    const banner = page.getByRole('dialog', { name: /cookie consent/i });
    await banner.getByRole('button', { name: /decline/i }).click();

    await expect(banner).toBeHidden();
  });

  test('clicking Decline sets localStorage to "declined"', async ({ page }) => {
    await gotoFreshLanding(page);

    await page.getByRole('dialog', { name: /cookie consent/i })
      .getByRole('button', { name: /decline/i })
      .click();

    const value = await page.evaluate(
      (key: string) => localStorage.getItem(key),
      CONSENT_KEY,
    );

    expect(value).toBe('declined');
  });

  test('banner does NOT reappear after declining and reloading', async ({ page }) => {
    await gotoFreshLanding(page);

    // Decline
    await page.getByRole('dialog', { name: /cookie consent/i })
      .getByRole('button', { name: /decline/i })
      .click();

    // Reload
    await page.reload();

    const banner = page.getByRole('dialog', { name: /cookie consent/i });

    await expect(banner).not.toBeVisible({ timeout: 5000 });
  });

  // ── Isolation: separate browser contexts ─────────────────────────────────

  test('accept in one context does not affect a fresh context', async ({ browser }) => {
    // Context A — accept
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await pageA.goto('/');
    await pageA.evaluate(() => localStorage.clear());
    await pageA.reload();

    await pageA.getByRole('dialog', { name: /cookie consent/i })
      .getByRole('button', { name: /accept/i })
      .click();

    const valueA = await pageA.evaluate(
      (key: string) => localStorage.getItem(key),
      CONSENT_KEY,
    );

    expect(valueA).toBe('accepted');

    await contextA.close();

    // Context B — fresh, no prior consent → banner should show
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await pageB.goto('/');

    const bannerB = pageB.getByRole('dialog', { name: /cookie consent/i });

    await expect(bannerB).toBeVisible({ timeout: 5000 });

    await contextB.close();
  });

  test('decline in a separate browser context persists within that context', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Decline
    await page.getByRole('dialog', { name: /cookie consent/i })
      .getByRole('button', { name: /decline/i })
      .click();

    // Reload within same context — banner should not reappear
    await page.reload();

    const banner = page.getByRole('dialog', { name: /cookie consent/i });

    await expect(banner).not.toBeVisible({ timeout: 5000 });

    const value = await page.evaluate(
      (key: string) => localStorage.getItem(key),
      CONSENT_KEY,
    );

    expect(value).toBe('declined');

    await context.close();
  });

  // ── Edge: banner not shown on non-landing pages (component is only in root page)

  test('cookie consent banner does not appear on the /assessment page', async ({ page }) => {
    // The CookieConsent component is only rendered in src/app/page.tsx (landing).
    // Assessment page does not include it.
    await page.goto('/assessment');

    const banner = page.getByRole('dialog', { name: /cookie consent/i });

    await expect(banner).not.toBeVisible({ timeout: 3000 });
  });
});
